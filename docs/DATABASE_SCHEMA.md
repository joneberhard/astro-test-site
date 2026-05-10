# Database Schema — Cloudflare D1 (SQLite)

> **Audience:** Future Claude Code sessions and the founder.
> **Pair with:** [`MASTER_PLAN.md`](./MASTER_PLAN.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).
> **One D1 database serves all four apps**; tables are namespaced by prefix.

---

## Conventions

- **Primary keys:** `TEXT` UUIDs (use **uuid v7** for sortability), never `INTEGER`.
- **Timestamps:** `TEXT` in ISO-8601 UTC. Default `(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`.
- **Booleans:** `INTEGER` 0/1 with `CHECK (col IN (0,1))`.
- **Soft delete:** `deleted_at TEXT` on every domain table. Indexes and queries
  filter on `WHERE deleted_at IS NULL`. Hard delete only via admin tooling.
- **Multi-tenancy:** every domain table has `org_id TEXT NOT NULL` with a
  foreign key to `organizations.id` and a composite index on `(org_id, ...)`.
- **Foreign keys:** enforced. Every Worker request must run `PRAGMA foreign_keys = ON`.
- **Naming:** `snake_case`. Per-app tables prefixed (`sop_`, `fleet_`, `asset_`, `meal_`).
  Shared tables have no prefix.
- **Migrations:** append-only, numbered files in
  `services/api/migrations/NNNN_description.sql`. Never edit a committed
  migration; write a new one.

---

## 1. Better Auth tables (auto-generated)

Better Auth manages these via `npx @better-auth/cli generate`. Do not write
them by hand; the CLI will produce SQL matching the chosen plugins.

Expected tables:
- `user` — id, email, name, emailVerified, image, createdAt, updatedAt
- `session` — id, userId, token, expiresAt, ipAddress, userAgent
- `account` — id, userId, accountId, providerId, password (for email/password), tokens (for OAuth)
- `verification` — id, identifier, value, expiresAt

**Extension:** our `user_profiles` table (below) adds founder-controlled
columns without modifying Better Auth's `user` table.

---

## 2. Shared tables (all four apps use these)

### 2.1 `user_profiles`
Extensions to the Better Auth `user` table that we control.

```sql
CREATE TABLE user_profiles (
  user_id      TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  timezone     TEXT NOT NULL DEFAULT 'UTC',
  locale       TEXT NOT NULL DEFAULT 'en-US',
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

### 2.2 `organizations`
The multi-user container. Labeled differently per app:
- SOP → "Business"
- Fleet → "Fleet"
- Asset → "Vault"
- Meal → "Household"

```sql
CREATE TABLE organizations (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  -- which apps this org has access to (JSON array of app slugs)
  enabled_apps TEXT NOT NULL DEFAULT '[]',
  owner_user_id TEXT NOT NULL REFERENCES user(id),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at   TEXT
);
CREATE INDEX idx_organizations_owner ON organizations(owner_user_id) WHERE deleted_at IS NULL;
```

### 2.3 `memberships`
A user's role within an organization. A user can belong to many orgs.

```sql
CREATE TABLE memberships (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner','admin','member','viewer')),
  invited_by TEXT REFERENCES user(id),
  joined_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at TEXT,
  UNIQUE (org_id, user_id)
);
CREATE INDEX idx_memberships_user ON memberships(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_memberships_org  ON memberships(org_id)  WHERE deleted_at IS NULL;
```

### 2.4 `invites`
Pending invitations to join an org (before user accepts / signs up).

```sql
CREATE TABLE invites (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin','member','viewer')),
  token       TEXT NOT NULL UNIQUE,
  invited_by  TEXT NOT NULL REFERENCES user(id),
  expires_at  TEXT NOT NULL,
  accepted_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_invites_email ON invites(email) WHERE accepted_at IS NULL;
CREATE INDEX idx_invites_org   ON invites(org_id);
```

### 2.5 `stripe_customers` and `subscriptions`
One Stripe Customer per org. Subscriptions are per (org, app).

```sql
CREATE TABLE stripe_customers (
  org_id              TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT NOT NULL UNIQUE,
  email               TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE subscriptions (
  id                       TEXT PRIMARY KEY,
  org_id                   TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  app                      TEXT NOT NULL CHECK (app IN ('sop','fleet','asset','meal')),
  stripe_subscription_id   TEXT UNIQUE,
  stripe_price_id          TEXT,
  status                   TEXT NOT NULL CHECK (status IN
    ('trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid','paused')),
  current_period_start     TEXT,
  current_period_end       TEXT,
  cancel_at_period_end     INTEGER NOT NULL DEFAULT 0 CHECK (cancel_at_period_end IN (0,1)),
  trial_end                TEXT,
  created_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (org_id, app)
);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, app);
```

### 2.6 `files`
All R2 file metadata. Polymorphic — links to whatever owns the file.

```sql
CREATE TABLE files (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL REFERENCES user(id),
  bucket_key    TEXT NOT NULL UNIQUE,
  content_type  TEXT NOT NULL,
  byte_size     INTEGER NOT NULL,
  sha256        TEXT,
  -- polymorphic association
  entity_type   TEXT,   -- e.g. 'asset_item', 'sop_step_run', 'fleet_service_log', 'meal_recipe'
  entity_id     TEXT,
  scan_status   TEXT NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending','clean','infected','error')),
  metadata_json TEXT,   -- JSON for app-specific extras (OCR results, exif, etc.)
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at    TEXT
);
CREATE INDEX idx_files_org    ON files(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_entity ON files(entity_type, entity_id) WHERE deleted_at IS NULL;
```

### 2.7 `affiliate_links` and `affiliate_clicks`
Used by Fleet (parts) and Meal (ingredients/equipment). Not used by SOP or Asset.

```sql
CREATE TABLE affiliate_links (
  id              TEXT PRIMARY KEY,
  app             TEXT NOT NULL CHECK (app IN ('fleet','meal')),
  network         TEXT NOT NULL CHECK (network IN
    ('amazon','walmart','target','autozone_cj','advance_pepperjam','ebay_epn','thrive','misfits','instacart','other')),
  vendor_label    TEXT NOT NULL,
  item_key        TEXT,            -- our internal SKU/slug (e.g. 'oil-filter-5w30-toyota-tacoma-2021')
  destination_url TEXT NOT NULL,   -- canonical product URL (without our tag)
  commission_pct  REAL,
  active          INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_affiliate_links_item ON affiliate_links(app, item_key) WHERE active = 1;

CREATE TABLE affiliate_clicks (
  id          TEXT PRIMARY KEY,
  link_id     TEXT NOT NULL REFERENCES affiliate_links(id),
  user_id     TEXT REFERENCES user(id),    -- nullable: anonymous clicks allowed
  org_id      TEXT REFERENCES organizations(id),
  app         TEXT NOT NULL,
  context     TEXT,                         -- e.g. 'fleet:service-alert', 'meal:grocery-list'
  referer     TEXT,
  user_agent  TEXT,
  ip_hash     TEXT,                         -- store hashed IP only, not raw
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_clicks_link ON affiliate_clicks(link_id, created_at);
CREATE INDEX idx_clicks_user ON affiliate_clicks(user_id, created_at);
```

### 2.8 `audit_log`
Every privileged action. Cheap insurance and a selling point for SOP customers.

```sql
CREATE TABLE audit_log (
  id          TEXT PRIMARY KEY,
  org_id      TEXT REFERENCES organizations(id),
  actor_user_id TEXT REFERENCES user(id),
  action      TEXT NOT NULL,    -- e.g. 'org.member.invite', 'sop.procedure.publish'
  entity_type TEXT,
  entity_id   TEXT,
  metadata_json TEXT,
  ip_hash     TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_audit_org ON audit_log(org_id, created_at);
```

---

## 3. SOP app tables

### 3.1 `sop_categories`
```sql
CREATE TABLE sop_categories (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color_hex  TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at TEXT,
  UNIQUE (org_id, name)
);
```

### 3.2 `sop_procedures` and `sop_procedure_versions`
Procedures are versioned — editing creates a new version; old runs remain
attached to the version they were started under.

```sql
CREATE TABLE sop_procedures (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id     TEXT REFERENCES sop_categories(id),
  title           TEXT NOT NULL,
  description     TEXT,
  current_version INTEGER NOT NULL DEFAULT 1,
  is_published    INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0,1)),
  created_by      TEXT NOT NULL REFERENCES user(id),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at      TEXT
);
CREATE INDEX idx_sop_procedures_org ON sop_procedures(org_id) WHERE deleted_at IS NULL;

CREATE TABLE sop_procedure_versions (
  id              TEXT PRIMARY KEY,
  procedure_id    TEXT NOT NULL REFERENCES sop_procedures(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  changelog       TEXT,
  published_at    TEXT,
  created_by      TEXT NOT NULL REFERENCES user(id),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (procedure_id, version_number)
);
```

### 3.3 `sop_steps`
Steps belong to a version, not the procedure directly.

```sql
CREATE TABLE sop_steps (
  id                  TEXT PRIMARY KEY,
  version_id          TEXT NOT NULL REFERENCES sop_procedure_versions(id) ON DELETE CASCADE,
  sort_order          INTEGER NOT NULL,
  title               TEXT NOT NULL,
  body_markdown       TEXT,
  -- Proof of Work: forces a live photo upload to mark step complete
  requires_photo      INTEGER NOT NULL DEFAULT 0 CHECK (requires_photo IN (0,1)),
  requires_signature  INTEGER NOT NULL DEFAULT 0 CHECK (requires_signature IN (0,1)),
  estimated_minutes   INTEGER,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_sop_steps_version ON sop_steps(version_id, sort_order);
```

### 3.4 `sop_assignments`
Required reading / required execution by user.

```sql
CREATE TABLE sop_assignments (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  procedure_id    TEXT NOT NULL REFERENCES sop_procedures(id) ON DELETE CASCADE,
  assignee_user_id TEXT NOT NULL REFERENCES user(id),
  due_at          TEXT,
  recurrence      TEXT,    -- 'none','daily','weekly','monthly' (RRULE-ish)
  created_by      TEXT NOT NULL REFERENCES user(id),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at      TEXT
);
CREATE INDEX idx_sop_assignments_assignee ON sop_assignments(assignee_user_id) WHERE deleted_at IS NULL;
```

### 3.5 `sop_runs` and `sop_step_completions`
One run per execution of a procedure by a user.

```sql
CREATE TABLE sop_runs (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  procedure_id  TEXT NOT NULL REFERENCES sop_procedures(id),
  version_id    TEXT NOT NULL REFERENCES sop_procedure_versions(id),
  run_by_user_id TEXT NOT NULL REFERENCES user(id),
  assignment_id TEXT REFERENCES sop_assignments(id),
  started_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  completed_at  TEXT,
  status        TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned'))
);
CREATE INDEX idx_sop_runs_org ON sop_runs(org_id, started_at);
CREATE INDEX idx_sop_runs_user ON sop_runs(run_by_user_id, started_at);

CREATE TABLE sop_step_completions (
  id            TEXT PRIMARY KEY,
  run_id        TEXT NOT NULL REFERENCES sop_runs(id) ON DELETE CASCADE,
  step_id       TEXT NOT NULL REFERENCES sop_steps(id),
  completed_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  proof_file_id TEXT REFERENCES files(id),   -- nullable unless step.requires_photo = 1
  notes         TEXT,
  UNIQUE (run_id, step_id)
);
CREATE INDEX idx_sop_step_completions_run ON sop_step_completions(run_id);
```

---

## 4. Fleet app tables

### 4.1 `fleet_vehicles`
```sql
CREATE TABLE fleet_vehicles (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nickname      TEXT NOT NULL,         -- 'Box Truck', 'Wife Subaru'
  year          INTEGER,
  make          TEXT,
  model         TEXT,
  trim          TEXT,
  vin           TEXT,
  license_plate TEXT,
  vehicle_type  TEXT CHECK (vehicle_type IN ('car','suv','pickup','van','box_truck','semi','motorcycle','trailer','other')),
  fuel_type     TEXT CHECK (fuel_type IN ('gasoline','diesel','hybrid','ev','other')),
  current_odometer INTEGER,            -- miles (or km — store unit on org)
  primary_photo_file_id TEXT REFERENCES files(id),
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at    TEXT
);
CREATE INDEX idx_fleet_vehicles_org ON fleet_vehicles(org_id) WHERE deleted_at IS NULL;
```

### 4.2 `fleet_maintenance_templates`
System-seeded common intervals (oil 5k mi, tire rotation 7.5k mi, etc.).
Per-org rows allow customization.

```sql
CREATE TABLE fleet_maintenance_templates (
  id                TEXT PRIMARY KEY,
  org_id            TEXT REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = system seed
  name              TEXT NOT NULL,
  applies_to_type   TEXT,                -- vehicle_type filter, NULL = all
  interval_miles    INTEGER,
  interval_months   INTEGER,
  notes             TEXT,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_fleet_maintenance_templates_org ON fleet_maintenance_templates(org_id);
```

### 4.3 `fleet_maintenance_schedules`
A template instance bound to a specific vehicle.

```sql
CREATE TABLE fleet_maintenance_schedules (
  id                TEXT PRIMARY KEY,
  org_id            TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vehicle_id        TEXT NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  template_id       TEXT REFERENCES fleet_maintenance_templates(id),
  name              TEXT NOT NULL,
  interval_miles    INTEGER,
  interval_months   INTEGER,
  last_done_miles   INTEGER,
  last_done_at      TEXT,
  next_due_miles    INTEGER,           -- computed
  next_due_at       TEXT,               -- computed
  is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_fleet_schedules_due ON fleet_maintenance_schedules(org_id, next_due_at) WHERE is_active = 1;
```

### 4.4 `fleet_service_logs`
Record of work performed.

```sql
CREATE TABLE fleet_service_logs (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vehicle_id   TEXT NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  schedule_id  TEXT REFERENCES fleet_maintenance_schedules(id),
  performed_at TEXT NOT NULL,
  odometer     INTEGER,
  summary      TEXT NOT NULL,
  performed_by TEXT,         -- shop name or person
  total_cost_cents INTEGER,
  notes        TEXT,
  created_by   TEXT REFERENCES user(id),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at   TEXT
);
CREATE INDEX idx_fleet_service_logs_vehicle ON fleet_service_logs(vehicle_id, performed_at) WHERE deleted_at IS NULL;
```

### 4.5 `fleet_parts` and `fleet_part_orders`
Parts inventory + ordering. Affiliate-link aware.

```sql
CREATE TABLE fleet_parts (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  part_number     TEXT,
  category        TEXT,            -- 'filter','fluid','tire','brake', etc.
  preferred_vendor TEXT,
  affiliate_link_id TEXT REFERENCES affiliate_links(id),
  on_hand_qty     INTEGER NOT NULL DEFAULT 0,
  unit_cost_cents INTEGER,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at      TEXT
);
CREATE INDEX idx_fleet_parts_org ON fleet_parts(org_id) WHERE deleted_at IS NULL;

CREATE TABLE fleet_part_orders (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  part_id      TEXT NOT NULL REFERENCES fleet_parts(id),
  quantity     INTEGER NOT NULL,
  ordered_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  received_at  TEXT,
  vendor       TEXT,
  total_cost_cents INTEGER,
  notes        TEXT
);
```

---

## 5. Asset Tracker app tables

### 5.1 `asset_categories` and `asset_locations`
```sql
CREATE TABLE asset_categories (
  id         TEXT PRIMARY KEY,
  org_id     TEXT REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = system seed
  name       TEXT NOT NULL,
  icon       TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE asset_locations (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,        -- 'Garage', 'Office', 'Storage Unit 12'
  address    TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

### 5.2 `asset_items`
The core entity. Receipts and manuals are `files` rows linked via
`entity_type='asset_item'`, `entity_id=<item.id>`.

```sql
CREATE TABLE asset_items (
  id                  TEXT PRIMARY KEY,
  org_id              TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id         TEXT REFERENCES asset_categories(id),
  location_id         TEXT REFERENCES asset_locations(id),
  name                TEXT NOT NULL,           -- 'Sony A7 IV'
  brand               TEXT,
  model_number        TEXT,
  serial_number       TEXT,
  purchase_date       TEXT,
  purchase_price_cents INTEGER,
  purchased_from      TEXT,
  current_value_cents INTEGER,
  warranty_end_date   TEXT,
  primary_photo_file_id TEXT REFERENCES files(id),
  description         TEXT,
  tags_json           TEXT,                    -- JSON array of free-form tags
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at          TEXT
);
CREATE INDEX idx_asset_items_org      ON asset_items(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_asset_items_serial   ON asset_items(serial_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_asset_items_location ON asset_items(location_id) WHERE deleted_at IS NULL;
```

### 5.3 `asset_valuations`
Optional price-over-time history for insurance documentation.

```sql
CREATE TABLE asset_valuations (
  id           TEXT PRIMARY KEY,
  item_id      TEXT NOT NULL REFERENCES asset_items(id) ON DELETE CASCADE,
  valued_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  value_cents  INTEGER NOT NULL,
  source       TEXT,                          -- 'user_estimate','appraisal','insurance'
  notes        TEXT
);
CREATE INDEX idx_asset_valuations_item ON asset_valuations(item_id, valued_at);
```

### 5.4 Free-tier enforcement
Free tier = 25 items. Enforced application-side by counting non-deleted
`asset_items` per org and checking against the org's subscription status.

---

## 6. Meal planning app tables

### 6.1 `meal_dietary_profiles`
The niche differentiator: profiles for high-protein animal-based,
intermittent fasting / Warrior Diet, etc.

```sql
CREATE TABLE meal_dietary_profiles (
  id              TEXT PRIMARY KEY,
  org_id          TEXT REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = system seed
  name            TEXT NOT NULL,    -- 'High-Protein Animal-Based', 'Warrior Diet', 'IF 16:8'
  description     TEXT,
  protein_target_g INTEGER,
  carb_max_g      INTEGER,
  fat_min_g       INTEGER,
  eating_window_start TEXT,        -- '14:00' (24h)
  eating_window_end   TEXT,        -- '22:00'
  excludes_json   TEXT,             -- JSON array: ['plant_oils','grains',...]
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
```

### 6.2 `meal_recipes`, `meal_recipe_ingredients`, `meal_recipe_steps`
```sql
CREATE TABLE meal_recipes (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  servings        INTEGER NOT NULL DEFAULT 1,
  prep_minutes    INTEGER,
  cook_minutes    INTEGER,
  source_url      TEXT,
  primary_photo_file_id TEXT REFERENCES files(id),
  protein_g       INTEGER,
  carbs_g         INTEGER,
  fat_g           INTEGER,
  calories        INTEGER,
  tags_json       TEXT,
  notes           TEXT,
  created_by      TEXT REFERENCES user(id),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at      TEXT
);
CREATE INDEX idx_meal_recipes_org ON meal_recipes(org_id) WHERE deleted_at IS NULL;

CREATE TABLE meal_recipe_ingredients (
  id                TEXT PRIMARY KEY,
  recipe_id         TEXT NOT NULL REFERENCES meal_recipes(id) ON DELETE CASCADE,
  sort_order        INTEGER NOT NULL,
  quantity          REAL,
  unit              TEXT,            -- 'g','oz','cup','tbsp','count'
  name              TEXT NOT NULL,   -- 'ribeye steak'
  affiliate_link_id TEXT REFERENCES affiliate_links(id),
  notes             TEXT
);
CREATE INDEX idx_meal_recipe_ingredients_recipe ON meal_recipe_ingredients(recipe_id, sort_order);

CREATE TABLE meal_recipe_steps (
  id          TEXT PRIMARY KEY,
  recipe_id   TEXT NOT NULL REFERENCES meal_recipes(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL,
  body        TEXT NOT NULL
);
```

### 6.3 `meal_plans`, `meal_plan_items`
A "plan" is a window of time (typically a week). `meal_plan_items` are the
specific meal slots.

```sql
CREATE TABLE meal_plans (
  id              TEXT PRIMARY KEY,
  org_id          TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  starts_on       TEXT NOT NULL,    -- date
  ends_on         TEXT NOT NULL,
  dietary_profile_id TEXT REFERENCES meal_dietary_profiles(id),
  created_by      TEXT REFERENCES user(id),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at      TEXT
);
CREATE INDEX idx_meal_plans_org ON meal_plans(org_id, starts_on) WHERE deleted_at IS NULL;

CREATE TABLE meal_plan_items (
  id          TEXT PRIMARY KEY,
  plan_id     TEXT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  on_date     TEXT NOT NULL,
  meal_slot   TEXT NOT NULL CHECK (meal_slot IN ('breakfast','lunch','dinner','snack','feast')),
  recipe_id   TEXT REFERENCES meal_recipes(id),
  servings    INTEGER NOT NULL DEFAULT 1,
  notes       TEXT
);
CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(plan_id, on_date);
```

### 6.4 `meal_grocery_lists`, `meal_grocery_items`
Generated from a plan (or freestanding).

```sql
CREATE TABLE meal_grocery_lists (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id     TEXT REFERENCES meal_plans(id) ON DELETE SET NULL,
  name        TEXT,
  generated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  deleted_at  TEXT
);

CREATE TABLE meal_grocery_items (
  id                TEXT PRIMARY KEY,
  list_id           TEXT NOT NULL REFERENCES meal_grocery_lists(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  quantity          REAL,
  unit              TEXT,
  is_checked        INTEGER NOT NULL DEFAULT 0 CHECK (is_checked IN (0,1)),
  affiliate_link_id TEXT REFERENCES affiliate_links(id),
  sort_order        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_meal_grocery_items_list ON meal_grocery_items(list_id, sort_order);
```

---

## 7. Indexing strategy

- Every `org_id` column has a partial index `WHERE deleted_at IS NULL`.
- Foreign keys frequently joined (e.g. `vehicle_id`, `procedure_id`, `recipe_id`,
  `item_id`) have their own indexes.
- Time-series queries (audit log, affiliate clicks, service logs) use composite
  `(org_id, created_at)` or `(entity_id, created_at)` indexes.
- Avoid premature indexing on per-app tables until query patterns are known.

---

## 8. Migration approach

```
services/api/migrations/
├── 0001_better_auth.sql        (generated by @better-auth/cli)
├── 0002_shared_orgs_files.sql  (sections 2.1–2.6)
├── 0003_shared_billing.sql     (subscriptions, stripe_customers)
├── 0004_shared_affiliate.sql   (affiliate_links, affiliate_clicks, audit_log)
├── 0005_sop_core.sql           (sop_*)
├── 0006_fleet_core.sql         (fleet_*)
├── 0007_asset_core.sql         (asset_*)
└── 0008_meal_core.sql          (meal_*)
```

Apply via:
```bash
wrangler d1 migrations apply DB --local   # for dev
wrangler d1 migrations apply DB --remote  # for prod (manual, never CI)
```

**Never edit a committed migration.** If a schema change is needed, write a
new numbered migration.

---

## 9. What's intentionally NOT in this schema (yet)

- **Stripe products/prices catalog** — kept in Stripe, fetched as needed.
- **OAuth provider catalogs** — handled by Better Auth.
- **Push notifications, SMS** — not in MVP.
- **Per-user notification preferences** — add when reminders ship.
- **SOP quizzes / e-signatures** — out of scope for v1 (see MASTER_PLAN.md).
- **Fleet GPS telemetry, fuel tracking** — explicitly out of scope.
- **Asset Tracker barcode/SKU lookup** — v2 feature.
- **Meal recipe import from URL** — v2 stretch.

---

## 10. Reference data to seed at install

- `meal_dietary_profiles`: "High-Protein Animal-Based", "Warrior Diet (20:4)",
  "IF 16:8", "Carnivore Strict" (system rows, org_id NULL).
- `fleet_maintenance_templates`: oil change, tire rotation, brake inspection,
  cabin filter, engine air filter, transmission service, coolant flush,
  spark plugs (system rows, org_id NULL).
- `asset_categories`: Electronics, Tools, Jewelry, Furniture, Cameras, Vehicles,
  Appliances, Outdoor, Collectibles (system rows, org_id NULL).

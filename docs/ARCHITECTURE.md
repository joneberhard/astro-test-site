# Architecture — Shared Foundation for Four Apps

> **Audience:** Future Claude Code sessions and the founder.
> **Pair with:** [`MASTER_PLAN.md`](./MASTER_PLAN.md) and [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).
> **Principle:** **One backend, one auth, one billing.** Apps differ in UI and
> domain tables only.

---

## 1. Monorepo layout

```
astro-test-site/                  ← this repo
├── apps/
│   ├── sop/                      Astro + React app → sop.<domain>
│   ├── fleet/                    Astro + React app → fleet.<domain>
│   ├── asset/                    Astro + React app → asset.<domain>
│   ├── meal/                     Astro + React app → meal.<domain>
│   └── marketing/                Astro landing pages → www.<domain>
├── services/
│   └── api/                      Cloudflare Worker (Hono) — single API for all apps
│       ├── src/
│       │   ├── index.ts          route registration
│       │   ├── auth.ts           Better Auth config
│       │   ├── db.ts             D1 client
│       │   ├── billing.ts        Stripe webhooks + checkout
│       │   ├── files.ts          R2 signed upload URLs
│       │   ├── affiliate.ts      /go/:linkId redirect + click logging
│       │   └── routes/
│       │       ├── sop/
│       │       ├── fleet/
│       │       ├── asset/
│       │       └── meal/
│       └── migrations/           D1 SQL migrations (numbered)
├── packages/
│   ├── shared/                   zod schemas, TS types shared between Workers + apps
│   ├── ui/                       shared React/Astro components (auth widgets, layout)
│   └── api-client/               typed fetch client generated against shared schemas
├── docs/                         ← these planning docs (you are here)
└── pnpm-workspace.yaml, turbo.json, etc.
```

**The existing Eberhard Photo growth-ops site stays on `main`.** The monorepo
restructure lives only on the `claude/app-store-infrastructure-iaO1H` branch
until the founder is ready to switch what the repo's `main` represents.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Astro 5+ with React islands** | Fast static marketing pages; React for interactive app routes. Founder already knows Astro. |
| Styling | **Tailwind CSS** | Fast iteration, consistent design system across apps |
| Backend runtime | **Cloudflare Workers** | Global edge, no cold starts, free tier covers MVP |
| Backend framework | **Hono** | Tiny, typed, great Workers ergonomics |
| Database | **Cloudflare D1** (SQLite) | Free tier 5GB / 5M reads, ships with Workers |
| Auth | **Better Auth** (self-hosted on Workers) | Free, schema you control, email + OAuth |
| Billing | **Stripe** | Subscriptions, customer portal, webhooks |
| File storage | **Cloudflare R2** | Raw uploads (receipts, manuals, proof-of-work originals); free 10 GB + free egress |
| Display images | **Cloudflare Images** ($5/mo) | Photos shown on websites with auto-resize / responsive variants |
| Email | **Postmark** | Already in use across founder's businesses; consolidate here |
| Deployment | **Cloudflare Pages** (frontends) + **Workers** (API) | Free, integrated, zero-config CI from GitHub |
| Monorepo tooling | **pnpm workspaces + Turborepo** | Standard, AI-friendly |
| TypeScript | **strict mode everywhere** | Shared types via `packages/shared` |

---

## 3. Domains and routing

**Recommended:** one parent domain with subdomains so cookies + auth + billing
can be unified.

```
www.<parent>.com         → apps/marketing
sop.<parent>.com         → apps/sop
fleet.<parent>.com       → apps/fleet
asset.<parent>.com       → apps/asset
meal.<parent>.com        → apps/meal
api.<parent>.com         → services/api (Worker)
go.<parent>.com          → services/api affiliate redirect path
```

Auth cookies scoped to `.<parent>.com` allow a user to be logged in across
apps once. Billing is owned by the API, not per app.

---

## 4. Shared services (built once, used by all four apps)

### 4.1 Authentication (`services/api/src/auth.ts`)
- Better Auth handles email/password, magic links, Google OAuth.
- Sessions stored in D1, cookies set on `.<parent>.com`.
- `/api/auth/*` endpoints owned by the Worker; apps proxy or call directly.

### 4.2 Multi-tenant orgs (`organizations` + `memberships`)
- One primitive used by all four apps, labeled differently in each UI:
  SOP "Business", Fleet "Fleet", Asset "Vault", Meal "Household".
- Roles: `owner`, `admin`, `member`, `viewer`.
- Every domain table is scoped by `org_id`.

### 4.3 Billing (`services/api/src/billing.ts`)
- Stripe Customer = one per `organization`.
- Stripe Subscription tied to a `product` per app (SOP, Fleet, Asset, Meal).
- Webhook handler updates `subscriptions` table on `invoice.paid`,
  `customer.subscription.updated`, etc.
- Customer portal link generated on demand.

### 4.4 File storage (`services/api/src/files.ts`)
- All files go to R2 via **signed upload URLs** (frontend uploads directly).
- Metadata row written to `files` table: id, org_id, owner_user_id, bucket key,
  content_type, byte_size, sha256, scan_status, created_at.
- Polymorphic associations via `entity_type` + `entity_id` columns:
  - Asset receipt → entity_type=`asset_item`, entity_id=<uuid>
  - SOP proof photo → entity_type=`sop_step_run`, entity_id=<uuid>
  - Fleet receipt → entity_type=`fleet_service_log`, entity_id=<uuid>
  - Meal recipe photo → entity_type=`meal_recipe`, entity_id=<uuid>

### 4.5 Affiliate redirect (`services/api/src/affiliate.ts`)
- Endpoint: `GET /go/:linkId?ref=<context>`
- Logs `affiliate_clicks` row (user_id nullable, link_id, context, referer, UA).
- 302-redirects to vendor URL with tracking tag appended.
- Used by **Fleet** (parts) and **Meal** (ingredients/kitchen tools).
- Not used by SOP or Asset (subscription-only revenue).

### 4.6 Audit log (`audit_log` table)
- Every privileged action (create org, add member, change role, delete data)
  writes a row. Cheap insurance for SOP customers who care about compliance.

---

## 5. App-specific layers

Each app under `apps/<name>/` is an Astro project with:

- **Marketing pages** rendered as static Astro for SEO.
- **App routes** (`/app/**`) hydrated as React, calling `api.<parent>.com`
  via the typed client in `packages/api-client`.
- **Org switcher** in the global nav (sourced from `/api/me/orgs`).
- **Subscription gate** middleware reading `subscriptions` for the active org.

Per-app concerns kept inside `apps/<name>/`:
- SOP: procedure builder, run player, proof-of-work camera component.
- Fleet: vehicle list, maintenance schedule view, service log form, parts
  affiliate widget.
- Asset: item grid with photo thumbnails, receipt scanner, PDF manual viewer,
  export-to-PDF for insurance.
- Meal: recipe library, weekly plan board, grocery list generator,
  dietary-profile filters.

---

## 6. Environment variables and secrets

Stored in Cloudflare (Workers + Pages) — **never** committed to the repo.

| Secret | Used by | Source |
|---|---|---|
| `BETTER_AUTH_SECRET` | Worker | generated once, rotated yearly |
| `GOOGLE_OAUTH_CLIENT_ID` / `SECRET` | Worker | Google Cloud Console |
| `STRIPE_SECRET_KEY` | Worker | Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | Worker | Stripe webhook config |
| `POSTMARK_SERVER_TOKEN` | Worker | Postmark server-level token (one per Server) |
| `CF_IMAGES_ACCOUNT_HASH` | Frontends | Cloudflare Images delivery URL hash (public) |
| `CF_IMAGES_API_TOKEN` | Worker | for programmatic uploads if needed |
| `R2_BUCKET` (binding) | Worker | wrangler.toml |
| `DB` (D1 binding) | Worker | wrangler.toml |
| `AMAZON_ASSOCIATES_TAG` | Worker (affiliate) | Amazon dashboard |
| `CJ_PUBLISHER_ID` / similar | Worker (affiliate) | each affiliate network |

Local dev uses `.dev.vars` (gitignored) + `wrangler dev`.

---

## 7. Native-app path (future)

When the time comes to ship native apps:

- **Option A — Capacitor:** wrap the existing Astro+React app routes in a
  native shell. Fastest path (~2–4 weeks per app). Same code, same backend.
- **Option B — Expo / React Native:** rebuild the UI in true native React
  Native. Slower (~8–12 weeks per app), better feel, more capable platform APIs.

**Defer this decision until at least one web app has paying customers.**
The shared backend doesn't change either way.

---

## 8. Deployment pipeline

Per-app GitHub Actions or Cloudflare Pages auto-deploy:

1. Push to `main` → Cloudflare Pages builds each `apps/*` and deploys to
   subdomain.
2. Push to `main` → GitHub Action runs `wrangler deploy` for `services/api`.
3. D1 migrations applied via `wrangler d1 migrations apply DB --remote` —
   manually-triggered for safety, not automatic.

`claude/app-store-infrastructure-iaO1H` is the **feature branch** where the
restructure lives until the founder is ready to switch what `main` represents.

---

## 9. Rules for future sessions

When another Claude Code session works on this repo, it should:

1. **Read these three docs first** (`MASTER_PLAN.md`, this file, `DATABASE_SCHEMA.md`).
2. **Never duplicate shared services** (auth, billing, file uploads, affiliate).
   Add per-app routes and tables; reuse everything else.
3. **Every new table must be scoped by `org_id`** and indexed on it.
4. **No app touches Stripe directly** — go through the Worker billing service.
5. **Migrations are append-only** — never edit a checked-in migration; write
   a new one.
6. **Update these docs** when architecture decisions change. They are the
   canonical reference, not chat history.

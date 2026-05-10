# Eberhard Apps — Planning Documents

> Canonical reference for the four-app venture studio: **SOP, Fleet, Asset
> Tracker, Meal Planning**. These docs are intentionally written so any future
> Claude Code session can read them cold and have full context.

## Read in this order

1. **[MASTER_PLAN.md](./MASTER_PLAN.md)** — strategy, why these four apps,
   priority order, MRR math, dogfooding playbook, Growth Operations synergy.
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — monorepo layout, tech stack,
   shared services, deployment, secrets.
3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** — full Cloudflare D1 schema
   for all four apps, naming conventions, migration approach, seed data.
4. **[PRICING.md](./PRICING.md)** — launch pricing per app + rationale and the
   planned SOP price-raise.
5. **[COSTS.md](./COSTS.md)** — every service's free tier, paid tier, and
   when to upgrade what.
6. **[PROVIDERS.md](./PROVIDERS.md)** — email (Postmark) + media (R2 +
   Cloudflare Images) strategy, including how to migrate the existing client
   websites off GitHub-hosted images.

## TL;DR

- **Repo:** `joneberhard/astro-test-site`
- **Feature branch:** `claude/app-store-infrastructure-iaO1H`
- **Main branch:** preserved (Eberhard Photo growth-ops site, unrelated)
- **Stack:** Astro + React + Tailwind / Cloudflare Workers + Hono / D1 / R2 /
  Cloudflare Images / Better Auth / Stripe / Postmark
- **Priority order:** SOP → Fleet → Asset → Meal
- **Strategy:** Web apps now, native later. Dogfood with own businesses first.

## For future Claude Code sessions

When you open a new session on this repo:

```bash
git checkout claude/app-store-infrastructure-iaO1H
git pull origin claude/app-store-infrastructure-iaO1H
cat docs/MASTER_PLAN.md docs/ARCHITECTURE.md docs/DATABASE_SCHEMA.md
```

**Rules:**
- Do not duplicate shared services (auth, billing, files, affiliate).
- Every new table must be scoped by `org_id`.
- Migrations are append-only.
- If you change architectural direction, **update these docs in the same PR**.
  They are the source of truth, not chat history.

## Status

Planning artifacts only — no code scaffolding has been written yet against
this plan. The next session can begin the monorepo restructure on this branch.

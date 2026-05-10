# Master Plan — Four-App Venture Studio

> **Audience:** Future Claude Code sessions and the founder (Jon Eberhard).
> **Status:** Living document. Last update: 2026-05-10.
> **Pair with:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

---

## 1. Vision

A **Venture Studio model** in which an existing Growth Operations agency funds
software development and acts as a lead-generation engine for the products built.
Four web apps sit on **one shared monorepo and one shared backend** (Cloudflare
Workers + D1), so login, billing, multi-user orgs, photo storage, and affiliate
infrastructure are built **once** and reused.

Each app is **dogfooded by the founder's own businesses first** (moving crews,
photography studio, multi-vehicle household) and only sold once it is bulletproof
for internal use. Distribution leans on the founder's influencer/creator network
and the agency's existing SMB pipeline.

Web apps now; native iOS/Android later (Capacitor wrap or Expo rebuild) once
web traction justifies the Apple/Google fees and store overhead.

---

## 2. The Four Apps (priority order)

### #1 — SOP Checklist App ("the Anchor")
- **Concept:** Mobile-first checklist app that converts static SOPs into
  interactive daily routines for deskless/field workers.
- **Market gap:** the "ClickUp/Trainual gap" — small businesses don't want
  enterprise HR software, they just want the moving truck packed correctly.
- **Phase 2 feature:** "Proof of Work" — mandatory live photo uploads on
  designated steps, timestamped and tied to the executing user.
- **Launch pricing:** **$9/mo** per business (raise to $19/mo after testimonials).
  See [`PRICING.md`](./PRICING.md) for rationale.
- **Distribution:** Trojan-Horse for Growth Ops sales calls. "We don't just
  build websites; we build the operational system your crews actually execute."
- **Dogfood:** Chealsy, Miguel, moving crews.
- **Why first:** highest revenue-per-customer, smallest customer count needed,
  already validates against active in-house operations.

### #2 — Micro-Fleet Maintenance App ("the Specialist")
- **Concept:** Maintenance + parts tracker designed for **2–4 vehicles**
  (sedan + heavy-duty diesel + box truck — the mixed real-world fleet that
  enterprise tools ignore).
- **Launch pricing — vehicle-count tiers, log unlimited forever on every tier:**
  - Free: 1 vehicle (full features + affiliate links)
  - Household $4.99/mo: up to 4 vehicles
  - Small Business $14.99/mo: up to 10 + multi-user roles + parts inventory
  - Fleet Pro $29/mo: up to 25 + reports + API
  - **+ affiliate revenue** on parts recommendations triggered by service alerts.
  - Affiliate links are visible to free and paid users alike. See [`PRICING.md`](./PRICING.md).
- **Dogfood:** founder's household + moving business fleet.
- **Why second:** complements SOP (Growth Ops customers already have trucks),
  affiliate revenue stacks on top of subscription.

### #3 — Asset Tracker App ("the Utility Play")
- **Concept:** Digital vault for receipts, serial numbers, purchase prices,
  warranty info, and PDF manuals. Snap a photo, scan a receipt, attach a manual.
- **Market:** Personal asset / home inventory market projected $1.4B+ by 2026.
- **Use cases:** homeowner insurance documentation, tradesperson tool tracking,
  multi-business owner equipment inventory (cameras, warehouse gear).
- **Launch pricing — freemium:**
  - **Free:** 25 items.
  - **Premium $2.99/mo or $24/yr:** unlimited items, multi-user vault sharing,
    PDF export for insurance claims.
- **Distribution:** real estate, organization, and trades influencers.
- **Why third:** lower per-customer revenue but very high virality potential
  via influencer-friendly demo ("I just lost X to a flood, here's how this app
  saved me").

### #4 — Meal Planning & Grocery App ("the Passion Project")
- **Concept:** Recipe saver + shopping list generator **niched aggressively**
  to specialized diets (high-protein animal-based protocols, intermittent
  fasting / Warrior Diet routines).
- **Launch pricing:** **$3.99/mo or $29/yr.**
  - Free tier has **unlimited recipes + meal planner + affiliate links** —
    the upgrade gate is **automation** (AI plan generator, URL recipe import,
    macro tracking, multi-user household, grocery delivery integration), not
    recipe count.
  - Niche the marketing aggressively to specific diet subcultures
    (high-protein animal-based, IF/Warrior, carnivore strict).
  - Future revenue: curated diet packs ($9–19 one-off), coach connect tier,
    sponsored content, white-label for fitness coaches. See [`PRICING.md`](./PRICING.md).
- **Distribution:** organic via influencer network in the target subcultures.
- **Why fourth:** market is saturated overall; only winnable via tight niche.
  Lowest revenue-per-customer; build last when the shared foundation is mature.

---

## 3. The $10K MRR path (with launch pricing)

At launch pricing (SOP $9, Fleet tiered, Asset $2.99, Meal $3.99) plus
affiliate revenue, $10K MRR is reached by a mix of subscriptions across all
four apps plus the SOP price increase after testimonials.

| Step | What | MRR added | Cumulative |
|---|---|---|---|
| A | SOP 50 customers @ $9 | $450 | $450 |
| B | SOP 200 customers @ $9 | $1,350 more | $1,800 |
| C | Fleet: 100 Household $4.99 + 30 SMB $14.99 + 5 Pro $29 + affiliate ~$500 | ~$1,600 | ~$3,400 |
| D | Asset: 500 paid @ $2.99 | $1,495 | ~$4,900 |
| E | Meal: 300 paid @ $3.99 + affiliate ~$300 | ~$1,500 | ~$6,400 |
| F | SOP raise to $19 (new only): 250 grandfathered @ $9 + 100 new @ $19 | $1,900 more | ~$8,300 |
| G | Fleet ramp to 400 Household + 80 SMB + 15 Pro + affiliate ~$2,000 | ~$3,400 more | ~$11,700 |

**Lower per-customer pricing trades concentration risk for slower
compounding.** It's the right trade-off if customer count is your bottleneck;
the wrong trade-off if customer count is easy and revenue is hard.

See [`PRICING.md`](./PRICING.md) for full pricing rationale and the planned
SOP price-raise after testimonials.

---

## 4. Growth Operations synergy

The agency is not a side hustle to abandon — it is the **engine** for the
software business.

- **Funding:** Agency cash flow funds product development without VC dilution.
- **Lead generation:** Every cold call, every CRM (GoHighLevel) setup, every
  website pitch becomes an opportunity to introduce SOP App as part of the
  "operational system" pitch.
- **Pitch reframe:**
  - Before: *"I build websites and set up your CRM."*
  - After: *"I build operational systems. The website is the front-end lead
    capture; the SOP app is the back-end fulfillment guarantee that your field
    crews actually execute the work."*
- **Cross-sell:** SOP → Fleet → Asset Tracker is a natural upsell ladder for
  any SMB customer that uses vehicles or holds valuable tools.

---

## 5. Dogfooding playbook

For each app, the order is:

1. **Build a single-tenant local prototype** the founder uses for one of his
   own businesses for **2–4 weeks minimum**.
2. **Iterate based on real friction** discovered in daily use.
3. **Invite one peer business** (e.g. Miguel's crew) — multi-tenant test.
4. **Open private beta** to 5–10 friendly customers from the Growth Ops pipeline.
5. **Public launch** with pricing and self-serve signup.

**Hard rule:** no public launch until the founder personally relies on the app
for a non-trivial business function.

---

## 6. Sequencing (~12 months)

| Quarter | Milestone |
|---|---|
| Q1 (now) | **Shared foundation** — monorepo, Workers, D1, auth, billing, file uploads, affiliate redirect. SOP MVP in dogfood with internal crews. |
| Q2 | SOP private beta (5 paying Growth Ops customers). Fleet MVP in dogfood with founder's vehicles. |
| Q3 | SOP public launch + 50 customers ($2,450 MRR). Fleet private beta. Asset Tracker scaffolding. |
| Q4 | SOP to 200 customers ($9,800 MRR). Fleet public ($29/mo + affiliate). Asset Tracker private beta. Meal app scaffolding begins. |

The schedule is intentionally **SOP-heavy in the first three quarters**.
Every other app waits its turn.

---

## 7. Strategic principles (the non-negotiables)

1. **One backend, one auth, one billing.** Never fork these per app.
2. **Web-first.** Apple/Google fees + EAS Build + store reviews don't happen
   until a web app has paying users.
3. **Dogfood before sell.** No app gets a price tag until the founder runs his
   own business on it.
4. **Niche over breadth.** Especially for Meal — own a specific diet subculture
   completely before considering expansion.
5. **Affiliate revenue is a bonus, not a foundation.** Apps that depend on
   affiliate alone fail; apps that earn subscription + affiliate compound.
6. **The agency is the moat.** Distribution beats product features in SMB.
   Use Growth Ops as the unfair advantage.

---

## 8. Open questions for the founder

- **Domain strategy:** one parent domain (e.g. `eberhardops.com`) with
  subdomains (`sop.eberhardops.com`, `fleet.eberhardops.com`, etc.) **or**
  one branded domain per app?
- **Billing platform:** Stripe (recommended) or Lemon Squeezy (handles
  international VAT)? Default to Stripe unless the founder has a reason.
- **Org terminology per app:**
  - SOP → "Organization" / "Business"
  - Fleet → "Fleet" or "Garage"
  - Asset → "Vault" or "Household"
  - Meal → "Household"
  - **Recommendation:** keep all as `organizations` in the DB; vary only the
    UI label per app.
- **SOP "Proof of Work" deadline:** ship in v1 or defer to v2? It's a moat.
- **Asset Tracker pricing:** confirm $4.99/mo or $49/yr — the 18% annual
  discount may be too aggressive.

These should be resolved before any production launch, but **do not block**
the shared foundation work in Q1.

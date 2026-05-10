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
- **Pricing:** **$49/mo per business**. 200 customers = **$9,800 MRR**.
- **Distribution:** Trojan-Horse for Growth Ops sales calls. "We don't just
  build websites; we build the operational system your crews actually execute."
- **Dogfood:** Chealsy, Miguel, moving crews.
- **Why first:** highest revenue-per-customer, smallest customer count needed,
  already validates against active in-house operations.

### #2 — Micro-Fleet Maintenance App ("the Specialist")
- **Concept:** Maintenance + parts tracker designed for **2–4 vehicles**
  (sedan + heavy-duty diesel + box truck — the mixed real-world fleet that
  enterprise tools ignore).
- **Pricing:** B2B subscription **+ affiliate revenue** on parts recommendations
  triggered by service alerts.
- **Dogfood:** founder's household + moving business fleet.
- **Why second:** complements SOP (Growth Ops customers already have trucks),
  affiliate revenue stacks on top of subscription.

### #3 — Asset Tracker App ("the Utility Play")
- **Concept:** Digital vault for receipts, serial numbers, purchase prices,
  warranty info, and PDF manuals. Snap a photo, scan a receipt, attach a manual.
- **Market:** Personal asset / home inventory market projected $1.4B+ by 2026.
- **Use cases:** homeowner insurance documentation, tradesperson tool tracking,
  multi-business owner equipment inventory (cameras, warehouse gear).
- **Pricing — freemium:**
  - **Free:** 25 items.
  - **Premium $4.99/mo or $49/yr:** unlimited items, multi-user vault sharing,
    PDF export for insurance claims.
- **Distribution:** real estate, organization, and trades influencers.
- **Why third:** lower per-customer revenue but very high virality potential
  via influencer-friendly demo ("I just lost X to a flood, here's how this app
  saved me").

### #4 — Meal Planning & Grocery App ("the Passion Project")
- **Concept:** Recipe saver + shopping list generator **niched aggressively**
  to specialized diets (high-protein animal-based protocols, intermittent
  fasting / Warrior Diet routines).
- **Pricing:** Consumer **$5–10/mo**, requires 1,000+ users for meaningful MRR.
- **Distribution:** organic via influencer network in the target subcultures.
- **Why fourth:** market is saturated overall; only winnable via tight niche.
  Lowest revenue-per-customer; build last when the shared foundation is mature.

---

## 3. The $10K MRR path

| Step | App | Customers | ARPU | MRR | Cumulative |
|---|---|---|---|---|---|
| A | SOP | 50 | $49 | $2,450 | $2,450 |
| B | SOP | 200 | $49 | $9,800 | $9,800 |
| C | + Fleet | 50 B2B | $29 + affiliate | ~$2,000 | ~$11,800 |
| D | + Asset Tracker | 500 paid | $4.99 | $2,495 | ~$14,300 |
| E | + Meal | 300 paid | $7 | $2,100 | ~$16,400 |

**SOP alone is sufficient to hit the $10K MRR goal.** Everything else is upside
and customer-lifetime-value extension across the four-product ecosystem.

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

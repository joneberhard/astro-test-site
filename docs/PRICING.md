# Pricing — Launch Targets and Rationale

> **Audience:** Future Claude Code sessions and the founder.
> **Status:** Starting point. Validate with real customers and adjust.
> **Pair with:** [`MASTER_PLAN.md`](./MASTER_PLAN.md), [`COSTS.md`](./COSTS.md).

---

## Guiding principle

**Price for customer acquisition first; raise later once proven.** The
founder's stated goal is to get customers — not to extract maximum revenue
from a small base. Low entry pricing builds the ecosystem; a price increase
to existing customers is much harder than to new ones.

That said, **don't price below the floor of "real software"** ($2.99–4.99 is
the consumer floor; below that signals "freemium toy"). And SOP, as B2B,
needs to clear the "I expect a real tool" threshold (~$9 minimum).

---

## Launch pricing (per app)

| App | Free tier | Paid tier (monthly) | Paid tier (annual) | Audience |
|---|---|---|---|---|
| **SOP Checklist** | 1 user, up to 5 procedures | **$9/mo** per business | **$89/yr** (~$7.42/mo) | Small businesses (5–50 staff) |
| **Fleet Maintenance** | 1 vehicle, **unlimited log forever**, all features, affiliate links | tiered by vehicle count — see below | annual ~17% discount | Households + DIYers + small biz |
| **Asset Tracker** | 100 items, full features, affiliate links | **$2.99/mo** | **$24/yr** (=$2/mo) | Homeowners, tradespeople, multi-business owners |
| **Meal Planning** | unlimited recipes + planner, affiliate links, 1 user, 1 dietary profile | **$3.99/mo** | **$29/yr** (~$2.42/mo) | High-protein, animal-based, IF/Warrior diet niches |

### Fleet tier ladder (vehicle count + role-based access)

| Tier | Price | Vehicles | Notes |
|---|---|---|---|
| **Free** | $0 | 1 | Unlimited maintenance log, all features, affiliate links |
| **Household** | **$4.99/mo** ($39/yr) | up to 4 | Same features, more vehicles |
| **Small Business** | **$14.99/mo** ($129/yr) | up to 10 | + multi-user roles, parts inventory, priority email |
| **Fleet Pro** | **$29/mo** ($249/yr) | up to 25 | + reports, CSV export, API access |
| **Custom** | contact sales | 25+ | rare, but worth having for credibility |

**Hard rule:** **the maintenance log is unlimited forever on every tier.** The
log is the core value of the app — capping it would gut the product.

### Annual discount strategy

- All annual prices represent ~17–33% off monthly rates.
- Why: annual subscribers churn ~3× less, so the discount pays for itself
  via increased customer lifetime value.
- All plans default to **monthly** at signup; annual is a checkbox upsell.

---

## Rationale per app

### SOP — $9/mo, $89/yr

**Why this number:**
- Above $5 (signals "real B2B software," not a side project).
- Well below Trainual ($89/mo), Process Street ($25/mo per user),
  Connecteam ($39+/mo), and Trainual's old $99 starter tier.
- An owner with a 5-person crew sees "$9/mo to make sure my team actually
  follows our procedures" as an obvious yes.
- Stripe takes ~$0.56 on each charge (6.2%). Net ~$8.44/customer/month.

**The plan:** **raise to $19/mo after 3 paying-customer testimonials.** This
is the most underpriced of the four; SOP customers will not flinch at $19
once they're using it daily.

**MRR math at $9:**
- 50 customers = $450 MRR
- 200 customers = $1,800 MRR
- 1,100 customers = $9,900 MRR

**MRR math after raising to $19:**
- 200 existing @ $9 + 300 new @ $19 = $1,800 + $5,700 = $7,500 MRR
- 200 existing @ $9 + 500 new @ $19 = $1,800 + $9,500 = $11,300 MRR

### Fleet — tiered by vehicle count (Household $4.99 / SMB $14.99 / Pro $29)

**Why this structure:**
- The maintenance log is the product. Capping it (by time or entries) makes
  the app useless. So the gate has to be vehicle count, not log depth.
- One free vehicle gets every feature. Affiliate revenue from that free user
  funds their hosting + nets profit.
- Each tier has a clear "I outgrew the last one" trigger:
  - bought a second vehicle? → $4.99
  - hired a tech who needs their own login? → $14.99
  - have 11+ vehicles? → $29
- Fleetio and Simply Fleet charge per vehicle; our flat tiers are easier to
  understand and friendlier for the 2-vehicle household.

**MRR math (mixed):**
- 200 free + 100 Household ($499) + 30 SMB ($450) + 5 Pro ($145) = $1,094 MRR
  + affiliate ~$300–800 = **$1,400–1,900 MRR**
- 1,000 free + 400 Household ($1,996) + 80 SMB ($1,199) + 15 Pro ($435) =
  $3,630 + affiliate $1,500–3,000 = **$5,000–6,600 MRR**

**The free tier is intentionally generous.** We monetize via:
1. Vehicle-count upgrades (subscription)
2. Affiliate clicks from every user (free + paid)
3. Eventual upsell to SOP / Asset / Meal across the ecosystem

### Asset Tracker — $2.99/mo, $24/yr

**Free tier (generous on purpose):**
- **100 items** (raised from 25 — being too stingy hurts signups)
- Full features
- Affiliate links visible

**Premium $2.99/mo unlocks (multiple gates, not just count):**
- **Unlimited items** beyond 100
- **Multi-user vault sharing** (spouse, family, business partner)
- **PDF export** with photos for insurance claims
- **CSV import / export** for bulk management and migration
- **OCR receipt scanning** (snap a receipt, auto-fill purchase price + date)
- **Warranty tracking with email reminders** (warranty expires in 30 days)
- **Loan tracking** ("Mike borrowed my chainsaw, due back Friday")
- **Bulk import from spreadsheet** (one-time migration from existing inventory)
- **Custom collections / tags** beyond default categories
- **Priority email support**

**Pitch:** *"Free is your personal inventory. Premium turns it into your
insurance vault, family asset register, and tool-loan tracker."*

**Why this structure:**
- 100 items is enough that casual users get real value before being asked
  to pay (single-room renters, light tradespeople).
- Each premium feature targets a different user motivation:
  - Multi-user → families and partners
  - PDF export → insurance use case
  - CSV → power users migrating from spreadsheets
  - OCR → "save me time" upgrade
  - Warranty + loan tracking → ongoing engagement
- Multiple gates means multiple reasons to upgrade — better than betting
  on a single trigger.
- Cheaper than Sortly Personal ($24/mo) and Encircle (B2B pricing).
- Stripe takes ~$0.39 (13%) — proportionally the worst of the four. Push
  the **annual plan hard** ($24/yr = $2/mo effective, much better margins).

**MRR math at $2.99:**
- 1,000 free + 200 paid = $598 MRR
- 5,000 free + 800 paid = $2,392 MRR
- 20,000 free + 2,500 paid = $7,475 MRR (~12.5% conversion)

### Meal — $3.99/mo, $29/yr

**Free tier (no caps on the basics):**
- Unlimited recipes (no "5 saved" cap — that would torpedo signups)
- Manual meal planning + basic grocery list
- 1 user, 1 dietary profile
- Affiliate links throughout (ingredients, kitchen gear)

**Premium $3.99/mo unlocks automation, not access:**
- **AI meal-plan generator** — set goals (calories, macros, foods to avoid),
  get a full week of meals
- **Recipe import from any URL** — paste, auto-extract ingredients/steps
- **Macro tracking + analysis** — auto per recipe and per day
- **Multiple dietary profiles** — track different family members'
  diets simultaneously
- **Multi-user household** — shared plans + grocery lists
- **Grocery delivery integration** — 1-click cart pre-fill (Instacart, Walmart)
- **PDF / print export** of meal plans
- **AI ingredient swaps** ("replace canola with tallow throughout")

**Pitch:** *"Free is a recipe + planner notebook. Premium is your AI meal-prep
coach that does the thinking for you."*

**Why this structure:**
- Restricting recipe count is the wrong gate — recipe collections are the
  baseline expectation, not a premium feature.
- Time-saving automation is a real upgrade trigger because users feel the
  pain weekly (planning, shopping list building, macro math).
- Niching aggressively to specialized diets (high-protein animal-based,
  IF/Warrior) justifies premium pricing among those audiences.

**MRR math at $3.99:**
- 5,000 free + 300 paid = $1,197 MRR + affiliate ~$300–800
- 20,000 free + 1,000 paid = $3,990 MRR + affiliate ~$1,500–3,000

### Planned additional revenue streams for Meal

The founder confirmed all of these as **planned**, not "maybe someday."
Sequence them after the core $3.99 subscription is shipping:

1. **Curated diet packs (one-time purchases)** — *priority post-launch.*
   Examples: "30-Day Carnivore Reset" ($19), "Warrior Diet Starter" ($9),
   "High-Protein Animal-Based 8-Week" ($29). Pre-built meal plans + grocery
   lists. Sells exceptionally well to influencer audiences who already
   consume bundled content. **Founder identified this as the most exciting
   revenue stream; partner with influencers to co-create packs and revenue-share.**
2. **Influencer partner program** — *priority post-launch.* Creators
   publish their own meal plans + curated packs on the platform; revenue
   split (e.g. 70/30 to creator). Built-in distribution; aligns with the
   founder's existing influencer network strategy.
3. **White-label for fitness coaches / nutritionists** — *founder confirmed
   "cool too."* $49/mo. Coach gets a branded portal where they assign meal
   plans to clients. Different product surface, same backend. Targets
   crossfit boxes, personal trainers, sports dietitians.
4. **Coach Connect tier** ($9.99/mo on top of Premium) — nutritionist Q&A.
   High-touch, low-scale, high-margin. Activate when a willing coach partner
   emerges.
5. **Sponsored content / brand partnerships** — paid sponsorships from
   animal-based food brands (Force of Nature, US Wellness Meats, Belcampo,
   Pluck Organ Meats). Affiliate codes embedded in recipes/packs.
6. **Bundle pricing** (cross-app) — once 2+ apps have customer overlap,
   offer a $9.99/mo or $79/yr "Eberhard Apps All Access" bundle.

**Sequencing principle:** ship core subscription → add packs (highest-margin,
fastest to build) → bring in 1–2 influencer partners → launch white-label
when there's a coach asking for it.

All of these stack on the $3.99 base subscription. None of them get built
until the core app has paying customers, but all are confirmed planned.

---

## Combined MRR scenarios

### Scenario A — "Realistic Year 1"
- SOP: 50 customers @ $9 = $450
- Fleet: 100 customers @ $4.99 = $499
- Asset: 200 customers @ $2.99 = $598
- Meal: 100 customers @ $3.99 = $399
- **Total: $1,946 MRR** (~$23k ARR)

### Scenario B — "Realistic Year 2"
- SOP: 200 customers @ $9 = $1,800
- Fleet: 400 customers @ $4.99 = $1,996
- Asset: 700 customers @ $2.99 = $2,093
- Meal: 400 customers @ $3.99 = $1,596
- **Total: $7,485 MRR** (~$90k ARR)

### Scenario C — "$10K MRR" (mixed tier)
- SOP: 250 @ $9 + 100 @ $19 = $2,250 + $1,900 = $4,150
- Fleet: 600 @ $4.99 = $2,994
- Asset: 800 @ $2.99 = $2,392
- Meal: 200 @ $3.99 = $798
- **Total: $10,334 MRR**

Hitting Scenario C requires **roughly 2,000 paying customers across the four
apps**. At an industry-typical 3% free-to-paid conversion, that's
~67,000 free users. Achievable on the founder's influencer network across
several years.

---

## Pricing experiments to run later

Don't change pricing in v1. After 6 months of real data, consider:

1. **Raise SOP** to $19/mo for new signups (grandfather existing $9 customers
   for goodwill).
2. **Add Fleet small-business tier** at $14.99/mo if data shows users want
   more than 4 vehicles.
3. **Add Asset Tracker premium tier** at $7.99/mo with multi-vault sharing
   and unlimited PDF export.
4. **Add Meal "Coach" tier** at $9.99/mo with personalized macros and
   shopping-list dietitian review (high-touch, low scale, high margin).
5. **Consider an app bundle**: $9.99/mo or $79/yr for all four apps.
   Increases stickiness across the ecosystem.

**Rule:** never raise prices on existing customers without 90 days notice
and an offer to lock in the old rate annually.

---

## Free tier philosophy

Every app gets a free tier for these reasons:
- Sign-up friction is everything. Free → paid funnel converts; paid wall
  doesn't.
- Free users are case studies, testimonials, and word-of-mouth.
- A free user who refers two paying users has paid you back already.

But the free tier must have **a clear ceiling that real users hit**:

| App | Free ceiling | What trips paid conversion |
|---|---|---|
| SOP | 5 procedures, 1 user | 5 is too few for a real business; multi-user is the killer feature |
| Fleet | 1 vehicle (full features, full log, affiliate links) | Buying / leasing a 2nd vehicle |
| Asset | 100 items (full features, affiliate links) | Median home has well over 100 valuable items; multi-user/PDF/CSV/OCR/warranty/loan tracking are independent upgrade triggers beyond count |
| Meal | unlimited recipes + planner, 1 user, 1 dietary profile, no AI | Wanting AI meal generation, recipe URL import, multi-user household, macro tracking |

**Affiliate links are visible on every tier of every app, free or paid.**
Restricting affiliate links would only hurt our own click-through revenue.

---

## Decisions captured

- **SOP:** $9/mo per business, raise to $19 after 3 testimonials.
- **Fleet:** vehicle-count tiers (free 1 / $4.99 for 4 / $14.99 for 10 /
  $29 for 25). **Maintenance log is unlimited forever on every tier.**
- **Asset:** $2.99/mo unlocks unlimited items + multi-user vault sharing +
  PDF/CSV export + OCR + warranty/loan tracking. **Free tier raised to 100
  items** (up from 25 — being too stingy hurts signups).
- **Meal:** $3.99/mo unlocks AI / multi-user / import — **NOT** a recipe
  count limit. Free tier has unlimited recipes.
- **Affiliate links visible on every tier of every app.** They are revenue,
  not a feature to gate.
- All apps offer monthly + annual with annual ~17–33% discount.
- **Meal future revenue confirmed planned (not deferred):** curated diet
  packs (priority), influencer partner program (priority), white-label for
  coaches, Coach Connect tier, sponsored content, cross-app bundle.
- Bundle pricing held until at least one app has 100 paying customers.

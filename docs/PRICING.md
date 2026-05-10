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
| **Asset Tracker** | 25 items | **$2.99/mo** | **$24/yr** (=$2/mo) | Homeowners, tradespeople, multi-business owners |
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

**Why this number:**
- Cheaper than Sortly Personal ($24/mo) and Encircle (B2B pricing).
- Volume play: this app's appeal is broad. Influencer-driven (real estate,
  home organization, trades).
- Free tier of 25 items is the conversion gate. Most homeowners have
  far more than 25 high-value items.
- Stripe takes ~$0.39 (13%) — proportionally the worst of the four. Push
  the **annual plan hard** ($24/yr = $2/mo effective, much better margins).

**MRR math at $2.99:**
- 500 paid = $1,495 MRR
- 1,500 paid = $4,485 MRR

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

### Additional revenue streams to consider for Meal (deferred)

The founder explicitly flagged interest in additional upcharges that aren't
"restrict recipes." Candidates worth piloting after launch:

1. **One-off curated packs** — "30-Day Carnivore Reset" ($19),
   "Warrior Diet Starter" ($9). Pre-built meal plan + grocery list. Sells
   well to influencer audiences who consume bundled content.
2. **Coach Connect tier** ($9.99/mo on top of Premium) — nutritionist Q&A.
   High-touch, low-scale, high-margin. Defer unless a coach partner emerges.
3. **Sponsored content** — paid sponsorships from animal-based food brands
   (Force of Nature, US Wellness Meats, Belcampo). Affiliate codes built in.
4. **Influencer partner program** — creators publish their own meal plans on
   the platform; revenue split (e.g. 70/30 to creator). Built-in distribution.
5. **White-label for fitness coaches / nutritionists** — $49/mo, coach gets
   a branded portal where they assign meal plans to clients. Different
   product, but same backend.

These all stack on the $3.99 base subscription. None of them get built until
the core app has paying customers.

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
| Asset | 25 items (full features, affiliate links) | Median home has 50–150 high-value items |
| Meal | unlimited recipes + planner, 1 user, 1 dietary profile, no AI | Wanting AI meal generation, recipe URL import, multi-user household, macro tracking |

**Affiliate links are visible on every tier of every app, free or paid.**
Restricting affiliate links would only hurt our own click-through revenue.

---

## Decisions captured

- **SOP:** $9/mo per business, raise to $19 after 3 testimonials.
- **Fleet:** vehicle-count tiers (free 1 / $4.99 for 4 / $14.99 for 10 /
  $29 for 25). **Maintenance log is unlimited forever on every tier.**
- **Asset:** $2.99/mo for unlimited items above the 25-item free cap.
- **Meal:** $3.99/mo unlocks AI / multi-user / import — **NOT** a recipe
  count limit. Free tier has unlimited recipes.
- **Affiliate links visible on every tier of every app.** They are revenue,
  not a feature to gate.
- All apps offer monthly + annual with annual ~17–33% discount.
- Bundle pricing deferred until at least one app has 100 paying customers.
- Meal additional revenue ideas (packs, coach connect, sponsored content,
  influencer revenue split, white-label) deferred to post-launch.

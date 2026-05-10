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
| **Fleet Maintenance** | 1 vehicle, last 30 days of logs | **$4.99/mo** | **$39/yr** (~$3.25/mo) | Households + DIYers + 2–4 vehicle small biz |
| **Asset Tracker** | 25 items | **$2.99/mo** | **$24/yr** (=$2/mo) | Homeowners, tradespeople, multi-business owners |
| **Meal Planning** | 5 saved recipes, no plan generator | **$3.99/mo** | **$29/yr** (~$2.42/mo) | High-protein, animal-based, IF/Warrior diet niches |

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

### Fleet — $4.99/mo, $39/yr

**Why this number:**
- The classic consumer-prosumer SaaS sweet spot.
- Affiliate revenue stacks on top — every "you need a new oil filter"
  recommendation is a click that may convert.
- Direct competitors (Fleetio, Simply Fleet) start at ~$3–4/vehicle/month
  but charge per vehicle. Our flat $4.99 for 1–4 vehicles is competitive
  for the household segment.
- A small-business tier ($14.99/mo, up to 10 vehicles) added later if demand.

**MRR math at $4.99:**
- 200 customers = $998 MRR (plus affiliate ~$200–500)
- 500 customers = $2,495 MRR (plus affiliate)

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

**Why this number:**
- Right beneath Paprika ($5/mo) and AnyList ($12/yr — but that's their *only*
  tier).
- Niching to specialized diets (high-protein animal-based, IF/Warrior)
  justifies a premium over generic recipe apps. Don't go below $3.99.
- Influencer distribution in those niches: the audience already pays for
  niche content (carnivore protocols, paid newsletters, etc.).

**MRR math at $3.99:**
- 300 paid = $1,197 MRR
- 800 paid = $3,192 MRR

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

| App | Free ceiling | Why this trips paid conversion |
|---|---|---|
| SOP | 5 procedures, 1 user | 5 is too few for a real business; multi-user is the killer feature |
| Fleet | 1 vehicle, 30 days log history | Most users have 2+ vehicles; history is what they came for |
| Asset | 25 items | Median home has 50–150 high-value items |
| Meal | 5 recipes, no plan generator | Meal planning is the value; recipe library alone is a notebook |

---

## Decisions captured

- Launch pricing committed: **SOP $9, Fleet $4.99, Asset $2.99, Meal $3.99**.
- All apps offer monthly + annual, with annual ~17–33% discount.
- All apps have a free tier with a clear ceiling.
- SOP earmarked for a $9 → $19 raise after testimonials.
- Bundle pricing deferred until at least one app has 100 paying customers.

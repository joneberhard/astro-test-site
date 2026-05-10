# Costs — All Services and Scaling Thresholds

> **Audience:** Future Claude Code sessions and the founder.
> **Pair with:** [`PROVIDERS.md`](./PROVIDERS.md), [`MASTER_PLAN.md`](./MASTER_PLAN.md).
> **Pricing valid as of 2026-05; verify before paying.**

---

## TL;DR — Realistic monthly burn

| Stage | Monthly cost | What you have |
|---|---|---|
| **Local dev only** | **$0** | Code on your laptop, no domains |
| **One live web app, no users** | **~$2–7/mo** | Domain + Postmark transactional plan if needed |
| **All four apps live, low traffic** | **~$22–40/mo** | Domains + Postmark + Cloudflare Images + maybe Workers Paid |
| **Scaled (paying customers)** | **~$50–100/mo** | + Workers Paid, more email volume, more storage |
| **Native apps added later** | **+$20–120/mo** | Apple $99/yr, Google $25 once, EAS Build |

You stay under $50/mo for a long time. The big cost step is when you graduate from Cloudflare's free Workers plan — and that only happens once you have real traffic.

---

## 1. Cloudflare — the foundation (mostly free for years)

### Pages (frontends — Astro apps)
- **Free:** unlimited bandwidth, 500 builds/month, 1 build at a time.
- **Pro $20/mo:** 5,000 builds/month, 5 concurrent builds.
- **Reality:** stay on Free indefinitely. If you push more than 16 deploys/day across all apps you'll pay $20/mo, but most weeks you won't.

### Workers (the backend API)
- **Free:** 100,000 requests/day, 10ms CPU per request, 1 MB script size.
- **Paid $5/mo:** 10 million requests/month, 30s CPU per request, 10 MB script size.
- **When to upgrade:** when any one app exceeds ~100k API calls/day, or when a Worker route needs >10ms CPU (image processing, complex queries, etc.).
- **Note:** the $5/mo Workers Paid plan also unlocks D1's larger-tier limits — it's more than just "more requests."

### D1 (database)
- **Free** (with Workers Free): 5 GB storage, 5 million reads/day, 100,000 writes/day, 25 databases per account.
- **Workers Paid included:** 5 GB storage, 25 billion reads/month, 50 million writes/month, 50 GB total storage across DBs.
- **Reality:** the free tier serves you well into hundreds of paying users. Storage is rarely the bottleneck — write volume hits limits first if you do high-frequency event logging.

### R2 (file storage — user uploads, receipts, manuals, photos)
- **Free forever** (not a trial):
  - **10 GB stored**
  - **1 million Class A operations/month** (writes, lists, deletes)
  - **10 million Class B operations/month** (reads, gets, head)
  - **Unlimited egress, free, forever** ← this is R2's signature feature
- **Beyond free:**
  - Storage: **$0.015 per GB-month**
  - Class A ops: **$4.50 per million**
  - Class B ops: **$0.36 per million**
- **Reality:** 10 GB is roughly 5,000–10,000 photos depending on size. You will not pay anything for R2 for years at small scale. Even if you blow past 10 GB, 100 GB costs ~$1.50/month.

### Cloudflare Images (display-optimized — best for client websites with lots of photography)
- **$5/mo base:**
  - 100,000 images stored
  - 100,000 images delivered
  - Automatic resizing/optimization, multiple variants from one upload, responsive `srcset`
- **Beyond:** $5 per additional 100k stored, $1 per 100k delivered.
- **When to use:** any frontend that displays photos to website visitors with multiple sizes (thumbnails, lightbox, hero images). **All Eberhard client websites should use this.**
- **When NOT to use:** raw asset storage where the user needs to download the original (PDF manuals, receipts) — use R2.

### Cloudflare Stream (video — only if needed)
- **$5 per 1,000 minutes stored** per month.
- **$1 per 1,000 minutes delivered**.
- **When to use:** any time you want to embed video on a website with
  adaptive-bitrate streaming, automatic transcoding, thumbnails, and an
  embed player. Examples: app demo videos, course content, client
  testimonials.
- **When NOT to use:** as a personal video backup — way too expensive vs
  Google Drive / iCloud / Backblaze for that. Stream is a video CDN +
  encoder + player; it's not bulk storage.

### Cloudflare Web Analytics
- **Free:** server-side analytics, no cookies, no GDPR banner needed. Use it.

### Cloudflare Workers Logs / Tail
- **Free** for low volume (Workers Free includes basic tail). For production-grade log retention add Workers Logs ($5/mo for 5M events).

---

## 2. Email — Postmark (recommended for unified ecosystem)

### Postmark — current setup
- **$20/mo "10k" plan:** 10,000 emails/month transactional + broadcast
  (founder's current plan).
- **$45/mo "50k" plan:** 50,000 emails/month if needed later.
- **Overage:** $1.25 per additional 1,000 emails.
- **Why use it:** great deliverability, clean API, separate transactional
  and broadcast streams. Already wired up to founder's businesses with SPF,
  DKIM, and verified sender reputation.

### Resend — not in use
- Documented in `PROVIDERS.md` as a future fallback, but **not used**.
  Standardizing on Postmark is the call.

---

## 3. Auth — Better Auth

- **Free, self-hosted on Workers.** No SaaS fee.
- The cost is your Workers requests for `/api/auth/*`, which are tiny.
- Alternative: **Clerk** at $25/mo (10k MAU free tier exists, but premium features kick in fast). Skip Clerk unless you specifically want their drop-in UI. Better Auth gives you full control of your DB schema.

---

## 4. Billing — Stripe

- **No monthly fee.** Pay only when you charge customers.
- **US:** 2.9% + $0.30 per successful charge.
- **International:** 3.4% + $0.30 (or higher in some markets).
- **Reality:** on a $4.99 charge Stripe takes ~$0.44 (~9%). On a $19 charge it takes ~$0.85 (~4.5%). **Lower-priced subscriptions sting more proportionally** — another argument against under-pricing.

Alternative: **Lemon Squeezy** (Merchant of Record, handles international VAT). Higher fees (~5% + $0.50) but they file your taxes globally. Worth considering if you sell heavily outside the US.

---

## 5. Domain registration and DNS

- **Domain:** ~$10–15/year per domain at any registrar (Cloudflare Registrar is at cost — usually cheapest).
- **DNS:** **free** on Cloudflare regardless of where you registered.
- **Strategy options:**
  - One parent domain (e.g. `eberhardops.com`) with subdomains for each app — **$12/yr total**.
  - One brand per app — **$48/yr total** for four domains.

---

## 6. Native apps (when the time comes)

- **Apple Developer Program:** $99/year (mandatory for App Store).
- **Google Play Developer:** $25 one-time fee.
- **EAS Build (Expo):**
  - Free tier: 30 builds/month, slow queue.
  - Production $19/mo: priority queue, more builds.
  - Enterprise $99/mo: max throughput.
- **Capacitor build:** can be done locally (or in CI) for free if you have a Mac. Without a Mac, EAS or similar service required for iOS.

**Don't pay any of this until at least one web app has 50+ paying customers.**

---

## 7. The "if it goes viral overnight" cost cliff

A surprise spike in usage on the **free tier** triggers throttling, not surprise bills. Cloudflare Workers Free **stops serving requests** rather than billing you (predictable, no horror stories).

To avoid throttling under load, add a credit card to Cloudflare and upgrade Workers to Paid ($5/mo) **before** going public. The $5 buys 10M requests/month; you'd need *significant* virality to exceed that.

---

## 8. Cost-per-customer math (rough)

At the proposed pricing, ignoring affiliate revenue:

| App | Price | Stripe fee | Net per customer | Hosting cost per 100 customers (estimate) |
|---|---|---|---|---|
| SOP | $9/mo | ~$0.56 | ~$8.44 | <$5/mo |
| Fleet | $4.99/mo | ~$0.44 | ~$4.55 | <$3/mo |
| Asset | $2.99/mo | ~$0.39 | ~$2.60 | <$3/mo |
| Meal | $3.99/mo | ~$0.42 | ~$3.57 | <$3/mo |

**Hosting cost per customer is essentially noise** until you're at thousands of users. The expensive line items long-term are:
- **Email** (Postmark scales linearly with reminder volume)
- **Cloudflare Images** for any app that shows lots of user-uploaded photos
- **Stripe fees** as a percentage of revenue

---

## 9. R2 vs Google Drive (don't try to consolidate)

A natural question: if R2 is $15/TB/month with free egress, can I drop
Google Drive and put everything personal there?

**Mathematically yes; practically no.** R2 has no native browsing UI,
no mobile apps, no albums, no sharing flows. To use it as personal storage
you'd live inside Cyberduck or Rclone — not a workflow that survives a
spouse uploading vacation photos.

| Service | 2 TB/mo | UI | Mobile apps | Sharing |
|---|---|---|---|---|
| Google One 2TB | $9.99 | yes | yes | yes |
| iCloud+ 2TB | $9.99 | yes | yes | yes |
| Backblaze B2 2TB | $12 | basic | no | basic |
| **R2 2TB** | **$30** | minimal | no | API only |

**Decision:** keep Google Drive for personal storage; R2 is for app-side
file storage only.

---

## 10. Decisions captured

- **Email:** Postmark across all apps and client sites (already at $20/mo).
- **App user uploads (raw bytes):** R2 (free up to 10 GB).
- **Photos displayed on websites:** Cloudflare Images ($5/mo).
- **Embedded video on websites:** Cloudflare Stream (only when needed).
- **Personal photo/video storage:** Google Drive (don't consolidate to R2).
- **Auth:** Better Auth, self-hosted on Workers (free).
- **Billing:** Stripe.
- **Domain strategy:** TBD — recommend single parent domain with subdomains.

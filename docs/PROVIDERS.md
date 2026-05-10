# Providers — Email & Media Strategy

> **Audience:** Future Claude Code sessions and the founder.
> **Purpose:** Practical guidance on which vendor to use for what, and how to
> wire it up. Pair with [`COSTS.md`](./COSTS.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. Email — Postmark is primary; Resend is a fallback

### Decision: Postmark across all properties

The founder already has Postmark set up with verified domains, SPF, DKIM,
and a built sender reputation for their photography business and client work.
**Migrating away from a working email provider is rarely worth it.**

Use Postmark for:
- Eberhard Photo client communications
- Neighborhood Hauling (and other client-built websites with contact forms)
- All four apps (SOP, Fleet, Asset, Meal) — verification emails, password
  resets, invitations, reminders, billing receipts

### Postmark setup pattern for the apps

In Postmark, create **separate Message Streams** for each concern:
- `<app>-transactional` — verification, password reset, billing
- `<app>-broadcast` — marketing announcements, weekly digest
  (only if/when needed)

Why: a marketing-list problem (spam complaints) won't drag down the
deliverability of password-reset emails, which is the only thing customers
truly never miss.

### Worker integration sketch

```typescript
// services/api/src/email.ts
const POSTMARK_TOKEN = env.POSTMARK_SERVER_TOKEN;

export async function sendEmail(opts: {
  to: string;
  from: string;       // 'noreply@<app>.<parent>.com'
  subject: string;
  htmlBody: string;
  messageStream: string;   // 'sop-transactional' etc.
}) {
  return fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': POSTMARK_TOKEN,
    },
    body: JSON.stringify({
      From: opts.from,
      To: opts.to,
      Subject: opts.subject,
      HtmlBody: opts.htmlBody,
      MessageStream: opts.messageStream,
    }),
  });
}
```

Each app should send from a sender domain matching its product:
`noreply@sop.<parent>.com`, `noreply@fleet.<parent>.com`, etc.
(One-time DNS work per subdomain.)

### Resend stays documented as a future option (not active)

The founder is already paying Postmark $20/mo for the 10k plan and won't hit
that volume soon, so we use **Postmark only for now.** Resend remains a
documented option for the future, specifically when:
- Postmark pricing becomes the constraint at higher tiers (Postmark $45/mo
  vs Resend $20/mo for 50k emails — Resend is meaningfully cheaper at scale).
- A specific app needs a closely-integrated Workers email path that
  Postmark doesn't fit.
- Brand-specific sender domains multiply (Resend's per-domain pricing is
  more flexible than Postmark's server-based model).

**Decision now:** Postmark only. **Decision documented for later:** Resend
is a real option when Postmark stops being the right answer.

---

## 2. Media — R2 for storage, Cloudflare Images for display

This is two products, two use cases. Use both. They cost very little.

### When to use R2 (raw object storage)

- User uploads where the **original file matters**: PDF manuals, receipts,
  warranty documents, full-resolution proof-of-work photos, RAW camera files.
- App-internal storage where you control retrieval and want **free egress**.
- Direct-from-browser uploads via signed URLs (saves Worker CPU).

R2 stores bytes. It does not transform, resize, or optimize. Files come back
exactly as you put them in.

### When to use Cloudflare Images (display optimization)

- Any image displayed in a UI (website OR app) where you want responsive
  sizes, WebP/AVIF conversion, lazy loading, and CDN delivery.
- **Inside the four apps:**
  - **Meal recipe photos** (cards, hero, grid views) → CF Images
  - **Fleet vehicle photos** (dashboard thumbs, detail views) → CF Images
  - **Asset Tracker item photos** (grid + detail views) → CF Images
  - SOP step illustrations (if any are added later) → CF Images
- **On client websites:** all photography on Eberhard Photo, Neighborhood
  Hauling, etc. → CF Images. (See [`CLOUDFLARE_IMAGES_MIGRATION.md`](./CLOUDFLARE_IMAGES_MIGRATION.md)
  for the migration playbook.)
- Marketing pages for the four apps.

Cloudflare Images takes one upload and gives you many variants
(`?width=400`, `?width=1200`, etc.) automatically. It's purpose-built for
"show photos on the web." **Recipe, vehicle, and item photos all qualify.**

### Decision matrix

| File use case | Provider | Why |
|---|---|---|
| SOP "proof of work" photo (compliance evidence) | **R2** | Original must be preserved unmodified for audit |
| Asset Tracker receipt scan (PDF or photo) | **R2** | Insurance use; user downloads the original |
| Asset Tracker product photo (display in grid) | **Cloudflare Images** | Needs thumbnail + full-size views |
| Fleet vehicle photo | **Cloudflare Images** | Listed on dashboard with thumbnails |
| Fleet service receipt scan | **R2** | Original document for record-keeping |
| Meal recipe hero photo | **Cloudflare Images** | Multiple sizes for cards, detail page |
| Eberhard Photo client portfolio gallery | **Cloudflare Images** | Public website with responsive variants |
| Neighborhood Hauling site hero images | **Cloudflare Images** | Ditto |
| Marketing site hero images | **Cloudflare Images** | Ditto |

### R2 is NOT a Google Drive replacement

This came up directly. R2 storage at **$15/TB/month** with free egress is
cheap, but it has **no native browsing UI, no albums, no sharing flows, no
mobile app**. To use it as personal storage you'd need third-party tools
(Cyberduck, Rclone, Mountain Duck) and a lot of patience.

**Comparison for personal cloud storage at 2 TB:**

| Service | Monthly | Built-in UI | Mobile apps | Sharing |
|---|---|---|---|---|
| Google One 2TB | $9.99 | yes | yes | yes |
| iCloud+ 2TB | $9.99 | yes | yes | yes |
| Backblaze B2 2TB | $12 | basic | no | basic |
| **R2 2TB** | **$30** | minimal dashboard | no | API-only |

**Recommendation:** keep Google Drive for personal photo/video storage.
Use R2 only for app-side file storage (user uploads in SOP, Fleet, Asset,
Meal). Don't try to consolidate; the use cases are different.

### When you want video specifically: Cloudflare Stream

R2 stores video bytes but doesn't stream them — playback would require
downloading the whole file. If you ever want adaptive-bitrate streaming
(HLS / DASH), automatic transcoding, thumbnails, and an embed player on a
website, that's **Cloudflare Stream**:

- **$5 per 1,000 minutes stored**
- **$1 per 1,000 minutes delivered**

That's much pricier than R2 raw storage, but Stream replaces a video CDN +
encoder + player. Use it only when the use case is "embed video on a
website with proper streaming" — never for personal video archive.

### How files connect to the database

**Decision (committed):** the `files` table (see `DATABASE_SCHEMA.md` §2.6)
is **R2 only** — raw uploads, PDFs, receipts, manuals, SOP proof-of-work
originals.

**Cloudflare Images IDs are stored directly on the owning record** as a
`*_image_cf_id` column:
- `meal_recipes.primary_image_cf_id`
- `fleet_vehicles.primary_image_cf_id`
- `asset_items.primary_image_cf_id`

This keeps the two storage systems cleanly separated and avoids polymorphic
ambiguity in the `files` table. If we ever need unified asset management
across both, we can add an `image_cf_id` column to `files` and union later.

---

## 3. Migrating the existing client websites off GitHub-hosted images

The founder mentioned: *"The pictures upload from my computer to GitHub or
something. I'm not sure how it's working right now."*

**Diagnosis:** images are committed to the git repo. Every commit captures
the full image history forever, the repo grows monotonically, and clones get
slower over time. GitHub's recommended cap is 1 GB per repo and it nags
above 100 MB. This is technical debt that compounds.

### Migration playbook (per client website)

**See [`CLOUDFLARE_IMAGES_MIGRATION.md`](./CLOUDFLARE_IMAGES_MIGRATION.md) for
the full self-contained playbook including the per-site delivery domain
convention and ID prefix table.** Short version:

1. **Inventory** — list all images currently in `public/` or `src/assets/`:
   ```bash
   find public src -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o -name '*.gif' \) > images.txt
   ```
2. **Bulk upload** to Cloudflare Images via the Cloudflare dashboard (drag
   and drop) or a small upload script. Note each image's Cloudflare Images ID
   (prefix it by site: `ssp_`, `nbh_`, etc. — see migration doc §3.1).
3. **Set up per-site delivery domain** — every client gets its own
   `images.<clientdomain>` CNAME to `imagedelivery.net`, **proxied (orange
   cloud)**. Do not share a single delivery domain across clients
   (decision: 2026-05-10 — Eberhard Photo is a separate business, not the
   media CDN for client work).
4. **Update Astro components** to reference the new URLs:
   ```astro
   ---
   // Before:
   import hero from '../assets/hero.jpg';
   ---
   <Image src={hero} alt="..." />

   ---
   // After (Cloudflare Images via per-site delivery domain):
   const heroId = 'ssp_hero_abc123';
   const base = `https://images.safeandsoundpianos.com/${heroId}`;
   ---
   <img src={`${base}/card`} alt="..." srcset={`${base}/thumbnail 400w, ${base}/card 800w, ${base}/hero 1600w`} />
   ```
5. **Delete images from git** in a follow-up commit (after preview is
   approved). Run `git gc --aggressive` to reclaim local space (won't
   shrink GitHub history without a force-push filter — usually not worth
   the disruption).
6. **Verify** the deployed site still renders all images.

### Astro `astro.config.mjs` snippet for Cloudflare Images remote pattern

```javascript
// One entry per site's delivery domain — you don't list other clients'
// domains in this site's config.
export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.safeandsoundpianos.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },   // fallback
    ],
  },
});
```

### Estimated effort per site

- ~30 minutes for a small site (under 50 images).
- ~2 hours for a photo-heavy portfolio.
- Done once per site — doesn't repeat.

---

## 4. Account setup checklist

When the founder is ready to provision the new apps' infrastructure:

- [ ] **Cloudflare account** (existing — confirm)
- [ ] **R2 enabled** on the account (requires payment method on file as fraud
      protection; will not bill until past free tier)
- [ ] **Cloudflare Images enabled** ($5/mo subscription added)
- [ ] **D1 database created** (one shared DB; can split later if needed)
- [ ] **Workers Free plan active** for `services/api`
- [ ] **Pages projects created** for each app frontend
- [ ] **Postmark sender domains** for `noreply@<app>.<parent>.com`
- [ ] **Stripe account** with products + prices for each app's tier
- [ ] **Domain DNS** pointing to Cloudflare with subdomains routed correctly
- [ ] **GitHub Actions secrets** for `CLOUDFLARE_API_TOKEN` if using GHA for CI

The founder handles all account creation and billing details. Claude Code
sessions wire up the integrations once secrets are in place.

---

## 5. Decisions captured

- **Email:** Postmark for everything (already paying $20/mo for 10k plan).
  Resend not used.
- **App user uploads (raw bytes):** R2.
- **Photos displayed on websites (apps + client sites):** Cloudflare Images.
- **Personal photo/video storage (Google Drive replacement):** **stay on
  Google Drive.** R2 is the wrong tool for this.
- **Video embedded on websites:** Cloudflare Stream (not R2). Defer until
  there's a concrete use case.
- **Client website migration off GitHub-hosted images:** plan to move
  one site at a time, low priority but real technical debt.

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

### When to consider switching to Resend

- If Postmark's $15/mo minimum feels heavy for an MVP that sends <500 emails/month.
- If you want webhooks-as-a-service tightly integrated with the Cloudflare ecosystem.
- If you need to send from many short-lived domains (Resend's pricing is per-month, not per-domain).

For now: stay on Postmark. **Don't run two email providers in production.**

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

- Any image displayed on a public website where you want responsive sizes,
  WebP/AVIF conversion, lazy loading, and CDN delivery.
- Specifically: **all photography on Eberhard Photo client websites.**
- Marketing pages for the four apps.
- Public profile / cover images in the apps (if added).

Cloudflare Images takes one upload and gives you many variants
(`?width=400`, `?width=1200`, etc.) automatically. It's purpose-built for
"show photos on the web."

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

### How files connect to the database

The `files` table (see `DATABASE_SCHEMA.md` §2.6) stores R2 metadata. For
Cloudflare Images you can either:

- **Skip the DB row** and just store the Cloudflare Images ID directly on
  the owning record (e.g. `meal_recipes.primary_image_cf_id`), or
- **Use the same `files` table** with `bucket_key` containing the Cloudflare
  Images ID and `metadata_json` describing variants.

Recommend the first (simpler) for app images, the second if you want unified
asset management later.

---

## 3. Migrating the existing client websites off GitHub-hosted images

The founder mentioned: *"The pictures upload from my computer to GitHub or
something. I'm not sure how it's working right now."*

**Diagnosis:** images are committed to the git repo. Every commit captures
the full image history forever, the repo grows monotonically, and clones get
slower over time. GitHub's recommended cap is 1 GB per repo and it nags
above 100 MB. This is technical debt that compounds.

### Migration playbook (per client website)

1. **Inventory** — list all images currently in `public/` or `src/assets/`:
   ```bash
   find public src -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o -name '*.gif' \) > images.txt
   ```
2. **Bulk upload** to Cloudflare Images via the Cloudflare dashboard (drag
   and drop) or the `wrangler` CLI. Note each image's Cloudflare Images ID.
3. **Set up custom domain** (optional but recommended): point
   `images.eberhardphoto.com` (CNAME) to the Cloudflare Images delivery URL.
4. **Update Astro components** to reference the new URLs:
   ```astro
   ---
   // Before:
   import hero from '../assets/hero.jpg';
   ---
   <Image src={hero} alt="..." />

   ---
   // After (Cloudflare Images via custom domain):
   const heroId = 'abc123-def456-...';
   const heroUrl = `https://images.eberhardphoto.com/${heroId}/public`;
   ---
   <img src={heroUrl} alt="..." srcset={`${heroUrl}/w=400 400w, ${heroUrl}/w=1200 1200w`} />
   ```
5. **Delete images from git** in a single commit. Run `git gc --aggressive`
   to reclaim local space (won't shrink GitHub history without a force-push
   filter — usually not worth the disruption).
6. **Verify** the deployed site still renders all images.

### Astro `astro.config.mjs` snippet for Cloudflare Images remote pattern

```javascript
export default defineConfig({
  image: {
    domains: ['images.eberhardphoto.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.imagedelivery.net' },
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

- **Email:** Postmark for everything. Don't run two providers.
- **Storage / display:** R2 for raw user uploads (receipts, manuals, originals);
  Cloudflare Images for any photo displayed on a website (apps and client sites).
- **Client website migration:** plan to move all GitHub-hosted images to
  Cloudflare Images, one site at a time, low priority but real technical debt.

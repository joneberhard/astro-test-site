# Cloudflare Images Migration Playbook

> **Audience:** A Claude Code session opened against any Eberhard-owned Astro
> repository (e.g. `joneberhard/astro-test-site`, `joneberhard/neighborhood-hauling`,
> Eberhard Photo, etc.). **This document is self-contained** — read it cold,
> execute, push.
>
> **Goal:** Move all displayed images off git and onto **Cloudflare Images**.
>
> **Prerequisite:** A Cloudflare account with Images enabled ($5/mo). The
> founder handles the Cloudflare account setup; this doc covers the code work.

---

## How to use this document

A future Claude Code session should:

1. Read this entire document once before touching anything.
2. Confirm with the founder which site they want migrated.
3. Run the inventory step (§4.1) and report findings before bulk-uploading.
4. Execute the migration steps in order (§4) for one site at a time.
5. Verify (§7) before committing.
6. Open a PR; do not merge without the founder's review.

**Hard rules:**
- One site per PR. Never batch multiple repositories.
- Never delete original images from git in the same commit as the swap.
  Use a follow-up commit so the swap can be reverted if a URL fails.
- Never push to `main` directly. Use a branch like
  `claude/cf-images-migration-<sitename>`.

---

## 1. Why this migration exists

Current state across all client Astro sites: image files live in `public/`
or `src/assets/` and are committed to git. This causes:

- **Repo bloat** — every commit captures the full image history forever.
  GitHub's recommended limit is 1 GB per repo and pushes warnings above 100 MB.
- **Slow clones** — onboarding a new dev / Claude session gets slower with
  every photo added.
- **No optimization** — git serves bytes verbatim. No WebP, no AVIF, no
  responsive sizes, no `srcset`.
- **No CDN** — images are served from wherever the site is hosted, not from
  Cloudflare's edge.
- **High bandwidth costs** at the host if the site is photo-heavy.

**Cloudflare Images solves all of the above** for $5/mo flat (100k images
stored + 100k delivered; very cheap above).

---

## 2. What Cloudflare Images is

A managed image-hosting product that:

- Stores the original of each image you upload.
- **Generates variants on demand** at any size (`?width=400`, `?width=1200`,
  square crops, etc.).
- Serves WebP / AVIF automatically based on the requesting browser.
- Delivers from Cloudflare's global CDN.
- Optionally serves from a custom domain (e.g. `images.eberhardphoto.com`).

You upload an image once. You get back an **Image ID**. You build delivery
URLs like:

```
https://imagedelivery.net/<ACCOUNT_HASH>/<IMAGE_ID>/<VARIANT_NAME>
```

Or with a custom domain:

```
https://images.eberhardphoto.com/<IMAGE_ID>/<VARIANT_NAME>
```

The variant name controls sizing — `public` is the original, `thumbnail`,
`hero`, etc. are configured in the Cloudflare dashboard.

---

## 3. Pre-flight checklist (founder responsibilities)

Before this session can do anything in code, the founder must:

- [ ] Have a Cloudflare account.
- [ ] Subscribe to **Cloudflare Images** ($5/mo, 100,000 stored tier).
- [ ] Note the **Account Hash** (Cloudflare dashboard → Media → Images →
      Hosted images, top of page — only visible after subscription is active).
- [ ] Generate an **API token** with `Cloudflare Images: Edit` permission for
      bulk uploads (Cloudflare dashboard → My Profile → API Tokens). Scope:
      **Account-level**, not zone-level — Images is an account product.
- [ ] Set up a **per-site delivery domain** (CNAME to `imagedelivery.net`,
      **proxied / orange cloud**). See §3.1 for the naming convention.
- [ ] Define **standard variants** in the Cloudflare Images dashboard:
  - `thumbnail` — 400px wide, fit=scale-down
  - `card` — 800px wide, fit=scale-down
  - `hero` — 1600px wide, fit=scale-down
  - `public` — original (default)

If any of these are missing, **stop and ask the founder** before proceeding.

### 3.1 — Delivery domain convention (decision: per-site, not shared)

**Decision (2026-05-10):** every client site gets its **own** `images.*`
subdomain. Do **not** route client images through `images.eberhardphoto.com`
— Eberhard Photo is a separate photography business, not the media CDN for
client work. Mixing them would muddle the brand and the analytics.

| Site | Delivery domain | CNAME status |
|---|---|---|
| Safe and Sound Pianos | `images.safeandsoundpianos.com` | ✅ created 2026-05-10 |
| Neighborhood Hauling | `images.neighborhoodhaulingut.com` | ✅ created 2026-05-10 |
| Utah Rugby League | `images.utahrugbyleague.com` | ✅ created 2026-05-10 |
| Prosperity Society | `images.theprosperitysociety.com` | ✅ created 2026-05-10 |
| Fresh Ones Barber | `images.freshonesbarber.com` | ✅ created 2026-05-10 |
| Eberhard Photo | `images.eberhardphoto.com` (own photos only) | ✅ created 2026-05-10 |
| BeaUTAHful Events | TBD — needs custom domain on Pages project first | ⏸ pending |

**Image ID prefix convention.** All sites share one Cloudflare account's ID
namespace, so prefix every uploaded image ID to prevent collisions and make
ownership obvious in logs:

- `ssp_` — Safe and Sound Pianos
- `nbh_` — Neighborhood Hauling
- `url_` — Utah Rugby League
- `bea_` — BeaUTAHful Events
- `pro_` — Prosperity Society
- `fob_` — Fresh Ones Barber
- `ebp_` — Eberhard Photo

Example: `ssp_a05a5410`, `nbh_job1-before`.

**DNS reminder.** These `images.*` CNAMEs are **proxied (orange cloud)** —
opposite of HighLevel-style CNAMEs which must be DNS-only. Cloudflare Images
expects to terminate the proxied request and serve from edge.

---

## 4. The migration playbook

### 4.1 — Inventory the current images

```bash
cd <site-repo>
find public src -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \
  -o -name '*.webp' -o -name '*.gif' -o -name '*.avif' \) | sort > /tmp/images.txt
wc -l /tmp/images.txt
du -sh public/ src/assets/ 2>/dev/null
```

Report back to the founder:
- Total file count.
- Total size on disk.
- Largest 10 files (use `du -h $(cat /tmp/images.txt) | sort -h | tail -10`).
- Sample file names so they can confirm scope.

**Stop here for confirmation before bulk uploading.** Cloudflare Images
counts uploads against the 100k stored limit; an accidental upload of a
giant image dump is a real cost event.

### 4.2 — Bulk upload to Cloudflare Images

Use `wrangler` (no — wrangler doesn't have a CF Images upload command directly)
or `curl` against the Cloudflare API.

Recommended: a small Node script committed to `scripts/upload-to-cf-images.mjs`
in the repo (kept out of production builds). Pseudocode:

```javascript
// scripts/upload-to-cf-images.mjs
// Usage: CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node scripts/upload-to-cf-images.mjs
import fs from 'node:fs';
import path from 'node:path';

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const FILES = fs.readFileSync('/tmp/images.txt', 'utf8').trim().split('\n');

const mapping = {};
for (const file of FILES) {
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
  form.append('id', file.replace(/[^a-zA-Z0-9_-]/g, '_'));   // deterministic ID
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/images/v1`,
    { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: form }
  );
  const json = await res.json();
  if (!json.success) {
    console.error(`FAILED: ${file}`, json.errors);
    continue;
  }
  mapping[file] = json.result.id;
  console.log(`OK ${file} -> ${json.result.id}`);
}
fs.writeFileSync('/tmp/image-mapping.json', JSON.stringify(mapping, null, 2));
```

Run it. Save `/tmp/image-mapping.json` — it maps **old local path → new
Cloudflare Image ID**.

### 4.3 — Update Astro components and pages

For every reference to a migrated image, swap it to a Cloudflare Images URL.

#### Common patterns to find and replace

```bash
# Find references (run from repo root)
grep -rn 'src=["\x27]/' src public --include='*.astro' --include='*.tsx' --include='*.jsx' --include='*.html' --include='*.md'
grep -rn 'import .* from .*\.\(jpg\|png\|webp\|jpeg\)' src --include='*.astro' --include='*.tsx'
```

#### Pattern 1 — Astro `<Image>` import becomes a remote `<img>`

Before:
```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<Image src={hero} alt="Hero photo" />
```

After (custom domain):
```astro
---
const heroId = 'src_assets_hero_jpg';   // from /tmp/image-mapping.json
const base = `https://images.eberhardphoto.com/${heroId}`;
---
<img
  src={`${base}/hero`}
  srcset={`${base}/thumbnail 400w, ${base}/card 800w, ${base}/hero 1600w`}
  sizes="(max-width: 768px) 100vw, 1200px"
  alt="Hero photo"
  loading="lazy"
  decoding="async"
/>
```

#### Pattern 2 — Public folder reference

Before:
```html
<img src="/photos/about-us.jpg" alt="About us" />
```

After:
```html
<img
  src="https://images.eberhardphoto.com/photos_about-us_jpg/card"
  srcset="https://images.eberhardphoto.com/photos_about-us_jpg/thumbnail 400w,
          https://images.eberhardphoto.com/photos_about-us_jpg/card 800w"
  sizes="(max-width: 768px) 100vw, 800px"
  alt="About us"
  loading="lazy"
/>
```

#### Pattern 3 — Reusable component (recommended)

Create `src/components/CFImage.astro`:

```astro
---
interface Props {
  id: string;
  alt: string;
  variant?: 'thumbnail' | 'card' | 'hero' | 'public';
  sizes?: string;
  class?: string;
  loading?: 'lazy' | 'eager';
}
const {
  id,
  alt,
  variant = 'card',
  sizes = '(max-width: 768px) 100vw, 800px',
  class: className,
  loading = 'lazy',
} = Astro.props;
const base = `https://images.eberhardphoto.com/${id}`;
---
<img
  src={`${base}/${variant}`}
  srcset={`${base}/thumbnail 400w, ${base}/card 800w, ${base}/hero 1600w`}
  sizes={sizes}
  alt={alt}
  loading={loading}
  decoding="async"
  class={className}
/>
```

Use it everywhere:
```astro
<CFImage id="src_assets_hero_jpg" alt="Hero" variant="hero" />
```

This makes a future migration to a different image provider a one-component edit.

### 4.4 — Update `astro.config.mjs` for any remaining remote images

```javascript
import { defineConfig } from 'astro/config';
export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.eberhardphoto.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
    ],
  },
});
```

### 4.5 — Smoke test locally

```bash
pnpm install
pnpm run dev
```

Visit each page. Confirm images load. Check:
- Network tab: requests go to `images.eberhardphoto.com` (or
  `imagedelivery.net`).
- Response is WebP or AVIF (not JPEG) — confirms variants are working.
- No 404s.

### 4.6 — Commit the swap (first commit, images NOT yet deleted)

```bash
git checkout -b claude/cf-images-migration-<sitename>
git add src/components/CFImage.astro src/ astro.config.mjs scripts/
git commit -m "Swap to Cloudflare Images for displayed photos

- Add CFImage component with responsive variants
- Replace local <Image>/<img> references with Cloudflare delivery URLs
- Configure astro.config.mjs remotePatterns
- Mapping recorded in /tmp/image-mapping.json (not committed)

Original images still in repo; will be removed in a follow-up commit
once production deploy is verified.

https://claude.ai/code/session_<id>"
```

### 4.7 — Verify on a deploy preview before deleting originals

Push the branch. Cloudflare Pages will build a preview URL. Have the
founder click through every page on the preview before proceeding.

### 4.8 — Delete originals (second commit)

Only after the preview is approved:

```bash
git rm public/photos/*.jpg public/hero.png src/assets/*.jpg  # adjust to actual paths
git commit -m "Remove original images now that Cloudflare Images is live

All displayed images served from Cloudflare Images. Originals removed
from git to reclaim repo size. Mapping preserved at
/tmp/image-mapping.json (kept off git on purpose).

https://claude.ai/code/session_<id>"
```

**Note:** `git rm` removes from the working tree and history-going-forward,
but the bytes remain in git history. To fully shrink the repo requires
`git filter-repo` and a force-push to `main` — a destructive operation
the founder should explicitly authorize. **Do not do this without permission.**

---

## 5. Astro-specific patterns

### Why we don't use `<Image from 'astro:assets'>` for remote URLs

Astro's built-in `<Image>` component can take remote sources but expects
to know dimensions at build time. With Cloudflare Images variants, the
delivery URL changes per variant and Astro's optimizer adds no value
(Cloudflare already optimizes). Use plain `<img>` with `srcset`.

### What about Astro view transitions?

CFImage works with view transitions. Add `transition:name` to the `<img>`
inside CFImage when needed — the URL stays stable across transitions.

### What about Markdown image syntax `![]()`?

Astro renders Markdown image references as `<img>`. To use Cloudflare URLs
in Markdown:
- Either inline a full URL: `![alt](https://images.eberhardphoto.com/<id>/card)`
- Or write a remark plugin that rewrites local paths via the
  `image-mapping.json`.

For most client sites the volume of Markdown images is small enough that
inline URLs are fine.

---

## 6. Per-site notes

This section grows as we migrate more sites. Add findings here for the next
session.

### Inventory (run 2026-05-10)

Run from `C:\dev\`:

| Repo | Files | On-disk size | Priority |
|---|---|---|---|
| `safe-and-sound-pianos` | 226 | **632 MB** | **Urgent** — raw camera JPEGs, 10-15 MB each |
| `neighborhood-hauling` | 25 | 126 MB | **Urgent** — raw jobs photos, 7 MB each |
| `beautahful-events` | 93 | 37 MB | Worth doing |
| `utah-rugby-league` | 127 | 13 MB | Worth doing (volume of player photos) |
| `prosperity-society` | 22 | 9 MB | Optional |
| `fresh-ones-barber` | 3 | 2 MB | Skip for now |
| `sspianos-team` | 3 | 0.2 MB | Skip |
| `salt-lake-pianotek` | 2 | 0 MB | Skip |
| `astro-test-site` | 1 | 0 MB | Favicon only |
| `buffalo-kitchen` | 0 | 0 MB | N/A |

**Total ~819 MB across 502 files.** All comfortably inside the 100k-stored
quota — one $5/mo subscription covers the entire portfolio for years.

Important: every big image is `import`ed via Astro's `<Image>` component
(verified in `EditorialGrid.astro`, `BeforeAfter.astro`), so Astro is
optimizing them at build time. **Delivery to visitors is already fine.**
This migration is about **repo bloat**, not runtime performance.

### `joneberhard/safe-and-sound-pianos` — Phase 1, urgent

- 226 images in `src/assets/photos/`, raw camera JPEGs.
- Uses `EditorialGrid.astro` with `<Image>` imports.
- Delivery domain: `images.safeandsoundpianos.com`.
- ID prefix: `ssp_`.

### `joneberhard/neighborhood-hauling` — Phase 1, urgent

- 25 images in `src/assets/jobs/`, raw before/after photos.
- Uses `BeforeAfter.astro` with `<Image>` imports.
- Delivery domain: `images.neighborhoodhaulingut.com` (the canonical zone is
  `neighborhoodhaulingut.com` with the UT suffix — `neighborhoodhauling.com`
  is not on the account).
- ID prefix: `nbh_`.

### Phase 2 candidates

`beautahful-events`, `utah-rugby-league`, `prosperity-society` — worth
migrating in the next month or two. Same playbook, see prefix table in §3.1.

### `joneberhard/astro-test-site` (Eberhard Photo growth-ops, `main` branch)

- Astro 6.1.10, single Astro app.
- Pages: `index`, `about`, `services`.
- Layout: `BaseLayout.astro` with global yellow theme.
- 1 image (favicon). **No migration needed** — keep favicon in `public/`.

### Eberhard Photo main portfolio site (separate repo, TBD)

- Repo URL: TBD. The founder must add Claude Code access before migration
  can begin.
- This is the largest expected migration (a photographer's portfolio).
  Likely hundreds of images. Budget extra time for §4.1 inventory and
  §4.2 upload.
- Delivery domain: `images.eberhardphoto.com` (its own domain — see §3.1).
- ID prefix: `ebp_`.

---

## 7. Verification checklist

Before considering a migration complete:

- [ ] All pages render with images in local `pnpm run dev`.
- [ ] Cloudflare Pages preview deploys successfully.
- [ ] Founder clicks through every page on the preview and approves.
- [ ] No 404s in the browser console on any page.
- [ ] Network tab confirms `imagedelivery.net` or custom domain serves images.
- [ ] At least one image is verifiably served as WebP or AVIF (proves
      variants work).
- [ ] Lighthouse / PageSpeed shows improved LCP if hero images were heavy.
- [ ] Original images deleted in a follow-up commit (only after approval).
- [ ] PR description links to this document and `/tmp/image-mapping.json`
      contents (paste into PR body for record).

---

## 8. Rollback plan

If something breaks in production after the swap:

1. **Don't delete the originals yet.** This is why §4.6 and §4.8 are
   separate commits.
2. **Revert §4.6** to restore local image references:
   `git revert <commit-sha>`. Push.
3. The site immediately serves local images again. Cloudflare Images
   uploads remain for a future retry — no clean-up needed.
4. Open a follow-up issue with the failure mode (404s? CORS? wrong variant?).
   Resolve before re-attempting.

If the originals are already deleted (§4.8 has been merged), recovery
requires either:
- Re-uploading from a local backup, then revert commits, or
- Fixing forward (resolve the Cloudflare Images issue and re-deploy).

---

## 9. Costs reminder (see `COSTS.md` §1 for full detail)

- **Cloudflare Images:** $5/month for 100,000 images stored + 100,000
  delivered. $5/month per additional 100k stored, $1/month per additional
  100k delivered.
- **At Eberhard scale:** likely under 10,000 images across all client
  sites for a long time. **One $5/month subscription covers everything.**

---

## 10. What's NOT in scope for this migration

- **App user uploads** (recipe photos, vehicle photos, asset photos):
  these go through the Worker API and CF Images via different code paths.
  See `PROVIDERS.md` and `ARCHITECTURE.md` for the app-side pattern.
- **Raw documents** (PDFs, receipts, manuals): use **R2**, not CF Images.
  CF Images doesn't accept PDFs.
- **Personal photo storage** (founder's iPhone library, Drive backup):
  stay on Google Drive. R2 and CF Images are for the web, not personal cloud.

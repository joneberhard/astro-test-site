// Build gate: every inline <script> in dist/ must parse as JavaScript.
//
// Runs as part of `npm run build` (astro build && node scripts/check-inline-scripts.mjs),
// so a deploy with a broken inline script FAILS on Cloudflare Pages instead of
// shipping. This exists because a hand-edited `(window as any)` TypeScript cast
// inside the <script is:inline> block on /register/apply shipped verbatim on
// 2026-08-05: is:inline (and define:vars) scripts get NO compilation, so the
// cast was a parse-time SyntaxError that killed the entire registration script.
// Every visitor sat on "Loading registration…" for 2.5 days while the page
// stayed HTTP 200 and every server-side check passed. A script that does not
// parse executes nothing — its own try/catch cannot save it, and nothing logs.
//
// new Function(body) applies the same classic-script grammar the browser does.
// Astro-compiled <script> blocks (no is:inline) are emitted as type="module"
// and already valid; module-only syntax there is tolerated, everything else is
// checked identically.

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

function htmlFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) htmlFiles(join(dir, e.name), out);
    else if (e.name.endsWith('.html')) out.push(join(dir, e.name));
  }
  return out;
}

function inlineScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const typeM = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i);
    const type = typeM ? typeM[1].toLowerCase() : '';
    if (type && !['text/javascript', 'application/javascript', 'module'].includes(type)) continue;
    if (!m[2].trim()) continue;
    out.push({ type: type || 'classic', body: m[2] });
  }
  return out;
}

let files;
try {
  files = htmlFiles(DIST);
} catch {
  console.error(`check-inline-scripts: dist/ not found at ${DIST} — run after astro build.`);
  process.exit(2);
}
if (!files.length) {
  console.error('check-inline-scripts: dist/ contains no HTML. Refusing to pass on an empty set.');
  process.exit(2);
}

let checked = 0;
const failures = [];
for (const f of files) {
  for (const s of inlineScripts(readFileSync(f, 'utf8'))) {
    checked++;
    try {
      new Function(s.body);
    } catch (e) {
      const msg = String(e.message || e);
      if (s.type === 'module' && /\b(import|export|await)\b/i.test(msg)) continue;
      failures.push({ file: relative(DIST, f), error: msg, snippet: s.body.slice(0, 200).replace(/\s+/g, ' ').trim() });
    }
  }
}

if (failures.length) {
  console.error(`check-inline-scripts: ${failures.length} inline script(s) DO NOT PARSE — failing the build.\n`);
  for (const f of failures) console.error(`${f.file}\n  ${f.error}\n  …${f.snippet}…\n`);
  console.error('is:inline / define:vars scripts ship to the browser verbatim — plain JS only, no TypeScript.');
  process.exit(1);
}
console.log(`check-inline-scripts: ${checked} inline scripts across ${files.length} HTML files all parse. OK.`);

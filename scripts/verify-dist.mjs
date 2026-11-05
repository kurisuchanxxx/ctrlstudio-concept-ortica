#!/usr/bin/env node
// Build guard. Runs after `astro build` inside `npm run build`, so a failing
// rule also stops the Cloudflare Pages build.
//
// With CONCEPT_MODE on (src/config/concept.mjs):
//   - every page has the concept banner (exact text + link to ctrlstudio.it)
//   - every page has <meta name="robots" content="noindex, ...">
//   - robots.txt exists and disallows everything
//   - _headers sends X-Robots-Tag: noindex
// With CONCEPT_MODE off: none of the above is left behind.
// Always:
//   - no HTML comments in the output
//   - no YouTube resource referenced by the static HTML or CSS (iframes,
//     scripts, images, preconnects...). Plain <a href> links are allowed.
//   - no TODO markers leaked into the output
//   - every page links to /press/ from its footer
//   - every internal link and asset resolves to a file in dist
//   - no file above Cloudflare Pages' 25 MiB limit
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONCEPT, CONCEPT_MODE } from '../src/config/concept.mjs';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const YT = /(?:youtube(?:-nocookie)?\.com|youtu\.be|ytimg\.com|googlevideo\.com|ggpht\.com)/i;

const failures = [];
const fail = (file, rule, detail = '') =>
  failures.push(`${file ? `${file}: ` : ''}[${rule}]${detail ? ` ${detail}` : ''}`);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  }
  return out;
}

function resolveInternal(url) {
  const clean = decodeURI(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return existsSync(join(DIST, 'index.html'));
  const target = join(DIST, clean);
  if (clean.endsWith('/')) return existsSync(join(target, 'index.html'));
  return existsSync(target) || existsSync(join(target, 'index.html')) || existsSync(`${target}.html`);
}

if (!existsSync(DIST)) {
  console.error('verify-dist: dist/ not found. Run astro build first.');
  process.exit(1);
}

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const cssFiles = files.filter((f) => f.endsWith('.css'));

if (!htmlFiles.length) fail('', 'pages', 'no HTML files in dist');

for (const file of files) {
  const { size } = await stat(file);
  if (size > MAX_FILE_BYTES) {
    fail(relative(DIST, file), 'file-size', `${(size / 1024 / 1024).toFixed(1)} MiB > 25 MiB (Cloudflare Pages limit)`);
  }
}

for (const file of htmlFiles) {
  const rel = relative(DIST, file).split(sep).join('/');
  const html = await readFile(file, 'utf8');

  // No HTML comments, ever.
  const comment = html.indexOf('<!--');
  if (comment !== -1) fail(rel, 'html-comment', JSON.stringify(html.slice(comment, comment + 80)));

  // No internal notes in the output.
  if (/\bTODO\b/.test(html)) fail(rel, 'todo-leak', 'TODO marker found in HTML');

  // No YouTube resource before a click.
  if (/<iframe\b/i.test(html)) fail(rel, 'youtube', 'static <iframe> found');
  for (const m of html.matchAll(/<(script|img|source|link|video|audio|embed|object|track|input|image|use)\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    for (const key of ['src', 'srcset', 'href', 'poster', 'data', 'xlink:href', 'imagesrcset']) {
      if (a[key] && YT.test(a[key])) fail(rel, 'youtube', `<${m[1]} ${key}="${a[key]}">`);
    }
  }
  for (const m of html.matchAll(/url\(([^)]*)\)/gi)) {
    if (YT.test(m[1])) fail(rel, 'youtube', `CSS url(${m[1]})`);
  }
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (/@import[^;]*(youtube|ytimg)/i.test(m[1])) fail(rel, 'youtube', 'inline @import');
  }

  // Footer must link to the press kit.
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
  if (!footer) fail(rel, 'footer', 'no <footer>');
  else if (!/href=["']?\/press\/["'\s>]/.test(footer)) fail(rel, 'footer', 'no link to /press/ in footer');

  // Internal links and assets resolve.
  for (const m of html.matchAll(/\s(?:href|src)=["']?(\/(?!\/)[^"'\s>]*)/gi)) {
    if (!resolveInternal(m[1])) fail(rel, 'broken-link', m[1]);
  }
  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url.startsWith('/') && !url.startsWith('//') && !resolveInternal(url)) fail(rel, 'broken-link', url);
    }
  }

  // Concept mode rules.
  const banner = html.match(new RegExp(`<aside\\b[^>]*id=["']?${CONCEPT.bannerId}["'\\s>][\\s\\S]*?<\\/aside>`, 'i'))?.[0];
  const robotsMeta = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((m) => attrs(m[0]))
    .find((a) => (a.name ?? '').toLowerCase() === 'robots');

  if (CONCEPT_MODE) {
    if (!banner) fail(rel, 'concept-banner', 'missing');
    else {
      if (!text(banner).includes(CONCEPT.bannerText)) fail(rel, 'concept-banner', 'text differs from CONCEPT.bannerText');
      if (!banner.includes(`href="${CONCEPT.authorUrl}`)) fail(rel, 'concept-banner', `no link to ${CONCEPT.authorUrl}`);
    }
    if (!robotsMeta || !/noindex/i.test(robotsMeta.content ?? '')) fail(rel, 'noindex', 'missing meta robots noindex');
  } else {
    if (banner) fail(rel, 'concept-off', 'concept banner still present');
    if (robotsMeta && /noindex/i.test(robotsMeta.content ?? '')) fail(rel, 'concept-off', 'noindex still present');
  }
}

for (const file of cssFiles) {
  const css = await readFile(file, 'utf8');
  if (YT.test(css)) fail(relative(DIST, file), 'youtube', 'YouTube URL in CSS');
}

const robotsPath = join(DIST, 'robots.txt');
const robots = existsSync(robotsPath) ? await readFile(robotsPath, 'utf8') : null;
const headersPath = join(DIST, '_headers');
const headers = existsSync(headersPath) ? await readFile(headersPath, 'utf8') : '';
const disallowAll = (txt) => /^User-agent:\s*\*\s*$/im.test(txt) && /^Disallow:\s*\/\s*$/im.test(txt);

if (CONCEPT_MODE) {
  if (!robots) fail('robots.txt', 'robots', 'missing');
  else if (!disallowAll(robots)) fail('robots.txt', 'robots', 'must contain "User-agent: *" and "Disallow: /"');
  if (!/X-Robots-Tag:\s*noindex/i.test(headers)) fail('_headers', 'noindex', 'missing X-Robots-Tag: noindex');
} else {
  if (robots && disallowAll(robots)) fail('robots.txt', 'concept-off', 'still disallows everything');
  if (/X-Robots-Tag:\s*noindex/i.test(headers)) fail('_headers', 'concept-off', 'X-Robots-Tag noindex still present');
}

const mode = CONCEPT_MODE ? 'concept mode ON' : 'concept mode OFF';
if (failures.length) {
  console.error(`\nverify-dist: ${failures.length} problem(s), ${mode}\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('');
  process.exit(1);
}
console.log(
  `verify-dist: ${htmlFiles.length} pages, ${cssFiles.length} stylesheets, ${files.length} files checked, ${mode}. All rules pass.`,
);

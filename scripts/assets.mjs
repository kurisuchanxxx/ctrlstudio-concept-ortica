#!/usr/bin/env node
// Asset checklist: which files each game folder has, which are missing,
// and whether sizes meet the minimums in ASSETS.md.
//   npm run assets
//   npm run assets -- --md     Markdown checklist
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const IMG = /\.(jpe?g|png|webp|avif)$/i;

// Keep in sync with ASSETS.md.
const GAME_SPEC = [
  { name: 'key-art', label: 'Key art', ratio: '16:9', min: [2560, 1440], required: true },
  { name: 'card', label: 'Capsule (card)', ratio: '2:3', min: [600, 900], required: true },
  { name: 'logo', label: 'Logo (transparent PNG)', ratio: 'free', minLong: 1280, required: true },
  { name: 'trailer-frame', label: 'Trailer frame', ratio: '16:9', min: [1280, 720], required: true },
  { name: 'screenshot', label: 'Screenshots (screenshot-01, -02...)', ratio: '16:9', min: [1920, 1080], series: true, required: true },
  { name: 'press-kit.zip', label: 'Press kit zip (or pressKitUrl in content)', file: true, required: false },
];
const STUDIO_SPEC = [
  { name: 'logo', label: 'Studio logo (transparent PNG)', ratio: 'free', minLong: 1280, required: true },
  { name: 'team', label: 'Team photo', ratio: '3:2', min: [2400, 1600], required: true },
  { name: 'press-kit.zip', label: 'Studio press kit zip (or pressKitUrl)', file: true, required: false },
];

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  // Sizes are skipped if sharp is not available.
}

async function size(file) {
  if (!sharp) return null;
  try {
    const m = await sharp(file).metadata();
    return [m.width, m.height];
  } catch {
    return null;
  }
}

async function check(dir, spec) {
  const files = existsSync(dir) ? await readdir(dir) : [];
  const rows = [];
  for (const s of spec) {
    let matches;
    if (s.file) matches = files.filter((f) => f === s.name);
    else if (s.series) matches = files.filter((f) => new RegExp(`^${s.name}-\\d+\\.`, 'i').test(f) && IMG.test(f)).sort();
    else matches = files.filter((f) => f.toLowerCase().startsWith(`${s.name}.`) && IMG.test(f));
    const notes = [];
    for (const f of matches) {
      if (s.file) continue;
      const wh = await size(join(dir, f));
      if (!wh) continue;
      const [w, h] = wh;
      // 1% tolerance: Steam screenshots are often 1919 px wide.
      const short = (v, min) => v < min * 0.99;
      if (s.min && (short(w, s.min[0]) || short(h, s.min[1]))) notes.push(`${f} is ${w}x${h}, min ${s.min[0]}x${s.min[1]}`);
      if (s.minLong && short(Math.max(w, h), s.minLong)) notes.push(`${f} is ${w}x${h}, long side min ${s.minLong}`);
    }
    rows.push({ ...s, matches, notes });
  }
  return rows;
}

const md = process.argv.includes('--md');
const games = (await readdir(join(ROOT, 'src/content/games')))
  .filter((f) => /\.ya?ml$/.test(f))
  .map((f) => f.replace(/\.ya?ml$/, ''));

const sections = [
  ...games.map((slug) => ({ title: `games/${slug}`, dir: join(ROOT, 'src/assets/games', slug), spec: GAME_SPEC })),
  { title: 'studio', dir: join(ROOT, 'src/assets/studio'), spec: STUDIO_SPEC },
];

let missing = 0;
const out = [md ? '# Asset checklist\n' : 'Asset checklist (see ASSETS.md for sizes and sources)\n'];
for (const sec of sections) {
  const rows = await check(sec.dir, sec.spec);
  out.push(md ? `## src/assets/${sec.title}/\n` : `src/assets/${sec.title}/`);
  for (const r of rows) {
    const ok = r.matches.length > 0;
    if (!ok && r.required) missing++;
    const found = ok ? r.matches.join(', ') : r.required ? 'missing' : 'optional, missing';
    out.push(md ? `- [${ok ? 'x' : ' '}] ${r.label}: ${found}` : `  ${ok ? '✓' : '·'} ${r.label.padEnd(44)} ${found}`);
    for (const n of r.notes) out.push(md ? `  - ⚠ ${n}` : `      ⚠ ${n}`);
  }
  out.push('');
}
out.push(`${missing} required file(s) missing. The build still passes and shows placeholders.`);
if (!sharp) out.push('(sharp not available: image sizes not checked)');
console.log(out.join('\n'));

#!/usr/bin/env node
// Collects TODO markers from the source, grouped by category.
//   npm run todos            readable list
//   npm run todos -- --md    Markdown (e.g. > TODO.md)
//
// Convention: TODO(category): note, in YAML comments, JSX comments in
// .astro files or TS/JS comments. Never in HTML comments.
//   verify  a fact from a single or uncertain source, to confirm
//   copy    draft text to validate or replace with official copy
//   data    missing fact shown as a placeholder (price, languages, email...)
//   link    missing URL (stores, socials, trailer...)
//   asset   missing file
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const SCAN = ['src', 'astro.config.mjs'];
const EXT = /\.(astro|ts|mjs|js|ya?ml|md|json|css)$/;
const ORDER = ['verify', 'copy', 'data', 'link', 'asset', 'other'];
const TITLES = {
  verify: 'Verify (uncertain facts)',
  copy: 'Copy (drafts to validate or replace)',
  data: 'Data (missing facts shown as placeholders)',
  link: 'Links (missing URLs)',
  asset: 'Assets (missing files)',
  other: 'Other',
};

async function walk(path) {
  const full = join(ROOT, path);
  let entries;
  try {
    entries = await readdir(full, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOTDIR') return [full];
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const out = [];
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const child = join(path, e.name);
    if (e.isDirectory()) out.push(...(await walk(child)));
    else if (EXT.test(e.name)) out.push(join(ROOT, child));
  }
  return out;
}

const items = [];
for (const path of SCAN) {
  for (const file of await walk(path)) {
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      const m = line.match(/TODO(?:\((\w+)\))?:?\s*(.*?)\s*(?:\*\/\}?|-->)?\s*$/);
      if (!m) return;
      const category = ORDER.includes(m[1]) ? m[1] : 'other';
      // Use the code on the same line as context when the note is short.
      const code = line.slice(0, line.indexOf('TODO')).replace(/[#/{*]+\s*$/, '').trim();
      items.push({
        category,
        file: relative(ROOT, file).split(sep).join('/'),
        line: i + 1,
        note: m[2] || '(no note)',
        code,
      });
    });
  }
}

const md = process.argv.includes('--md');
const out = [];
out.push(md ? `# TODO from source (${items.length})\n` : `${items.length} TODO in source\n`);
for (const cat of ORDER) {
  const group = items.filter((x) => x.category === cat);
  if (!group.length) continue;
  out.push(md ? `## ${TITLES[cat]} (${group.length})\n` : `${TITLES[cat]} (${group.length})`);
  for (const x of group) {
    const where = `${x.file}:${x.line}`;
    const ctx = x.code ? ` [${x.code.slice(0, 60)}]` : '';
    out.push(md ? `- [ ] \`${where}\` ${x.note}${ctx}` : `  ${where.padEnd(52)} ${x.note}${ctx}`);
  }
  out.push('');
}
console.log(out.join('\n'));

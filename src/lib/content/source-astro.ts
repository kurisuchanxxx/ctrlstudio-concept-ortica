// Content source: Astro content collections.
// This is the only module that imports astro:content. To move to a CMS,
// write a module that returns the same Raw* shapes and swap the import in
// ./index.ts. Nothing else changes.
import { getCollection } from 'astro:content';
import type { RawGame, RawStudio } from './types';

export async function loadGames(): Promise<RawGame[]> {
  const entries = await getCollection('games');
  return entries.map((entry) => ({ slug: entry.id, ...entry.data }));
}

export async function loadStudio(): Promise<RawStudio> {
  const entries = await getCollection('studio');
  const entry = entries[0];
  if (!entry) throw new Error('Missing src/content/studio/studio.yaml');
  return entry.data;
}

// Public data API for pages and components.
// Swap ./source-astro for another source to change where content comes from.
import { url } from '../url';
import { bundledPressKit, gameAssets, studioAssets } from './assets';
import { byNewest, deriveGameCore, derivePalette, pickFeatured } from './derive';
import { loadGames, loadStudio } from './source-astro';
import type { Game, PressQuote, Studio } from './types';

export type * from './types';
export { formatDuration, formatPartialDate } from './format';

/**
 * Build time "now". ORTICA_NOW (an ISO date) overrides it, to preview how
 * the site will look on a given day.
 */
export function buildNow(): Date {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const override = env?.ORTICA_NOW;
  return override ? new Date(override) : new Date();
}

let studioCache: Promise<Studio> | undefined;
let gamesCache: Promise<Game[]> | undefined;

export function getStudio(): Promise<Studio> {
  studioCache ??= (async () => {
    const raw = await loadStudio();
    const pressQuotes: PressQuote[] = raw.pressQuotes.map((q) => ({ ...q, game: null }));
    return {
      ...raw,
      pressQuotes,
      nowMaking: raw.nowMaking,
      newsletter: {
        ...raw.newsletter,
        url: raw.channels.find((c) => c.id === 'substack')?.url ?? null,
      },
      pressKitUrl: raw.pressKitUrl ?? bundledPressKit('studio'),
      assets: studioAssets(),
    };
  })();
  return studioCache;
}

export function getGames(): Promise<Game[]> {
  gamesCache ??= (async () => {
    const [raws, studio] = await Promise.all([loadGames(), getStudio()]);
    const now = buildNow();

    const games: Game[] = raws.map((raw) => {
      const core = deriveGameCore(raw, now);
      const assets = gameAssets(raw.slug);
      const publisher = raw.consolePublisher
        ? studio.publishers.find((p) => p.id === raw.consolePublisher)
        : null;
      if (raw.consolePublisher && !publisher) {
        throw new Error(
          `games/${raw.slug}: consolePublisher "${raw.consolePublisher}" is not in studio.yaml publishers`,
        );
      }
      return {
        slug: raw.slug,
        entry: 0,
        title: raw.title,
        genre: raw.genre,
        featured: raw.featured,
        logline: raw.logline,
        description: raw.description,
        shortDescription: raw.shortDescription,
        duration: raw.duration,
        price: raw.price,
        languages: raw.languages,
        contentWarnings: raw.contentWarnings,
        palette: derivePalette(raw.palette, raw.slug),
        artFocus: raw.artFocus,
        ...core,
        consolePublisher: publisher ?? null,
        // Poster: the dedicated trailer frame, else the first screenshot, else the key art.
        trailer: {
          youtubeId: raw.trailer.youtubeId,
          poster: assets.trailerFrame ?? assets.screenshots[0] ?? assets.keyArt,
        },
        awards: raw.awards,
        pressQuotes: raw.pressQuotes.map((q) => ({ ...q, game: raw.title })),
        pressKitUrl: raw.pressKitUrl ?? bundledPressKit(`games/${raw.slug}`),
        assets,
        href: url(`games/${raw.slug}/`),
        pressHref: url(`press/${raw.slug}/`),
      };
    });

    // Entry numbers follow release order: oldest is 1, undated games last.
    [...games]
      .sort((a, b) => -byNewest(a, b))
      .forEach((g, i) => {
        g.entry = i + 1;
      });

    return games.sort(byNewest);
  })();
  return gamesCache;
}

export async function getGame(slug: string): Promise<Game | undefined> {
  return (await getGames()).find((g) => g.slug === slug);
}

export async function getFeaturedGame(): Promise<Game | null> {
  return pickFeatured(await getGames(), buildNow());
}

/** All verified press quotes: games first, newest game first, then studio. */
export async function getPressQuotes(): Promise<PressQuote[]> {
  const [games, studio] = await Promise.all([getGames(), getStudio()]);
  return [...games.flatMap((g) => g.pressQuotes), ...studio.pressQuotes];
}

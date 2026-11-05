// Pure rules derived at build time: dates, release states, calls to action,
// hero selection and AA-safe palettes. No I/O here, so it is easy to test.
import { contrast, ensureContrast, ensureDark, mix } from './color';
import type {
  Game,
  GamePalette,
  PartialDate,
  PlatformId,
  PlatformRelease,
  PrimaryCta,
  RawGame,
  RawPlatform,
  ReleaseState,
} from './types';

/* ---------- Theme constants mirrored from src/styles/tokens.css ---------- */
export const THEME = {
  bg: '#0e0d0c',
  text: '#e6e1d8',
  muted: '#a29c92',
  inkDark: '#0e0d0c',
  inkLight: '#f3efe8',
} as const;

/** Surfaces are the background mixed with white, as in tokens.css. */
export const surfaceOf = (bg: string) => mix(bg, '#ffffff', 0.06);

/* ---------- Platforms ---------- */
// Platforms are text labels, never console logos.
const PLATFORM_META: Record<PlatformId, { name: string; short: string; store: string }> = {
  steam: { name: 'PC (Steam)', short: 'PC', store: 'Steam' },
  'xbox-series': { name: 'Xbox Series', short: 'Xbox Series', store: 'Xbox Store' },
  ps5: { name: 'PlayStation 5', short: 'PS5', store: 'PlayStation Store' },
  playstation: { name: 'PlayStation', short: 'PlayStation', store: 'PlayStation Store' },
  switch: { name: 'Nintendo Switch', short: 'Switch', store: 'Nintendo eShop' },
};

/* ---------- Dates ---------- */
export function parsePartialDate(iso: string): PartialDate {
  const [y, m, d] = iso.split('-').map(Number) as [number, number?, number?];
  if (d !== undefined && m !== undefined) {
    const start = new Date(Date.UTC(y, m - 1, d));
    return { iso, precision: 'day', start, end: new Date(Date.UTC(y, m - 1, d + 1) - 1) };
  }
  if (m !== undefined) {
    const start = new Date(Date.UTC(y, m - 1, 1));
    return { iso, precision: 'month', start, end: new Date(Date.UTC(y, m, 1) - 1) };
  }
  return {
    iso,
    precision: 'year',
    start: new Date(Date.UTC(y, 0, 1)),
    end: new Date(Date.UTC(y + 1, 0, 1) - 1),
  };
}

/**
 * A day-precise date counts as released from that day. A month or a year
 * counts as released only once the whole period has passed, so the site
 * never says "out now" before it is certain.
 */
export function releaseState(date: PartialDate | null, now: Date): ReleaseState {
  if (!date) return 'unannounced';
  const releasedFrom = date.precision === 'day' ? date.start : date.end;
  return now.getTime() >= releasedFrom.getTime() ? 'released' : 'upcoming';
}

function toPlatformRelease(raw: RawPlatform, now: Date): PlatformRelease {
  const date = raw.release ? parsePartialDate(raw.release) : null;
  return {
    id: raw.id,
    ...PLATFORM_META[raw.id],
    date,
    state: releaseState(date, now),
    url: raw.url,
  };
}

/* ---------- Palette ---------- */
export function derivePalette(source: RawGame['palette'], slug: string): GamePalette {
  // Body text and muted text must stay AA on the game background.
  const base = ensureDark(source.base, 0.015);
  const backgrounds = [base, surfaceOf(base), THEME.bg, surfaceOf(THEME.bg)];
  let accent = ensureContrast(source.accent, backgrounds, 4.5);
  const pickInk = (c: string) =>
    contrast(c, THEME.inkDark) >= contrast(c, THEME.inkLight) ? THEME.inkDark : THEME.inkLight;
  let accentInk = pickInk(accent);
  if (contrast(accent, accentInk) < 4.5) {
    accent = ensureContrast(accent, [THEME.inkDark], 4.5);
    accentInk = THEME.inkDark;
  }
  if (base !== source.base.toLowerCase() || accent !== source.accent.toLowerCase()) {
    console.warn(
      `[palette] ${slug}: adjusted for AA contrast (base ${source.base} -> ${base}, accent ${source.accent} -> ${accent})`,
    );
  }
  return { base, accent, accentInk, glow: source.glow, source };
}

/* ---------- Game ---------- */
const STATE_RANK: Record<ReleaseState, number> = { released: 0, upcoming: 1, unannounced: 2 };

export function deriveGameCore(raw: RawGame, now: Date) {
  const platforms = raw.platforms.map((p) => toPlatformRelease(p, now));
  const dated = platforms.filter((p) => p.date).map((p) => p.date!);
  const firstRelease =
    dated.sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null;

  const steam = platforms.find((p) => p.id === 'steam') ?? null;
  const state: ReleaseState = steam
    ? steam.state
    : platforms.map((p) => p.state).sort((a, b) => STATE_RANK[a] - STATE_RANK[b])[0] ?? 'unannounced';

  const primaryCta: PrimaryCta | null = steam
    ? { kind: steam.state === 'released' ? 'buy' : 'wishlist', url: steam.url }
    : null;

  const storeButtons = platforms.filter((p) => p.id !== 'steam' && p.state === 'released');

  return { platforms, firstRelease, state, primaryCta, storeButtons };
}

/** Newest first. Games without any date are treated as the newest. */
export function byNewest(a: Game, b: Game): number {
  const ta = a.firstRelease?.start.getTime() ?? Number.POSITIVE_INFINITY;
  const tb = b.firstRelease?.start.getTime() ?? Number.POSITIVE_INFINITY;
  return tb - ta || a.title.localeCompare(b.title);
}

/** Earliest upcoming dated release of a game, if any. */
function nextRelease(game: Game): Date | null {
  const dates = game.platforms
    .filter((p) => p.state === 'upcoming' && p.date)
    .map((p) => p.date!.start.getTime());
  return dates.length ? new Date(Math.min(...dates)) : null;
}

/**
 * Hero game: the one marked featured, otherwise the next dated release,
 * otherwise the most recently released game.
 */
export function pickFeatured(games: Game[], now: Date): Game | null {
  const forced = games.find((g) => g.featured);
  if (forced) return forced;

  const upcoming = games
    .filter((g) => g.state !== 'released')
    .map((g) => ({ g, next: nextRelease(g) }))
    .filter((x): x is { g: Game; next: Date } => x.next !== null)
    .sort((a, b) => a.next.getTime() - b.next.getTime());
  if (upcoming[0]) return upcoming[0].g;

  const released = games
    .filter((g) => g.firstRelease && g.firstRelease.start.getTime() <= now.getTime())
    .sort(byNewest);
  return released[0] ?? games[0] ?? null;
}

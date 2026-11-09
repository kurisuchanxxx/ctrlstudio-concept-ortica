// Domain types for the whole site. Components depend on these, never on
// astro:content, so a different content source (e.g. Sanity) only has to
// produce the Raw* shapes below in a new source module.
import type { ImageMetadata } from 'astro';

export type PlatformId = 'steam' | 'xbox-series' | 'ps5' | 'playstation' | 'switch';
export type ChannelId =
  | 'substack'
  | 'steam'
  | 'x'
  | 'bluesky'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'discord'
  | 'linkedin';

/* ---------- Raw shapes: what a content source must provide ---------- */

export interface RawPlatform {
  id: PlatformId;
  /** YYYY, YYYY-MM or YYYY-MM-DD. null: announced, date unknown. */
  release: string | null;
  url: string | null;
}

export interface RawPressQuote {
  quote: string;
  outlet: string;
  author: string | null;
  url: string;
}

export interface RawGame {
  slug: string;
  title: string;
  genre: string | null;
  featured: boolean;
  logline: string;
  description: string[];
  shortDescription: string;
  duration: { min: number; max: number } | null;
  price: string | null;
  languages: string[];
  contentWarnings: string[];
  palette: { base: string; accent: string; glow: string };
  artFocus: string;
  platforms: RawPlatform[];
  consolePublisher: string | null;
  trailer: { youtubeId: string | null };
  awards: Award[];
  pressQuotes: RawPressQuote[];
  pressKitUrl: string | null;
}

export interface RawStudio {
  name: string;
  founded: number;
  location: { city: string; country: string };
  engine: string | null;
  formula: string;
  manifesto: string[];
  shortDescription: string;
  longDescription: string[];
  team: TeamMember[];
  contacts: { press: string | null; business: string | null };
  channels: Channel[];
  newsletter: { title: string; text: string; cta: string };
  publishers: Publisher[];
  pressQuotes: RawPressQuote[];
  pressKitUrl: string | null;
}

/* ---------- Domain shapes: what components receive ---------- */

/** A local (build-optimised) or remote image. */
export interface ImageAsset {
  src: ImageMetadata | string;
  width: number;
  height: number;
}

export type DatePrecision = 'year' | 'month' | 'day';

export interface PartialDate {
  iso: string;
  precision: DatePrecision;
  /** First instant of the period, UTC. */
  start: Date;
  /** Last instant of the period, UTC. */
  end: Date;
}

/** released: out now. upcoming: dated, in the future. unannounced: no date yet. */
export type ReleaseState = 'released' | 'upcoming' | 'unannounced';

export interface PlatformRelease {
  id: PlatformId;
  /** Platform name, e.g. Xbox Series. */
  name: string;
  /** Compact name for cards, e.g. PS5. */
  short: string;
  /** Store name for buttons, e.g. Xbox Store. */
  store: string;
  date: PartialDate | null;
  state: ReleaseState;
  url: string | null;
}

export interface Award {
  result: string;
  category: string;
  event: string;
  url: string | null;
}

export interface PressQuote extends RawPressQuote {
  /** Title of the game the quote is about, null for studio quotes. */
  game: string | null;
}

export interface TeamMember {
  name: string;
  role: string | null;
  /** Personal site or portfolio. */
  url: string | null;
  verified: boolean;
}

export interface Channel {
  id: ChannelId;
  label: string;
  url: string | null;
}

export interface Publisher {
  id: string;
  name: string;
  role: string;
  city: string;
  country: string;
  url: string | null;
}

/** Game palette after AA adjustment against the dark page backgrounds. */
export interface GamePalette {
  /** Page background for the game, darkened if needed for AA body text. */
  base: string;
  /** Accent safe for text, links and focus on the base and on the site background. */
  accent: string;
  /** Text colour to use on an accent-coloured surface (buttons). */
  accentInk: string;
  /** Decorative only: gradients, glows. Never used for text. */
  glow: string;
  /** Colours as written in content, before adjustment. */
  source: { base: string; accent: string; glow: string };
}

export interface GameAssets {
  keyArt: ImageAsset | null;
  card: ImageAsset | null;
  logo: ImageAsset | null;
  trailerFrame: ImageAsset | null;
  screenshots: ImageAsset[];
}

export interface PrimaryCta {
  kind: 'buy' | 'wishlist';
  url: string | null;
}

export interface Game {
  slug: string;
  /** 1-based position in release order: the first game released is 1. */
  entry: number;
  title: string;
  genre: string | null;
  featured: boolean;
  logline: string;
  description: string[];
  shortDescription: string;
  duration: { min: number; max: number } | null;
  price: string | null;
  languages: string[];
  contentWarnings: string[];
  palette: GamePalette;
  artFocus: string;
  platforms: PlatformRelease[];
  /** Earliest dated release on any platform. */
  firstRelease: PartialDate | null;
  /** Steam state if the game is on Steam, otherwise the best state across platforms. */
  state: ReleaseState;
  /** Steam call to action, null if the game is not on Steam. */
  primaryCta: PrimaryCta | null;
  /** Non-Steam platforms where the game is out: these get store buttons. */
  storeButtons: PlatformRelease[];
  consolePublisher: Publisher | null;
  trailer: { youtubeId: string | null; poster: ImageAsset | null };
  awards: Award[];
  pressQuotes: PressQuote[];
  /** Zip download: external URL or bundled file, null shows a placeholder. */
  pressKitUrl: string | null;
  assets: GameAssets;
  href: string;
  pressHref: string;
}

export interface Studio {
  name: string;
  founded: number;
  location: { city: string; country: string };
  engine: string | null;
  formula: string;
  manifesto: string[];
  shortDescription: string;
  longDescription: string[];
  team: TeamMember[];
  contacts: { press: string | null; business: string | null };
  channels: Channel[];
  newsletter: { title: string; text: string; cta: string; url: string | null };
  publishers: Publisher[];
  pressQuotes: PressQuote[];
  pressKitUrl: string | null;
  assets: { logo: ImageAsset | null; team: ImageAsset | null };
}

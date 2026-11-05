// Content collections: the schema of everything editorial on the site.
// Components never import from astro:content. They read typed data from
// src/lib/content, which is the only layer that knows where content lives.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour, quoted, like \'#1d2b2a\'');

// A release date with explicit precision: 2025, 2025-08 or 2025-08-20.
// YAML parses full dates as Date and bare years as numbers, so accept both.
const partialDate = z.union([
  z.date().transform((d) => d.toISOString().slice(0, 10)),
  z.number().int().min(1990).max(2100).transform(String),
  z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Use YYYY, YYYY-MM or YYYY-MM-DD'),
]);

const platform = z.object({
  id: z.enum(['steam', 'xbox-series', 'ps5', 'playstation', 'switch']),
  // null means the platform is announced but the date is not known.
  release: partialDate.nullable().default(null),
  url: z.url().nullable().default(null),
});

const pressQuote = z.object({
  quote: z.string(),
  outlet: z.string(),
  author: z.string().nullable().default(null),
  url: z.url(),
});

const games = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: './src/content/games' }),
  schema: z.object({
    title: z.string(),
    genre: z.string().nullable().default(null),
    // Forces this game into the home hero. Otherwise the hero is the next
    // dated release, or the most recent one.
    featured: z.boolean().default(false),
    logline: z.string(),
    description: z.array(z.string()).min(1).max(3),
    shortDescription: z.string(),
    duration: z
      .object({ min: z.number().int().positive(), max: z.number().int().positive() })
      .nullable()
      .default(null),
    price: z.string().nullable().default(null),
    languages: z.array(z.string()).default([]),
    contentWarnings: z.array(z.string()).default([]),
    palette: z.object({ base: hex, accent: hex, glow: hex }),
    // CSS object-position for the key art crop, e.g. 50% 30%.
    artFocus: z.string().default('50% 50%'),
    platforms: z.array(platform).min(1),
    // id of an entry in studio.yaml publishers.
    consolePublisher: z.string().nullable().default(null),
    trailer: z
      .object({
        youtubeId: z
          .string()
          .regex(/^[A-Za-z0-9_-]{11}$/, 'Use the 11-character YouTube video id')
          .nullable()
          .default(null),
      })
      .default({ youtubeId: null }),
    awards: z
      .array(
        z.object({
          result: z.string(),
          category: z.string(),
          event: z.string(),
          url: z.url().nullable().default(null),
        }),
      )
      .default([]),
    pressQuotes: z.array(pressQuote).default([]),
    // External link to the press zip. Cloudflare Pages caps files at 25 MiB,
    // so big kits live elsewhere. Without it, src/assets/games/<slug>/press-kit.zip
    // is used if present, otherwise a placeholder is shown.
    pressKitUrl: z.url().nullable().default(null),
  }),
});

const channelId = z.enum([
  'substack',
  'steam',
  'x',
  'bluesky',
  'youtube',
  'instagram',
  'tiktok',
  'discord',
]);

const studio = defineCollection({
  loader: glob({ pattern: 'studio.{yaml,yml}', base: './src/content/studio' }),
  schema: z.object({
    name: z.string(),
    founded: z.number().int(),
    location: z.object({ city: z.string(), country: z.string() }),
    engine: z.string().nullable().default(null),
    formula: z.string(),
    manifesto: z.array(z.string()).min(1).max(3),
    shortDescription: z.string(),
    longDescription: z.array(z.string()).min(1),
    team: z.array(
      z.object({
        name: z.string(),
        role: z.string().nullable().default(null),
        verified: z.boolean().default(true),
      }),
    ),
    contacts: z.object({
      press: z.email().nullable().default(null),
      business: z.email().nullable().default(null),
    }),
    channels: z.array(z.object({ id: channelId, label: z.string(), url: z.url().nullable().default(null) })),
    newsletter: z.object({ title: z.string(), text: z.string(), cta: z.string() }),
    publishers: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
        city: z.string(),
        country: z.string(),
        url: z.url().nullable().default(null),
      }),
    ),
    pressQuotes: z.array(pressQuote).default([]),
    pressKitUrl: z.url().nullable().default(null),
  }),
});

export const collections = { games, studio };

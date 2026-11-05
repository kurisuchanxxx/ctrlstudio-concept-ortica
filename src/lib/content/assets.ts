// Resolves files in src/assets by convention. File names are fixed, the
// extension is free (jpg, jpeg, png, webp, avif). Missing files return null
// and components render a neutral placeholder with the right proportions.
// Names and sizes are documented in ASSETS.md.
import type { ImageMetadata } from 'astro';
import type { GameAssets, ImageAsset } from './types';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true },
);

const zips = import.meta.glob<string>('/src/assets/**/press-kit.zip', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** scope: games/<slug> or studio. name: file name without extension. */
function findImage(scope: string, name: string): ImageAsset | null {
  const prefix = `/src/assets/${scope}/${name}.`;
  const key = Object.keys(images).find((k) => k.startsWith(prefix));
  if (!key) return null;
  const meta = images[key]!.default;
  return { src: meta, width: meta.width, height: meta.height };
}

function findSeries(scope: string, base: string): ImageAsset[] {
  const pattern = new RegExp(`^/src/assets/${scope}/${base}-(\\d+)\\.[a-z]+$`, 'i');
  return Object.keys(images)
    .map((k) => ({ k, m: k.match(pattern) }))
    .filter((x): x is { k: string; m: RegExpMatchArray } => x.m !== null)
    .sort((a, b) => Number(a.m[1]) - Number(b.m[1]))
    .map(({ k }) => {
      const meta = images[k]!.default;
      return { src: meta, width: meta.width, height: meta.height };
    });
}

export function gameAssets(slug: string): GameAssets {
  const scope = `games/${slug}`;
  return {
    keyArt: findImage(scope, 'key-art'),
    card: findImage(scope, 'card'),
    logo: findImage(scope, 'logo'),
    trailerFrame: findImage(scope, 'trailer-frame'),
    screenshots: findSeries(scope, 'screenshot'),
  };
}

export function studioAssets(): { logo: ImageAsset | null; team: ImageAsset | null } {
  return { logo: findImage('studio', 'logo'), team: findImage('studio', 'team') };
}

/** URL of a bundled press-kit.zip for a scope, if the file exists. */
export function bundledPressKit(scope: string): string | null {
  return zips[`/src/assets/${scope}/press-kit.zip`] ?? null;
}

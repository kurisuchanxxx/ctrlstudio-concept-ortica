// @ts-check
import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import { CONCEPT_MODE } from './src/config/concept.mjs';

/**
 * Writes dist/_headers for Cloudflare Pages. The robots header follows the
 * same concept switch as the meta tag and robots.txt.
 * @returns {import('astro').AstroIntegration}
 */
function cloudflareHeaders() {
  return {
    name: 'ortica:cloudflare-headers',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const lines = [
          '/*',
          '  X-Content-Type-Options: nosniff',
          '  Referrer-Policy: strict-origin-when-cross-origin',
          '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
        ];
        if (CONCEPT_MODE) lines.push('  X-Robots-Tag: noindex, nofollow');
        lines.push(
          '',
          '/_astro/*',
          '  Cache-Control: public, max-age=31536000, immutable',
        );
        await writeFile(new URL('_headers', dir), lines.join('\n') + '\n');
      },
    },
  };
}

export default defineConfig({
  output: 'static',
  // Absolute URL of the deployment, used for Open Graph images. Set SITE_URL
  // in the Cloudflare Pages environment once the address is known.
  site: process.env.SITE_URL || undefined,
  // Sub-path for hosts that serve the site below the domain root, e.g.
  // BASE_PATH=/repo-name/ on a GitHub Pages project site. Root by default.
  base: process.env.BASE_PATH || '/',
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  devToolbar: { enabled: false },
  integrations: [cloudflareHeaders()],
});

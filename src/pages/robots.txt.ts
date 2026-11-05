// robots.txt follows the concept switch: blocked while CONCEPT_MODE is on.
import type { APIRoute } from 'astro';
import { CONCEPT_MODE } from '~/config/concept.mjs';

export const GET: APIRoute = () =>
  new Response(CONCEPT_MODE ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

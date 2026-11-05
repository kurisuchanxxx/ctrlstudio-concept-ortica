// Base-aware internal URLs. The site can live at the domain root
// (Cloudflare Pages) or under a sub-path such as /repo-name/ (GitHub Pages
// project site). Set BASE_PATH at build time; every internal link goes
// through url() so both work.
const RAW_BASE = import.meta.env.BASE_URL || '/';
export const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

/** url('press/') -> '/press/' or '/repo/press/'. Accepts a leading slash too. */
export function url(path = ''): string {
  return BASE + path.replace(/^\/+/, '');
}

/** Pathname without the base, always starting with '/'. */
export function stripBase(pathname: string): string {
  return pathname.startsWith(BASE) ? `/${pathname.slice(BASE.length)}` : pathname;
}

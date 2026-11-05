// Concept mode: the single switch.
//
// While this is true the site is a pitch by Ctrl Studio, not Studio Ortica's
// official website. It controls, and only controls:
//   - the always-visible concept banner on every page
//   - <meta name="robots" content="noindex, nofollow"> on every page
//   - robots.txt with "Disallow: /"
//   - the X-Robots-Tag header in the generated Cloudflare _headers file
//   - the concept note in the footer
//
// scripts/verify-dist.mjs reads this same file and fails the build if any
// page breaks these rules. After the client says yes, set it to false in a
// dedicated commit. Nothing else needs to change.
export const CONCEPT_MODE = true;

export const CONCEPT = {
  bannerId: 'concept-banner',
  bannerText: 'Concept by Ctrl Studio, not the official Studio Ortica website',
  authorName: 'Ctrl Studio',
  authorUrl: 'https://ctrlstudio.it',
  authorUrlLabel: 'ctrlstudio.it',
};

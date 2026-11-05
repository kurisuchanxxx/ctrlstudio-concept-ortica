# Studio Ortica, website

Official website concept for Studio Ortica, an independent horror game studio from Turin, by [Ctrl Studio](https://ctrlstudio.it).

**Concept mode is on:** every page carries a concept banner, a noindex meta tag and a blocking robots.txt. See `src/config/concept.mjs`.

## Quick start

```bash
npm install
npm run dev
```

## Commands

- `npm run build` builds into `dist/` and runs `scripts/verify-dist.mjs`, which checks every page.
- `npm run todos` lists the TODOs collected from the source.
- `npm run assets` shows the asset checklist.

## Documentation

- [CLAUDE.md](CLAUDE.md): project rules, how to add a game, how to verify the site.
- [ASSETS.md](ASSETS.md): asset file names, sizes and sources.
- [docs/brief.md](docs/brief.md): the original brief, in Italian.

## Deploy

**Concept preview on GitHub Pages.** `.github/workflows/pages.yml` builds under `/<repo>/` and deploys on every push to `main`. To set it up once, open repository Settings, then Pages, and set Source to GitHub Actions.

**Production on Cloudflare Pages:**

- Build command: `npm run build`
- Output directory: `dist`
- Node: taken from `.nvmrc`
- Leave `BASE_PATH` unset

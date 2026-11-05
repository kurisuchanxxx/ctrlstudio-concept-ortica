# Studio Ortica, sito ufficiale (concept di Ctrl Studio)

Leggi questo file a ogni sessione. Il brief completo, con requisiti e motivazioni, è in [docs/brief.md](docs/brief.md): non duplicarlo qui.

## A cosa serve

Concept navigabile con cui Ctrl Studio propone a Studio Ortica (studio horror indie di Torino) il loro sito ufficiale. Dopo il sì diventa il sito vero spegnendo la modalità concept, senza rifare nulla: architettura, codice e accessibilità sono da produzione. Il sito è in inglese.

## Stack e comandi

- Astro 7 (versione esatta in package.json), output statico. Produzione su Cloudflare Pages, preview del concept su GitHub Pages.
- Unica dipendenza: `astro` (sharp arriva con Astro). Non aggiungerne altre senza chiederlo.
- Node >= 22.23.4 (`.nvmrc`).

```bash
npm run dev       # sviluppo
npm run build     # astro build + scripts/verify-dist.mjs (fallisce se una regola salta)
npm run preview   # serve dist/
npm run verify    # solo i controlli su dist/
npm run todos     # TODO raccolti dal sorgente, per categoria (-- --md per Markdown)
npm run assets    # checklist asset per gioco, con controllo dimensioni
```

## Struttura

```
src/config/concept.mjs      interruttore unico della modalità concept
src/content.config.ts       schemi Zod delle collection games e studio
src/content/games/*.yaml    un file per gioco (slug = nome file = URL)
src/content/studio/studio.yaml  dati studio: home, footer, press kit
src/assets/games/<slug>/    asset per gioco, nomi fissi (ASSETS.md)
src/assets/studio/          logo e foto team
src/lib/content/            livello dati: tipi, regole derivate, accesso
src/lib/url.ts              url() per i link interni, rispetta BASE_PATH
src/i18n/ui.ts              tutte le stringhe di interfaccia
src/styles/tokens.css       colori, font, spazi, motion: unico file di token
src/components/  src/layouts/  src/pages/  src/scripts/
scripts/                    verify-dist, todos, assets
src/assets/fonts/           woff2 self-hosted (hash e base path gestiti da Vite)
public/fonts/               licenze OFL dei font
.github/workflows/pages.yml build + deploy della preview su GitHub Pages
```

## Modalità concept

- Interruttore: `CONCEPT_MODE` in `src/config/concept.mjs`, acceso di default.
- Controlla, e solo quello: banner sticky non chiudibile su ogni pagina, `<meta name="robots" content="noindex, nofollow">`, `robots.txt` con `Disallow: /`, `X-Robots-Tag: noindex` nel `_headers` generato, nota concept nel footer.
- Per spegnerlo dopo il sì: un commit dedicato che cambia solo quella riga in `false`. Il build verifica allora che banner, noindex e Disallow siano spariti.
- La preview gira su GitHub Pages (scelta di Ctrl Studio al posto di pages.dev). L'indirizzo è `https://<owner>.github.io/<repo>/`: il nome del repo deve dichiarare che è un concept di Ctrl Studio (es. `ctrlstudio-ortica-concept`), mai un nome che sembri il loro.
- Su GitHub Pages `robots.txt` sta sotto `/<repo>/` e i crawler lo ignorano, e `_headers` non viene applicato: lì protegge solo il meta noindex, presente su ogni pagina.
- Non pubblicare, deployare o creare progetti di hosting senza chiedere prima a Ctrl Studio.

## Regole garantite dal build (`scripts/verify-dist.mjs`)

Concept acceso: ogni pagina ha il banner con testo esatto e link a ctrlstudio.it, ogni pagina ha noindex, robots.txt esiste con Disallow, `_headers` ha X-Robots-Tag.

Sempre:
- nessun commento HTML nell'output;
- nessuna risorsa YouTube referenziata da HTML o CSS (iframe, img, link preconnect...): sono ammessi solo i link `<a href>`;
- nessun `TODO` nell'output;
- link a `<base>press/` nel footer di ogni pagina;
- link e asset interni tutti sotto la base e risolti;
- nessun file oltre i 25 MiB (limite di Cloudflare Pages).

Se aggiungi una regola al brief, aggiungila anche allo script.

## Contenuti: niente dati inventati

- **Dato mancante** (prezzo, lingue, link, email, citazioni, foto, zip): lascia `null` o `[]` nel contenuto. I componenti mostrano da soli un placeholder pulito (Pending, Link pending, slot immagine con proporzioni).
- **Testo da scrivere** (logline, descrizioni, manifesto, content warning): bozza in inglese che usa solo i fatti del brief, con un `TODO(copy)` accanto.
- **Fatto incerto:** usalo con un `TODO(verify)`.
- **Citazioni stampa:** solo frasi verificate, con URL della fonte (`pressQuotes`). Gli slot vuoti restano vuoti.
- **Formato dei TODO:** `TODO(categoria): nota`, con categoria verify, copy, data, link o asset. Vanno nei commenti YAML, nei commenti JSX `{/* */}` di Astro o nei commenti TS, mai in commenti HTML. Si raccolgono con `npm run todos`.
- **Dove stanno i testi:** stringhe di interfaccia in `src/i18n/ui.ts`, testi editoriali in `src/content/`.
- **Piattaforme:** etichette testuali, mai loghi delle console.

## Livello dati (`src/lib/content/`)

- Componenti e pagine importano solo da `~/lib/content`, mai da `astro:content`.
- `source-astro.ts` è l'unico file che legge le collection. Per passare a un CMS (Sanity) scrivi un modulo che restituisce `RawGame[]` e `RawStudio` e cambia l'import in `index.ts`.
- `derive.ts` contiene regole pure, calcolate al build:
  - **date a precisione variabile:** `2025`, `2025-08` o `2025-08-20`. Una data al giorno vale da quel giorno; mese e anno valgono solo a periodo concluso;
  - **stato per piattaforma:** released, upcoming o unannounced;
  - **CTA Steam:** Buy se uscito, altrimenti Wishlist;
  - **bottoni store:** solo per le piattaforme uscite;
  - **gioco in hero:** `featured`, altrimenti la prossima uscita datata, altrimenti il più recente;
  - **numero Entry:** in ordine di uscita;
  - **palette AA:** il colore viene corretto, con un warning nel build.
- `ORTICA_NOW=2027-01-01 npm run build` simula il sito a una data diversa.
- Lo stato è congelato al momento del build: dopo il sì serve un deploy hook giornaliero su Cloudflare.

## Aggiungere un gioco

1. Crea `src/content/games/<slug>.yaml` copiando un gioco esistente. Lo slug è il nome del file e diventa `/games/<slug>/` e `/press/<slug>/`.
2. Crea `src/assets/games/<slug>/` con i file elencati in [ASSETS.md](ASSETS.md). Va bene anche vuota: il build passa con placeholder.
3. Lancia `npm run build`. Non serve toccare componenti o pagine.

Note sui campi:
- i colori della palette vanno tra apici (`'#1d2b2a'`), perché `#` in YAML apre un commento;
- `consolePublisher` è un id di `publishers` in `studio.yaml`;
- `trailer.youtubeId` è l'id di 11 caratteri del video.

## Design

- Token in `src/styles/tokens.css`. Base quasi nera calda, grigi caldi, un solo accento: verde ortica `#a3ad6b`.
- Font: Instrument Serif per i titoli e IBM Plex Sans per l'interfaccia, entrambi OFL e self-hosted. Massimo due famiglie.
- Link interni sempre con `url()` da `~/lib/url`, mai `/percorso` scritto a mano: il sito deve funzionare anche sotto una sottocartella.
- Grana: SVG inline su `body::after` in `global.css`, mossa solo con `transform`; ferma con prefers-reduced-motion.
- Animazioni solo in opacità e lente. Con reduced motion non ce n'è nessuna.
- Palette dei giochi: custom properties su `<html>` (in `Base.astro`) con valori già corretti per AA.

## Come si verifica

1. `npm run build`: deve finire con `verify-dist: ... All rules pass.`
2. Screenshot a 360 px e a 1440 px: nessuno scroll orizzontale, bottoni store leggibili.
3. Lighthouse mobile su `npm run preview`: Performance e Accessibilità almeno 90. Lighthouse non è una dipendenza del progetto, va lanciato con npx.
4. Da tastiera: focus visibile; lightbox con frecce, Esc e focus che torna al thumbnail; trailer che non carica nulla da YouTube prima del click.
5. Dopo modifiche al template, prova ad aggiungere un gioco finto con asset e poi rimuovilo.

## Deploy

**Preview su GitHub Pages.** Il workflow `.github/workflows/pages.yml` parte a ogni push su `main`: build con `BASE_PATH=/<repo>/`, controlli di `verify-dist`, deploy. Va fatta una sola configurazione: Settings, Pages, Source impostato su GitHub Actions. Per provarla in locale: `BASE_PATH=/<repo>/ npm run build && BASE_PATH=/<repo>/ npm run preview`.

**Produzione su Cloudflare Pages.** Build command `npm run build`, output `dist`, Node da `.nvmrc` (oppure `NODE_VERSION=22.23.4`), nessun `BASE_PATH` (sito alla radice). `_headers` viene generato al build da `astro.config.mjs`.

`SITE_URL` è opzionale: abilita og:url e og:image assolute.

# Asset

Gli asset stanno in `src/` e non in `public/`, così passano dalla pipeline immagini di Astro: ridimensionamento, AVIF e WebP, `srcset`. Le immagini a piena pagina restano leggere anche se gli originali pesano molto.

`npm run assets` mostra quali file mancano per ogni gioco e se le dimensioni rispettano i minimi qui sotto. Il build passa anche con le cartelle vuote: al posto di ogni immagine mancante compare un riquadro neutro con le proporzioni giuste e un'etichetta.

## Regole

- Una cartella per gioco: `src/assets/games/<slug>/`, dove lo slug è il nome del file in `src/content/games/`.
- I nomi dei file sono fissi. L'estensione è libera tra `jpg`, `jpeg`, `png`, `webp` e `avif`.
- I loghi vanno in PNG trasparente. Non usare SVG: Astro li tratta come componenti e non come immagini.
- Carica sempre l'originale più grande che hai: Astro genera da solo le versioni ridotte.
- Il crop della key art si regola con `artFocus` nel file del gioco (es. `50% 30%`). Non serve ritagliare a mano.

## Per ogni gioco: `src/assets/games/<slug>/`

| File | Dove si vede | Proporzione | Minimo | Fonte consigliata |
|---|---|---|---|---|
| `key-art` | hero di home e pagina gioco (a tutto schermo), press kit, og:image | 16:9 (crop automatico) | 2560 x 1440 | Press asset ufficiali dello studio o del publisher. In alternativa la Steam library hero (3840 x 1240), che però è più larga e va ritagliata |
| `card` | griglia giochi in home, press kit | 2:3 | 600 x 900, meglio 1200 x 1800 | Steam library capsule (`library_600x900`, meglio la versione `_2x`) |
| `logo` | press kit (download) | libera, PNG trasparente | 1280 sul lato lungo | Steam library logo (PNG trasparente) o press asset |
| `trailer-frame` | copertina del trailer prima del click | 16:9 | 1280 x 720 | Un fotogramma esportato dal trailer ufficiale. Non usare la thumbnail di YouTube: va salvata come file locale |
| `screenshot-01`, `screenshot-02`, ... | galleria con lightbox, press kit | 16:9 | 1920 x 1080 | Screenshot della pagina Steam a dimensione piena, o press asset |
| `press-kit.zip` | download del press kit | | max 25 MiB | Zip ufficiale. Oltre i 25 MiB (limite di Cloudflare Pages) va ospitato fuori e il link messo in `pressKitUrl` nel file del gioco |

Gli screenshot si numerano con due cifre e appaiono in ordine numerico.

## Studio: `src/assets/studio/`

| File | Dove si vede | Proporzione | Minimo | Fonte |
|---|---|---|---|---|
| `logo` | press kit | libera, PNG trasparente | 1280 sul lato lungo | Studio Ortica |
| `team` | press kit (foto del team) | 3:2 | 2400 x 1600 | Studio Ortica |
| `press-kit.zip` | download del press kit dello studio | | max 25 MiB | Studio Ortica, oppure link esterno in `pressKitUrl` in `studio.yaml` |

## Dove scaricarli

1. **Press asset ufficiali** dello studio o di Dark Product. È la fonte migliore: alta risoluzione e uso autorizzato.
2. **Pagina Steam** di ogni gioco:
   - gli screenshot si aprono a piena risoluzione (1920 x 1080);
   - capsule, library hero e logo si trovano nella sezione asset della scheda dell'app su SteamDB, partendo dall'id della pagina Steam.
3. **Trailer:** esporta un fotogramma rappresentativo dal file del trailer.

I link alle pagine Steam vanno nei file dei giochi (`platforms[].url`). Non vanno costruiti per somiglianza: servono gli URL ufficiali.

## Checklist da scaricare

Spunta man mano, oppure rilancia `npm run assets` per vedere lo stato attuale.

### Loan Shark: `src/assets/games/loan-shark/`
- [ ] key-art (16:9, almeno 2560 x 1440)
- [ ] card (2:3, almeno 600 x 900)
- [ ] logo (PNG trasparente)
- [ ] trailer-frame (16:9, almeno 1280 x 720)
- [ ] screenshot-01 ... (16:9, 1920 x 1080)
- [ ] press-kit.zip oppure `pressKitUrl`

### Birds Watching: `src/assets/games/birds-watching/`
- [ ] key-art
- [ ] card
- [ ] logo
- [ ] trailer-frame
- [ ] screenshot-01 ...
- [ ] press-kit.zip oppure `pressKitUrl`

### The Old Flesh of Nuraga: `src/assets/games/the-old-flesh-of-nuraga/`
- [ ] key-art
- [ ] card
- [ ] logo
- [ ] trailer-frame
- [ ] screenshot-01 ...
- [ ] press-kit.zip oppure `pressKitUrl`

### Studio: `src/assets/studio/`
- [ ] logo (PNG trasparente)
- [ ] team (foto del team, 3:2)
- [ ] press-kit.zip oppure `pressKitUrl`

## Dopo aver aggiunto gli asset

- Rivedi `palette` e `artFocus` di ogni gioco sulla key art vera. Le palette attuali sono scelte sul tema del gioco e hanno un `TODO(verify)`.
- Rilancia Lighthouse mobile: con i placeholder Performance e Accessibilità sono a 100, con immagini sintetiche a dimensione reale restano a 100.

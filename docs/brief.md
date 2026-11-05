# Concept del sito di Studio Ortica

Brief originale di Ctrl Studio, salvato così com'è. CLAUDE.md rimanda qui invece di copiarlo.

Note di avvio progetto (decise con Ctrl Studio prima del codice):

- Nessun template Ctrl Studio, link o asset forniti: progetto da zero, link e asset come placeholder.
- PlayStation di Loan Shark: piattaforma senza data e senza bottone store finché la data non è nota.
- Dark Product associato come publisher console a Loan Shark e Birds Watching, con TODO di verifica per gioco.
- Card della griglia in 2:3 (Steam library capsule).
- Press kit per gioco su `/press/[slug]`.

---

## Cosa costruiamo e perché

Ctrl Studio (il mio studio digitale, ctrlstudio.it) vuole proporre un sito ufficiale a Studio Ortica, studio indie italiano di videogiochi horror. Costruisci un concept navigabile da mostrare loro in outreach. Ha due compiti. Il primo è convincerli a dire sì, quindi deve sembrare pensato per loro e non un template riadattato. Il secondo è diventare il sito vero dopo il sì senza rifarlo, quindi architettura, codice e accessibilità sono quelli di un sito in produzione, con sopra solo una modalità concept che si spegne.

Oggi Studio Ortica ha tre giochi usciti, un publisher console, una nomination e copertura stampa internazionale, ma nessun sito: l'hub è un Linktree. Chi arriva da stampa o social non trova un posto che racconti studio e giochi. Giornalisti, publisher e festival non hanno un press kit ufficiale. Il traffico si disperde tra gli store invece di andare verso wishlist e acquisti su Steam. La loro identità autoriale, che è il loro punto di forza, non ha uno spazio controllato da loro. Il sito risolve queste quattro cose.

La home deve rispondere in 5 secondi a tre domande:
1. Chi è Studio Ortica e che giochi fa?
2. Cosa posso giocare adesso e dove lo prendo?
3. Come resto aggiornato o li contatto per press e business?

## Lo studio

Dati presi da fonti stampa. Le voci segnate (da verificare) usale, ma metti un TODO nel sorgente accanto a ciascuna.

- Studio indipendente con sede a Torino, fondato nel 2025 da ex sviluppatori di produzioni AA
- Team: Nicola Dau, Luca Folino, Samuele Petrucci. Una fonte cita anche Tremotino (da verificare). Ruoli non noti
- Firma creativa: horror brevi e narrativi, da giocare in una sola sessione di 30-60 minuti, che prendono un'attività tranquilla di osservazione paziente (pesca, birdwatching, scavi) e la ribaltano in horror
- Engine: Godot
- Publisher console: Dark Product, Busan, Corea del Sud
- Canali: Substack di sviluppo, Steam, X, Bluesky, YouTube, Instagram, TikTok, Discord
- Comunicano in inglese con pubblico e stampa internazionali: il sito è in inglese

Giochi:
1. Loan Shark: fishing horror su un debito impossibile. Steam agosto 2025, Xbox Series gennaio 2026, PlayStation (data non nota), Switch in elenco su eShop (da verificare). Finalista Best Italian Debut Game agli Italian Video Game Awards 2026
2. Birds Watching: horror post apocalittico. Steam, PS5 e Xbox Series dal 20 agosto 2026. Switch da annunciare
3. The Old Flesh of Nuraga: Steam dal 27 agosto 2026

## Link e materiali

- Template Astro di Ctrl Studio: [percorso o repo, oppure cancella la riga]
- Pagine Steam dei tre giochi: [...]
- Pagine store console: [...]
- ID YouTube dei trailer: [...]
- Profili social e Substack: [...]
- Email press e business: [...]
- Cartella con gli asset già scaricati: [...]

Dove un link o un dato manca, non indovinarlo: niente URL Steam o handle social costruiti per somiglianza. Vale la regola dei placeholder qui sotto.

## Modalità concept

Finché è un concept, il sito non deve poter essere scambiato per il loro sito ufficiale né finire nei motori di ricerca:
- su ogni pagina un banner sottile, sempre visibile e non chiudibile, con il testo `Concept by Ctrl Studio, not the official Studio Ortica website` e un link a ctrlstudio.it
- meta robots noindex su ogni pagina e robots.txt con Disallow: /
- preview solo su un indirizzo pages.dev il cui nome dichiari che è un concept di Ctrl Studio (per esempio ctrlstudio-ortica-concept), mai un nome che possa sembrare il loro
- banner, noindex e robots dipendono da un solo interruttore nel codice, acceso di default, così dopo il sì si spengono con un commit deliberato e nient'altro cambia

Alcune regole non devono saltare mai, quindi falle controllare a uno script che gira dentro il comando di build e lo fa fallire. Con l'interruttore acceso: ogni pagina in dist ha banner e noindex, robots.txt esiste con Disallow. Sempre: nessun commento HTML nell'output, nessuna risorsa YouTube caricata dall'HTML prima del click. Così si ferma anche il build su Cloudflare.

## Dati mancanti e testi provvisori

Nessun dato inventato: niente citazioni, punteggi, recensioni, vendite, premi, prezzi, lingue o date che non siano in questo prompt. Due casi diversi:
- un dato che manca (prezzo, lingue, link, citazioni stampa, foto del team, zip del press kit) diventa un placeholder visibile. Il concept lo vedrà il cliente, quindi i placeholder devono sembrare previsti dal design, slot puliti con un'etichetta breve, non errori
- un testo che va scritto (manifesto, logline, descrizioni dei giochi, content warning, descrizioni per il press kit) scrivilo in inglese come bozza credibile, usando solo i fatti qui sopra, e segnalalo con un TODO nel sorgente: va validato da loro o sostituito con il testo ufficiale di Steam

I TODO stanno nei file di contenuto, nel frontmatter o nei commenti JSX di Astro, mai in commenti HTML. Per la durata nelle card puoi usare la fascia 30-60 minuti della firma dello studio, con un TODO per confermarla gioco per gioco. Le piattaforme sono etichette testuali, non loghi ufficiali delle console.

## Stack e architettura

- Astro con output statico, deploy su Cloudflare Pages. Nessuna dipendenza oltre Astro e ciò che Astro usa di suo. Se c'è il template Ctrl Studio, parti da lì e riusane componenti e convenzioni; se porta dipendenze in più, dimmelo nel piano prima di tenerle
- Contenuti in content collections: un file per gioco con schema tipizzato, più un file con i dati dello studio (team, sede, contatti, canali, publisher) che alimenta home, footer e press kit. Tra le collection e i componenti metti un livello di accesso ai dati con tipi tuoi: i componenti dipendono da quei tipi e non da astro:content, così il passaggio a Sanity dopo il sì tocca solo quel livello
- Aggiungere un gioco richiede solo un file di contenuto e una cartella di asset, senza toccare componenti. Il gioco in hero è di default il più recente o il prossimo in uscita, con un campo nel contenuto per forzarlo. Lo stato uscito o in arrivo si ricava dalle date al build e decide la CTA (Buy on Steam o Wishlist on Steam) e quali bottoni store compaiono
- Asset: una cartella per gioco con nomi file fissi (key art, immagine per le card, logo, screenshot numerati, frame per il trailer). Avevo pensato a /public/games/[slug]/, ma una key art a tutto schermo presa da Steam senza ottimizzazione non regge il target Lighthouse: se serve per passare dalla pipeline immagini di Astro, tieni le cartelle sotto src con la stessa logica. Il build deve passare con cartelle vuote o incomplete, mostrando placeholder neutri con le proporzioni giuste. Documenta in ASSETS.md nomi file, proporzioni, dimensioni minime e dove scaricarli (pagina Steam, press asset ufficiali)
- Palette per gioco: 2-3 colori nel file di contenuto, applicati come CSS custom properties sulla pagina del gioco
- Struttura pronta per l'i18n di Astro con l'inglese come unica lingua attiva e le stringhe di interfaccia in un solo posto
- CLAUDE.md nel repo con ciò che vale in ogni sessione: a cosa serve il progetto, stack e comandi, regole della modalità concept e dei TODO, come aggiungere un gioco, come si verifica. Salva questo brief in docs/ e rimandaci da CLAUDE.md invece di copiarlo

## Pagine

Home
- Hero: key art del gioco in evidenza a tutto schermo, titolo, logline, CTA primaria verso Steam e secondaria Watch trailer (stessa regola del facade qui sotto). Nome dello studio e una frase sulla loro formula
- Manifesto: 2-3 righe sulla firma dello studio
- Griglia giochi dal più recente: card con key art, titolo, durata indicativa, piattaforme, link alla pagina del gioco
- Riconoscimenti e stampa: Loan Shark finalista agli IVGA 2026, più slot per citazioni stampa reali, vuoti finché non arrivano frasi verificate con fonte
- Newsletter: CTA verso il loro Substack, link esterno
- Contatti: sezione in home e nel footer, nessuna pagina dedicata

Pagina gioco, template unico /games/[slug]
- Hero con key art, titolo, logline e bottoni store solo per le piattaforme dove il gioco è uscito; se il link manca, bottone disattivato e TODO
- Trailer YouTube con facade: immagine locale dalla cartella asset (la thumbnail di YouTube sarebbe già una richiesta a YouTube), iframe youtube-nocookie creato solo al click
- Descrizione in 2 paragrafi
- Scheda rapida: durata, prezzo indicativo, piattaforme, data di uscita per piattaforma, lingue, publisher console
- Galleria screenshot con lightbox scritto a mano: navigazione da tastiera, Esc per chiudere, focus che torna dove era
- Content warning testuale sui temi del gioco
- Link al press kit del gioco

Press kit, /press
- Ispirato a presskit(), il formato standard nel mondo indie: factsheet dello studio (fondazione, sede, team, contatti), descrizione breve e lunga, giochi con link ai rispettivi press kit, slot per loghi e foto del team, contatto press
- Download zip per gioco, placeholder finché non c'è il file

Footer di ogni pagina: social, contatto press, contatto business, publisher console, link a /press, nota concept.

## Design

Horror d'autore e sobrio: atmosfera grigia e industriale, grana lo-fi, molto spazio negativo. I loro giochi nascono dall'osservazione paziente e il sito deve avere lo stesso passo: niente sangue, font gotici o glitch. Base scura neutra, quasi nero e grigi caldi, con un solo accento per lo studio; i colori forti arrivano dalle key art e dalle palette dei giochi.
- Massimo due famiglie self-hosted: un sans neutro per l'interfaccia e un display con carattere per i titoli, con licenza che permetta il self-hosting
- Grana come overlay CSS leggero, che non pesi sul rendering
- Animazioni minime: transizioni lente in opacità, niente flash né movimenti bruschi. Con prefers-reduced-motion nessuna animazione e grana statica
- Colori, spaziature e font come custom properties in un unico file di token
- Contrasto AA su tutti i fondi scuri, anche dove testo o bottoni prendono i colori della palette di un gioco

## Quando è finito

- Dalla home il gioco in hero porta a Steam in 1 click, ogni altro gioco in massimo 2
- /press è raggiungibile dal footer di ogni pagina
- Nessuna risorsa YouTube caricata prima del click sul trailer
- Aggiungere un gioco richiede solo un file di contenuto e una cartella asset: provalo con un gioco finto e poi rimuovilo
- A 360 px nessuno scroll orizzontale e bottoni store leggibili senza zoom
- Lighthouse mobile: Performance e Accessibilità almeno 90 con gli asset placeholder (li ricontrollerò con quelli reali)
- Focus visibile da tastiera ovunque, lightbox chiudibile con Esc
- Banner, noindex e assenza di commenti HTML garantiti dallo script di build
- Nessun testo, numero o citazione fuori dai dati di questo prompt che non sia marcato come placeholder o bozza

Verifica tu ciò che puoi con gli strumenti che hai: build, script, screenshot a 360 px e desktop, Lighthouse se disponibile. Ciò che non riesci a verificare dimmelo, invece di darlo per fatto.

## Come procedere

Prima del codice mandami un piano breve: struttura del progetto, schema dei contenuti, nomi file degli asset, cosa riusi del template, e la direzione visiva (coppia di font, colore d'accento, come realizzi la grana) con il motivo delle scelte. Aspetta il mio ok, poi costruisci.

Alla fine dammi: cosa hai verificato e come, cosa resta da verificare, l'elenco dei TODO raccolti dal sorgente (meglio uno script che posso rilanciare) e la checklist degli asset da scaricare. Il progetto deve essere pronto per Cloudflare Pages; prima di pubblicare qualsiasi cosa chiedimelo.

## Fuori scope

CMS, form propri di newsletter o contatto, versione italiana, dominio e analytics.

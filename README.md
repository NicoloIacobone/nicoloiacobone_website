# nicoloiacobone

Sito web personale di Nicolò Iacobone: 3D computer vision e robotica.

HTML, CSS e JavaScript puri: nessun framework, nessun build step, nessuna dipendenza. Pubblicato con
[GitHub Pages](https://pages.github.com/) dal branch `main` su
[www.nicoloiacobone.it](https://www.nicoloiacobone.it).

Il sito segue il design system in `../design-system/` (fuori da questo repository). Le regole per
chi lo modifica, persona o agente, sono in `CLAUDE.md`.

## Funzionalità

- **Una fila di schede da scorrere di lato.** La home è un binario: hero, Profilo, i sei progetti
  principali, gli altri otto progetti, Oltre, Contatti. Ci si muove con lo swipe, i due bottoni
  della barra, le frecce, la rotellina del mouse e le voci della nav.
- **Schede che si aprono.** Ogni progetto e ogni interesse parte come poster (nome disegnato e
  copertina) e si apre sui dettagli al passaggio del mouse, al tocco o con la tastiera.
- **Dossier.** Ogni progetto ha un dossier: il bottone «Approfondisci» allarga la scheda a tutto
  schermo. Ogni dossier ha il suo indirizzo, lo stesso del sito precedente (`#p-vggt`, `#p-sam2`, …),
  più `#p-rgbd`. Si chiude con il bottone tondo, Esc, Indietro o «← Tutti i progetti».
- **Lo stage della hero.** Una point cloud con un braccio robotico, che si ruota trascinandola o con
  le frecce quando ha il focus.
- **Italiano e inglese.** Italiano se la prima lingua del browser è l'italiano, inglese altrimenti.
  Lo switch salva la scelta in `localStorage` (chiave `lang`).
- **Tema chiaro e scuro.** Segue il sistema; lo switch salva la scelta in `localStorage` (chiave
  `theme`). Tema e lingua sono applicati nel `<head>`, prima del primo paint.
- **Senza JavaScript** il binario scorre comunque, le schede si aprono al passaggio e al focus, le
  voci della nav portano alle sezioni e l'indirizzo `#p-…` mostra il dossier.
- **Movimento ridotto**: con `prefers-reduced-motion` il binario salta e i dossier si aprono senza
  animazione.
- **Privacy by design.** Nessun cookie, nessuna analytics, nessuna risorsa da altri host: font,
  immagini e video sono serviti dal sito. L'unico storage è `localStorage` per tema e lingua.
  L'informativa è in `privacy.html`, linkata dal pannello Contatti: se aggiungi analytics, embed o
  risorse esterne, va aggiornata e potrebbe servire un banner.

## Struttura

```
index.html                     la home: binario, schede, i 14 dossier, i disegni in SVG inline
ds/tokens.css                  ← copia di ../design-system/tokens.css: non si modifica qui
ds/components.css              ← copia di ../design-system/components.css
ds/components.js               ← copia di ../design-system/components.js (schede, lingua, dossier)
ds/fonts/                      Nunito, Nunito Sans, JetBrains Mono (woff2) con le licenze SIL OFL
css/track.css                  layout della home: binario, hero, pannelli, barra, altri progetti
css/stage.css                  lo stage della hero
css/drawings.css               colori dei disegni di vggt e RGB-D, chiaro e scuro
js/track.js                    il binario, la barra, i cinque modi di muoversi, il tema, NI.goStop
js/stage.js                    lo stage: point cloud e braccio, trascinamento e frecce
media/                         immagini e video dei dossier (i video si caricano solo al play)
favicon.svg                    il monogramma NI
imgs_and_docs/CV.pdf           curriculum scaricabile
imgs_and_docs/foto_profilo.jpeg
privacy.html                   informativa privacy e cookie (IT/EN nel markup)
rubik/                         ← viene da doppelbot (web/rubik): vedi «Vincoli con rubik/» prima di toccarla
rubik/vendor/                  OpenCV.js (Apache-2.0) e cubejs (MIT), con le loro licenze
CNAME                          dominio personalizzato
CLAUDE.md                      regole per gli agenti, da ../design-system/AGENTS.md
```

L'ordine di caricamento conta: `js/track.js` prima di `ds/components.js`, perché `NI.dossiers()`
usa `NI.goStop()` definito dal binario.

Restano nel repository, ma la home non li usa più:

```
css/style.css, fonts/, js/main.js   usati solo da privacy.html
css/home.css                        stili della home precedente
js/dossiers.js, js/eggs.js          dossier ed easter egg della home precedente
js/travels.js, js/world-map-data.js mappa interattiva dei viaggi (non c'è più nella home)
imgs_and_docs/projects/             figure dei dossier precedenti (le nuove sono in media/)
imgs_and_docs/campione_grandioso.png, shrek_2.jpg, pesce_foto.jpeg, tatuaggio.jpeg
```

Attenzione: anche se nessuna pagina li collega, questi file restano pubblici al loro indirizzo.

La pagina `rubik/` usa la fotocamera solo nel browser: le immagini non lasciano il dispositivo
(vedi `privacy.html`, sezione 3). I suoi testi IT/EN stanno in `rubik/js/i18n.js`.

### Vincoli con `rubik/` e `privacy.html`

`rubik/` viene da doppelbot (`web/rubik`, copiata da `sh web/publish.sh`), ma dipende da questo
sito: carica `../ds/tokens.css`, `../ds/components.css` e `../favicon.svg`. La grafica nuova di
`rubik/` (Nav, pulsanti e footer del design system) è stata fatta qui, nel sito, e **non è ancora
in doppelbot**: un `publish.sh` lanciato adesso riporterebbe la grafica vecchia, che cerca
`../css/style.css`. Prima di pubblicare di nuovo da doppelbot, porta lì `rubik/index.html` e
`rubik/css/rubik.css`.

Gli script di `rubik/` cercano `.langswitch__btn`, `#themeToggle` e gli id della pagina: i
pulsanti della Nav portano entrambe le classi (`ni-lang__btn langswitch__btn`).
Niente `transform`, `filter` o `contain` su `html`, `body`, `main`, `.wrap`: romperebbero il
`position: fixed` della modalità a tutto schermo sui telefoni.

`privacy.html` carica ancora `css/style.css`, `fonts/` e `js/main.js`: sono rimasti solo per lei.

Le pagine condividono le chiavi `theme` e `lang` di `localStorage`, quindi tema e lingua scelti
nella home valgono anche lì.

## Sviluppo

Nessuna build richiesta: servire la cartella con un server statico, per esempio
`python3 -m http.server`. Da `file://` i dossier e lo stage funzionano, ma il risolutore di `rubik/`
no.

### Modificare la home

La home è montata da `../design-system/examples/home.html`. Le regole sono in
`../design-system/README.md` e in `../design-system/docs/`.

- **Disegni** (nomi disegnati, copertine, titoli dei dossier): non si ridisegnano a mano. Si cambiano
  con gli script di `../design-system/tools/`.
- **Dossier**: i file sono in `../design-system/dossiers/`, uno per progetto, già nelle due lingue.
  In `index.html` sono montati così come sono, dopo il binario.
- **`ds/`**: si cambia prima in `../design-system/`, poi si ricopia.
- **Indirizzi del sito precedente**: `#hero`, `#projects`, `#research` e `#path` portano alla sezione
  corrispondente (tabella `OLD` in `js/track.js`). Gli indirizzi `#p-…` aprono il dossier.

**Regola sui contenuti:** numeri e figure solo se verificati nel CV o nelle repository. Un'immagine
di un progetto upstream dichiara autore e licenza; uno schema porta l'etichetta «Schema
illustrativo». Non si confrontano misure di protocolli diversi.

### Modificare i testi

Ogni testo ha le due lingue affiancate nel markup, in due elementi con la classe `only-it` e
`only-en` e il loro attributo `lang`. Le etichette per i lettori di schermo stanno in
`data-label-it` e `data-label-en`. Il dizionario `I18N` di `js/main.js` serve solo a `privacy.html`.

### La mappa dei viaggi

La mappa interattiva non è più nella home. La scheda «Viaggi» è un disegno statico: cambiare
`js/travels.js` non la aggiorna, si ridisegna con `../design-system/tools/personal.py`.

# Rules for any agent that changes the site, a README or the GitHub profile of Nicolò Iacobone

Copy this file to the root of the site repository as `CLAUDE.md` (Claude Code reads it at the start of every session) or `AGENTS.md` (other agents). Keep the folder `../design-system/` reachable from there and fix the paths below if it moves.

Talk to Nicolò in Italian. Write code, comments and commit messages in English.

## Before any change

Read `../design-system/README.md`, then the part of `../design-system/brand-book.md`, `voice.md` and `docs/` that covers what you are about to touch. Do not work from memory of an earlier session, and do not infer a rule from the look of the page: the rule is written down, or it does not exist yet.

## The idea, in six lines

1. Two parts. The shell is neutral and round, the same everywhere: greys and near-black, no colour of its own. The matter is what gives a page its colour and character, and each main project brings its own.
2. A matter is drawn from what the project really outputs: points, patches, links, landmarks, a dot pattern, stickers. It is never decoration chosen for its look.
3. Real beats drawn. A frame, a recording or a figure from a real run replaces a drawing as soon as it exists. A drawing made for the site says "Illustration, not data".
4. A number never stands alone: it carries its unit and what it was measured on.
5. Equals: light and dark, Italian and English. Neither is a variant of the other.
6. Nothing borrowed: no game art, no film character or poster, no club crest, no vendor logo.

## What kind of change is it?

Decide this first, and say it to Nicolò in one line before you start.

| Kind | What you do |
|---|---|
| **Content.** A text, a number, a link, a date, a new line in the path. | Follow `voice.md`. Write it in both languages. Take numbers only from the README of the repository or from the CV. Text you write is a draft: say so, and wait for his yes before it goes live. |
| **A new project, or a project that becomes a main one.** | A main project needs a matter: follow "Making a new matter" in the brand book, and show him the drawn name and the cover before building the card. Any other project uses `MatterDots` and `ink`. Its card, page, README and profile line carry the same title, sentence and numbers. |
| **A new interest in Beyond.** | A personal matter: no text colour, drawn from the activity itself, a drawn name for the closed tile. Show him the drawing first. |
| **Something the system already covers.** A new card, a new section, a table, a figure, a button. | Use the existing component and its page in `docs/` or in the brand book. Use tokens only: no new colour, font, radius, shadow or spacing value written into the site's CSS. |
| **Something the system does not cover.** A new kind of block or page. | Build it from the existing tokens and the nearest component. Then tell him what you had to decide, as a short list, so the rule can be written down. |
| **Something that goes against a rule.** | Do not do it silently, and do not refuse. Name the rule, say what would break, propose the nearest thing that fits the system, and ask. If he confirms, the rule changes first (see below), then the site. |

## Who may change the design system

- **While the site is being rebuilt**, until Nicolò says the rebuild is closed: nobody working in the site repository. Read `../design-system/` and copy from it, never edit it. It is still being changed from the design system project on claude.ai, and an edit made here would be lost at the next update. If you find a defect in it, or a request needs a rule changed, list it for Nicolò and go on: he brings it there.
- **After the rebuild is closed**: you may change it, in the order given under "When a rule changes", with one limit. Some files are written by the scripts in `../design-system/tools/` and must be changed through their script, never by hand: `tokens.css` (from `tokens.json`, by `gen_tokens.py`), the blocks "LangSwitch", "PosterCard", "MiniCard" and "Dossier" of `components.css` and all of `components.js` (from `lang.py`, `poster.py`, `mini.py`, `dossier.py`), everything in `examples/` and `dossiers/`. `banners/` and `social/` are exports: do not edit them. If you cannot run the script, do not patch the file: write what should change in `DECISIONS.md` under a heading "To bring into the system" and tell Nicolò.
- The hand-written files are yours to edit after the rebuild: `brand-book.md`, `voice.md`, `docs/`, `templates/`, `DECISIONS.md`, `README.md`, and the part of `components.css` above the block "LangSwitch".

## When a rule changes

The design system is the source of truth, and the site follows it. This applies once the rebuild is closed: see above.

1. Add the decision to `../design-system/DECISIONS.md`: the date, what he decided, in his words where you have them.
2. Change the rule in `brand-book.md`, `voice.md` or the page in `docs/`. Change `tokens.json` for a value, then run `tools/gen_tokens.py`.
3. Only then change the site. `tokens.css`, `components.css` and `components.js` on the site are copies in `ds/`: change them in `../design-system/` and copy them over. Never let the two drift apart.

The design system on claude.ai (https://claude.ai/artifact/LRTCr4V1f5QrRf8uBwSB4y, private to him) holds the same rules with live previews. This folder cannot update it: when a rule changes here, tell him, so he can have it updated there too.

## Never, unless he says so in that same request

- A phone number, a home address, a date of birth, anything about money or salary, anything about job applications.
- A GitHub link to a repository he has not confirmed as public. Today doppelbot is not: it shows "GITHUB LINK PENDING".
- A resource loaded from another host: fonts, scripts, analytics, embeds. No cookies.
- A matter colour on the shell: the `Nav`, the buttons, the `LangSwitch`, the `Footer`.
- Two matters on one page, except the home page.
- An em dash, an inflated adjective, an emoji, a number without its protocol.
- A translated drawn name, project name, tool name or metric name.
- A push to `main`, a merge or a deploy without his explicit yes. `main` is live.
- A change to `rubik/`: it is copied from another repository. Keep what it loads from the site working.

## Before you say it is done

- Light and dark, Italian and English, 1440px and 390px.
- Keyboard: every control reachable, the focus ring visible, cards open on focus.
- Reduced motion set, and JavaScript off: the page still reads.
- The console is clean and no request leaves the site.
- Text contrast is at least AA on the ground it sits on. A new coloured ground needs the check again.
- A page of the design system that describes what you changed still tells the truth. If not, fix the page too.

Then report: what changed, which rule each change follows, what you decided on your own, what you could not verify.

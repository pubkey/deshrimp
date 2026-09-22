# Visitenkarten

Business cards to hand across the desk to whoever sits crooked, so they open
deshrimp. Five ideas, each with a front and a shared back, drawn with nothing
the design system does not already have: the six colours, IBM Plex Sans and
Mono, hairlines instead of shadows, the mark from `public/brand/mark.svg`.

His request, verbatim: „Design Visitenkarten die ich im Büro den Leuten die
schräg da sitzen geben kann, damit die deshrimp benutzen. mehrere ideen".

## The five

| id | front | why |
| --- | --- | --- |
| `diagnose` | The camera well at the moment of a breach: 3px coral stroke, `23°` in coral, `Grenze 18°`, „Gemessen von schräg gegenüber" | The product's one dramatic moment, as a reading taken of the recipient. „Schräg gegenüber" is both where the sender sits and how the recipient does. |
| `satz` | „Sitz aufrecht du Garnele!" set large, the mark, the address | His sentence. Nothing to explain. |
| `streifen` | The sixty-bar status strip for the hour just gone, two runs of coral, „Du hast es nicht gemerkt." | The product's signature visual, read as an accusation. |
| `furz` | The settings tile: `Ton bei Signal` with `Furz` selected, `Takt 1 s` | Dead serious about the default. The loud one; hand it to whoever can take it. |
| `zettel` | The light inversion, with rules for a pen: `Für`, `Von`, `Schräg seit __:__ Uhr`, „Nichts Persönliches. Nur ein Winkel." | A note passed across the desk rather than a card handed over. |

The back is the same on all five: mark and wordmark, the one-line description
from `seo.json`, the address in mono, and a QR code to `deshrimp.com/de.html`.
The QR points at the German page rather than the root because the card is
handed over in a German office: a URL that says `de.html` opens German
whatever the phone's language is. It sits on a light plate on the dark cards
because inverted codes are not read by every camera app.

No emoji on the cards. The page title keeps its shrimp by his recorded
decision, but the card has the mark, and a colour emoji is a font a print
shop does not have.

## Files

```
visitenkarten.html   the source: open it in a browser to see every idea
render.mjs           writes out/ with Chromium
out/<id>.pdf         two pages, front then back, ready for a print shop
out/<id>.png         the pair side by side, for looking at
out/alle.pdf         all ten pages in one file
out/alle.png         the overview
out/visitenkarten.html  the source with the fonts and the QR codes inlined,
                        one file that opens anywhere
```

`out/` is committed, so nothing needs to run to get a PDF. To change a card,
edit the source and run:

```bash
node print/visitenkarten/render.mjs          # every idea
node print/visitenkarten/render.mjs satz     # one of them
```

Node 22.18 or newer (it imports `src/ui/qr.ts` directly, so the card and the
share sheet encode the same code the same way) and a Chromium, found through
`$CHROMIUM` or the usual places. Nothing is installed by npm for this.

## For the print shop

- Trim **85 × 55 mm**, the German standard.
- Every page in the PDFs is **91 × 61 mm**: the trim plus 3 mm of bleed on
  each side. The ground colour runs out to the edge; nothing that matters
  is closer than 5 mm to the cut. No crop marks, which is what the online
  printers ask for.
- Colours are sRGB hex as the design system locks them. The slate ground
  `#0F172A` is a heavy full-tone fill; ask for a matte or soft-touch
  laminate, which is also what keeps the dark cards from showing
  fingerprints. The coral `#ff8257` sits at the edge of what CMYK can do;
  if the proof comes back dull, that is the one colour to check.
- The fonts are embedded (subsetted IBM Plex Sans and Mono), so the PDFs
  need nothing installed.
- The `zettel` card is white; order it on uncoated stock so it takes a pen.

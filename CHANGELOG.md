# Changelog - deshrimp

Entries up to 2026-09-09 were written while this app lived inside a private
knowledge-base repository, built by a page generator rather than by a normal
bundler. They are copied here unchanged rather than rewritten, because a
reconstructed history is worse than an awkward one - but note that paths and
build commands they mention belong to that older setup, not to this project.

They were also written in German, and were translated on 2026-09-19 when the
rest of the repo was. Translating is not rewriting: every entry says what it
said before, and his own requests inside them are still quoted in the German he
wrote them in.

## 2026-10-19 - the sound picker shows prices

### New
- **The sound list is drawn by the page, not the browser** _(his call,
  verbatim: „make a custom select-component so in the dropdown for the sounds
  we can dispplay the shrimpcoin price of the sounds etc.")_. Every locked
  sound now shows a lock and its price with the coin beside it, the way every
  Shrimpcoin number is shown; before, a native `<option>` could only say
  „locked" in words. Picking a locked sound still opens the unlock dialog.
- `<Listbox>` in `src/ui` is the component behind it: a WAI-ARIA listbox with
  the keys a native select has (arrows, Home, End, Enter, Space, Escape, a
  letter to jump), drawn on the page body so a tile cannot clip it, opening
  upwards when there is no room below.

### Left out on purpose
- **The other select stays native.** The chart window picker has nothing to
  show but words, and on a phone the system picker is better than anything
  drawn.

## 2026-10-18 - the parking sensor

### New
- **An eighth sound, the parking sensor** _(his call, verbatim: „mach auch nen
  sound "mwo es klingt wie die biepser beim auto beim einparken")_. It runs on
  the Geiger counter's machinery and scale, but beeps evenly instead of
  clicking at random: one beep a second from borderline, about every 0.6 s on
  the limit, closing up to every 0.12 s, and from twice the limit one solid
  tone, the way a car sounds just before the wall. A 1.6 kHz sine, 70 ms a
  beep, with soft edges so it does not click.
- A beep keeps its rhythm across readings: the next one comes a gap after the
  last one heard, not the moment a new reading lands. The solid tone is one
  held oscillator rather than beeps laid end to end, which would click at
  every seam.
- „Anhören" closes the beeps up over three seconds and ends on the solid tone.
- Settings schema v17 widens the sound enum, for this and the Geiger
  counter together. Nobody is moved onto it.
- Same rules as the Geiger counter: audible from borderline, no volume ramp,
  no extra one-off sound on a bad reading.

## 2026-10-17 - the Geiger counter

### New
- **A seventh sound, the Geiger counter** _(his call, verbatim: „mach einen
  "Geiger" sound wo ein geigerzähler schneller oder langsammer wird je nachdem
  wie weit man falsch sitzt")_. Unlike the others it is not one noise per bad
  reading: it ticks the whole time, and the rate is how far off he sits. Silent
  while he sits straight, about 1.5 random clicks a second from the moment a
  reading turns borderline (70 % of a limit), about 3 a second on the limit,
  and 40 a second, a near-continuous rattle, at twice the limit. The worst of
  the three measures decides, the same share `judge()` uses.
- The clicks are spaced at random like real decays and made with Web Audio,
  so there is no file to fetch. They are scheduled 1.2 s ahead, which keeps
  the crackle steady in a background tab, and a new reading takes the queued
  clicks back, so sitting up silences it at once rather than a second later.
- „Anhören" plays the whole range once in three seconds, slow to fast.
- The settings schema change it needs is v17, shared with the parking
  sensor.

### Left out on purpose
- **No volume ramp.** The other sounds start quiet and get louder over four
  bad readings; here the rate already is the escalation, and a counter that
  also changes volume blurs the one thing it is saying.
- **Borderline is audible**, which no other sound is. A counter that only woke
  up at the threshold would be a beep with extra steps; hearing it speed up as
  he slumps is the point. Vibration and the notification still only fire on a
  bad reading.

## 2026-10-18 - whole coins, a steeper ladder, a snackbar

### Changed
- **A Shrimpcoin does not split** _(his call, verbatim: „make shrimpcoins
  nondevisable. instead of givinng 0.1 per second, give one full every 10
  measurements")_. Every ten straight readings pay one whole coin, counted
  across crooked ones; the streak bonus of one more for ten in a row stays,
  so ten in a row pay two. This replaces 0.1 coin per second (2026-10-17)
  and makes the pay follow readings, not seconds: at the default one reading
  a second it is the same 12 a minute, at a slower pace it is less. Amounts
  are still stored in tenths, each payout a multiple of ten, and are shown
  rounded down to whole coins, so a device that earned fractions under the
  old rule never shows a coin it cannot spend. `?debugcoins` rounds to whole
  coins too.
- **The prices are steeper** _(his call, verbatim: „mach die preise
  steiler")_: ahem 50, scream 150, knuckle crack 500, whip crack 1,500,
  rimshot 5,000. Each step roughly triples, so the sounds unlock after about
  4 minutes, 17 minutes, 1 hour, 3 hours and 10 hours of straight sitting.
  The first stays at four minutes, as he asked. The target curve against the
  old ladder is `research/shrimpcoin-unlock-curve.png`.
- **Unlocking follows usage time, not days** _(his call, verbatim: „das
  freischalten soll nicht pro tag sondern pro nutzungszeit relevant sein. dh
  wenn jjemand 4h am tag das nurzt soll er auch mehr freischalten")_. It
  already did: there is no daily cap, and coins come from straight readings
  alone. What changed is the framing: the chart and the notes no longer give
  "day N" figures, which read like a calendar gate.

### New
- **Every payout shows in a snackbar** _(his call, verbatim: „whenver
  shrimpcoin is earned, show it in a snackbar")_, at the bottom of the page
  for two and a half seconds. It always says what the coins are for _(his
  call, verbatim: „in der snackbar soll immer stehen wofür die coins gewonnen
  wurden")_: "+1 · 10× sitting straight", "+1 · 10 in a row", or "+2" with
  both when one reading completes both counts. At the default pace that is about every ten seconds.
  Its own element rather than the shared toast, because the toast is plain
  text and every coin number carries the coin. A newer payout replaces it, and
  it is not read out by screen readers, which would otherwise announce a coin
  every ten seconds. The label is in all thirteen languages.
- **20 Shrimpcoin for every day the page is visited, except the first**
  _(his call, verbatim: „jeden vollen tag wo der nutzer die seite besucht
  gibts es 20 free coins. auser am ersten tag.")_. Counted by calendar day on
  the device: the first day a device opens the page pays nothing, every later
  day pays 20 once, on the first visit. The page checks on load and once a
  minute, so a tab left open over midnight collects the new day too. Days
  without a visit pay nothing and are not paid back. A device that already
  has history takes its oldest day as its first, so it collects from today.
  The coins are booked into today's day row like any other, and the snackbar
  says "+20 · daily bonus". Settings schema v16 keeps the first day and the
  last day paid.

## 2026-10-18 - sounds cost Shrimpcoin

### Changed
- **Only the fart is free; every other sound is unlocked with Shrimpcoin**
  _(his call, verbatim: „nur der furzsound ist umsonst. die andern müssen mut
  shrimpcoins freigeschaltet werden")_. The prices are a ladder in the order
  the select lists them, doubling each step: ahem 50, scream 100, knuckle
  crack 200, whip crack 400, rimshot 800. He named no prices, so these are a
  first guess to tune. At one reading a second, sitting straight earns 12 a
  minute (6 by the second, 6 in streak bonuses), so the sounds unlock after
  about 4, 8, 17, 33 and 67 minutes of straight sitting. The first one lands
  after about four minutes, which is what he asked for _(„erster sound soll
  nach 4 minuten ca drin sein")_. An earlier note here said 2 a minute; that
  was a miscalculation that left out the streak bonus.
- **The select is the shop.** A locked sound stays in the list, marked as
  locked. Picking it opens a dialog with the price, what you have and how much
  is missing if anything. Unlocking spends the coins and switches to the sound
  in one step.
- **No free preview** _(his call, verbatim: „vor dem kauf kann man den sound
  nicht gratis hören")_. The dialog had a "Listen" button for the locked
  sound; it is gone, so a sound is first heard once it is bought. The
  "Listen" beside the select still plays the sound that is picked, which is
  always one already owned.
- **"Pick the sound" says so**, in all thirteen languages: only the fart is
  free, the others are unlocked with the Shrimpcoin earned by sitting straight.
- **The purse shows what there is to spend**: everything earned less what
  unlocking has cost. The earned coins in the day rows are never touched;
  the spending is its own number in the settings.

- **`?debugcoins=500` hands a device 500 Shrimpcoin** for testing the shop
  _(his call, verbatim: „add einen debug url parameter mit dem du dir coins
  geben kannst um das kaufen zu testen")_. It is booked as negative spending,
  so the day rows still only hold what was sat for, and the parameter is
  taken out of the address once applied, so a reload does not pay twice. It
  is not hidden: anyone who reads this can give themselves coins, which on a
  page where the coins buy nothing but a noise is fine.

- **Every Shrimpcoin number has the coin beside it** _(his call, verbatim:
  „immer neben shrimpcoin zahlen muss das logo stehen")_: today's coins
  under the purse, the price, the balance and the shortfall in the unlock
  dialog. The sentences that carry an amount are built from pieces instead
  of one string, in all thirteen languages, so the amount can be the coin
  and its number while each language keeps its own word order.
- **The sound list says "locked" instead of a price.** A native `<option>`
  is drawn by the platform and can hold text only, so a price there would be
  a number without its coin. The price, with the coin, is in the dialog that
  picking a locked sound opens.
- The debug toast no longer names the amount, for the same reason: a toast is
  plain text. The purse shows the new balance with its coin.

### Kept
- **Whatever sound a device already uses stays unlocked for free** (settings
  migration v15). Taking away the noise someone picked, the morning after an
  update, is not what the change is for.

### Decided against
- **No Shrimpcoin for breaks** _(his call, verbatim: „wir können pausen nicht
  wirklich trakcen, da soll es nicht belohnt werden")_. The research in
  `research/idle-game-reward-curves.md` proposed a bonus for coming back after
  a break and a per-bout cap that resets on one. The camera cannot tell a
  break from leaning out of frame or covering the lens, so a break bonus would
  pay for whatever empties the picture. Neither is built; the report records
  the decision.

## 2026-10-17 - Shrimpcoin

### New
- **The Shrimpcoin** _(his call, verbatim: „gamification soll machen dass die
  leute die app direkt beim kennenlernen und länger und öfter benutzten",
  „im ersten schritt machen wir nur ein "Shrimpcoin"", then „mach jetzt den
  shrimpcoin")_. The rules are his, settled one by one:
  - 0.1 coin per second sitting straight, not per reading _(„ja pro sekunde
    anstatt pro messung")_. A straight reading is paid for the seconds since
    the reading before it, capped at the pace, so a long pause pays one
    interval and pressing "Check now" twice in a second pays one second.
  - 1 coin extra for every ten straight readings in a row, as often as it
    happens _(„mach 10er serie anstatt 7er serie. ja die serie geht unendlich
    oft")_.
  - Only "good" counts _(„es zählt nur good als gerade")_, and only when the
    model is sure enough to sound the alarm too.
  - Nobody in the picture earns nothing and breaks the streak _(„bilder ohne
    person zählen gar nichts", „bildre ohne person brechen die serie ab")_.
- **The coin is his design**: Bitcoin's two strokes through a white 🍤 on
  `#E29A86`, tilted 14° like the ₿ _(„nimm gekippt")_. It sits under the start
  button with the total, today's share and the streak towards its next bonus,
  in zen and on the dashboard. It is the one coral shape that is not a breach,
  noted as such in `DESIGN.md`.
- **The plural is Shrimpcoin too** _(his call, verbatim: „isnt the plural also
  Shrimpcoin")_: "12.3 Shrimpcoin", the way one says 12.3 Bitcoin or 5 Euro.
  The name is the same in all thirteen languages.
- **Coins are stored per day**, in tenths, in the day rows that are kept
  forever (schema v3). Days before today start at 0 rather than being paid
  after the fact. The field is optional, so an older backup or a device still
  on the previous version can still write its days.

## 2026-10-17 - the angles under the picture

### Changed
- **The three angles and the confidence sit in the camera tile, right under
  the picture** _(his call, verbatim: „das headinfront sidelean etc muss in die
  erste bix direkt unter das video")_. They had a tile of their own beside the
  controls; now the number and the picture it was read from are one glance.
  Zen is two tiles instead of three.
- **The four values are there before the first reading too**, each a plain
  "-", so the tile does not grow when the first reading lands (his rule of
  2026-09-15). Four to a row where the tile is wide enough.

- **The side of a lean is an arrow** _(his call, verbatim: „sidelean should
  show arrow instead of "to the right"")_: `←` or `→` under the side-lean
  value, the same pair the day table already used, and nothing when the
  shoulders are level.
- **"Head in front" is "Front"** _(his call, verbatim: „write "front" instead
  of headinfront")_, and the same one short word in the other twelve: Vorne,
  Delante, Avant, Avanti, 前傾, წინ, Voren, Przód, Frente, Вперёд, Ön, 前倾. It is
  one label, so the chart legends that name this angle say it too.

### Removed
- **The "No reading yet" empty state** and its two labels in all thirteen
  languages: the readout it stood in for is now always drawn.
- **The confidence value** _(his call, verbatim: „entfern den confidence
  kpi")_. Three values under the picture instead of four, which also lets
  them keep the full 32px figure on a phone. The model's confidence is still
  stored with every reading. Its three labels (`statConfidence`,
  `computedLocally`, `modelLoading`) go from all thirteen languages, and so
  does `sideLabel`, which the arrow replaces.

## 2026-10-17 - a new palette, light by default, with a dark twin

### Changed
- **The whole app is five colours: `#FFFFFF`, `#F0F0F0`, `#1A1A1A`,
  `#8C8C8C`, `#E29A86`** _(his call, verbatim: „lets change the color palette
  of the whole app: … "paletteName": "Modern and Minimal" … Rebuild the app
  with these colors")_. White ground, grey cards, near-black ink, grey
  secondary ink, dusty coral accent. The change is in `src/ui/tokens/colors.css`;
  every component reads the semantic tokens, so nothing else had to be
  recoloured by hand. Cards are told apart from the ground by their fill, and
  fields, selects and slider rails inside a card step back to the white.
- **Text on the coral is the ink, not white.** White on `#E29A86` measures
  2.28:1, the ink 7.62:1. The same goes for the grey and coral badges.
- **The app icon and the favicon** use the new colours: a coral plate with the
  white mark for the installed icon, the ink mark with a coral dot for the tab.
  The tab icon that goes green, amber and red with the posture is unchanged:
  that was his own request (2026-09-08), and a palette is not a reason to drop
  a signal.

- **Light is the default now**, not dark. A page with no stored choice and no
  system preference gets the white ground.

### New
- **A dark palette from the same family** _(his call, verbatim: „mach eine
  zusätzliche darkmode palette")_: ground `#1A1A1A`, card `#262626`, ink
  `#F0F0F0`, secondary ink `#999999`, the coral unchanged. In
  `src/ui/tokens/theme-dark.css`, replacing the old `theme-light.css`
  inversion. It follows the system until someone presses the toggle, and the
  toggle and its stored choice work as before. Every text value in it passes
  4.5:1 on the dark card, the coral included.

### Removed
- **`tokens/theme-light.css`**, the inversion of the old slate theme. Its job
  is now the default in `colors.css`.

### Left alone
### Changed, at the cost of a signature
- **`public/brand/`, six of the seven files, are in the new palette**
  _(his call, verbatim: „fix public/brand/*.svg")_. `mark.svg` and `logo.svg`
  are the ink `#1A1A1A` with the coral dot for the light default; the
  `-inverse` pair is `#F0F0F0` with the coral dot for the dark ground; the
  one-colour grey mark is `#8C8C8C`. `mark-mono.svg` loses the em dash in its
  title, which was the last one in the repo.
- **All seven lose their C2PA content credentials** _(his call, verbatim:
  „scheiß auf das prüfsiegel")_, `mark-on-accent.svg` included although its
  colours were already right. A credential signs the exact bytes, so an edit
  makes it report "tampered"; a file without one simply makes no claim. The
  pictures themselves are drawn the same as before.

### Changed, for legibility
- **Two darker text steps in light mode** _(his call, verbatim: „ja mach die
  andern schriftfarben")_. The grey `#8C8C8C` measured 2.95:1 as small text on
  the card and the coral 2.0:1, both under the 4.5:1 that text needs.
  Secondary text is now `#666666` (5.0:1) and the accent set as words, a
  breached readout, a link or an error, is `#A65440` (4.65:1) through a new
  `--text-accent` token. Both are darker steps of the same colours, and the
  coral itself stays for every fill, stroke and dot. Dark mode keeps the coral
  as text, where it already reads at 6.6:1.

## 2026-10-17 - a real whip crack

### Changed
- **The whip is the recording he sent** _(his call, verbatim: „nimm den
  peitschensound")_. `freesound_community-mixed-whip-crack-1-102825.mp3` is
  `public/snd/whip.mp3` now with its bytes untouched, and the old `whip.wav`
  is gone. Its hash replaces the old one in `sounds.sha256`, and the service
  worker precaches the new file instead of the old one.
- **Its gain is 1 instead of 0.9.** The old file peaked at -0.9 dB, this one
  at -7.5 dB, about where the knuckle crack and the rimshot sit, so it is
  played at full strength like them. The sound name stays `whip`, so no
  settings migration.

## 2026-10-15 - Cloudflare Web Analytics

### New
- **The Cloudflare Web Analytics beacon is on every page** _(his call,
  verbatim: „install cloudflare tracking:")_, the snippet pasted as given at
  the end of `index.html`'s body. `seo.mjs` builds the thirteen language pages
  and the legal notice from that shell, so all of them carry it. It counts page
  views without cookies; the camera pictures and the posture readings are still
  computed and kept on the device and are not part of it.

## 2026-10-08 - the email address as a picture

### Changed
- **The legal notice draws the email address instead of writing it**
  _(his call, verbatim: „in the legal-notice render the email as image to
  spammers do not find it that easy")_. `scripts/legal-notice.mjs` turns each
  glyph into an SVG path from the vendored IBM Plex Sans at build time, so the
  shipped HTML has no address, no `@` and no `mailto:` in it. Inline SVG rather
  than a PNG: it takes `currentColor`, so it follows light and dark, and it
  stays sharp at any zoom. It looks the same as the text around it.
- **The build checks it.** A `legal-notice.html` that contains the address as
  text, or a `mailto:`, fails the build.

### Left out on purpose
- **No spelled-out label.** The picture is labelled "E-Mail-Adresse als Bild"
  / "email address as an image", not with the address, because a label is text
  a harvester reads as easily as the address. The cost is that a screen reader
  cannot read the address out and nobody can copy it.

## 2026-10-05 - a legal notice

### New
- **`/legal-notice.html`, the Impressum** _(his call, verbatim: „add a
  legal-notice page to deshrimp")_. Name, email and VAT ID are the ones the
  rxdb.info legal notice publishes, because it is the same person and the same
  sole proprietorship. The address is **Friedrichstraße 5**, not the
  coworking space at Nr. 13 that rxdb.info shows _(his call, verbatim: „use
  "friedrichstraße 5" as street name")_. German first,
  since that is the language the obligation (§ 5 DDG) is in, then the same
  facts once in English. Not thirteen translations: an address translated
  thirteen times is thirteen places for it to go stale.
- **Every page links it**, in a small footer under the grid, in zen as well as
  on the dashboard, and in the prerendered copy a crawler or a reader without
  JavaScript gets. The label is translated into all thirteen languages and sits
  in `seo.json`, because the build writes the same link and cannot read the
  TypeScript tables.
- It is a static page, not a view of the app: built from the same shell as the
  language pages, so it has the stylesheet and the stored theme but runs no
  bundle. It is `noindex`, precached by the service worker, and the deploy
  refuses a build without it.

### Left out on purpose
- **No phone number.** rxdb.info does not show one either. Email is the
  contact channel; adding the number is one line if he wants it there.
- **No EU online dispute resolution (ODR) paragraph.** The Commission shut the
  ODR platform down on 2025-07-20 and the duty to link it went with it, and
  deshrimp sells nothing anyway.
- **No liability disclaimer boilerplate.** Not required, and a copy of the
  rxdb.info paragraphs would promise things about content and links this page
  does not have.
## 2026-10-05 - a different fart each time

### Changed
- **The fart is twelve recordings, played in a shuffled order**
  _(his call, verbatim: „i give you some fart sounds. on fartsound setting it
  should always play a random one of those, not the same fart sound each
  time", then „keep also the previous fart sound. ar random picking ensure we
  never play the same sound twice")_. He sent twelve files; `apebble-fart-2`
  and `apebble-fart-10` are the same bytes, so they are one file. They are
  `public/snd/fart-01.mp3` to `fart-11.mp3`, and the old `fart.mp3` stays as
  `fart-12.mp3` with its bytes untouched. All twelve are precached for offline,
  with their hashes in `sounds.sha256`.
- **No repeats.** The recordings are dealt from a shuffled deck: every one
  plays once before any of them plays again, and a new round never opens with
  the one that closed the last round. A fresh random pick each time would
  repeat about one signal in twelve, and at one signal a second that is heard
  as "the same fart again", which is exactly what he asked to stop.
- Every sound is now a list of files; the other five are lists of one. The
  setting itself is unchanged, so no settings migration.

## 2026-10-05 - the business card loses its sketch, and Noto's shrimp sits up straight

### Removed
- **The `skizze` version** _(his call, verbatim: „delete "skizze" it looks
  shit")_. Its front, the hollow-tube spines that only it drew, its table
  entry and its print files are gone. The card has eight versions now.

### Fixed
- **Noto's upright shrimp is straight** _(his call, verbatim: „"noto" is
  also wrong", then „in noto the second shrimp should be "straight"")_. The
  emoji's tail curls under, so turning the drawing upright kept the hook;
  the 2026-09-30 entry called it a straight shrimp already, and it was not.
  The upright pose is now the same drawing with the tail unrolled: every
  point inside the curl, taken around its centre, is laid out along a line
  at the curl's radius, so the length along the spine and the shell stripes
  are kept, and head, legs and antennae are untouched. It is turned 7° so it
  stands plumb.
- **Both Noto shrimp look to the right** _(his call, verbatim: „in noto both
  should look to the right")_. The curled one is mirrored, so its head is on
  the right like Lucide's. For the upright one, mirroring alone turned its
  face right but its legs left _(his call, verbatim: „on noto the right one
  looks to left, it should look to right, also the legs")_, so it keeps its
  legs on the right and its head is bent 45° forward at the neck, the head,
  legs and antennae turning together and the neck blending into the bend.
  Head and legs now both point right.
- **`noto` is the one he picked** _(his call, verbatim: „take noto. wo in
  deutschland soll ich die drucken lassen?")_. `card.html` without `?v=` now
  shows it; the other seven stay in the folder for now.
- **Noto as a file cut to exactly 85 x 55 mm** _(his call, verbatim: „gib
  mir noto in format "85 x 55" millimenter")_.
  `deshrimp-visitenkarte-noto-85x55.pdf` has the two sides at the final size
  with no bleed, for a shop that asks for the trim only; `card.html?trim`
  draws it, and `render.cjs` writes it next to the 91 x 61 mm file. The
  bleed file stays the one to use when a shop asks for bleed.

## 2026-09-30 - a business card, in nine versions

### New
- **A business card, drawn from his whiteboard** _(his call, verbatim: „mach
  daraus ne Visitenkarte für deshrmip", under a photo of a curled shrimp, an
  arrow, the same shrimp sitting up, and „deshrimp.com")_. The front is that
  sketch as vector line work; the back is the logo, the page title's line, and the
  address. `print/visitenkarte/` holds the source (`card.html`), the print
  files and a preview of each side.
- **The shrimp are Lucide's, not hand-traced** _(his call, verbatim: „such
  eine schrimp verktorgrafik online die du abwandeln kannst")_. The curled one
  is Lucide's `shrimp` icon as published; the upright one is derived from it,
  keeping its head and antenna and straightening the body, with a tail fork
  in the same idiom. Lucide is ISC, which asks only that its notice travels
  with the copy, so it sits in the licence file and nothing has to be
  printed on the card. Twemoji (CC BY) and OpenMoji (CC BY-SA) were the other
  candidates; both would have needed a credit on the card, and neither is
  line art. Both shrimp are drawn at one scale and stand on one baseline, so
  the upright one is taller because it is sitting up.
- **Five versions of it** _(his call, verbatim: „mach mehrere Versionen")_,
  all from the one `card.html`, picked with `?v=`:
  - `dunkel`: the Lucide shrimp on the product's slate ground.
  - `hell`: the same on paper white, with the light theme's ladder, so coral
    deepens to `#E14E1D` for the strokes.
  - `koralle`: coral as the ground, everything else slate and white, the way
    `mark-on-accent.svg` already does it.
  - `messwert`: the two shrimp as a reading, 47° in coral under the crooked
    one and 6° in white under the upright one, in Plex Mono like every number
    in the app. A breached readout is one of the places coral is allowed.
  - `skizze`: the first, hand-traced version with the hollow-tube bodies of
    the marker drawing, kept because it is closest to the whiteboard.
  The back is the same drawing in every version and only takes the colours.
  Each version gets its own two-page PDF and a preview per side, and
  `uebersicht.png` shows all of them next to each other.
- **Four more versions from other shrimp icons** _(his call, verbatim: „mehr
  mit verschiedenen basis svgs")_. Iconify turned up about forty-five shrimp
  across open icon sets; these four are ones whose licence needs no credit
  printed on the card and whose drawing differs from Lucide's:
  - `iconpark`: IconPark's outline shrimp, a C like the whiteboard's.
  - `hugeicons`: Hugeicons' round shrimp.
  - `meteor`: Meteor Icons' bold shrimp, on paper white.
  - `noto`: Google's Noto emoji. Its colours are not ours, so the main orange
    becomes the shrimp's colour and the rest is cut out in the ground, which
    leaves its shell stripes. It is a straight shrimp already, so the two
    poses are the same drawing turned: head down, then standing on its tail.
  For the three line icons the upright shrimp is derived the way Lucide's is:
  the icon's own head and antenna, the body straightened. A small script in
  `card.html` scales each pair to one factor, so both keep the same line
  weight, and stands them on the same baseline as the hand-placed versions.
  Phosphor was left out: its shrimp is drawn as filled outlines, not lines,
  so it does not straighten. `LICENSES.txt` replaces `LICENSE-lucide.txt` and
  holds the notices for all five sources.
- **The sketch keeps the severity ladder.** The crooked shrimp is the breach,
  so it is the coral one; the upright shrimp is white ink with the mark's
  coral head, and the arrow is secondary ink. The back spends the accent only
  on the mark's dot.
- **Print format:** 85 x 55 mm, the German standard, with 3 mm bleed on every
  side, so each PDF page is 91 x 61 mm, front first. Text stays 4 mm inside
  the trim. The PDF is RGB; the print shop converts it, and the coral will
  come out a touch duller in CMYK. `node print/visitenkarte/render.cjs`
  rebuilds everything (see the file for the Playwright it borrows).
- The mark on the back is its geometry copied, not the signed SVG embedded,
  so `public/brand/` stays untouched.

## 2026-09-30 - vibration, and a notification that actually arrives

### New
- **A third checkbox, "Vibrate on signal"**, next to the sound and the
  notification _(his call, verbatim: „can we make a smartwatch or apple watch
  vibrate instead of playing a sound", then „we need three checkboxes: sound,
  notification, vibrate")_. The three are independent, so vibrating instead
  of a sound is unticking the first and ticking the third. Where the browser
  can (Android) it buzzes the device the page runs on; the notification
  carries the same pattern. Ticking it buzzes once as proof; where the browser
  has no vibration at all (Safari, Firefox) it stays off and says so. Off by
  default, and settings v14 adds it as off for existing devices.
- **What reaches a watch, honestly:** a web page cannot talk to a watch. The
  only route to the wrist is a system notification that the phone passes on.
  That works with the page open on an Android phone and a Wear OS or Galaxy
  watch. It does not work from a laptop (a Mac does not forward to an Apple
  Watch), and on an iPhone only from the Home Screen app and only while the
  phone is locked, which a running camera prevents.

### Fixed
- **The notification goes through the service worker.** Chrome on Android
  throws on `new Notification()`, and the `catch` hid it, so on exactly the
  platform that forwards to a watch the checkbox did nothing. The constructor
  stays as the fallback where there is no worker (dev).
- **Every crooked reading notifies again**, not only the first: the shared
  tag now comes with `renotify`, so a new notification alerts instead of
  quietly replacing the last one.

## 2026-09-30 - no words while a picture is read

### Removed
- **„Bild wird ausgewertet …" is gone from under the buttons** _(his call,
  verbatim: „der "bild wird ausgewerted" text macht dass die renderpositionen
  flaggern. wir brauchen den text nicht")_. It appeared and vanished with
  every check, and as the last child of a wrapping row it pushed the sound
  setting and the view switch around each time. The row that held it is gone
  with it, and so is the `checking` label in all thirteen languages. „Jetzt
  prüfen" still greys out while a check runs, which is the only sign of it
  left.

## 2026-09-30 - the model's points, drawn over the picture

### New
- **A small button under the camera draws what the model sees** _(his call,
  verbatim: „mach einen Button rein, so dass die vom Model diese Punkte, die da
  erkannt werden, mit angezeigt werdem im screen. der Button muss rechts unter
  das Video so einen kleinen. das ist nur so ein Entwickler professionelles
  tool")_, and then, the same morning: „no text, make a small button with
  only the icon. schoe it on the bottom right inside of the videoframes". So it
  is a 32px eye glyph in the well's bottom right corner, shown while the camera
  runs, with the words kept as its title and accessible name. It switches an
  overlay of all 33 landmarks. The six the angles are computed from (eyes,
  ears, shoulders) are drawn larger and joined by the three lines the angles
  run along; a point below the visibility cut is drawn in secondary ink rather
  than hidden, because where the model guesses is half of what the tool is
  for.
- **It has its own loop, ten times a second**, rather than showing the points
  of the last check: at a two-minute pace a frozen skeleton over a moving
  person says nothing. It measures, judges and stores nothing, and it never
  starts the model download by itself. Off by default, remembered per browser.
- The overlay's `viewBox` is the video's own size with `meet`, which is what
  `object-fit: contain` does to the picture, so the points land on the image
  and not on the letterbox. Checked in a real browser against a photo.

## 2026-09-20 - the model is cached by its hash, not by the build

### Fixed
- **A deploy no longer costs every visitor the seventeen megabytes again**
  _(his call, verbatim: „on redeploys when reloading the app, it has to
  download the model again each time. ismt it be cache by hash? fix that")_.
  It was one cache, `deshrimp-<bundle>`, and the service worker's `activate`
  deletes every cache but the current one by design - that is how a new build
  retires the old shell. The pose model was sitting in there with it, so a
  changed German string, a moved button, any build at all, threw away 17 MB
  that had not changed and made the next camera start download it a second
  time over a phone connection.

  There are two caches now, because the two halves go stale for different
  reasons:

      deshrimp-shell-<bundle>   the page, the JS, the fonts, the six sounds
      deshrimp-model-<pin>      everything under mp/

  The shell name is the bundle hashes, as before. The model name is a digest
  of `scripts/pose-model.sha256`, which is the file `fetch-pose-model.mjs`
  already refuses to ship anything else against. So the answer to his question
  is yes, and by the hash that was already there: a deploy that leaves the pin
  alone leaves the bytes alone, and a model that really did change cannot keep
  the old cache, because it cannot keep the old name.

  Checked in a real browser rather than reasoned about, since a service worker
  is exactly the place where reasoning is cheap and wrong: first use fetches
  the model once, a rebuilt shell retires the old cache and fetches it zero
  more times, and a moved pin retires the model cache and fetches it again.

  One thing this cannot fix: an install that exists today has its copy in the
  shell cache that this very deploy retires. Those pay it once more, and that
  is the last time.
- **A miss now revalidates instead of trusting the browser cache.** The files
  under `mp/` carry no hash in their names, so the HTTP cache can hold bytes
  from before the pin moved, and storing those under a name that promises the
  new pin would be a lie that outlives the deploy. The fetch asks with
  `cache: 'no-cache'`, which is a conditional request, not a re-download: an
  unchanged file comes back as a 304 and the body still arrives from the
  browser's own cache.

## 2026-09-19 (addendum) - one URL per language

### New
- **The page exists thirteen times now, once per language** _(his call,
  verbatim: „deshrimp needs a similar one page per language url structure. so
  on the root we serve the detected language but also we have apecific language
  pages like en.html or de.html")_. `de.html`, `en.html`, `ja.html` and ten more
  sit beside `index.html`:

      /            the detected language, and the sitemap's x-default
      /de.html     German, whatever the browser says
      /ja.html     Japanese, and ten more of the same kind

  The reason is not tidiness, it is visibility: thirteen translations behind a
  single URL are as good as none. A crawler fetches a page once, in one
  language, and indexes what it got. And a shared link now opens in the
  language it was shared in, which no amount of detection can do.
- **It stays one build, not thirteen.** `scripts/seo.mjs` renders the finished
  shell once per language after the bundle. All fourteen pages therefore carry
  the same hashed filenames and differ in four things: the `<html lang>`, the
  head (title, description, canonical, hreflang, Open Graph, JSON-LD), the
  prerendered copy from the matching `data.json` entry, and one line of script
  setting `window.__APP_LANG__` before the bundle runs.
- **`sitemap.xml` and `robots.txt`** come out of the same step. Every page
  names every other as an `hreflang` alternate and the sitemap says it a second
  time, so a search engine reads thirteen pages as one page in thirteen
  languages rather than as thirteen competitors for the same words.
  `robots.txt` keeps crawlers out of `pr-preview/`, where every open pull
  request publishes a full copy of the site, now fourteen pages deep, on this
  same domain. A domain this new has no crawl budget to spend on a branch that
  will not exist next week.
- **`src/app/lang-url.ts`** is the whole app side of it: which language the URL
  forces, where the picker goes, and which title sentence belongs to a
  language.

### Changed
- **The URL beats the stored setting.** On `/de.html` the page is German even
  if English was once picked here. A URL that says `de.html` and renders
  English is a URL that lies. Nothing changes at the root `/`: there the stored
  choice still decides, and the browser language before it.
- **The picker in the top bar is a link on those pages.** Picking Japanese on
  `/de.html` stores the choice and lands on `/ja.html` - otherwise the setting
  would be written and the page would stay German anyway. In `npm run dev`
  those files do not exist, `window.__APP_LANG__` is absent, and the picker
  switches in place as before.
- **The tab title follows the language.** `<Page documentTitle>` is new and
  overrides the fixed value from `PAGE_DATA.meta`, which was decided at load.
  Before this, every tab said the English sentence, even above a Japanese page.
- **`src/app/seo.json` carries the title and the description per language**
  instead of once in English. The build stops when a language is in
  `data.json` and missing from `seo.json` or the other way round: half a
  translation would be an indexable URL promising a translation that does not
  exist.
- **The service worker precaches all thirteen pages** and answers an offline
  navigation with the page that was asked for before falling back to the root.
  An installed `/de.html` opens in German with the network gone.
- **Both workflows check the language pages**, against the list in `data.json`
  rather than a second list in the workflow. A missing file would be a 404 on a
  URL the sitemap and every other page already advertise.

## 2026-09-19 - the sound switches itself on, the views say what they are, and the code speaks English

### Changed
- **Picking a sound switches the sound on** _(his call)_. Reaching for the
  sound select while `soundOnSignal` is off is not someone browsing a list of
  noises, it is someone saying which noise they want, and the setting that
  decides whether any noise happens at all sits one row above, already
  unticked. The old behaviour stored a preference that did nothing and gave no
  sign that it did nothing: you picked the whip, heard silence for the rest of
  the afternoon, and had no reason to suspect the checkbox. Turning the signal
  back off is one click on that same checkbox, so the rule cannot trap anyone.
- **The zen/dashboard switch says what each view is, on its own face** _(his
  call: put the short info into the button as subtext)_. „Zen" and „Dashboard"
  are his own two words and they name the views without describing them. The
  sentence that does describe them - „Show the camera and the angles only",
  „Show the numbers, the history and the settings" - was a hover title, which
  is nothing at all on a phone, and this page is meant to sit on a phone next
  to his desk. It is the same sentence, moved from the hover to the control.
  No new keys: `toZen` and `toDashboard` already existed in all thirteen
  tables, which is also why they fit - each is one short line.
- **`<Segmented>` options take a `description`**: a second line under the word,
  11px and muted, sentence case and wrapping. The track's fixed 40px becomes a
  minimum so a segment can grow to fit it; an option with no description
  renders a column of one child and measures exactly what a plain segment
  always did. Still no accent anywhere in the control - a view switch is not
  one of the six places the 10% budget may be spent, and the muted second line
  under a white word reads as the explanation rather than as competition for
  it.

### Changed (German to English)
- **The sounds are called what they are.** `furz`, `raeuspern`, `schrei`,
  `knacken` and `peitsche` were German identifiers in the middle of an
  otherwise English codebase: a type, a schema enum, six filenames under
  `public/snd/`, a branch in the synthesiser and a key in all thirteen
  translation tables. They are `fart`, `ahem`, `scream`, `knuckles` and `whip`
  now; `rimshot` was already English. The audio files are renamed with their
  bytes untouched, so every hash in `public/snd/sounds.sha256` is the one that
  was there before.
- **`settings` is on v13.** `soundName` is stored, so this is a migration
  rather than a find and replace: `furz` sits in a real database on his machine
  and would fail the new enum on the next read. The map is one to one, so
  whatever he picked is the sound he keeps. The German names in the v2 and v5
  migrations stay exactly as they are and now say why: a migration writes the
  document as the *next* version expects it, and back then the names were
  German.
- **The comments speak English.** The prose here was already mostly English,
  but German kept leaking into it: the worked examples in the design system's
  doc comments were written in German, a handful of comments quoted a German
  label to explain what a component is for, and `theme.css` had one paragraph
  that was never translated at all. `<AsOf>` also stops rendering two
  hard-coded German words.
- **This file is in English too**, and so are the app's own CSS class names:
  `haltung-kamera` is `haltung-camera`, `haltung-kamera-aus` is
  `haltung-camera-off`.

### Deliberately still German
- **His requests, quoted verbatim, typos and all.** They are the record of what
  was asked, not prose about it, and a translated request is no longer the
  thing he said.
- **The German translation tables** in `i18n.ts` and `lang-text.ts`, and the
  German half of `data.json`. Those are the German page, not German code.
- **The page title** and the subtitle beside it in `app.config.ts`. He asked
  for that wording exactly.
- **`haltung-`**, the prefix on those class names, because it is `appId` and so
  the name the local database is stored under. Renaming it would orphan the
  readings on every device that has the page open. The words after it are
  English now.

### Noticed, not acted on
- `<AsOf>` and `<Details>` are in `src/ui` but nothing renders them, and the
  house rule is that a component which stops being rendered gets deleted rather
  than carried along. Deleting them touches `theme.css` and the `UiText` labels
  that exist only for them, which is a different change from this one.

## 2026-09-18 - a whip crack joins the sounds

### Added
- **A sixth signal sound: the whip** _(„füge einen peitschensound hinzu")_. It
  stands in the list beside the fart, the throat clear, the scream, the knuckle
  crack and the rimshot, and runs through the same rise in volume as the rest.
- **`public/snd/peitsche.wav` is bundled and precached for offline.** The new
  sound is therefore there without a fetch, exactly like the others, and the
  synthesiser has a whip fallback of its own in case the browser will not play
  the file.

### Changed
- **`settings` is on v12.** The enum for `soundName` gains the value
  `peitsche`. The migration itself changes nothing - it only has to exist, so
  that devices keep the noise they already picked and are offered the new one
  as well.

## 2026-09-16 (addendum 4) - the subtitle names the data, and Georgian joins

### Changed
- **The subtitle now says *what* stays on the device** _(„"nothing leaves your
  device" is confusing, make it sure we talk about the data")_. It read
  „Nichts verlässt dein Gerät." The „Nichts" was the problem: someone who
  wonders what a webcam page does with their face was told that some unnamed
  nothing stays where it is. What it names now is the two things people
  actually ask about: „Die Bilder und die Messwerte bleiben auf deinem Gerät."
  The promise is the same, it just has an object now. In all thirteen tables,
  and likewise in `seo.json`, in `index.html` and in the manifest, because the
  search-result line is the first sentence many people read of this page.
  `leavesTitle`/`leavesText` still answer the same question at length; the
  subtitle is the version that fits under the title.

### Added
- **Georgian, the thirteenth language** _(„add georgian language also")_. A new
  language here is not a new dictionary but eight places: `i18n.ka.ts` (the
  interface), `data.json` (the written content), `lang-text.ts` (the page
  frame's fixed words), `UiLang`/`UI_LANGS`, `Lang`/`LANGUAGES`, the two
  `LOCALE` tables with `ka-GE`, the label „ქართული" in the picker, and a flag.
  `src/ui/flags/ka.svg` comes from flag-icons like the rest.
- **`settings` is on v11.** The enum for `lang` gains one more value. The
  migration itself changes nothing - it only has to exist, because RxDB
  validates a stored document against the schema it was written under. Whoever
  never picked Georgian keeps their language, as with v9.
- **Georgian is the first script here that IBM Plex does not cover.** Mkhedruli
  therefore falls through to the system stack, exactly as Chinese and Japanese
  always have; noted in the comment in `tokens/fonts.css`. Shipping a font file
  of its own would be another download for a page that has to work offline, and
  every system that ships a UI font ships one that can set Georgian.
- Mkhedruli has no capitals. The 11px lines above the settings are
  `text-transform: uppercase`, which in Georgian simply does nothing - the
  words stand as they are written. That is not a bug to fix, it is the script.

## 2026-09-16 (addendum 3) - zen is the normal state, the dashboard is a switch

### Added
- **The page starts in zen mode: camera, start button, three angles, nothing
  else** _(„im default ist die webseite zu techlastig mit den vielen daten.
  mach einen zen-mode als default der nur video, start-tile und current
  degree-conten anzeigt. zudem einen button um zum dashboardmode zu
  wechseln")_. The question you open the page with in the morning is „sitze ich
  gerade", and the picture and the three numbers under it answer that. The
  curves, the log, the trend across the days and the limits answer questions
  you ask on purpose, and so they are no longer in the way when you are not
  asking them. Eighteen tiles become three.
- **A switch at the foot of the start tile, „Zen" left, „Dashboard" right**
  _(„mach den zen-dashboard toggle da beim starttile rein", then „neachst unter
  dem soundselect. mach einen toggle daraus so links zenmode und rechts
  dashboard mode")_. It stood centred under the grid first, then as a single
  ghost button in the button row; in the tile is where it belongs, because in
  zen mode that is the only tile with anything to press at all. And it is a
  switch because a button could only say where it leads, never where you
  currently are - side by side, the two words say both at once. Under the sound
  select, with the same 11px line above it as every other setting. Zen left,
  dashboard right: that is also the order from little to much, so the control
  runs along the same ladder the two views differ on.
- **`src/ui/Segmented.tsx`, the switch itself.** An inset track with the chosen
  segment raised out of it. The state hangs on the value ladder and on the ink
  - track at the inset value, chosen segment back up on the slate of the
  inactive controls, label from secondary slate to white - and **nowhere on the
  coral**: a change of view is not one of the six places the 10% budget may be
  spent. That is exactly why it is a component of its own and not
  `<Button active>` twice, which is the coral version. Equal columns, so that
  „the left one" stays on the left however long the words are.
- **`view` in the settings**, schema v10. The choice lives in the settings and
  not in component state because it should survive a reload: whoever looks
  something up will be looking it up again tomorrow.
- **Two more glyphs in `Icon.tsx`**: `grid` (four tiles) and `minimize` (the
  same frame, pulled inwards). Two shapes rather than one arrow pointing first
  one way and then the other - a glyph that swaps its meaning with its
  direction says nothing at a glance.
- **Five keys in all twelve tables**: `dashboardLabel`, `zenLabel`,
  `toDashboard`, `toZen` and `viewLabel` for the line above the switch
  („Ansicht", „View", „Weergave", „Görünüm", „Вид", „视图", „表示").
  „Dashboard" and „Zen" are his own two words and stay the same in every
  language, only the script changes with it: „Дашборд"/„Дзен", „仪表盘"/„禅",
  „ダッシュボード"/„禅". Set in Latin in the middle of a Japanese sentence it
  would be a foreign body rather than a label.

### Changed
- **Migration v10 puts existing devices into zen too**, and that is the one
  migration here that deliberately changes what a device shows. The rule for
  the other nine is that a schema change never pulls the view out from under
  anybody; here that is precisely the request. If the migration said
  „dashboard", his own browser would stay on the view he complained about, and
  the new normal state would only ever reach a device he has never opened. The
  dashboard is one click away.
- **In zen mode the hidden tiles are not rendered at all**, not hidden with
  CSS. The trend tile queries every day ever recorded, and a quiet page should
  not be paying for a chart nobody is looking at.
- **The explanatory text („Kurz gesagt" and the five steps) belongs to the
  dashboard.** It is worth reading once, and after that it is six tiles of
  prose between him and the camera.
- What stays in zen mode: the sound select in the start tile, because it
  belongs to „what this thing does while I sit here", and the two buttons top
  right for saving and clearing, because they belong to the frame rather than
  to the data on the page.

## 2026-09-16 (addendum 2) - the subtitle says what the page does

### Changed
- **The subtitle under the heading names neither Local-First nor RxDB**
  _(„change the subtitle from „local-first app to train..." to sth non
  technocal that does not describe rxdb or tech stuff and instead talks about
  what the app does")_. It read „App fürs Haltungstraining. Erkennung durch
  eine lokale KI, gespeichert wird mit RxDB." and was assembled from three
  pieces around two links. That described the build, not the thing: whoever
  knows the words knows it anyway, and whoever does not learns nothing.
  Instead there is now one sentence about what the page does and one about
  where the pictures stay: „Schaut über die Webcam zu, wie du sitzt, und gibt
  einen Ton, wenn du zusammenklappst. Nichts verlässt dein Gerät." The promise
  „Local-First" was meant to make is still there, only in words everybody
  reads.
- **`subtitleA` and `subtitleB` become `subtitle`**, in all twelve tables. The
  three-way split existed only so the two links would fit between the pieces;
  without them it is one sentence, and `<Page subtitle>` takes a string rather
  than a fragment. The exception for the German „Local-First-App" goes too.
- The two links to rxdb.info have therefore left the page. That is the
  consequence of the request, not an extra step.

## 2026-09-16 (addendum) - two lines fewer beside the buttons

### Removed
- **„Nächste Prüfung in 12 s" and „Zuletzt 14:32" no longer stand beside start
  and stop** _(„remove „last check" and „nect check in" texts")_. Both said
  something that is already somewhere else: since yesterday the countdown is
  the ring around the camera well, drawn evenly rather than counted up once a
  second, and the time of the last reading stands in the first line of the log
  below. What stays in that spot is „Bild wird ausgewertet …", because that is
  the only state with no other sign for it.
- `nextIn` and `lastAt` are out of all twelve tables.

### Changed
- **The page no longer re-renders every second.** `secondsLeft` was a
  `useState` feeding that one line and nothing else, and the loop wrote it once
  a second. The comment beside it had always claimed the counter lives in a ref
  „because the loop reads and writes it every second and the page must not
  repaint for that" - which was true of `left.current` and was undone by the
  `setSecondsLeft` directly next to it. Now it is true.

## 2026-09-16 - the QR code in the share dialog

### Fixed
- **The share button always claimed the address was too long for a QR code**
  _(„share button says this text is too long for qr code, fix that")_. It never
  was: `https://deshrimp.com/` is twenty-one characters, and even version 1
  takes seventeen. There simply was no encoder. Both `<ShareDialog>` and
  `<QRCode>` read it off `window.QR`, which nothing in this repo ever sets -
  the remains of the old generator setup the app was pulled out of in
  September, where the library was pasted into the HTML file as a global. The
  encoder was the one part that did not come along in the move to Vite. The
  result was not an error but exactly the sentence the fallback keeps for the
  real edge case, which is why it looked plausible.

### Added
- **`src/ui/qr.ts`, the encoder itself.** Byte mode, versions 1 to 40, all four
  error-correction levels, the eight masks and the scoring that decides between
  them. Our own code rather than a dependency: it is forty lines of table and
  two hundred lines of arithmetic that stop changing once they are right.
  Checked against a foreign implementation, matrix by matrix, across 93 cases
  from the empty edge to a full version 40, mask choice included; then once
  more the other way round, by having a scanner read the rendered page back.
- **The level rises when there is room.** First the smallest version that holds
  the link, then within that version the highest error correction that still
  fits. The square does not get bigger for it, but the code survives a thumb in
  the corner.
- **Too long now really means too long.** The notice appears from 2953 bytes,
  the capacity of a version 40 at level L. Below that there is a code, above it
  there is none, and the link underneath works either way.

## 2026-09-09 - no lockfile

### Changed
- **`package-lock.json` is gone and is not written again**
  _(„disable the package-lock, we do not need that")_. `.npmrc` sets
  `package-lock=false`, and the file is in `.gitignore`. An install resolves
  the ranges from `package.json` afresh every time - a new patch release of a
  transitive dependency therefore comes along unasked, which is the bargain
  without a lockfile.

## 2026-09-09 - an ordinary Vite project

### Changed
- **Only the components this app uses.** 100 files came across from the shared
  library; 48 of them were never rendered by any page here (shop listings,
  maps, recipe cards, chat bubbles, timelines …). They are out, along with
  three database components (`Checklist`, `Decision`, `Steps`) and four unused
  chart types. **It changes nothing about the bundle** - Vite was dropping them
  anyway; it changes what somebody reads who opens the repo.
- **`theme.css` from 1,499 lines to 924.** 16 sections belonged exclusively to
  deleted components. That *is* a real saving, unlike the JS: CSS is not
  tree-shaken, the rules were shipped until just now - built, 55.4 → 34.4 KB.
  Sections with mixed content were left alone: some classes in them are
  assembled at runtime (`ui-gap-${n}`), and a static search would wrongly take
  them for dead.
- **The app is now an ordinary JavaScript project** - `package.json`,
  `vite.config.ts`, `tsconfig.json`, `src/`, `npm run dev`. Before, the page
  was built by a generator that pasted React and the components into a single
  HTML file as globals; the app imported them through a type shadow on
  `window.UI`. Now they are ordinary ES modules and the bundler sees real
  imports: unused components drop out, and RxDB's WebRTC part lands in a chunk
  of its own that is only loaded when syncing.
- **The pose model comes over npm.** Three of the four files live in
  `@mediapipe/tasks-vision`, an ordinary dependency, so npm fetches and checks
  them. Only the weights are still fetched separately. The pinned SHA-256 sums
  stay.
- **No more Python** in the project.


## 2026-09-09 (addendum 12)

### Changed
- The page's own P2P code now stays the same, and a pasted foreign code is
  still in the field after a reload. Both sit in the shared component:
  `.claude/app-builder/CHANGELOG.md`.


## 2026-09-09 (addendum 11)

### Changed
- **The heading „Jetzt / Jede Sekunde ein Bild" is gone** _(„remove these texts
  we do not need them")_. The camera, the verdict and the three numbers stand
  at the very top of the page and need nobody to announce them; the pace is a
  setting and stands where you set it. The four words (`nowTitle`, `nowIdle`,
  `nowEverySecond`, `nowEvery`) are removed from all twelve language tables - a
  key no page renders any more is only a question the next time somebody reads
  it.
- The page's P2P sync now survives closing the modal and resumes by itself
  after a reload. That sits in the shared component:
  `.claude/app-builder/CHANGELOG.md`.

## 2026-09-09 (addendum 10)

### Changed
- The ⇅ modal now asks for the client id instead of disabling the cloud button,
  and P2P has a field of its own for the other side's code. Both sit in the
  shared component - what changes here is only what he sees on the page.
  Details: `.claude/app-builder/CHANGELOG.md`.

## 2026-09-09 (addendum 9)

### Changed
- **„Messungen sichern" has become the ⇅ modal** - the page now calls
  `<DataSyncButton>` from the app-builder instead of downloading directly. With
  that it can, for the first time, also **read** what it wrote: an exported
  file can be loaded back, a second device brought to the same state over
  WebRTC, and a backup written to a cloud as soon as a client id is entered.
  For a page whose daily rows are meant to stay *forever*, the plain download
  was the real gap: the data did not survive the browser.
- `t.saveReadings` and `t.saved` are no longer in use - the modal's words live
  in the page frame, because they are the same on every page.

## 2026-09-08 (addendum 8)

### Added
- **Ten more languages** _(„add 10 more languages")_: Spanish, French, Italian,
  Portuguese, Dutch, Polish, Turkish, Russian, Chinese, Japanese - twelve
  together with German and English. Translated is **everything on the page**:
  the app text (`i18n.<code>.ts`), the page frame (`.claude/ui`) and the
  written content in `data.json` - the intro, the five steps, the seven source
  notes and the four data gaps. The title too: „¡Siéntate derecho, gamba!",
  „Siedź prosto, krewetko!", „坐直了，虾米！".

### Changed
- **The language list lives in one place.** `LANGUAGES` from `i18n.ts` feeds
  both the picker and `preferredUiLang()`. Before, `['de','en']` stood written
  out twice in `index.tsx` - harmless with two languages, a list that drifts
  apart with twelve.
- **`settings` is on v9.** The enum for `lang` is widened from two values to
  twelve; that is a schema change, so the version has to move or RxDB rejects
  the stored document. The migration changes **nothing**: the ten new languages
  are an offer, and quietly pushing somebody into a language they never chose
  is precisely what a migration must not do.

### Deliberately not translated
- **Source titles.** A document is called what it is called; only the note
  under it is translated. Likewise the `id` and `severity` of a data gap -
  those are keys, not prose.
- **No right-to-left.** Arabic, Hebrew, Persian and Urdu are missing because
  the page frame cannot do `dir="rtl"`. Recorded as a gap in `.claude/ui`.

### Checked
- `tsc --noEmit` clean - with twelve word lists that is the real test: a
  forgotten key is a type error rather than a German word on a Japanese page.
- Stepped through all twelve in the browser: title, headings and the closing
  block change along, no German left over, no overflow, console clean.
- Detection: `ja` → Japanese, `zh` → Chinese, `pl` → Polish, `ru` → Russian,
  `tr` → Turkish, **`pt-BR` → Portuguese** (matched on the primary subtag),
  `sv` → English (not on offer, so the last resort), `['de-AT','en-US']` →
  German. A choice once made („Polski" in a Japanese browser) survives the
  reload.

## 2026-09-08 (addendum 7)

### Changed
- **The camera is shown in its input format, nothing is cropped**
  _(„zeig die kamera immer im input format, schneide nichts ab")_ - this
  replaces this morning's fixed 16:9. Three places had to be changed together;
  each on its own would have gone on cropping:
  1. **`getUserMedia` asks for a width only.** The `height: {ideal: 720}`
     beside it fixes a shape; a camera that natively works in 4:3 then delivers
     a 16:9 crop of its own sensor rather than its picture.
  2. **`fitToStream()` writes the real ratio onto the element** - on
     `loadedmetadata` and on `resize` (a camera that changes mode mid-stream).
     Registered **once** in an effect, not in `start()`: `start` runs again on
     every click of the start button, and a listener attached there piles up
     with each one.
  3. **The 16:9 in the CSS is only the placeholder** until the stream arrives.
     Some value has to be there, because a `<video>` with no source reports
     300×150 and the box would visibly jump. `object-fit: contain` rather than
     `cover` is the fallback line: should element and stream ever disagree, you
     get bars instead of a missing edge.

  **The measurement never depended on it** - `frameOf()` has always sized the
  canvas from `videoHeight / videoWidth`. What was wrong was the preview: it
  showed something other than what the model was given.

## 2026-09-08 (addendum 6)

### Changed
- **The spinner has become an overlay** _(„loading spinner sieht nicht gut aus,
  der text dreht aich mit. mach ein overlay modal loading lieber")_. The text
  turning with it was a bug in `.claude/ui` and is fixed there; the second half
  of the request is the construction: `<LoadingOverlay>` lies across the whole
  page instead of having to find a place inside it. On a page that has no
  reading while it loads and does have one afterwards, that place does not
  exist - it either covers something or it shifts something.
- **The state hangs on the promise now, not on polling.** `preloadPose()`
  returns a promise; `setLoadingModel(true)` before it, `false` in the
  `.then()`. Before, `poseLoading()` was polled on the loop - which misses a
  load that fails fast and restarts, and makes every test depend on the clock.

## 2026-09-08 (addendum 5)

### Added
- **A spinner while the model loads.** 17 MB take a noticeable while the first
  time, and until just now nothing visibly happened after the click on
  „Starten". `preloadPose()` is now kicked off **before** the camera, so the
  indicator appears on the click rather than only once the browser has
  negotiated the video stream. The label names the size and says it is a
  one-off - that is the information you decide on whether to wait.

### Fixed
- **`poseReady()` was lying.** It tested `landmarkerPromise !== null`, so it
  was true the moment loading *starts* - the page claimed „lokal gerechnet"
  while it was still downloading seventeen megabytes. There is a real
  `landmarkerLoaded` now, and `poseLoading()` beside it for the spinner.
- **The model's error message was hard-coded German.** A `PoseError` now
  carries only the browser's own words as the detail; the sentence comes from
  `i18n.ts`, so an English page says something English.


## 2026-09-08 (addendum 4)

### Changed
- **The camera picture is always 16:9** (4:3 before) - on his instruction. That
  is also the shape the camera is asked for (`1280×720`), so normally nothing
  is cropped at all; `object-fit: cover` catches the cameras that can only do
  4:3 and crops top and bottom, where nothing this page measures lies.

### Fixed
- **The dashboard layout is out again** („ok thats confusing, go back to the
  previous page layout not the dashboard"). Back to the reading column with a
  centred head, camera in the middle, charts one under the other. What was kept
  is the two things he asked for individually: 16:9 and **settings shown
  openly** („settings must not be toggled, directly show them") - in the
  dashboard those had disappeared behind a `<Details>`.
  The generic building blocks stay in `.claude/ui` and are documented; this
  page no longer uses them.


## 2026-09-08 (addendum 3)

### Changed
- **The page is a dashboard now, not a document** („make the app look more like
  a fullscreen dashboard like it was built for the CEO of a company"):
  `<Page width="full">`, a left-aligned head, and at the top a **live band**
  with the camera on the left and the numbers on the right, rather than a
  camera in the middle of a reading column.
- **Exactly one hero number**, and it is the one the page exists for: the head
  in front of the shoulders. Side lean and head tilt are ordinary tiles beside
  it. Two hero numbers would be none.
- **The charts stand side by side** rather than one above the other - at full
  width that is the whole gain, and the time-window filter above them is a
  narrow bar rather than a form-width field.
- **Settings and explanation are folded away.** A dashboard that opens with its
  own settings form is a settings form.
- **The camera height is capped.** At a 640 px column, 4:3 is 480 px tall -
  taller than the numbers beside it, so half the right-hand side stood empty.
  The crop costs nothing: the picture shows whether you are in frame, it is not
  a photograph.
- The verdict stands as a line of its own under the numbers, no longer in a
  callout above the camera - on a dashboard the state has to be readable from
  two metres.


## 2026-09-08 (addendum 2)

### Changed
- **Full volume after four readings rather than eight** - on his instruction
  („mach nur 4 messungen bis voller lautstärke"). At one picture a second, that
  is after four seconds. Eight was too patient for a nudge.
- **The starting language is detected: stored choice → browser language →
  English.** Before, every first visit was German, even on an English system -
  which did not fit „should work for everybody".
  Detection happens only **while nothing is stored**; as soon as a settings
  document exists, that decides and detection keeps quiet. A page that does not
  stay in the chosen language is worse than one that guessed wrong once.
  The trap here was not the detection but the storing: the first write started
  from `DEFAULTS` and would have pinned a fresh device to German as soon as he
  changed any other setting. Hence `INITIAL_SETTINGS` with the detected
  language. Migration v3 still writes `'de'` for devices that already existed -
  those were German and are to stay that way.


## 2026-09-08 (addendum)

### Added
- **The tab icon takes the colour of your posture** - green, amber, red („the
  favicon of the url should change on bad posture to something red and go back
  to green on good posture"). A plain disc as an inline SVG rather than a
  tinted shrimp: at 16 px an emoji is mush and a colour is not. It is the only
  channel that still works while the page sits behind the work - so almost
  always, if you follow the recommendation to leave it open in a tab of its
  own.
- **A moving average over the last few minutes** (30 by default, 5 to 120
  selectable). It answers a different question from the daily chart below it:
  that one runs over weeks and can only be read in hindsight, this one over the
  hour he is sitting in right now - the one he can still change something
  about. Bundled by the minute and smoothed over three minutes at a time,
  because a single frame wobbles by a degree or two.
- **A fifth sound: the throat clear**, sent by him.

### Changed
- **The sound starts quiet and grows louder** while the posture stays bad („the
  sound should start quiet and get louder if the posture is bad for times in a
  row"): from a quarter to full volume over eight readings in a row. A single
  good reading resets it, so sitting up is rewarded immediately. That is the
  right answer to what the abolished one-minute pause was trying to solve.
- **The title exactly** „Sitz aufrecht du Garnele! 🦐" / „Sit straight shrimp!
  🦐", with the exclamation mark and the emoji, in both languages.
- **New address:** `/p/sit-straight-shrimp/`. The old `/p/haltung/` has been
  taken offline - a frozen second copy of the same page would be worse than a
  dead link, because it would never be updated again.
- **The first section now says what the page does** and recommends leaving it
  open in a browser tab of its own, rather than showing a line of filler.


## 2026-09-08 (late evening)

### Added
- **The head-in-front-of-the-shoulders angle is back - and is now the main
  value.** The reason is him: *„i need this because my neck posture is a bit
  too much to the front."* That is exactly what the app did not measure until
  just now.
  Two versions before this were wrong, and what they were wrong about is the
  real finding: the measurement was taken at the **nose**, which on everybody
  sits far in front of the shoulders (0.161 m in the test picture), bolt
  upright or not - so the number was mostly face geometry and needed a
  reference picture to mean anything at all. The right point is the **ear**,
  which is what the clinical value uses too: 0.035 m in front of the shoulder
  line in the same picture. What is measured is the line shoulder midpoint →
  ear midpoint against the vertical.
  **That drops the reference picture without the measurement falling with it**
  - the ear value needs no personal calibration.

### Changed
- **Body size no longer matters** („do not care about body size"): the angle is
  a ratio between two lengths on the same body, so tall and short read
  identically. That is also what makes the page usable **by everybody** („it
  should work in general for all people, not only for me at my coworking
  space").
- **The data basis is depersonalised.** The old gaps about the STEYG coworking
  space, the gaming chair in the living room and the 194 cm are gone. In their
  place stand the limits that hold for everybody: that the angle is not the
  craniovertebral one, that depth is the weakest axis of a single camera, that
  there is no evidenced threshold, and that the camera has to stand roughly at
  eye level.
- **The sound really does play on every check now** („each single time the
  check runs and detects wrong posture, it should play the sound"). The last
  brake - not restarting a sound that is still running - is gone too; every
  play gets an audio node of its own, so the sounds overlap rather than cutting
  each other off.
- A default limit of 18°: in the only calibration picture available, a clearly
  acceptable posture read 12°, and a default that counts that as „grenzwertig"
  on the first afternoon is a default you close the page over. To be tightened
  as soon as a day of real readings shows where his normal lies.
- Schema migrations: `readings` v2, `days` v2 and `settings` v6 bring the
  forward-lean fields back. Old values are **not** carried over - they come
  from the nose measure and would be meaningless against the new one.


## 2026-09-08 (at night)

### Changed
- **The sound now comes on every crooked reading** („do not limit how often it
  plays the sound. play it each time the user sits wrong"). The one-minute
  pause is gone; at one picture a second that means every second until he sits
  up. The only thing `play()` still refuses is restarting a sound that is still
  running - which is not a brake but the opposite. The scream runs 3.3 seconds;
  rewinding it every second would mean never hearing more than its first
  second.
- **The language is switched top right**, no longer in the settings - through
  the new `<LanguagePicker>` component, meant for every page, next to the
  light/dark switch. The „Sprache" panel in the settings goes.
- **„Local-First" in the subtitle links** to
  rxdb.info/articles/local-first-future.html, „RxDB" still to rxdb.info.


## 2026-09-08 (late)

### Changed
- **Four real signal sounds instead of six synthesised ones** - he sent them
  himself („use these sounds"): fart, scream, knuckle crack, rimshot. They are
  **committed** under `sounds/` and copied into the page folder by
  `install_sounds.py`; `fetch_sounds.py` is gone with that.
  The attempt before that, to fetch them from Wikimedia Commons, failed for a
  banal reason, and it is noted so that nobody tries it again: **from a shared
  cloud IP, Wikimedia answers with 429 practically throughout** - in an hour,
  one of six files came through. Four files from him beat that in every
  respect: no rate limit, no link rot, no licence to track, and they are the
  sounds he wants.
  This is a deliberate exception to the rule that holds for the pose model:
  that one is about 17 MB of WASM that can be refetched from a pinned URL at
  any time. These 181 KB came from him and exist nowhere else.
- `settings` v5 narrows the enum and pushes a device still sitting on one of
  the abolished names (`schaf`, `raeuspern`, `laser`, `piep`) onto the default
  rather than failing validation.
- The oscillators stay as the emergency version, one shape per sound.


## 2026-09-08 (evening)

### Added
- **The page speaks German or English** („mach die app optional in english").
  Switchable in the settings, stored like any other setting. New: `i18n.ts`
  with both versions of every visible string - `Copy` is derived from the
  German one, so a forgotten English key is a type error rather than a German
  word on an English page. `data.json` now exists once per language, and
  `pose.ts` returns an `AdviceKey` rather than a sentence - which is how a
  reading recorded in German still reads correctly after switching.
- **A new name and a new icon**: „Sitz aufrecht du Garnele!" / „Sit straight
  shrimp", 🦐, in his wording.
- **A new description** with a link to rxdb.info, also in his wording: a
  local-first app for posture training, local detection, RxDB as the store.
- **Real signal sounds instead of oscillators** („the sound files are bad. can
  you download real sounds from somewhere"). `fetch_sounds.py` fetches six
  recordings from Wikimedia Commons under free licences into `snd/` at build
  time - the same construction as the pose model, so the same provenance, no
  CDN, cached by the service worker, not in the repo. The page names every
  recording with its author and licence in the sources; with CC BY and CC BY-SA
  that is an obligation, not a courtesy.

### Changed
- **The reference is out** („remove the Referenz stuff its confusing") - and
  with it the **forward-lean reading**, because the two were the same thing:
  forward lean was only computable as a deviation from a stored reference
  picture, and without a reference it was hard-wired to 0°. A number that is
  always 0 looks like a reading and is not one. What remains is two angles that
  hold without calibration - shoulder line against the horizontal, eye line
  against the shoulder line - and the page measures from the first picture on.
  The price stands as the first data gap on the page: it no longer recognises a
  collapse forwards, which would need the hips, and at a desk those sit at
  visibility 0.01.
- Three migrations for it, all data-preserving: `readings` v1 without
  `forward`, `days` v1 without `forwardSum` (those are the rows that stay
  forever - every count and every other sum survives), `settings` v4 without
  `maxForward`. `settings` v3 had added the language before that, deliberately
  with `de`, so that a running device does not change language under him.
- **„Verlauf löschen" now asks first** - through the new `<ConfirmButton>`
  component in `.claude/ui`, not through a special case here.

### Fixed
- **A break no longer lengthens the „längste gute Strecke"** („when there is no
  human in the picture, do not add that to the ‚längste gute Strecke'").
  Pictures with nobody in them were already discarded rather than stored - but
  the run was computed as wall-clock time from the first to the last good
  reading, so the lunch break between two upright readings counted as an hour
  of exemplary posture. Now **a gap in the recording** breaks the run too,
  wherever it comes from.
- The gap threshold scales with the pace (three missed pictures, at least
  30 s). Fixed at 30 s it looked right at one picture a second and would have
  quietly broken the statistics at every setting above that: at two minutes per
  picture, *every* ordinary reading would have been a gap and no run ever
  longer than 0.


## 2026-09-08

### Added
- **A local pose model, and it is the default.** On his question („können wir
  ein locales model dafür nehmen das im browser läuft? lasst den user
  entscheiden ob local oder via api key"): the MediaPipe Pose Landmarker runs
  in the browser, reads 33 body points, and the page computes the angles from
  them itself. No key, no quota, no picture leaving the device - and more
  accurate than a language model guessing at a flat image.
- **A „Wo gerechnet wird" switch** in the settings. The key field only appears
  on the Gemini path now, and the privacy note tells the truth per path instead
  of saying „geht an Google" across the board.
- **A trend across the days** - on his request to be able to see whether he is
  getting better. Every reading is additionally folded into a daily row (counts
  per verdict, degree sums, signals); that row is kept while the individual
  readings are cleared after two weeks. Two curves from `@charts` plus the
  comparison „letzte 7 Tage gegen die 7 davor".
- `fetch_pose_model.py` + `pose-model.sha256`: fetches the model and the WASM
  into the page folder at build time, with a pinned version and checksums.
  **Not vendored into the repo** - his decision: 17 MB would otherwise stay in
  the history for good.

### Changed
- The head of the page, the steps and `<DataGaps>` rewritten: there are two
  measurement paths now, and the page still claimed everywhere that it sends
  pictures to Google.
- Schema migrations rather than starting over: `settings` v0→v1 (`source`),
  `reference` v0→v1 (`baseline`), a new `days` collection. His existing
  settings, readings and reference picture survive the update.

### Changed (after merging master)
- Since #146, `new_app.py` mints a permanent random URL per app. This page is
  one of the two with a fixed slug, so the rebuild now pins it explicitly in
  `app.config.ts` before building - otherwise the page would carry an address
  internally that it does not live at.

### Fixed
- **The local path could not be started at all**: `start()` still demanded an
  API key. Caught in the browser test, not by reading.
- **Every angle came back as ~178°.** The landmarks arrive in body order, not
  in picture order, so the shoulder line runs right to left and `atan2` reads
  ±180° for a horizontal line. Folded into the first quadrant now.
- **Verdict and advice contradicted each other** („Du sitzt gerade" above
  „richt dich auf"), because the sentence had thresholds of its own. It gets
  his now.
- **The select was empty**: `<Select>` takes `<option>` children, not an
  `options` prop - and `SelectProps` is `Record<string, any>`, so the typecheck
  let it through. That came out of the browser test too.

## 2026-09-08

### Added
- **The key may live in the fragment: `…/haltung/#k=AIza…`.** On his question
  why the page does not already have it: here in the session it does, but the
  page is world-readable - in the bundle it would be published, and there is no
  server to hold it on GitHub Pages. The fragment is the one part of a URL a
  browser sends nowhere: that is how the page gets the key without GitHub, the
  CDN or any access log ever seeing it, and without it landing in a committed
  file.
- **Taken once, then cleaned out of the address bar** (`replaceState`) - an
  open tab should not display it. The bookmark keeps it, which makes a new
  device one click rather than a piece of typing.

## 2026-09-03

### Added
- First version. On his request of 2026-09-03: one webcam picture to Gemini
  every ten seconds, three angles back, a sound when he sits too crooked.
  Published at <https://pubkey.github.io/me/p/sit-straight-shrimp/>.
- **A fixed slug `haltung`** - the second page in the repo after
  `app-brieftaube` for which that is right. It is a tool he opens daily, puts
  on his phone and bookmarks; a new slug on the next build would leave the icon
  pointing at nothing. The usual reason for randomness does not apply, because
  the page itself contains nothing: no reading, no key, no photograph - all of
  that is written by his browser and only there.
- **A reference picture rather than absolute angles.** He records once how he
  wants to sit; after that every check measures the deviation from exactly that
  posture. Without it the model is guessing against its own idea of „straight",
  and that is the weaker question.
- **The model measures, the page judges.** What comes back is only degree
  figures plus one German sentence; whether that is „crooked" is computed by
  `index.tsx` against his thresholds. That is what makes the settings mean
  something, and it keeps two readings comparable after he has moved a
  threshold.
- **The signal is rationed**: at most one sound a minute, never below 0.4
  confidence, and pictures with no upper body recognised are discarded rather
  than stored. A signal every ten seconds is a signal he switches off.
- **The API key lives in `localStorage`, not in RxDB.** Every collection is
  published as a WebMCP tool complete with its schema - an agent in the browser
  should be able to read the readings, and a Google key not.

### Changed
- `.claude/ui`: a new accent preset **`health`** (teal, light and dark),
  because there was none for body topics so far and a hex value on the command
  line is not an option (`DESIGN.md`).
- `.claude/ui`: a new component **`<StatusStrip>`** - one bar per reading,
  coloured by result. At one reading every ten seconds the shape of the run
  says more than any single number, and that is not specific to this page.

### Fixed
- `.claude/ui`: `<Input>`, `<Select>` and `<TextArea>` with a `label` now get
  an `id`, so that the `<label for>` actually points at the field. Before,
  every label on every page pointed at nothing: a click did not focus, and a
  screen reader read the field out without a name.

# deshrimp design system

The prose behind `theme.css`. The rules here are the ones that keep the product
looking like one thing; the tokens in `tokens/` are those rules as code.

deshrimp is a browser-based posture tracker. The interface is a **clinical
instrument**: a telemetry readout, not a wellness app. Everything below follows
from that.

---

## Where it lives

```
src/ui/tokens/
  fonts.css        IBM Plex Sans + Mono, vendored (see "Type")
  colors.css       the locked palette
  typography.css   the scale
  spacing.css      4px base, 24px structural constant
  effects.css      radii, hairlines, focus, motion
  bridge.css       the old token names, aliased onto the new ones
  theme-light.css  the inversion
src/ui/fonts/      the woff2 files
src/ui/theme.css   the imports, then how components spend the tokens
src/ui/Tiles.tsx   the page grid, and why its two bounds are held where they are
src/app/styles.css the camera well, the breach state and the readings log -
                   the only page CSS
public/brand/      logo and mark, five variants
```

`bridge.css` is a translation layer, not a second palette. The component library
was written against `--ink`, `--card`, `--s4`, `--r-md`; rather than rename a
variable in forty-five files, every old name is defined there as an alias. New
work should use the design-system names directly, and the file shrinks as
components are rewritten against them.

---

## Colour

Six values, locked. Deep slate ground `#0F172A`; raised card `#273549`; border
and inactive-control slate `#3E4C63` / `#334155`; crisp white ink `#F8FAFC`;
slate-blue secondary ink `#94A3B8`; coral accent `#ff8257`.

**Nothing else.** No second hue, no success green, no warning amber.

### The 10% rule

Accent is a budget, not a palette entry. It is permitted on:

- the primary trigger in its default state,
- an active/engaged indicator dot,
- a breached readout,
- a breached bar fill,
- the threshold reference line on a chart,
- the 3px breach stroke.

If two accent elements are visible at once and neither is a breach, one is
wrong.

### Severity without hues

Severity is carried by **whether the accent appears**, not by a range of
colours. As a three-step ladder that is: white ink (within tolerance) → slate
(worth noticing) → coral (breached). The old `--ok` / `--warn` / `--bad`
semantic names still resolve - to those three, via `bridge.css` - so the
sixty-bar status strip and the tab icon keep their reading without a second hue.

### Light mode

Not in the original brief; added on request. Scoped in `theme-light.css`, so
every component flips with no code change. The value ladder inverts (ground
`#F8FAFC`, card `#FFFFFF`, inset `#F1F5F9`, border `#CBD5E1`, ink `#1E293B`,
secondary ink `#475569`) and white telemetry fills become ink-dark.

Three selectors for two states: the media query is what a page shows before
anyone has pressed anything, and `[data-theme]` is an explicit choice that wins
in both directions. Dark is what the system was drawn for and what a page with
no signal either way gets.

---

## Type

IBM Plex Sans for interface text (400-700). IBM Plex Mono with
`font-variant-numeric: tabular-nums` for **every** number in the product,
including small captions - numbers must not reflow as they tick.

| | size | use |
| --- | --- | --- |
| `--text-metric-xl` | 56px | the one session metric a view leads with |
| `--text-metric` | 32px | telemetry readout |
| `--text-display` | 28px | page title, bold, −0.02em |
| `--text-lg` | 18px | the xl button |
| `--text-base` | 14px | body |
| `--text-sm` | 13px | secondary |
| `--text-label` | 11px | every label, uppercase, 0.09em tracked |

Line height 1.1 for numerals and titles, 1.45 for prose.

**Casing.** Sentence case for prose and switch labels. UPPERCASE with 0.09em
tracking for every label, card title, metric name and axis name. The wordmark
`deshrimp` is always lowercase.

The fonts are **vendored, not imported from Google**. The design system ships an
`@import` from `fonts.googleapis.com`; this page installs and has to keep
working with the network gone, and a render-blocking request to a third party is
the one thing that cannot survive that. Sans is a variable font - one file per
subset covers 400-700 - so its four weights are one `@font-face` with a weight
range. Chinese and Japanese fall through to the system stack; IBM Plex has no
CJK in this family.

---

## Space and layout

4px base step. **24px card padding and 24px grid gap are structural
constants** - deviating from them is the fastest way to break the look.
Generous negative space inside cards: a card with three rows of content and 24px
padding is correct; a card with twelve is two cards.

24px page gutter, 1400px maximum content width.

### The page is one grid

Not a stack of sections. Every readout is a **tile** in a single grid whose
columns are **at least 330px and at most 660px**, as many as fit, sharing the
row between them - one column on a phone, two on a tablet, three on a desk
monitor, with no breakpoint written anywhere. `Tiles.tsx` holds the mechanism
and the reason the 660px cap sits on the tile rather than on the track.

Tiles stretch to the height of their row, so a row reads as one band. That is
also the constraint on what may go in one: anything that grows without a bound
- a table of every reading - is capped and scrolls inside its own tile, because
otherwise it sets the height of its whole row and leaves its neighbours as tall
empty cards.

Every tile carries a **stable, untranslated id** (`video`, `daychart`,
`thresholds`), so it can be linked to and named. Titles are translated; ids are
not. Nothing spans two columns: two columns plus the gap is 684px, past what a
tile is allowed to be.

**The grid has two lengths.** Zen is the three tiles that answer the question
the page is opened with; the dashboard is every tile it has. The switch between
them is a ghost button inside the tile that holds the controls, third in a row
whose weight descends - accent fill, outline, ghost - and it names the view it
leads to rather than the one you are in. Nothing else marks the mode: a page
with three tiles on it is visibly a page with three tiles on it.

Because there are no section headings any more, **a tile title carries its own
scope**. Two charts both plot "share of time sitting straight" - one over the
last half hour, one over whole days - so their titles are composed from the
words that used to be the section heading: `The last while · Share of time
sitting straight` against `Trend across the days · Share of time sitting
straight`.

---

## Surfaces

- **Flat colour only.** No gradients anywhere, including "subtle" ones. No
  photography, illustration, texture, noise, grain, repeating pattern or
  full-bleed imagery. The only depth cue is the two-step value ladder
  (`#0F172A` → `#273549`), and inset elements step back *down*.
- **Cards.** `#273549`, 1px `#3E4C63`, 8px, 24px padding, **no shadow**. The
  title is an 11px uppercase tracked eyebrow, not a heading-size string. Insets
  sit at `#1E293B` with the same hairline and 6px. Never nest a card inside a
  card at the same surface value.
- **Borders over shadows.** The system separates with hairlines, not elevation.
  Three of the four old elevation steps now resolve to `none`; `--shadow-card`
  survives for the two things that genuinely leave the page - a dialog in the
  top layer and the toast.
- **Radii.** 4px (bars, small tiles), 6px (buttons, fields, stat tiles), 8px
  (cards, camera well), pill (switches, status pills, telemetry tracks). Nothing
  above 8px on a container.
- **Transparency and blur.** Almost never. Two sanctioned uses: a status pill
  over live video (`--scrim` + `blur(6px)`), and `--accent-soft` for a breach row
  wash. Text is never set at reduced opacity - secondary text uses the slate at
  full opacity so contrast stays measurable.

### Native widgets

A `<select>`'s dropdown, a scrollbar and a focus ring are drawn by the platform
and cannot be styled. The one lever is `color-scheme`, which must follow the
theme: `dark` on bare `:root`, flipped to `light` in both light blocks. Left at
`dark light` it says "either, prefer dark" and a light page gets a dark
dropdown. An `<option>`'s own colours are honoured everywhere except macOS, so
they are set too and `color-scheme` is the whole of the fix there.

The chevron on a closed select is a data URI, so it cannot inherit a token: it
is drawn twice, once in each theme's secondary slate.

### Sliders, not number fields

A bounded number is a slider. A tolerance is a dial you feel your way to, not a
figure you know in advance and type, and the README says as much: treat the
three numbers as dials. The track is the telemetry track (4px, pill, inactive
slate behind, white fill in front) and the value sits above it, right aligned,
in tabular mono because it changes while you drag.

A dial you feel your way to is also a dial you can lose your place on, so a
slider carries two things besides its track:

- **The default, marked on the track.** A 1px hairline in secondary slate,
  placed along the thumb's travel rather than the track's width, so it lands on
  the number it names instead of half a thumb off at the ends. It is drawn over
  the rail and over the thumb, not behind them: a reference mark that
  disappears under the thumb disappears exactly while you are dragging past it.
- **A stepper.** Minus and plus either side, 28px rather than the 40px every
  other control is, because a 40px box either side of a 4px track reads as two
  buttons with a line between them. Each is one `step` and each disables at its
  end of the range. Dragging is for finding a value, the stepper is for landing
  on it.

The stepper takes 80px out of the row, which is why the tile holding the three
tolerances is one column rather than two: at two, a slider had about 100px of
track left, and 40 degrees across 100px is not a dial you can feel your way
along.

**Reset is one button for the group, not one per slider.** It sits at the foot
of the tile as a ghost button, disabled while every slider is already at its
default, and it puts back the same numbers the marks are drawn from, so the
button and the marks cannot disagree.

**A slider's positions need not be its values.** The pace is eight intervals
from one second to two minutes, so the slider runs over the index and `format`
writes what that index means; a linear slider from 1 to 120 would spend seven
eighths of its travel on intervals nobody picks. The readout and the mark's
tooltip go through the same `format`, so they cannot say different things.

---

## Motion and states

Functional only. 120ms for state snaps (border width, colour), 180ms for value
transitions (bar width, ring dash), `cubic-bezier(.4,0,.2,1)`.

- **Hover:** opacity `.88`. Nothing else - no colour change, no lift, no border
  brightening.
- **Press:** no transform. The state change is the feedback.
- **Focus:** 2px background offset + 2px accent ring.
- **Disabled:** opacity `.4`, `not-allowed`.

No entrance animations, no staggered reveals, no bounce, no spring, no skeleton
shimmer, no page transitions.

Two looping animations exist. The first is the sanctioned one: a 900ms opacity
pulse (1 → .45) on a breached readout. The second is the loading spinner, which
is a **deliberate exception** - this page waits on a 17MB pose model, and a
loading indicator that does not move reads as a hang rather than as a wait.
Both stop under `prefers-reduced-motion`.

### Breach - the one dramatic moment

The camera well's 1px hairline snaps to a 3px coral stroke, and the offending
readout's number and label go coral and pulse. Nothing moves, nothing shakes,
nothing enlarges.

---

## Iconography

The dashboard is deliberately near-iconless: status is carried by 6px dots,
uppercase labels, borders and numbers.

Where a glyph is genuinely needed it comes from `Icon.tsx` - a closed set of
24×24 stroked outlines at `stroke-width: 1.5` in `currentColor`. The geometry is
**Lucide's**, which is a substitution rather than a brand decision: no icon set
was supplied. The paths are inlined rather than loaded from the CDN the design
system suggests, for the same offline reason as the fonts.

- Never emoji as an icon.
- Never unicode symbols (✓ ✕ ▲) as affordances.
- Never filled or duotone styles.
- Never an icon in accent unless it marks a breach.

Where an icon stands alone it takes the words as its `title` and `aria-label`,
which is the whole of what makes an icon-only button acceptable. The share
button is the one that earns it, and the glyph is the three-node graph
(Lucide's `share-2`), which is the one he picked. Neither share glyph is a
picture of anything, so the `title` and `aria-label` are not a courtesy here,
they are what says what the button does.

Two `<Table>` sort arrows (`▲ ▼ ↕`) are still unicode. They predate this file
and are the last of them.

---

## Charts

The locked palette has no categorical set, and inventing one would be inventing
a brand. The six series slots are the three legible values in order - white
ink, slate, coral - with the darker slates behind them. This product plots three
lines, which is what that reads well at. A third simultaneous line does spend
accent budget; past six series `seriesColor` stops handing out values, because
the answer there is to split the chart.

Axes are furniture: hairline, no tick lines, no axis line, 11px mono ticks with
tabular figures.

**A chart with no rows is still drawn, and says so.** The grid and the axes are
never replaced by a paragraph - an axis names what is being measured and on
what scale, and swapping the two makes a tile jump the moment the first reading
lands. A chart with *nothing* in it carries one line of text laid over the grid
instead, in a bordered chip so it reads against the gridlines. One point is
data and gets no caption. The tile itself is rendered either way: a whole tile
that appears on the fourth day is a page that rearranges itself under the
person reading it.

---

## Open questions

Three things need a decision from whoever owns the brand. All three are
implemented **as the design system specifies**; none is silently deviated from.

### 1. White on coral fails contrast in dark mode

`--text-on-accent` is `#ffffff` and the dark-mode accent is `#ff8257`. White on
that coral measures **2.47:1** - below the 4.5:1 AA needs for 14px text and
below the 3:1 for a UI component. It is on the primary trigger, which is the
most important control on the page.

Light mode is fine: the accent deepens to `#E14E1D` there and white reaches
4.4:1.

The fix is one line in `tokens/colors.css` - `--text-on-accent: var(--slate-950)`,
which measures 6.99:1 and keeps the coral exactly as specified. It is not
applied because `#ffffff` is a locked token and the palette is the brand's call,
not the implementation's.

### 2. The two light-mode substitutions

Carried over from the design system's own readme, and still awaiting
confirmation there: secondary ink is `#475569` rather than `#94A3B8` (which
measures 2.2:1 on `#F8FAFC`), and coral deepens to `#E14E1D` for anything that
must hold contrast on white. `#ff8257` survives as `--accent-bright`.

### 3. Emoji in the title and the language picker

The design system says emoji never - not in UI, not in copy. Two places still
have them, both deliberately:

- **The page title.** `CHANGELOG.md` records „Titel exakt … mit Ausrufezeichen
  und Emoji, in beiden Sprachen" - the owner asked for that wording, emoji
  included, in every language. A design system handed over later does not get to
  overrule a recorded decision by the person whose product it is. Stripping it is
  a one-character edit across twelve locale files whenever he says so.
- **The language picker's flags.** Those are locale identity rather than
  affordances, and replacing them means drawing twelve flags.

Everything else in the interface is drawn.

---

## What this system does not cover

The design system's **content rules** - register, vocabulary (*breach* not "bad
posture", *tolerance* not "goal"), person, number precision - are not
implemented. Applying them means rewriting the copy in twelve languages, which
is a translation project and not a re-skin. They are worth doing; they are not
done here.

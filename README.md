# deshrimp - „Sitz aufrecht du Garnele!" 🦐

A page that watches how you sit. Every second it takes one webcam frame, reads
three angles out of it, and makes a noise when you have folded up again.

Everything happens on your device. A pose model runs in the browser, the page
does the trigonometry itself, and what it records goes into a local database.
No key, no quota, no account, and no frame ever leaves the machine.

## Getting started

```bash
npm install     # also fetches the pose model into public/mp/
npm run dev     # http://localhost:5173
npm run build   # typecheck, then a static site in dist/
npm run preview # serve dist/ as it will actually be served
```

The page needs `https` or `localhost` - `getUserMedia` will not hand a camera
to a `file://` document.

## The three angles

| | measured as | why |
| --- | --- | --- |
| **head in front of the shoulders** | shoulder midpoint → **ear** midpoint, against vertical | the reason the page exists |
| **shoulder tilt** | shoulder line against horizontal | leaning onto one elbow |
| **head tilt** | eye line against the shoulder line | head cocked to one side |

All three are ratios between lengths on **your own body**, so there is nothing
to calibrate, height does not matter, and the page starts measuring on the first
frame. The head angle is taken at the **ear**, not the nose: everyone's nose
sits far in front of their shoulders, so a nose-based number is mostly face
geometry and needs a personal reference photo to mean anything.

**It is not the craniovertebral angle.** The clinical value runs from *C7* to
the tragus and needs a side profile; C7 is behind the shoulder line and no pose
model reports it. Same idea, different origin, different scale - the 48-50°
from the literature must never be compared against this number. It is good for
comparing you against yourself, not for a diagnosis.

**The thresholds are set, not established.** 18° / 8° / 10°. The only widely
established cutoff for head posture is the CVA, which this cannot measure, and
for lateral trunk or shoulder tilt the literature gives no degree limit at all.
What *is* established is that sustained deviation carries the risk, not any
single moment. So treat the three numbers as dials: too much beeping means
raise the limit.

**What it cannot see** is the whole upper body sinking down - that needs the
hips, and in a desk-sized crop they come back with a visibility of 0.01 against
1.00 for shoulders and ears.

## Other things it does

- **Thirteen languages**, switchable top right: de · en · es · fr · it · pt ·
  nl · pl · tr · ru · zh · ja · ka. First visit picks stored choice → browser
  language → English.
- **The alarm ramps.** It sounds on *every* crooked reading, starting at a
  quarter volume and reaching full after four in a row; one good reading resets
  it. A signal always at full volume is a signal you switch off.
- **The tab icon turns** green, yellow or red, so the page still says something
  while it sits behind your work.
- **Raw readings expire after two days** (at 1 Hz that is tens of thousands of
  rows a day), but one **row per day survives forever** - that is what the
  history over weeks is built from.
- **Your data stays yours.** The ⇅ button exports and imports a JSON file, and
  can sync to another device peer-to-peer, to Google Drive or to OneDrive. All
  of it is off until you press something.
- **It installs, and it works offline.** A service worker precaches the page,
  the icon and all six sounds, so the alarm still fires with the network gone.
  The pose model is cached the first time the camera runs rather than up front -
  it is 17 MB, and paying that during install would look like a hang.
- **It never asks for the camera on load.** The whole page - the angles, the
  sounds, the history - is there to read first; `getUserMedia` runs on the
  ▶ button and nowhere else.

## Layout

```
index.html          the shell
vite.config.ts      four path aliases, a build stamp, and two build-only plugins
src/
  main.tsx          entry: pulls in the CSS, fills the page payload, mounts
  app/              this app - App.tsx, db.ts, pose.ts, thirteen i18n tables,
                    styles.css, data.json (the written content), app.config.ts
  ui/               the components this app uses - 38 of them - plus theme.css
                    and tokens/, the design system they are all built from,
                    fonts/ (IBM Plex, vendored), and DESIGN.md, the rules in
                    prose
  lib/              the runtime layer: RxDB setup, the ⇅ sync modal, a chart
                    wrapper around Recharts, small hooks
scripts/            fetch-pose-model.mjs and the digests it enforces;
                    seo.mjs and pwa.mjs, which only run on `npm run build`
public/             served as-is: the six alarm sounds, icon, manifest,
                    brand/ (logo and mark), and (fetched, not committed) the
                    pose model in mp/
```

Four aliases keep the app's own imports readable - `@ui` the components, `@db`
the local database, `@app` the page config, `@charts` the diagrams. They are
declared once in `vite.config.ts` and once in `tsconfig.json` and point at
ordinary folders.

## How it looks

**The page is one grid of tiles**, not a stack of sections. Columns are at least
330px and at most 660px, as many as fit, sharing the row between them - one
column on a phone, three on a desk monitor, and no breakpoint written anywhere.
Every tile has a stable id (`video`, `controls`, `daychart`, `thresholds`), so
one can be pointed at by name.

**It opens in zen: three of those tiles and nothing else** - the camera, the
button that starts it, and the three angles off the last picture. That is the
question you open the page with. The curves, the log, the trend across days,
the thresholds and the written explanation are the dashboard, and a two-segment
switch at the foot of the control tile, under the sound select, moves between
them: zen on the left, dashboard on the right. The choice is stored with the
settings, so it survives a reload.

The interface is the **deshrimp design system**: a clinical instrument rather
than a wellness app. Six colours, locked - slate ground, slate card, hairline
border, white ink, slate-blue secondary ink, and a coral accent that is a budget
rather than a palette entry. IBM Plex Sans for words, IBM Plex Mono with tabular
figures for every number, so a value does not reflow while it ticks. Borders
instead of shadows, nothing rounder than 8px, no gradients, and motion only
where it carries information.

Severity is carried by *whether* the coral appears, not by a range of colours:
there is no success green and no warning amber anywhere in the product. The one
dramatic moment is a breach - the camera well's hairline snaps to a 3px coral
stroke and the offending readout pulses. Nothing moves, nothing shakes.

Dark is what it was drawn for; light is a scoped inversion and the toggle still
works in both directions. The rules, the tokens and the three things still
waiting on a decision from him are in **`src/ui/DESIGN.md`**.

`src/ui` holds **only what this app renders**. It came from a shared library
built for several different pages, and the rest of it - shop listings, maps,
recipe cards, chat bubbles - was cut rather than carried along, along with the
CSS that styled it. Nothing here is a general-purpose component kit; it is this
page's components, and they are free to change shape as this page needs.

## What the build adds

`npm run dev` is the app and nothing else. `npm run build` runs two small
plugins on top of it, both `apply: 'build'`:

- **`scripts/seo.mjs`** writes the head - title, description, canonical,
  hreflang, Open Graph, Twitter, a `SoftwareApplication` JSON-LD block - and
  renders the intro and the five steps into `#root` as plain HTML. Then it
  writes the thirteen per-language pages, `sitemap.xml` and `robots.txt` (see
  [One URL per language](#one-url-per-language)).

  This is prerendering, not server-side rendering, and the difference is the
  point: the page's claim is that no server exists, so rendering per request is
  not on the table. Rendering `<App/>` with `renderToString` would return an
  empty shell anyway - it sits inside `<DatabaseGate>`, which shows its fallback
  until RxDB opens, which never happens outside a browser. So the crawlable copy
  is built from `data.json`, the same source the app renders from, and a crawler
  reads the words a reader sees. React throws the block away on mount, so it
  doubles as the first paint.

  The title and the description live in `src/app/seo.json`, once per language,
  because the app needs them too: `Page` sets `document.title`, so without that
  the tab - and any crawler that runs the JS - would show the h1 instead. The
  h1 in the app stays the joke; the tab and the search result say what this is.

- **`scripts/pwa.mjs`** emits `sw.js` with a precache list taken from the real
  bundle, so the hashed filenames are right and a new build retires the old
  cache by name. A manifest alone does not make a page installable - Chromium
  wants a service worker with a fetch handler first.

`public/CNAME` carries the domain, and `.github/workflows/deploy.yml` builds
every push to `master` and force-pushes `dist/` to the `github-pages` branch. It
refuses to publish a build whose `dist/mp/` is empty, because that failure is
otherwise silent: the page loads and the camera loop simply never runs.

### One URL per language

The site is thirteen pages, not one page with a language setting:

    https://deshrimp.com/            the browser's language, and the x-default
    https://deshrimp.com/de.html     German
    https://deshrimp.com/ja.html     Japanese, and eleven more like it

They are one build, not thirteen. `scripts/seo.mjs` renders the shipped shell
once per language after the bundle is written, so every page carries the same
hashed assets and differs in four things: the `<html lang>`, the head, the
prerendered copy taken from that language's `data.json` entry, and one line of
script setting `window.__APP_LANG__` before the bundle runs.

That global is the whole app-side mechanism (`src/app/lang-url.ts`). It
outranks both the browser detection and the stored setting, because a URL that
says `de.html` and renders English is a URL that lies - and it turns the
language picker in the top bar into a link: picking Japanese on `/de.html`
stores the choice and goes to `/ja.html`. At the root, and in `npm run dev`
where the files do not exist, the global is absent, detection decides and the
picker switches in place as it always did.

The reason for any of it is that thirteen translations behind one URL are
invisible: a crawler fetches a page once, in one language, and indexes what it
got. Every page lists every other as an `hreflang` alternate and `sitemap.xml`
repeats the set, so a search engine reads the thirteen as one page in thirteen
languages rather than as thirteen pages competing for the same words.

The service worker precaches all thirteen, so an installed `/de.html` still
opens in German with the network gone.

### Pull request previews

Every pull request from this repository gets a deployed preview of its latest
commit, built by `.github/workflows/pr-preview.yml` and published to a subpath
of the live site on the same `github-pages` branch:

    https://deshrimp.com/pr-preview/<pr>/commit-<sha>/

The workflow posts the URL as a comment on the PR and re-posts it on every push,
so the comment always names the current commit. The previous commit's directory
is removed in the same publish, and closing or merging the PR removes the
preview altogether. Previews are full builds (pose model included) and work from
the subpath because Vite is configured with `base: './'` and the app resolves
`mp/` relative to `location.href`.

The prod deploy carries the `pr-preview/` directory over into each fresh
`github-pages` commit and pushes with `--force-with-lease`, retrying onto the new
tip when a preview lands mid-deploy, so a push to `master` never takes an open
PR's preview down. PRs from forks get no preview: their token cannot push to the
branch.

## The pose model

`npm install` runs `scripts/fetch-pose-model.mjs`, which puts four files into
`public/mp/`. Three are copied out of `@mediapipe/tasks-vision`, an ordinary
dependency - copied rather than imported because the WASM loader fetches its
`.wasm` sibling by URL at runtime, so the two have to sit together in a served
folder. The fourth is the model weights, which are not on npm and are fetched
from Google's model storage.

None of it is committed: ~17 MB in git history is paid by every clone forever,
and no version of it could ever be removed. Every file is checked against a
pinned SHA-256 in `scripts/pose-model.sha256`, and a mismatch fails the script
- this code runs in a browser with camera access, where "probably the right
binary" is not good enough. The script is idempotent, so a second
`npm install` costs nothing.

## The sounds

Fart, throat-clear, scream, knuckle-crack, whip crack, rimshot - six bundled
sound files in `public/snd/`. Oscillators remain as a fallback, one waveform
per sound, because a posture watcher whose signal is silent is not one.

These *are* committed, which is the opposite of the rule applied to the model:
that one is a third-party binary, re-fetchable from a pinned URL at any time.
These ~200 KB exist nowhere else.

## Privacy

The camera frame goes to a `<canvas>`, to the pose model, and nowhere else.
What the page stores - readings, daily rows, settings - lives in IndexedDB on
the device that recorded it. There is no server, so there is nothing to opt out
of; the sync options behind the ⇅ button are the only ways data moves, and each
one waits for a button.

# deshrimp — „Sitz aufrecht du Garnele!" 🦐

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

The page needs `https` or `localhost` — `getUserMedia` will not hand a camera
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
model reports it. Same idea, different origin, different scale — the 48–50°
from the literature must never be compared against this number. It is good for
comparing you against yourself, not for a diagnosis.

**The thresholds are set, not established.** 18° / 8° / 10°. The only widely
established cutoff for head posture is the CVA, which this cannot measure, and
for lateral trunk or shoulder tilt the literature gives no degree limit at all.
What *is* established is that sustained deviation carries the risk, not any
single moment. So treat the three numbers as dials: too much beeping means
raise the limit.

**What it cannot see** is the whole upper body sinking down — that needs the
hips, and in a desk-sized crop they come back with a visibility of 0.01 against
1.00 for shoulders and ears.

## Other things it does

- **Twelve languages**, switchable top right: de · en · es · fr · it · pt · nl ·
  pl · tr · ru · zh · ja. First visit picks stored choice → browser language →
  English.
- **The alarm ramps.** It sounds on *every* crooked reading, starting at a
  quarter volume and reaching full after four in a row; one good reading resets
  it. A signal always at full volume is a signal you switch off.
- **The tab icon turns** green, yellow or red, so the page still says something
  while it sits behind your work.
- **Raw readings expire after two days** (at 1 Hz that is tens of thousands of
  rows a day), but one **row per day survives forever** — that is what the
  history over weeks is built from.
- **Your data stays yours.** The ⇅ button exports and imports a JSON file, and
  can sync to another device peer-to-peer, to Google Drive or to OneDrive. All
  of it is off until you press something.

## Layout

```
index.html          the shell; data-accent picks the palette
vite.config.ts      four path aliases and a build stamp — that is the whole build
src/
  main.tsx          entry: pulls in the CSS, fills the page payload, mounts
  app/              this app — App.tsx, db.ts, pose.ts, twelve i18n tables,
                    styles.css, data.json (the written content), app.config.ts
  ui/               the component library: ~90 React components + theme.css,
                    which is the design tokens every component is built from
  lib/              the runtime layer: RxDB setup, the ⇅ sync modal, chart
                    wrappers around Recharts, small hooks
scripts/            fetch-pose-model.mjs and the digests it enforces
public/             served as-is: the five alarm sounds, icon, manifest, and
                    (fetched, not committed) the pose model in mp/
```

Four aliases keep the app's own imports readable — `@ui` the components, `@db`
the local database, `@app` the page config, `@charts` the diagrams. They are
declared once in `vite.config.ts` and once in `tsconfig.json` and point at
ordinary folders.

## The pose model

`npm install` runs `scripts/fetch-pose-model.mjs`, which puts four files into
`public/mp/`. Three are copied out of `@mediapipe/tasks-vision`, an ordinary
dependency — copied rather than imported because the WASM loader fetches its
`.wasm` sibling by URL at runtime, so the two have to sit together in a served
folder. The fourth is the model weights, which are not on npm and are fetched
from Google's model storage.

None of it is committed: ~17 MB in git history is paid by every clone forever,
and no version of it could ever be removed. Every file is checked against a
pinned SHA-256 in `scripts/pose-model.sha256`, and a mismatch fails the script
— this code runs in a browser with camera access, where "probably the right
binary" is not good enough. The script is idempotent, so a second
`npm install` costs nothing.

## The sounds

Fart, throat-clear, scream, knuckle-crack, rimshot — five real recordings in
`public/snd/`. Oscillators remain as a fallback, one waveform per sound,
because a posture watcher whose signal is silent is not one.

These *are* committed, which is the opposite of the rule applied to the model:
that one is a third-party binary, re-fetchable from a pinned URL at any time.
These ~200 KB exist nowhere else.

## Privacy

The camera frame goes to a `<canvas>`, to the pose model, and nowhere else.
What the page stores — readings, daily rows, settings — lives in IndexedDB on
the device that recorded it. There is no server, so there is nothing to opt out
of; the sync options behind the ⇅ button are the only ways data moves, and each
one waits for a button.

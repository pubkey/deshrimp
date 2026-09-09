# Open source, and what Hacker News says about camera apps

The code half of the landscape: who has built this on GitHub, how commoditized
the idea is, and what people actually object to when one of these is posted.
Checked **9 September 2026** via the GitHub search API and the Hacker News
Algolia API (full comment trees downloaded and read).

## The idea is commoditized. Completely.

| GitHub repo search | Repos |
| --- | --- |
| `posture detection in:name,description` | **2 177** |
| `posture webcam in:name,description,readme` | **8 264** |
| `posture in:name stars:>15` | 49, of which ~15 are unrelated security-posture repos |
| `slouch in:name,description stars:>3` | 24, of which ~10 are unrelated |

Thousands of attempts, and **fewer than 25 repositories worldwide have more than
15 stars for desk posture specifically**. The long tail is coursework,
notebooks and one-weekend builds.

It is also a canonical tutorial. [LearnOpenCV's "Building a Body Posture
Analysis System using MediaPipe"](https://learnopencv.com/building-a-body-posture-analysis-system-using-mediapipe/)
is the reference implementation most Python posture repos are copied from;
dev.to has [MediaPipe + Electron](https://dev.to/wellallytech/stop-slouching-build-a-real-time-ai-posture-monitor-with-mediapipe-and-electron-5fl9),
Medium has [MediaPipe + React](https://medium.com/@psr8084/building-a-real-time-posture-monitoring-application-with-mediapipe-and-react-a-comprehensive-guide-e7c7a8adc536),
and Stanford CCRMA has it as a homework assignment.

**So "we compute three angles from MediaPipe landmarks in the browser" cannot be
the headline.** It is a homework-level claim in 2026. What is defensible is the
system around it: the retention policy, the aggregation, the sync, the twelve
languages, the no-install delivery, the pinned model hashes.

## The projects that matter

| Project | Stars | Stack | Model | Browser | Calib. | History |
| --- | --- | --- | --- | --- | --- | --- |
| [tldev/dorso](https://github.com/tldev/dorso) | **2 543** | Swift, macOS 13+, MIT | Apple Vision + **AirPods motion** | no | yes | yes |
| [allenv0/AirPosture](https://github.com/allenv0/AirPosture) | **1 044** | Swift | **AirPods only, no camera** | no | yes | — |
| [pyskell/slouchy](https://github.com/pyskell/slouchy) | 792 | Python 2.7, PyQt4, GPL-3.0 | Haar cascades | no | yes | no |
| [monolesan/fix-posture](https://github.com/monolesan/fix-posture) | 204 | ml5.js + p5.js, MIT | PoseNet | **yes** | no | no |
| [DDULDDUCK/pose-nudge](https://github.com/DDULDDUCK/pose-nudge) | 188 | Tauri + React + TS, AGPL-3.0 | own angles | no | — | **yes**, and it has **i18n** |
| [nvinayvarma189/Sitting-Posture-Recognition](https://github.com/nvinayvarma189/Sitting-Posture-Recognition) | 171 | Keras, OpenPose | OpenPose | no | fixed | no |
| [JordiNeil/bad_posture](https://github.com/JordiNeil/bad_posture) | 123 | FastAPI + JS, **no licence** | MediaPipe | served | no | no |
| [itakurah/sitting-posture-detection-yolov5](https://github.com/itakurah/sitting-posture-detection-yolov5) | 94 | YOLOv5s, MIT | custom | no | — | no |
| [killa-kyle/posture-posture-posture](https://github.com/killa-kyle/posture-posture-posture-chrome-extension) | 76 | React + TS, MIT | **MoveNet** | **yes** | yes | no |
| [keera-studios/keera-posture](https://github.com/keera-studios/keera-posture) | 50 | **Haskell** + OpenCV | reference deviation | no | yes | no |
| [vadi2/postured](https://github.com/vadi2/postured) | 24 | Python, D-Bus, GPL-3.0 | MediaPipe | no | no | no |
| [justinshenk/sensei](https://github.com/justinshenk/sensei) | 27 | PyQt5, MIT | Haar cascades | no | yes | a notebook |

Two things fall out of this table.

**Almost nobody keeps history.** Four projects store posture over time at all,
and **nobody syncs across devices**. Two days of raw readings plus one row per
day forever, exportable, with optional peer sync, is genuinely unusual.

**The winner is not browser-based.** dorso went to #1 on Hacker News on 25
January 2026 (**692 points, 223 comments**) and has 2 543 stars eight months
later. Its differentiator was not detection quality. It was the **intervention** —
progressive screen blur — plus OS-native integration, neither of which a tab can
do.

## The uncomfortable table

This is the most important finding in this file. The exact niche this page
occupies — browser only, MediaPipe or TF.js, local-first, calibrated, with
charted history — **is already implemented several times over, and has attracted
essentially nobody**.

| Project | Stars | What it is |
| --- | --- | --- |
| [beausome/nerd-neck](https://github.com/beausome/nerd-neck) | **1** | React 18, TypeScript, **Vite**, TF.js MoveNet, **Recharts**, Tailwind, MIT. "Pose detection runs entirely client-side"; "frames are read from the `<video>` element and discarded — never uploaded, never stored"; calibration; **7-day history charted**; streaks and points. Live on GitHub Pages. |
| [shoali2023/posture-pilot](https://github.com/shoali2023/posture-pilot) | **0** | React + TypeScript + Vite + MediaPipe + WASM, topics `local-first`, `hci`, `wellness`. Skeleton overlay, calibration, habit analytics. |
| ~33 further TypeScript repos found by code-searching `tasks-vision` + `PoseLandmarker` + posture | all ≤4 | none of them broke four stars |

The absence of a browser winner is not a gap waiting for better engineering. It
is evidence that **the browser is not where this category's users are being
reached**. dorso proves the audience exists. It captured them with a native app
and an intervention that is impossible in a tab.

## The three technical camps

| Camp | Sensor | Can it see forward head directly? | Examples |
| --- | --- | --- | --- |
| **Frontal webcam** | laptop camera | **No.** Proxies only | fix-posture, postured, bad_posture, nerd-neck, **this page** |
| **Lateral webcam** | a second camera at your side | **Yes** — it matches the clinical protocol | nvinayvarma189 (whose README says a front view "will not work"), itakurah |
| **Head-mounted IMU** | AirPods Pro/Max/3 | **Yes**, head pitch directly | AirPosture (1 044), workwell, posture-fix, dorso as an option |

The IMU camp is the fastest-growing since mid-2025 and is the **strongest
structural competitor**, because it neutralises every objection below at once:
no camera, no LED, no CPU, no privacy argument.

## What Hacker News actually objects to

| Thread | Points | Comments |
| --- | --- | --- |
| [dorso — "blurs your screen when you slouch"](https://news.ycombinator.com/item?id=46754944), Jan 2026 | **692** | **223** |
| [Show HN: Slouch Stoppah](https://news.ycombinator.com/item?id=21239930), 2019 | 153 | 44 |
| [Slouchy](https://news.ycombinator.com/item?id=10378163), 2015 | 99 | 26 |
| [Ask HN: forward head posture](https://news.ycombinator.com/item?id=47376169), Mar 2026 | 60 | 44 |
| [Launch HN: Zen (YC S21)](https://news.ycombinator.com/item?id=28278618), 2021 | 53 | 38 |
| [postured — the Linux version, posted two days after dorso](https://news.ycombinator.com/item?id=46768639) | **2** | 1 |

That last row is the shape of this category: one big hit and dozens of
near-zero posts. The *same idea* on Linux, two days later, got two points.

### The camera is the blocker

> "I think the idea is wonderful, but a **not-audited application that uses
> things like the camera is a 'no go'** for me."

> "I would not want a camera on 24/7… It'd **defeat the small LED which informs
> you it is on** (since it is always-on), and if the machine is compromised this
> is a method to receive personal data."

> "Not all of us have web cams, or are **willing to tolerate them from a security
> perspective**."

The LED point is a second-order privacy cost a browser tab shares **fully**. A
tab holding `getUserMedia` all day keeps the camera indicator lit permanently
and destroys its signal value. See the recommendations below.

### "Open source" is necessary and not sufficient

The longest sub-thread under dorso was about whether MIT source is enough to
trust a camera app.

> "It's literally a single .swift file. Ask your LLM to audit it."
> — "then **I need to get someone to audit the LLM**… if you use code you can't
> trust to audit code you can't trust, you're not doing an audit at all"

> "how do you know at the end of the day that **the compiled binary hasn't been
> tampered with**… the best you can do for this is compile it yourself."

> "'The Great Suspender' was an example of a beautiful open source little app
> that, one glorious day, **switched hands**… A piece of code that requires
> access to my camera, regardless of size."

**A web app served from a URL is on the wrong side of half of this argument.**
Nobody can verify the JS served today matches the repo, there is no notarization,
and pinning the model SHA-256 protects the builder rather than the visitor.

But it is on the *right* side of the other half, and uniquely so: **a browser tab
is sandboxed and its network traffic is inspectable in DevTools**. Nobody in this
competitive set makes that argument. "Open the Network tab and watch: nothing
leaves" is the strongest available answer to "I can't audit your binary", and it
is something the user executes themselves. That should be on the page, not this
folder.

(The author of dorso ended up paying Apple for notarization because of this
thread, and a user still hit *"It keeps saying 'Apple could not verify
Posturr.app is free of malware'"* — friction a page does not have.)

### CPU, and the one number we should lead with

> "**Guzzles my CPU**, cool though! Would use if it didn't **eat up half a core**
> to boot."
> Author's reply: "I reduced the vision processing to about **10 fps** as well as
> reduced camera resolution. I saw about an **80% reduction in CPU**!"

> "the app tends to use **15% of my CPU constantly**."

And from the 2019 Slouch Stoppah thread:

> "It'd be better if it maybe just started/stopped capturing every N minutes or
> **even just used photos instead of video**?"

**One frame per second is roughly a tenth of what dorso runs after its emergency
optimisation, and a hundredth of a naive 30 fps loop.** It is the direct answer
to a complaint HN made in 2019 and made again in 2026, and it is currently a
footnote rather than a headline. It should be a measured number — watts, percent
of a core — not an adjective. Caveat before claiming: WASM in a tab is less power
efficient than Apple's Vision framework on Apple silicon, so measure first.

### "There is no such thing as good posture"

Louder on HN than product people expect, and it was among the highest-signal
parts of the dorso thread.

> "there is no such thing as 'good posture'… **slouching isnt bad, remaining in
> the same posture for a long time is**… The popular attachment to specific
> configurations of your joints that look aesthetically acceptable is orthorexia,
> not science."

> "I've been programming for 40 years… and **I didn't find my ergonomic, no-pain,
> no-RSI happy place until I stopped following advice to sit up straight**…
> Maybe I should write one that blurs the screen when I *don't* slouch."

> "**Staying in upright posture for too long is also not good for you.**"

The top-voted objection **is our thesis restated**. "Sustained deviation, not a
single moment, is the risk" is already in the README, and it is the framing that
converts this critic into an ally — see
[`does-posture-training-work.md`](./does-posture-training-work.md), where it also
turns out to be the best-supported claim in the literature. It should be stated
early and prominently, not as a caveat.

### Platform lock-out — the browser's real opening

> "I don't think Linux has an equivalent of Apple's vision API… which is
> unfortunate, as **I would LOVE to have this on Linux**."
> "Plz make a Windows version :)))"
> Zen thread: "Does this work for Linux?" · "I'm on Linux and it downloaded the
> windows version :)"

dorso's biggest structural weakness is being macOS-only, and the demand in that
thread was loud and unmet. A page is the only delivery form that satisfies all of
it at once. Temper it with the fact that `postured` was posted directly into that
thread and still only reached 24 stars: the demand is real but shallow.

### What the business-model comments say

| Signal | Evidence |
| --- | --- |
| Willingness to pay is real but thin | "**I would pay $10 for this**" was a top comment — answered by "I seriously doubt that he actually would… **Not a good open source monetisation strategy.**" |
| Subscriptions are actively resented | "In perfect world one would made it offline, **release it at fixed price and be done with it**, in our imperfect world it is turned in infinite cash-cow." |
| Onboarding friction kills conversion | "**way too difficult to see if it actually works.** I have to download the app, install, and sign up? **I gave up on your Let's get started screen.**" |
| Model bias gets asked about, and matters | "How much diversity is in your training set?… Can it cope with **ears hidden by hair**, or chunky earrings?" Zen conceded lighting causes inaccuracies. **This applies verbatim to our ear-midpoint landmark.** |
| Stray strings trigger audits | The single most-upvoted question under dorso was what a "Claude Mode" string in the README meant. Copy discipline matters for camera apps. |

### The retention objection we could not evidence

There is **no explicit "I used it for two days and uninstalled it"** comment in
the dorso, Zen, Slouchy or Slouch Stoppah threads. What appears instead is
immediate positive adoption ("it's already improved my posture… it reminds me of
how I now wash my hands for at least twenty seconds because my Apple Watch will
annoy me") and *displacement* — people saying they solved it with a chair or with
exercise and no longer need an app. Treat "abandoned after two days" as a
plausible hypothesis, not a finding. Reddit was unreachable to the research
tooling, and that is where it would show.

## Is "nothing leaves your device" a selling point?

**It is table stakes, not a differentiator.** Necessary to be considered,
insufficient to win.

Required, because every serious competitor leads with it — dorso ("All processing
happens locally on your Mac"), postured, SitApp, Slouch Sniper, Nekoze, SitWit,
nerd-neck ("never uploaded, never stored, never written to disk"). The one
cloud-flavoured competitor took the heaviest trust criticism of any project in
the corpus.

Insufficient, because fix-posture, nerd-neck, posture-pilot, slouch-stoppah and
the Chrome extension all run fully client-side, say so loudly, and have about 320
stars **between them**, dominated by one 2020 project. dorso, which is not
browser-based, has 2 543 on its own.

The exploitable nuance is the DevTools argument above. Nobody else can make it.

## Where this leaves us

**Genuinely differentiated:** 1 fps (nobody advertises this, and it answers the
loudest technical complaint in the corpus); a designed retention policy (nobody
has one — and "raw readings are deleted after 48 hours, one row per day is kept"
is a *privacy* claim about what we do to your data, stronger than "nothing
leaves"); WebRTC peer sync (**nobody**); 12 languages (only pose-nudge has i18n at
all); no install (answers Zen's documented conversion failure); cross-platform by
construction (answers the loudest unmet demand in the dorso thread); pinned model
hashes (nobody does supply-chain hygiene on model weights).

**Structurally weaker:** no system-wide intervention — the winning lever is
degrading the thing the user is looking at, and a tab can only degrade itself
while the user is not looking at it. A companion extension is the obvious answer;
[killa-kyle's](https://github.com/killa-kyle/posture-posture-posture-chrome-extension)
is MIT and proves the pattern. And the camera LED problem is *worse* in a
browser, which suggests something worth building: **acquire the camera for a
fraction of a second per sample and release it**. At one frame a second that is
actually feasible, and it would be a demonstrable privacy property no competitor
has.

## Not verified

- **Reddit is entirely missing.** reddit.com returns 403 to every tool available
  in the research environment and is explicitly blocked from the search API.
  r/SideProject, r/webdev, r/selfhosted, r/ergonomics and r/programming all need
  a manual human pass.
- dorso's actual retention policy and analytics schema are not documented in its
  README; it would need a source read.
- Whether Zen still ships anything webcam-based is ambiguous — see
  [`competitors-webcam-apps.md`](./competitors-webcam-apps.md).
- Naming note, not a competitive concern:
  [`rethyxyz/ShrimpPOV`](https://github.com/rethyxyz/ShrimpPOV) (0 stars, topics
  `shrimp`, `shrimp-posture`) confirms the shrimp-as-hunched-person metaphor is
  already in use here. So does PostuReveal's mascot, and SitSense's
  "Shrimp → Giraffe" rank ladder, and SuperShrimp's entire name.

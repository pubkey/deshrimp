# Mobile apps — the loud tier that mostly senses nothing

iOS and Android are where the word "posture" has the most installs and the least
measurement. This page is about what is actually in those stores, what the
clinical tools do differently, and why a phone is a bad place to put a posture
monitor. Checked **9 September 2026** against the iTunes lookup API, Apple's
public customer-review RSS feeds and Google Play listing HTML.

## The headline: the category is keyword squatting

Of the **top 25 iOS results for "posture"**:

| | Count | Which |
| --- | --- | --- |
| Continuously sense your body while you work | **4** | UPRIGHT (wearable), Posture Pal (AirPods), Align (AirPods), SitTall (camera) |
| …of those, camera-based | **1** | SitTall — which has **2 ratings** |
| Single-shot photo assessment, then nothing | 9 | Posture AI, Statura, PostureScreen, APECS, FlexiTrace, Posturly, … |
| Sense **nothing at all** — exercise videos and/or a timer | **11** | Muscle & Motion, Bend, Perfect Posture, Posture Reminder: Stand Up, Postureletics, … |

Of the **top 24 iOS results for "posture reminder"**, 13 are pure timers and
**not one** is a continuous camera monitor.

Google Play is worse. Ranked by installs:

| Installs | App | Senses? |
| --- | --- | --- |
| **1M+** | Straight Posture (mEL Studio) | no — exercise videos |
| **500K+** | Perfect Posture (EZ Health) | no — exercise videos |
| **500K+** | Posture Correction: Text Neck | no — a questionnaire and reminders |
| **500K+** | APECS | single-shot photogrammetry |
| **100K+** | Muscle & Motion: Posture | no — 3D anatomy education |
| **10K+** | Posture Reminder (Puntogris) | no — timer |
| **10K+** | SmartPosture | phone tilt only |
| **10K+** | PostureScreen Lite | single-shot, manual |
| **100+** | **PostureLens** — the one Android app that does what we do | **yes** |

Zero of the top eight Android apps by install volume sense the user's body at
all. The app that genuinely does has a hundred installs. **Install volume and
technology in this category are almost completely decoupled** — people are
buying stretching videos with the word "posture" in the title.

That is good news for differentiation and bad news for discovery. The route to
users is not the app stores, which is convenient, because this is a page.

## Tier 1 — timers wearing a posture label

Highest volume, zero sensing.

| App | Link | Update | Price | Signal |
| --- | --- | --- | --- | --- |
| Posture Reminder: Stand Up | [id1493102391](https://apps.apple.com/us/app/posture-reminder-stand-up/id1493102391) | v26.1.1, Aug 2026 | free + premium | 4.3 (247), **33 languages** |
| Posture Reminder (Puntogris) | [Play](https://play.google.com/store/apps/details?id=com.puntogris.posture) | Sep 2026 | free, IAP to $299.99 | 10K+, 2.8 (168) |
| Stand Up! The Work Break Timer | [id828244687](https://apps.apple.com/us/app/stand-up-the-work-break-timer/id828244687) | **v1.4.1, March 2018 — abandoned 8 years** | free | **4.7 (4 487)** |
| Straight Posture | [Play](https://play.google.com/store/apps/details?id=melstudio.mback) | Aug 2026 | free, IAP to $39.99 | **1M+**, 4.6 (18.9K) |
| Perfect Posture (EZ Health) | [Play](https://play.google.com/store/apps/details?id=perfectposture.posturecorrection.healthyback.healthyspine.painrelief) | Jun 2026 | IAP **to $79.99** | **500K+**, 4.9 (9.19K) |

What the reviews say about this tier, pulled live from Apple's review feed:

> "Basically Doesn't Function W/O Payment — Won't buy premium? Well, then this
> app sends a reminder every 24 hours."

> "Reminders are good but no way to select done or to track progress."

To be fair, the same feed has genuine five-star reviews ("my back pain has
improved dramatically"). A timer does help some people. It just is not
measurement, and it is the shape the whole category's install base has.

## Tier 2 — phone-tilt apps, which sense the phone, not you

Easy to misread as sensing. **SmartPosture** (10K+ installs), **PosturePal** and
**POZY** read the handset accelerometer. They tell you the angle you are holding
your phone at. On a desk, where the phone lies flat or sits in a pocket, they
know nothing.

## Tier 3 — AirPods head tracking, the real mobile sensing tier

This is the mobile-native answer, and it is the one worth taking seriously,
because it solves continuous hands-free monitoring without propping anything up.

| App | Link | Sensing | Privacy | Price | Rating |
| --- | --- | --- | --- | --- | --- |
| **Posture Pal** | [id1590316152](https://apps.apple.com/us/app/posture-pal-improve-alert/id1590316152) | AirPods 3/Pro/Max head pitch, roll, yaw; background sessions; can duck music | analytics not linked to identity | free; **Pro $19.99 one-off** or $24.99/yr | 4.4 (293), **24 languages** |
| **Align** | [id6740603022](https://apps.apple.com/us/app/align-fix-your-posture/id6740603022) | AirPods tilt + a photo scan + exercises | **cloud; tracks users; "Sensitive Info" and identifiers used for the developer's advertising; photos uploaded** | trial then **$9.99/wk** | 4.7 (548) |
| **Postura** | [id6757496457](https://apps.apple.com/us/app/postura-posture-coach/id6757496457) | AirPods + 20-20-20 eye breaks | local, no account | free + Pro | 5.0 (3), **29 languages** |
| **Slouchless** | [id6782025806](https://apps.apple.com/us/app/id6782025806) | AirPods IMU, falls back to a plain timer. "No camera, no HealthKit" | local | free + Pro | 0 ratings |
| **UPRIGHT** (app for the GO 2) | [id1481438778](https://apps.apple.com/us/app/upright/id1481438778) | the **hardware** wearable | **cloud, tracks across apps** | device **$84** | 4.6 (**3 934**) |

**The structural flaw is in its own reviews.** From the live Posture Pal feed:

> **"It's not about posture"** — "It won't tell you if you're slouching. All it
> does is tell you when your head is down…"

> "I sat at my table with normal posture. To look at my laptop, I naturally have
> to look downward. That alerted the app. But if I keep my head leveled and
> slouch my shoulders, nothing happens."

Head pitch is one number. It cannot see shoulders, so it cannot tell looking down
at your work from folding up, and it fires on every bite of food. Plus the
hardware gate: "Can't use — Don't have AirPods. Not buying any just to use this
app either."

## Tier 4 — continuous camera monitoring, our actual analogues

Thin, new, and nobody is a player yet.

| App | Link | Sensing | Privacy | Calibration | Installs |
| --- | --- | --- | --- | --- | --- |
| **SitTall** | [id6758161806](https://apps.apple.com/us/app/sittall-posture-correction/id6758161806) | front camera, real-time, 5 sensitivity levels | "no data leaves your device" | **yes** | 5.0 (**2 ratings**) |
| **Plumb** | [id6785198606](https://apps.apple.com/us/app/plumb-posture-reminder/id6785198606) | **AirPods by default, or TrueDepth camera** reading head + shoulders | "There are no Plumb servers and no backend — there's nothing to send." No account, ads, trackers or third-party SDKs | **yes** | 0 ratings, **10 languages** |
| **PostureLens** | [Play](https://play.google.com/store/apps/details?id=com.bd6000.turtleneck) | forward head posture, real-time | "100% on-device, no sign-up" | **yes** | **100+** |
| **Posture Reminder AI** | [id1574005886](https://apps.apple.com/us/app/posture-reminder-ai/id1574005886) | **macOS**, webcam pose of head/neck/shoulders | local, licence check at launch | **yes, two poses** | 0 US ratings |
| **Statura** | [iOS](https://apps.apple.com/us/app/statura-posture-corrector/id6787974562) | **single-shot** side photo, score + "posture age" | photos never leave the phone | — | 5+ Android installs |

**PostureLens's own store listing is the single most useful competitive quote in
this segment:**

> **YOU'LL NEED A PHONE STAND.** This isn't a tip — it's how the app works. Fix
> your phone on a stand at desk height, facing you. It has to stay in one place
> for the whole session — that's what lets PostureLens detect the moment your
> posture slips.

Result: 100+ installs.

Plumb is the one to watch. Same philosophy as this page — on-device, no backend,
no account, no trackers, honest about limits ("It can't see your lower back, and
we won't pretend otherwise"), ten languages, and it does *both* AirPods and
camera. Zero ratings today.

## Why a phone is the wrong place for this

Five compounding problems, each of which is documented rather than argued.

**The OS forbids it.** Apple's
[`isMultitaskingCameraAccessSupported`](https://developer.apple.com/documentation/avfoundation/avcapturesession/ismultitaskingcameraaccesssupported)
is true only on an iPad with Stage Manager on an extended display, for apps
declaring `voip` in `UIBackgroundModes`, or with a special entitlement. A
consumer posture app on an iPhone qualifies for none of these: it must be the
**foreground app with the screen awake**. Android allows it through a
camera-typed foreground service, but per
[Android's own docs](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start)
it has to be started from a visible activity and carries a permanent
notification.

**The phone must be physically staged.** See the PostureLens quote. That is a
hardware purchase, desk space, and a daily setup ritual, all before the software
runs.

**The phone is the device you pick up.** A posture monitor has to run unattended
for hours; the phone is the most-interrupted object on the desk, and on iOS every
interruption actively kills camera access by pushing the app out of the
foreground.

**Battery and thermals.** Foreground app plus screen on plus continuous camera
plus on-device inference is close to the worst case for a phone. Our one frame a
second is only defensible because the host is a plugged-in laptop that is
sitting still anyway.

**Geometry.** A phone on a stand sits low and off to one side with a narrow field
of view. A laptop webcam sits at eye height, dead centre, at a fixed repeatable
distance — which is exactly the geometry our three angles want.

**The sentence to lead with is: the screen you are already staring at is the
camera.** No stand, no second device, no setup ritual, no background-permission
fight, no battery anxiety, and the monitoring device is the one that is
physically the reason your posture is bad.

## Where mobile genuinely beats us

Worth being honest, because these cannot be closed by trying harder.

| Their advantage | Why it is real | Can we answer it? |
| --- | --- | --- |
| **AirPods tracking works with the screen off, in a pocket, walking** | Posture Pal, Postura, Slouchless and Plumb monitor with the phone locked. No line of sight, no propping. | **No.** Structurally impossible for a page. |
| **Haptics** | A discreet buzz beats an audible alarm in a shared office. Review complaints about alarm sounds being too quiet, or "it scared me twice", are common. | **Partly** — the tab icon is already a good silent channel. A visual-only mode would help. |
| **Store distribution** | 1M+ installs accrue to apps that rank for "posture" whether they work or not. | **No**, but that funnel delivers users to exercise videos. |
| **HealthKit / Google Fit, watch complications** | Real integration we have none of. | **No.** |
| **Away from the desk — sofa, commute, phone in hand** | This is where "text neck" actually happens. | **No.** Arguably a different product. |

The honest split: **we own sustained desk posture during focused work; the
AirPods tier owns ambient head position everywhere else.** They are
complementary, and nobody currently owns both.

## The clinical tier — a different market, not an overlap

Single-shot, standing, full-body, plumb-line, practitioner-operated, PDF out.

| Product | Method | Price |
| --- | --- | --- |
| **PostureScreen Mobile** ([id405109185](https://apps.apple.com/us/app/posturescreen-mobile/id405109185)) | 2- and 4-view photo posture, **CVA**, pelvic tilt, Q-angle; AI-assisted landmarks with manual confirmation | **$59.99 up front, then $24.99/mo or $249/yr**, plus add-ons ($49.99/mo for AI note generation) |
| **APECS** ([Play](https://play.google.com/store/apps/details?id=corpusnovus.silverblood.apecs)) | photogrammetry, ATSI + POTSI trunk symmetry, Adam's forward bend, valgus/varus | free + IAP; **500K+ installs** |
| **Exer Scan** | CV range-of-motion and gait; **Class II 510(k)-exempt SaMD**, ISO 13485 | enterprise |
| **Kinetisense**, **VALD HumanTrak** | patented markerless 3D capture with depth or infrared hardware | quote only; VALD is a 3-year minimum term |
| **Physitrack** (Nasdaq: PTRK) | exercise prescription and adherence, not posture measurement | from **$23.99 per practitioner per month**; 2025 revenue EUR 13.5M |

This tier has real science behind it. A December 2025 systematic review and
meta-analysis in *Scientific Reports*
([PMC12827935](https://pmc.ncbi.nlm.nih.gov/articles/PMC12827935/)) covering
eight photogrammetry apps found excellent reliability for the **craniovertebral
angle** (inter-rater ICC 0.889, test-retest 0.904, validity 0.938) and head tilt
(0.962), but only moderate test-retest for hip tilt (0.642) — and no SEM or MDC
values, so "clinically meaningful change" cannot be read off these tools.

**Four reasons it is not an overlap:**

1. **Different buyer.** A chiropractor pays $59.99 plus $249/yr, and the reviews
   are frankly about revenue: *"this app has made me more money than any other
   chiropractic product I have ever bought."* We are used by a desk worker, free.
2. **Different temporal shape.** They produce one measurement per visit, months
   apart. We produce one per second and keep a daily row forever. A clinician
   does not want 28 800 samples; a desk worker does not want a two-visit
   comparison.
3. **Different pose.** Standing, full body, landmarked, in a controlled bay
   versus seated, clothed, upper body, in whatever chair and light you have. The
   measurements are not convertible.
4. **Different tolerance for error.** Three degrees off on a report that guides a
   care plan is a problem. Three degrees off on a drift from your own neutral is
   irrelevant, which is the whole reason relative angles are the right design.

The adjacency worth watching is the **consumer single-shot scan tier** (Statura,
Posturly, Posture AI, Align's photo mode) borrowing the clinical visual
language — a score, a "posture age", angle callouts on your photo — without the
rigour. It is where someone gets their "how bad is it" answer before deciding
whether they want a monitor. Top of funnel, not a competitor. A "scan once, then
monitor forever" story is available to us, but it needs a side-profile capture
flow, which is a different geometry from the webcam.

## The digital-MSK giants, and why they do not matter here

| Company | Sensing | Model | Scale |
| --- | --- | --- | --- |
| **Hinge Health** (NYSE: HNGE) | **TrueMotion** — 3D computer vision on the member's own phone, 100+ landmarks in real time | **B2B2C only, $0 to the member** | IPO May 2025; 49% of the Fortune 100 as clients; **2026 revenue guidance $732M** |
| **Sword Health** | motion tracking, AI care platform | B2B2C, employer and health-plan funded | **$4B valuation**, ~$240M ARR |
| **Kaia Health** | Motion Coach — front camera analysing PT exercise form | B2B2C; its own listing says *"Kaia is currently not available on a self-pay basis"* | **acquired by Sword for $285M, January 2026**; its US MSK product is being retired |

They are enormous, camera-based and completely uninterested in self-pay
individuals. If anything they help: they normalise a phone camera watching you
move.

## The platform features that compete for free

**Apple's Screen Distance** ([support.apple.com/105007](https://support.apple.com/en-us/105007))
is the one to know. It uses the **TrueDepth camera** to warn when the device is
held closer than 12 inches, is **on by default for under-13s** in Family Sharing,
and is the platform-native precedent for exactly this pattern: a front sensor
watching your head, locally, nagging you, free. Extending "too close" to "too
hunched" is a small product step. There is no evidence Apple is doing that, but
it is the clearest single-vendor risk in this space.

There is **no Android equivalent** — Eye Comfort Shield only shifts colour
temperature and Digital Wellbeing only counts time. A third-party app,
iVisionGuard, fills the gap with 1K+ installs.

The Apple Watch **Stand ring** is an activity-break nudge, not posture.

## Threats, ranked

| Threat | Severity | Why |
| --- | --- | --- |
| Apple ships posture as a Screen Time feature | **high if it happens, timing unknowable** | Screen Distance already proves the whole pattern. Speculative — no evidence they are. |
| The AirPods tier matures | **medium-high** | Covers away-from-desk, which we cannot. Currently blocked by hardware gating and head-pitch-only blindness. Better AirPods pose data would change that fast. |
| **Plumb** specifically | **medium** | Identical philosophy, both sensing modes, ten languages, honest. Zero ratings today. Watch it. |
| Posture Reminder AI (macOS) | **medium** | The closest functional twin, subscription-gated with a launch-time licence check — which is exactly what our free, offline, MIT story is against. |
| Hinge / Sword | **low** | Different universe, and they normalise the idea. |
| The clinical tier | **none** | Different market on all four axes above. |
| The timer tier | **low as competition, high as noise** | They will out-rank us on every keyword forever while not doing the thing. |

## Not verified

- **Reddit sentiment is missing entirely** — reddit.com was blocked to the
  research tooling, so App Store review feeds were substituted. A manual pass
  over r/ergonomics, r/posture and r/macapps is still owed.
- **SitTall is listed as camera-based here and as AirPods-based elsewhere in this
  research folder.** The App Store listing read on 9 September 2026 says front
  camera with five sensitivity levels; treat the AirPods attribution as the
  weaker of the two.
- PostureGuard (id6759346549) returned nothing from the iTunes lookup API —
  possibly delisted or region-locked.
- Kinetisense and VALD dollar pricing is quote-only. Posture Reminder AI's and
  Plumb's subscription prices could not be extracted.
- Apple's own support article does **not** state that Screen Distance captures no
  images; that comes from secondary tech press. Cite it as such.
- Align's five-star reviews read as promotional ("I grew 1-3 inches", "best
  height maxxing app"), which suggests manipulation. That is an inference from
  review text, not a verified finding.
- Google Play install counts are Google's coarse buckets, not exact figures. All
  numbers are stamped 9 September 2026 and will drift.

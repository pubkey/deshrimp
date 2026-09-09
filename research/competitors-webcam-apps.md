# Webcam posture apps — the direct competitors

Everything on this page watches a person through a camera and tells them to sit
up. That is the same job deshrimp does, so this is the segment we are actually
in. Checked **9 September 2026**; every status, price and version below was read
that day, and anything that could not be read is marked as such.

## What the segment looks like

Three things are worth knowing before the tables.

**It is new again.** Of the ~35 named products here, roughly two thirds shipped
or were substantially updated after January 2025. Before that the category was a
graveyard: PostureMinder (2005), Posture Man Pat (~2013), Nekoze (2013), Atenta
(2020), Zen (2021). MediaPipe and Apple Vision made the hard part free, and
everyone noticed at once.

**"Runs on your device" is table stakes, not a wedge.** Nearly every competitor
claims local processing. What is still rare is being *checkable*: only Dorso,
open-posture, PostureCorrector, Postured and this page are open source. That
distinction is not academic — see Zen below, which marketed privacy while
loading its app shell from its own server.

**Nothing here has ever been killed by a competitor.** They die of abandonment
after failing to cross the distribution gap, and the two things that widen that
gap are install friction and having to pay before you can tell whether it works.

## Browser-based — the same shelf we are on

| Product | URL | Status | Model | Calibration | Price | Langs |
| --- | --- | --- | --- | --- | --- | --- |
| **SitSense** | [sitsense.app](https://www.sitsense.app/) | alive, 4 Product Hunt launches, latest Aug 2026 | MediaPipe, in-browser | not stated | Free / **$34.99-yr** / Enterprise | not stated |
| **SitCoach** | [sitcoach.com](https://www.sitcoach.com/) | alive | MediaPipe | **yes** | **free, no account** | 6 |
| **StopSlouching** | [stopslouching.app](https://stopslouching.app/) | alive | "pose-detection AI" | **yes** | demo free, **Pro to keep monitoring** (price unpublished) | not stated |
| **PostureGuard (web)** | [posture-guard-theta.vercel.app](https://posture-guard-theta.vercel.app/) | **waitlist**, Show HN 7 Jan 2026 (2 points) | not stated | none mentioned | undisclosed | en |
| **PostuReveal** | [Chrome Web Store](https://chromewebstore.google.com/detail/postureveal/nndcdcicdddjendpifejmmghddpnjhfd) | v1.0.0, 17 Feb 2026, **5 users** | MediaPipe | not stated | free | en |
| **PostureCorrector** | [Chrome Web Store](https://chromewebstore.google.com/detail/posturecorrector-ai-postu/glbckpboobaemcfljiijgndjlkcokppi) | v1.1.1, 25 Nov 2025 | undisclosed, **open source** | **yes** | free | en |
| **StraightenUp AI** | [Chrome Web Store](https://chromewebstore.google.com/detail/straightenup-ai-ai-postur/nfhoegpkonllcaghgmhdmcpmebmocokf) | v0.0.0.18, 7 Apr 2026 | not stated | framing box | free | en |
| **PostureSmart** | [posturesm.art](https://posturesm.art/) | v1.1.6, 11 Feb 2025, **37 users** | "ML", in-browser | not stated | free | en |
| **Posture!Posture!Posture!** | [GitHub](https://github.com/killa-kyle/posture-posture-posture-chrome-extension) | stale hobby project | PoseNet era | **yes** | free | en |
| **PostureMinder** (extension) | [Chrome Web Store](https://chromewebstore.google.com/detail/postureminder/dkmkfopiihabelocpelofchappjjnpkm) | v2.1.3, 29 Aug 2024, **20 000 users** | **none — a timer** | — | free | en |
| **Atenta** | atenta.io | **dead**, domain repurposed | TensorFlow.js in browser | — | — | — |

Read the last two rows together. The most-installed browser artefact in this
whole segment is a **timer that senses nothing at all**, and it outnumbers every
webcam extension found by two to three orders of magnitude. Detection quality is
not what decides this market.

## macOS

| Product | URL | Status | Model | Calibration | Price | Langs |
| --- | --- | --- | --- | --- | --- | --- |
| **Dorso** (ex-Posturr) | [dorso.app](https://dorso.app/) · [GitHub](https://github.com/tldev/dorso) | **~2.5k stars**, v1.13.0 17 Jul 2026 | Apple Vision (nose↔shoulder) **+ AirPods motion** | **yes** | free (MIT) / $4.99 App Store | 6 |
| **Posturion** | [posturion.app](https://posturion.app/) | released 13 Apr 2026 | Apple Vision | **no** | free for **1 h/day**, then **$9.99/mo** | 9 |
| **Posture Reminder AI** | [posturereminderapp.com](https://posturereminderapp.com/) | v3.2.1, 27 Mar 2026 | on-device, "depth-aware" | **yes**, 2 poses | **$9.99/mo · $99.99/yr** | en |
| **Verta** | [getverta.com](https://www.getverta.com/) | alive (site timed out at check) | Vision + **Apple Foundation Models on the Neural Engine** | learns neutral | £19.99/yr | unverified |
| **Plumb** | [plumbcoach.com](https://plumbcoach.com/) | alive | on-device camera | **yes, 3 poses** | $3.99/mo · $34.99/yr · $45 lifetime | not stated |
| **SitWit** (ex-MacPosture) | [sitwit.app](https://sitwit.app/) | v4.3.2, 9 Apr 2025 | webcam CV | not stated | free / $29.99-yr | 8 |
| **Posture Monitor** | [App Store](https://apps.apple.com/app/id6751619063) | v2.2, 8 Apr 2026 | "3D body pose" | not stated | free + $5.99 Pro | en |
| **Nekoze** | [nekoze.softwar.io](https://nekoze.softwar.io/) | **frozen** — released 2013, last update 6 Sep 2022 | **face recognition**, not pose | no, sensitivity slider | free | 2 |
| **Posture Man Pat** | — | **abandoned** (~2013) | head **Y position only** | not stated | free | en |

## Windows, Linux, cross-platform

| Product | URL | Status | Model | Calibration | Price | Langs |
| --- | --- | --- | --- | --- | --- | --- |
| **SitApp** | [sitapp.app](https://sitapp.app/) | alive; PH #3 Product of the Day 2021 (46 upvotes, 142 comments) | TensorFlow.js, local | **yes**, 10 s–2 min, good *and* slouch | free **1 h/day** / $34.99-yr / $89.99 lifetime | en |
| **SuperShrimp** | [supershrimp.io](https://www.supershrimp.io/) | launched 7 Apr 2026, **341 upvotes**, PH #3 | on-device, undisclosed | none mentioned | **$17→$29 one-off**, no free tier | not stated |
| **Slouch Sniper** | [slouchsniper.com](https://slouchsniper.com/) | MS Store, updated **6 Sep 2026** | undisclosed | **yes** | **$19 lifetime** (rising to $38) | en |
| **BLiiNK** | [bliink.ai](https://www.bliink.ai/) | alive | posture **+ blink rate + screen distance** | not stated | **$3.99/mo/seat**, no free tier | not stated |
| **Slouch Guard** | [MS Store](https://apps.microsoft.com/detail/9njh1lc3pq8n) | released 19 Jul 2026 | **Windows FaceDetector API**, no pose model | **yes** | **$0.99** one-off | en |
| **Real-time Posture Detector** | [MS Store](https://apps.microsoft.com/detail/9n6cs7pzq5nq) | updated 28 May 2026 | CV, neck + torso angles | not stated | free / $3.99 Pro | en |
| **PosturePal** | [posturepal.in](https://www.posturepal.in/) | Win + Mac | on-device, 0–100 score | **yes** | **₹299 (~$3.50) lifetime** | not stated |
| **open-posture** | [GitHub](https://github.com/whatnotbot/open-posture) | 9 stars, updated 7 Sep 2026 | **MediaPipe** in Electron, Apache-2.0, **egress blocked** | **yes** | free | en |
| **Postured** | [GitHub](https://github.com/vadi2/postured) | **Linux**, GPL-3.0, `pip install postured` | MediaPipe | not stated | free | en |
| **Zen** (YC S21) | [yayzen.com](https://www.yayzen.com/) | **pivoted off the webcam** | Electron + PoseNet | **yes** | was ~$23.99/yr | en |
| **PostureMinder** (the original) | posture-minder.com — **404** | **dead**, company dissolved 11 Jan 2022 | webcam vs. stored reference photo | **yes** | perpetual licence | en |

## The five that matter

**SitSense** is the direct rival: browser, MediaPipe, same privacy claim,
overlapping metrics, four Product Hunt launches, an enterprise tier and a large
SEO content operation. It is the only competitor that is both browser-native and
commercially serious. Its free tier gives you a session score; **your history is
the paywall**, at $34.99/yr, along with long-term analytics and weekly email
reports. It advertises the **craniovertebral angle** from a frontal webcam,
which is the one claim in this segment we can say is wrong — the CVA runs from
C7 to the tragus and needs a side profile. Being honest about that is worth
more to us than matching the claim.

**SitCoach** is the closest thing to a twin: free forever, no account, MediaPipe,
works in Safari and on mobile, and it is **the only other product that signals
through the tab icon and title** the way this page does. It needs calibration, it
has **no history at all** (its own comparison table lists "requires open tab" and
"no gamification" as its cons), and it ships 6 languages to our 12. Week over
week is exactly what it cannot do.

**Posturion** is the closest feature match anywhere. It measures the same three
angles — shoulder tilt, forward head, head tilt — plus screen distance, needs no
calibration, has 15 alert sounds, 9 languages and a posture timeline. If you
rewrote this page as a Mac menu-bar app you would get Posturion. Then it charges
**$9.99 a month after one free hour**, caps history at 48 hours, and runs on
macOS 14+ only.

**Dorso** is the reputational leader: ~2.5k stars, MIT, [covered by GIGAZINE in
January 2026](https://gigazine.net/gsc_news/en/20260126-posturr/), and the only
competitor with real open-source credibility. It blurs the screen, which is a
stronger intervention than a noise, and it can fall back to **AirPods motion
sensors** and drop the camera entirely. It is macOS 13+ only, needs calibration,
measures forward head as a crude nose-to-shoulder vertical distance rather than
an angle, and has no export or sync.

**StopSlouching and PostureGuard** are the shape-alikes. PostureGuard's
notification design — flashing tab title, sound, screen overlay, green/yellow/red,
a 15-second grace period — is nearly identical to ours, and it is still a
waitlist. StopSlouching shipped and then put the core loop behind Pro. Both
confirm people are converging on this design independently.

## Zen, and what it cost to get privacy wrong

Zen (PostureHealth Inc, YC S21) is the only VC-funded webcam posture company
found, and the [Launch HN from 23 August 2021](https://news.ycombinator.com/item?id=28278618)
(53 points, 38 comments) is the richest piece of user sentiment in the whole
segment. A commenter took the Electron app apart:

> it is Electron app, that packs some heavy web app assets (300mb + 150mb
> runtime), but still loads rest of web app from `https://client.getposturehealth.co`,
> and then it uses google pretrained posenet tensorflowjs model… In perfect world
> one would made it offline, release it at fixed price and be done with it, in
> our imperfect world it is turned in infinite cash-cow that requires
> connectivity and bazillion metrics.

The founder conceded PoseNet was "around 25% of what goes on." The rest of the
thread is a list of the things this page happens not to do:

- *"there is no privacy policy given… All the language about 'privacy-centric'
  with no actual background looks really sketchy."*
- *"way too difficult to see if it actually works. I have to download the app,
  install, and sign up? I gave up on your Let's get started screen."*
- *"If the software and vision model are local what is the value given for the
  recurring fee?"*
- One user asking for a *simpler* version: calibrate once, watch eye height,
  done.
- Linux requested repeatedly, never delivered, from an Electron app.

Today yayzen.com points at an iOS listing and the YC company page describes Zen
as posture correction using **motion sensors in AirPods**. The only funded
webcam posture company abandoned the webcam.

## The graveyard

| Product | Evidence | Cause |
| --- | --- | --- |
| **PostureMinder** (2005) | [Companies House 05512433 — DISSOLVED 11 January 2022](https://find-and-update.company-information.service.gov.uk/company/05512433); site 404s; its reseller writes *"Unfortunately this software is currently unavailable. A real disappointment as it worked well."* | Ran 17 years on Windows desktop with a perpetual licence, and died with that distribution channel. Cited approvingly in Zen's own HN thread as the better value. |
| **Atenta** | HN Jan 2020, MIT Sandbox funding, a YC interview, last trace Dec 2021; **atenta.io now sells an AI concierge for hotels** | Solved the privacy problem correctly and early — TensorFlow.js in the browser, 2020 — and never reached anyone. The most instructive precedent we have. |
| **Zen** | see above | Not dead as a company. Dead as a webcam product. |
| **Nekoze** | released April 2013, **last update 6 September 2022**, still "not enough ratings" after 13 years | Frozen. Uses face recognition rather than pose; its own listing concedes you may have to fix your lighting. |
| **Posture Man Pat** | only referenced 2014–2018, built on the Cycling '74 Max runtime | Abandoned freeware that tracked head height only. |

## What they have that we do not

Ranked by how many of them have it.

1. **Screen blur or dimming.** Dorso, Postured, Slouch Sniper, StraightenUp AI,
   PostuReveal, PostureCorrector, Slouch Guard. This is the dominant alternative
   to sound and is probably more effective mid-task. A web page cannot dim the
   OS; a full-page overlay while our tab is in front is the most we can do.
2. **Monitoring outside the browser.** Every native app watches you in your IDE,
   in Figma, in Slack. We only see you while the tab is open. This is the
   biggest functional gap and it is inherent to being a page. SitCoach lists it
   as its own top con.
3. **Break and stretch reminders.** Posturion, SitWit, BLiiNK, MacBreakZ,
   Slouch Guard, StopSlouching. Cheap, and commonly expected.
4. **Gamification.** SuperShrimp (XP, ten shrimp levels, a leaderboard),
   SitSense (Shrimp→Giraffe ranks, an axolotl, a reviving coral reef), SitApp
   (streaks). We have history but no progression loop.
5. **AirPods motion as a camera-free fallback.** Dorso, Zen, SitTall, Postura,
   Posture Pal. Solves the closed-lid, external-monitor and taped-over-camera
   cases outright. Not available to a web page.
6. **Screen distance and blink rate.** BLiiNK, Posturion. MediaPipe landmarks
   would give us distance cheaply.
7. **Auto-pause when you leave the frame.** StopSlouching, Postured, Dorso.
8. **Per-app attribution.** Verta breaks posture down per application;
   PostureCorrector by work/study/entertainment and time of day, over 120 days.
9. **A published accuracy number.** SitSense claims 99% detection accuracy;
   BLiiNK claims a 41% decrease in neck and back pain. Neither is substantiated,
   and both read stronger than our honest disclaimer in a side-by-side.

## What we have that they do not

| | Why it is rare |
| --- | --- |
| **No calibration** | Required by Zen, SitApp, SitCoach, StopSlouching, Posture Reminder AI, PosturePal, Slouch Sniper, Plumb (three poses), Dorso, Slouch Guard, PostureCorrector, open-posture, Verta and PostureMinder. Only Posturion, PostureSmart and probably SitSense skip it. All three of our angles are ratios on your own body, so there is nothing to set. |
| **12 languages** | The best webcam competitor is Posturion at 9, then SitWit 8, SitCoach 6, Dorso 6. Everything else is English only — SitApp, Slouch Sniper, SuperShrimp, Posture Reminder AI, Slouch Guard, and every Chrome extension found. |
| **Long-term history, free** | SitSense paywalls it at $34.99/yr, SitApp caps you at an hour a day, Posturion charges $9.99/mo and stops at 48 hours, SitCoach has none. Raw readings for two days plus one row per day forever gives week-over-week at no cost. Nobody else does that free. |
| **No install, no account, no key, no quota** | Zen's most upvoted criticism was exactly this friction. Every native competitor installs; SitApp needs an account; SitApp, Posturion and StopSlouching all meter usage. |
| **Verifiably local** | Everyone claims it. Only Dorso, open-posture, PostureCorrector, Postured and this page can be checked. Zen is why checking matters. |
| **Honest about limits** | Unique in the segment. Nobody else says their thresholds are set rather than established, or that they are not measuring the CVA. |
| **Export, P2P, Drive and OneDrive sync, all off by default** | No competitor found offers data portability at all. Verta's pain journal and PostureCorrector's 120-day stats are locked in. |
| **A ramping alarm** | Posturion has 15 sounds and SitApp 11 voices, but nobody found ramps the *volume* over consecutive bad readings. |

## Two things worth acting on

**The segment indexes itself, and we are not in the index.**
[slouchsniper.com/compare](https://slouchsniper.com/compare/) names fifteen
rivals; [sitcoach.com/best-posture-reminder-apps](https://www.sitcoach.com/best-posture-reminder-apps/)
and [sitapp.app/blog/best-posture-app](https://sitapp.app/blog/best-posture-app)
are structured comparison tables. Every serious player runs a "best posture app
2026" page listing its competitors. This page appears in none of them, which is
the cheapest distribution lever available and the easiest to pull, because free,
MIT and no-install is the row those tables like having.

**The pricing evidence points hard at free.** SuperShrimp is the best-launched
paid product in the segment — a well-known indie maker, 341 Product Hunt
upvotes, #3 Product of the Day — and per TrustMRR it has grossed **$7,236
all-time and $170 in the last 30 days**. Meanwhile a browser extension with no
detection at all has 20 000 users. Friction and trust decide this category, not
detection quality, and those are the two axes this page is built on.

## Not verified

- SitSense's Chrome Web Store install count and rating (the page is
  JS-rendered). Its Trustpilot 3.7/5 is computed from a single review.
- SuperShrimp's platform support: Product Hunt says macOS, the site says macOS,
  Windows and Linux.
- Verta — getverta.com timed out. Everything about it comes from competitors'
  comparison pages.
- StopSlouching's Pro price, which is not published.
- Straighty, NoSlouch, Slouti, Posture Sensei, Isa Health, FitCam, Vatobe:
  surfaced only in AlternativeTo and competitor listings. `vatobe.io` does not
  resolve.
- Reddit search and direct Hacker News fetches were blocked or rate-limited from
  the research environment; the Zen thread was recovered through the Algolia
  API. Community sentiment beyond that thread is thinner than it should be.

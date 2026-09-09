# 🦐 deshrimp — Research

This folder is the competitive and factual groundwork behind the page: who else
tells people to sit up, how they do it, what they charge, what they get wrong,
and what the evidence actually says about any of it.

The point is that every claim the page makes — "nothing leaves your device", "no
calibration", "the thresholds are set, not established" — can be checked against
something, and that decisions about what to build next are made against what is
already out there rather than against a guess.

## Index

**The competition**

- [`competitors-webcam-apps.md`](./competitors-webcam-apps.md) — the direct
  segment: ~35 desktop, browser and extension products that watch you through a
  camera. The five that matter, the graveyard and what killed each one, and the
  capability gaps in both directions.
- [`competitors-hardware.md`](./competitors-hardware.md) — the incumbents.
  Upright, Lumo, ALEX, Darma, Opter, the braces and the smart chairs. Mostly a
  list of corpses, which is the strongest argument a free web page has.
- [`competitors-mobile-apps.md`](./competitors-mobile-apps.md) — iOS and Android,
  where the word "posture" has the most installs and the least measurement, plus
  the AirPods tier, the clinical assessment tools and the insurance-funded
  giants.
- [`open-source-and-hacker-news.md`](./open-source-and-hacker-news.md) — the code
  half: how commoditized the idea is, the projects that matter, and a taxonomy of
  what people actually object to when one of these gets posted.

**Whether any of it is true**

- [`what-a-front-webcam-can-measure.md`](./what-a-front-webcam-can-measure.md) —
  the craniovertebral angle, why a frontal camera cannot produce it, and an
  honest assessment of each of the three angles. Two of the three are the right
  choice for this camera; one is a slump proxy and should keep being called that.
- [`does-posture-training-work.md`](./does-posture-training-work.md) — the
  evidence base, including the null RCT on almost exactly this intervention, the
  literature arguing posture does not cause back pain at all, and the one claim
  that does hold up. Plus what the habituation research says about an alarm that
  can fire every second.

**Getting it in front of anyone**

- [`demand-and-search-landscape.md`](./demand-and-search-landscape.md) — what
  people search for in the twelve shipped languages, who owns those results, and
  the finding that "shrimp posture" is already a live meme in English *and*
  German that no tool serves.
- [`distribution-positioning-and-risk.md`](./distribution-positioning-and-risk.md) —
  the channels that have actually worked for tools like this, the vocabulary
  every competitor has used up, and the two things that can sink it: the camera
  prompt, and the law.
- [`domain-names.md`](./domain-names.md) — the availability snapshot behind
  `deshrimp.com`, what is still free, what is already gone, and why `de-` beat
  `un-`.

## What the folder concluded

Four things, if you read nothing else.

**The competition is not the problem; distribution is.** Every browser-based,
local-first, MediaPipe, calibrated, charted competitor already exists and has
between zero and one GitHub stars. Meanwhile a macOS app that blurs your screen
got 692 points on Hacker News, and a browser extension that senses **nothing at
all** has 20 000 users. Detection quality decides nothing here.

**"Nothing leaves your device" is table stakes, not a wedge.** Every serious
competitor says it. What is rare is being checkable — and the browser has an
argument nobody else can make: open the Network tab and watch.

**Honesty is the scarcest differentiator in this field.** One competitor
advertises a craniovertebral angle from a frontal webcam, which is not
measurable. Another claims 99% accuracy, a third a 41% reduction in pain, none
with anything behind them. The market leader's evidence base is 26 students in a
study that did not measure posture. Saying what this cannot do is free and
nobody else does it.

**The strongest unclaimed sentence is the intersection:** free forever, no
install, no account, twelve languages, and no server to send anything to. No
competitor can claim more than two of those five.

## How to read the numbers

Every page carries a check date, and everything below it was read that day.
Install counts, ratings, prices and release dates move; treat them as a snapshot
that was accurate once, not as current fact. Where something could not be
verified — a JS-rendered store page, a quote-only price, a site that timed out —
it is marked as unverified rather than filled in with a guess, and each page ends
with a list of what those were.

Competitors' claims about themselves are recorded as claims. Several assert
accuracy numbers with nothing behind them, and at least one shipped a privacy
claim that did not survive somebody decompiling the app.

**One gap runs through the whole folder: Reddit.** It was blocked at both fetch
and search level for every research pass, so App Store review feeds, Trustpilot,
Hacker News comment trees and Amazon verbatims were substituted. r/ergonomics,
r/posture, r/selfhosted and r/SideProject are still owed a manual pass, and that
is also where the "I used it for two days and stopped" question would be
answered.

## How to add a page

1. Write `<topic>.md` with the question, the evidence, the sources as links, and
   what it means for this page specifically.
2. Put the check date at the top and an unverified list at the bottom.
3. Link it from the index above.

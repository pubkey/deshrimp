# What a front-facing webcam can and cannot measure

The README already says this page does not measure the craniovertebral angle.
This is the evidence for that, the numbers behind it, and an honest assessment of
each of the three angles. Checked **9 September 2026** against PubMed, arXiv and
the MediaPipe documentation.

## The craniovertebral angle, and why we cannot have it

**Definition.** The CVA is the angle between a horizontal line through the
spinous process of **C7** and the line from C7 to the **tragus of the ear**. It is
measured on a **lateral photograph** with **physical reflective markers stuck on
the tragus and on C7**
([Physiopedia](https://www.physio-pedia.com/Craniovertebral_angle)). A smaller
CVA means a more forward head.

**There is no agreed cutoff, and we should not pick one.**

| Threshold | Usage |
| --- | --- |
| **< 48°** | the most commonly cited research cutoff for forward head posture |
| **< 50°** | also common, often quoted as the standing cutoff |
| 48–50° band | several papers use a range; > 52° is sometimes treated as clearly normal |

That researchers were still
[arguing about the cutoff in 2025](https://pubmed.ncbi.nlm.nih.gov/39748347/)
tells you what you need to know. One review says such cutoffs "lack rigorous
validity."

**Four independent reasons a front camera cannot produce this number**, each on
its own fatal:

1. **Wrong plane.** The CVA is defined purely in the sagittal plane. Forward head
   translation moves *along the optical axis* of a front-facing camera, so its
   projection onto the image is close to zero. Both lateral-view projects in the
   open-source corpus say so outright — nvinayvarma189's README states that
   "input from webcam (front view of a person) **will not work**".
2. **C7 does not exist in MediaPipe.** BlazePose's 33 landmarks are nose, eyes,
   ears, mouth, shoulders, elbows, wrists, hands, hips, knees, ankles and feet.
   **There is no spine, neck or C7 landmark of any kind**
   ([arXiv:2006.10204](https://arxiv.org/abs/2006.10204)). The clinical protocol
   requires a *physical marker* on C7 because it is not reliably identifiable by
   eye in a photo either.
3. **The z coordinate is not usable as depth.** Google's own documentation and
   downstream researchers state that the normalized z is not in the image plane,
   lacks consistent scale, comes from an ill-posed monocular problem, and its
   axis "is not orthogonal to the x,y-plane"
   ([mediapipe#1611](https://github.com/google/mediapipe/issues/1611),
   [Pose Landmarker web guide](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js)).
   At least one published study says explicitly that it did not use z for this
   reason.
4. **Scale ambiguity.** Even the world-landmark output is hip-origin metric
   estimation from one RGB frame with unknown camera intrinsics. Absolute
   head-forward distance is unrecoverable.

**A sobering scale check.** The gold-standard method's own **minimal detectable
change is 2.56–2.84°** with SEM 0.92–1.02° and ICC 0.89–0.94
([Binaei 2025, PMID 41509052](https://pubmed.ncbi.nlm.nih.gov/41509052/)), while
**the entire mean CVA difference between adults with and without neck pain is
4.84°** ([Mahmoud 2019](https://pubmed.ncbi.nlm.nih.gov/31773477/)). The
clinically meaningful signal is barely larger than the noise floor of the best
available method. Anyone advertising a webcam CVA — and
[SitSense does](./competitors-webcam-apps.md) — is selling a number that the
proper method can barely resolve with markers glued to the subject.

## What our three angles actually are

| Angle | Landmarks | What it genuinely measures | Verdict |
| --- | --- | --- | --- |
| **Head forward**, shoulder midpoint → ear midpoint against vertical, 18° | shoulders 11/12, ears 7/8 | From the front this is dominated by **head height above the shoulders** and lateral head offset, not by forward translation. It responds to slump (the head drops) and to shoulder elevation. | **A slump proxy, not a CVA.** Honest and reasonable as such. dorso's author independently landed on the same quantity: *"Head height works well enough!"* |
| **Shoulder tilt**, shoulder line against horizontal, 8° | shoulders 11/12 | Genuinely measured. A **frontal-plane** angle, which is exactly what a frontal camera is good at. | **Sound.** Confounded only by camera roll and asymmetric seating. |
| **Head tilt**, eye line against shoulder line, 10° | eyes 2/5, shoulders 11/12 | Genuinely measured, frontal plane. | **Sound.** Confounded by hair over the ears, headphones and extreme lighting. |

**Two of the three are the correct choice for a frontal camera** and are more
defensible than most competitors' metrics, which is worth saying out loud. The
first should keep being described as a slump proxy rather than as forward head
posture, and never as a CVA.

## How accurate is markerless 2D pose, really?

| Study | Finding |
| --- | --- |
| [Gao 2025, BlazePose gait validation](https://pubmed.ncbi.nlm.nih.gov/41336603/) (EMBC) | Against marker-based mocap: **"the joint angle errors exceed 5°."** Higher accuracy but *lower* recall and F1 than a human observer. Positioned for screening only. |
| [BlazePose vs Vicon during gait](https://www.researchsquare.com/article/rs-3239200/v1) | RMSE up to **14.2°**, and errors **worsen with movement speed**. |
| [MediaPipe hand kinematics vs Vicon](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12473350/) | Mean RMSE **22.5°** for digit joints; 10.9° for finger segments in a second study. |
| [Shoulder abduction from MediaPipe](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10416158/) | Errors **increase with camera-position variation** and with the angle itself. Camera placement is a first-order error source, enough to warrant [its own validation paper](https://pubmed.ncbi.nlm.nih.gov/42178584/). |
| [Ferraris 2026, RGB-D → RGB-only for postural assessment](https://pubmed.ncbi.nlm.nih.gov/41755089/) | The depth problem is an open research question, not a solved one. |
| [Hsieh & Sun 2025, arXiv:2508.11683](https://arxiv.org/abs/2508.11683) | The closest published analogue to this page. Its stated limitation: it works "whenever the user's joints are **not blocked by the table or their limbs**" — desk occlusion is the practical failure mode. |

**Published joint-angle error for monocular 2D pose is in the 5–15° range under
favourable conditions. Our thresholds are 18, 8 and 10 degrees.** The 8° shoulder
tilt threshold in particular sits at or below the noise floor some validation
studies report.

Two things make that less alarming than it sounds, and both are already in the
design rather than bolted on:

- The frontal-plane angles are the **easy** ones for 2D pose. The published error
  ranges above are dominated by depth-coupled joints; shoulder tilt and head tilt
  in the image plane are the best case, not the average.
- **Sustained-deviation logic low-pass filters the noise.** Requiring several
  consecutive bad readings before the alarm reaches full volume is a noise
  rejection mechanism as much as a design choice. The README's "three red bars in
  a row mean something, one red between greens is a moment" is technically
  correct as well as clinically correct.

## Recommendation

Keep a section in the README titled something like **"What this cannot
measure"**, naming the CVA, C7, the lateral-view requirement, and the depth
limitation, and put the 4.84° effect size against the 2.56–2.84° detectable
change next to it. Nobody else in this competitive set does this. In a field the
*Journal of Orthopaedic & Sports Physical Therapy* describes as "a large posture
industry" flourishing "despite the absence of strong evidence", honesty is the
scarcest differentiator available — and it is free.

## Not verified

- [AutoMCA](https://doi.org/10.3390/automation6040088) reports Pearson r > 0.98
  against manual Kinovea for automated cranial-angle measurement using MediaPipe.
  The figures come from a search-engine summary because MDPI returned 403.
  **Important caveat even if true:** it still uses colour-thresholded physical
  markers on a **lateral** image. MediaPipe automates the segmentation; it does
  not remove the marker or the side view.
- [MDPI Appl Sci 13(6):3910](https://www.mdpi.com/2076-3417/13/6/3910), "A
  Computer Vision-Based Application for the Assessment of Head Posture" could not
  be fetched (403) and is likely the closest published validation of a webcam
  head-posture tool. Worth reading before anyone writes accuracy copy.

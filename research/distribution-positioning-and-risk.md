# Distribution, positioning, and the two real risks

How free browser tools in this category actually reach people, what every
competitor already says (so we can stop saying it), and the two things that can
sink this: the camera prompt, and the law. Checked **9 September 2026**.

## Hacker News, where the evidence is unusually clear

| Post | Date | Points | Comments |
| --- | --- | --- | --- |
| [A macOS app that blurs your screen when you slouch](https://news.ycombinator.com/item?id=46754944) — the **GitHub link, submitted by a third party** | 25 Jan 2026 | **692** | **223** |
| [Show HN: I made an app that blurs my screen when I slouch](https://news.ycombinator.com/item?id=46747571) — **the same app, by its author, four days earlier** | 21 Jan 2026 | **17** | 4 |
| [Show HN: Slouch Stoppah](https://news.ycombinator.com/item?id=21239930) — free browser tool, open source, client-side | 2019 | **153** | 44 |
| [Tell HN: Putting mirrors around my desk improved my posture](https://news.ycombinator.com/item?id=35939206) — no product at all | 2023 | 206 | 102 |
| [We have an epidemic of bad posture](https://news.ycombinator.com/item?id=12166415) — an essay | 2016 | 156 | 146 |
| [Ask HN: Have you successfully treated forward head posture?](https://news.ycombinator.com/item?id=47376169) — pure demand signal | Mar 2026 | 60 | 44 |
| [**Show HN: PostureGuard — free posture monitoring using webcam**](https://news.ycombinator.com/item?id=46532966) — **free, browser, TensorFlow.js, local. Almost exactly this page.** | 7 Jan 2026 | **2** | **0** |

Read the first two rows together, then the last one.

Hacker News **loves** this topic — seven posts above 90 points across a decade.
It also **dislikes a bare "Show HN: my free posture tool"**: PostureGuard did
everything this page does and got two points, off a post that was three flat
sentences and a tech-stack line.

**What worked for the 692-point post:** a GitHub link rather than a landing page,
a vivid one-line mechanic (*the screen blurs*), and a third-party submission.

Our equivalent vivid mechanic is **it farts at you**, which is at least as
postable. And the honest engineering caveats already written into the README —
the thresholds being set rather than established, *"It is not the craniovertebral
angle"* — are exactly the kind of self-limiting honesty this audience rewards,
and rare enough in this category to be the story itself.

Expect a front-page Show HN to be worth roughly **10-11k uniques over about 13
hours** with fast decay ([one postmortem](https://www.indiehackers.com/post/front-page-of-hn-the-full-postmortem-traffic-lessons-surprises-cbe9e0a7f6),
[another](https://luke.hsiao.dev/blog/2023-hn-traffic/)) **[EST]**. A one-shot
spike, not a channel.

## Product Hunt: an audience channel, not a product channel

| Product | Upvotes | Outcome |
| --- | --- | --- |
| [SuperShrimp](https://www.producthunt.com/products/supershrimp) | **338** | #3 Product of the Day |
| [SitSense](https://www.producthunt.com/products/sitsense) — **four separate launches** | **2, 1, 7, 0** | nothing |

SuperShrimp and SitSense are functionally the same product. The 300-upvote gap is
**audience**, not merit: SuperShrimp's maker announced it to his own following on
Threads with *"Fuck my posture. I built an app that watches me through my webcam
and yells at me when I sit like a shrimp."*

**Do not launch on Product Hunt without an audience already in hand.** The
realistic outcome without one is single digits. And the shrimp angle is now
SuperShrimp's on that platform, so differentiate hard on free, browser and twelve
languages or read as a clone.

## Reddit

⚠️ **Every figure in this section is third-party and unverified — Reddit's API
and old.reddit are both blocked from the research environment. Read each
sidebar before posting.**

| Subreddit | Fit | Reported rules |
| --- | --- | --- |
| **r/InternetIsBeautiful** (~16.2M) | ⭐ **the best fit on Reddit** | No downloads or extensions · no signup or accounts · no stores, paid services **or freemium** · must be unique · 90/10 self-promo rule. **This page passes every one of those, and StopSlouching, SitApp, SitSense and SuperShrimp each fail at least one.** That is the clearest structural advantage in this whole folder. The stated killer is the self-promo rule, so build history first or have someone else submit. |
| **r/SideProject** | ✅ good | Self-posting is the point; removals are for low-effort drops |
| **r/privacy, r/degoogle, r/selfhosted** | ⭐ | "No server exists" is native content here, and people take the trust question to Reddit rather than Google. The highest-value non-obvious targets. |
| **r/ergonomics**, **r/posture** | ✅ on topic | size and rules could not be retrieved |
| **r/webdev** | ⚠️ | reported 9:1 rule |

Reddit's platform default is the 90/10 rule. Disclose authorship on first
mention.

## TikTok, which fits this product better than anything else

The meme is already there and does not need creating:
[Shrimp Posture Meme](https://www.tiktok.com/discover/shrimp-posture-meme) ·
[Shrimp Posture at Work](https://www.tiktok.com/discover/shrimp-posture-at-work) ·
[Posture Check Audio](https://www.tiktok.com/discover/posture-check-audio) ·
[Fix Shrimp Posture](https://www.tiktok.com/discover/fix-shrimp-posture), and in
German [`#bürogarnele`](https://www.tiktok.com/@aubiplus/video/7417014867489459488):
*"Wenn man wie eine Garnele im Büro sitzt, braucht man sich auch gar nicht
fragen, woher die Rückenschmerzen kommen 🦐"*

**The five alarm sounds are the content.** A screen recording of a page that
plays a fart when you slouch is a natively shareable eight-second video needing
no explanation, no install, and no call to action beyond a URL.

And **no competitor can copy it.** SitApp, Slouch Sniper and Posture Reminder AI
all sell "gentle" and "unobtrusive". Making that video would damage their own
positioning.

(View counts and hashtag volumes are not exposed to the research environment. The
breadth of the Discover pages is the evidence; the size is unmeasured.)

## The other channels

| Channel | Assessment |
| --- | --- |
| **AlternativeTo** | ✅ **cheap and high fit.** Pages already exist for [SitSense](https://alternativeto.net/software/sitsense/), [PostureFix](https://alternativeto.net/software/posturefix), [Postured](https://alternativeto.net/software/postured), [Posture Reminder](https://alternativeto.net/software/posture-reminder). We are the only free-browser entry that could be added to all of them, plus the "Prevent RSI" category alongside Stretchly and Workrave. |
| **"Awesome" lists** | ⚠️ weak fit as-is — the [awesome-privacy](https://github.com/lissy93/awesome-privacy) family lists privacy tools, not health tools, though it does accept fully client-side web apps. Worth one PR. |
| **German tech press** | ✅ **proven and under-exploited.** A syndicated wire story about a posture app ran across [stimme.de](https://www.stimme.de/leben/technik/digitales/haltung-bitte-diese-app-zwingt-zum-geradesitzen-am-rechner-art-5137682), Radio Oberhausen, Radio K.W. and others — **for a Mac-only, English-language app**. A German-language, free, no-install tool with a German joke name is a materially better story for that same wire. |
| **Journalists writing shrimp-posture stories** | ✅ They are actively looking for sources right now (see [`demand-and-search-landscape.md`](./demand-and-search-landscape.md)) and would plausibly take a free tool as a story hook. |
| **Ergonomics newsletters** | ⚠️ thin. The real ones are institutional and will not feature a joke tool. |
| **Corporate wellness / occupational health** | ❌ **do not pursue.** Those buyers want reporting, admin dashboards and a vendor contract — the exact opposite of no server, no account, nothing leaving the device. A free consumer page has nothing to sell them. There is also a second, independent legal reason not to; see the AI Act row below. |

## What everyone already says

| Product | Headline |
| --- | --- |
| SuperShrimp | "Turn your laptop into a posture coach that stops you from sitting like a shrimp." |
| SitApp | "…uses your webcam and on-device AI to quietly watch your posture and give you a **gentle nudge** the moment you start slouching." |
| Slouch Sniper | "The Posture App that dims your screen when you slouch." |
| SitSense | "Your webcam already sees you slouch. Now it fixes it." |
| StopSlouching | "So I taught my webcam to nudge me the second I slouch." |
| Zen | "mirrors your posture and **gently alerts** you when you slouch" |

**Vocabulary that is now dead** — each of these appears verbatim in three or more
competitors:

- **"Turn your webcam into a posture coach"** — SuperShrimp, SitSense, SitApp and
  three more. This exact sentence is finished.
- **"gentle nudge" / "gently alerts" / "gently dims"** — SitApp, Zen, Slouch
  Sniper, Postura, PostureMinder.
- **"on-device AI"**, **"AI posture coach"**, **"privacy first"** — universal.
- **"Your webcam never leaves your machine"** — SitApp, Slouch Sniper,
  SuperShrimp, StopSlouching, PostureCorrector. ⚠️ **This is boilerplate now and
  therefore no longer persuasive.**
- **A cute mascot that levels up** — SuperShrimp, Straighty, Nekoze, SitApp,
  PostuReveal.

## Angles nobody has claimed

| Angle | Why it is open | Draft line |
| --- | --- | --- |
| **Not gentle** | 100% of the category sells gentle. This page plays a fart, a scream and a knuckle-crack. It is a real product truth and the only funny one. | *"Every other posture app nudges you gently. This one farts at you."* |
| **No server exists** | The whole field says *"we don't upload."* We can say *"there is nothing to upload to"* — a categorically stronger and verifiable claim. | *"'We don't store your data' is a promise. 'There is no server' is an architecture."* |
| **Nothing to install, nothing to trust** | Every competitor asks for a binary or an extension. A tab is a strictly weaker ask. | *"There is no app. There is no account. Close the tab and it's gone."* |
| **Twelve languages** | **Every competitor found is English-only.** Completely uncontested. | *"Twelve languages. Your posture is bad in all of them."* |
| **Honest about its own limits** | Uniquely credible, because the README already says the thresholds are set rather than established and that this is not the craniovertebral angle. Nobody else admits anything. | *"It is not a diagnosis. It is a page that notices."* |
| **Free forever, no tier** | SitApp caps at 1 h/day, StopSlouching gates at $2.99/mo, Slouch Sniper $19, SuperShrimp $17. | *"No Pro. No trial. No hour limit."* |

## Risk one: the camera prompt

**The hard number.** Across 100 000 `getUserMedia()` calls,
[AddPipe measured](https://blog.addpipe.com/using-permissions-api-to-detect-getusermedia-responses/)
that **about 10% of users shown the Chrome permission dialog denied or dismissed
it**. ⚠️ Their own caveat matters: their platform favours repeat recordings, so
only ~21% of calls even produced a prompt. **A cold first visit prompts ~100% of
the time and should expect a worse rate.**

That 10% is the mechanical loss. The real loss happens *before* the dialog, and
it is a **trust** problem rather than a UX one. From the 223-comment thread:

> "I think the idea is wonderful, but a **not-audited application that uses
> things like the camera is a 'no go'** for me. Get it notarized and ask for some
> money! I will gladly pay it." — the top-voted objection

> "I'm a little put off with the idea that my camera is always watching me."

> "I would not want a camera on 24/7… It'd **defeat the small LED which informs
> you it is on**… I'd prefer a hardware killswitch."

> "I'm pretty sure I have a spare webcam lying around, it could be interesting to
> have a **'trusted' sensor** for this app so that I can keep my main webcam
> locked down."

And on Zen, a funded YC startup:

> "**Would you trust a small, unknown company to have access to your web cam?**
> My experience is that few enough companies follow their own privacy policies."

**What the objectors actually asked for**, in order: open source, the ability to
compile it themselves, notarisation and signing, a named accountable person. They
explicitly rejected reassurance copy — *"the point is 'I do not feel like it'"* —
and one cited **The Great Suspender**, a beloved open-source extension that
changed hands and turned malicious, as the reason source availability alone is
not enough.

**Mitigations, ranked by that evidence:**

1. **Open the repo and link it above the fold.** This was the community's own
   answer and it costs nothing.
2. **Do not ask for the camera on page load.** Show the whole UI, the three
   angles, the sounds and the history chart first, with a static demo. Ask only
   on an explicit press. No competitor's landing page does this well.
3. **Say the always-on-LED thing out loud.** Naming the top visceral objection
   before the user notices converts an alarm into a trust signal.
4. **Ship a visible stop that provably releases the camera track**, and say so.
   Better still: acquire the camera for a fraction of a second per sample and
   release it, which at one frame a second is actually feasible and which nobody
   else can do.
5. **The joke framing helps.** A page that is transparently silly lowers the
   perceived stakes of granting access in a way that "AI posture coach with
   analytics" does not.

**And a second-order risk worth testing before promising anything:** the tab icon
turning red and 1 Hz capture both require the tab to stay open. ⚠️ **Browsers
throttle background tabs aggressively and `getUserMedia` behaves inconsistently
across Chrome, Safari and Firefox when backgrounded.** This is the structural
reason every serious competitor shipped a native daemon. A feature that silently
stops working is worse than a documented limitation.

## Risk two: the law

| Question | Answer |
| --- | --- |
| **A medical device in the US?** | **Almost certainly not — but the boundary is the marketing copy, not the code.** FDA's *General Wellness: Policy for Low Risk Devices* (revised **6 January 2026**) says FDA does not intend to regulate low-risk products intended for general wellness. ([FDA town hall](https://www.fda.gov/medical-devices/medical-devices-news-and-events/town-hall-general-wellness-policy-low-risk-devices-final-guidance-02112026), [Covington](https://www.cov.com/en/news-and-insights/insights/2026/01/fda-issues-revised-guidance-on-general-wellness-products)) |
| **What would break that** | Counsel guidance is to avoid features implying **diagnosis, clinical thresholds or medical management**. ⚠️ **Three fixed angle thresholds are exactly the kind of feature that could read as clinical if described that way.** The README's existing framing — *"the thresholds are set, not established… treat them as dials"* and *"good for comparing you against yourself, not for a diagnosis"* — is precisely right, and **should be carried verbatim onto the public page, not left in the repo.** |
| **A medical device in the EU?** | Same logic. Under MDR and MDCG 2019-11, qualification turns on **intended purpose**, not technology. A wellness nudge making no clinical claim falls outside. ⚠️ **The German copy specifically must avoid *behandeln*, *therapieren*, *Diagnose*, *lindert Rückenschmerzen*.** "Prevention of a disease" is inside MDR's definition, so **claiming this prevents back pain is a materially riskier sentence in the EU than in the US.** |
| **Does "nothing leaves the device" solve GDPR?** | **Largely, and this is the strongest legal asset the architecture buys.** No transmission, no controller-side storage, no processor contract, no cross-border transfer, no breach surface, no subject-access obligation over the video. ⚠️ **Not a blanket exemption:** GDPR governs *processing*, so consent and transparency duties attach regardless of where computation happens, and IndexedDB storage engages ePrivacy / TTDSG §25 terminal-equipment rules (though storage strictly necessary for a service the user requested is generally exempt). |
| **What GDPR still wants** | A privacy notice, even one that says we collect nothing. A legal basis for the camera. And honesty about the ⇅ menu: **the moment someone syncs to Google Drive or OneDrive, data does leave the device**, and that path needs its own disclosure. |
| **EU AI Act — is a pose model on a worker prohibited?** | **No.** Art. 5(1)(f), in force since **2 February 2025**, bans AI that **infers emotions** in the **workplace** from biometric data. This infers joint angles, not emotions or intentions, and does not categorise by sensitive attributes. ([FPF analysis](https://fpf.org/blog/red-lines-under-eu-ai-act-unpacking-the-prohibition-of-emotion-recognition-in-the-workplace-and-education-institutions/), [Bird & Bird](https://www.twobirds.com/en/insights/2025/global/ai-and-the-workplace-navigating-prohibited-ai-practices-in-the-eu)) |
| **⚠️ The AI Act risk that is real** | The prohibition bites in the **workplace**. A voluntary page someone opens for themselves is not an employer deploying a system on employees. **But pitching this to employers or corporate wellness changes the analysis materially** — an employer-deployed camera watching workers invites Art. 5 scrutiny, *Betriebsrat* co-determination in Germany, and employee-monitoring law generally. **This is the second, independent reason not to pursue that channel.** |
| **Illinois BIPA** | ⚠️ **The genuine open risk, and "nothing leaves the device" does not fix it.** BIPA covers a "scan of face geometry", and courts have read *scan* and *geometry* **broadly**, treating **facial landmarks like face templates**. This reads ear and eye landmarks. There is **no clear on-device or transient-processing exemption** — [FAccT 2022](https://dl.acm.org/doi/fullHtml/10.1145/3531146.3533163) flags exactly this as unresolved. BIPA has a **private right of action requiring no actual harm.** |
| **BIPA mitigants** | (a) The August 2024 amendment, [held retroactive by the Seventh Circuit on 1 April 2026](https://www.hunton.com/privacy-and-cybersecurity-law-blog/illinois-damages-limitation-for-biometric-privacy-violations-applies-retroactively), makes repeated collection by the same method **one violation, not one per scan** — collapsing the nightmare case for a 1 Hz app from ~30 000 violations a day to one. (b) No template is created, stored or used for identification. (c) **A short, explicit consent screen naming what is read and that nothing is stored costs almost nothing and addresses BIPA's core §15(b) duty.** Not legal advice, but it is cheap insurance and worth shipping. |
| **Texas, Washington, Colorado, Oregon** | Similar ground, but **AG-enforced rather than privately actionable**, so exposure is far lower. Several 2023-25 state privacy laws treat biometric data as sensitive requiring opt-in consent, again satisfied by an explicit consent step. ⚠️ not independently verified; flagged for counsel. |

**The net read:** "nothing leaves the device" buys **a great deal under GDPR**,
**very little under BIPA** (which regulates *collection*, wherever it lands), and
**nothing at all under FDA or MDR**, where only the marketing copy matters.

The three cheapest protective moves are: **an explicit pre-camera consent
screen**, **never claiming treatment, prevention or diagnosis in any of the twelve
languages**, and **not selling to employers.**

## The bottom line

The winnable ground is not "posture app" — that is hardware and health-publisher
territory and always will be. It is the three-way intersection of **a live meme
that no tool serves**, **the word *free* that no competitor can honestly use**,
and **twelve languages that no competitor has at all**. The camera prompt is the
throat of the funnel and should be answered with an open repo and a delayed ask
rather than with copy. And the shrimp is both the best asset and the biggest
risk: it has real search demand in English *and* German, and it already has a
well-funded, well-connected occupant.

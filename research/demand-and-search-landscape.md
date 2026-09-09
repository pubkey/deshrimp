# Demand and the search landscape

What people actually search for around sitting badly, in the twelve languages
this page ships, who owns those results today, and where a free browser tool
could win. Checked **9 September 2026**.

> **How the numbers were made.** There is no paid keyword tool here, so there
> are no real volumes. Every "Rel." figure below is the raw
> `google:suggestrelevance` integer Google's autocomplete endpoint returned for
> that suggestion. **1250 / 1100 / 1000 is a top-tier suggestion for that seed;
> 601/600 is mid; 550-560 is tail.** It is comparable *within* one seed only,
> it is not a monthly volume, and a seed that returns **no suggestions at all**
> is the strongest negative signal available. Anything marked **[EST]** is a
> guess. SERP composition was read from a US-weighted index, so local markets
> will differ. Google Trends returned 429 and could not be used - **which
> leaves the single most important question in this file open, see the bottom.**

## The finding that changes the plan

**"Shrimp posture" is already a live English-language meme with real search
demand, and nobody has put a tool at it.**

| Query | Rel. | Note |
| --- | --- | --- |
| `shrimp posture meme` | **1250** | the top completion of `shrimp posture` |
| `posture check meme` | **1250** | the top completion of `posture check` |
| `posture check shrimp` | **750** | the **#2** completion of `posture check` |
| `desk shrimp meme` | 850 | |
| `corporate prawn posture` | 600 | the UK and Australian variant |
| `bürogarnele meme` | **1100** | **the German one, and it is live on TikTok** |
| `sitzen wie ein shrimp` | 601 | Germans search the English word |

The German name is not a translation gag. **It is the English name too.**

And mainstream publishers colonised the term in the last seven months:
[HuffPost](https://www.huffpost.com/entry/desk-shrimp-bad-posture-signs_l_69778ab5e4b084f2a18f4368)
("desk shrimp", 3 Feb 2026),
[Parade](https://parade.com/health/what-is-shrimp-posture),
[Yahoo Health](https://health.yahoo.com/wellness/fitness/exercise/articles/shrimp-posture-physical-therapist-explains-035500109.html),
[FlexiSpot UK](https://flexispot.co.uk/blog/what-is-shrimp-posture-and-how-can-you-avoid-it)
**and** [FlexiSpot DE](https://www.flexispot.de/blog/was-ist-die-shrimp-posture-und-wie-kann-man-sie-vermeiden)
(7 May 2026), plus a competitor's blog.

**Every one of those is an article. Not one is a tool.** The intent behind
`posture check shrimp` is *"show me, or do something about it"*, and the results
answer with prose. That is the opening: a page that looks at you for ten seconds
and tells you whether you are one.

**The catch: we are roughly fourth to the metaphor.** **SuperShrimp** (Marc Lou,
338 Product Hunt upvotes, #3 Product of the Day, April 2026), **SitSense** (which
ranks users "from Shrimp to Giraffe") and **PostuReveal** (a Chrome extension
with a blue shrimp mascot) got there first. `shrimp posture app` will surface
SuperShrimp for the foreseeable future. But SuperShrimp ranks for **its brand
name**, not for the meme, and the German lane (`Bürogarnele`) is completely
uncontested. **Target the meme, not the app category.**

## The architecture is not a keyword

This matters because it is counterintuitive. These seeds returned **no
autocomplete suggestions at all**:

`posture app browser` · `posture detection online` · `posture app that uses
camera` · `webcam posture app` · `posture app without …` · `posture free online`
· `sit up straight app` · `posture app for pc` · `posture app privacy`

**People do not search for how a thing is built.** They search for the symptom
and for the word *free*. Treat "nothing leaves your device" as a conversion and
trust asset, not as a keyword. The nearest live privacy signal is
`posture app reddit` (601) - people outsource the trust question to Reddit, not
to Google.

The one exception worth noting: `webcam posture monitor` does autocomplete at
601. It is the only webcam-architecture query with a real completion, and it has
essentially no competition. Low volume, near-zero difficulty.

## "Free" is the highest-intent modifier, in every language

| Query | Rel. |
| --- | --- |
| `free posture app` (en) | **1250** |
| `姿勢 アプリ iphone 無料` (ja) | **1250** — the top completion |
| `姿勢 アプリ 無料` (ja) | **1150** |
| `free posture analysis app` (en) | 950 |
| `posture app free` (en) | 700 — the **#1** completion of `posture app` |
| `app postura gratis` (es) | 556 |

This is the wedge, and it is the one thing every commercial competitor
structurally cannot claim. SitApp caps the free tier at an hour a day,
StopSlouching gates continued use at $2.99/mo, Slouch Sniper is $19, SuperShrimp
is $17.

## English

| Query | Rel. | Intent | Difficulty [EST] | Verdict |
| --- | --- | --- | --- | --- |
| `posture corrector` | 1250 | retail | **hopeless** | Amazon, Forbes Vetted, affiliate listicles. Wrong intent anyway. |
| `posture reminder device` | 1250 | retail | hopeless | hardware |
| `text neck syndrome` | 1250 | informational | **high** | Healthline, Cleveland Clinic, PubMed. YMYL. |
| `forward head posture fix` | 1000 | informational | **high** | same |
| `posture reminder app` | 1050 | transactional | med-high | contested by SitApp, Posture Reminder AI, the stores |
| `free posture app` | 1250 | transactional | **low-med** | ✅ **primary target** |
| `posture check shrimp` | 750 | meme | **very low** | ✅✅ **highest fit in the report** |
| `shrimp posture meme` | 1250 | meme | very low | ✅✅ |
| `nerd neck exercises` | 601 | informational | med | slang variant, softer SERP than the clinical term |
| `how to stop slouching at desk` | 601 | informational | **med** | furniture brands and clinics; beatable *only* with a working tool on the page |
| `posture alarm app` | 600 | transactional | low | ✅ maps straight onto the ramping alarm |
| `bad posture alarm` | 553 | transactional | very low | ✅ |
| `online posture check` | 559 | transactional | very low | ✅ closest "browser tool" phrasing that autocompletes at all |
| `slouch detector github` | 601 | dev | very low | ✅ developer entry point |
| `posture reminder chrome extension` | 601 | transactional | very low | ⚠️ we are a page, not an extension - see the note below |

## German

| Query | Rel. | Difficulty [EST] | Verdict |
| --- | --- | --- | --- |
| `handynacken symptome` | 1250 | med | the German text neck; strong health-publisher SERP |
| `handynacken übungen` | 1200 | med | |
| `handynacken loswerden` | 600 | med-low | ✅ |
| `richtig sitzen am schreibtisch` | 1000 | **high** | AOK, TK, DGUV, ergonomics retail. Institutional. |
| `gerade sitzen hilfsmittel` | 1000 | **hopeless** | "Hilfsmittel" means hardware intent |
| `gerade sitzen trainieren` | 602 | **low** | ✅ closest to "trainer, not brace" |
| `bürogarnele meme` | **1100** | **very low** | ✅✅ the German brand term |
| `gerade sitzen meme` / `krumm sitzen meme` | 558 / 551 | very low | ✅ |
| `haltungstrainer rücken` / `sinnvoll` | 1151 / 1150 | **hopeless** | `aldi`, `lidl`, `rossmann`, `testsieger`, `stiftung warentest` in the top 12. Pure retail. |
| `haltungstrainer app`, `haltung verbessern app`, `haltungsanalyse app` | 550-553 | **very low** | ✅ thin but **completely unserved - no German-language webcam posture tool was found anywhere in this research** |
| `rundrücken wegtrainieren` / `loswerden` | 650 / 601 | med | ✅ |
| `rückenschmerzen büro übungen` | 559 | **low** | ✅ |

**A trap worth naming.** `Garnele Haltung` autocompletes entirely to aquarium
keeping - `amano`, `sulawesi`, `blue bolt`, `garnelen haltung im aquarium`. The
word *Haltung* means both posture and animal husbandry in German. **Never build a
page on `Garnele Haltung`; it will pull shrimp-tank traffic.** Use `Bürogarnele`,
`sitzen wie eine Garnele`, or the English `shrimp posture`.

## The other ten languages

| Lang | Strongest verified queries (Rel.) | Demand [EST] | Read |
| --- | --- | --- | --- |
| **ja** | `姿勢 アプリ iphone 無料` (1250), `姿勢 アプリ 無料` (1150), `デスクワーク 肩こり 対策` (1250), `猫背 治す グッズ` (850), `スマホ首 治し方` (700) | **high** | **The strongest non-EN/DE market.** "Free" is literally the top app modifier. 猫背 (*nekose*, "cat back") is a mainstream non-clinical word, 肩こり (stiff shoulders) is a national preoccupation, and **Nekoze** - a 13-year-old free Mac app where a cat meows at you - proves the joke-alarm format lands here. |
| **tr** | `dik oturmak` (1251), `dik oturma korsesi` (1250), `duruş bozukluğu egzersizleri` (1050), `kambur duruş düzeltme` (950) | med-high | Deep demand, heavily corset-led (`korse` everywhere). `duruş düzeltme uygulaması` only 601 - the app shelf is wide open. |
| **pt** | `corrigir postura corcunda` (1250), `pescoço de texto` (1250, with a full `sintomas` / `como tratar` / `tem cura` long tail) | med-high | Text neck has a native Brazilian name with its own cluster. App queries are thin. |
| **nl** | `houding verbeteren oefeningen` (1250), `rugpijn bureaustoel` (601) | med | Physio-dominated. `houding app` returns almost nothing. Small market, easy SERP. |
| **pl** | `wada postawy icd 10` (1250, *clinical*), `garbienie się ćwiczenia` (900), `jak siedziec prosto przy biurku` (600) | med | Split between a clinical register and a colloquial one. **Target the colloquial half.** |
| **ru** | `сутулость это` (1000), `текстовая шея` cluster (800), `осанка за компьютером мем` (601) | med | Note the **meme** framing works in Russian too. Google is not the dominant engine here, so these figures under-read RU demand by an unknown factor. |
| **it** | `correggere la postura del collo` (650), `postura scrivania computer` (601) | low-med | Seeds mixed with Spanish results, itself a signal of thin Italian-specific demand. |
| **es** | `postura escritorio de pie` (601), `app postura gratis` (556) | low-med | |
| **fr** | `mal de dos posture bureau` (556), `se tenir droit au bureau` (557) | low-med | ⚠️ **`application posture` is polluted by "application security posture management"** - an infosec term. Avoid it entirely as a French head term. |
| **zh** | `駝背 矯正帶` (562), `低頭族 頸椎痛` (600) | **unmeasured** | Google reflects TW/HK only. 低頭族 ("head-down tribe") is the native text-neck term. Mainland demand runs through Baidu, which could not be queried. **Do not deprioritise on this data.** |

## Build order

| # | Market | Why | Effort |
| --- | --- | --- | --- |
| 1 | **English** | The only language where the brand metaphor itself has volume, where "free" intent is strongest, and where Hacker News, Product Hunt and Reddit live. | med |
| 2 | **German** | The product's native language, `Bürogarnele` confirmed, `Handynacken` is a strong native cluster, and **zero German webcam posture tools exist**. | low |
| 3 | **Japanese** | "Free" is the #1 app modifier; 猫背 / スマホ首 / 肩こり all mainstream; Nekoze proves cultural fit. | med |
| 4 | **Portuguese** | `pescoço de texto` is a complete native cluster with near-zero app competition. | low |
| 5 | **Turkish** | Very deep demand, empty app shelf. | low |
| 6-8 | **Polish, Dutch, Russian** | Real colloquial clusters, no competitors, pure reach. | low |
| 9 | **French, Spanish, Italian** | Thin app demand, ASPM pollution in French. Ship the pages, do not invest writing effort. | low |
| 10 | **Chinese** | Unmeasured. Validate on Baidu before deciding anything. | low |

## Who owns the results today

| Term type | Who ranks | Winnable? |
| --- | --- | --- |
| **Hardware head terms** (`posture corrector`, `Haltungstrainer`, `dik oturma korsesi`) | [Forbes Vetted](https://www.forbes.com/sites/forbes-personal-shopper/article/best-posture-corrector/) plus a wall of affiliate listicles; Upright GO owns the product slot | ❌ **hopeless**, and the wrong intent anyway |
| **Clinical informational** (`text neck`, `forward head posture`) | [Healthline](https://www.healthline.com/health/bone-health/forward-head-posture), [Mayo Clinic](https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/office-ergonomics/art-20046169), Cleveland Clinic, PubMed | ❌ **hopeless.** YMYL: Google wants medical E-E-A-T, and a joke-alarm page will not get it |
| **"How to stop slouching at desk"** | furniture brands, ergonomics consultancies, physio clinics, Quora | ⚠️ **medium** - beatable *only* with a page whose differentiator is the working tool embedded in it. Prose will lose. |
| **"Best posture app"** | almost entirely **competitor-owned listicles**: [sitapp.app](https://sitapp.app/blog/free-posture-reminder-app), [posturereminderapp.com](https://posturereminderapp.com/blog/posture-monitoring-apps/), [sitsense.app](https://www.sitsense.app/blog/best-free-posture-trackers) | ⚠️ **medium** - they rank their own listicles for "free" while gating the product. Beatable, but it is five funded content operations, not a vacuum. |
| **Shrimp / meme terms** | HuffPost, Parade, Yahoo, FlexiSpot, LinkedIn Pulse, TikTok Discover | ✅✅ **yes.** All articles. **No tool.** |
| **Browser / extension** | PostureMinder, Mind Your Posture, MakeUseOf, GitHub repos - all with tiny installs | ✅ yes, no incumbent, but near-zero volume |
| **Comparison / alternatives** | competitors are actively building these: [slouchsniper.com/compare](https://slouchsniper.com/compare/slouch-sniper-vs-supershrimp/), [sitapp.app/blog/sitapp-vs-supershrimp](https://sitapp.app/blog/sitapp-vs-supershrimp), AlternativeTo | ✅ **yes, and under-defended.** We are the free answer to every one of these comparisons. |

## What the install counts prove

The four browser-native posture tools with public numbers total about **196 users
between them**: PostureCorrector 85, "Sit up straight" 106, PostuReveal 5,
Firefox's "Posture Webcam Monitor" **0**. Meanwhile a macOS app hit 692 Hacker
News points and a paid desktop app hit 338 Product Hunt upvotes.

There is real, proven, spiky interest in webcam posture tools, **and it has never
once been converted at the browser shelf.** That is either a wide-open
opportunity or evidence that people who want this want a background daemon and a
tab is the wrong container. **Both readings fit the data.** The honest position is
that this is an untested bet and "the one tab you leave open" is the crux of it.

## The gap that is closing

Be honest about this: **"free, browser, no install, webcam, nothing leaves your
device" is no longer unserved.**

- [StopSlouching](https://stopslouching.app/) is already a browser-based,
  no-account, on-device webcam posture tool - tagline *"Live on your webcam ·
  Nothing uploaded · No account to try"* - gating continued use at $2.99/mo.
- [SitSense's extension](https://www.sitsense.app/extension) is already free with
  no account, running MediaPipe in-browser.
- SitApp published *7 Free Posture Reminder Apps* in February 2026 and correctly
  identified that only one of the seven is browser-based.

What is still genuinely unclaimed:

| Claim | Who else can say it |
| --- | --- |
| Free **forever**, with **no Pro tier at all** | nobody |
| **No install of any kind**, not even an extension | StopSlouching only |
| **12 languages** | **nobody** - every competitor surveyed is English-only |
| **No server exists** (not "we don't upload" - there is nothing to upload *to*) | only the open-source projects |
| **Joke alarm sounds** | **nobody.** Everyone else nudges gently or blurs. |

**The strongest unclaimed sentence in this category is the intersection: the only
posture watcher that is free forever, needs no install and no account, speaks
twelve languages, and has no server to send anything to.** No competitor can
claim more than two of those five.

## Market context, with the weak numbers marked

| Claim | Figure | Strength |
| --- | --- | --- |
| **Annual neck pain prevalence in office workers: 42-63%, the highest of any occupation** ([Physical Therapy, Oxford](https://academic.oup.com/ptj/article/98/1/40/4562646)) | 42-63% | ✅ **the single best stat for this product** |
| Low back pain is the world's leading cause of years lived with disability ([Lancet Rheumatology GBD 2021](https://www.thelancet.com/journals/lanrhe/article/PIIS2665-9913(23)00098-X/fulltext), [WHO](https://www.who.int/news-room/fact-sheets/detail/low-back-pain)) | **619M** in 2020 → 843M by 2050 | ✅ strong |
| Global neck pain burden | 203M → 269M by 2050 | ✅ strong |
| Smartphone overuse ↔ neck pain ([Postgraduate Medical Journal 2025](https://academic.oup.com/pmj/article/101/1197/620/7944093)) | adjusted **OR 2.34** (1.44-3.82) | ✅ strong |
| Office workers seated 70-80% of working hours | 70-80% | ⚠️ secondary citation |
| Text neck prevalence, **university students** ([J Public Health 2025](https://link.springer.com/article/10.1007/s10389-025-02565-3)) | 60.8% pooled, high heterogeneity | ⚠️ students only. **Do not generalise this to office workers.** |
| Head load at forward tilt: 5-6 kg → 18 kg at 30° → 27 kg at 60° | — | 🔴 **weak.** The recycled Hansraj figure, repeated by a furniture vendor, primary study uncited. **Do not put this on the site.** |
| Ergonomic products market size | one vendor says $14.8B for 2025, another says **$25.33B for 2026** | 🔴 **weak.** Two "market size" figures for adjacent years differing by ~70%. Paywalled-report lead magnets. Say "a multi-billion-dollar hardware category" and nothing more precise. |
| "58% of Fortune 1000 fund ergonomics" | — | 🔴 **no primary source found. Do not cite.** |

**Anchor on the two strong numbers** - 42-63% annual neck pain in office workers,
and 619 million people with low back pain as the world's leading cause of
disability. Drop the kilograms and every market-size figure.

## Suggested cluster map

| # | Cluster | Head term | Difficulty [EST] | Priority |
| --- | --- | --- | --- | --- |
| **A** | **Shrimp meme (en)** | `shrimp posture meme` / `posture check shrimp` | **very low** | ⭐⭐⭐ |
| **B** | **Bürogarnele (de)** | `bürogarnele meme` / `sitzen wie eine Garnele` | **very low** | ⭐⭐⭐ |
| **C** | **Free (all languages)** | `free posture app` · `姿勢 アプリ 無料` · `app postura gratis` | low-med | ⭐⭐⭐ |
| **D** | **Alternatives** | `SuperShrimp alternative`, `free alternative to SitApp` | low | ⭐⭐⭐ |
| **E** | **Handynacken (de)** | `handynacken übungen` / `loswerden` | med | ⭐⭐ |
| **F** | **Text neck** (en/pt/ja/ru) | `text neck` · `pescoço de texto` · `スマホ首` | med-high | ⭐⭐ |
| **G** | **Stop slouching at desk** | `how to stop slouching at desk` | med | ⭐⭐ |
| **H** | **Alarm** | `posture alarm app` · `bad posture alarm` | low | ⭐⭐ |
| **I** | **Webcam tool** | `webcam posture monitor` · `online posture check` · `slouch detector github` | very low | ⭐ (low volume) |
| **J** | **Native colloquial hunchback terms** | `rundrücken` · `garbienie się` · `kambur` · `猫背` · `сутулость` | low-med | ⭐⭐ |
| ❌ | ~~posture corrector / Haltungstrainer / dik oturma korsesi~~ | — | hopeless | **do not build** |
| ❌ | ~~forward head posture / craniovertebral / clinical~~ | — | hopeless (YMYL) | **do not build** |

One tactical note on cluster I: `posture reminder chrome extension` has a real
completion and no competition, but **this is a page, not an extension**, and
r/InternetIsBeautiful explicitly bars extensions. Ranking for it would deliver
mismatched intent. Either ship a thin extension wrapper and claim it honestly, or
skip the term. Do not write a page that pretends.

## Open questions

- **Real volumes.** Validate clusters A, B and C in Keyword Planner before
  writing anything. Cluster C especially - "free posture app" carries the whole
  strategy.
- **Is the shrimp meme rising or decaying?** Google Trends returned 429 and could
  not be checked. **This is the highest-value unresolved question here:** if
  `shrimp posture` peaked in February 2026 with the HuffPost cycle, the entire
  cluster-A thesis weakens sharply. Check it manually before building those
  pages.
- TikTok view and hashtag counts for `#shrimpposture`, `#posturecheck` and
  `#bürogarnele` are not exposed to the research environment. The breadth of the
  Discover pages is the evidence; the size is unmeasured.
- Chinese demand needs Baidu Index; Russian needs Yandex Wordstat. Google
  under-measures both.
- SuperShrimp's actual traffic. Product Hunt upvotes are not users, and this is
  not resolvable from outside.

# Idle games flatten the wait; Shrimpcoin doubles it

How Cookie Clicker, AdVenture Capitalist, Clicker Heroes, Antimatter Dimensions
and Universal Paperclips decide how much to pay and when, and what of that a
posture trainer should borrow. Compiled **18 October 2026** from four research
notes. Numbers marked "my calculation" are arithmetic on the cited formulas,
not quoted from a source.

The short version: **idle games do not keep people playing with big rewards,
they keep the wait for the next reward inside a band.** Costs grow
geometrically (1.07x to 1.15x per copy bought), income grows to meet them
through milestone multipliers and new tiers, and when that stops working a
prestige reset puts the player back on the cheap, fast part of the curve. The
first purchase arrives within seconds, new mechanics within minutes, plateaus
within hours, and the slowest loops run over days. Shrimpcoin has the doubling
price ladder of an idle game without the growing income, so **the wait between
unlocks doubles every step, from 4 minutes to 67, and then the shop is empty
after about two hours of straight sitting.** That is a fine tutorial and a poor
long-term loop. The bigger problem is the one idle games never have: their
currency pays for time spent in the game, and here the equivalent is time spent
sitting, which is the one thing the evidence in
[`does-posture-training-work.md`](./does-posture-training-work.md) says to
interrupt. The recommendation below is to keep the fast first unlock and the
short, forgiving streak, cap what a single unbroken bout can earn, pay for
coming back from a break, and treat the coin as onboarding rather than as the
thing that keeps people for months.

## Costs grow by a fixed ratio, income by steps that catch up

Every one of these games uses the same skeleton, written up by Anthony
Pecorella, the Kongregate producer of AdVenture Capitalist: the next copy of a
generator costs `base x rate^owned`, while each copy adds a constant amount of
production that is then multiplied by discrete bonuses. In his words, costs
"grow exponentially while production grows at a linear or polynomial rate",
and multipliers exist to "(temporarily) get production closer to, or ahead of,
costs" ([Pecorella, The Math of Idle Games Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i)).
The rates are surprisingly close across titles.

| Game | Cost growth per copy | What multiplies production |
| --- | --- | --- |
| Cookie Clicker | **1.15** for every building ([wiki.gg, Building](https://cookieclicker.wiki.gg/wiki/Building)) | x2 tiered upgrades at 1, 5, 25, 50, 100, 150... owned ([wiki.gg, Upgrades](https://cookieclicker.wiki.gg/wiki/Upgrades)); 20 building types, each roughly 10x to 15x dearer than the last |
| AdVenture Capitalist | **1.07** for the Lemonade Stand (base 4, 1.67/s), 1.14 for the Car Wash ([Pecorella Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i); [AdCap wiki snippet](https://adventure-capitalist.fandom.com/wiki/Businesses)) | x2 at 25 and at 50 owned |
| Clicker Heroes | **1.07** per hero level (1.22 for the Ace Scouts) ([ClickerHeroes wiki snippet](https://clickerheroes.fandom.com/wiki/Heroes)) | **x4 every 25 levels** from level 200, x10 every 1,000 |
| Antimatter Dimensions | bought in sets of 10; each set multiplies the price by 1e3 for the first dimension up to 1e15 for the eighth ([source code](https://github.com/IvarK/AntimatterDimensionsSourceCode)) | x2 per completed set of 10, and each dimension produces the one below it |

At 1.15 a building's price doubles about every 5 copies, at 1.07 about every
10 (my calculation). The trick is the relation between that rate and the
milestone. **When a multiplier M arrives every k purchases and M is roughly
rate^k, the wait between purchases stays roughly flat.** Clicker Heroes is
nearly balanced: 1.07^25 is about 5.4 against a x4 per 25 levels, so the wait
envelope only grows about 35% per 25 levels. AdCap's Lemonade Stand is nearly
flat too: my calculation puts the wait for the next stand at 0.47 s with 10
owned, 0.51 s at 24, **0.26 s at 25** when the x2 lands, 0.67 s at 49 and 0.35 s
at 50. Cookie Clicker is deliberately not balanced per building: a single
Grandma's wait goes from 40 s at 5 owned to 132 s at 25 and 2,167 s at 50, and
the x2 tiers only knock a saw-tooth into that rising line. Cookie Clicker keeps
the player's next purchase cheap by rotating to a new building type instead
(my calculation, from the wiki prices).

Antimatter Dimensions takes this furthest. Because each tier produces the one
below, four tiers give production of `1 + t + t^2/2 + t^3/6`, and the more
tiers there are, the closer production gets to e^t, which is how a game can
afford price jumps of 1e15 per ten
([Pecorella Part II](https://www.gamedeveloper.com/game-platforms/the-math-of-idle-games-part-ii)).
The cost of reading these curves straight is that the numbers get absurd, which
is why they are best read in log space: a geometric price maps each purchase to
a constant step in the logarithm, and every new word (million, billion,
tredecillion) becomes its own small event.

A perception argument sits under all of this. Eric Guan points out that people
notice ratios, not differences: 5 to 6 is felt, 100 to 101 is not, 100 to 120
is ([Guan, Idle Game Design Principles](https://ericguan.substack.com/p/idle-game-design-principles)).
A doubling price ladder is perceptually even. Whether the *wait* is even
depends entirely on whether income grows with it.

## The first reward lands in seconds, and the clock stretches by orders of magnitude

Opening prices are tiny. Cookie Clicker's first Cursor costs **15 cookies** and
the first Grandma 100 ([wiki.gg, Building](https://cookieclicker.wiki.gg/wiki/Building)),
which at a plausible five to seven clicks a second is two or three seconds and
then fifteen or twenty (my calculation). AdCap's first Lemonade Stand costs
about 4, and the first one is free
([Pecorella Part I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i)).
Universal Paperclips opens with a single button that makes one paperclip, and
"other options quickly open up"
([Wikipedia](https://en.wikipedia.org/wiki/Universal_Paperclips)); one player's
best time for the first 1,000 clips is **2 min 45 s**
([inhji.de](https://inhji.de/Games/Universal-Paperclips)). Players notice when
this is missed: one commenter put the usual first upgrade at 50 to 100 clicks
and complained that a game asking 300 felt slow
([itch.io](https://itch.io/post/2338703), anecdotal).

After that the timescale stretches by roughly an order of magnitude per layer.
A practitioner rule of thumb, from a developer who built seven of these games,
is first upgrade within 60 seconds, first automation within about three
minutes, first prestige within 10 to 15 minutes
([DEV Community](https://dev.to/aguier/i-built-7-idle-games-in-30-days-what-i-learned-about-incremental-design-5d3f),
read from a search summary, not in full). Guan's own game spaces collection
clocks at 20 minutes, 5 hours and 2 days
([Guan](https://ericguan.substack.com/p/idle-game-design-principles)).
Antimatter Dimensions' introductory era alone takes roughly **8 hours to 2
days** ([AD wiki guide](https://antimatter-dimensions.fandom.com/wiki/Guide)).
None of the big studios publishes a target interval; the shared shape across
every heuristic found is log-spaced: seconds, minutes, hours, days.

New mechanics are staged the same way. Universal Paperclips goes from clipping
by hand to selling, autoclippers and marketing, then investments and
competitors, then drones, then space probes, and each stage arrives when the
previous loop plateaus
([Wikipedia](https://en.wikipedia.org/wiki/Universal_Paperclips)). A Dark Room
hides almost everything at first; its iOS porter Amir Rajan said "If the pacing
wasn't perfect, gamers would lose interest and delete the app", and some
players did reject the bare opening as a scam
([Pocketgamer.biz](http://www.pocketgamer.biz/shedding-light-the-making-of-a-dark-room/)).
Universal Paperclips is the important counterexample to "the curve must never
end": it is a finite game of about **five to six hours**
([Pixelpoppers](https://pixelpoppers.com/review/universal-paperclips/)), and it
drew **450,000 players in its first 11 days, "most to completion"**, per Wired
([Wikipedia](https://en.wikipedia.org/wiki/Universal_Paperclips)). A curve that
ends is fine if what happens along it keeps changing.

When the waits finally outrun income, prestige resets the run in exchange for a
permanent multiplier computed through a root of earnings: Cookie Clicker takes
the **cube root** of lifetime cookies over 1e12, AdCap 150 x the **square
root** of lifetime earnings over 1e15, Egg, Inc. the 0.14th power of the run's
earnings. The exponent sets the loop length: doubling the bonus takes about 8x
the previous run's earnings in Cookie Clicker, 3x to 4x in AdCap and about 128x
in Egg, Inc. ([Pecorella Part III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)).
Pecorella's GDC slides suggest resetting when it would gain "somewhere in the
range of +50% to +200%"
([Quest for Progress slides](https://www.slideshare.net/slideshow/quest-for-progress-gdc-europe-2016/65405507)).
Prestige is, at bottom, a way of handing the player the fast early part of the
curve again.

## Between purchases: welcome-back payouts, golden cookies and milestones

Three secondary mechanics fill the gaps. **Offline progress** pays for time
away: the game stores when it closed, multiplies production by elapsed time
and usually caps it. Egg, Inc. caps it at 2 hours, which Pecorella later called
a mistake ([slides](https://www.slideshare.net/slideshow/quest-for-progress-gdc-europe-2016/65405507);
[Part III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)).
His summary of why idle games retain is that "the longer you're away from the
game, the greater your incentive to return"
([Game Developer](https://www.gamedeveloper.com/design/the-rise-of-games-you-mostly-don-t-play)).
The genre's usage pattern fits: GameAnalytics' 2020 idle benchmarks put the
average at **5.3 sessions a day of about 8 minutes**, with top-quartile D1
retention at 39.4%
([Game World Observer](https://gameworldobserver.com/2020/12/22/gameanalytics-names-benchmark-engagement-metrics-idle-games)).
Idle games are many short check-ins, not long sittings.

**Variable rewards** are the second. Cookie Clicker's golden cookie spawns at a
random moment between 300 and 900 seconds, stays on screen for 13 seconds, and
is about 40% Lucky, 40% Frenzy (x7 production for 77 s) and a long tail of
rarer outcomes; Lucky pays the lesser of 15% of the bank or 15 minutes of
production, so it scales with progress and never breaks the economy
([wiki.gg, Golden Cookie](https://cookieclicker.wiki.gg/wiki/Golden_Cookie)).
The evidence that variable schedules beat fixed ones in games is thinner than
the folklore: a University of Tasmania thesis (n = 51) found reward of any kind
extended play but variable over fixed ratio was not significant, and a later
Bayesian study from the same group (n = 56) leaned towards no difference
([UTAS](https://eprints.utas.edu.au/47622/)). Kao found players prefer variable
rewards except when the range includes very small or zero payouts
([Kao 2012](https://people.csail.mit.edu/dkao/pdf/kao2012rewardpreference.pdf)).

**Collections** are the third. Cookie Clicker has 639 achievements, the first
ones trivial ("bake 1 cookie"), and each adds 4% "milk" that kitten upgrades
turn into a production multiplier, so collecting is itself an economic act
([wiki.gg, Achievements](https://cookieclicker.wiki.gg/wiki/Achievements);
[Milk](https://cookieclicker.wiki.gg/wiki/Milk)). The golden-cookie
achievements sit at 1, 7, 27, 77, 777 and 7,777: dense early, sparse late.

The line between this and manipulation has been drawn clearly. Zagal, Björk and
Lewis list "grinding" and "playing by appointment" as temporal dark patterns,
features that stretch play against the player's interest
([Deceptive Design summary](https://www.deceptive.design/articles/dark-patterns-in-the-design-of-games)),
and Ian Bogost's Cow Clicker, a cow you could click once every six hours,
satirised exactly that ([Wikipedia](https://en.wikipedia.org/wiki/Cow_Clicker)).
An offline cap is an appointment; a 13-second golden cookie is a summons back
to the screen. Both are tools built to pull attention towards the game, which
is the opposite of what a background posture tool should do with attention.

## Health apps show what survives after the first month

Idle-game retention tricks have been tried on health behaviour, and the record
is sobering. In Patel's 2016 trial of 281 employees, paying $1.40 for each day
a step goal was met hit the goal on **35% of days against 30% for control**, no
meaningful difference; only loss framing (money allocated up front and taken
away per miss) reached 45%, and every arm fell back once payments stopped
([Penn Today](https://penntoday.upenn.edu/2016-03-24/research/prospect-losing-money-pushes-people-achieve-fitness-goals)).
Gain-framed pay per unit of good behaviour is structurally what Shrimpcoin is,
in real money rather than a cartoon coin. Pokemon Go added 955 steps a day in
week one and was back to baseline by week six
([Howe et al., BMJ 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5154977)).
STEP UP's points-and-levels design held an effect after the intervention ended
only in its competition arm
([Penn Medicine](https://pennmedicine.org/news/news-releases/2019/september/using-a-wearable-device-to-exercise-more-add-competition-to-improve-your-results)).
A 2022 meta-analysis of gamified physical-activity RCTs did find the effect
persisting at follow-up and argued against pure novelty
([Mazeas et al., JMIR](https://jmir.org/2022/1/e26779)); its pooled effect
sizes could not be verified for this page.

What does survive is slack and feedback. Duolingo learners who reach a
**7-day streak are 3.6 times more likely to finish** a course, milestone
animations alone raised day-7 retention by 1.7%, and letting people hold two
streak freezes raised daily actives without more days off
([Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)).
Duolingo also says long streaks run on loss aversion, which can stop people
from starting at all. Sharif and Shu's step study measured the same thing: after
a missed day, 55% rebounded when they had weekly emergency reserves against 37%
with a hard goal ([UCLA Anderson](https://anderson-review.ucla.edu/wp-content/uploads/2021/03/Sharif-Shu_EmergencyReserveFailure_OBHDP2019.pdf)).
On motivation, Deci, Koestner and Ryan's meta-analysis of 128 experiments found
expected, engagement-contingent rewards reduce later free-choice interest
(d = -0.40) while positive informational feedback increases it (d = 0.33)
([Deci et al. 1999](https://depts.washington.edu/techdocs/papers/deciExtrinsicRewardsAndIntrinsicMotivation99.pdf)),
and Etkin found that measuring an activity makes people do more of it while
enjoying it less ([Etkin 2016](https://marketing.wharton.upenn.edu/wp-content/uploads/2016/10/Etkin-Jordan-11-12-15-Hidden-Cost.pdf)).
The undermining matters less for sitting straight, which few people find
intrinsically enjoyable, but it argues for coins that read as "you sat well for
20 minutes" rather than as wages.

## What this means for Shrimpcoin

### The current design, measured against the genre

Shrimpcoin pays 0.1 coin per second of straight sitting (capped at the check
pace) plus 1 bonus coin for every 10 straight readings in a row. At the default
one reading a second that is **12 coin a minute, half of it from the streak
bonus**. Only "good" readings count, and anything else, or nobody in frame,
breaks the streak. The fart is free; the other five sounds cost 50, 100, 200,
400 and 800, and there is nothing else to spend on. The stated aim, in
`CHANGELOG.md`, is that the gamification should make people use the page from
the first visit, "longer and more often".

| Unlock | Price | Wait at 12/min, saving for each in turn | Straight sitting so far |
| --- | ---: | ---: | ---: |
| fart | 0 | 0 | 0 |
| first paid | 50 | 4.2 min | 4.2 min |
| second | 100 | 8.3 min | 12.5 min |
| third | 200 | 16.7 min | 29.2 min |
| fourth | 400 | 33.3 min | 62.5 min |
| fifth | 800 | 66.7 min | 129.2 min |

The opening is right by idle standards: a free item at second zero, the way
AdCap gives away the first Lemonade Stand, and a first paid unlock inside the
first session. The streak is also right, more by accident than design. Ten
readings is a ten-second streak, so breaking it costs at most 0.9 coin; it is a
"keep sitting well right now" bonus with Duolingo-style slack already built in,
not a loss-aversion trap.

The middle and end are where it departs from the genre. Income never grows, so
the doubling ladder doubles the wait, and **no idle game lets the wait double
five times in a row without income catching up**. The final sound needs 67
minutes of straight sitting by itself. How many days the ladder lasts depends
entirely on how much straight sitting a person logs, which the page does not
know; for illustration (my calculation, not usage data):

| Straight sitting per day | Coin per day | Whole ladder done after |
| ---: | ---: | ---: |
| 15 min | 180 | about 9 days |
| 30 min | 360 | about 4 days |
| 60 min | 720 | about 2 days |

After that the purse fills with coins that buy nothing, which is the end of the
loop. Universal Paperclips shows an ending is acceptable, but its ending comes
after six hours of new mechanics; here it comes after five sounds.

### The tension idle games do not have

An idle game is happy when you stay. The currency here is earned per second of
sitting, so **every extra minute in the chair pays, and the longest unbroken
sitting pays the most**. The best-supported finding in this folder is the
opposite: in Christensen 2023 a 15-minute typing task produced clinically
relevant pain in every posture tested, including upright
([PMID 36958253](https://pubmed.ncbi.nlm.nih.gov/36958253/)), and the more
rigorous intervention studies target breaks and postural shifts rather than
holding one posture ([cluster RCT, n = 193](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8091075/)).
"Longer" in the stated aim means longer use of the page, and the coin as built
cannot tell that apart from longer sitting. The changes below are about making
the coin pay for the session shape the evidence supports: sit well for a while,
then get up.

### What to borrow and what to avoid

| Mechanic | Verdict | Concrete form for Shrimpcoin |
| --- | --- | --- |
| Fast first reward | **Keep** | The free fart and a 4-minute first unlock already match the genre's seconds-then-minutes opening. Do not raise the first price. |
| Short, forgiving streak | **Keep, do not lengthen** | The 10-reading bonus is fine. Do not add a bonus that grows with streak length: that is a multiplier on unbroken sitting, the one thing not to pay more for. |
| Production multipliers (x2 at 25, x4 per 25 levels) | **Avoid** | Any multiplier that rises with straight minutes makes long bouts more lucrative per minute, which is backwards for health. Income should stay flat. |
| Offline progress, the "welcome back" payout | **Borrow, inverted** | Pay for the break instead of for the absence from the game: for example, coming back into frame after 2 to 10 minutes away, following at least 20 minutes of straight sitting, pays a flat bonus of 30 coin (2.5 minutes' worth). The 20-minute precondition stops stepping in and out of frame from being farmed. These numbers are set, not established. |
| A cap that ends the run | **Borrow, as a bout cap** | Stop accruing after about 25 straight minutes in one bout, until the next break. At 12/min that is 300 coin per bout, so the 800 sound needs at least three bouts with breaks between them rather than one 67-minute sitting. Christensen's 15-minute result argues for a shorter cap, not a longer one. |
| Doubling prices on flat income | **Change for any new items** | With income flat, keep prices nearly flat too: further items around 300 to 600 coin, one to two capped bouts each, so the wait stays in a band instead of doubling. |
| New tiers and staged reveals | **Borrow, sparingly** | The genre renews interest with new mechanics, not bigger numbers. A new sink could arrive when the fifth sound is bought, so the shop does not simply go empty. |
| Golden cookies, random timed events | **Avoid** | A reward that appears for 13 seconds pulls attention to the page, the opposite of a background tool, and the evidence for variable over fixed schedules is weak. Variety belongs in the alarm instead: unlocked sounds can feed the rotation that resists habituation ([Anderson 2015, CHI](https://dl.acm.org/doi/10.1145/2702123.2702322)). |
| Milestones and celebrations | **Borrow** | Informational feedback is the reward with positive evidence. Celebrate milestones that count breaks and good bouts (first capped bout, seventh day with a break), spaced dense early and sparse late like 1, 7, 27, 77. |
| Long daily streaks | **Only with slack** | If a daily streak is ever added, ship freezes or a weekly allowance from day one (Duolingo, Sharif and Shu). |
| Prestige resets, big-number inflation | **Avoid** | Nothing here is worth resetting, and coin amounts in the tens and hundreds are already readable. |

**Decided against, 2026-10-18: no reward for breaks.** His call, verbatim:
„wir können pausen nicht wirklich trakcen, da soll es nicht belohnt werden".
The camera cannot tell a real break from leaning out of frame, covering the
lens or walking off for an hour, so a break bonus would pay for whatever
empties the picture. That rules out the "welcome back" bonus above, the break
milestones, and the bout cap in the form "until the next break", which
depends on the same detection. What stands is the fact behind them: the coin
pays for straight sitting time, and nothing in it pays for getting up.

One honest alternative should be recorded: leave the economy alone and accept
that Shrimpcoin is onboarding. On the health-app record above, that may be all
any coin does. A two-hour ladder that gets someone through their first few
days, after which the alarm and the habit carry on without it, is a defensible
design. What is not defensible is extending the ladder to weeks while it still
pays most for the longest sitting.

## Conclusion

The lesson from idle games is less about generosity than about control of the
interval: a designer decides how long the next wait should be, then bends
prices, multipliers and resets until it stays there. Shrimpcoin's current
ladder makes the opposite choice by default, letting the wait double because
the price doubles, and it would be easy to fix by copying the genre's growing
income. That is the wrong fix here. The piece of the idle toolkit that fits a
posture trainer is the part nobody associates with posture: the welcome-back
payout and the capped run, turned around so that the coin is earned by sitting
well for a while and then getting up.

The deeper finding is that the genre's best retention numbers come from many
short check-ins, five a day of eight minutes, not from long sittings. A posture
trainer that copied that rhythm, rewarding bouts and returns rather than
minutes, would be copying the healthiest thing about idle games rather than the
most compulsive.

## Not verified

- AdVenture Capitalist's per-business cost rates beyond the Lemonade Stand
  (1.07) and Car Wash (1.14), and its full milestone list, were not readable
  (Fandom returned HTTP 402). Clicker Heroes figures come from wiki search
  snippets.
- No primary source from Hyper Hippo, Orteil, Playsaurus or Frank Lantz gives a
  target interval between purchases. Universal Paperclips' cost formulas and
  Lantz's own pacing remarks were not found.
- The DEV Community rule of thumb (first upgrade within 60 s, first prestige in
  10 to 15 minutes) was read from a search summary only.
- The time to first Infinity in Antimatter Dimensions and its exact threshold
  were not confirmed from a fetched source.
- Mazeas et al. 2022's pooled effect sizes could not be checked; only its
  direction is quoted.
- No study compares time-based with event-based rewards in posture or
  sedentary-break apps, so the bout cap, break bonus and their numbers are
  design proposals, not findings. Whether "nobody in frame" reliably means the
  person stood up, rather than leaned out of shot, is untested.
- The illustrative days-to-finish table assumes 15, 30 or 60 straight minutes
  a day; there is no usage data behind those figures.

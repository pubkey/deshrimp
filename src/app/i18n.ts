/**
 * The page in twelve languages.
 *
 * He asked for English on 2026-09-08 („mach die app optional in english") and
 * for ten more the same day. The important word in the first ask was
 * *optional*: German stays the default, because that is the language he set the
 * app up in and the one his stored settings already say.
 * The switch is a setting like any other, so it survives a reload and rides
 * along in `settings`.
 *
 * Three rules this file follows:
 *
 * 1. **One flat object per language, same keys.** `Copy` is derived from the
 *    German one, so a key added there and forgotten in Japanese is a type error
 *    rather than a German word on a Japanese page. That guarantee is the whole
 *    reason twelve languages are maintainable at all.
 * 2. **Anything with a number in it is a function.** German and English put
 *    the pieces in different orders, and „Alle 5 Sekunden ein Bild" is not
 *    „Every 5 seconds a picture" with the words swapped.
 * 3. **This file holds the interface, `data.json` holds the answer.** The
 *    intro, the steps, the sources and the data gaps are content, they change
 *    when the research changes, and they live where the rest of the content
 *    lives — in `data.json`, keyed by language.
 */

import type { SoundName, Verdict } from './db';
import type { AdviceKey } from './pose';
import { es } from './i18n.es';
import { fr } from './i18n.fr';
import { it } from './i18n.it';
import { pt } from './i18n.pt';
import { nl } from './i18n.nl';
import { pl } from './i18n.pl';
import { tr } from './i18n.tr';
import { ru } from './i18n.ru';
import { zh } from './i18n.zh';
import { ja } from './i18n.ja';

/**
 * **Twelve languages since 2026-09-08** („add 10 more languages"). German and
 * English are written out below; the other ten sit in one `i18n.<code>.ts`
 * each, because twelve tables in one file is a file nobody scrolls through.
 *
 * No right-to-left language is in the list. Arabic, Hebrew, Persian and Urdu
 * need `dir="rtl"` and a mirrored layout, which the page frame does not have —
 * adding the words alone would ship a page that reads backwards.
 */
export type Lang =
    | 'de' | 'en' | 'es' | 'fr' | 'it' | 'pt'
    | 'nl' | 'pl' | 'tr' | 'ru' | 'zh' | 'ja';

const de = {
    /* --- identity ------------------------------------------------------- */
    title: 'Sitz aufrecht du Garnele! 🦐',
    /**
     * The subtitle is assembled in `index.tsx` around two links — „Local-First"
     * and „RxDB" — so it arrives here in three pieces rather than as one
     * string. The link words themselves are not translated: they are the names
     * of the things they point at.
     */
    subtitleA: 'App fürs Haltungstraining. Erkennung durch eine lokale KI, gespeichert wird mit ',
    subtitleB: '.',

    /* --- live ----------------------------------------------------------- */
    whatThisDoes: 'Was das hier macht',
    leaveOpen: 'Die Seite schaut über die Webcam zu, wie du sitzt, und gibt einen Ton, wenn dein Kopf zu weit vorn steht oder du zur Seite kippst. Sie muss dafür offen bleiben — am besten in einem eigenen Browser-Tab neben deiner Arbeit. Das Symbol im Tab färbt sich grün oder rot, du siehst es also auch, ohne hinzuschalten.',

    recentTitle: 'Die letzte Zeit',
    recentSubtitle: (m: number) => `Gleitender Durchschnitt über die letzten ${m} Minuten.`,
    recentAngles: 'Winkel im Mittel',
    recentNote: 'Geglättet über je drei Minuten. Ein einzelnes Bild schwankt um ein, zwei Grad — was zählt, ist ob eine Linie über eine Viertelstunde steigt.',
    recentEmpty: 'Noch zu wenig gemessen',
    recentEmptyHint: (m: number) => `Sobald ein paar Minuten aufgezeichnet sind, steht hier der Verlauf der letzten ${m} Minuten.`,
    windowLabel: 'Zeitfenster',
    lastMinutes: (m: number) => `letzte ${m} Minuten`,

    cameraOff: 'Die Kamera ist aus. Solange sie aus ist, wird nichts aufgenommen und nichts verschickt.',
    start: 'Starten',
    stop: 'Stoppen',
    checkNow: 'Jetzt prüfen',
    checking: 'Bild wird ausgewertet …',
    nextIn: (s: number) => `Nächste Prüfung in ${s} s`,
    lastAt: (t: string) => `Zuletzt ${t}`,
    untilNext: 'Bis zum nächsten Bild',
    now: 'jetzt',
    seconds: (s: number) => `${s} s`,

    cameraTitle: 'Kamera',
    analysisFailed: 'Die Auswertung hat nicht geklappt',
    noFrameYet: 'Die Kamera liefert noch kein Bild.',
    nobodyThere: 'Niemand im Bild — die Messung wurde verworfen.',
    lowConfidence: 'Unsichere Messung — schlechtes Licht oder nur halb im Bild.',

    statForward: 'Kopf vor der Schulter',
    statLean: 'Seitneigung',
    statHeadTilt: 'Kopfneigung',
    statConfidence: 'Sicherheit',
    limit: (v: string) => `Grenze ${v}`,
    computedLocally: 'lokal gerechnet',
    modelLoading: 'Modell lädt noch',
    loadingModelTitle: 'Einen Moment',
    loadingModel: 'Das Erkennungsmodell wird geladen — 17 MB, nur beim ersten Mal. Danach liegt es im Browser.',
    modelFailed: 'Das lokale Modell ließ sich nicht laden.',
    noReadingYet: 'Noch keine Messung',
    noReadingYetHint: 'Sobald die Kamera läuft, kommt alle paar Sekunden eine dazu.',

    verdictTitle: { good: 'Du sitzt gerade', borderline: 'Fängt an zu kippen', bad: 'Du sitzt schief' } as Record<Verdict, string>,
    /** The sentence under the verdict. `pose.ts` picks the key, this is the wording. */
    advice: {
        nobody: 'Niemand im Bild.',
        noShoulders: 'Die Schultern sind nicht im Bild.',
        level: 'Schultern stehen waagerecht.',
        leanLeft: 'Die Schulterlinie kippt nach links — richt dich seitlich wieder auf.',
        leanRight: 'Die Schulterlinie kippt nach rechts — richt dich seitlich wieder auf.',
        leanSide: 'Die Schulterlinie kippt zur Seite — richt dich seitlich wieder auf.',
        headTilt: 'Der Kopf ist zur Seite geneigt — Bildschirm evtl. nicht mittig.',
        headTiltPlain: 'Der Kopf ist geneigt.',
        forward: 'Der Kopf steht vor der Schulter — zieh das Kinn zurück und den Hinterkopf nach hinten.',
    } as Record<AdviceKey, string>,
    verdictLabel: { good: 'gerade', borderline: 'grenzwertig', bad: 'schief' } as Record<Verdict, string>,
    sideLabel: { left: 'nach links', right: 'nach rechts', none: 'gerade' } as Record<'left' | 'right' | 'none', string>,

    /* --- today ---------------------------------------------------------- */
    todayTitle: 'Heute',
    todaySubtitle: 'Jede Messung seit Mitternacht, hier auf dem Gerät.',
    todayEmpty: 'Heute noch nichts gemessen',
    todayEmptyHint: 'Der Verlauf füllt sich, sobald die Kamera läuft.',
    satWell: 'Gut gesessen',
    ofReadings: (good: number, total: number) => `${good} von ${total} Messungen`,
    longestRun: 'Längste gute Strecke',
    longestRunHint: 'ohne eine schlechte Messung und ohne Pause dazwischen',
    signals: 'Signale',
    signalsHint: 'eins pro schiefer Messung',
    lastSixty: 'Die letzten 60 Messungen',
    lastSixtyHint: 'Grün gerade, gelb kippt, rot schief. Älteste links.',
    shareToday: 'Anteil gerader Messungen heute',
    showAll: 'Alle Messungen ansehen',
    colTime: 'Zeit',
    colVerdict: 'Urteil',
    colForward: 'Vorn',
    colLean: 'Seitlich',
    colHead: 'Kopf',
    colAdvice: 'Hinweis',

    /* --- trend ---------------------------------------------------------- */
    trendTitle: 'Verlauf über die Tage',
    trendSubtitleEmpty: 'Ob sich etwas ändert, sieht man erst über Wochen.',
    trendDays: (n: number) => `${n} ${n === 1 ? 'Tag' : 'Tage'} mit genug Messungen.`,
    trendEmpty: 'Noch kein Tag mit genug Messungen',
    trendEmptyHint: 'Ab etwa zwanzig Messungen an einem Tag taucht er hier auf. Die Tageswerte bleiben erhalten, auch wenn die Einzelmessungen nach zwei Tagen aufgeräumt werden.',
    lastStraight: 'Zuletzt gerade',
    bestDay: 'Bester Tag',
    lastSevenDays: 'Letzte 7 Tage',
    points: (n: number) => `${n > 0 ? '+' : ''}${n} Pkt.`,
    needsTwoWeeks: 'braucht zwei Wochen',
    betterThanBefore: 'besser als die Woche davor',
    worseThanBefore: 'schlechter als die Woche davor',
    unchanged: 'unverändert',
    shareStraight: 'Anteil gerade gesessen',
    seriesStraight: 'gerade',
    averageDeviation: 'Durchschnittliche Abweichung',
    lessIsBetter: 'Hier ist weniger besser. Steigt eine Linie, während oben der Anteil gleich bleibt, kippst du öfter knapp — das ist die Vorwarnung.',

    /* --- settings ------------------------------------------------------- */
    settingsTitle: 'Einstellungen',
    settingsSubtitle: 'Bleiben in diesem Browser.',
    paceAndLimits: 'Takt und Grenzen',
    onePictureEvery: 'Ein Bild alle',
    oneSecond: 'Sekunde',
    nSeconds: (n: number) => `${n} Sekunden`,
    signalFromForward: 'Signal ab Kopf vor der Schulter',
    signalFromForwardHint: 'Grad aus der Senkrechten, Ohr gegen Schulter',
    signalFromLean: 'Signal ab Seitneigung',
    signalFromLeanHint: 'Grad, Schulterlinie gegen die Waagerechte',
    signalFromHead: 'Signal ab Kopfneigung',
    signalFromHeadHint: 'Grad, Kopf gegen die Schulterlinie',
    soundOnSignal: 'Ton beim Signal',
    alsoNotify: 'Zusätzlich ein Hinweisfenster',
    paceNote: 'Eine Sekunde ist nur deshalb bezahlbar, weil hier gerechnet wird — es geht keine Anfrage raus und nichts wird abgerechnet. Dauert eine Auswertung mal länger als der Takt, wird der nächste Tick übersprungen statt aufgestaut.',
    thresholdNote: 'Die drei Grenzen sind gesetzte Toleranzen, keine Normwerte — für das, was eine Frontalkamera messen kann, gibt es keine. Piept es zu oft, dreh die Grenze hoch; das ist die einzige richtige Art, sie einzustellen.',

    whichSound: 'Welches Geräusch',
    soundLabel: 'Signalton',
    soundHint: 'Liegt in der Seite, wird nicht nachgeladen.',
    listen: 'Anhören',
    soundNote: 'Der Ton kommt bei jeder einzelnen schiefen Messung — im Sekundentakt also jede Sekunde, bis du dich aufrichtest. Er fängt leise an und wird lauter, solange es schief bleibt; eine einzige gute Messung setzt ihn wieder auf leise. Läuft der letzte noch, legt sich der neue darüber, statt ihn abzuschneiden.',
    soundName: {
        furz: 'Furz', raeuspern: 'Räuspern', schrei: 'Schrei',
        knacken: 'Fingerknacken', rimshot: 'Bada-Bumm-Tss',
    } as Record<SoundName, string>,

    leavesTitle: 'Was das Gerät verlässt',
    leavesText: 'Nichts. Das Modell liegt nach dem ersten Laden hier, jedes Bild wird hier ausgewertet und sofort verworfen, und gespeichert werden nur die Zahlen — in diesem Browser, nicht auf einem Server und nicht im Repo. Kein Bild, kein Video, kein Ton, keine Anfrage nach draußen, kein Schlüssel, um den du dich kümmern müsstest.',

    /* --- page furniture ------------------------------------------------- */
    howItWorks: 'So funktioniert das',
    inShort: 'Kurz gesagt',
    saveReadings: 'Messungen sichern',
    saved: 'Gesichert',
    clearHistory: 'Verlauf löschen',
    historyCleared: 'Verlauf gelöscht',
    clearHistoryBody: 'Alle Einzelmessungen auf diesem Gerät werden gelöscht — das lässt sich nicht rückgängig machen. Die Tageswerte im Verlauf bleiben erhalten.',
    loading: 'Einen Moment …',
    noStorageTitle: 'Die Seite kann nichts speichern',
    noStorageText: 'Im privaten Fenster gibt es keine Datenbank. In einem normalen Fenster öffnen — dann bleibt der Verlauf erhalten.',
    notifyBlocked: 'Der Browser erlaubt keine Hinweise.',
    notifyTitle: 'Du sitzt schief',

    /* --- camera errors -------------------------------------------------- */
    camBlocked: 'Die Kamera ist blockiert. Im Browser für diese Seite erlauben und neu starten.',
    camNotFound: 'Keine Kamera gefunden.',
    camBusy: 'Die Kamera ist von einem anderen Programm belegt.',
    camOther: (m: string) => `Kamera lässt sich nicht öffnen: ${m}`,

    /* --- units ---------------------------------------------------------- */
    minutesShort: (n: number) => `${n} min`,
    hoursAndMinutes: (h: number, m: number) => `${h} h ${m} min`,
};

export type Copy = typeof de;

const en: Copy = {
    title: 'Sit straight shrimp! 🦐',
    subtitleA: ' app to train your posture. Uses local AI for detection and ',
    subtitleB: ' for storage.',

    whatThisDoes: 'What this does',
    leaveOpen: 'This page watches how you sit through your webcam and makes a noise when your head is too far forward or you tip to one side. It has to stay open to do that — best in its own browser tab, next to whatever you are working on. The tab icon turns green or red, so you can see how it is going without switching to it.',

    recentTitle: 'The last while',
    recentSubtitle: (m: number) => `Moving average over the last ${m} minutes.`,
    recentAngles: 'Angles on average',
    recentNote: 'Smoothed over three minutes at a time. A single frame wobbles by a degree or two — what matters is whether a line climbs across a quarter of an hour.',
    recentEmpty: 'Not enough measured yet',
    recentEmptyHint: (m: number) => `Once a few minutes are recorded, the last ${m} minutes show up here.`,
    windowLabel: 'Time window',
    lastMinutes: (m: number) => `last ${m} minutes`,

    cameraOff: 'The camera is off. While it is off, nothing is recorded and nothing is sent.',
    start: 'Start',
    stop: 'Stop',
    checkNow: 'Check now',
    checking: 'Reading the picture …',
    nextIn: (s: number) => `Next check in ${s} s`,
    lastAt: (t: string) => `Last at ${t}`,
    untilNext: 'Until the next picture',
    now: 'now',
    seconds: (s: number) => `${s} s`,

    cameraTitle: 'Camera',
    analysisFailed: 'The analysis did not work',
    noFrameYet: 'The camera is not delivering a picture yet.',
    nobodyThere: 'Nobody in the picture — the reading was discarded.',
    lowConfidence: 'Uncertain reading — poor light, or only half of you is in frame.',

    statForward: 'Head in front',
    statLean: 'Side lean',
    statHeadTilt: 'Head tilt',
    statConfidence: 'Confidence',
    limit: (v: string) => `limit ${v}`,
    computedLocally: 'computed locally',
    modelLoading: 'model still loading',
    loadingModelTitle: 'One moment',
    loadingModel: 'Loading the detection model — 17 MB, only the first time. After that it lives in your browser.',
    modelFailed: 'The local model could not be loaded.',
    noReadingYet: 'No reading yet',
    noReadingYetHint: 'Once the camera runs, one arrives every few seconds.',

    verdictTitle: { good: 'You are sitting straight', borderline: 'Starting to tip', bad: 'You are sitting crooked' },
    advice: {
        nobody: 'Nobody in the picture.',
        noShoulders: 'Your shoulders are not in the picture.',
        level: 'Your shoulders are level.',
        leanLeft: 'Your shoulder line is dropping to the left — straighten up sideways.',
        leanRight: 'Your shoulder line is dropping to the right — straighten up sideways.',
        leanSide: 'Your shoulder line is dropping to one side — straighten up sideways.',
        headTilt: 'Your head is tilted sideways — the screen may not be centred.',
        headTiltPlain: 'Your head is tilted.',
        forward: 'Your head is out in front of your shoulders — tuck your chin and bring the back of your head back.',
    },
    verdictLabel: { good: 'straight', borderline: 'borderline', bad: 'crooked' },
    sideLabel: { left: 'to the left', right: 'to the right', none: 'straight' },

    todayTitle: 'Today',
    todaySubtitle: 'Every reading since midnight, here on this device.',
    todayEmpty: 'Nothing measured today yet',
    todayEmptyHint: 'The history fills up once the camera runs.',
    satWell: 'Sat well',
    ofReadings: (good: number, total: number) => `${good} of ${total} readings`,
    longestRun: 'Longest good run',
    longestRunHint: 'with no bad reading and no break in between',
    signals: 'Signals',
    signalsHint: 'one per crooked reading',
    lastSixty: 'The last 60 readings',
    lastSixtyHint: 'Green straight, yellow tipping, red crooked. Oldest on the left.',
    shareToday: 'Share of straight readings today',
    showAll: 'Show all readings',
    colTime: 'Time',
    colVerdict: 'Verdict',
    colForward: 'Front',
    colLean: 'Side',
    colHead: 'Head',
    colAdvice: 'Note',

    trendTitle: 'Trend across the days',
    trendSubtitleEmpty: 'Whether anything is changing only shows over weeks.',
    trendDays: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} with enough readings.`,
    trendEmpty: 'No day with enough readings yet',
    trendEmptyHint: 'A day shows up here from about twenty readings on. The daily figures are kept even though the individual readings are cleared after two days.',
    lastStraight: 'Straight, latest day',
    bestDay: 'Best day',
    lastSevenDays: 'Last 7 days',
    points: (n: number) => `${n > 0 ? '+' : ''}${n} pts`,
    needsTwoWeeks: 'needs two weeks',
    betterThanBefore: 'better than the week before',
    worseThanBefore: 'worse than the week before',
    unchanged: 'unchanged',
    shareStraight: 'Share of time sitting straight',
    seriesStraight: 'straight',
    averageDeviation: 'Average deviation',
    lessIsBetter: 'Less is better here. If a line rises while the share above stays flat, you are tipping close to the limit more often — that is the early warning.',

    settingsTitle: 'Settings',
    settingsSubtitle: 'They stay in this browser.',

    paceAndLimits: 'Pace and limits',
    onePictureEvery: 'One picture every',
    oneSecond: 'second',
    nSeconds: (n: number) => `${n} seconds`,
    signalFromForward: 'Signal from head in front',
    signalFromForwardHint: 'degrees off vertical, ear against shoulder',
    signalFromLean: 'Signal from side lean',
    signalFromLeanHint: 'degrees, shoulder line against the horizontal',
    signalFromHead: 'Signal from head tilt',
    signalFromHeadHint: 'degrees, head against the shoulder line',
    soundOnSignal: 'Sound on signal',
    alsoNotify: 'Also show a notification',
    paceNote: 'One second a picture is only affordable because the computing happens here — no request goes out and nothing is billed. If a reading takes longer than the interval, the next tick is skipped rather than queued.',
    thresholdNote: 'The three limits are set tolerances, not clinical norms — for what a front-facing camera can measure, there are none. If it beeps too often, raise the limit; that is the only right way to tune them.',

    whichSound: 'Which sound',
    soundLabel: 'Signal sound',
    soundHint: 'Ships with the page, nothing is downloaded.',
    listen: 'Listen',
    soundNote: 'The sound plays on every single crooked reading — at the default pace that is once a second until you sit up. It starts quiet and grows while you stay crooked; one good reading puts it back to quiet. If the last one is still running, the new one layers over it rather than cutting it off.',
    soundName: {
        furz: 'Fart', raeuspern: 'Ahem', schrei: 'Scream',
        knacken: 'Knuckle crack', rimshot: 'Rimshot',
    },

    leavesTitle: 'What leaves this device',
    leavesText: 'Nothing. The model sits here after the first load, every picture is read here and discarded immediately, and only the numbers are stored — in this browser, not on a server and not in the repo. No picture, no video, no audio, no request going out, and no key for you to look after.',

    howItWorks: 'How this works',
    inShort: 'In short',
    saveReadings: 'Export readings',
    saved: 'Exported',
    clearHistory: 'Clear history',
    historyCleared: 'History cleared',
    clearHistoryBody: 'Every individual reading on this device will be deleted — this cannot be undone. The daily figures in the trend are kept.',
    loading: 'One moment …',
    noStorageTitle: 'This page cannot store anything',
    noStorageText: 'A private window has no database. Open it in a normal window and the history is kept.',
    notifyBlocked: 'The browser does not allow notifications.',
    notifyTitle: 'You are sitting crooked',

    camBlocked: 'The camera is blocked. Allow it for this page in the browser and start again.',
    camNotFound: 'No camera found.',
    camBusy: 'The camera is in use by another program.',
    camOther: (m: string) => `The camera will not open: ${m}`,

    minutesShort: (n: number) => `${n} min`,
    hoursAndMinutes: (h: number, m: number) => `${h} h ${m} min`,
};

const COPY: Record<Lang, Copy> = { de, en, es, fr, it, pt, nl, pl, tr, ru, zh, ja };

export function copyFor(lang: Lang | undefined): Copy {
    return COPY[lang as Lang] || COPY.de;
}

/**
 * What the language picker offers, each named in its own language — someone
 * looking for Polish should not have to find „Polnisch" first.
 */
export const LANGUAGES: { value: Lang; label: string }[] = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'nl', label: 'Nederlands' },
    { value: 'pl', label: 'Polski' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' },
];

/** Dates and clocks follow the page, not the browser. */
const LOCALE: Record<Lang, string> = {
    de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT',
    nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP',
};

export function localeFor(lang: Lang | undefined): string {
    return LOCALE[lang as Lang] || LOCALE.de;
}

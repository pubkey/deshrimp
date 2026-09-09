/**
 * Sitzhaltung — the page that watches him sit.
 *
 * Every second it takes one frame from the webcam, has a pose model in this
 * browser read the angles off it, and makes a noise when he is bent too far.
 * That is the whole loop; everything below is that loop plus the honesty around
 * it.
 *
 * Three things are worth knowing before changing anything here:
 *
 * 1. **The loop lives in one effect keyed on `running`, and reads its settings
 *    out of a ref.** Putting the interval or the thresholds in the dependency
 *    array would tear the interval down and rebuild it every time a setting
 *    changes, which resets the countdown mid-check. The ref is refreshed on
 *    every render, so a check always uses the current values without the effect
 *    ever restarting. A check that is still running when the next tick fires is
 *    skipped rather than queued — at one second apart that matters.
 * 2. **The model measures, the page judges.** `pose.ts` returns degrees only;
 *    the verdict is computed here against his own thresholds. That way the
 *    settings decide something real, and readings stay comparable across a
 *    change.
 * 3. **The preview is mirrored, the frame is not.** `scaleX(-1)` is CSS on the
 *    video, so `drawImage` still gets the raw camera frame — which is what the
 *    landmark sides in `pose.ts` are verified against.
 *
 * The code is English (`CLAUDE.md` §8). Every string a reader sees comes out of
 * `i18n.ts`, in German or English — he asked for the switch on 2026-09-08, and
 * the rule that follows from it is that **no visible string is written in this
 * file**. A literal here is a string that cannot be translated, so it is a bug
 * even when it happens to be German.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    Badge, Button, Callout, Checkbox, Col, ConfirmButton, Details, Empty,
    type Gap, Grid, IconButton, Input, LoadingOverlay, Muted, Page, Panel,
    preferredUiLang, Progress, Row, Section, Select,
    type Source, Stat, StatusStrip, type StatusTone, Table, Text,
    pageData, toast,
} from '@ui';
import {
    DatabaseGate, DataSyncButton, useCollection, useDatabase, useQuery,
} from '@db';
import {
    DEFAULTS, openDatabase, SETTINGS_ID,
    type Day, type Reading, type Settings, type SoundName, type Verdict,
} from './db';
import { LineChart, formatNumber, withUnit } from '@charts';
import { copyFor, localeFor, LANGUAGES, type Copy, type Lang } from './i18n';
import {
    analysePose, frameOf as canvasFrame, loadPose, poseReady,
    PoseError, preloadPose, type Analysis,
} from './pose';

/* ------------------------------------------------------------------ types */

type Written = {
    intro: string;
    steps: { title: string; text: string }[];
    sources: Source[];
    gaps: Gap[];
};

/** `data.json` carries the whole written answer once per language. */
type Data = Record<Lang, Written>;

/* ---------------------------------------------------------------- context */

/**
 * The page's language, handed down rather than re-read.
 *
 * It comes out of the settings document, so switching it is a normal write and
 * survives a reload. A context rather than a prop on every component: the copy
 * is needed at every depth, and threading it through would be forty props that
 * say the same thing.
 */
/**
 * What to show before anything is stored: **gespeicherte Wahl → Browsersprache
 * → Englisch** _(2026-09-08)_.
 *
 * Read once per load, because `navigator.languages` cannot change under a
 * running page and a value that flickers between renders would restart the
 * check loop for nothing.
 *
 * It is only ever the *fallback*. The moment a settings document exists — which
 * is the moment he changes anything at all, not just the language — that
 * document decides, and detection never speaks again. A page that will not stay
 * in the language you picked is worse than one that guessed wrong once.
 */
const DETECTED: Lang = preferredUiLang(LANGUAGES.map((l) => l.value)) as Lang;

/** The settings a device starts from, in the language its browser suggests. */
const INITIAL_SETTINGS: Settings = { ...DEFAULTS, lang: DETECTED };

const CopyContext = createContext<Copy>(copyFor(DETECTED));
const LangContext = createContext<Lang>('de');

const useCopy = () => useContext(CopyContext);
const useLang = () => useContext(LangContext);

/* -------------------------------------------------------------- constants */

/**
 * There is **no pause between signals**.
 *
 * There used to be one — at most one sound a minute, on the theory that a
 * signal firing constantly is one he switches off. He asked for it gone
 * _(2026-09-08: „do not limit how often it plays the sound. play it each time
 * the user sits wrong")_, so every crooked reading now makes a noise: at the
 * default cadence, once a second until he sits up.
 *
 * The first attempt at that still refused to restart a sound that had not
 * finished — reasoning that re-seeking a 3.3-second scream every second would
 * only ever play its first second. He said it again anyway _(„each single time
 * the check runs and detects wrong posture, it should play the sound, not only
 * once every minute")_, so that guard is gone too, and the way to honour both
 * halves is to **let the sounds overlap**: each play gets its own audio node,
 * so a new one starts while the last is still running instead of cutting it
 * off. Three overlapping screams is loud, and loud is the feature.
 */

/** Below this confidence a reading is recorded but never sets off the signal. */
const MIN_CONFIDENCE = 0.4;

/**
 * Readings older than this are dropped when the page opens.
 *
 * Two days, not two weeks: at a one-second cadence a working day is ~30 000
 * rows, and the only things that read the raw rows are today's strip and
 * today's table. Everything older is answered by the daily roll-up, which is a
 * few dozen bytes a day and is kept forever.
 */
const KEEP_DAYS = 2;

/** Width the frame is scaled to before it is read. */
const FRAME_WIDTH = 512;

/** Where `install_sounds.py` puts the recordings, next to `index.html`. */
const SOUND_DIR = 'snd';

/**
 * A gap longer than this breaks a run of good sitting.
 *
 * Frames with nobody in them are discarded rather than stored, which keeps the
 * statistics honest — but it also means standing up for an hour leaves a hole
 * rather than a bad reading, and „längste gute Strecke" would happily count the
 * lunch break as excellent posture _(he caught this on 2026-09-08)_. So the run
 * ends wherever the readings stop, whatever the reason: nobody in frame, camera
 * off, tab closed.
 *
 * The threshold has to scale with the cadence: at a fixed 30 s, a page set to
 * one picture every two minutes would score every ordinary reading as a hole
 * and no run could ever grow past zero. Three missed pictures is the break,
 * with a 30 s floor so the fast cadences do not trip over a single slow frame.
 */
const runGapMs = (intervalSec: number) => Math.max(30_000, intervalSec * 3_000);

/** The shortest interval the loop will honour, whatever the setting says. */
const MIN_INTERVAL = 1;

const INTERVALS = [1, 2, 5, 10, 15, 30, 60, 120];

/**
 * The order the sounds are offered in. The names themselves are in `i18n.ts`;
 * this list only fixes which one comes first — `furz` is the default and the
 * one he asked for by name.
 */
const SOUND_ORDER: SoundName[] = ['furz', 'raeuspern', 'schrei', 'knacken', 'rimshot'];

const VERDICT_TONE: Record<Verdict, StatusTone> = {
    good: 'ok', borderline: 'warn', bad: 'bad',
};

/* ---------------------------------------------------------------- helpers */

/** `YYYY-MM-DD` in local time — the day as he lived it, not as UTC saw it. */
function dayKey(t: number): string {
    const d = new Date(t);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function startOfDay(t: number): number {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function startOfToday(): number {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function clockTime(t: number, lang: Lang): string {
    return new Date(t).toLocaleTimeString(localeFor(lang), { hour: '2-digit', minute: '2-digit' });
}

function deg(value: number): string {
    return `${Math.round(value)}°`;
}

/**
 * The advice sentence for a stored reading.
 *
 * Readings hold an `AdviceKey`, so the wording follows the language even for a
 * reading recorded before he switched. Anything unrecognised is printed as it
 * stands — rows written before the keys existed hold a German sentence, and
 * showing it beats showing a blank cell for the two days they survive.
 */
function adviceText(advice: string | undefined, t: Copy): string {
    if (!advice) return '';
    const known = (t.advice as Record<string, string>)[advice];
    return known || advice;
}

function minutes(ms: number, t: Copy): string {
    const total = Math.round(ms / 60000);
    if (total < 60) return t.minutesShort(total);
    return t.hoursAndMinutes(Math.floor(total / 60), total % 60);
}

/** One frame off the video element, as base64 JPEG without the data-URL prefix. */
function frameOf(video: HTMLVideoElement | null): string | null {
    if (!video || !video.videoWidth) return null;
    const height = Math.round((video.videoHeight / video.videoWidth) * FRAME_WIDTH);
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, FRAME_WIDTH, height);
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1] || null;
}

/**
 * The verdict, from the degrees and his thresholds — not from the model.
 * `borderline` starts at 70 % of a threshold, which is early enough to correct
 * before the signal goes off.
 */
function judge(a: Analysis, s: Settings): Verdict {
    const ratio = Math.max(
        a.leanDeg / Math.max(1, s.maxLean),
        a.forwardDeg / Math.max(1, s.maxForward),
        a.headTiltDeg / Math.max(1, s.maxHeadTilt),
    );
    if (ratio >= 1) return 'bad';
    if (ratio >= 0.7) return 'borderline';
    return 'good';
}

function cameraErrorText(error: unknown, t: Copy): string {
    const name = (error as { name?: string })?.name || '';
    if (name === 'NotAllowedError') return t.camBlocked;
    if (name === 'NotFoundError' || name === 'OverconstrainedError') return t.camNotFound;
    if (name === 'NotReadableError') return t.camBusy;
    return t.camOther(String((error as Error)?.message || error));
}

/* ----------------------------------------------------------------- camera */

/**
 * Give the element the aspect ratio of the stream it is actually showing, so
 * the preview is the camera's own picture rather than a crop of it. The CSS
 * cannot do this on its own: it has to name *some* ratio up front, because a
 * `<video>` without a stream reports the 300×150 default and the box would
 * jump the moment the picture arrives.
 *
 * Called on the `loadedmetadata` and `resize` events — the first is where the
 * numbers land, the second is a camera changing mode mid-stream (rotation, a
 * resolution downgrade under load) — and once directly on start, for a stream
 * that is already decoded and fires neither.
 */
function fitToStream(video: HTMLVideoElement): void {
    if (!video.videoWidth || !video.videoHeight) return;
    video.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
}

function useCamera(t: Copy) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    // Read through a ref so `start` stays stable across a language change.
    const copyRef = useRef(t);
    copyRef.current = t;
    const [on, setOn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stop = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.style.aspectRatio = '';
        }
        setOn(false);
    }, []);

    const start = useCallback(async () => {
        setError(null);
        try {
            // Width only, no height: asking for both pins a shape, and a camera
            // that is natively 4:3 then hands back a cropped 16:9 rather than
            // its own picture. He wants the input format, uncut.
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, facingMode: 'user' },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                fitToStream(videoRef.current);
                await videoRef.current.play().catch(() => { /* autoplay quirks */ });
            }
            setOn(true);
            return true;
        } catch (failure) {
            setError(cameraErrorText(failure, copyRef.current));
            setOn(false);
            return false;
        }
    }, []);

    // Registered once, not per start: `start` can run many times on the same
    // element, and a listener added there would stack up a copy each time.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const apply = () => fitToStream(video);
        video.addEventListener('loadedmetadata', apply);
        video.addEventListener('resize', apply);
        return () => {
            video.removeEventListener('loadedmetadata', apply);
            video.removeEventListener('resize', apply);
        };
    }, []);

    useEffect(() => stop, [stop]);

    return { videoRef, on, error, start, stop };
}

/* ----------------------------------------------------------------- signal */

/**
 * The signal: a real recording, with a synthesised stand-in behind it.
 *
 * The first version made every sound out of oscillators, and he was blunt about
 * the result _(2026-09-08: „the sound files are bad. can you download real
 * sounds from somewhere")_. A sawtooth with a wobbling filter is recognisably a
 * sawtooth with a wobbling filter; it is not a fart, and the whole point of the
 * sound is that it registers as a thing rather than as a device noise.
 *
 * So the four sounds are real recordings — the ones he sent — living in the
 * skill's `sounds/` folder and copied into `snd/` next to `index.html` by
 * `install_sounds.py`. Same-origin, no CDN at view time, cached by the service
 * worker.
 *
 * **The oscillators stayed as the fallback.** If a file is missing or the
 * browser refuses to decode it, `play()` synthesises instead. A posture watcher
 * whose signal is silent is not a posture watcher, and „the mp3 404ed" is not a
 * reason he should ever have to care about.
 *
 * `prepare()` must run inside the click that starts the run: a browser only
 * lets an AudioContext out of `suspended` — and only lets an `<audio>` play —
 * from a real gesture, and a signal that stays silent until the second time is
 * worse than no signal.
 */

/** What `install_sounds.py` puts into `snd/`. */
const SOUND_FILE: Record<SoundName, string> = {
    furz: 'furz.mp3',
    raeuspern: 'raeuspern.mp3',
    schrei: 'schrei.mp3',
    knacken: 'knacken.mp3',
    rimshot: 'rimshot.mp3',
};

/**
 * How loud each file is played at full strength, evened out by ear against the
 * others. The scream is the loudest recording of the four and the one he is
 * least likely to want at full volume behind him in a coworking space.
 */
const SOUND_GAIN: Record<SoundName, number> = {
    furz: 1, raeuspern: 1, schrei: 0.6, knacken: 1, rimshot: 0.8,
};

/**
 * The signal starts quiet and grows while the bad posture holds _(2026-09-08:
 * „the sound should start quiet and get louder if the posture is bad for times
 * in a row")_.
 *
 * This is the answer to the thing the removed one-per-minute pause was trying
 * to solve. Firing every second at full volume is a signal he turns off; firing
 * every second starting at a quarter of full and reaching it over
 * `LOUD_AFTER` readings is a nudge that only becomes a demand if he ignores it.
 * A single reading that is not bad resets it, so sitting up is immediately
 * rewarded rather than credited a few seconds later.
 *
 * Four readings, on his call _(2026-09-08: „mach nur 4 messungen bis voller
 * lautstärke")_ — at the default cadence that is full volume after four
 * seconds. Eight was too patient to be a nudge.
 */
const QUIET_START = 0.25;
const LOUD_AFTER = 4;

/**
 * The tab icon says how you are sitting, without the tab being open.
 *
 * He asked for it _(2026-09-08: „the favicon of the url should change on bad
 * posture to something red and go back to green on good posture")_, and it is
 * the one channel that still works when the page is behind whatever he is
 * actually doing — which, since the recommendation is to leave it open in its
 * own tab, is most of the time.
 *
 * A plain disc rather than a tinted shrimp: at 16 px an emoji is mush and a
 * colour is not, and the whole point is to be readable out of the corner of an
 * eye. Drawn as an inline SVG data URI, so it costs no file and no request.
 */
const FAVICON_COLOUR: Record<Verdict, string> = {
    good: '#2e9e5b',
    borderline: '#d99b2b',
    bad: '#d64545',
};

function faviconFor(colour: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">`
        + `<circle cx="16" cy="16" r="14" fill="${colour}"/>`
        + `<circle cx="16" cy="16" r="14" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`
        + `</svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/**
 * Swap the tab icon, remembering the one the page shipped with so stopping can
 * put it back. `build_page.py` writes the shrimp; this only borrows it.
 */
function useVerdictFavicon(verdict: Verdict | null) {
    const original = useRef<string | null>(null);

    useEffect(() => {
        const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
        if (!link) return;
        if (original.current === null) original.current = link.href;
        link.href = verdict ? faviconFor(FAVICON_COLOUR[verdict]) : original.current;
    }, [verdict]);

    // Put the shrimp back when the page goes away, so a bookmark or a restored
    // tab does not keep a stale red dot.
    useEffect(() => () => {
        const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
        if (link && original.current) link.href = original.current;
    }, []);
}

/** 0 → the first bad reading in a run, 1 → `LOUD_AFTER` of them. */
function loudness(run: number): number {
    const t = Math.min(1, Math.max(0, (run - 1) / (LOUD_AFTER - 1)));
    return QUIET_START + (1 - QUIET_START) * t;
}

function useBeep() {
    const ctxRef = useRef<AudioContext | null>(null);
    const players = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});

    const prepare = useCallback(() => {
        if (ctxRef.current) {
            void ctxRef.current.resume().catch(() => { /* already running */ });
        } else {
            const Ctor = window.AudioContext
                || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (Ctor) ctxRef.current = new Ctor();
        }

        // Build the elements inside the gesture too. Created later, iOS treats
        // the first play() as un-gestured and stays quiet.
        (Object.keys(SOUND_FILE) as SoundName[]).forEach((name) => {
            if (players.current[name]) return;
            const el = new Audio(SOUND_DIR + '/' + SOUND_FILE[name]);
            el.preload = 'auto';
            el.volume = SOUND_GAIN[name];
            players.current[name] = el;
        });
    }, []);

    /** A short burst of white noise — the raw material for anything breathy. */
    const noiseBuffer = useRef<AudioBuffer | null>(null);
    const noise = (ctx: AudioContext): AudioBufferSourceNode => {
        if (!noiseBuffer.current) {
            const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            noiseBuffer.current = buf;
        }
        const src = ctx.createBufferSource();
        src.buffer = noiseBuffer.current;
        src.loop = true;
        return src;
    };

    /**
     * The stand-in, for when a recording will not play.
     *
     * Four distinct shapes rather than one generic blip: if a file is ever
     * unavailable the page should still tell him *which* alarm went off. None
     * of them impersonates the recording — the fallback's job is to be heard.
     */
    const synth = useCallback((name: SoundName, level = 1) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        void ctx.resume().catch(() => { /* nothing to resume */ });
        const t = ctx.currentTime;
        const out = ctx.destination;

        /** Fade a gain in and out so nothing clicks at the edges. */
        const envelope = (peak: number, start: number, attack: number, end: number) => {
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, t + start);
            g.gain.exponentialRampToValueAtTime(
                Math.max(0.001, peak * level), t + start + attack,
            );
            g.gain.exponentialRampToValueAtTime(0.0001, t + end);
            return g;
        };

        if (name === 'furz') {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, t);
            osc.frequency.exponentialRampToValueAtTime(58, t + 0.42);
            const wobble = ctx.createOscillator();
            wobble.type = 'square';
            wobble.frequency.value = 22;
            const depth = ctx.createGain();
            depth.gain.value = 34;
            wobble.connect(depth); depth.connect(osc.frequency);
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.value = 900;
            const g = envelope(0.5, 0, 0.02, 0.45);
            osc.connect(lp); lp.connect(g); g.connect(out);
            wobble.start(t); osc.start(t);
            wobble.stop(t + 0.48); osc.stop(t + 0.48);
            return;
        }

        if (name === 'schrei') {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(420, t);
            osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
            osc.frequency.exponentialRampToValueAtTime(300, t + 0.6);
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 1.2;
            const g = envelope(0.3, 0, 0.03, 0.62);
            osc.connect(bp); bp.connect(g); g.connect(out);
            osc.start(t); osc.stop(t + 0.65);
            return;
        }

        if (name === 'raeuspern') {
            [0, 0.2].forEach((offset, i) => {
                const src = noise(ctx);
                const bp = ctx.createBiquadFilter();
                bp.type = 'bandpass';
                bp.frequency.value = i ? 300 : 380;
                bp.Q.value = 3.5;
                const g = envelope(0.5, offset, 0.02, offset + 0.13);
                src.connect(bp); bp.connect(g); g.connect(out);
                src.start(t + offset); src.stop(t + offset + 0.15);
            });
            return;
        }

        if (name === 'knacken') {
            // Two very short filtered noise bursts — a crack is an attack with
            // almost no tail.
            [0, 0.09].forEach((offset, i) => {
                const src = noise(ctx);
                const bp = ctx.createBiquadFilter();
                bp.type = 'bandpass';
                bp.frequency.value = i ? 2600 : 1800;
                bp.Q.value = 6;
                const g = envelope(0.45, offset, 0.002, offset + 0.04);
                src.connect(bp); bp.connect(g); g.connect(out);
                src.start(t + offset); src.stop(t + offset + 0.05);
            });
            return;
        }

        // rimshot — two drum hits and a cymbal wash.
        [0, 0.14].forEach((offset) => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, t + offset);
            osc.frequency.exponentialRampToValueAtTime(90, t + offset + 0.1);
            const g = envelope(0.35, offset, 0.005, offset + 0.11);
            osc.connect(g); g.connect(out);
            osc.start(t + offset); osc.stop(t + offset + 0.12);
        });
        const crash = noise(ctx);
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 5000;
        const cg = envelope(0.25, 0.3, 0.01, 0.75);
        crash.connect(hp); hp.connect(cg); cg.connect(out);
        crash.start(t + 0.3); crash.stop(t + 0.78);
    }, []);

    const play = useCallback((name: SoundName, level = 1) => {
        const template = players.current[name];
        if (!template) { synth(name, level); return; }

        // A fresh node per play, so a second alarm layers over the first
        // instead of restarting it. The preloaded template is never played
        // itself — it exists so the clone starts from cache rather than from
        // the network.
        const node = template.cloneNode(true) as HTMLAudioElement;
        node.volume = Math.min(1, Math.max(0.01, SOUND_GAIN[name] * level));
        node.addEventListener('ended', () => { node.src = ''; });
        const started = node.play();
        if (started && typeof started.catch === 'function') {
            started.catch(() => synth(name, level));
        }
    }, [synth]);

    return { prepare, play };
}

/** Keeps the screen awake while a check is running. Absent on most desktops. */
function useWakeLock() {
    const lockRef = useRef<{ release?: () => Promise<void> } | null>(null);

    const acquire = useCallback(async () => {
        try {
            const api = (navigator as unknown as {
                wakeLock?: { request: (t: string) => Promise<{ release?: () => Promise<void> }> };
            }).wakeLock;
            if (api) lockRef.current = await api.request('screen');
        } catch { /* denied or unsupported — the page works without it */ }
    }, []);

    const release = useCallback(() => {
        void lockRef.current?.release?.().catch(() => { /* already gone */ });
        lockRef.current = null;
    }, []);

    const held = useCallback(() => !!lockRef.current, []);

    return { acquire, release, held };
}

/* ------------------------------------------------------------------- live */

function Live() {
    const t = useCopy();
    const lang = useLang();
    const camera = useCamera(t);
    const beep = useBeep();
    const wake = useWakeLock();

    const [running, setRunning] = useState(false);
    const [checking, setChecking] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [apiError, setApiError] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);
    const [flash, setFlash] = useState(false);
    /**
     * Whether the 17 MB model is still coming down.
     *
     * Driven by the promise `preloadPose()` returns, not by polling
     * `poseLoading()`. The polling version looked equivalent and was not: a
     * first attempt that fails fast clears the module flag, so the overlay
     * vanished after half a second while a retry was still loading.
     */
    const [loadingModel, setLoadingModel] = useState(false);

    const { data: storedSettings } = useQuery<Settings>('settings', {
        selector: { id: SETTINGS_ID },
    });
    // Not DEFAULTS: writing any setting on a fresh device must persist the
    // detected language, not silently pin it to German.
    const settings: Settings = storedSettings[0] || INITIAL_SETTINGS;
    const { upsert: writeSettings } = useCollection<Settings>('settings');

    const since = useMemo(startOfToday, []);
    const { data: today } = useQuery<Reading>('readings', {
        selector: { t: { $gte: since } },
        sort: [{ t: 'asc' }],
    });
    const { insert: writeReading, collection: readings } = useCollection<Reading>('readings');

    const { collection: days, upsert: writeDay } = useCollection<Day>('days');

    /**
     * Fold one reading into its day.
     *
     * The raw rows are pruned after two days; these survive, which is the only
     * reason „bin ich besser geworden" can be answered at all. Sums are kept
     * rather than averages so a reading is one read-modify-write, not a rescan
     * of thirty thousand rows.
     */
    const rollUp = useCallback(async (
        when: number, verdict: Verdict, alarm: boolean, a: Analysis,
    ) => {
        if (!days) return;
        const dayId = dayKey(when);
        const existing = await days.findOne(dayId).exec().catch(() => null);
        const before: Day = existing?.toJSON?.() ?? {
            id: dayId, t: startOfDay(when),
            count: 0, good: 0, borderline: 0, bad: 0, alarms: 0,
            leanSum: 0, forwardSum: 0, headTiltSum: 0,
        };
        await writeDay({
            ...before,
            count: before.count + 1,
            good: before.good + (verdict === 'good' ? 1 : 0),
            borderline: before.borderline + (verdict === 'borderline' ? 1 : 0),
            bad: before.bad + (verdict === 'bad' ? 1 : 0),
            alarms: before.alarms + (alarm ? 1 : 0),
            leanSum: before.leanSum + a.leanDeg,
            forwardSum: before.forwardSum + a.forwardDeg,
            headTiltSum: before.headTiltSum + a.headTiltDeg,
        });
    }, [days, writeDay]);

    const last = today.length ? today[today.length - 1] : null;

    /* Everything the loop needs, refreshed every render so the interval never
       has to be rebuilt. */
    const live = useRef({ settings, camera, beep, writeReading, rollUp, t });
    live.current = { settings, camera, beep, writeReading, rollUp, t };

    const runningRef = useRef(false);
    const busy = useRef(false);
    /** How many bad readings in a row — the signal grows along it. */
    const badRun = useRef(0);

    /* ---------------------------------------------------------- one check */

    const check = useCallback(async () => {
        if (busy.current) return;
        busy.current = true;
        setChecking(true);
        const { settings: s, t: copy } = live.current;
        try {
            const video = live.current.camera.videoRef.current;
            if (!video) throw new Error(copy.noFrameYet);

            const canvas = canvasFrame(video);
            if (!canvas) throw new Error(copy.noFrameYet);
            const result = await analysePose(canvas, {
                maxLean: s.maxLean,
                maxForward: s.maxForward,
                maxHeadTilt: s.maxHeadTilt,
            });
            setApiError(null);

            if (!result.personDetected) {
                setNote(copy.nobodyThere);
                return;
            }

            const verdict = judge(result, s);
            const now = Date.now();
            const trustworthy = result.confidence >= MIN_CONFIDENCE;
            const alarm = verdict === 'bad' && trustworthy;

            // One reading that is not bad ends the run, so sitting up quiets the
            // signal on the very next check rather than a few seconds later.
            badRun.current = alarm ? badRun.current + 1 : 0;

            setNote(trustworthy ? null : copy.lowConfidence);

            await live.current.writeReading({
                id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
                t: now,
                lean: result.leanDeg,
                leanSide: result.leanSide,
                forward: result.forwardDeg,
                headTilt: result.headTiltDeg,
                confidence: result.confidence,
                advice: result.advice,
                verdict,
                alarm,
            });

            await live.current.rollUp(now, verdict, alarm, result);

            if (alarm) {
                setFlash(true);
                window.setTimeout(() => setFlash(false), 4000);
                if (s.sound) live.current.beep.play(s.soundName, loudness(badRun.current));
                if (s.notify && 'Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification(copy.notifyTitle, {
                            body: copy.advice[result.advice], tag: 'haltung',
                        });
                    } catch { /* some browsers only allow this from a worker */ }
                }
            }
        } catch (failure) {
            const detail = (failure as Error)?.message || '';
            setApiError(failure instanceof PoseError
                ? copy.modelFailed + (detail ? ` (${detail})` : '')
                : detail || String(failure));
        } finally {
            busy.current = false;
            setChecking(false);
        }
    }, []);

    /* ----------------------------------------------------------- the loop */

    useEffect(() => {
        runningRef.current = running;
        if (!running) return;
        let left = 0;                       // the first check runs immediately
        setSecondsLeft(0);
        const id = window.setInterval(() => {
            if (!runningRef.current || busy.current) return;
            if (left > 0) {
                left -= 1;
                setSecondsLeft(left);
                return;
            }
            left = Math.max(MIN_INTERVAL, live.current.settings.intervalSec);
            setSecondsLeft(left);
            void check();
        }, 1000);
        return () => window.clearInterval(id);
    }, [running, check]);

    /* The screen lock is dropped when the tab goes away; take it back. */
    useEffect(() => {
        if (!running) return;
        const regain = () => {
            if (document.visibilityState === 'visible' && !wake.held()) void wake.acquire();
        };
        document.addEventListener('visibilitychange', regain);
        return () => document.removeEventListener('visibilitychange', regain);
    }, [running, wake]);

    /* Housekeeping: two days of raw readings are plenty; the day rows stay. */
    useEffect(() => {
        if (!readings) return;
        const limit = Date.now() - KEEP_DAYS * 86_400_000;
        void readings.find({ selector: { t: { $lt: limit } } }).remove()
            .catch(() => { /* nothing to clean up */ });
    }, [readings]);

    /* ---------------------------------------------------------- actions */

    const start = async () => {
        beep.prepare();                     // must happen inside the click
        // Before the camera, so the overlay appears on the click rather than
        // after the browser has finished negotiating a video stream.
        if (!poseReady()) {
            setLoadingModel(true);
            void preloadPose().then(() => setLoadingModel(false));
        }
        const opened = await camera.start();
        if (!opened) return;
        await wake.acquire();
        setApiError(null);
        setRunning(true);
    };

    const stop = () => {
        setRunning(false);
        runningRef.current = false;
        camera.stop();
        wake.release();
        setSecondsLeft(0);
    };

    const change = (patch: Partial<Settings>) =>
        writeSettings({ ...settings, ...patch, id: SETTINGS_ID });

    /* --------------------------------------------------------- rendering */

    const verdict: Verdict | null = last && running ? last.verdict : null;
    const interval = Math.max(MIN_INTERVAL, settings.intervalSec);
    useVerdictFavicon(verdict);

    return (
        <>
            {/* The first load blocks everything below it — no measurement can
                happen without the model — so it gets an overlay rather than an
                inline spinner tucked between the controls. */}
            <LoadingOverlay
                open={loadingModel}
                title={t.loadingModelTitle}
                label={t.loadingModel}
            />

            {/* No heading over the live block _(2026-09-09: „remove these texts
                we do not need them: ‚Right now / One picture every second'")_.
                The camera, the verdict and the three numbers are the first
                thing on the page and need nobody to announce them; the cadence
                is a setting, and it is stated where it is set. */}
            <Section>
                <Callout icon="🦐" title={t.whatThisDoes}>{t.leaveOpen}</Callout>
                <Col gap={4}>
                    {verdict ? (
                        <Callout
                            tone={verdict === 'good' ? undefined : verdict === 'bad' ? 'bad' : 'warn'}
                            icon={verdict === 'good' ? '✅' : verdict === 'bad' ? '⚠️' : '👀'}
                            title={t.verdictTitle[verdict]}
                            className={flash ? 'haltung-alarm' : undefined}
                        >
                            {adviceText(last?.advice, t)}
                        </Callout>
                    ) : null}

                    <div className={`haltung-kamera${flash ? ' haltung-alarm' : ''}`}>
                        <video ref={camera.videoRef} muted playsInline autoPlay />
                        {!camera.on ? (
                            <div className="haltung-kamera-aus">{t.cameraOff}</div>
                        ) : null}
                    </div>

                    <Row gap={3} wrap justify="between" align="bottom">
                        <Row gap={2} wrap>
                            {running
                                ? <Button variant="danger" icon="⏹" onClick={stop}>{t.stop}</Button>
                                : <Button variant="primary" icon="▶" onClick={start}>{t.start}</Button>}
                            <Button icon="⟳" onClick={() => void check()}
                                disabled={!camera.on || checking}>
                                {t.checkNow}
                            </Button>
                        </Row>
                        <Muted>
                            {checking ? t.checking
                                : running ? t.nextIn(secondsLeft)
                                    : last ? t.lastAt(clockTime(last.t, lang)) : ''}
                        </Muted>
                    </Row>

                    {running ? (
                        <Progress
                            value={(interval - secondsLeft) / interval}
                            tone={verdict === 'bad' ? undefined : 'ok'}
                            label={t.untilNext}
                            valueLabel={checking ? t.now : t.seconds(secondsLeft)}
                        />
                    ) : null}

                    {camera.error ? <Callout tone="bad" title={t.cameraTitle}>{camera.error}</Callout> : null}
                    {apiError ? (
                        <Callout tone="bad" title={t.analysisFailed}>
                            {apiError}
                        </Callout>
                    ) : null}
                    {note ? <Muted>{note}</Muted> : null}

                    {last ? (
                        <Grid min={160}>
                            <Stat label={t.statForward} value={deg(last.forward)}
                                hint={t.limit(deg(settings.maxForward))} />
                            <Stat label={t.statLean} value={deg(last.lean)}
                                hint={`${t.sideLabel[last.leanSide]} · ${t.limit(deg(settings.maxLean))}`} />
                            <Stat label={t.statHeadTilt} value={deg(last.headTilt)}
                                hint={t.limit(deg(settings.maxHeadTilt))} />
                            <Stat label={t.statConfidence} value={`${Math.round(last.confidence * 100)} %`}
                                hint={poseReady() ? t.computedLocally : t.modelLoading} />
                        </Grid>
                    ) : (
                        <Empty title={t.noReadingYet} hint={t.noReadingYetHint} />
                    )}
                </Col>
            </Section>

            <Recent readings={today} windowMin={settings.windowMin}
                change={change} />

            <History readings={today} intervalSec={settings.intervalSec} />

            <Trend />

            <Setup
                settings={settings}
                change={change}
                prepareSound={beep.prepare}
                playSound={beep.play}
            />
        </>
    );
}

/* ----------------------------------------------------------------- recent */

/** The windows the live curve offers, in minutes. */
const WINDOWS = [5, 15, 30, 60, 120];

/** One point per minute is enough to see a slump and cheap to draw. */
const BUCKET_MS = 60_000;

/**
 * „How is this afternoon going" — a moving average over the last N minutes.
 *
 * He asked for it _(2026-09-08: „a chart should show a moving average over the
 * last x minutes (default 30 minutes)")_, and it answers a different question
 * from the day chart below it. That one is about weeks and can only be read
 * afterwards; this one is about the hour he is sitting in, which is the one he
 * can still do something about.
 *
 * Readings are folded into one-minute buckets and then smoothed across three
 * of them. Raw per-second points would draw the camera's noise rather than his
 * posture — the depth axis wobbles by a degree or two between frames — and the
 * whole reason to average is that the single reading is the soft part.
 */
function Recent({ readings, windowMin, change }: {
    readings: Reading[];
    windowMin: number;
    change: (patch: Partial<Settings>) => Promise<unknown>;
}) {
    const t = useCopy();
    const lang = useLang();
    const minutes = WINDOWS.indexOf(windowMin) >= 0 ? windowMin : DEFAULTS.windowMin;

    const rows = useMemo(() => {
        const now = Date.now();
        const from = now - minutes * 60_000;
        const recent = readings.filter((r) => r.t >= from);
        if (!recent.length) return [];

        // Bucket by minute, then average within each bucket.
        const buckets = new Map<number, { n: number; f: number; l: number; h: number; good: number }>();
        for (const r of recent) {
            const key = Math.floor(r.t / BUCKET_MS) * BUCKET_MS;
            const b = buckets.get(key) || { n: 0, f: 0, l: 0, h: 0, good: 0 };
            b.n += 1;
            b.f += r.forward;
            b.l += r.lean;
            b.h += r.headTilt;
            b.good += r.verdict === 'good' ? 1 : 0;
            buckets.set(key, b);
        }
        const ordered = [...buckets.entries()].sort((a, b) => a[0] - b[0]);

        // A three-bucket moving average over what is there. Gaps are simply
        // absent minutes; nothing is invented to fill them.
        return ordered.map(([at], i) => {
            const window = ordered.slice(Math.max(0, i - 2), i + 1);
            const n = window.reduce((a, [, b]) => a + b.n, 0) || 1;
            const sum = (pick: (b: { f: number; l: number; h: number; good: number }) => number) =>
                window.reduce((a, [, b]) => a + pick(b), 0);
            return {
                zeit: clockTime(at, lang),
                vorlage: Math.round((sum((b) => b.f) / n) * 10) / 10,
                seitlich: Math.round((sum((b) => b.l) / n) * 10) / 10,
                kopf: Math.round((sum((b) => b.h) / n) * 10) / 10,
                gerade: Math.round((sum((b) => b.good) / n) * 100),
            };
        });
    }, [readings, minutes, lang]);

    const picker = (
        <Select
            label={t.windowLabel}
            value={String(minutes)}
            onChange={(e: { target: { value: string } }) =>
                void change({ windowMin: Number(e.target.value) })}
        >
            {WINDOWS.map((m) => (
                <option key={m} value={m}>{t.lastMinutes(m)}</option>
            ))}
        </Select>
    );

    return (
        <Section title={t.recentTitle} subtitle={t.recentSubtitle(minutes)}>
            {picker}
            {rows.length < 2 ? (
                <Empty title={t.recentEmpty} hint={t.recentEmptyHint(minutes)} />
            ) : (
                <Col gap={4}>
                    <Panel title={t.recentAngles}>
                        <LineChart
                            data={rows}
                            x="zeit"
                            series={[
                                { key: 'vorlage', label: t.statForward },
                                { key: 'seitlich', label: t.statLean },
                                { key: 'kopf', label: t.statHeadTilt },
                            ]}
                            format={withUnit(formatNumber, '°')}
                            zero
                            height={220}
                        />
                        <Text small muted>{t.recentNote}</Text>
                    </Panel>

                    <Panel title={t.shareStraight}>
                        <LineChart
                            data={rows}
                            x="zeit"
                            series={[{ key: 'gerade', label: t.seriesStraight }]}
                            format={withUnit(formatNumber, '%')}
                            zero
                            legend={false}
                            height={180}
                        />
                    </Panel>
                </Col>
            )}
        </Section>
    );
}

/* ---------------------------------------------------------------- history */

/** A short day label — „Mo 8.9." — for the x axis. */
function dayLabel(t: number, lang: Lang): string {
    return new Date(t).toLocaleDateString(localeFor(lang), {
        weekday: 'short', day: 'numeric', month: 'numeric',
    });
}

/**
 * „Werde ich besser?" — the one question a single day cannot answer.
 *
 * Reads the daily roll-up, not the raw readings: those are pruned after two
 * weeks, and at ten seconds apart a month of them would be ~90 000 rows to
 * scan on every render.
 *
 * The headline is the share of readings judged upright, because that is the
 * number that survives a change of thresholds being *tightened* — the degrees
 * below it are the detail, and a rising line there is a warning rather than a
 * success. Days with almost nothing in them are dropped: three readings on a
 * day he opened the page and closed it again is noise drawn as a data point.
 */
function Trend() {
    const t = useCopy();
    const lang = useLang();
    const { data: days } = useQuery<Day>('days', { sort: [{ t: 'asc' }] });

    const rows = useMemo(() => (days || [])
        .filter((d) => d.count >= 20)
        .slice(-30)
        .map((d) => ({
            tag: dayLabel(d.t, lang),
            gerade: Math.round((d.good / d.count) * 100),
            vorlage: Math.round((d.forwardSum / d.count) * 10) / 10,
            seitlich: Math.round((d.leanSum / d.count) * 10) / 10,
            kopf: Math.round((d.headTiltSum / d.count) * 10) / 10,
        })), [days, lang]);

    /* Last seven days against the seven before them. A single day swings on
       one bad afternoon; a week is the shortest window that says anything. */
    const change = useMemo(() => {
        if (rows.length < 4) return null;
        const recent = rows.slice(-7);
        const earlier = rows.slice(-14, -7);
        if (!earlier.length) return null;
        const mean = (xs: typeof rows) => xs.reduce((a, r) => a + r.gerade, 0) / xs.length;
        return Math.round(mean(recent) - mean(earlier));
    }, [rows]);

    if (!rows.length) {
        return (
            <Section title={t.trendTitle} subtitle={t.trendSubtitleEmpty}>
                <Empty title={t.trendEmpty} hint={t.trendEmptyHint} />
            </Section>
        );
    }

    const best = rows.reduce((a, r) => (r.gerade > a.gerade ? r : a), rows[0]);

    return (
        <Section title={t.trendTitle} subtitle={t.trendDays(rows.length)}>
            <Col gap={4}>
                <Grid min={160}>
                    <Stat label={t.lastStraight}
                        value={`${rows[rows.length - 1].gerade} %`}
                        hint={rows[rows.length - 1].tag} />
                    <Stat label={t.bestDay} value={`${best.gerade} %`} hint={best.tag} />
                    <Stat
                        label={t.lastSevenDays}
                        value={change === null ? '—' : t.points(change)}
                        hint={change === null
                            ? t.needsTwoWeeks
                            : change > 0 ? t.betterThanBefore
                                : change < 0 ? t.worseThanBefore
                                    : t.unchanged} />
                </Grid>

                <Panel title={t.shareStraight}>
                    <LineChart
                        data={rows}
                        x="tag"
                        series={[{ key: 'gerade', label: t.seriesStraight }]}
                        format={withUnit(formatNumber, '%')}
                        zero
                        legend={false}
                        height={240}
                    />
                </Panel>

                <Panel title={t.averageDeviation}>
                    <LineChart
                        data={rows}
                        x="tag"
                        series={[
                            { key: 'vorlage', label: t.statForward },
                            { key: 'seitlich', label: t.statLean },
                            { key: 'kopf', label: t.statHeadTilt },
                        ]}
                        format={withUnit(formatNumber, '°')}
                        zero
                        height={240}
                    />
                    <Text small muted>{t.lessIsBetter}</Text>
                </Panel>
            </Col>
        </Section>
    );
}

function History({ readings, intervalSec }: { readings: Reading[]; intervalSec: number }) {
    const t = useCopy();
    const lang = useLang();
    const gap = runGapMs(intervalSec);
    const numbers = useMemo(() => {
        const total = readings.length;
        const good = readings.filter((r) => r.verdict === 'good').length;
        const signals = readings.filter((r) => r.alarm).length;

        // The longest unbroken run of good readings, in wall-clock time: from
        // the first good reading of a run to the last one before it breaks. A
        // bad reading breaks it, and so does a hole in the recording — see
        // runGapMs().
        let bestMs = 0;
        let runFrom: number | null = null;
        let previous: number | null = null;
        readings.forEach((r) => {
            const gapped = previous !== null && r.t - previous > gap;
            previous = r.t;
            if (r.verdict !== 'good' || gapped) {
                runFrom = r.verdict === 'good' ? r.t : null;
                return;
            }
            if (runFrom == null) runFrom = r.t;
            bestMs = Math.max(bestMs, r.t - runFrom);
        });

        return { total, good, signals, bestMs, share: total ? good / total : 0 };
    }, [readings, gap]);

    const bars = readings.slice(-60).map((r) => ({
        tone: VERDICT_TONE[r.verdict],
        title: `${clockTime(r.t, lang)} · ${t.verdictLabel[r.verdict]} · `
            + `${deg(r.forward)} ${t.colForward}, ${deg(r.lean)} ${t.colLean}`,
    }));

    const rows = readings.slice(-60).reverse();

    return (
        <Section title={t.todayTitle} subtitle={t.todaySubtitle}>
            {readings.length === 0 ? (
                <Empty title={t.todayEmpty} hint={t.todayEmptyHint} />
            ) : (
                <Col gap={4}>
                    <Grid min={160}>
                        <Stat label={t.satWell} value={`${Math.round(numbers.share * 100)} %`}
                            hint={t.ofReadings(numbers.good, numbers.total)} />
                        <Stat label={t.longestRun} value={minutes(numbers.bestMs, t)}
                            hint={t.longestRunHint} />
                        <Stat label={t.signals} value={String(numbers.signals)}
                            hint={t.signalsHint} />
                    </Grid>

                    <StatusStrip items={bars} label={t.lastSixty} hint={t.lastSixtyHint} />

                    <Progress value={numbers.share}
                        tone={numbers.share >= 0.8 ? 'ok' : numbers.share >= 0.5 ? 'warn' : undefined}
                        label={t.shareToday} />

                    <Details summary={t.showAll} count={rows.length}>
                        <Table
                            sortable={false}
                            dense
                            striped
                            columns={[
                                { key: 't', label: t.colTime, render: (r: Reading) => clockTime(r.t, lang) },
                                {
                                    key: 'verdict', label: t.colVerdict,
                                    render: (r: Reading) => (
                                        <Badge tone={VERDICT_TONE[r.verdict] === 'ok' ? 'ok'
                                            : VERDICT_TONE[r.verdict] === 'bad' ? 'bad' : 'warn'}>
                                            {t.verdictLabel[r.verdict]}
                                        </Badge>
                                    ),
                                },
                                { key: 'forward', label: t.colForward, align: 'num', render: (r: Reading) => deg(r.forward) },
                                {
                                    key: 'lean', label: t.colLean, align: 'num',
                                    render: (r: Reading) => (r.leanSide === 'none'
                                        ? deg(r.lean)
                                        : `${deg(r.lean)} ${r.leanSide === 'left' ? '←' : '→'}`),
                                },
                                { key: 'headTilt', label: t.colHead, align: 'num', render: (r: Reading) => deg(r.headTilt) },
                                { key: 'advice', label: t.colAdvice, render: (r: Reading) => adviceText(r.advice, t) },
                            ]}
                            rows={rows}
                        />
                    </Details>
                </Col>
            )}
        </Section>
    );
}

/* ------------------------------------------------------------------ setup */

type SetupProps = {
    settings: Settings;
    change: (patch: Partial<Settings>) => Promise<unknown>;
    /** So „Anhören" can make the same noise the signal makes. */
    prepareSound: () => void;
    playSound: (name: SoundName) => void;
};

function Setup(props: SetupProps) {
    const { settings: s, change } = props;
    const t = useCopy();

    const toggleNotify = async (on: boolean) => {
        if (on && 'Notification' in window && Notification.permission !== 'granted') {
            const answer = await Notification.requestPermission().catch(() => 'denied');
            if (answer !== 'granted') {
                toast(t.notifyBlocked);
                return;
            }
        }
        await change({ notify: on });
    };

    return (
        <Section title={t.settingsTitle} subtitle={t.settingsSubtitle}>
            <Col gap={4}>

                <Panel title={t.paceAndLimits}>
                    <Grid min={220}>
                        <Select
                            label={t.onePictureEvery}
                            value={String(s.intervalSec)}
                            onChange={(e: { target: { value: string } }) =>
                                change({ intervalSec: Number(e.target.value) })}
                        >
                            {INTERVALS.map((sec) => (
                                <option key={sec} value={sec}>
                                    {sec === 1 ? t.oneSecond : t.nSeconds(sec)}
                                </option>
                            ))}
                        </Select>
                        <Input
                            label={t.signalFromForward} type="number" min={5} max={45} step={1}
                            value={s.maxForward}
                            onChange={(e: { target: { value: string } }) =>
                                change({ maxForward: Number(e.target.value) || DEFAULTS.maxForward })}
                            hint={t.signalFromForwardHint}
                        />
                        <Input
                            label={t.signalFromLean} type="number" min={3} max={45} step={1}
                            value={s.maxLean}
                            onChange={(e: { target: { value: string } }) =>
                                change({ maxLean: Number(e.target.value) || DEFAULTS.maxLean })}
                            hint={t.signalFromLeanHint}
                        />
                        <Input
                            label={t.signalFromHead} type="number" min={3} max={45} step={1}
                            value={s.maxHeadTilt}
                            onChange={(e: { target: { value: string } }) =>
                                change({ maxHeadTilt: Number(e.target.value) || DEFAULTS.maxHeadTilt })}
                            hint={t.signalFromHeadHint}
                        />
                    </Grid>
                    <Row gap={4} wrap>
                        <Checkbox label={t.soundOnSignal} checked={s.sound}
                            onChange={(on) => void change({ sound: on })} />
                        <Checkbox label={t.alsoNotify} checked={s.notify}
                            onChange={(on) => void toggleNotify(on)} />
                    </Row>
                    <Text small muted>{t.paceNote}</Text>
                    <Text small muted>{t.thresholdNote}</Text>
                </Panel>

                <Panel title={t.whichSound}>
                    <Row gap={2} align="bottom" stack>
                        <Select
                            label={t.soundLabel}
                            value={s.soundName}
                            onChange={(e: { target: { value: string } }) =>
                                void change({ soundName: e.target.value as SoundName })}
                            hint={t.soundHint}
                        >
                            {SOUND_ORDER.map((key) => (
                                <option key={key} value={key}>{t.soundName[key]}</option>
                            ))}
                        </Select>
                        <Button icon="🔊" onClick={() => { props.prepareSound(); props.playSound(s.soundName); }}>
                            {t.listen}
                        </Button>
                    </Row>
                    <Text small muted>{t.soundNote}</Text>
                </Panel>

                <Callout icon="🔒" title={t.leavesTitle}>{t.leavesText}</Callout>
            </Col>
        </Section>
    );
}

/* ------------------------------------------------------------------- page */

/**
 * The page shell, and the one place the language is decided.
 *
 * It reads the settings document itself rather than taking the language from
 * `<Live>`: the title, the intro and the meta block all sit outside `<Live>`,
 * and they have to switch with everything else. `<Page lang>` carries it into
 * the frame components so „Zu dieser Seite" turns into „About this page" too.
 */
function Content() {
    const data = pageData<Data>();
    const database = useDatabase();
    const { collection: readings } = useCollection<Reading>('readings');

    const { data: storedSettings } = useQuery<Settings>('settings', {
        selector: { id: SETTINGS_ID },
    });
    const { upsert: writeSettings } = useCollection<Settings>('settings');
    const lang: Lang = storedSettings[0]?.lang || DETECTED;
    const t = copyFor(lang);
    const written = data[lang] || data.de;

    return (
        <LangContext.Provider value={lang}>
            <CopyContext.Provider value={t}>
                <Page
                    lang={lang}
                    languages={LANGUAGES.map((l) => l.value)}
                    onLangChange={(next) => void writeSettings({
                        ...(storedSettings[0] || INITIAL_SETTINGS),
                        lang: next,
                        id: SETTINGS_ID,
                    })}
                    title={t.title}
                    subtitle={
                        <>
                            <a href="https://rxdb.info/articles/local-first-future.html"
                                target="_blank" rel="noreferrer">Local-First</a>
                            {lang === 'de' ? '-' : ''}
                            {t.subtitleA}
                            <a href="https://rxdb.info/" target="_blank" rel="noreferrer">RxDB</a>
                            {t.subtitleB}
                        </>
                    }
                    gaps={written.gaps}
                    sources={written.sources}
                    actions={
                        <>
                            <DataSyncButton database={database} filename="sitzhaltung.json" />
                            <ConfirmButton
                                icon="🗑"
                                label={t.clearHistory}
                                body={t.clearHistoryBody}
                                onConfirm={async () => {
                                    if (!readings) return;
                                    await readings.find().remove();
                                    toast(t.historyCleared);
                                }}
                            />
                        </>
                    }
                >
                    {/* The live state first: this page is a tool, and what it is
                        for is what it currently says. The explanation sits below. */}
                    <Live />

                    <Section title={t.howItWorks}>
                        <Callout title={t.inShort}>{written.intro}</Callout>
                        <Grid min={240}>
                            {written.steps.map((step) => (
                                <Panel key={step.title} title={step.title} flat>
                                    <Text small>{step.text}</Text>
                                </Panel>
                            ))}
                        </Grid>
                    </Section>
                </Page>
            </CopyContext.Provider>
        </LangContext.Provider>
    );
}

/**
 * The gate's own strings cannot come from the settings — the database it is
 * waiting for is where the settings live. So it uses the detected language,
 * which for one loading line is close enough and is right far more often than
 * a hard-coded German would be.
 */
function App() {
    const t = copyFor(DETECTED);
    return (
        <DatabaseGate
            create={openDatabase}
            fallback={<Muted>{t.loading}</Muted>}
            errorTitle={t.noStorageTitle}
            errorText={t.noStorageText}
        >
            <Content />
        </DatabaseGate>
    );
}

export default App;

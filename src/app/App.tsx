/**
 * Sitzhaltung - the page that watches him sit.
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
 *    skipped rather than queued - at one second apart that matters.
 * 2. **The model measures, the page judges.** `pose.ts` returns degrees only;
 *    the verdict is computed here against his own thresholds. That way the
 *    settings decide something real, and readings stay comparable across a
 *    change.
 * 3. **The preview is mirrored, the frame is not.** `scaleX(-1)` is CSS on the
 *    video, so `drawImage` still gets the raw camera frame - which is what the
 *    landmark sides in `pose.ts` are verified against.
 *
 * The code is English (`CLAUDE.md` §8). Every string a reader sees comes out of
 * `i18n.ts`, in German or English - he asked for the switch on 2026-09-08, and
 * the rule that follows from it is that **no visible string is written in this
 * file**. A literal here is a string that cannot be translated, so it is a bug
 * even when it happens to be German.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
    Badge, Button, Callout, Checkbox, ConfirmButton, Empty,
    Grid, Icon, IconButton, LoadingOverlay, Muted, Page, Panel,
    preferredUiLang, Progress, Row, Segmented, Select, Slider,
    Stat, StatusStrip, type StatusTone, Table, Text, Tiles,
    pageData, toast,
} from '@ui';
import {
    DatabaseGate, DataSyncButton, useCollection, useDatabase, useQuery,
} from '@db';
import {
    DEFAULTS, openDatabase, SETTINGS_ID,
    type Day, type Reading, type Settings, type SoundName, type Verdict,
    type View,
} from './db';
import { LineChart, formatNumber, withUnit } from '@charts';
import { copyFor, localeFor, LANGUAGES, type Copy, type Lang } from './i18n';
import {
    analysePose, frameOf as canvasFrame, loadPose, onPoseProgress, poseProgress,
    poseReady, PoseError, preloadPose, type Analysis,
} from './pose';

/* ------------------------------------------------------------------ types */

type Written = {
    intro: string;
    steps: { title: string; text: string }[];
    /**
     * Not rendered by the app any more - „Zu dieser Seite" is gone. They are
     * still typed, and still in `data.json`, because `scripts/seo.mjs` reads
     * them straight out of the file at build time and writes them into the
     * prerendered HTML a crawler sees. Dropping them there would quietly take
     * the page's citations off the web.
     */
    sources: { id?: string; title?: string; url?: string; note?: string; checked?: string }[];
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
 * It is only ever the *fallback*. The moment a settings document exists - which
 * is the moment he changes anything at all, not just the language - that
 * document decides, and detection never speaks again. A page that will not stay
 * in the language you picked is worse than one that guessed wrong once.
 */
const DETECTED: Lang = preferredUiLang(LANGUAGES.map((l) => l.value)) as Lang;

/** The settings a device starts from, in the language its browser suggests. */
const INITIAL_SETTINGS: Settings = { ...DEFAULTS, lang: DETECTED };

const CopyContext = createContext<Copy>(copyFor(DETECTED));
const LangContext = createContext<Lang>('en');

const useCopy = () => useContext(CopyContext);
const useLang = () => useContext(LangContext);

/* -------------------------------------------------------------- constants */

/**
 * There is **no pause between signals**.
 *
 * There used to be one - at most one sound a minute, on the theory that a
 * signal firing constantly is one he switches off. He asked for it gone
 * _(2026-09-08: „do not limit how often it plays the sound. play it each time
 * the user sits wrong")_, so every crooked reading now makes a noise: at the
 * default cadence, once a second until he sits up.
 *
 * The first attempt at that still refused to restart a sound that had not
 * finished - reasoning that re-seeking a 3.3-second scream every second would
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

/** Where the bundled sound files live, next to `index.html`. */
const SOUND_DIR = 'snd';

/**
 * A gap longer than this breaks a run of good sitting.
 *
 * Frames with nobody in them are discarded rather than stored, which keeps the
 * statistics honest - but it also means standing up for an hour leaves a hole
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

/**
 * The corner radius of the countdown ring, in CSS pixels.
 *
 * It has to match the well's own 8px (`--radius-lg`) or the ring cuts its
 * corners inside the border it is drawn on. A number rather than the token
 * because `rx` is an SVG geometry attribute: `var()` in one is honoured by
 * Chromium and ignored by Safari, which would square the corners there.
 */
const RING_RADIUS = 8;

const INTERVALS = [1, 2, 5, 10, 15, 30, 60, 120];

/**
 * The order the sounds are offered in. The names themselves are in `i18n.ts`;
 * this list only fixes which one comes first - `fart` is the default and the
 * one he asked for by name.
 */
const SOUND_ORDER: SoundName[] = ['fart', 'ahem', 'scream', 'knuckles', 'whip', 'rimshot'];

const VERDICT_TONE: Record<Verdict, StatusTone> = {
    good: 'ok', borderline: 'warn', bad: 'bad',
};

/* ---------------------------------------------------------------- helpers */

/** `YYYY-MM-DD` in local time - the day as he lived it, not as UTC saw it. */
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
 * The class that turns one readout coral, or nothing.
 *
 * Severity in this design system is carried by *whether* the accent appears,
 * not by a range of colours - so there is no "nearly" tone to return here. A
 * value is inside its tolerance or it is a breach.
 */
function breach(value: number, limit: number): string | undefined {
    return value > limit ? 'breach' : undefined;
}

/**
 * The advice sentence for a stored reading.
 *
 * Readings hold an `AdviceKey`, so the wording follows the language even for a
 * reading recorded before he switched. Anything unrecognised is printed as it
 * stands - rows written before the keys existed hold a German sentence, and
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
 * The verdict, from the degrees and his thresholds - not from the model.
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
 * So the original five sounds are real recordings - the ones he sent - and the
 * whip crack sits next to them as a bundled file in `public/snd/`. Same-origin,
 * no CDN at view time, cached by the service worker.
 *
 * **The oscillators stayed as the fallback.** If a file is missing or the
 * browser refuses to decode it, `play()` synthesises instead. A posture watcher
 * whose signal is silent is not a posture watcher, and „the mp3 404ed" is not a
 * reason he should ever have to care about.
 *
 * `prepare()` must run inside the click that starts the run: a browser only
 * lets an AudioContext out of `suspended` - and only lets an `<audio>` play -
 * from a real gesture, and a signal that stays silent until the second time is
 * worse than no signal.
 */

/** The bundled sound files under `snd/`. */
const SOUND_FILE: Record<SoundName, string> = {
    fart: 'fart.mp3',
    ahem: 'ahem.mp3',
    scream: 'scream.mp3',
    knuckles: 'knuckles.mp3',
    whip: 'whip.wav',
    rimshot: 'rimshot.mp3',
};

/**
 * How loud each file is played at full strength, evened out by ear against the
 * others. The scream is the loudest recording in the set and the one he is
 * least likely to want at full volume behind him in a coworking space.
 */
const SOUND_GAIN: Record<SoundName, number> = {
    fart: 1, ahem: 1, scream: 0.6, knuckles: 1, whip: 0.9, rimshot: 0.8,
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
 * lautstärke")_ - at the default cadence that is full volume after four
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
 * actually doing - which, since the recommendation is to leave it open in its
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

    /** A short burst of white noise - the raw material for anything breathy. */
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
     * Six distinct shapes rather than one generic blip: if a file is ever
     * unavailable the page should still tell him *which* alarm went off. None
     * of them impersonates the recording - the fallback's job is to be heard.
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

        if (name === 'fart') {
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

        if (name === 'scream') {
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

        if (name === 'ahem') {
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

        if (name === 'knuckles') {
            // Two very short filtered noise bursts - a crack is an attack with
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

        if (name === 'whip') {
            const snap = noise(ctx);
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass';
            hp.frequency.value = 1800;
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 2400;
            bp.Q.value = 1.3;
            const crack = envelope(0.75, 0, 0.001, 0.045);
            snap.connect(hp); hp.connect(bp); bp.connect(crack); crack.connect(out);
            snap.start(t); snap.stop(t + 0.05);

            const tail = noise(ctx);
            const tailHp = ctx.createBiquadFilter();
            tailHp.type = 'highpass';
            tailHp.frequency.value = 900;
            const tailGain = envelope(0.18, 0.015, 0.002, 0.16);
            tail.connect(tailHp); tailHp.connect(tailGain); tailGain.connect(out);
            tail.start(t + 0.015); tail.stop(t + 0.18);
            return;
        }

        // rimshot - two drum hits and a cymbal wash.
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
        // itself - it exists so the clone starts from cache rather than from
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
        } catch { /* denied or unsupported - the page works without it */ }
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
    /**
     * Which countdown cycle we are in. It exists only to key the ring: giving
     * the `<rect>` a `key` that changes remounts it, and remounting is what
     * restarts its CSS animation from the top. Without that the animation and
     * the loop would drift apart, and at a two-minute pace the ring would be
     * visibly finishing at the wrong moment within the hour.
     */
    const [cycle, setCycle] = useState(0);
    /* Seconds until the next picture, and whether the loop was already running
       on the previous pass. Refs rather than state: the tick reads and writes
       them every second and must not re-render the page to do it. */
    const left = useRef(0);
    const wasRunning = useRef(false);
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
    /* How far the 17 MB has got, 0 to 1, or null when the response carried no
       Content-Length and there is no denominator to divide by. */
    const [modelProgress, setModelProgress] = useState<number | null>(poseProgress());

    const { data: storedSettings } = useQuery<Settings>('settings', {
        selector: { id: SETTINGS_ID },
    });
    // Not DEFAULTS: writing any setting on a fresh device must persist the
    // detected language, not silently pin it to German.
    const settings: Settings = storedSettings[0] || INITIAL_SETTINGS;
    /* Declared here rather than down with the render values: the tick effect
       below takes it as a dependency, which is what makes a new pace restart
       the wait instead of serving out the old one. */
    const interval = Math.max(MIN_INTERVAL, settings.intervalSec);
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
    /** How many bad readings in a row - the signal grows along it. */
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

    /**
     * The tick.
     *
     * `interval` is a dependency, so **changing the pace restarts the wait
     * rather than serving out the old one** _(2026-09-15, his call)_. Before
     * this the loop read the setting only when it reloaded the counter, so
     * going from two minutes to one second left you watching the old two
     * minutes drain before anything changed.
     *
     * A restart is not a start, though, and the two want different things: the
     * button should take a picture immediately, a new pace should not. That is
     * what `wasRunning` separates - on the first pass after Start the counter
     * begins at zero and fires at once; on a later pass it begins at the new
     * interval and counts it down.
     */
    useEffect(() => {
        runningRef.current = running;
        if (!running) {
            wasRunning.current = false;
            return;
        }
        left.current = wasRunning.current ? interval : 0;
        wasRunning.current = true;
        setCycle((n) => n + 1);
        const id = window.setInterval(() => {
            if (!runningRef.current || busy.current) return;
            if (left.current > 0) {
                left.current -= 1;
                return;
            }
            left.current = interval;
            setCycle((n) => n + 1);
            void check();
        }, 1000);
        return () => window.clearInterval(id);
    }, [running, check, interval]);

    /* The download reports from outside React. Subscribed only while the
       overlay is up, so nothing is listening once the model is in memory. */
    useEffect(() => {
        if (!loadingModel) return;
        setModelProgress(poseProgress());
        return onPoseProgress(setModelProgress);
    }, [loadingModel]);

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
    };

    const change = (patch: Partial<Settings>) =>
        writeSettings({ ...settings, ...patch, id: SETTINGS_ID });

    /* --------------------------------------------------------- rendering */

    const verdict: Verdict | null = last && running ? last.verdict : null;
    useVerdictFavicon(verdict);

    const view: View = settings.view || 'zen';

    return (
        <>
            {/* The first load blocks everything below it - no measurement can
                happen without the model - so it gets an overlay rather than an
                inline spinner tucked between the controls. */}
            <LoadingOverlay
                open={loadingModel}
                title={t.loadingModelTitle}
                label={t.loadingModel}
                progress={modelProgress}
            />

            {/* No heading over the camera _(2026-09-09: „remove these texts
                we do not need them: ‚Right now / One picture every second'")_.
                The picture and the verdict need nobody to announce them, so
                this tile and the control tile beside it are the two that carry
                no eyebrow. */}
            <Panel id="video" className="haltung-videotile">
                <div className={`haltung-kamera${flash ? ' haltung-alarm' : ''}`}>
                    <video ref={camera.videoRef} muted playsInline autoPlay />
                    {!camera.on ? (
                        <div className="haltung-kamera-aus">{t.cameraOff}</div>
                    ) : null}
                    {/* The countdown to the next picture, drawn as the well's
                        own border filling up _(2026-09-15, his call, in place
                        of a labelled bar)_. `pathLength="100"` is what makes it
                        exact: it renormalises the perimeter to 100 units
                        whatever the box measures, so the dash offset runs from
                        100 to 0 and no JavaScript has to measure anything. The
                        rect starts at its top left corner and runs clockwise.

                        **The sweep is one CSS animation over the whole
                        interval** _(2026-09-15, his call: steadily, not once a
                        second)_. React sets its duration and nothing else; the
                        browser draws every frame in between. The `key` is the
                        sync: it changes when the loop reloads its counter, and
                        remounting the rect restarts the animation exactly
                        there, so the ring cannot drift away from the tick that
                        it is counting down to. */}
                    {running ? (
                        <svg className="haltung-tick" aria-hidden="true">
                            <rect
                                key={cycle}
                                width="100%" height="100%"
                                rx={RING_RADIUS} pathLength={100}
                                style={{ '--tick-duration': `${interval}s` } as CSSProperties}
                            />
                        </svg>
                    ) : null}
                </div>

                {/* The verdict reads under the picture, not over it _(2026-09-15,
                    his call)_. The camera well is what the tile is for and it
                    should be the first thing in it; a line of prose above it
                    pushed the picture down and moved it every time the wording
                    changed length.

                    The slot keeps its height whether or not there is anything
                    in it, so the tile does not grow when the first reading
                    lands or when the advice wraps to another line. On a grid,
                    a tile that changes height moves every neighbour in its
                    row. */}
                <div className="haltung-verdict">
                    {verdict ? (
                        <Callout
                            tone={verdict === 'good' ? undefined : verdict === 'bad' ? 'bad' : 'warn'}
                            icon={<Icon size={20} name={verdict === 'good' ? 'check-circle'
                                : verdict === 'bad' ? 'alert' : 'eye'} />}
                            title={t.verdictTitle[verdict]}
                            className={flash ? 'haltung-alarm' : undefined}
                        >
                            {adviceText(last?.advice, t)}
                        </Callout>
                    ) : null}

                    {camera.error ? <Callout tone="bad" title={t.cameraTitle}>{camera.error}</Callout> : null}
                    {apiError ? <Callout tone="bad" title={t.analysisFailed}>{apiError}</Callout> : null}
                    {note ? <Muted>{note}</Muted> : null}
                </div>
            </Panel>

            {/* Running the camera, choosing the noise it makes and switching
                between the two views are one tile _(2026-09-15 and 2026-09-16,
                his calls)_: the first two are „what this thing does while I sit
                here", and the sound is the setting you reach for in the same
                breath as the stop button. The view switch joins them at the
                foot of the tile because in zen this is the only tile with a
                control in it at all. */}
            <Panel id="controls">
                <Row gap={3} wrap justify="between" align="bottom">
                    <Row gap={2} wrap>
                        {/* The xl trigger: 64px, uppercase, tracked. The design
                            system keeps this size for the one button a view
                            leads with, and on this page that is the button
                            that turns the camera on. */}
                        {running
                            ? <Button size="lg" variant="danger" icon={<Icon name="stop" size={20} />}
                                onClick={stop}>{t.stop}</Button>
                            : <Button size="lg" variant="primary" icon={<Icon name="play" size={20} />}
                                onClick={start}>{t.start}</Button>}
                        <Button icon={<Icon name="refresh" />} onClick={() => void check()}
                            disabled={!camera.on || checking}>
                            {t.checkNow}
                        </Button>
                    </Row>
                    {/* Only „the picture is being read" is left here
                        _(2026-09-16, his call)_. „Next check in 12 s" was the
                        countdown ring written out in words, and „Last at
                        14:32" repeated the time that stands at the top of the
                        log below. */}
                    <Muted>{checking ? t.checking : ''}</Muted>
                </Row>

                <Sound
                    settings={settings}
                    change={change}
                    prepareSound={beep.prepare}
                    playSound={beep.play}
                />

                {/* The two views, as a switch rather than a button
                    _(2026-09-16, his call: „mach einen toggle daraus so links
                    zenmode und rechts dashboard mode")_. It was one ghost
                    button in the row above for an hour, which said where it
                    would take you but never which of the two you were in; both
                    words standing side by side say both at once.

                    Last in the tile, under the sound select _(his call)_, and
                    it takes a field label over it for the same reason that one
                    does: it is a setting, and a setting in this system has an
                    11px eyebrow above it.

                    Left is zen and right is the dashboard, which is also least
                    to most, so the control reads along the same ladder the two
                    views differ on.

                    The sentence under each word is `description`, not `title`
                    _(2026-09-18, his call: the short info belongs in the
                    button)_. „Zen" and „Dashboard" are his own two words and
                    they name the views without describing them, so the
                    sentence that does describe them cannot live behind a
                    hover: this page is meant to sit on a phone next to his
                    desk, and a phone has no hover at all. It is the same
                    sentence the title carried - one line each, which is why it
                    fits on the face of a 130px segment. */}
                <Segmented
                    label={t.viewLabel}
                    value={view}
                    onChange={(next) => void change({ view: next as View })}
                    options={[
                        {
                            value: 'zen', label: t.zenLabel, description: t.toZen,
                            icon: <Icon name="minimize" />,
                        },
                        {
                            value: 'dashboard', label: t.dashboardLabel, description: t.toDashboard,
                            icon: <Icon name="grid" />,
                        },
                    ]}
                />
            </Panel>

            <Panel id="readout">
                {last ? (
                    <Grid min={140}>
                        {/* An axis over its tolerance is the one place the
                            accent is allowed to appear on a readout: the number
                            and its label go coral and pulse, and the two that
                            are still inside stay white. That is the whole
                            severity system - whether the accent is there, not
                            which colour it is. */}
                        <Stat label={t.statForward} value={deg(last.forward)}
                            className={breach(last.forward, settings.maxForward)}
                            hint={t.limit(deg(settings.maxForward))} />
                        <Stat label={t.statLean} value={deg(last.lean)}
                            className={breach(last.lean, settings.maxLean)}
                            hint={`${t.sideLabel[last.leanSide]} · ${t.limit(deg(settings.maxLean))}`} />
                        <Stat label={t.statHeadTilt} value={deg(last.headTilt)}
                            className={breach(last.headTilt, settings.maxHeadTilt)}
                            hint={t.limit(deg(settings.maxHeadTilt))} />
                        <Stat label={t.statConfidence} value={`${Math.round(last.confidence * 100)} %`}
                            hint={poseReady() ? t.computedLocally : t.modelLoading} />
                    </Grid>
                ) : (
                    <Empty title={t.noReadingYet} hint={t.noReadingYetHint} />
                )}
            </Panel>

            {/* Everything below this line is the dashboard _(2026-09-16: „im
                default ist die webseite zu techlastig mit den vielen daten")_.
                The three tiles above it are what zen keeps: the picture, the
                button that starts it, and the three angles the picture just
                produced. Those answer „sitze ich gerade"; the curves, the log,
                the trend and the thresholds answer questions you ask on
                purpose, and they are one switch away, at the foot of the
                control tile above.

                They are not rendered at all rather than hidden with CSS: the
                trend tile runs its own query over every day ever recorded, and
                a zen page should not be paying for a chart nobody is looking
                at. */}
            {view === 'dashboard' ? (
                <>
                    <Recent readings={today} windowMin={settings.windowMin}
                        change={change} />

                    <History readings={today} intervalSec={settings.intervalSec} />

                    <Trend />

                    <Setup settings={settings} change={change} />
                </>
            ) : null}
        </>
    );
}

/* ----------------------------------------------------------------- recent */

/** The windows the live curve offers, in minutes. */
const WINDOWS = [5, 15, 30, 60, 120];

/** One point per minute is enough to see a slump and cheap to draw. */
const BUCKET_MS = 60_000;

/**
 * „How is this afternoon going" - a moving average over the last N minutes.
 *
 * He asked for it _(2026-09-08: „a chart should show a moving average over the
 * last x minutes (default 30 minutes)")_, and it answers a different question
 * from the day chart below it. That one is about weeks and can only be read
 * afterwards; this one is about the hour he is sitting in, which is the one he
 * can still do something about.
 *
 * Readings are folded into one-minute buckets and then smoothed across three
 * of them. Raw per-second points would draw the camera's noise rather than his
 * posture - the depth axis wobbles by a degree or two between frames - and the
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
        <>
            {/* Two charts that both answer „the last while", so both tiles say
                so: the grid has no section heading above them any more, and
                „Share of time sitting straight" appears again further down
                against whole days. A tile title has to carry its own scope. */}
            <Panel id="recentangles" title={`${t.recentTitle} · ${t.recentAngles}`}>
                {picker}
                {/* The chart is always drawn, however little it has to draw
                    _(2026-09-15, his call: never show "not enough measured
                    yet")_. An empty axis is still a readout - it says the
                    scale and that nothing has arrived on it - and swapping it
                    for a paragraph made the tile change height the moment the
                    second reading landed. */}
                <LineChart
                    data={rows}
                    x="zeit"
                    series={[
                        { key: 'vorlage', label: t.statForward },
                        { key: 'seitlich', label: t.statLean },
                        { key: 'kopf', label: t.statHeadTilt },
                    ]}
                    format={withUnit(formatNumber, '°')}
                    empty={t.noDataYet}
                    zero
                    height={220}
                />
                <Text small muted>{t.recentNote}</Text>
            </Panel>

            <Panel id="recentshare" title={`${t.recentTitle} · ${t.shareStraight}`}>
                <Text small muted>{t.recentSubtitle(minutes)}</Text>
                <LineChart
                    data={rows}
                    x="zeit"
                    series={[{ key: 'gerade', label: t.seriesStraight }]}
                    format={withUnit(formatNumber, '%')}
                    empty={t.noDataYet}
                    zero
                    legend={false}
                    height={180}
                />
            </Panel>
        </>
    );
}

/* ---------------------------------------------------------------- history */

/** A short day label - „Mo 8.9." - for the x axis. */
function dayLabel(t: number, lang: Lang): string {
    return new Date(t).toLocaleDateString(localeFor(lang), {
        weekday: 'short', day: 'numeric', month: 'numeric',
    });
}

/**
 * „Werde ich besser?" - the one question a single day cannot answer.
 *
 * Reads the daily roll-up, not the raw readings: those are pruned after two
 * weeks, and at ten seconds apart a month of them would be ~90 000 rows to
 * scan on every render.
 *
 * The headline is the share of readings judged upright, because that is the
 * number that survives a change of thresholds being *tightened* - the degrees
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

    const best = rows.length
        ? rows.reduce((a, r) => (r.gerade > a.gerade ? r : a), rows[0])
        : null;

    /* The two charts are rendered whether or not there are days to draw
       _(2026-09-15, his call: always show the chart, and say so when there is
       nothing in it)_. A whole tile that appears on the fourth day is a page
       that rearranges itself under him, and the empty grid plus its one line
       of text answers "what will go here" better than the absence of a tile
       does. Only the stats inside the first tile swap, because three numbers
       computed from nothing are three dashes. */
    return (
        <>
            <Panel id="trendstats" title={t.trendTitle}>
                {best === null ? (
                    <>
                        <Text small muted>{t.trendSubtitleEmpty}</Text>
                        <Empty title={t.trendEmpty} hint={t.trendEmptyHint} />
                    </>
                ) : (
                    <>
                        <Text small muted>{t.trendDays(rows.length)}</Text>
                        <Grid min={140}>
                            <Stat label={t.lastStraight}
                                value={`${rows[rows.length - 1].gerade} %`}
                                hint={rows[rows.length - 1].tag} />
                            <Stat label={t.bestDay} value={`${best.gerade} %`} hint={best.tag} />
                            <Stat
                                label={t.lastSevenDays}
                                value={change === null ? '-' : t.points(change)}
                                hint={change === null
                                    ? t.needsTwoWeeks
                                    : change > 0 ? t.betterThanBefore
                                        : change < 0 ? t.worseThanBefore
                                            : t.unchanged} />
                        </Grid>
                    </>
                )}
            </Panel>

            <Panel id="daychart" title={`${t.trendTitle} · ${t.shareStraight}`}>
                <LineChart
                    data={rows}
                    x="tag"
                    series={[{ key: 'gerade', label: t.seriesStraight }]}
                    format={withUnit(formatNumber, '%')}
                    empty={t.noDataYet}
                    zero
                    legend={false}
                    height={240}
                />
            </Panel>

            <Panel id="daydeviation" title={t.averageDeviation}>
                <LineChart
                    data={rows}
                    x="tag"
                    series={[
                        { key: 'vorlage', label: t.statForward },
                        { key: 'seitlich', label: t.statLean },
                        { key: 'kopf', label: t.statHeadTilt },
                    ]}
                    format={withUnit(formatNumber, '°')}
                    empty={t.noDataYet}
                    zero
                    height={240}
                />
                <Text small muted>{t.lessIsBetter}</Text>
            </Panel>
        </>
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
        // bad reading breaks it, and so does a hole in the recording - see
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
        <>
            <Panel id="today" title={t.todayTitle}>
                <Text small muted>{t.todaySubtitle}</Text>
                {readings.length === 0 ? (
                    <Empty title={t.todayEmpty} hint={t.todayEmptyHint} />
                ) : (
                    <>
                        <Grid min={140}>
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
                    </>
                )}
            </Panel>

            {/* The table is its own tile: five columns and a note per row do
                not belong under the three numbers that summarise them, and in a
                330px column it scrolls sideways inside its own card rather than
                widening the grid. */}
            {readings.length === 0 ? null : (
                <Panel id="daytable" title={`${t.todayTitle} · ${t.showAll}`}>
                    {/* A scrolling log rather than a disclosure. Sixty rows
                        unfolded inside a tile would set the height of its whole
                        row and leave its two neighbours as tall empty cards -
                        tiles stretch to their row. Capped and scrolling, the
                        tile keeps its size whatever the day held, and the
                        sticky header means the columns stay named while you
                        scroll. The disclosure this replaced also duplicated
                        the tile title, which carries „Show all" on its own. */}
                    <div className="haltung-log">
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
                            ]}
                            rows={rows}
                            /* The advice was a sixth column _(2026-09-16, his
                               call: „in the table remove the note column and
                               instead show the note as fullwidth so that it
                               fits")_. A whole sentence in the last column of a
                               330px tile wrapped to four lines and pushed the
                               five columns that carry numbers into sideways
                               scrolling; under its row, across the full width,
                               it reads in one or two. */
                            note={(r: Reading) => adviceText(r.advice, t)}
                        />
                    </div>
                </Panel>
            )}
        </>
    );
}

/* ------------------------------------------------------------------ setup */

type SetupProps = {
    settings: Settings;
    change: (patch: Partial<Settings>) => Promise<unknown>;
};

type SoundProps = SetupProps & {
    /** So „Anhören" can make the same noise the signal makes. */
    prepareSound: () => void;
    playSound: (name: SoundName) => void;
};

/**
 * Everything about the noise: whether it sounds, which one, and a button to
 * hear it.
 *
 * It sits in the control tile next to Start and Stop _(2026-09-15, his call:
 * „move the settings with the sounds and the start/stop into the same tile")_
 * rather than down among the thresholds. The two belong together: the sound is
 * what the page does while it runs, and it is the setting you reach for in the
 * same breath as the stop button.
 */
function Sound(props: SoundProps) {
    const { settings: s, change } = props;
    const t = useCopy();

    /* Asking for the permission is part of switching it on, not a separate
       step: the browser only grants it inside a gesture, and a toggle that
       flips to "on" while the permission was refused is a lie. So a refusal
       leaves the switch where it was and says why. */
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
        <>
            {/* The two ways of being told, side by side _(2026-09-15, his
                call)_. They answer one question - how should this thing get my
                attention - and splitting them across two tiles made you set
                half the answer in each. */}
            <Row gap={4} wrap>
                <Checkbox label={t.soundOnSignal} checked={s.sound}
                    onChange={(on) => void change({ sound: on })} />
                <Checkbox label={t.alsoNotify} checked={s.notify}
                    onChange={(on) => void toggleNotify(on)} />
            </Row>
            {/* Picking a sound switches the sound on _(2026-09-18, his
                call)_. Reaching for this select while `soundOnSignal` is off
                is not someone browsing a list of noises: it is someone saying
                which noise they want, and the setting that decides whether any
                noise happens at all sits one row above, already unticked. The
                old behaviour stored a preference that did nothing and gave no
                sign that it did nothing - you picked the whip, heard silence
                for the rest of the afternoon, and had no reason to suspect the
                checkbox. Turning the signal back off is one click on that same
                checkbox, so the rule cannot trap anyone. */}
            <Row gap={2} align="bottom" stack>
                <Select
                    label={t.soundLabel}
                    value={s.soundName}
                    onChange={(e: { target: { value: string } }) =>
                        void change({ soundName: e.target.value as SoundName, sound: true })}
                >
                    {SOUND_ORDER.map((key) => (
                        <option key={key} value={key}>{t.soundName[key]}</option>
                    ))}
                </Select>
                <Button icon={<Icon name="volume" />}
                    onClick={() => { props.prepareSound(); props.playSound(s.soundName); }}>
                    {t.listen}
                </Button>
            </Row>
        </>
    );
}

function Setup(props: SetupProps) {
    const { settings: s, change } = props;
    const t = useCopy();
    const defaultPaceIndex = Math.max(0, INTERVALS.indexOf(DEFAULTS.intervalSec));
    const paceIndex = INTERVALS.indexOf(s.intervalSec) >= 0
        ? INTERVALS.indexOf(s.intervalSec) : defaultPaceIndex;
    const atDefaults = s.intervalSec === DEFAULTS.intervalSec
        && s.maxForward === DEFAULTS.maxForward
        && s.maxLean === DEFAULTS.maxLean
        && s.maxHeadTilt === DEFAULTS.maxHeadTilt;

    return (
        <>
            <Panel id="thresholds" title={t.paceAndLimits}>
                {/* One column, not two _(2026-09-15)_. Two fitted while a
                    slider was a bare track, but the stepper takes 80px of the
                    row and a 190px cell left about 100px of track: 40 degrees
                    across 100px is not a dial you can feel your way along.
                    Wide enough that the tile never splits these. */}
                <Grid min={220}>
                    {/* The pace is a slider too _(2026-09-15, his call)_, and
                        it is the one whose positions are not the number they
                        stand for: the eight intervals are 1, 2, 5, 10, 15, 30,
                        60 and 120 seconds, so the slider runs over the index
                        and `format` writes what that index means. A linear
                        slider over 1 to 120 would spend seven eighths of its
                        travel on intervals nobody picks. `indexOf` falls back
                        to the default's slot rather than -1, so a stored value
                        that is not on the list cannot push the thumb off the
                        left-hand end. */}
                    <Slider
                        label={t.onePictureEvery}
                        min={0} max={INTERVALS.length - 1} step={1}
                        value={paceIndex}
                        defaultValue={defaultPaceIndex}
                        format={(i) => (INTERVALS[i] === 1
                            ? t.oneSecond : t.nSeconds(INTERVALS[i]))}
                        onChange={(i) => void change({ intervalSec: INTERVALS[i] })}
                    />
                    {/* Sliders, not number fields _(2026-09-15, his call, and
                        the design system's control for a bounded number)_. A
                        tolerance is a dial you feel your way to rather than a
                        figure you know in advance and type, and the README
                        already says as much: "treat the three numbers as dials
                        - too much beeping means raise the limit." The bounds
                        are the ones the fields already enforced. */}
                    <Slider
                        label={t.signalFromForward} min={5} max={45} step={1} unit="°"
                        value={s.maxForward}
                        defaultValue={DEFAULTS.maxForward}
                        onChange={(v) => void change({ maxForward: v })}
                        hint={t.signalFromForwardHint}
                    />
                    <Slider
                        label={t.signalFromLean} min={3} max={45} step={1} unit="°"
                        value={s.maxLean}
                        defaultValue={DEFAULTS.maxLean}
                        onChange={(v) => void change({ maxLean: v })}
                        hint={t.signalFromLeanHint}
                    />
                    <Slider
                        label={t.signalFromHead} min={3} max={45} step={1} unit="°"
                        value={s.maxHeadTilt}
                        defaultValue={DEFAULTS.maxHeadTilt}
                        onChange={(v) => void change({ maxHeadTilt: v })}
                        hint={t.signalFromHeadHint}
                    />
                </Grid>
                {/* One reset for the tile _(2026-09-15, his call: not one per
                    slider)_. It covers the pace as well, now that the pace is
                    a slider too - "all at once" is every dial in the tile. It
                    puts back the numbers in `DEFAULTS`, which is also what each
                    track marks with its hairline, so the button and the marks
                    cannot disagree. Disabled while they are all already there:
                    a control that vanishes when it has nothing to do is a
                    control nobody can find when it does. */}
                <Row justify="end">
                    <Button
                        size="sm"
                        variant="ghost"
                        icon={<Icon name="refresh" />}
                        disabled={atDefaults}
                        title={`${t.resetLimits}: ${DEFAULTS.maxForward}° · ${DEFAULTS.maxLean}° · ${DEFAULTS.maxHeadTilt}°`}
                        onClick={() => void change({
                            intervalSec: DEFAULTS.intervalSec,
                            maxForward: DEFAULTS.maxForward,
                            maxLean: DEFAULTS.maxLean,
                            maxHeadTilt: DEFAULTS.maxHeadTilt,
                        })}
                    >
                        {t.resetLimits}
                    </Button>
                </Row>
                <Text small muted>{t.thresholdNote}</Text>
            </Panel>

            <Panel id="privacy" title={t.leavesTitle}>
                <Text small>{t.leavesText}</Text>
            </Panel>
        </>
    );
}

/* ------------------------------------------------------------------- page */

/**
 * The page shell, and the one place the language and the view are decided.
 *
 * It reads the settings document itself rather than taking the language from
 * `<Live>`: the title and the intro both sit outside `<Live>`, and they have to
 * switch with everything else. `<Page lang>` carries it into the frame so the
 * share button and the confirm dialog switch with them.
 *
 * The view is read here for the same reason - half of what zen hides sits in
 * `<Live>` and the other half (the intro and the five steps) sits below it -
 * and `<Live>` reads it out of the same document rather than being handed it,
 * so there is one answer to „which view" and not two that can disagree. The
 * switch that writes it sits in `<Live>`, at the foot of the control tile.
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
    const written = data[lang] || data.en;
    /* Zen unless the stored settings say otherwise, which is also what a device
       with no settings document yet gets. */
    const view: View = storedSettings[0]?.view || 'zen';
    const patch = (fields: Partial<Settings>) => void writeSettings({
        ...(storedSettings[0] || INITIAL_SETTINGS),
        ...fields,
        id: SETTINGS_ID,
    });

    return (
        <LangContext.Provider value={lang}>
            <CopyContext.Provider value={t}>
                <Page
                    width="full"
                    lang={lang}
                    languages={LANGUAGES.map((l) => l.value)}
                    onLangChange={(next) => patch({ lang: next })}
                    title={t.title}
                    subtitle={t.subtitle}
                    actions={
                        <>
                            <DataSyncButton database={database} filename="sitzhaltung.json" />
                            <ConfirmButton
                                icon={<Icon name="trash" />}
                                label={t.clearHistory}
                                text={t.clearHistory}
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
                    {/* One grid, not a stack of sections _(2026-09-15, his
                        call)_. Every tile below is a direct child of it: the
                        order here is the order they flow in, and reading order
                        is the only thing that still decides what comes first,
                        because the number of columns is the window's business
                        rather than ours. In zen the grid is three tiles long
                        and the rest of this is not rendered at all; the switch
                        at the foot of the control tile brings them back.

                        The live state leads - this page is a tool, and what it
                        is for is what it currently says. The explanation is
                        last. Each tile carries a stable id so it can be linked
                        to and named; the ids are not translated, the titles
                        are. */}
                    <Tiles>
                        <Live />

                        {/* The written explanation belongs to the dashboard
                            _(2026-09-16, his call)_. It is worth reading once
                            and is then six tiles of prose between him and the
                            camera every morning. */}
                        {view === 'dashboard' ? (
                            <>
                                <Panel id="inshort" title={t.inShort}>
                                    <Text small>{written.intro}</Text>
                                </Panel>

                                {/* The five steps are five tiles rather than a
                                    grid inside one: each is two lines, and five
                                    small tiles are exactly what fills the ragged
                                    end of a wide row. The id is positional
                                    because the titles are translated and an id
                                    must not be. */}
                                {written.steps.map((step, i) => (
                                    <Panel key={step.title} id={`step${i + 1}`} title={step.title}>
                                        <Text small>{step.text}</Text>
                                    </Panel>
                                ))}
                            </>
                        ) : null}
                    </Tiles>
                </Page>
            </CopyContext.Provider>
        </LangContext.Provider>
    );
}

/**
 * The gate's own strings cannot come from the settings - the database it is
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

/**
 * What this page remembers: every posture reading it has ever taken, the
 * settings behind them, and one row per day so the series outlives them.
 *
 * Three collections rather than the built-in `decisions`, because none of this
 * is a decision about one option — it is a measurement series, its parameters,
 * and a daily roll-up so the series can be read as a
 * trend long after the raw rows have been pruned.
 *
 * Everything here stays on his device, and nothing at all leaves the browser:
 * the pose model runs locally, so there is no request to make and no key to
 * keep. Nothing is synchronised anywhere.
 *
 * Every collection is published as WebMCP tools with its schema attached, so an
 * agent standing in the browser can query any of them — which is fine for
 * measurements and settings, and is the reason there is nothing secret in here
 * to begin with.
 */

import { createAppDatabase, type RxJsonSchema } from '@db';
import type { Lang } from './i18n';
import config from './app.config';

/* -------------------------------------------------------------- readings */

/** How the page judged one frame. Stored in English, shown in German. */
export type Verdict = 'good' | 'borderline' | 'bad';

/** Which way he leans, from his own point of view. */
export type LeanSide = 'left' | 'right' | 'none';

/** One check: what the model measured, and what the page made of it. */
export type Reading = {
    id: string;
    /** ms since epoch. */
    t: number;
    /** Sideways lean of the shoulder line, degrees, always ≥ 0. */
    lean: number;
    leanSide: LeanSide;
    /** How far the head sits in front of the shoulders, degrees from vertical. */
    forward: number;
    /** Head tilt against the shoulder line, degrees. */
    headTilt: number;
    /** 0–1, the model's own confidence in the estimate. */
    confidence: number;
    /**
     * Which sentence to print — an `AdviceKey`, not the sentence.
     *
     * Stored as a key so a reading recorded in German still reads correctly
     * after he switches the page to English. Rows written before v1 hold a
     * German sentence instead; `adviceText()` prints those verbatim rather
     * than blank for the two days they survive.
     */
    advice: string;
    /** Computed here from the degrees and the thresholds, not by the model. */
    verdict: Verdict;
    /** Did this reading set off the signal. */
    alarm: boolean;
};

const readingSchema: RxJsonSchema<Reading> = {
    version: 2,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 40 },
        t: { type: 'number', minimum: 0, maximum: 9999999999999, multipleOf: 1 },
        lean: { type: 'number' },
        leanSide: { type: 'string', enum: ['left', 'right', 'none'] },
        forward: { type: 'number' },
        headTilt: { type: 'number' },
        confidence: { type: 'number' },
        advice: { type: 'string' },
        verdict: { type: 'string', enum: ['good', 'borderline', 'bad'] },
        alarm: { type: 'boolean' },
    },
    required: ['id', 't', 'lean', 'leanSide', 'forward', 'headTilt',
        'confidence', 'advice', 'verdict', 'alarm'],
    indexes: ['t'],
};

/**
 * v1 drops `forward`.
 *
 * Forward lean was only ever measurable against a reference photo, and the
 * reference is gone _(2026-09-08: „remove the Referenz stuff its confusing")_ —
 * without it the field was hard-coded to zero, which is worse than absent
 * because it looks like a measurement. The rest of the reading is untouched.
 */
const readingMigrations = {
    1: (old: Record<string, unknown>) => {
        const { forward, ...keep } = old;
        return keep;
    },
    // v2 brings it back, measured differently: v1's `forward` came off the nose
    // and only meant anything against a reference photo, so it is not carried
    // over — those rows get 0 and age out within two days anyway.
    2: (old: Record<string, unknown>) => ({ ...old, forward: 0 }),
};

/* -------------------------------------------------------------- settings */

/** One document, id `settings`. */
export type Settings = {
    id: string;
    /**
     * Seconds between two checks. One by default _(asked for 2026-09-08)_ —
     * affordable only because the model runs locally: at a second apart the
     * page reacts while he is still moving, and a check that overruns its tick
     * is skipped rather than queued.
     */
    intervalSec: number;
    /**
     * Degrees above which the signal goes off.
     *
     * Both angles are absolute and need no calibration: the shoulder line
     * against the horizontal, and the eye line against the shoulder line.
     *
     * Researched 2026-09-08, and the finding was mostly negative: the one
     * established cutoff in the literature is the craniovertebral angle
     * (< 48–50° = forward head posture), and this page cannot measure it — CVA
     * needs C7 and the tragus in a *side* view, and the camera is frontal. For
     * lateral trunk or shoulder tilt there is no degree cutoff at all; the
     * research uses asymmetry distances and continuous sway instead. What is
     * well supported is that **sustained** deviation is the risk factor, not a
     * momentary angle.
     *
     * So these are tolerances, not findings. 8° of shoulder drop is visible in
     * a photograph and 10° of head roll is more than a glance at a second
     * monitor; both are meant to fire on a drift he would not otherwise
     * notice. The right way to set them is a day of sitting and seeing how
     * often it fires.
     */
    maxLean: number;
    /**
     * Degrees of forward head — the reason this page exists _(2026-09-08: „i
     * need this because my neck posture is a bit too much to the front")_.
     *
     * Measured from the vertical at the shoulder, so 0° is an ear straight
     * above its shoulder. **Not** the craniovertebral angle: that is drawn from
     * C7, which a pose model does not give, so the 48–50° from the literature
     * does not transfer. There is no validated cutoff for what is measured
     * here, which is exactly why it is a setting.
     *
     * 18° is chosen to err on the loose side: on the one frame available for
     * calibration a plainly acceptable sitting posture read 12°, and a default
     * that scores that as „borderline" on the first afternoon is a default that
     * gets the page closed. Tighten it once a day of real readings says where
     * his own normal actually sits.
     */
    maxForward: number;
    maxHeadTilt: number;
    /**
     * Minutes the live curve averages over. 30 by default _(2026-09-08)_.
     *
     * Separate from the day chart on purpose: that one answers „am I getting
     * better over weeks", this one answers „how is this afternoon going",
     * which is the question you can still do something about.
     */
    windowMin: number;
    /**
     * Which language the page speaks _(asked for 2026-09-08: „mach die app
     * optional in english")_.
     *
     * The order is **stored choice → browser language → English**
     * _(2026-09-08)_. This field is the stored choice; `preferredUiLang()` in
     * `.claude/ui` is the middle step and only ever fills in when no settings
     * document exists yet.
     *
     * `DEFAULTS.lang` below stays `'de'` as the schema's own default, but the
     * app never starts from it directly — `INITIAL_SETTINGS` in `index.tsx`
     * overlays the detected language, so the first write persists what was
     * detected rather than pinning a fresh device to German.
     *
     * Migration v3 deliberately writes `'de'` for devices that predate the
     * field: those were German before and must not switch under him.
     */
    lang: Lang;
    /** Play a sound on the signal. */
    sound: boolean;
    /** Which sound. Synthesised in `index.tsx`, not a file. */
    soundName: SoundName;
    /** Also raise a system notification. */
    notify: boolean;
};

/**
 * The signals he can pick from. The default is the rude one — he asked for it
 * by name, and a noise you find funny is a noise you leave switched on.
 */
/**
 * The alarm sounds — the recordings he sent _(2026-09-08)_. Real ones beat a
 * longer list of synthesised ones, so this list grows only when he sends a file.
 */
export type SoundName = 'furz' | 'schrei' | 'knacken' | 'rimshot' | 'raeuspern';

export const SETTINGS_ID = 'settings';

export const DEFAULTS: Settings = {
    id: SETTINGS_ID,
    intervalSec: 1,
    maxLean: 8,
    maxForward: 18,
    maxHeadTilt: 10,
    windowMin: 30,
    lang: 'de',
    sound: true,
    soundName: 'furz',
    notify: false,
};

const settingsSchema: RxJsonSchema<Settings> = {
    version: 9,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 40 },
        intervalSec: { type: 'number' },
        maxLean: { type: 'number' },
        maxForward: { type: 'number' },
        maxHeadTilt: { type: 'number' },
        windowMin: { type: 'number' },
        sound: { type: 'boolean' },
        soundName: {
            type: 'string',
            enum: ['furz', 'schrei', 'knacken', 'rimshot', 'raeuspern'],
        },
        notify: { type: 'boolean' },
        lang: {
            type: 'string',
            enum: ['de', 'en', 'es', 'fr', 'it', 'pt',
                'nl', 'pl', 'tr', 'ru', 'zh', 'ja'],
        },
    },
    required: ['id', 'intervalSec', 'maxLean', 'maxForward', 'maxHeadTilt',
        'sound', 'soundName', 'notify', 'lang', 'windowMin'],
};

/**
 * v1 added `source` when there were two ways to measure; v2 drops it again
 * along with the two other Gemini-only fields, because there is one way now;
 * v3 adds the language; v4 drops `maxForward` with the measurement it limited;
 * v5 narrows the sound set to the four recordings he sent; v6 brings
 * `maxForward` back for the ear-based forward-head measure; v7 adds the
 * averaging window for the live curve; v8 widens the sound enum; v9 widens the
 * language enum from two to twelve.
 * Every step keeps the thresholds he set — a schema change must never be the
 * thing that resets his settings, and v3 in particular must not change the
 * language a device is already showing.
 */
const settingsMigrations = {
    1: (old: Record<string, unknown>) => ({ ...old, source: 'local' }),
    2: (old: Record<string, unknown>) => {
        const { source, model, useReference, ...keep } = old;
        return { ...keep, soundName: 'furz' };
    },
    3: (old: Record<string, unknown>) => ({ ...old, lang: 'de' }),
    4: (old: Record<string, unknown>) => {
        const { maxForward, ...keep } = old;
        return keep;
    },
    // v5: the sound set became the four files he sent. A device sitting on one
    // of the retired synthesised names would fail the enum, so it lands on the
    // default rather than on nothing.
    5: (old: Record<string, unknown>) => ({
        ...old,
        soundName: ['furz', 'schrei', 'knacken', 'rimshot'].indexOf(
            String(old.soundName),
        ) >= 0 ? old.soundName : 'furz',
    }),
    // v6 restores the forward-head threshold. Any value a device still carries
    // from v3 belonged to the old nose-based measure and would be meaningless
    // against the new one, so everyone starts from the current default.
    6: (old: Record<string, unknown>) => ({ ...old, maxForward: 18 }),
    7: (old: Record<string, unknown>) => ({ ...old, windowMin: 30 }),
    // v8 only widens the sound enum, so nothing has to change — but the schema
    // version has to move or RxDB will reject the stored document.
    8: (old: Record<string, unknown>) => old,
    // v9 widens the language enum the same way. A device already on 'de' or
    // 'en' keeps exactly that: the ten new languages are an offer, and silently
    // moving someone to a language they never picked would be the one change a
    // migration must never make.
    9: (old: Record<string, unknown>) => old,
};

/**
 * One document per calendar day, so „bin ich besser geworden" has something to
 * read.
 *
 * Kept apart from `readings` and kept forever: a day is a few dozen bytes,
 * while the raw readings are pruned after two days (at one second apart they
 * are tens of thousands of rows a day). Sums rather than averages, so a new
 * reading updates the row without re-reading the day.
 */
export type Day = {
    /** `YYYY-MM-DD` in local time — the day as he lived it, not as UTC saw it. */
    id: string;
    /** Local midnight of that day, ms since epoch. */
    t: number;
    count: number;
    good: number;
    borderline: number;
    bad: number;
    alarms: number;
    /** Degree sums; divide by `count` for the average. */
    leanSum: number;
    forwardSum: number;
    headTiltSum: number;
};

const daySchema: RxJsonSchema<Day> = {
    version: 2,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 10 },
        t: { type: 'number', minimum: 0, maximum: 9999999999999, multipleOf: 1 },
        count: { type: 'number' },
        good: { type: 'number' },
        borderline: { type: 'number' },
        bad: { type: 'number' },
        alarms: { type: 'number' },
        leanSum: { type: 'number' },
        forwardSum: { type: 'number' },
        headTiltSum: { type: 'number' },
    },
    required: ['id', 't', 'count', 'good', 'borderline', 'bad', 'alarms',
        'leanSum', 'forwardSum', 'headTiltSum'],
    indexes: ['t'],
};

/**
 * v1 drops `forwardSum`, for the same reason `readings` drops `forward`.
 *
 * These rows are the ones kept forever, so the migration matters more here than
 * anywhere else: every count, every other sum and every day he has recorded
 * survives it. Only the column whose measurement no longer exists is removed.
 */
const dayMigrations = {
    1: (old: Record<string, unknown>) => {
        const { forwardSum, ...keep } = old;
        return keep;
    },
    // v2 restores the column. Old days get 0 rather than a made-up figure —
    // they were recorded before anything measured this, and the chart skips a
    // day whose sum is 0 rather than drawing a flat line that never happened.
    2: (old: Record<string, unknown>) => ({ ...old, forwardSum: 0 }),
};

/* ------------------------------------------------------------------ open */

/** Opened once by `<DatabaseGate>` in index.tsx. */
export function openDatabase() {
    return createAppDatabase({
        appId: config.appId,
        collections: {
            readings: { schema: readingSchema, migrationStrategies: readingMigrations },
            settings: { schema: settingsSchema, migrationStrategies: settingsMigrations },
            days: { schema: daySchema, migrationStrategies: dayMigrations },
        },
    });
}

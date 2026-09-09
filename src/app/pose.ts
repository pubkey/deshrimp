/**
 * How a frame is measured: a pose model running in this browser.
 *
 * Nothing leaves the device — no key, no quota, no picture. It used to be one
 * of two ways, the other being a call to Gemini; that one is gone
 * _(2026-09-08: „remove the gemini option. we always use the in-browser
 * thing")_. What it cost to keep was a second, differently-calibrated set of
 * numbers in the same history, an API key to look after, and a page that had to
 * hedge about what leaves the device.
 *
 * What it is
 * ----------
 * MediaPipe Pose Landmarker (Tasks Vision 1.0.1, `pose_landmarker_lite`),
 * fetched at build time into `mp/` next to `index.html` by
 * `fetch_pose_model.py` and served same-origin. Not a CDN at view time: the
 * page never reaches a third party, never leaks its secret URL as a referrer,
 * and the service worker caches the ~17 MB so the second visit is offline.
 *
 * Why a pose model rather than a language model
 * ---------------------------------------------
 * A language model looks at a flat picture and estimates. This returns 33
 * landmarks with per-point visibility and a metric world position, so an angle
 * is *computed* from geometry rather than guessed — and it is free, private and
 * about thirty times faster.
 *
 * What was measured, not assumed
 * ------------------------------
 * On a real front-facing photo at a webcam-like framing (2026-09-08): shoulders,
 * eyes and ears come back at visibility 1.00, and **the hips at 0.01** — they
 * are simply out of frame when you sit at a desk. So the textbook forward-lean
 * angle (hip→shoulder off vertical) is not available here, and pretending
 * otherwise would produce a confident number from a landmark the model was
 * guessing at.
 *
 * Forward head posture — the thing this page exists for _(2026-09-08: „i need
 * this because my neck posture is a bit too much to the front")_ — went through
 * two wrong versions before this one.
 *
 * First it was measured off the **nose**, and reported only as a deviation from
 * a reference photo. The nose was the mistake: it sits far in front of the
 * shoulders on everyone, bolt upright or not (0.161 m on the test frame), so
 * the absolute number was mostly face geometry and only a personal reference
 * could subtract that out. When the reference went („remove the Referenz stuff
 * its confusing") the measurement went with it.
 *
 * The right landmark is the **ear**, which is what the clinical measure uses
 * too: forward head posture is the head translating forward over the shoulders,
 * and the craniovertebral angle is drawn from C7 to the tragus. On the same
 * test frame the ears sit 0.035 m ahead of the shoulder line — a small number,
 * because that person is sitting reasonably, which is exactly what a useful
 * measure should look like.
 *
 * **Divided by shoulder width, it stops depending on body size** _(2026-09-08:
 * „do not care about body size")_: both lengths are on the same body, so the
 * ratio is the same for a tall person and a short one. That is also what makes
 * the page work for anyone rather than for one calibrated user.
 *
 * The other two angles need no calibration either: a level shoulder line is
 * upright, and an eye line parallel to it is a level head.
 *
 * Sides are in the sitter's own terms: MediaPipe's `LEFT_*` landmarks are the
 * subject's left, which on an unmirrored frontal frame appear on the viewer's
 * right. Verified against a real photo rather than reasoned about, because this
 * is precisely the thing that ends up backwards.
 */

/**
 * Which sentence the page should print.
 *
 * A key, not a sentence: the page is German or English (2026-09-08) and the
 * wording lives in `i18n.ts`. Keys are also what gets stored, so a reading
 * recorded in German still reads correctly after he switches.
 */
export type AdviceKey =
    | 'nobody'
    | 'noShoulders'
    | 'level'
    | 'leanLeft'
    | 'leanRight'
    | 'leanSide'
    | 'headTilt'
    | 'headTiltPlain'
    | 'forward';

/** What one frame produced. Degrees, all of them ≥ 0. */
export type Analysis = {
    personDetected: boolean;
    leanDeg: number;
    leanSide: 'left' | 'right' | 'none';
    /**
     * How far the head sits in front of the shoulders, as an angle at the
     * shoulder: 0° is an ear straight above its shoulder, and it grows as the
     * head comes forward. Not the craniovertebral angle — see `forwardDegrees`.
     */
    forwardDeg: number;
    headTiltDeg: number;
    confidence: number;
    advice: AdviceKey;
};

/* -------------------------------------------------------------- constants */

/** Where `fetch_pose_model.py` puts the wasm, the loader and the model. */
const ASSET_DIR = 'mp';

/** Landmark indices we use. MediaPipe's pose topology, verified 2026-09-08. */
const EYE_L = 2;
const EAR_L = 7;
const EAR_R = 8;
const EYE_R = 5;
const SHOULDER_L = 11;
const SHOULDER_R = 12;

/** Below this a landmark is treated as not seen at all. */
const MIN_VISIBILITY = 0.5;

/** The frame is scaled to this before detection. */
const FRAME_WIDTH = 512;

/* ------------------------------------------------------------------ types */

type Landmark = { x: number; y: number; z: number; visibility?: number };

type Detection = {
    landmarks: Landmark[][];
    worldLandmarks: Landmark[][];
};

/**
 * What one reference frame produced: the angles of the posture he chose. Every
 * later reading is reported as its distance from these.
 */

/**
 * His own limits, passed in so the sentence and the verdict cannot disagree.
 *
 * `index.tsx` decides `good`/`borderline`/`bad` from these; without them the
 * advice here would be judging by a second, invisible standard and the page
 * would cheerfully print „sitzt gerade" above „richt dich auf".
 */
export type Thresholds = { maxLean: number; maxForward: number; maxHeadTilt: number };

export class PoseError extends Error {}

/* ---------------------------------------------------------------- loading */

let landmarkerPromise: Promise<any> | null = null;

/**
 * Whether the model has actually finished loading.
 *
 * A separate flag rather than `landmarkerPromise !== null`, which is what
 * `poseReady()` used to test — that is true the instant loading *starts*, so
 * the page cheerfully claimed „lokal gerechnet" during the seventeen megabytes
 * it was still waiting for. A promise that exists is not a model that works.
 */
let landmarkerLoaded = false;

/**
 * Import the ES module at runtime instead of bundling it.
 *
 * `new Function` hides the specifier from esbuild, which would otherwise try to
 * resolve `./mp/vision_bundle.mjs` at build time — it does not exist then, and
 * inlining 17 MB into the HTML is the thing we are avoiding.
 */
const importModule: (url: string) => Promise<any> =
    new Function('u', 'return import(u)') as never;

function assetUrl(file: string): string {
    return new URL(`${ASSET_DIR}/${file}`, location.href).href;
}

/**
 * Load the model once and keep it. A failed load is not cached — the next
 * attempt may well succeed, e.g. after the network came back on a first visit.
 */
export function loadPose(): Promise<any> {
    if (!landmarkerPromise) {
        landmarkerPromise = (async () => {
            const mp = await importModule(assetUrl('vision_bundle.mjs'));
            const fileset = await mp.FilesetResolver.forVisionTasks(
                new URL(`${ASSET_DIR}/`, location.href).href,
            );
            const landmarker = await mp.PoseLandmarker.createFromOptions(fileset, {
                baseOptions: {
                    modelAssetPath: assetUrl('pose_landmarker_lite.task'),
                    delegate: 'GPU',
                },
                runningMode: 'IMAGE',
                numPoses: 1,
            });
            landmarkerLoaded = true;
            return landmarker;
        })().catch((err) => {
            landmarkerPromise = null;
            landmarkerLoaded = false;
            // The page prints `t.modelFailed` for a PoseError; `detail` is the
            // browser's own words, appended so a real diagnosis is not lost.
            throw new PoseError(String(err?.message || ''));
        });
    }
    return landmarkerPromise;
}

/** True once the model is in memory — the UI uses it to say „bereit". */
/** The model is loaded and a check will return immediately. */
export function poseReady(): boolean {
    return landmarkerLoaded;
}

/** Loading has begun and has not finished. This is what a spinner waits on. */
export function poseLoading(): boolean {
    return landmarkerPromise !== null && !landmarkerLoaded;
}

/**
 * Start fetching the model without measuring anything, and **say when it is
 * done** — settled either way, because the overlay has to come down on failure
 * too.
 *
 * Called from the Start button so the wait begins the moment he asks for it,
 * rather than a second later once the camera has finished negotiating: the
 * overlay should appear on the click, not after it. Deliberately **not** called
 * on page load — it is seventeen megabytes, and opening the page to glance at
 * yesterday's curve should not spend them.
 *
 * It returns a promise rather than leaving the caller to poll `poseLoading()`.
 * Polling looked equivalent and was not: a first attempt can fail fast (the GPU
 * delegate is not available, say), which clears `landmarkerPromise` and makes
 * the poll read „finished" a few hundred milliseconds in, while a retry from
 * the check loop is still loading. Awaiting the actual attempt cannot drift
 * from it. The error is swallowed here on purpose — the next real check reports
 * it properly, with the sentence in the reader's language.
 */
export function preloadPose(): Promise<void> {
    return loadPose().then(() => undefined, () => undefined);
}

/* -------------------------------------------------------------- geometry */

function visible(p: Landmark | undefined): p is Landmark {
    return !!p && (p.visibility ?? 0) >= MIN_VISIBILITY;
}

/**
 * Angle of a line off horizontal, in degrees, 0–90, from pixel coordinates.
 *
 * Folded into the first quadrant on purpose. The landmarks arrive in body
 * order, not left-to-right, so on a frontal frame the shoulder line runs
 * right-to-left and the raw `atan2` reads ~180° for a perfectly level pair.
 * What is wanted is the deviation from horizontal, which is the same whichever
 * end you start from.
 */
function tiltDegrees(a: Landmark, b: Landmark, w: number, h: number): number {
    const dx = (b.x - a.x) * w;
    const dy = (b.y - a.y) * h;
    if (dx === 0 && dy === 0) return 0;
    const raw = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
    return raw > 90 ? 180 - raw : raw;
}

/**
 * How far the head sits in front of the shoulders, as an angle at the shoulder.
 *
 * Drawn from the shoulder midpoint to the ear midpoint, in the model's metric
 * world coordinates, and measured **from the vertical**: an ear straight above
 * its shoulder is 0°, and the angle grows as the head comes forward. Because
 * both legs of that triangle are lengths on the same body, the result does not
 * depend on how big the body is — a tall person craning and a short person
 * craning read the same _(2026-09-08: „do not care about body size")_.
 *
 * **This is not the craniovertebral angle**, and its numbers must not be
 * compared to the 48–50° in the literature. The CVA runs from *C7* to the
 * tragus; C7 sits behind the shoulder line, and a pose model does not give it.
 * Same idea, different origin, different scale.
 *
 * The depth axis is the weakest one a single RGB camera has, so a single
 * reading is soft. It is the *change* across a day that this page is actually
 * built on.
 *
 * Returns null when the ears are not visible — hair, a hood, a turned head.
 */
function forwardDegrees(world: Landmark[], view: Landmark[]): number | null {
    const el = view[EAR_L];
    const er = view[EAR_R];
    if (!visible(el) || !visible(er)) return null;

    const sl = world[SHOULDER_L];
    const sr = world[SHOULDER_R];
    const wl = world[EAR_L];
    const wr = world[EAR_R];
    if (!sl || !sr || !wl || !wr) return null;

    const shoulderY = (sl.y + sr.y) / 2;
    const shoulderZ = (sl.z + sr.z) / 2;
    const earY = (wl.y + wr.y) / 2;
    const earZ = (wl.z + wr.z) / 2;

    const ahead = shoulderZ - earZ;          // world z grows away from the camera
    const up = Math.abs(shoulderY - earY);   // world y grows downward
    if (up < 1e-4) return null;

    // Only forward counts. Sitting with the ear behind the shoulder is not a
    // posture this page has an opinion about, and reporting it as a negative
    // angle would make the day's average meaningless.
    return Math.max(0, (Math.atan2(ahead, up) * 180) / Math.PI);
}

/** Which way the shoulder line drops, in the sitter's own terms. */
function leanSideOf(sl: Landmark, sr: Landmark): Analysis['leanSide'] {
    const drop = sl.y - sr.y;           // normalized y grows downward
    if (Math.abs(drop) < 1e-4) return 'none';
    return drop > 0 ? 'left' : 'right';
}

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}

/* --------------------------------------------------------------- reading */

function detect(landmarker: any, frame: HTMLCanvasElement): Detection {
    const result = landmarker.detect(frame);
    return {
        landmarks: result?.landmarks ?? [],
        worldLandmarks: result?.worldLandmarks ?? [],
    };
}

/**
 * Draw the video into a canvas at the detection width.
 *
 * Taken from the element, not from the mirrored CSS: the model has to see the
 * real camera, or every side comes out swapped.
 */
export function frameOf(video: HTMLVideoElement): HTMLCanvasElement | null {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH;
    canvas.height = Math.round((vh / vw) * FRAME_WIDTH);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
}

/**
 * Measure one frame.
 *
 * Two angles, both absolute: the shoulder line against the horizontal, and the
 * eye line against the shoulder line. Nothing here needs calibrating, which is
 * the point — the page measures from the first frame.
 */
export async function analysePose(
    frame: HTMLCanvasElement,
    limits: Thresholds,
): Promise<Analysis> {
    const landmarker = await loadPose();
    const { landmarks, worldLandmarks } = detect(landmarker, frame);
    const L = landmarks[0];
    const W = worldLandmarks[0];

    if (!L || !W) {
        return {
            personDetected: false,
            leanDeg: 0, leanSide: 'none', forwardDeg: 0, headTiltDeg: 0,
            confidence: 0,
            advice: 'nobody',
        };
    }

    const sl = L[SHOULDER_L];
    const sr = L[SHOULDER_R];
    if (!visible(sl) || !visible(sr)) {
        return {
            personDetected: false,
            leanDeg: 0, leanSide: 'none', forwardDeg: 0, headTiltDeg: 0,
            confidence: 0,
            advice: 'noShoulders',
        };
    }

    const el = L[EYE_L];
    const er = L[EYE_R];
    const eyesSeen = visible(el) && visible(er);

    const lean = tiltDegrees(sl, sr, frame.width, frame.height);
    // The head against the shoulders, not against the room: leaning the whole
    // torso should not read as a tilted head as well.
    const headTilt = eyesSeen
        ? Math.abs(tiltDegrees(el, er, frame.width, frame.height) - lean)
        : 0;

    const forward = forwardDegrees(W, L);

    const used = [sl.visibility ?? 0, sr.visibility ?? 0]
        .concat(eyesSeen ? [el.visibility ?? 0, er.visibility ?? 0] : []);
    const confidence = used.reduce((a, b) => a + b, 0) / used.length;

    return {
        personDetected: true,
        leanDeg: round1(lean),
        leanSide: lean < 1 ? 'none' : leanSideOf(sl, sr),
        forwardDeg: round1(forward ?? 0),
        headTiltDeg: round1(headTilt),
        confidence: Math.round(confidence * 100) / 100,
        advice: adviceFor(
            lean, forward, headTilt, leanSideOf(sl, sr), eyesSeen, limits,
        ),
    };
}

/**
 * Which sentence fits this frame — the key, not the wording.
 *
 * Decided here rather than asked of a model, because the numbers are already
 * known and a generated sentence would be a slower, less predictable way of
 * saying the same thing. It uses the same ratio `judge()` uses, so „gerade"
 * never ends up printed above „richt dich auf".
 */
function adviceFor(
    lean: number,
    forward: number | null,
    headTilt: number,
    side: Analysis['leanSide'],
    eyesSeen: boolean,
    limits: Thresholds,
): AdviceKey {
    const leanRatio = lean / Math.max(1, limits.maxLean);
    const headRatio = headTilt / Math.max(1, limits.maxHeadTilt);
    const fwdRatio = forward === null ? 0 : forward / Math.max(1, limits.maxForward);
    const worst = Math.max(leanRatio, headRatio, fwdRatio);
    if (worst < 0.7) return 'level';
    // Forward head first when it ties: it is the reason the page exists.
    if (worst === fwdRatio) return 'forward';
    if (leanRatio >= headRatio) {
        return side === 'left' ? 'leanLeft' : side === 'right' ? 'leanRight' : 'leanSide';
    }
    return eyesSeen ? 'headTilt' : 'headTiltPlain';
}

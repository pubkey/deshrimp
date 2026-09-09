/**
 * Put the pose model where the page can load it: `public/mp/`.
 *
 * Why this is a script and not just an import
 * -------------------------------------------
 * The page measures posture with a pose model running in the browser — that is
 * the only path there is. It needs four files, ~17 MB in total, and they reach
 * this project two different ways:
 *
 *   - **three of them ship in `@mediapipe/tasks-vision`**, an ordinary
 *     dependency, so npm downloads and integrity-checks them. They are copied
 *     rather than imported because the WASM loader fetches its `.wasm` sibling
 *     by URL at runtime, so the two have to sit next to each other in a folder
 *     the server actually serves.
 *   - **the weights are not on npm at all.** They come from Google's model
 *     storage, so this fetches them once.
 *
 * Neither belongs in git: 17 MB in the history would be paid by every clone
 * forever, and no version of it could ever be removed. `public/mp/` is ignored.
 *
 * Every file is then checked against a pinned SHA-256, and a mismatch is a hard
 * failure. This code runs in a browser with camera access; "probably the right
 * binary" is not good enough.
 *
 *     node scripts/fetch-pose-model.mjs [dest]     # default: public/mp
 *
 * Idempotent, because it runs from `postinstall`: if everything is present and
 * matches, it says so and exits. Re-downloading 17 MB on every `npm install`
 * would be its own kind of bug.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const PKG = join(ROOT, 'node_modules', '@mediapipe', 'tasks-vision');

/**
 * The weights, pinned to one version. A model that reads a body is not
 * something to float on "latest" and rediscover a changed output shape in
 * production.
 */
const MODEL_URL =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/' +
    'pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

/**
 * What to copy out of the package. The nosimd build is deliberately left out:
 * it is another 11 MB, and every browser that can run this page has had WASM
 * SIMD for years. Without SIMD the page cannot measure at all, and says so
 * rather than failing silently.
 */
const FROM_PACKAGE = [
    'vision_bundle.mjs',
    'wasm/vision_wasm_internal.js',
    'wasm/vision_wasm_internal.wasm',
];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/** The expected digests as `{ name: sha256 }`. */
async function pinned() {
    const text = await readFile(join(HERE, 'pose-model.sha256'), 'utf8');
    return Object.fromEntries(
        text.split('\n')
            .filter((l) => l.trim() && !l.startsWith('#'))
            .map((l) => l.trim().split(/\s+/))
            .map(([digest, name]) => [name, digest]),
    );
}

/** True when every pinned file is already there and matches. Keeps postinstall cheap. */
async function alreadyThere(out, want) {
    if (!existsSync(out)) return false;
    const have = new Set(await readdir(out));
    for (const [name, digest] of Object.entries(want)) {
        if (!have.has(name)) return false;
        if (sha256(await readFile(join(out, name))) !== digest) return false;
    }
    return true;
}

async function main() {
    const out = resolve(process.argv[2] || join(ROOT, 'public', 'mp'));
    const want = await pinned();

    if (await alreadyThere(out, want)) {
        console.log(`OK: pose model already in ${out} — nothing to fetch`);
        return;
    }

    if (!existsSync(PKG)) {
        throw new Error(
            `@mediapipe/tasks-vision is not installed (looked in ${PKG}).\n` +
            '       Run npm install first — it is a normal dependency.',
        );
    }

    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });

    /** @type {Record<string, string>} */
    const written = {};

    for (const rel of FROM_PACKAGE) {
        const name = rel.split('/').pop();
        const data = await readFile(join(PKG, rel));
        await writeFile(join(out, name), data);
        written[name] = sha256(data);
        console.log(`  from @mediapipe/tasks-vision: ${rel}`);
    }

    console.log(`  fetching ${MODEL_URL}`);
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${MODEL_URL}`);
    const model = Buffer.from(await res.arrayBuffer());
    await writeFile(join(out, 'pose_landmarker_lite.task'), model);
    written['pose_landmarker_lite.task'] = sha256(model);

    const bad = Object.entries(written).filter(([n, d]) => want[n] && want[n] !== d);
    const missing = Object.keys(want).filter((n) => !(n in written));
    if (bad.length || missing.length) {
        throw new Error(
            'checksum mismatch — refusing to ship this.\n' +
            bad.map(([n]) => `       changed: ${n}\n`).join('') +
            missing.map((n) => `       missing: ${n}\n`).join('') +
            '       If the upgrade is intended, update scripts/pose-model.sha256.',
        );
    }

    const bytes = Object.keys(written).length;
    console.log(`OK: ${bytes} files in ${out}, all matching pose-model.sha256`);
}

main().catch((err) => {
    console.error(`error: ${err.message}`);
    process.exit(1);
});

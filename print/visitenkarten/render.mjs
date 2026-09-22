// Turns visitenkarten.html into the print files in out/.
//
//   node print/visitenkarten/render.mjs            all five ideas
//   node print/visitenkarten/render.mjs satz furz  only those
//
// What it does, in order:
//   1. Fills every <svg data-qr="..."> with a code from src/ui/qr.ts, the same
//      encoder the share sheet uses, so the card and the page cannot disagree
//      about what a QR for this address looks like.
//   2. Inlines the four woff2 files as data URIs, so out/visitenkarten.html is
//      one file that opens anywhere and the PDFs embed the real Plex.
//   3. Runs Chromium headless once per idea for a two-page PDF (front, back,
//      91 x 61 mm each, bleed included), once for alle.pdf with every page,
//      and once per idea plus once for the overview as a PNG preview.
//
// Chromium is found through $CHROMIUM, then the usual places. It needs to be
// the real browser, not a node package; nothing here is installed by npm.
//
// Node 22.18 or newer, which imports a .ts file without a flag.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { qrMatrix, qrSvgPath } from '../../src/ui/qr.ts';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'visitenkarten.html');
const out = join(here, 'out');
mkdirSync(out, { recursive: true });

// --- 1. the QR codes -------------------------------------------------------
let html = readFileSync(src, 'utf8');
html = html.replace(/<svg data-qr="([^"]+)"([^>]*)><\/svg>/g, (_, value, attrs) => {
    const code = qrMatrix(value);
    if (!code) throw new Error(`no QR code fits ${value}`);
    // Four modules of quiet zone on every side, as the spec asks.
    const q = 4;
    const box = `${-q} ${-q} ${code.size + 2 * q} ${code.size + 2 * q}`;
    return `<svg viewBox="${box}" shape-rendering="crispEdges"${attrs}>`
        + `<path d="${qrSvgPath(code)}"/></svg>`;
});

// --- 2. the fonts ----------------------------------------------------------
html = html.replace(/url\('(\.\.\/\.\.\/src\/ui\/fonts\/[^']+\.woff2)'\)/g, (_, rel) => {
    const bytes = readFileSync(resolve(here, rel));
    return `url('data:font/woff2;base64,${bytes.toString('base64')}')`;
});

const page = join(out, 'visitenkarten.html');
writeFileSync(page, html);

// --- 3. Chromium -----------------------------------------------------------
const candidates = [
    process.env.CHROMIUM,
    '/opt/pw-browsers/chromium',
    'chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
].filter(Boolean);

const runs = (bin) => {
    try { execFileSync(bin, ['--version'], { stdio: 'ignore' }); return true; }
    catch { return false; }
};
const chromium = candidates.find(runs);
if (!chromium) {
    console.error('No Chromium found. Set CHROMIUM=/path/to/chrome and run again.');
    process.exit(1);
}
// The PNGs are the one place the two headless modes differ. Chrome's newer
// headless counts --window-size as the outer window, so a screenshot loses
// about 90px of page at the bottom; the old headless shell, which Playwright
// installs beside the browser, sizes the viewport itself. Use it for the
// screenshots when it is there, else pad the window and accept the strip of
// background under the cards.
const shell = [
    process.env.CHROMIUM_HEADLESS_SHELL,
    ...(existsSync('/opt/pw-browsers') ? readdirSync('/opt/pw-browsers', { withFileTypes: true }) : [])
        .filter((d) => d.isDirectory() && d.name.startsWith('chromium_headless_shell'))
        .map((d) => join('/opt/pw-browsers', d.name, 'chrome-linux', 'headless_shell')),
].filter(Boolean).find((bin) => existsSync(bin) && runs(bin));

const ids = [...html.matchAll(/<section class="variant" id="([^"]+)">/g)].map((m) => m[1]);
const wanted = process.argv.slice(2);
for (const w of wanted) if (!ids.includes(w)) throw new Error(`no such card: ${w} (have ${ids.join(', ')})`);
const todo = wanted.length ? wanted : ids;

const url = pathToFileURL(page).href;
const run = (args, bin = chromium) => execFileSync(bin, [
    '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--run-all-compositor-stages-before-draw', '--virtual-time-budget=2000',
    ...args,
], { stdio: 'ignore' });

// 96 CSS px to the inch, 25.4 mm to the inch: what a millimetre measures on screen.
const px = (mm) => Math.ceil(mm * 96 / 25.4);
const pdf = (file, target) => run(['--no-pdf-header-footer', `--print-to-pdf=${file}`, target]);
const png = (file, w, h, target) => run([
    `--screenshot=${file}`, `--window-size=${w},${shell ? h : h + 96}`,
    '--force-device-scale-factor=3', target,
], shell ?? chromium);

for (const id of todo) {
    pdf(join(out, `${id}.pdf`), `${url}#only=${id}`);
    png(join(out, `${id}.png`), px(186), px(61), `${url}?shot=${id}`);
    console.log(`${id}: pdf, png`);
}
if (todo.length === ids.length) {
    pdf(join(out, 'alle.pdf'), url);
    png(join(out, 'alle.png'), px(186), px(61 * ids.length + 4 * (ids.length - 1)), `${url}?shot=all`);
    console.log('alle: pdf, png');
}
if (!existsSync(join(out, 'alle.pdf'))) console.log('(alle.pdf is written when every card is rendered)');

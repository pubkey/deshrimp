/**
 * Draws `public/og-image.png`, the picture a link to deshrimp.com shows when
 * it is shared on WhatsApp, Telegram, Signal, iMessage, Slack, Facebook or X.
 *
 * It exists because none of those render an SVG: the head used to name
 * `icon.svg` as `og:image`, and every share came out as a bare grey box
 * _(his report, verbatim: „wenn ich deshrimp.com auf whatsapp und so teile
 * dann kommt da kein bild. binde da die richtigen html meta sachen ein")_.
 *
 * 1200 x 630 is the size all of them crop from without upscaling. WhatsApp's
 * small preview takes a centred square out of it, so the mark and the name
 * sit in the middle and nothing that matters goes near the sides. The picture
 * has no sentence on it, only the name and the address, so the one file works
 * for all thirteen language pages.
 *
 * The output is committed rather than built: a build that needs a browser
 * would not run on a plain `npm install`. Run this again after a change to the
 * mark or the palette:
 *
 *     node scripts/og-image.mjs
 *
 * It uses the Playwright and Chromium already on the machine; neither is a
 * dependency of the project.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const font = (f) => readFileSync(resolve(root, 'src/ui/fonts', f)).toString('base64');

// The palette, as locked in src/ui/DESIGN.md. The coral is spent once, on the
// mark's dot.
const INK = '#1A1A1A';
const SECONDARY = '#666666';

const mark = readFileSync(resolve(root, 'public/brand/mark.svg'), 'utf8');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Plex; font-weight: 400 700;
  src: url(data:font/woff2;base64,${font('ibm-plex-sans-latin.woff2')}) format('woff2'); }
@font-face { font-family: PlexMono; font-weight: 500;
  src: url(data:font/woff2;base64,${font('ibm-plex-mono-500-latin.woff2')}) format('woff2'); }
html, body { margin: 0; width: 1200px; height: 630px; background: #FFFFFF; }
body { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.lockup { display: flex; align-items: center; gap: 0; }
.lockup svg { width: 168px; height: 168px; }
.name { font: 700 120px/1 Plex, sans-serif; letter-spacing: -4px; color: ${INK}; }
.url { margin-top: 40px; font: 500 34px/1 PlexMono, monospace; color: ${SECONDARY}; }
</style></head><body>
<div class="lockup">${mark}<div class="name">deshrimp</div></div>
<div class="url">deshrimp.com</div>
</body></html>`;

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const out = resolve(root, 'public/og-image.png');
await page.screenshot({ path: out, type: 'png' });
await browser.close();
console.log(`[og-image] wrote ${out}`);

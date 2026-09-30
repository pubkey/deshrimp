// Renders every version in card.html into a print PDF, two previews, and one
// overview of them all.
//
//   NODE_PATH="$(npm root -g)" node print/visitenkarte/render.cjs [--guides]
//
// Playwright is not a dependency of the app, so this borrows a global install.
// Each PDF is 91 x 61 mm per page (85 x 55 trim plus 3 mm bleed), page 1 the
// front and page 2 the back, which is what a print shop asks for. The previews
// are cut to the trim so they show the card as it will be held; with --guides,
// proofs that keep the bleed and draw the trim (cyan) and the safe area
// (magenta) are written as well. Those are for checking, not for committing.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const card = 'file://' + path.join(dir, 'card.html');
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const MM = 96 / 25.4;

(async () => {
  const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const page = await browser.newPage({ deviceScaleFactor: 6 });

  await page.goto(card);
  const names = await page.evaluate(() => Object.keys(VARIANTS));

  for (const name of names) {
    await page.goto(card + '?v=' + name);
    await page.evaluate(() => document.fonts.ready);

    await page.pdf({
      path: path.join(dir, 'deshrimp-visitenkarte-' + name + '.pdf'),
      width: '91mm',
      height: '61mm',
      printBackground: true,
    });

    // Only the version's own front is displayed, so the first visible page is it.
    const [front, back] = await page.$$('.page:visible');
    const sides = [[front, 'vorne'], [back, 'hinten']];

    for (const [el, side] of sides) {
      const box = await el.boundingBox();
      await page.screenshot({
        path: path.join(dir, name + '-' + side + '.png'),
        clip: { x: box.x + 3 * MM, y: box.y + 3 * MM, width: 85 * MM, height: 55 * MM },
      });
    }

    if (process.argv.includes('--guides')) {
      await page.evaluate(() => document.body.classList.add('show-guides'));
      for (const [el, side] of sides) {
        await el.screenshot({ path: path.join(dir, name + '-' + side + '-proof.png') });
      }
    }
  }

  // The overview: one row per version, front and back side by side.
  const rows = names.map(n => `
    <div class="row"><div class="name">${n}</div>
      <img src="file://${path.join(dir, n + '-vorne.png')}">
      <img src="file://${path.join(dir, n + '-hinten.png')}"></div>`).join('');
  const sheet = path.join(os.tmpdir(), 'deshrimp-visitenkarte-uebersicht.html');
  fs.writeFileSync(sheet, `<!doctype html><meta charset="utf-8"><style>
    @font-face { font-family: 'IBM Plex Sans'; font-weight: 400 700;
      src: url('file://${path.join(dir, '../../src/ui/fonts/ibm-plex-sans-latin.woff2')}'); }
    body { margin: 0; padding: 32px; background: #334155; font-family: 'IBM Plex Sans';
      display: inline-flex; flex-direction: column; gap: 24px; }
    .row { display: flex; gap: 24px; align-items: center; }
    .name { width: 110px; color: #F8FAFC; font-size: 14px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.09em; }
    img { width: 425px; height: 275px; display: block; }
  </style>${rows}`);
  const overview = await browser.newPage({ deviceScaleFactor: 2 });
  await overview.goto('file://' + sheet);
  await overview.waitForLoadState('load');
  await overview.locator('body').screenshot({ path: path.join(dir, 'uebersicht.png') });

  await browser.close();
})();

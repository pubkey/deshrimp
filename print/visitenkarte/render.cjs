// Renders card.html into the print PDF and two PNG previews.
//
//   NODE_PATH="$(npm root -g)" node print/visitenkarte/render.cjs
//
// Playwright is not a dependency of the app, so this borrows a global install.
// The PDF is 91 x 61 mm per page (85 x 55 trim plus 3 mm bleed), page 1 the
// front and page 2 the back, which is what a print shop asks for. The previews
// are cut to the trim so they show the card as it will be held; the proofs
// keep the bleed and draw the trim (cyan) and the safe area (magenta).

const path = require('path');
const { chromium } = require('playwright');

const dir = __dirname;
const url = 'file://' + path.join(dir, 'card.html');
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
const MM = 96 / 25.4;

(async () => {
  const browser = await chromium.launch(
    require('fs').existsSync(exe) ? { executablePath: exe } : {});
  const page = await browser.newPage({ deviceScaleFactor: 8 });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: path.join(dir, 'deshrimp-visitenkarte.pdf'),
    width: '91mm',
    height: '61mm',
    printBackground: true,
    pageRanges: '1-2',
  });

  const cards = await page.$$('.page');
  const names = ['vorderseite', 'rueckseite'];
  for (let i = 0; i < cards.length; i++) {
    const box = await cards[i].boundingBox();
    await page.screenshot({
      path: path.join(dir, names[i] + '.png'),
      clip: { x: box.x + 3 * MM, y: box.y + 3 * MM, width: 85 * MM, height: 55 * MM },
    });
  }

  if (process.argv.includes('--guides')) {
    await page.evaluate(() => document.body.classList.add('show-guides'));
    for (let i = 0; i < cards.length; i++) {
      await cards[i].screenshot({ path: path.join(dir, names[i] + '-proof.png') });
    }
  }

  await browser.close();
})();

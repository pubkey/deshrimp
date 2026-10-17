/**
 * The legal notice (Impressum) at `/legal-notice.html`.
 *
 * German law (§ 5 DDG) wants every business-run website to name who runs it,
 * with a postal address that can be served, a fast electronic contact and the
 * VAT ID, and to keep that notice **directly reachable** from every page. So
 * every page links here: the app in its footer, and the fourteen prerendered
 * pages in their crawlable copy, which is also what a reader without
 * JavaScript sees (`scripts/seo.mjs`).
 *
 * It is a static page rather than a view of the app. There is nothing on it
 * that needs the database, the camera or React, and a legal notice that only
 * appears after a 17 MB model page has booted is not "directly reachable". It
 * is built from the same shipped shell as the language pages, so it wears the
 * same stylesheet (tokens, IBM Plex, light and dark), minus the module script:
 * no bundle runs here.
 *
 * Name, email and VAT ID are the ones published in the rxdb.info legal notice,
 * because it is the same person and the same sole proprietorship. The address
 * is not: rxdb.info shows the coworking space (Friedrichstraße 13), this page
 * shows Friedrichstraße 5 _(2026-10-05, his call, verbatim: „use
 * "friedrichstraße 5" as street name")_. Change name, email or VAT ID there and
 * here together; the address is this page's own.
 *
 * Written in German, which is the language the obligation is in, with the same
 * facts once more in English for everyone else. Thirteen translations of an
 * address would add nothing but places for it to go stale.
 */

import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';

/** The theme the app stored (`src/ui/theme.ts`), so this page opens in it too. */
const THEME = `<script>try{var t=localStorage.getItem('ui-theme');`
    + `if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>`;

/**
 * The address is drawn, not written _(his call, verbatim: „in the legal-notice
 * render the email as image to spammers do not find it that easy")_. Each
 * glyph of IBM Plex Sans becomes an SVG path at build time, so the shipped page
 * holds outlines and no text: a harvester reading the HTML finds no address,
 * no `@` and no `mailto:`. Inline rather than a separate file, so it takes
 * `currentColor` and follows the theme, and stays sharp at any zoom.
 *
 * The price is that it cannot be copied or read aloud. The label says what the
 * picture is without spelling it out, because a spelled-out label is text a
 * harvester reads just as well.
 */
const EMAIL = 'daniel.meyer@rxdb.info';
const FONT = fileURLToPath(new URL('../src/ui/fonts/ibm-plex-sans-latin.woff2', import.meta.url));

function emailImage(label) {
    const font = fontkit.openSync(FONT);
    const run = font.layout(EMAIL);
    const em = font.unitsPerEm;
    let x = 0;
    const paths = run.glyphs.map((glyph, i) => {
        const d = glyph.path.toSVG();
        const at = x + run.positions[i].xOffset;
        x += run.positions[i].xAdvance;
        return d ? `<path transform="translate(${at} 0)" d="${d}"/>` : '';
    }).join('');
    const top = font.ascent;
    const height = font.ascent - font.descent;
    return `<svg class="legal-email" role="img" aria-label="${label}"`
        + ` viewBox="0 ${-top} ${x} ${height}"`
        + ` style="width:${x / em}em;height:${height / em}em;vertical-align:${font.descent / em}em"`
        + ` fill="currentColor"><g transform="scale(1 -1)">${paths}</g></svg>`;
}

/** A function, so the font is only read when the build asks for the page. */
const body = () => `<div class="ui-shell">
  <main class="ui-main">
    <div class="ui-wrap narrow legal">
      <p class="legal-back"><a href="./">deshrimp</a></p>

      <h1 lang="de">Impressum</h1>
      <section lang="de">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>Daniel Meyer<br />Friedrichstraße 5<br />70174 Stuttgart<br />Deutschland</p>
        <h2>Kontakt</h2>
        <p>E-Mail: ${emailImage('E-Mail-Adresse als Bild')}</p>
        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>gemäß § 27a Umsatzsteuergesetz: DE357840955</p>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Daniel Meyer, Anschrift wie oben.</p>
      </section>

      <h2 lang="en" class="legal-lang">Legal notice</h2>
      <section lang="en">
        <p>deshrimp is run by Daniel Meyer, Friedrichstraße 5, 70174 Stuttgart,
        Germany. Email: ${emailImage('email address as an image')}. VAT ID: DE357840955.</p>
      </section>
    </div>
  </main>
</div>`;

/** The head this page gets in place of the one `seo.mjs` writes for the app. */
const head = (site) => [
    '<title>Impressum / Legal notice - deshrimp</title>',
    '<meta name="description" content="Who runs deshrimp: name, address, contact and VAT ID." />',
    `<link rel="canonical" href="${site}/legal-notice.html" />`,
    // Reachable, not a search result: nobody looks for a posture trainer by
    // its operator's street address.
    '<meta name="robots" content="noindex, follow" />',
    THEME,
].map((t) => `    ${t}`).join('\n');

/**
 * The page, out of the built shell (`index.html` after Vite, before `seo.mjs`
 * has put a head or prerendered copy into it). The module script and its
 * preloads go: the stylesheet link stays, and it is the only asset this page
 * needs. `site` is the origin out of `seo.json`, passed in rather than imported
 * because `seo.mjs` is the one importing this file.
 */
export function legalNotice(shell, site) {
    const html = shell
        .replace(/^\s*<script type="module"[^>]*><\/script>\n?/gm, '')
        .replace(/^\s*<link rel="modulepreload"[^>]*>\n?/gm, '')
        .replace('<html lang="en">', '<html lang="de">')
        .replace('</head>', `${head(site)}\n  </head>`)
        .replace('<div id="root"></div>', body());
    if (html.includes('type="module"')) {
        throw new Error('[legal] the bundle is still referenced from legal-notice.html');
    }
    if (!html.includes('rel="stylesheet"')) {
        throw new Error('[legal] legal-notice.html would have no stylesheet');
    }
    if (html.includes(EMAIL.split('@')[1]) || html.includes('mailto:')) {
        throw new Error('[legal] the email address is in legal-notice.html as text');
    }
    return html;
}

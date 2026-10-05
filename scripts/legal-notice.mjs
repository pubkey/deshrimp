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
 * The details are the ones published in the rxdb.info legal notice, because it
 * is the same person and the same sole proprietorship: the coworking address,
 * deliberately not the home one. Change them there and here together.
 *
 * Written in German, which is the language the obligation is in, with the same
 * facts once more in English for everyone else. Thirteen translations of an
 * address would add nothing but places for it to go stale.
 */

/** The theme the app stored (`src/ui/theme.ts`), so this page opens in it too. */
const THEME = `<script>try{var t=localStorage.getItem('ui-theme');`
    + `if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>`;

/** Plain text, not a `mailto:` - the address is written out for people to copy. */
const EMAIL = 'daniel.meyer&#64;rxdb.info';

const BODY = `<div class="ui-shell">
  <main class="ui-main">
    <div class="ui-wrap narrow legal">
      <p class="legal-back"><a href="./">deshrimp</a></p>

      <h1 lang="de">Impressum</h1>
      <section lang="de">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>Daniel Meyer<br />Friedrichstraße 13<br />70174 Stuttgart<br />Deutschland</p>
        <h2>Kontakt</h2>
        <p>E-Mail: ${EMAIL}</p>
        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>gemäß § 27a Umsatzsteuergesetz: DE357840955</p>
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Daniel Meyer, Anschrift wie oben.</p>
      </section>

      <h2 lang="en" class="legal-lang">Legal notice</h2>
      <section lang="en">
        <p>deshrimp is run by Daniel Meyer, Friedrichstraße 13, 70174 Stuttgart,
        Germany. Email: ${EMAIL}. VAT ID: DE357840955.</p>
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
        .replace('<div id="root"></div>', BODY);
    if (html.includes('type="module"')) {
        throw new Error('[legal] the bundle is still referenced from legal-notice.html');
    }
    if (!html.includes('rel="stylesheet"')) {
        throw new Error('[legal] legal-notice.html would have no stylesheet');
    }
    return html;
}

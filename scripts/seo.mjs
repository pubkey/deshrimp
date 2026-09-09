/**
 * The SEO half of the build: a `<head>` worth indexing, and content in `#root`
 * that a crawler can read without running the app.
 *
 * Why this exists rather than a server: the page's whole claim is that there is
 * no server, so rendering per request is off the table. And rendering `<App/>`
 * with `renderToString` would return nothing anyway — it sits inside
 * `<DatabaseGate>`, which shows its fallback until RxDB has opened, which never
 * happens outside a browser.
 *
 * So the crawlable copy is built straight from `data.json`, which is the same
 * source the app renders from (`App.tsx`: `written.intro`, `written.steps`,
 * `written.sources`). What a crawler reads and what a reader sees are the same
 * words, which is the only version of this that is honest.
 *
 * React replaces `#root` on mount, so the prerendered block is also the first
 * paint — real text instead of a blank page while the bundle parses.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => JSON.parse(readFileSync(resolve(here, '..', p), 'utf8'));

/**
 * The three strings live in `src/app/seo.json` because the app needs them too:
 * `Page` sets `document.title` on mount, so a crawler that runs the JS would
 * otherwise see the h1 instead of the title written here.
 */
export const { site: SITE, title: TITLE, description: DESCRIPTION } = read('src/app/seo.json');

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** `**bold**` is the only markup `data.json` uses in prose. */
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

function head() {
    const tags = [
        `<title>${esc(TITLE)}</title>`,
        `<meta name="description" content="${esc(DESCRIPTION)}" />`,
        `<link rel="canonical" href="${SITE}/" />`,

        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="deshrimp" />`,
        `<meta property="og:url" content="${SITE}/" />`,
        `<meta property="og:title" content="${esc(TITLE)}" />`,
        `<meta property="og:description" content="${esc(DESCRIPTION)}" />`,
        `<meta property="og:image" content="${SITE}/icon.svg" />`,
        `<meta property="og:locale" content="en" />`,

        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${esc(TITLE)}" />`,
        `<meta name="twitter:description" content="${esc(DESCRIPTION)}" />`,
        `<meta name="twitter:image" content="${SITE}/icon.svg" />`,

        // A free tool with no sign-up, said in the vocabulary a search engine
        // already has a field for.
        `<script type="application/ld+json">${JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'deshrimp',
            url: `${SITE}/`,
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Any browser',
            description: DESCRIPTION,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            isAccessibleForFree: true,
        })}</script>`,
    ];
    return tags.map((t) => `    ${t}`).join('\n');
}

function body() {
    const { en } = read('src/app/data.json');
    const steps = en.steps.map((s) => (
        `<section><h2>${esc(s.title)}</h2><p>${inline(s.text)}</p></section>`
    )).join('');
    const sources = en.sources.map((s) => (
        `<li><a href="${esc(s.url)}" rel="nofollow noopener">${esc(s.title)}</a> — ${inline(s.note)}</li>`
    )).join('');

    // `data-prerendered` is a marker for anyone wondering why #root is not
    // empty in the shipped HTML. React throws all of it away on mount.
    return `<div data-prerendered>`
        + `<h1>${esc(TITLE.split(' — ')[0])} — ${esc('Sit straight shrimp')}</h1>`
        + `<p>${inline(en.intro)}</p>`
        + steps
        + `<h2>Sources</h2><ul>${sources}</ul>`
        + `</div>`;
}

/** Rewrites `index.html` at build time. Dev is untouched — it needs no SEO. */
export default function seo() {
    return {
        name: 'deshrimp-seo',
        apply: 'build',
        transformIndexHtml: {
            order: 'post',
            handler: (html) => html
                // The page was noindex while it had no home. It has one now.
                .replace(/^\s*<meta name="robots"[^>]*>\n/m, '')
                .replace(/^\s*<title>.*<\/title>\n/m, '')
                .replace(/^\s*<meta name="description"[^>]*>\n/m, '')
                .replace('</head>', `${head()}\n  </head>`)
                .replace('<div id="root"></div>', `<div id="root">${body()}</div>`),
        },
    };
}

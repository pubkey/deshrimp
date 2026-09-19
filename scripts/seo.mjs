/**
 * The SEO half of the build: a `<head>` worth indexing, content in `#root`
 * that a crawler can read without running the app, and **one page per
 * language**.
 *
 * Why this exists rather than a server: the page's whole claim is that there is
 * no server, so rendering per request is off the table. And rendering `<App/>`
 * with `renderToString` would return nothing anyway - it sits inside
 * `<DatabaseGate>`, which shows its fallback until RxDB has opened, which never
 * happens outside a browser.
 *
 * So the crawlable copy is built straight from `data.json`, which is the same
 * source the app renders from (`App.tsx`: `written.intro`, `written.steps`).
 * What a crawler reads and what a reader sees are the same
 * words, which is the only version of this that is honest.
 *
 * React replaces `#root` on mount, so the prerendered block is also the first
 * paint - real text instead of a blank page while the bundle parses.
 *
 * ## One URL per language
 *
 * The thirteen translations used to live behind one URL and a browser setting,
 * which is the same as not having them: a crawler fetches a page once, in one
 * language, and indexes what it got. So the build now writes a page per
 * language next to the root one _(2026-09-19, his call, verbatim: „on the root
 * we serve the detected language but also we have apecific language pages like
 * en.html or de.html")_:
 *
 *     /            the detected language, and the sitemap's x-default
 *     /de.html     German, whatever the browser says
 *     /ja.html     Japanese, and eleven more like it
 *
 * They are the same bundle, not thirteen builds. Each file differs in four
 * things: the `<html lang>`, the head (title, description, canonical, Open
 * Graph, JSON-LD), the prerendered copy taken from that language's `data.json`
 * entry, and one line of script that sets `window.__APP_LANG__` before the
 * bundle runs, which is how the app knows to open in that language and to make
 * its language picker navigate rather than re-render (`src/app/lang-url.ts`).
 *
 * Every page lists every other as an `hreflang` alternate, so a search engine
 * treats the thirteen as one page in thirteen languages rather than as
 * thirteen competing ones; `sitemap.xml` says the same thing a second time,
 * the way Google's documentation asks for it, and `robots.txt` points at it.
 *
 * The pages are written in `closeBundle`, after Vite has written
 * `dist/index.html`: the root page is the transformed shell, and the other
 * thirteen are that same shell rendered again in another language, so the
 * hashed asset names cannot drift apart between them.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p) => JSON.parse(readFileSync(resolve(here, '..', p), 'utf8'));

/**
 * `src/app/seo.json` carries the site's origin and, per language, the two
 * sentences that are *about* the page rather than in it: what the tab says and
 * what a search result says under it. The app reads the same file (`Page` sets
 * `document.title` on mount, so a crawler that runs the JS would otherwise see
 * the h1 instead of the title written here) - see `src/app/lang-url.ts`.
 */
export const { site: SITE, langs: SEO } = read('src/app/seo.json');

const DATA = read('src/app/data.json');

/**
 * The languages that get a page of their own: the ones that have both the
 * written answer and a head to put above it. A language with only half of that
 * would publish an indexable URL promising a translation that does not exist,
 * so the build stops instead of shipping one.
 */
export const LANGS = Object.keys(DATA);

for (const lang of LANGS) {
    if (!SEO[lang]) throw new Error(`[seo] data.json has "${lang}", seo.json does not`);
}
for (const lang of Object.keys(SEO)) {
    if (!DATA[lang]) throw new Error(`[seo] seo.json has "${lang}", data.json does not`);
}

/** The page's own file name. The root page has none: it detects. */
const pageOf = (lang) => (lang ? `${lang}.html` : '');
const urlOf = (lang) => `${SITE}/${pageOf(lang)}`;

/**
 * `og:locale` wants a full locale, not a language. One region per language,
 * the most common reading rather than the only one - the same choices
 * `src/ui/lang.ts` makes for dates and numbers, written the way Open Graph
 * spells them.
 */
const OG_LOCALE = {
    de: 'de_DE', en: 'en_GB', es: 'es_ES', fr: 'fr_FR', it: 'it_IT', pt: 'pt_PT',
    nl: 'nl_NL', pl: 'pl_PL', tr: 'tr_TR', ru: 'ru_RU', zh: 'zh_CN', ja: 'ja_JP',
    ka: 'ka_GE',
};

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** `**bold**` is the only markup `data.json` uses in prose. */
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/**
 * Every language as an alternate, plus `x-default` for the root, which is the
 * page that detects. A set every page carries in full, itself included: that
 * is what `hreflang` asks for, and a page missing from its own set is the
 * usual reason a search engine ignores the whole group.
 */
function alternates() {
    return [
        ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlOf(l)}" />`),
        `<link rel="alternate" hreflang="x-default" href="${urlOf(null)}" />`,
    ];
}

/** The head for one page. `lang` is `null` on the root, which shows English. */
function head(lang) {
    const code = lang || 'en';
    const { title, description } = SEO[code];
    const url = urlOf(lang);

    const tags = [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}" />`,
        `<link rel="canonical" href="${url}" />`,
        ...alternates(),

        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="deshrimp" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        `<meta property="og:image" content="${SITE}/icon.svg" />`,
        `<meta property="og:locale" content="${OG_LOCALE[code] || code}" />`,

        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(description)}" />`,
        `<meta name="twitter:image" content="${SITE}/icon.svg" />`,

        // A free tool with no sign-up, said in the vocabulary a search engine
        // already has a field for.
        `<script type="application/ld+json">${JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'deshrimp',
            url,
            inLanguage: code,
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Any browser',
            description,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            isAccessibleForFree: true,
        })}</script>`,
    ];
    return tags.map((t) => `    ${t}`).join('\n');
}

/** The crawlable copy for one page, in that page's language. */
function body(lang) {
    const code = lang || 'en';
    const written = DATA[code];
    const steps = written.steps.map((s) => (
        `<section><h2>${esc(s.title)}</h2><p>${inline(s.text)}</p></section>`
    )).join('');
    // The sources list is gone from here _(2026-09-15, his call: remove the
    // sources section)_. It was the last place it was rendered - the app
    // stopped showing it when the closing meta block went - so this was a
    // crawler reading a section no reader could see. `data.json` keeps the
    // entries: they are the research behind the copy, and removing the section
    // is not the same as throwing out what it cited.

    // The h1 is the title sentence rather than the app's joke heading, in this
    // page's language: it is the one line above the copy, and „Sitz aufrecht du
    // Garnele!" on its own says nothing to someone reading a search result. The
    // app puts the joke back the moment it mounts, which is the same trade the
    // tab title has always made.

    // `data-prerendered` is a marker for anyone wondering why #root is not
    // empty in the shipped HTML. React throws all of it away on mount.
    return `<div data-prerendered>`
        + `<h1>${esc(SEO[code].title)}</h1>`
        + `<p>${inline(written.intro)}</p>`
        + steps
        + `</div>`;
}

/**
 * One page, built out of the shipped shell.
 *
 * `lang` is `null` for the root, which keeps `lang="en"` on the document and
 * sets no global, so the app's own detection decides. A named language gets
 * both, and the global goes in *before* the module script so it is set by the
 * time the bundle reads it.
 */
function render(shell, lang) {
    let html = shell
        .replace('</head>', `${head(lang)}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root">${body(lang)}</div>`);
    if (!lang) return html;
    return html
        .replace('<html lang="en">', `<html lang="${lang}">`)
        .replace(
            '<script type="module"',
            `<script>window.__APP_LANG__=${JSON.stringify(lang)}</script>\n    <script type="module"`,
        );
}

/**
 * The sitemap, with the alternates repeated per URL. Saying it here as well as
 * in the head is not redundancy for its own sake: Google reads the two
 * independently, and a sitemap is the only one of them a crawler sees before it
 * has fetched anything.
 */
function sitemap() {
    const today = new Date().toISOString().slice(0, 10);
    const links = [null, ...LANGS].map((l) => (
        `    <xhtml:link rel="alternate" hreflang="${l || 'x-default'}" href="${urlOf(l)}" />`
    ));
    const entry = (lang) => [
        '  <url>',
        `    <loc>${urlOf(lang)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        ...links,
        '  </url>',
    ].join('\n');
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...[null, ...LANGS].map(entry),
        '</urlset>',
        '',
    ].join('\n');
}

const robots = () => [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
    '',
].join('\n');

/**
 * Rewrites `index.html` at build time and writes the thirteen language pages
 * beside it. Dev is untouched - it needs no SEO, and `window.__APP_LANG__` is
 * absent there, so `npm run dev` is the detecting page it has always been.
 */
export default function seo() {
    let outDir = '';
    /** The built shell, minus the head this plugin owns. Captured once. */
    let shell = '';

    return {
        name: 'deshrimp-seo',
        apply: 'build',
        configResolved(config) {
            outDir = resolve(config.root, config.build.outDir);
        },
        transformIndexHtml: {
            order: 'post',
            handler: (html) => {
                shell = html
                    // The page was noindex while it had no home. It has one now.
                    .replace(/^\s*<meta name="robots"[^>]*>\n/m, '')
                    .replace(/^\s*<title>.*<\/title>\n/m, '')
                    .replace(/^\s*<meta name="description"[^>]*>\n/m, '');
                return render(shell, null);
            },
        },
        closeBundle() {
            if (!shell) throw new Error('[seo] index.html was never transformed');
            for (const lang of LANGS) {
                writeFileSync(join(outDir, pageOf(lang)), render(shell, lang));
            }
            writeFileSync(join(outDir, 'sitemap.xml'), sitemap());
            writeFileSync(join(outDir, 'robots.txt'), robots());
            console.log(`[seo] ${LANGS.length} language pages, sitemap.xml, robots.txt`);
        },
    };
}

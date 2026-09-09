/**
 * The entry point.
 *
 * Three things have to happen before the first render, and this is the only
 * place that knows about all three: the design tokens and the app's own CSS get
 * pulled into the bundle, the page payload is filled in from `data.json` plus
 * the app config, and the remembered theme is restored (inside `mount`) so the
 * page does not flash the wrong one.
 */

import './ui/theme.css';
import './app/styles.css';

import { mount, setPageData } from './ui';
import config from './app/app.config';
import written from './app/data.json';
import seo from './app/seo.json';
import App from './app/App';

setPageData({
    ...written,
    meta: {
        title: config.title,
        // The h1 stays the joke; the tab and the search result get the sentence
        // that says what this is. See `scripts/seo.mjs`.
        documentTitle: seo.title,
        subtitle: config.subtitle,
        task: config.task,
        source: config.source,
        generated: __BUILD_DATE__,
        generatedAt: __BUILD_TIME__,
    },
});

mount(App);

/**
 * The service worker, which is what makes the page installable — a manifest on
 * its own is not enough for Chromium to offer the prompt. It also means a page
 * that claims to need no server keeps working when there is none.
 *
 * Build only: `scripts/pwa.mjs` emits `sw.js` into the bundle, so in dev there
 * is nothing to register and nothing caching the file you just edited.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        void navigator.serviceWorker.register('./sw.js').catch(() => {
            /* A refused registration costs the offline cache, not the page. */
        });
    });
}

/**
 * # lang-url - the language a URL stands for
 *
 * ## What it does and how it looks
 * Nothing visible. It is the small amount of the app that knows the site is
 * served as **one page per language**: the root `/` detects, and `/de.html`,
 * `/ja.html` and the eleven others each force the language their name says.
 * `scripts/seo.mjs` builds those files at the end of every `vite build` and
 * writes `window.__APP_LANG__` into each one, right before the bundle runs.
 *
 * Why a URL per language at all: a crawler reads one page and indexes one
 * language, and the thirteen translations of this page were invisible while
 * they all lived behind the same URL and a browser setting. A shared link now
 * opens in the language it was shared in, which no amount of detection can do.
 *
 * ## Core parts
 * - `pageLang()` - the language this URL forces, or `undefined` at the root,
 *   in dev and in any build that has no such global. Only a code the app
 *   actually has copy for counts, so a hand-typed `?` global cannot put the
 *   page into a language it cannot render.
 * - `langHref(lang)` - where the picker goes: `./de.html`, relative, so it
 *   resolves the same from the root, from a PR preview subdirectory and from
 *   the file system (`base: './'` in `vite.config.ts`).
 * - `seoTitle(lang)` / `seoDescription(lang)` - the tab-and-search-result
 *   sentence in that language, out of `seo.json`. The prerendered head is
 *   built from the same two strings, so the tab does not change wording the
 *   moment React takes the page over.
 *
 * ## Examples
 * ```ts
 * const forced = pageLang();          // 'de' on /de.html, undefined on /
 * location.assign(langHref('ja'));    // the picker, on a forced page
 * ```
 *
 * ## Changelog
 * - 2026-09-19 First version, with the per-language pages themselves.
 */

import seo from './seo.json';
import type { Lang } from './i18n';

type SeoText = { title: string; description: string };

const LANGS = seo.langs as Record<string, SeoText>;

/**
 * The language this URL forces, if it forces one.
 *
 * Read from the global rather than from `location.pathname`: the page can be
 * served from a subdirectory (the PR previews) and the file that names the
 * language is also the file that sets the global, so there is one answer
 * instead of two that can disagree.
 */
export function pageLang(): Lang | undefined {
    const forced = typeof window === 'undefined' ? undefined : window.__APP_LANG__;
    return forced && Object.prototype.hasOwnProperty.call(LANGS, forced)
        ? (forced as Lang)
        : undefined;
}

/** The page that forces `lang`, relative to wherever this one is served from. */
export function langHref(lang: Lang): string {
    return `./${lang}.html`;
}

/** What the tab and a search result say, in `lang`. */
export function seoTitle(lang: Lang): string {
    return (LANGS[lang] || LANGS.en).title;
}

/** The sentence under it, in `lang`. */
export function seoDescription(lang: Lang): string {
    return (LANGS[lang] || LANGS.en).description;
}

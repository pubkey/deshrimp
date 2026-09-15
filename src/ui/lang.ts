/**
 * # lang - the language the page frame speaks
 *
 * ## What it does and how it looks
 * Nothing visible on its own. It holds one value - one of twelve language
 * codes - and the
 * frame components (`<ShareButton>`, `<ThemeToggle>`, `<Modal>`,
 * `<ConfirmButton>`) read their fixed labels out of it instead of hard-coding
 * German.
 *
 * **English is the default** _(2026-09-15, his call)_. It was German, from
 * when every page in this repo was; a page that never mentions a language now
 * renders English instead. A page that does name one sets `<Page lang>` and
 * the whole frame follows, so an English app never sits inside a German shell
 * with „Teilen" and „Sicher?" around an English answer, and a German one does
 * not sit inside an English shell either.
 *
 * ## Core parts
 * - `setUiLang(lang)` - `<Page>` calls this while rendering, before its subtree
 *   renders. A module-level value rather than a context because half of these
 *   components are also used standalone, outside any `<Page>`.
 * - `uiLang()` - the current value, read at render time.
 * - `uiText()` - the label set for the current language.
 * - `preferredUiLang()` - what to start in when nothing is stored: the
 *   browser's language if the page has it, English otherwise.
 *
 * This is deliberately **not** a general translation system. It covers the
 * fixed furniture of the page frame and nothing else; the content of a page is
 * written in the language it is written in, by whoever writes it.
 *
 * ## Examples
 * ```tsx
 * <Page lang="en" title="Sit straight shrimp">…</Page>
 * const t = uiText();   // inside a frame component
 * ```
 *
 * ## Changelog
 * - 2026-09-15 English is the default rather than German, and heads the
 *   picker. Browser detection is unchanged: a German browser still gets
 *   German, because that is a match rather than a fallback.
 * - 2026-09-15 The labels of the „Zu dieser Seite" block left with it: the
 *   meta, task, gaps, severity and sources words are gone from all twelve
 *   tables. What remains is what the top bar and the dialogs still say.
 * - 2026-09-08 Ten more languages, and the tables moved to `lang-text.ts` -
 *   twelve of them inline made this file's own logic hard to find. No RTL
 *   language yet; that needs `dir` support the frame does not have.
 * - 2026-09-08 `preferredUiLang()`, so a first visit lands in the browser's
 *   language instead of always German. Falls back to English.
 * - 2026-09-08 First version, so `app-haltung` can be switched to English.
 */

/**
 * The languages the frame speaks. **Twelve since 2026-09-08** („add 10 more
 * languages"): the two it started with plus the ten below, chosen for reach -
 * the most widely read languages a page like this lands in front of.
 *
 * **No right-to-left language is in here yet**, and that is deliberate rather
 * than an oversight. Arabic, Hebrew, Persian and Urdu need `dir="rtl"` on the
 * document and a layout that mirrors with it; the frame has neither, so adding
 * the words alone would ship a page that reads backwards. It is a real gap, not
 * a ranking of languages.
 */
export type UiLang =
    | 'de' | 'en' | 'es' | 'fr' | 'it' | 'pt'
    | 'nl' | 'pl' | 'tr' | 'ru' | 'zh' | 'ja';

/** Every language, in the order a picker should list them. */
export const UI_LANGS: UiLang[] =
    ['en', 'de', 'es', 'fr', 'it', 'pt', 'nl', 'pl', 'tr', 'ru', 'zh', 'ja'];

import { TEXT } from './lang-text';

export type UiText = {
    share: string;
    themeLight: string;
    themeDark: string;
    confirmTitle: string;
    confirmYes: string;
    confirmNo: string;
    close: string;
    shareTitle: string;
    copyLink: string;
    linkCopied: string;
    copyFailed: string;
    shareLocalFile: string;
    shareTooLongForQr: string;
    shareLinkIsTheLock: string;
    shareNative: string;
    shareFailed: string;
    copyUnsupported: string;
    scanWithPhone: string;
    checkedToday: (days: number) => string;
    checkedDaysAgo: (days: number) => string;
    /* Words the components put on a page themselves, rather than taking from it. */
    asOf: string;
    why: string;
    criterion: string;
    must: string;
    out: string;
    mustFailed: string;
    more: string;
    nothingFound: string;
    noEntries: string;
    noCoordinates: string;
    mapSketch: string;
    pickOnMap: string;
    latitude: string;
    longitude: string;
    openInMaps: string;
    qrTooLong: string;
    qrFor: (value: string) => string;
    ingredients: string;
    method: string;
    recipeImageMissing: string;
    toShop: string;
    owned: string;
    topPick: string;
    perNight: string;
    nights: (n: number) => string;
    playerLoading: string;
    checkedAgainstOriginal: string;
    notChecked: string;
    /* The data-sync modal (`<DataSyncButton>` in the app-builder). */
    syncTitle: string;
    syncIntro: string;
    syncFileTitle: string;
    syncFileNote: string;
    syncExport: string;
    syncImport: string;
    syncImported: (rows: number) => string;
    syncCloudTitle: string;
    syncGoogleTitle: string;
    syncOneDriveTitle: string;
    syncCloudNote: string;
    syncConnect: string;
    syncDisconnect: string;
    syncConnected: string;
    syncNeedsClientId: string;
    syncP2PTitle: string;
    syncP2PNote: string;
    syncCode: string;
    syncJoinCode: string;
    syncJoinHint: string;
    syncClientIdLabel: string;
    syncSaveAndConnect: string;
    syncNewCode: string;
    syncCopy: string;
    syncCopied: string;
    syncStart: string;
    syncStop: string;
    syncBothOpen: string;
    syncFailed: (reason: string) => string;
};

/**
 * Which language to start in when nothing has been chosen yet.
 *
 * The order is **stored choice → browser language → German**, and this function
 * is only the middle step: a page calls it as the *fallback* for a setting it
 * has not got, never as an override for one it has. Detection that outranks a
 * stored choice is a bug, because the one thing worse than a page in the wrong
 * language is a page that will not stay in the right one.
 *
 * **English is the last resort** _(2026-09-08, his call after weighing German)_.
 * That only applies to a browser whose languages this page does not offer - a
 * German browser still gets German, because that is a match, not a fallback.
 * What is left is someone whose browser says French, or says nothing at all,
 * and for them English is the better guess than German.
 *
 * It is also the frame's own default _(2026-09-15, his call: the default
 * language must be English)_. `current` below starts at English, so a page
 * that never calls `setUiLang` is English rather than German.
 *
 * `navigator.languages` is read in order, so a browser set to
 * `['en-GB', 'de']` gets English. Tags are matched on their primary subtag -
 * `en-GB`, `en-US` and `en` are all English - because a page here is not
 * translated per region.
 */
export function preferredUiLang(available?: UiLang[]): UiLang {
    const offered = (available && available.length ? available : UI_LANGS)
        .filter((l) => UI_LANGS.indexOf(l) >= 0);
    const lastResort = (): UiLang =>
        (offered.indexOf('en') >= 0 ? 'en' : offered[0]);

    if (!offered.length) return 'en';
    if (typeof navigator === 'undefined') return lastResort();

    const nav = navigator as Navigator & { languages?: readonly string[] };
    const tags = (nav.languages && nav.languages.length ? nav.languages : [nav.language])
        .filter(Boolean) as string[];

    for (const tag of tags) {
        const primary = String(tag).toLowerCase().split('-')[0];
        for (const l of offered) if (l === primary) return l;
    }
    return lastResort();
}

let current: UiLang = 'en';

export function setUiLang(lang: UiLang | undefined): void {
    if (lang && UI_LANGS.indexOf(lang) >= 0) current = lang;
}

export function uiLang(): UiLang {
    return current;
}

export function uiText(): UiText {
    return TEXT[current] || TEXT.en;
}

/**
 * The locale the frame formats dates and numbers with.
 *
 * One region per language, picked as the most common reading rather than the
 * only one - `pt-PT` over `pt-BR`, `zh-CN` over `zh-TW`. It decides date order
 * and decimal separators, nothing that changes a word.
 */
const LOCALE: Record<UiLang, string> = {
    de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', pt: 'pt-PT',
    nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP',
};

export function uiLocale(): string {
    return LOCALE[current] || LOCALE.en;
}

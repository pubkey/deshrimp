/// <reference types="vite/client" />

/** Stamped in by `vite.config.ts` so the page can show when it was built. */
declare const __BUILD_DATE__: string;
declare const __BUILD_TIME__: string;

/**
 * The language a per-language page forces, written into `de.html`, `ja.html`
 * and the eleven others by `scripts/seo.mjs`. Absent on the root page, which
 * detects, and in dev, which has no such files. Read through `pageLang()` in
 * `src/app/lang-url.ts` rather than directly.
 */
interface Window {
    __APP_LANG__?: string;
}

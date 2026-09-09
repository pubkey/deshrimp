/**
 * The page's payload and the mount call — the two things that are about the
 * *page* rather than about any component in it.
 *
 * The payload used to arrive as a `PAGE_DATA` global that the page generator
 * wrote into the document. Here it is an ordinary import: `main.tsx` reads
 * `data.json` and the app config and calls `setPageData` before mounting. Same
 * shape, one less thing that only works inside one particular build.
 */

import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { applyTheme, readTheme } from './theme';

export type PageMeta = {
    title: string;
    subtitle?: string;
    /** The request this page answers, verbatim. */
    task?: string;
    taskLabel?: string;
    source?: string;
    /** ISO build date, `2026-09-01`. */
    generated?: string;
    /** The full moment of the build with its offset, `2026-09-01T10:47:12+02:00`. */
    generatedAt?: string;
};

/**
 * The researched answer plus its `meta` block. Always an object, never
 * `undefined`, so `PAGE.foo` is safe even before `setPageData` has run.
 */
export const PAGE: Record<string, any> = {};

/** Fill `PAGE` in. Call this once, before the first render. */
export function setPageData(data: Record<string, any>): void {
    Object.assign(PAGE, data);
}

/**
 * The answer the page shows, typed. It never changes at runtime — anything the
 * reader produces by using the page goes into RxDB instead (`src/lib/db.ts`).
 *
 *     type Data = { intro: string };
 *     const { intro, meta } = pageData<Data>();
 */
export function pageData<T = Record<string, any>>(): T & { meta: PageMeta } {
    return PAGE as T & { meta: PageMeta };
}

/**
 * Render `App` into `#root`, restoring the remembered theme first so the page
 * does not flash the wrong one.
 */
export function mount(App: (props: any) => any, el?: Element | null): void {
    const root = el || document.getElementById('root') || document.body;
    const stored = readTheme();
    if (stored) applyTheme(stored);
    createRoot(root as Element).render(createElement(App, { data: PAGE }));
}

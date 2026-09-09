/**
 * Light and dark, in three states — the same three the CSS knows:
 * no attribute at all means follow the system, `data-theme="light"` and
 * `data-theme="dark"` are an explicit choice, remembered per page.
 *
 * Every read and write is wrapped: in a private window `localStorage` throws on
 * access, and a page that cannot remember a preference must still render.
 */

const THEME_KEY = 'ui-theme';

export type Theme = 'light' | 'dark' | '';

export function readTheme(): Theme {
    try { return (localStorage.getItem(THEME_KEY) as Theme) || ''; } catch { return ''; }
}

export function applyTheme(v: Theme): void {
    if (v) document.documentElement.setAttribute('data-theme', v);
    else document.documentElement.removeAttribute('data-theme');
    try {
        if (v) localStorage.setItem(THEME_KEY, v);
        else localStorage.removeItem(THEME_KEY);
    } catch { /* private mode: the choice just does not persist */ }
}

export function systemIsDark(): boolean {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

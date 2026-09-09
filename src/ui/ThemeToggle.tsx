/**
 * # ThemeToggle — sun and moon, top right
 *
 * ## What it does and how it looks
 * One icon button that flips the page between light and dark and remembers the
 * choice. `<Page>` puts it in the header; a page never places it itself.
 *
 * The state has three values, not two — no choice at all means „follow the
 * system", which is what a page shows before anyone has pressed anything. The
 * button reads the system preference to decide which icon to show, so the first
 * press always goes to the *other* theme rather than to whatever the toggle
 * happened to think.
 *
 * ## Core parts
 * - `readTheme()` / `applyTheme()` from `theme.ts` — the stored choice, written
 *   to `localStorage` and to `data-theme` on the root element.
 * - `systemIsDark()` — what „no choice" currently resolves to.
 *
 * ## Examples
 * ```tsx
 * <ThemeToggle />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 */

import { useState } from 'react';
import { applyTheme, readTheme, systemIsDark } from './theme';
import { uiText } from './lang';

export function ThemeToggle() {
    const [v, set] = useState(readTheme());
    const dark = v ? v === 'dark' : systemIsDark();
    const t = uiText();
    const label = dark ? t.themeLight : t.themeDark;

    return (
        <button
            className="ui-iconbtn"
            title={label}
            aria-label={label}
            onClick={() => { const next = dark ? 'light' : 'dark'; applyTheme(next); set(next); }}
        >
            {dark ? '☀' : '☾'}
        </button>
    );
}

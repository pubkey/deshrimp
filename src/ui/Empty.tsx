/**
 * # Empty — nothing here, said properly
 *
 * ## What it does and how it looks
 * A centred, quiet block for a list with no entries: a heading, and a line
 * underneath saying why it is empty or what to do about it. It replaces the
 * failure mode it is named after — a blank area where the reader cannot tell
 * whether there is nothing, or whether the page is broken.
 *
 * ## Core parts
 * - `title` — default „Nichts gefunden". Say what is missing when you can.
 * - `hint` — the line underneath: the reason, or the next step.
 * - `children` — room for a button, when there is something to press.
 *
 * ## Examples
 * ```tsx
 * <Empty title="Noch keine Notizen" hint="Bleibt auf diesem Gerät." />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 */

import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export type EmptyProps = Base & { title?: ReactNode; hint?: ReactNode };

export function Empty({ title, hint, children }: EmptyProps) {
    return (
        <div className="ui-empty">
            <div className="ui-h4">{title || uiText().nothingFound}</div>
            {hint ? <p className="ui-text ui-muted" style={{ margin: '6px auto 0' }}>{hint}</p> : null}
            {children}
        </div>
    );
}

/**
 * # TaskBox — his request, word for word
 *
 * ## What it does and how it looks
 * A small bordered box under the page title with the bold word „Aufgabe" and
 * then, verbatim, what he actually asked for.
 *
 * `PAGE-SPEC.md` makes it mandatory, and the reason is not decoration: months
 * later a published page is a link with no context, and the one thing that
 * makes it legible again is the question it was an answer to. Quote him —
 * never a cleaned-up version, never a summary.
 *
 * `<Page>` renders one from `PAGE_DATA.meta.task`; a page places this itself
 * only in unusual layouts.
 *
 * ## Core parts
 * - `children` — the request. Empty renders nothing rather than an empty box.
 * - `label` — default „Aufgabe". `false` drops it: inside `<PageMeta>` the tab
 *   above the box already says „Aufgabe", and saying it twice in 40 px is
 *   noise.
 *
 * ## Examples
 * ```tsx
 * <TaskBox>such mir weiße Sneaker unter 300 €</TaskBox>
 * ```
 *
 * ## Changelog
 * - 2026-09-01 `label={false}` for the tabbed `<PageMeta>`.
 * - 2026-08-31 Own file.
 */

import type { ReactNode } from './_types';

export type TaskBoxProps = { label?: ReactNode | false; children?: ReactNode };

export function TaskBox({ label, children }: TaskBoxProps) {
    if (!children) return null;
    return (
        <div className="ui-taskbox">
            {label === false ? null : <b>{label || 'Aufgabe'}</b>}
            <div className="ui-taskbody">{children}</div>
        </div>
    );
}

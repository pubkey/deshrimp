/**
 * # PageHeader — eyebrow, title, subtitle
 *
 * ## What it does and how it looks
 * The centred block at the top of every page: a small optional eyebrow, the
 * single `h1`, and a subtitle line. Nothing else — the header says what the
 * answer *is*, and the first thing under it is the answer itself.
 *
 * This is where the page's **one** `h1` lives (`PAGE-SPEC.md`). `<Page>`
 * renders it; a page body should never contain a second one.
 *
 * ## Core parts
 * - `title` — the `h1`.
 * - `subtitle` — one line: how many options, what budget, which constraint.
 * - `eyebrow` — a category above the title.
 * - the task box is **not** here any more: it moved into `<PageMeta>` at the
 *   foot of the page, with the rest of the meta information.
 *
 * ## Examples
 * ```tsx
 * <PageHeader title="Weiße Ledersneaker" subtitle="5 Optionen · Budget €150–300" />
 * ```
 *
 * ## Changelog
 * - 2026-09-01 The `<TaskBox>` moved out, into `<PageMeta>`.
 * - 2026-08-31 Own file.
 */

import type { ReactNode } from './_types';

export type PageHeaderProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    eyebrow?: ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow }: PageHeaderProps) {
    return (
        <header className="ui-header">
            {eyebrow ? <div className="ui-eyebrow">{eyebrow}</div> : null}
            <h1 className="ui-h1">{title}</h1>
            {subtitle ? <p className="ui-sub">{subtitle}</p> : null}
        </header>
    );
}

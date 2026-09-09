/**
 * # Panel — one thing, on its own surface
 *
 * ## What it does and how it looks
 * A raised card with a hairline border, a soft shadow and a heading row: an
 * `h4` on the left, anything you like on the right (a price, a badge, a
 * button). It is the workhorse of every page here — an option, a hotel, a
 * recipe, a day of a plan is a panel.
 *
 * ## Core parts
 * - `title` / `aside` — the heading row. With neither, the row is not rendered.
 * - `tone="rec"` — the gold „our pick" treatment. One per page, or it stops
 *   meaning anything.
 * - `flat` / `sunk` — no shadow, or an inset well instead of a raised card.
 * - `pad` — a smaller or larger inside than the default.
 *
 * ## Examples
 * ```tsx
 * <Panel title={option.name} aside={<Price value={option.price} />}>…</Panel>
 * <Panel tone="rec" title="Empfehlung">…</Panel>
 * <Panel sunk pad="sm" title="Laden">…</Panel>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type PanelProps = Base & {
    title?: ReactNode;
    /** Right-hand side of the heading row: a price, a badge, a button. */
    aside?: ReactNode;
    /** `"rec"` is the gold „our pick" treatment. */
    tone?: 'rec' | 'accent';
    flat?: boolean;
    sunk?: boolean;
    pad?: 0 | 'sm' | 'lg';
};

export function Panel(
    { title, aside, tone, flat, sunk, pad, className, children, style, id }: PanelProps,
) {
    return (
        <div id={id} style={style}
            className={cx('ui-panel', pad && 'pad-' + pad, flat && 'flat', sunk && 'sunk',
                tone, className)}>
            {(title || aside) ? (
                <div className="ui-panel-head">
                    {title ? <h3 className="ui-h4">{title}</h3> : null}
                    {aside}
                </div>
            ) : null}
            {children}
        </div>
    );
}

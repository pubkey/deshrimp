/**
 * # Card — a surface that reacts to the pointer
 *
 * ## What it does and how it looks
 * A raised surface like `<Panel>`, but without a heading row and with a lift on
 * hover. Use it where the whole block is one clickable thing; use `<Panel>`
 * where the block has a title and content.
 *
 * ## Core parts
 * - `lift` — the hover rise, on by default. `false` for a card that is not
 *   interactive, because a surface that moves under the pointer and then does
 *   nothing is a promise the page does not keep.
 *
 * ## Examples
 * ```tsx
 * <Card>…</Card>
 * <Card lift={false}>…</Card>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type CardProps = Base & { lift?: boolean };

export function Card({ lift, className, children, style, id }: CardProps) {
    return (
        <div id={id} style={style}
            className={cx('ui-card', lift !== false && 'ui-lift', className)}>
            {children}
        </div>
    );
}

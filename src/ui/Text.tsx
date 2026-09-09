/**
 * # Text — a paragraph
 *
 * ## What it does and how it looks
 * One paragraph at body size and the sheet's line height. The default text
 * element of every page; anything longer than a line belongs in one.
 *
 * ## Core parts
 * - `muted` — secondary colour, for a line that supports the one above it.
 * - `small` — one step down, for metadata rather than prose.
 * - for researched copy with bold or links, use `<Markdown>` instead: this
 *   renders its children verbatim and does not parse anything.
 *
 * ## Examples
 * ```tsx
 * <Text>Zwei Sätze zur Sache.</Text>
 * <Text small muted>210 km · 2:20 h</Text>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type TextProps = Base & { muted?: boolean; small?: boolean };

export function Text({ muted, small, className, children, style, id }: TextProps) {
    return (
        <p id={id} style={style}
            className={cx('ui-text', muted && 'ui-muted', small && 'ui-small', className)}>
            {children}
        </p>
    );
}

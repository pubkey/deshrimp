/**
 * # Mono — code, inline
 *
 * ## What it does and how it looks
 * A `<code>` element in the monospace stack at a slightly smaller size, for a
 * file name, a prop, a command — anything the reader might type. Inline only;
 * there is no block variant, because a generated page that needs a code block
 * is usually a page that should have shown the result instead.
 *
 * ## Core parts
 * - `children` — the literal text.
 *
 * ## Examples
 * ```tsx
 * <Text>Liegt in <Mono>travel/hotels.md</Mono>.</Text>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type MonoProps = Base;

export function Mono({ className, children, style, id }: MonoProps) {
    return <code id={id} style={style} className={cx('ui-mono', className)}>{children}</code>;
}

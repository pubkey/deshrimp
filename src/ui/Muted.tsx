/**
 * # Muted — quieter text, inline
 *
 * ## What it does and how it looks
 * A `<span>` in the secondary ink colour, for a fragment inside a line: a
 * count, a unit, an aside after a name. Inline, so it sits *within* a sentence
 * — the block-level version is `<Text muted>`.
 *
 * ## Core parts
 * - just `children`, in `--muted`.
 *
 * ## Examples
 * ```tsx
 * <span>{name} <Muted>· {qty}</Muted></span>
 * <Muted>{done} von {total} erledigt</Muted>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type MutedProps = Base;

export function Muted({ className, children, style, id }: MutedProps) {
    return <span id={id} style={style} className={cx('ui-muted', className)}>{children}</span>;
}

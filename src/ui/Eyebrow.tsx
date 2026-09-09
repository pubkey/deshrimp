/**
 * # Eyebrow — the small label above something
 *
 * ## What it does and how it looks
 * A short line in uppercase, letter-spaced, muted and small: the category above
 * a title, the word „Aufgabe" above the task box. It is a signpost, not a
 * heading — it takes no place in the document outline and should be one or two
 * words.
 *
 * ## Core parts
 * - `children` — keep it short. The tracking that makes it look right is what
 *   makes a long one unreadable.
 *
 * ## Examples
 * ```tsx
 * <Eyebrow>Design-System</Eyebrow>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type EyebrowProps = Base;

export function Eyebrow({ className, children, style, id }: EyebrowProps) {
    return <div id={id} style={style} className={cx('ui-eyebrow', className)}>{children}</div>;
}

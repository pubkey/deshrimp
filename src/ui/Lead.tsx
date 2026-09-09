/**
 * # Lead — the opening paragraph
 *
 * ## What it does and how it looks
 * A paragraph one step larger than body text, for the sentence that opens a
 * page or a section. Larger, slightly looser, still the ink colour — not a
 * heading, just the line the eye lands on first.
 *
 * ## Core parts
 * - nothing but `children`. One size, so „the intro" looks the same everywhere.
 *
 * ## Examples
 * ```tsx
 * <Lead>Fünf Optionen, alle in deiner Weite und unter 300 €.</Lead>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type LeadProps = Base;

export function Lead({ className, children, style, id }: LeadProps) {
    return <p id={id} style={style} className={cx('ui-lead', className)}>{children}</p>;
}

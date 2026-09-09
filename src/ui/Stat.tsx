/**
 * # Stat — one number, made large
 *
 * ## What it does and how it looks
 * A small label with a big value under it, and optionally a quieter line of
 * context below that: „2.480 kcal · Tagesziel", „€1.284 · Gesamt". For the one
 * or two figures a page is actually about.
 *
 * ## Core parts
 * - `label` — what the number is. Above the number, small.
 * - `value` — the number itself, at display size.
 * - `hint` — the line underneath: what it is measured against, or since when.
 * - `delta` + `deltaTone` — the change against a named period. The tone is set
 *   by the caller and not derived from the sign, because on a page like the
 *   posture dashboard „+3°" is worse and „+3 %" is better.
 * - `size="hero"` — the one big number a dashboard leads with. Exactly one per
 *   view; a second hero is two heroes, which is none.
 *
 * ## Examples
 * ```tsx
 * <Stat label="Tagesziel" value="2.480 kcal" hint="Mifflin-St Jeor, PAL 1,55" />
 * <Stat size="hero" label="Kopf vor der Schulter" value="12°"
 *     delta="−3° gegen gestern" deltaTone="up" />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 `delta`, `deltaTone` and `size="hero"`, so a dashboard can lead
 *   with one number and put a change under the rest.
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { ReactNode } from './_types';

export type StatProps = {
    label?: ReactNode;
    value?: ReactNode;
    hint?: ReactNode;
    /** The change, already formatted: „+4 Pkt.", „−2°". Shown under the value. */
    delta?: ReactNode;
    /**
     * Whether that change is good news. Set it explicitly — for half the
     * numbers on a page, up is the bad direction, so it cannot be read off the
     * sign. `"flat"` (or omitting it) prints the delta in muted ink.
     */
    deltaTone?: 'up' | 'down' | 'flat';
    /** `"hero"` is the single number the view leads with. One per view. */
    size?: 'hero';
    className?: string;
};

export function Stat({ label, value, hint, delta, deltaTone, size, className }: StatProps) {
    return (
        <div className={cx('ui-fact ui-stat', size, className)}>
            <span className="k">{label}</span>
            <span className="v">{value}</span>
            {delta != null
                ? <div className={cx('ui-stat-delta', deltaTone || 'flat')}>{delta}</div>
                : null}
            {hint ? <div className="ui-small ui-muted">{hint}</div> : null}
        </div>
    );
}

/**
 * # Distance — how far, and how long
 *
 * ## What it does and how it looks
 * A small inline chip with a target or arrow glyph: „⌖ 850 m", „→ 210 km ·
 * 2:20 h vom Hotel". Used in listing meta lines and on route legs.
 *
 * A number is formatted so it reads the way a person would say it: **under a
 * kilometre it switches to metres**, because „0,8 km" is a machine talking.
 *
 * ## Core parts
 * - `value` — kilometres as a number, or a ready string for a source that has
 *   its own wording.
 * - `duration` — appended after a middot.
 * - `of` — what it is measured from („vom Zentrum").
 * - `icon` — default `⌖`; `→` reads better on a route leg.
 *
 * ## Examples
 * ```tsx
 * <Distance value={0.85} of="vom Zentrum" />      // ⌖ 850 m vom Zentrum
 * <Distance value={210} duration="2:20 h" icon="→" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import type { ReactNode } from './_types';

export type DistanceProps = {
    /** Kilometres as a number, or a ready-made string. */
    value?: number | string;
    duration?: ReactNode;
    /** What it is measured from. */
    of?: ReactNode;
    icon?: string;
};

export function Distance({ value, duration, of, icon }: DistanceProps) {
    if (value == null && !duration) return null;
    const d = typeof value === 'number'
        ? (value < 1
            ? Math.round(value * 1000) + ' m'
            : value.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' km')
        : value;
    return (
        <span className="ui-distance">
            <span aria-hidden="true">{icon || '⌖'}</span>
            {' '}{d}
            {duration ? <> · {duration}</> : null}
            {of ? <> {of}</> : null}
        </span>
    );
}

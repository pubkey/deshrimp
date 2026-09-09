/**
 * # AsOf — the date an angabe was true
 *
 * ## What it does and how it looks
 * A small muted chip: „STAND 30.08.2026". When the date is older than
 * `staleAfter` days it turns amber and grows a „veraltet" box beside it. The
 * tooltip says where the figure came from and how many days ago it was checked.
 *
 * Prices, opening hours and availability rot. A figure without a date silently
 * claims to be current forever, which is the quiet way a page starts lying.
 *
 * ## Core parts
 * - `date` — ISO, `2026-08-30`. Rendered German, `30.08.2026`.
 * - `staleAfter` — days. Turns „old" into something the page says out loud.
 * - `stale` — force the flag on or off when the page knows better.
 * - `source` — shown in the tooltip, e.g. `"booking.com"`.
 *
 * ## Examples
 * ```tsx
 * <AsOf date="2026-08-30" source="booking.com" />
 * <AsOf date="2025-01-04" staleAfter={180} />       // → „veraltet"
 * <AsOf date={src.checked} label="geprüft" />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version; 29 SKILL.md passages ask for a dated figure.
 */

import { cx } from './cx';
import { daysSince, deDate } from './dates';
import type { Base } from './_types';
import { uiText } from './lang';

export type AsOfProps = Base & {
    /** ISO date, `2026-08-30`. */
    date: string;
    /** Default „Stand". */
    label?: string;
    /** Named in the tooltip. */
    source?: string;
    /** Older than this many days renders a visible „veraltet". */
    staleAfter?: number;
    /** Force the flag instead of computing it. */
    stale?: boolean;
};

export function AsOf({ date, label, source, staleAfter, stale, className }: AsOfProps) {
    if (!date) return null;
    const age = daysSince(date);
    const isStale = stale != null
        ? !!stale
        : !!(staleAfter && age != null && age > staleAfter);
    const title = [
        source ? 'Quelle: ' + source : null,
        age != null ? (age === 0 ? uiText().checkedToday(0) : uiText().checkedDaysAgo(age)) : null,
    ].filter(Boolean).join(' · ') || undefined;

    return (
        <span className={cx('ui-asof', isStale && 'is-stale', className)} title={title}>
            <span className="ui-asof-label">{label || uiText().asOf}</span>
            <time dateTime={date}>{deDate(date)}</time>
            {isStale ? <span className="ui-asof-flag">veraltet</span> : null}
        </span>
    );
}

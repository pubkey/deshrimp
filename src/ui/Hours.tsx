/**
 * # Hours — opening hours, and whether it is open right now
 *
 * ## What it does and how it looks
 * A green „jetzt offen · bis 23:00" or a red „geschlossen · öffnet Di 12:00",
 * and under it the week as a small two-column list with today highlighted.
 * A „Stand" chip sits beside the status when the hours carry a check date.
 *
 * The status line is the whole reason this exists. **Eight passages across the
 * skills ask for opening hours**, and a rendered table cannot answer the only
 * question anyone actually has, which is whether to go now.
 *
 * ## Core parts
 * - `hours` — `{ mo, di, mi, do, fr, sa, so }`. A value is a string
 *   (`'09:00–18:00'`, several spans separated by a comma); anything falsy, or
 *   `'geschlossen'`, means closed.
 * - spans may cross midnight (`'19:00–00:30'`), and the status check walks
 *   yesterday as well, so at 00:15 the kitchen is still open.
 * - equal consecutive days collapse into „Mo–Fr", which is how a sign reads.
 * - `checked` + `staleAfter` (default 180 days) flag hours nobody has looked at
 *   in half a year.
 * - `compact` drops the week, `status={false}` drops the line, `now` freezes
 *   the clock for a screenshot or a test.
 * - `hoursStatus(hours, now)` is exported: the computation without the markup.
 *
 * ## Examples
 * ```tsx
 * <Hours checked="2026-08-30" note="Montag Ruhetag." hours={{
 *   mo: null, di: '12:00–15:00, 19:00–23:00', fr: '12:00–15:00, 19:00–00:30',
 *   sa: '19:00–00:30', so: '12:00–16:00',
 * }} />
 * <Hours compact hours={shop.hours} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version. Checked against the real clock: a Sunday at
 *   16:49, a kitchen open Sundays until 16:00 and closed Mondays, correctly
 *   reads „geschlossen · öffnet Di 12:00".
 */

import { useMemo } from 'react';
import { cx } from './cx';
import { AsOf } from './AsOf';
import { inline } from './_inline';
import type { Base } from './_types';

export const DAY_KEYS = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'] as const;
export type DayKey = typeof DAY_KEYS[number];

const DAY_LABELS: Record<DayKey, string> = {
    mo: 'Mo', di: 'Di', mi: 'Mi', do: 'Do', fr: 'Fr', sa: 'Sa', so: 'So',
};

export type WeekHours = Partial<Record<DayKey, string | null>>;

function parseClock(s: string): number | null {
    const m = /^(\d{1,2})(?:[:.](\d{2}))?$/.exec(String(s).trim());
    if (!m) return null;
    const h = +m[1];
    const min = m[2] ? +m[2] : 0;
    if (h > 24 || min > 59) return null;
    return h * 60 + min;
}

/** `'09:00–13:00, 15:00-18:00'` → `[[540, 780], [900, 1080]]`. */
function parseDay(value: string | null | undefined): [number, number][] {
    if (!value) return [];
    const s = String(value).trim().toLowerCase();
    if (!s || s === 'geschlossen' || s === 'closed' || s === 'zu' || s === '-') return [];
    return String(value).split(/\s*[,;]\s*|\s+und\s+/).map((part) => {
        const bits = part.split(/\s*(?:–|—|-|bis)\s*/);
        if (bits.length !== 2) return null;
        const a = parseClock(bits[0]);
        const b = parseClock(bits[1]);
        return (a == null || b == null) ? null : [a, b] as [number, number];
    }).filter(Boolean) as [number, number][];
}

function fmtClock(min: number): string {
    const h = Math.floor((min % 1440) / 60);
    const m = min % 60;
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

/** Monday = 0, matching `DAY_KEYS`. */
function weekIndex(date: Date): number { return (date.getDay() + 6) % 7; }

export type HoursStatus = {
    open: boolean;
    /** When it closes, if open now. */
    until?: string;
    /** When it opens next, if closed. */
    next?: string;
    nextDay?: DayKey | null;
    today?: boolean;
};

/**
 * Open right now? Walks today and — for a span that crosses midnight —
 * yesterday too. Returns what the chip needs rather than a boolean: „closed" is
 * only useful together with „opens Tue 09:00".
 */
export function hoursStatus(hours: WeekHours, now?: Date): HoursStatus {
    const at = now || new Date();
    const today = weekIndex(at);
    const minutes = at.getHours() * 60 + at.getMinutes();

    for (let back = 0; back <= 1; back++) {
        const day = (today - back + 7) % 7;
        for (const [a, rawB] of parseDay(hours[DAY_KEYS[day]])) {
            const b = rawB <= a ? rawB + 1440 : rawB;   // crosses midnight
            const t = minutes + back * 1440;
            if (t >= a && t < b) return { open: true, until: fmtClock(b) };
        }
    }

    for (let d = 0; d < 8; d++) {
        const k = DAY_KEYS[(today + d) % 7];
        for (const [a] of parseDay(hours[k])) {
            if (d > 0 || a > minutes) {
                return { open: false, next: fmtClock(a), nextDay: d === 0 ? null : k, today: d === 0 };
            }
        }
    }
    return { open: false };
}

/** Mo/Di/Mi with the same hours collapse into „Mo–Mi". */
function groupDays(hours: WeekHours) {
    const out: { days: DayKey[]; value: string | null }[] = [];
    for (const k of DAY_KEYS) {
        const value = hours[k] ? String(hours[k]) : null;
        const last = out[out.length - 1];
        if (last && last.value === value) last.days.push(k);
        else out.push({ days: [k], value });
    }
    return out.map((g) => ({
        label: g.days.length === 1
            ? DAY_LABELS[g.days[0]]
            : `${DAY_LABELS[g.days[0]]}–${DAY_LABELS[g.days[g.days.length - 1]]}`,
        days: g.days,
        value: g.value,
    }));
}

export type HoursProps = Base & {
    hours: WeekHours;
    /** ISO date the hours were checked. */
    checked?: string;
    /** Days after which `checked` is flagged. Default 180. */
    staleAfter?: number;
    /** „Küche bis 21 Uhr", „Ruhetag an Feiertagen". */
    note?: string;
    /** `false` drops the open/closed line. */
    status?: boolean;
    /** Drops the week, leaving only the status. */
    compact?: boolean;
    /** Fixed „now", for a screenshot or a test. */
    now?: string;
};

export function Hours({ hours, checked, staleAfter, note, status, compact, now, className, id, style }: HoursProps) {
    const week = hours || {};
    const st = useMemo(
        () => hoursStatus(week, now ? new Date(now) : undefined),
        [JSON.stringify(week), now],
    );
    const today = DAY_KEYS[weekIndex(now ? new Date(now) : new Date())];
    const groups = groupDays(week);
    if (!groups.some((g) => g.value)) return null;

    return (
        <div className={cx('ui-hours', className)} id={id} style={style}>
            <div className="ui-hours-head">
                {status === false ? null : st.open ? (
                    <span className="ui-hours-status is-open">
                        jetzt offen
                        {st.until ? <span className="ui-hours-until"> · bis {st.until}</span> : null}
                    </span>
                ) : (
                    <span className="ui-hours-status is-closed">
                        geschlossen
                        {st.next ? (
                            <span className="ui-hours-until">
                                {' '}· öffnet {st.nextDay ? DAY_LABELS[st.nextDay] + ' ' : ''}{st.next}
                            </span>
                        ) : null}
                    </span>
                )}
                {checked ? <AsOf date={checked} staleAfter={staleAfter || 180} /> : null}
            </div>

            {compact !== true ? (
                <dl className="ui-hours-week">
                    {groups.map((g, i) => (
                        <div key={i} className={cx('ui-hours-row', g.days.indexOf(today) >= 0 && 'is-today')}>
                            <dt>{g.label}</dt>
                            <dd>{g.value || 'geschlossen'}</dd>
                        </div>
                    ))}
                </dl>
            ) : null}

            {note ? <div className="ui-hours-note">{inline(note, 'hn')}</div> : null}
        </div>
    );
}

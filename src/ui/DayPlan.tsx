/**
 * # DayPlan — a day as blocks on a time rail
 *
 * ## What it does and how it looks
 * One card per day: a header with the day's label, date and a note, then the
 * entries as rows — the time in accent-coloured tabular figures on the left,
 * the entry on the right with an optional icon and a line of detail under it.
 * Several days become columns on a wide screen and stack on a phone.
 *
 * The nutrition plan and the route page had both built this by hand, in
 * different shapes, which is how you end up with two things that do the same
 * job and look unrelated.
 *
 * ## Core parts
 * - `days` — `{ label, date, note, entries }`. `label` defaults to „Tag n".
 * - an entry is `{ time, duration, title, note, icon, tone, muted, children }`.
 *   `tone` colours the clock (`ok` · `warn` · `bad`); `muted` dims a whole
 *   entry that is conditional or dropped.
 * - `render(entry, i, day)` — an alternative to per-entry `children`, for when
 *   every entry needs the same richer body.
 *
 * ## Examples
 * ```tsx
 * <DayPlan days={[{
 *   label: 'Tag 1', date: '2026-09-14',
 *   entries: [
 *     { time: '08:00', title: 'Abfahrt Porto', icon: '🚗', note: '210 km, ca. 2:20 h' },
 *     { time: '10:30', title: 'Ladestopp Coimbra', duration: '25 min', tone: 'warn' },
 *   ],
 * }]} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version.
 */

import { cx } from './cx';
import { deDate } from './dates';
import { inline } from './_inline';
import type { Base, ReactNode } from './_types';

export type DayEntry = {
    id?: string;
    /** „08:30", „mittags" — whatever goes on the rail. */
    time?: string;
    duration?: string;
    title?: ReactNode;
    note?: string;
    icon?: string;
    tone?: 'ok' | 'warn' | 'bad';
    muted?: boolean;
    children?: ReactNode;
};

export type Day = {
    id?: string;
    /** Default „Tag <n>". */
    label?: ReactNode;
    date?: string;
    note?: ReactNode;
    entries: DayEntry[];
    children?: ReactNode;
};

export type DayPlanProps = Base & {
    days: Day[];
    render?: (entry: DayEntry, i: number, day: Day) => ReactNode;
};

export function DayPlan({ days, render, className, id, style }: DayPlanProps) {
    const list = (days || []).filter(Boolean);
    if (!list.length) return null;
    return (
        <div className={cx('ui-dayplan', className)} id={id} style={style}>
            {list.map((d, di) => (
                <section className="ui-dayplan-day" key={d.id || di}
                    id={d.id ? 'day-' + d.id : undefined}>
                    <header className="ui-dayplan-head">
                        <span className="ui-dayplan-label">{d.label || `Tag ${di + 1}`}</span>
                        {d.date ? <span className="ui-dayplan-date">{deDate(d.date)}</span> : null}
                        {d.note ? <span className="ui-dayplan-note">{d.note}</span> : null}
                    </header>
                    <ol className="ui-dayplan-list">
                        {(d.entries || []).map((e, i) => (
                            <li key={e.id || i}
                                className={cx('ui-dayplan-entry', e.tone && 'is-' + e.tone,
                                    e.muted && 'is-muted')}>
                                <div className="ui-dayplan-time">
                                    <span className="ui-dayplan-clock">{e.time || '·'}</span>
                                    {e.duration ? <span className="ui-dayplan-dur">{e.duration}</span> : null}
                                </div>
                                <div className="ui-dayplan-body">
                                    <div className="ui-dayplan-title">
                                        {e.icon ? (
                                            <span className="ui-dayplan-icon" aria-hidden="true">{e.icon}</span>
                                        ) : null}
                                        {e.title}
                                    </div>
                                    {e.note ? (
                                        <div className="ui-dayplan-sub">{inline(e.note, `dp${di}-${i}`)}</div>
                                    ) : null}
                                    {e.children || (render ? render(e, i, d) : null)}
                                </div>
                            </li>
                        ))}
                    </ol>
                    {d.children || null}
                </section>
            ))}
        </div>
    );
}

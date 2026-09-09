/**
 * # Timeline — a dated sequence on one rail
 *
 * ## What it does and how it looks
 * A vertical rail with a numbered (or lettered) marker per entry, and the
 * entry's content to the right of it. The stops of a route, the days of a plan,
 * the steps of a history.
 *
 * The rail is what makes it worth having: a day reads as **one block** with a
 * marker beside it, instead of as a stack of equal panels where nothing says
 * which panel follows which. A route page built from panels reads as a list;
 * built from this, it reads as a journey.
 *
 * ## Core parts
 * - `items` — `{ marker, label, date, title, children, muted }`. `marker`
 *   defaults to the index; `"S"` and `"Z"` for start and end read well.
 * - `label` + `date` form the small upper line („Tag 1 · 14.09.2026").
 * - `children` per item, or one `render(item, i)` for all of them.
 * - `muted` — dims a stop he dropped or a day already past.
 * - `id` on an item becomes the anchor `#tl-<id>`, so a map pin can link to it.
 *
 * ## Examples
 * ```tsx
 * <Timeline items={stops.map((s, i) => ({
 *   id: s.name, marker: i + 1, label: s.day, date: s.date, title: s.name,
 *   children: <StopCard stop={s} />,
 * }))} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version, so a route stops being a stack of equal panels.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type TimelineEntry = {
    id?: string;
    /** What goes in the marker on the rail. Default: the index. */
    marker?: ReactNode;
    /** „Tag 1", „Montag" — the left half of the when-line. */
    label?: ReactNode;
    date?: ReactNode;
    title?: ReactNode;
    children?: ReactNode;
    /** Dimmed: a stop he dropped, a day already past. */
    muted?: boolean;
};

export type TimelineProps<T extends TimelineEntry = TimelineEntry> = Base & {
    items: T[];
    render?: (item: T, i: number) => ReactNode;
};

export function Timeline<T extends TimelineEntry>({ items, render, className, style, id }: TimelineProps<T>) {
    if (!items || !items.length) return null;
    return (
        <ol className={cx('ui-timeline', className)} style={style} id={id}>
            {items.map((it, i) => (
                <li
                    key={it.id || i}
                    id={it.id ? 'tl-' + it.id : undefined}
                    className={cx('ui-timeline-item', it.muted && 'is-muted')}
                >
                    <div className="ui-timeline-marker" aria-hidden="true">
                        {it.marker != null ? it.marker : i + 1}
                    </div>
                    <div className="ui-timeline-body">
                        {(it.label || it.date) ? (
                            <div className="ui-timeline-when">
                                {it.label}{it.label && it.date ? ' · ' : ''}{it.date}
                            </div>
                        ) : null}
                        {it.title ? <div className="ui-timeline-title">{it.title}</div> : null}
                        {it.children || (render ? render(it, i) : null)}
                    </div>
                </li>
            ))}
        </ol>
    );
}

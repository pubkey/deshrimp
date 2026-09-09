/**
 * # StatusStrip — a run of repeated measurements, as coloured bars
 *
 * ## What it does and how it looks
 * One thin bar per measurement, oldest on the left, newest on the right, each
 * coloured by how that measurement came out: green for `ok`, amber for `warn`,
 * red for `bad`, a hairline for `none` (nothing was measured). The bars share
 * the available width and shrink as the run grows, so a strip of forty readings
 * is as wide as a strip of four.
 *
 * It is for a value that is checked **again and again on a clock** — a posture
 * check every ten seconds, a nightly build, a daily habit — where the shape of
 * the run says more than any single reading: three red bars in a row is a
 * problem, one red bar between greens is a moment. Not for a time series with
 * meaningful magnitudes; that is a chart, and this deliberately is not one.
 *
 * ## Core parts
 * - `items` — the run, oldest first. Each is a `tone` plus an optional `title`,
 *   which becomes that bar's tooltip.
 * - `label` / `hint` — the line above and the quiet line under the strip. Both
 *   optional; without either, the strip stands on its own.
 * - `max` — keep only the last N items. The default is 60, because past that a
 *   bar is thinner than the gap beside it.
 * - an empty run renders the empty track rather than nothing, so a page does
 *   not jump when the first measurement lands.
 *
 * ## Examples
 * ```tsx
 * <StatusStrip label="Letzte Messungen" hint="alle 10 s"
 *   items={readings.map((r) => ({ tone: r.tone, title: `${r.time} · ${r.text}` }))} />
 *
 * <StatusStrip items={days} max={30} />
 * ```
 *
 * ## Changelog
 * - 2026-09-03 First version.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type StatusTone = 'ok' | 'warn' | 'bad' | 'none';

export type StatusStripItem = {
    tone?: StatusTone;
    /** Tooltip for this one bar: when it was, what it said. */
    title?: string;
};

export type StatusStripProps = Base & {
    items: StatusStripItem[];
    label?: ReactNode;
    hint?: ReactNode;
    /** Keep only the last N. Default 60. */
    max?: number;
};

export function StatusStrip({ items, label, hint, max, className, style, id }: StatusStripProps) {
    const list = (items || []).slice(-(max || 60));

    return (
        <div id={id} style={style} className={cx('ui-strip', className)}>
            {label ? <div className="ui-strip-top">{label}</div> : null}
            <div className="ui-strip-track">
                {list.map((item, i) => (
                    <span
                        key={i}
                        className={cx('ui-strip-bar', item.tone || 'none')}
                        title={item.title}
                        aria-label={item.title}
                    />
                ))}
            </div>
            {hint ? <div className="ui-strip-hint">{hint}</div> : null}
        </div>
    );
}

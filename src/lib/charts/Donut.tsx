/**
 * # Donut — the split of one whole
 *
 * ## What it does and how it looks
 * A ring of at most six slices in the series palette, separated by a 2px gap in
 * the surface colour, with an optional number in the hole — the total, or
 * whatever the split is *about*. A legend below names every slice, because an
 * angle is not a label.
 *
 * A ring is only honest for a handful of parts of one total. Six is the limit
 * here, and it is the palette's limit too: pass more and the tail is grouped
 * into „Rest" rather than given a seventh colour nobody checked.
 *
 * For comparing magnitudes, `<BarChart layout="vertical">` wins — a length is
 * read more accurately than an angle. This is for „woraus besteht das".
 *
 * ## Core parts
 * - `data` — rows with a label and a value.
 * - `nameKey` / `valueKey` — which properties those are (`'name'` / `'value'`).
 * - `center` — what to write in the hole; `centerLabel` is the caption below it.
 * - `max` — how many slices before the rest is grouped (default 6).
 *
 * ## Examples
 * ```tsx
 * <Donut data={ausgaben} center={formatEuro(summe)} centerLabel="im Monat"
 *     format={formatEuro} />
 * ```
 *
 * ## Changelog
 * - 2026-09-03 First version, with the charts library.
 */

import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartFrame, ChartLegend, ChartTooltip } from './parts';
import {
    MARK, formatNumber, seriesColor, type Formatter, type ResolvedSeries,
} from './theme';

export type DonutProps = {
    data: Record<string, any>[];
    nameKey?: string;
    valueKey?: string;
    height?: number;
    format?: Formatter;
    /** The number in the hole. */
    center?: string;
    /** The caption under it. */
    centerLabel?: string;
    /** Slices before the tail becomes „Rest". Six is the palette's width. */
    max?: number;
    legend?: boolean;
    empty?: string;
};

export function Donut({
    data, nameKey = 'name', valueKey = 'value', height = 260, format = formatNumber,
    center, centerLabel, max = 6, legend = true, empty,
}: DonutProps) {
    const sorted = [...data].sort((a, b) => Number(b[valueKey]) - Number(a[valueKey]));
    const head = sorted.slice(0, max);
    const tail = sorted.slice(max);
    const slices = tail.length
        ? [...head, {
            [nameKey]: 'Rest',
            [valueKey]: tail.reduce((sum, r) => sum + Number(r[valueKey]), 0),
        }]
        : head;

    const resolved: ResolvedSeries[] = slices.map((row, i) => ({
        key: String(row[nameKey]),
        label: String(row[nameKey]),
        color: tail.length && i === slices.length - 1 ? 'var(--muted)' : seriesColor(i),
    }));

    return (
        <>
            <ChartFrame height={height} isEmpty={!data.length} empty={empty}>
                <PieChart>
                    <Pie data={slices} dataKey={valueKey} nameKey={nameKey}
                        innerRadius="58%" outerRadius="80%" paddingAngle={1.5}
                        stroke={MARK.separator} strokeWidth={MARK.separatorWidth}
                        isAnimationActive={false}>
                        {resolved.map((s) => <Cell key={s.key} fill={s.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip format={format} head={false} />} />
                    {/* The hole is the one place a number can sit without a
                        leader line, so the total goes there rather than into a
                        caption the eye has to travel to. */}
                    {center
                        ? <text x="50%" y="50%" textAnchor="middle" dy={centerLabel ? -2 : 6}
                            style={{ fill: 'var(--ink)', fontSize: 20, fontWeight: 600 }}>
                            {center}
                        </text>
                        : null}
                    {center && centerLabel
                        ? <text x="50%" y="50%" textAnchor="middle" dy={18}
                            style={{ fill: 'var(--muted)', fontSize: 12 }}>
                            {centerLabel}
                        </text>
                        : null}
                </PieChart>
            </ChartFrame>
            {legend ? <ChartLegend series={resolved} /> : null}
        </>
    );
}

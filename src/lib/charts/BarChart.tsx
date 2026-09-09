/**
 * # BarChart — comparing magnitudes
 *
 * ## What it does and how it looks
 * Bars with 4px rounded data-ends, anchored to the baseline. `layout="horizontal"`
 * (the default) puts the categories along the bottom — right for a few short
 * labels or a time axis. `layout="vertical"` lays them down the left side, which
 * is what long names need: „Sneaker, weiß, Leder" fits on a row and never fits
 * under a column.
 *
 * Several series sit side by side; `stacked` puts them on top of each other with
 * a 2px surface gap between segments.
 *
 * ## Core parts
 * - `data`, `x` (the category key), `series` — as in every chart here.
 * - `layout` — `'horizontal'` (columns) or `'vertical'` (rows).
 * - `highlight` — the category to pick out in `--series-2`: „das hier ist meine
 *   Empfehlung" without a second legend entry.
 * - `labels` — writes the value at the end of each bar. Only for one series.
 *
 * ## Examples
 * ```tsx
 * <BarChart data={optionen} x="name" series={[{ key: 'preis', label: 'Preis' }]}
 *     layout="vertical" format={formatEuro} highlight="Loafer" labels />
 *
 * <BarChart data={wochen} x="woche" series={['gym', 'laufen']} stacked
 *     format={withUnit(formatNumber, 'min')} />
 * ```
 *
 * ## Changelog
 * - 2026-09-03 First version, with the charts library.
 */

import { Bar, CartesianGrid, Cell, LabelList, BarChart as RBarChart, Tooltip, XAxis, YAxis } from 'recharts';
import { CURSOR_FILL, ChartFrame, ChartLegend, ChartTooltip } from './parts';
import {
    AXIS, GRID, MARK, formatNumber, resolveSeries,
    type Formatter, type SeriesInput,
} from './theme';

export type BarChartProps = {
    data: Record<string, any>[];
    series: SeriesInput[];
    x?: string;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    stacked?: boolean;
    format?: Formatter;
    formatAxis?: Formatter;
    formatLabel?: (label: any) => string;
    /** Value of `x` to paint in the second slot — the row worth looking at. */
    highlight?: string;
    /** Writes the value at the end of the bar. Single series only. */
    labels?: boolean;
    legend?: boolean;
    /** Width of the category axis in vertical layout, for long names. */
    categoryWidth?: number;
    empty?: string;
};

export function BarChart({
    data, series, x = 'x', height = 280, layout = 'horizontal', stacked = false,
    format = formatNumber, formatAxis, formatLabel, highlight,
    labels = false, legend = true, categoryWidth = 96, empty,
}: BarChartProps) {
    const resolved = resolveSeries(series);
    const vertical = layout === 'vertical';
    // The value label needs room to the right of the longest bar, or it clips.
    const right = labels && vertical ? 56 : 12;

    return (
        <>
            <ChartFrame height={height} isEmpty={!data.length} empty={empty}>
                <RBarChart data={data} layout={layout}
                    margin={{ top: 8, right, bottom: 0, left: 0 }}>
                    <CartesianGrid {...GRID} horizontal={!vertical} vertical={vertical} />
                    {vertical
                        ? <>
                            <XAxis type="number" {...AXIS} tickFormatter={formatAxis ?? format} />
                            <YAxis type="category" dataKey={x} {...AXIS} width={categoryWidth} />
                        </>
                        : <>
                            <XAxis dataKey={x} type="category" {...AXIS} minTickGap={8} />
                            <YAxis type="number" {...AXIS} width="auto" tickFormatter={formatAxis ?? format} />
                        </>}
                    <Tooltip cursor={CURSOR_FILL}
                        content={<ChartTooltip format={format} formatLabel={formatLabel} />} />
                    {resolved.map((s) => (
                        <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color}
                            stackId={stacked ? 'stack' : undefined}
                            stroke={stacked ? MARK.separator : undefined}
                            strokeWidth={stacked ? MARK.separatorWidth : 0}
                            radius={vertical ? [0, MARK.barRadius, MARK.barRadius, 0]
                                : [MARK.barRadius, MARK.barRadius, 0, 0]}
                            isAnimationActive={false}>
                            {highlight
                                ? data.map((row) => (
                                    <Cell key={String(row[x])}
                                        fill={row[x] === highlight ? 'var(--series-2)' : s.color} />
                                ))
                                : null}
                            {labels && resolved.length === 1
                                ? <LabelList dataKey={s.key} position={vertical ? 'right' : 'top'}
                                    formatter={(v: any) => format(Number(v))}
                                    style={{ fill: 'var(--muted)', fontSize: 11 }} />
                                : null}
                        </Bar>
                    ))}
                </RBarChart>
            </ChartFrame>
            {legend ? <ChartLegend series={resolved} /> : null}
        </>
    );
}

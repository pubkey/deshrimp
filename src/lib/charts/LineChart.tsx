/**
 * # LineChart — a value over time
 *
 * ## What it does and how it looks
 * One line per series over a shared category axis: weight per week, calories
 * per day, price per month. Thin 2px lines in the series palette, a recessive
 * horizontal grid, a crosshair with a tooltip listing every series at that
 * point, and an HTML legend below as soon as there are two of them.
 *
 * ## Core parts
 * - `data` — the rows, one per point on the x axis.
 * - `x` — which property of a row is the category (default `'x'`).
 * - `series` — `['kcal']` or `[{ key: 'kcal', label: 'Kalorien' }]`.
 * - `format` / `formatAxis` — tooltip and tick formatting; `withUnit` adds one.
 * - `smooth` — monotone curve instead of straight segments. Off by default:
 *   a curve invents values between two measured points.
 *
 * ## Examples
 * ```tsx
 * <LineChart data={weeks} x="woche" series={[{ key: 'kg', label: 'Gewicht' }]}
 *     format={withUnit(formatNumber, 'kg')} />
 *
 * <LineChart data={months} x="monat" series={['ausgaben', 'einnahmen']}
 *     format={formatEuro} formatAxis={formatCompact} height={320} />
 * ```
 *
 * ## Changelog
 * - 2026-09-03 First version, with the charts library.
 */

import {
    CartesianGrid, Line, LineChart as RLineChart, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChartFrame, ChartLegend, ChartTooltip, CURSOR_LINE } from './parts';
import {
    AXIS, GRID, MARK, formatCompact, formatNumber, resolveSeries,
    type Formatter, type SeriesInput,
} from './theme';

export type LineChartProps = {
    data: Record<string, any>[];
    series: SeriesInput[];
    x?: string;
    height?: number;
    /** Value format in the tooltip. */
    format?: Formatter;
    /**
     * Value format on the ticks. Defaults to `format`, so a euro chart keeps its
     * € on the axis; pass `formatCompact` where the numbers are long.
     */
    formatAxis?: Formatter;
    /** Heading of the tooltip, from the x value. */
    formatLabel?: (label: any) => string;
    smooth?: boolean;
    dots?: boolean;
    /** Start the y axis at zero even when the data sits high above it. */
    zero?: boolean;
    legend?: boolean;
    empty?: string;
};

export function LineChart({
    data, series, x = 'x', height = 280, format = formatNumber,
    formatAxis, formatLabel, smooth = false, dots,
    zero = false, legend = true, empty,
}: LineChartProps) {
    const resolved = resolveSeries(series);
    // Dots on every point turn a long series into a dotted mess; on a short one
    // they are what makes the individual measurement visible.
    const showDots = dots ?? data.length <= 12;

    return (
        <>
            <ChartFrame height={height} isEmpty={!data.length} empty={empty}>
                <RLineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid {...GRID} vertical={false} />
                    <XAxis dataKey={x} {...AXIS} minTickGap={16} />
                    <YAxis {...AXIS} width="auto" tickFormatter={formatAxis ?? format}
                        domain={zero ? [0, 'auto'] : ['auto', 'auto']} />
                    <Tooltip cursor={CURSOR_LINE}
                        content={<ChartTooltip format={format} formatLabel={formatLabel} />} />
                    {resolved.map((s) => (
                        <Line key={s.key} type={smooth ? 'monotone' : 'linear'} dataKey={s.key}
                            name={s.label} stroke={s.color} strokeWidth={MARK.strokeWidth}
                            dot={showDots
                                ? { r: MARK.dotRadius, fill: s.color, stroke: MARK.separator,
                                    strokeWidth: MARK.separatorWidth }
                                : false}
                            activeDot={{ r: MARK.activeDotRadius, stroke: MARK.separator,
                                strokeWidth: MARK.separatorWidth }}
                            isAnimationActive={false} />
                    ))}
                </RLineChart>
            </ChartFrame>
            {legend ? <ChartLegend series={resolved} /> : null}
        </>
    );
}

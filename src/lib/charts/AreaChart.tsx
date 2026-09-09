/**
 * # AreaChart — a total, and what it is made of
 *
 * ## What it does and how it looks
 * The line chart's sibling for parts of a whole over time: stacked translucent
 * fills under 2px lines, with a 2px surface gap between the segments so they
 * read as separate bands. Unstacked (`stacked={false}`) it is a single filled
 * line — the shape for one quantity whose *level* matters, not its parts.
 *
 * Use it when the sum means something (calories by macro, spending by
 * category). When the series are independent, a `<LineChart>` is the honest
 * form: stacking makes a series' own shape unreadable.
 *
 * ## Core parts
 * - `data`, `x`, `series`, `format` — identical to `<LineChart>`.
 * - `stacked` — on by default; that is the reason to pick this chart.
 *
 * ## Examples
 * ```tsx
 * <AreaChart data={tage} x="tag" series={[
 *     { key: 'eiweiss', label: 'Eiweiß' },
 *     { key: 'fett', label: 'Fett' },
 *     { key: 'kohlenhydrate', label: 'Kohlenhydrate' },
 * ]} format={withUnit(formatNumber, 'g')} />
 * ```
 *
 * ## Changelog
 * - 2026-09-03 First version, with the charts library.
 */

import {
    Area, AreaChart as RAreaChart, CartesianGrid, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ChartFrame, ChartLegend, ChartTooltip, CURSOR_LINE } from './parts';
import {
    AXIS, GRID, MARK, formatNumber, resolveSeries,
    type Formatter, type SeriesInput,
} from './theme';

export type AreaChartProps = {
    data: Record<string, any>[];
    series: SeriesInput[];
    x?: string;
    height?: number;
    format?: Formatter;
    formatAxis?: Formatter;
    formatLabel?: (label: any) => string;
    stacked?: boolean;
    smooth?: boolean;
    legend?: boolean;
    empty?: string;
};

export function AreaChart({
    data, series, x = 'x', height = 280, format = formatNumber,
    formatAxis, formatLabel, stacked = true, smooth = false,
    legend = true, empty,
}: AreaChartProps) {
    const resolved = resolveSeries(series);

    return (
        <>
            <ChartFrame height={height} isEmpty={!data.length} empty={empty}>
                <RAreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid {...GRID} vertical={false} />
                    <XAxis dataKey={x} {...AXIS} minTickGap={16} />
                    <YAxis {...AXIS} width="auto" tickFormatter={formatAxis ?? format} />
                    <Tooltip cursor={CURSOR_LINE}
                        content={<ChartTooltip format={format} formatLabel={formatLabel} />} />
                    {resolved.map((s) => (
                        <Area key={s.key} type={smooth ? 'monotone' : 'linear'} dataKey={s.key}
                            name={s.label} stackId={stacked ? 'stack' : undefined}
                            stroke={s.color} strokeWidth={MARK.strokeWidth}
                            fill={s.color} fillOpacity={stacked ? 0.5 : MARK.areaOpacity}
                            dot={false} isAnimationActive={false} />
                    ))}
                </RAreaChart>
            </ChartFrame>
            {legend ? <ChartLegend series={resolved} /> : null}
        </>
    );
}

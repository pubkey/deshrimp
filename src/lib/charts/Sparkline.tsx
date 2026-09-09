/**
 * # Sparkline — the shape of a number, next to the number
 *
 * ## What it does and how it looks
 * A tiny axis-less line, drawn to sit inside a row of a table or beside a
 * `<Stat>`: no grid, no ticks, no tooltip, no legend — the trend and nothing
 * else. The last point is marked, because that is the one the reader is
 * standing on.
 *
 * It is deliberately not a chart with the chrome removed: a sparkline that
 * grows a tooltip has become a `<LineChart>` and should be one.
 *
 * ## Core parts
 * - `values` — plain numbers, in order. That is the whole data model.
 * - `width` / `height` — 96×28 by default, the size of a table cell.
 * - `color` — a token; defaults to the first series slot.
 * - `area` — fills under the line, for „wie viel" rather than „wohin".
 *
 * ## Examples
 * ```tsx
 * <Stat label="Gewicht" value="82,4 kg" hint={<Sparkline values={kg} />} />
 * ```
 *
 * ## Changelog
 * - 2026-09-03 First version, with the charts library.
 */

import { MARK, seriesColor } from './theme';

export type SparklineProps = {
    values: number[];
    width?: number;
    height?: number;
    color?: string;
    area?: boolean;
    /** Marks the final value. On by default — it is where the reader is. */
    last?: boolean;
    label?: string;
};

export function Sparkline({
    values, width = 96, height = 28, color = seriesColor(0), area = false,
    last = true, label,
}: SparklineProps) {
    // Hand-drawn rather than a chart component: a 96px line needs a path, not a
    // layout engine, and this way a table of 40 rows costs 40 paths.
    if (values.length < 2) return null;

    const pad = MARK.strokeWidth + 1;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX = (width - pad * 2) / (values.length - 1);
    const point = (v: number, i: number): [number, number] => [
        pad + i * stepX,
        pad + (1 - (v - min) / span) * (height - pad * 2),
    ];

    const points = values.map(point);
    const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
    const [lx, ly] = points[points.length - 1];

    return (
        <svg className="ui-sparkline" width={width} height={height} role="img"
            aria-label={label ?? `Verlauf, ${values.length} Werte`}>
            {area
                ? <path d={`${line} L${(width - pad).toFixed(1)},${height - pad} L${pad},${height - pad} Z`}
                    fill={color} fillOpacity={MARK.areaOpacity} stroke="none" />
                : null}
            <path d={line} fill="none" stroke={color} strokeWidth={MARK.strokeWidth}
                strokeLinecap="round" strokeLinejoin="round" />
            {last
                ? <circle cx={lx} cy={ly} r={2.5} fill={color}
                    stroke={MARK.separator} strokeWidth={1.5} />
                : null}
        </svg>
    );
}

/**
 * The pieces every chart here is wrapped in: the frame, the legend, the
 * tooltip.
 *
 * They are shared rather than per-chart so that a bar chart and a line chart on
 * the same page cannot drift apart - same tooltip, same legend, same
 * state, same paddings.
 */

import type { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import type { Formatter, ResolvedSeries } from './theme';
import { formatNumber } from './theme';

/* -------------------------------------------------------------- the frame */

export type FrameProps = {
    height?: number;
    className?: string;
    children: ReactNode;
};

/**
 * **A chart with nothing in it is still drawn** _(2026-09-15, his call: always
 * show the chart, even when it has too little data)_. There used to be an
 * empty branch here that replaced it with a box reading „Keine Daten", which
 * was wrong twice over: an axis with no line on it still says what is being
 * measured and on what scale, and swapping the two made the tile change height
 * the moment a second reading landed.
 */
export function ChartFrame({ height = 280, className, children }: FrameProps) {
    return (
        <div className={className ? `ui-chart ${className}` : 'ui-chart'}>
            <ResponsiveContainer width="100%" height={height}>
                {children as any}
            </ResponsiveContainer>
        </div>
    );
}

/* ------------------------------------------------------------- the legend */

/**
 * Rendered as HTML next to the chart, not by Recharts.
 *
 * Two reasons. Recharts paints its legend labels in the series colour, and the
 * design sheet says text wears text tokens while a swatch carries the identity.
 * And an HTML legend wraps properly at 390 px, where the SVG one clips.
 */
export function ChartLegend({ series }: { series: ResolvedSeries[] }) {
    if (series.length < 2) return null;   // one series is named by the title
    return (
        <div className="ui-chart-legend">
            {series.map((s) => (
                <span className="ui-chart-legend-item" key={s.key}>
                    <i className="ui-chart-swatch" style={{ background: s.color }} />
                    {s.label}
                </span>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------ the tooltip */

export type TooltipProps = {
    /* Recharts fills these in when it clones the element. */
    active?: boolean;
    payload?: any[];
    label?: any;
    /** Turns a value into the string shown. Defaults to the German number format. */
    format?: Formatter;
    /** Turns the category into the tooltip's heading. */
    formatLabel?: (label: any) => string;
    /** Hides the heading - for a pie, where the row already names the slice. */
    head?: boolean;
};

export function ChartTooltip({
    active, payload, label, format = formatNumber, formatLabel, head = true,
}: TooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <div className="ui-chart-tip">
            {head && label != null
                ? <div className="ui-chart-tip-head">{formatLabel ? formatLabel(label) : label}</div>
                : null}
            {payload.map((entry: any, i: number) => (
                <div className="ui-chart-tip-row" key={entry.dataKey ?? entry.name ?? i}>
                    <span className="ui-chart-tip-label">
                        <i className="ui-chart-swatch"
                            style={{ background: entry.color ?? entry.payload?.fill }} />
                        {entry.name}
                    </span>
                    <span className="ui-chart-tip-value">
                        {typeof entry.value === 'number' ? format(entry.value) : String(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

/** The cursor behind the tooltip - a wash, never a second colour. */
export const CURSOR_FILL = { fill: 'var(--bg-sunk)' };
export const CURSOR_LINE = { stroke: 'var(--line)', strokeDasharray: '3 3' };

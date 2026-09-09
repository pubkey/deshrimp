/**
 * What every chart in this folder shares: the palette, the axis look, the
 * number formats, and the shape a caller describes its series in.
 *
 * The palette is six CSS variables, not six hex codes. Recharts hands `stroke`
 * and `fill` straight to SVG presentation attributes, and an SVG attribute
 * takes `var(--series-1)` — so the light/dark switch is the browser's job and
 * costs no code at all. That is the whole reason this library is Recharts and
 * not a canvas engine.
 */

/** The categorical slots, in fixed order. Never cycled — see `seriesColor`. */
export const SERIES_SLOTS = 6;

export const SERIES_COLORS: string[] = Array.from(
    { length: SERIES_SLOTS },
    (_, i) => `var(--series-${i + 1})`,
);

/**
 * The colour of slot `i`.
 *
 * Past the sixth series it stops handing out new colours and returns
 * `--muted`: a seventh hue is one the palette was never checked for, and two
 * lines nobody can tell apart are worse than one grey line labelled „Rest".
 * Seven series is the signal to group the tail together or split the chart.
 */
export function seriesColor(i: number): string {
    return i < SERIES_SLOTS ? SERIES_COLORS[i] : 'var(--muted)';
}

/** A series to draw: the key it has in each row, plus how to label and paint it. */
export type SeriesSpec = {
    /** The property to read from each row. */
    key: string;
    /** Legend and tooltip label. Defaults to `key`. */
    label?: string;
    /** Overrides the palette slot. A token, not a hex code. */
    color?: string;
};

export type SeriesInput = string | SeriesSpec;

export type ResolvedSeries = Required<Pick<SeriesSpec, 'key' | 'label'>> & { color: string };

/** `['a', 'b']` and `[{ key: 'a', label: 'A' }]` both become the full shape. */
export function resolveSeries(series: SeriesInput[]): ResolvedSeries[] {
    return series.map((s, i) => {
        const spec: SeriesSpec = typeof s === 'string' ? { key: s } : s;
        return { key: spec.key, label: spec.label ?? spec.key, color: spec.color ?? seriesColor(i) };
    });
}

/* --------------------------------------------------------------- formatting */

export type Formatter = (value: number) => string;

const de = (v: number, digits = 0) =>
    v.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * German thousands separator; one decimal when the value has one.
 *
 * Rounding a non-integer away would be wrong on an axis before it is wrong in a
 * tooltip: ticks at 81,9 and 82,0 both printed „82 kg", which reads as a broken
 * scale rather than as rounding.
 */
export const formatNumber: Formatter = (v) =>
    Number.isInteger(v) ? de(v) : de(v, 1);

/** Short axis labels: 1,2 Mio. · 340 Tsd. · 1.240. Ticks have no room for more. */
export const formatCompact: Formatter = (v) => {
    const abs = Math.abs(v);
    if (abs >= 1e9) return `${de(v / 1e9, 1)} Mrd.`;
    if (abs >= 1e6) return `${de(v / 1e6, abs >= 1e7 ? 0 : 1)} Mio.`;
    if (abs >= 1e4) return `${de(Math.round(v / 1e3))} Tsd.`;
    return de(Math.round(v));
};

export const formatEuro: Formatter = (v) => `${de(v, Number.isInteger(v) ? 0 : 2)} €`;
export const formatPercent: Formatter = (v) => `${de(v, Math.abs(v) < 10 ? 1 : 0)} %`;

/** Appends a unit to a formatted number: `withUnit(formatNumber, 'kcal')`. */
export function withUnit(fmt: Formatter, unit: string): Formatter {
    return (v) => `${fmt(v)} ${unit}`;
}

/* ------------------------------------------------------------- chart chrome */

/** Axis defaults. Recessive: the data is the ink, the axis is furniture. */
export const AXIS = {
    stroke: 'var(--line-strong)',
    tickLine: false,
    axisLine: false,
    tick: { fill: 'var(--muted)', fontSize: 11 },
} as const;

export const GRID = {
    stroke: 'var(--line)',
    strokeDasharray: '0',
} as const;

/** Marks. Thin lines, visible dots, a 2px surface gap between stacked fills. */
export const MARK = {
    strokeWidth: 2,
    dotRadius: 4,
    activeDotRadius: 5,
    barRadius: 4,
    /** Painted in the surface colour so touching segments read as separate. */
    separator: 'var(--card)',
    separatorWidth: 2,
    areaOpacity: 0.18,
} as const;

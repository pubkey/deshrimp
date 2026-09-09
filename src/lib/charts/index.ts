/**
 * `@charts` — the chart components, on Recharts 3.
 *
 * **Why this is not in `.claude/ui/components/`.** That folder is bundled into
 * *every* page `build_page.py` writes, and Recharts is 465 KB minified. A
 * packing list would carry a charting engine it never draws with. So the charts
 * live here, behind their own alias, and only an app that imports `@charts`
 * pays for them. Everything else about them — tokens, classes, the design sheet
 * — is `.claude/ui` like any other component.
 *
 * ```tsx
 * import { BarChart, Donut, LineChart, formatEuro } from '@charts';
 * ```
 *
 * The palette is `--series-1 … --series-6` from `theme.css`, handed to SVG as
 * `var(--series-1)`, so light and dark need no code. Slots are assigned in
 * fixed order and never cycled; a seventh series goes grey, which is the signal
 * to group the tail or split the chart.
 */

export {LineChart, type LineChartProps} from './LineChart';

export {ChartFrame, ChartLegend, ChartTooltip} from './parts';

export {AXIS, GRID, MARK, SERIES_COLORS, SERIES_SLOTS, formatCompact, formatEuro, formatNumber, formatPercent, resolveSeries, seriesColor, withUnit, type Formatter, type ResolvedSeries, type SeriesInput, type SeriesSpec,} from './theme';

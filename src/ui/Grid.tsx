/**
 * # Grid — as many columns as fit
 *
 * ## What it does and how it looks
 * A responsive grid with no breakpoints to pick: you give a minimum column
 * width and the browser fits as many equal columns as it can. Three cards on a
 * laptop, two on a tablet, one on a phone, and nothing to configure for any of
 * them. This is how every set of option cards on every page is laid out.
 *
 * ## Core parts
 * - `min` — minimum column width in pixels (or any CSS length). Below it, one
 *   column. 280 is the usual choice for a card with an image.
 * - `gap` — `0`–`6` on the `--sN` scale.
 *
 * ## Examples
 * ```tsx
 * <Grid min={280}>{options.map((o) => <OptionCard key={o.id} option={o} />)}</Grid>
 * <Grid min={360} gap={4}>…</Grid>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, CSSProperties, GapStep } from './_types';

export type GridProps = Base & { min?: number | string; gap?: GapStep };

export function Grid({ min, gap, className, children, style, id }: GridProps) {
    const merged: CSSProperties = { ...style };
    if (min) (merged as Record<string, unknown>)['--min'] = typeof min === 'number' ? min + 'px' : min;
    return (
        <div id={id} style={merged}
            className={cx('ui-grid', gap != null && 'ui-gap-' + gap, className)}>
            {children}
        </div>
    );
}

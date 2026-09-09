/**
 * # Progress — how far along something is
 *
 * ## What it does and how it looks
 * A label line with the value at its right, and a rounded track under it filled
 * to that fraction in the accent colour. Nothing else: no percentage inside the
 * bar, no stripes, no animation beyond the fill sliding when the number moves.
 *
 * Use it for a fraction of a known whole — kilometres of a route, days of a
 * plan, a budget spent. Not for „it is loading": a page in this repo is a
 * finished answer, so there is nothing to wait for.
 *
 * ## Core parts
 * - `value` — `0`…`1`, clamped. Anything else is the caller's arithmetic bug,
 *   not the bar's business.
 * - `label` — what is progressing. `valueLabel` is the right-hand side of that
 *   line; without it the percentage is printed.
 * - `hint` — the quiet line underneath: what is left, what it is measured
 *   against.
 * - `tone` — `"ok"` when the thing is finished, `"warn"` when it is running
 *   out. Default is the page accent.
 * - it is a real `role="progressbar"` with `aria-valuenow`, so it is not just a
 *   coloured div to a screen reader.
 *
 * ## Examples
 * ```tsx
 * <Progress value={0.42} label="Zurückgelegt" valueLabel="2.640 km"
 *   hint="noch 3.659 km bis New York" />
 * <Progress value={1} tone="ok" label="Angekommen" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 First version.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type ProgressProps = Base & {
    value?: number;
    label?: ReactNode;
    valueLabel?: ReactNode;
    hint?: ReactNode;
    tone?: 'ok' | 'warn';
};

export function Progress(props: ProgressProps) {
    const v = Math.max(0, Math.min(1, props.value || 0));
    const pct = Math.round(v * 100);

    return (
        <div className={cx('ui-progress', props.tone, props.className)}
            style={props.style} id={props.id}>
            {(props.label || props.valueLabel) ? (
                <div className="ui-progress-top">
                    <span>{props.label}</span>
                    <span className="ui-progress-value">
                        {props.valueLabel != null ? props.valueLabel : pct + ' %'}
                    </span>
                </div>
            ) : null}

            <div className="ui-progress-track" role="progressbar"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                <div className="ui-progress-fill" style={{ width: pct + '%' }} />
            </div>

            {props.hint ? <div className="ui-progress-hint">{props.hint}</div> : null}
        </div>
    );
}

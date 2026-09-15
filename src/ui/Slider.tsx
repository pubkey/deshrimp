/**
 * # Slider - a number you drag
 *
 * ## What it does and how it looks
 * A 4px pill track with the value written above it, right-aligned, in tabular
 * mono. The part of the track behind the thumb is filled; the rest is the
 * inactive slate. The design system's control for a bounded number, and the
 * reason a threshold is not a text field: a tolerance is a dial you feel your
 * way to, not a figure you know in advance and type.
 *
 * ## Core parts
 * - `label` - the 11px tracked uppercase eyebrow every label in the system is.
 * - `value`, `min`, `max`, `step` - the usual, and `unit` is appended to the
 *   number in the readout, never to the label.
 * - `breached` - paints the fill and the readout in the accent. It is for a
 *   value that is *over* its tolerance, not merely high; the accent is a
 *   budget (src/ui/DESIGN.md).
 * - `hint` - one line under the track, for what the number means in practice.
 *
 * ## Why the look is in theme.css
 * A range input needs `::-webkit-slider-thumb` and `::-moz-range-thumb`, and a
 * pseudo-element cannot be set from a style attribute. The design system's own
 * version ships a `<style>` tag inside the component, which would put one copy
 * of those rules in the document per slider rendered. The rules live in the
 * sheet with everything else instead; only the fill, which is a percentage of
 * this slider's own value, stays inline.
 *
 * ## Examples
 * ```tsx
 * <Slider label="Signal from side lean" value={8} min={3} max={45}
 *     unit="°" onChange={(v) => save({ maxLean: v })} />
 * ```
 *
 * ## Changelog
 * - 2026-09-15 Own file. The thresholds were number inputs before; his call.
 */

import { useId } from 'react';
import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type SliderProps = Base & {
    label?: ReactNode;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    /** Appended to the readout: `"°"`, `" s"`. Never part of the label. */
    unit?: string;
    hint?: ReactNode;
    disabled?: boolean;
    /** Over tolerance, not merely high: it spends accent. */
    breached?: boolean;
    onChange?: (value: number) => void;
};

export function Slider({
    label, value, min = 0, max = 100, step = 1, unit = '', hint,
    disabled, breached, onChange, className, id, style,
}: SliderProps) {
    const uid = useId();
    const inputId = id || uid;
    const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

    return (
        <div className={cx('ui-slider', breached && 'breach', className)} style={style}>
            {label ? (
                <div className="ui-slider-top">
                    <label htmlFor={inputId}>{label}</label>
                    <span className="ui-slider-value">{value}{unit}</span>
                </div>
            ) : null}
            <input
                id={inputId}
                className="ui-slider-range"
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                /* The only thing that cannot come from the sheet: where the
                   fill stops is this slider's own value. */
                style={{ '--pct': `${pct}%` } as React.CSSProperties}
                onChange={(e) => onChange && onChange(Number(e.target.value))}
            />
            {hint ? <div className="ui-slider-hint">{hint}</div> : null}
        </div>
    );
}

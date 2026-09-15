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
 * - `format` - writes the readout, for a slider whose positions index a list
 *   rather than being the value themselves.
 * - `defaultValue` - draws a **hairline across the track** where the default
 *   sits _(2026-09-15, his call)_. Dragging tells you where you are and not
 *   where you started, and the number you were given is the one reference
 *   point a tolerance has. It is drawn over the rail and over the thumb _(his
 *   call, once he had seen it behind them)_: a mark that vanishes under the
 *   thumb vanishes exactly while you are dragging past it.
 * - `stepper` - a minus and a plus either side of the track _(2026-09-15, his
 *   call)_, each one `step`, each disabled at its end of the range. Dragging
 *   is for finding a value and the stepper is for landing on it; a range input
 *   only takes arrow keys once it has focus.
 *
 * ## Why the look is in theme.css
 * A range input needs `::-webkit-slider-thumb` and `::-moz-range-thumb`, and a
 * pseudo-element cannot be set from a style attribute. The design system's own
 * version ships a `<style>` tag inside the component, which would put one copy
 * of those rules in the document per slider rendered. The rules live in the
 * sheet with everything else instead; only the fill and the mark, which are
 * percentages of this slider's own numbers, stay inline.
 *
 * ## Examples
 * ```tsx
 * <Slider label="Signal from side lean" value={8} min={3} max={45}
 *     unit="°" defaultValue={8} onChange={(v) => save({ maxLean: v })} />
 * ```
 *
 * ## Changelog
 * - 2026-09-15 Own file. The thresholds were number inputs before; his call.
 * - 2026-09-15 A stepper, and the default marked on the track, over it rather
 *   than under. A reset button per slider was tried first and taken out again:
 *   he asked for one reset for all of them instead, which is in the tile, not
 *   in here.
 */

import { useId } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';
import { uiText } from './lang';
import type { Base, ReactNode } from './_types';

export type SliderProps = Base & {
    label?: ReactNode;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    /** Appended to the readout: `"°"`, `" s"`. Never part of the label. */
    unit?: string;
    /**
     * Writes the readout itself, for a slider whose positions are not the
     * number they stand for: an index into a list of intervals reads as "30
     * seconds", never as "5". Used for the default mark's title too, so the
     * two cannot say different things.
     */
    format?: (value: number) => string;
    hint?: ReactNode;
    /** Marks this number on the track with a hairline. */
    defaultValue?: number;
    /** A minus and a plus either side of the track. On unless turned off. */
    stepper?: boolean;
    disabled?: boolean;
    /** Over tolerance, not merely high: it spends accent. */
    breached?: boolean;
    onChange?: (value: number) => void;
};

export function Slider({
    label, value, min = 0, max = 100, step = 1, unit = '', hint, format,
    defaultValue, stepper = true, disabled, breached, onChange,
    className, id, style,
}: SliderProps) {
    const uid = useId();
    const inputId = id || uid;
    const span = max === min ? 0 : max - min;
    const pct = span === 0 ? 0 : ((value - min) / span) * 100;
    const t = uiText();
    const steps = stepper && !!onChange;
    /* The mark is placed against the thumb's travel, not against the track's
       width: the thumb is 14px and its centre only ever reaches from 7px to
       7px short of the end, so a plain percentage would drift by half a thumb
       at each end and miss the value it is marking. */
    const markAt = defaultValue == null || span === 0
        ? null : (defaultValue - min) / span;
    const show = (v: number) => (format ? format(v) : `${v}${unit}`);

    const nudge = (by: number) => {
        if (!onChange) return;
        const next = Math.min(max, Math.max(min, value + by));
        if (next !== value) onChange(next);
    };

    return (
        <div className={cx('ui-slider', breached && 'breach', className)} style={style}>
            {label ? (
                <div className="ui-slider-top">
                    <label htmlFor={inputId}>{label}</label>
                    {/* A readout that is a number wears mono; one that is a
                        number *and a word* wears the interface face with
                        tabular figures. Monospace puts a full character's width
                        into the space, so "2 seconds" reads as a typo. The
                        figures stay tabular either way, which is the part that
                        matters while you drag. */}
                    <span className={cx('ui-slider-value', format && 'worded')}>
                        {show(value)}
                    </span>
                </div>
            ) : null}
            <div className="ui-slider-row">
                {steps ? (
                    <button
                        type="button"
                        className="ui-slider-step"
                        title={t.decrease}
                        aria-label={t.decrease}
                        disabled={disabled || value <= min}
                        onClick={() => nudge(-step)}
                    >
                        <Icon name="minus" />
                    </button>
                ) : null}
                <div className="ui-slider-track">
                    <input
                        id={inputId}
                        className="ui-slider-range"
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        disabled={disabled}
                        /* The only thing that cannot come from the sheet: where
                           the fill stops is this slider's own value. */
                        style={{ '--pct': `${pct}%` } as React.CSSProperties}
                        onChange={(e) => onChange && onChange(Number(e.target.value))}
                    />
                    {markAt == null ? null : (
                        <span
                            className="ui-slider-default"
                            title={`${t.defaultMark}: ${show(defaultValue as number)}`}
                            style={{ '--mark': markAt } as React.CSSProperties}
                        />
                    )}
                </div>
                {steps ? (
                    <button
                        type="button"
                        className="ui-slider-step"
                        title={t.increase}
                        aria-label={t.increase}
                        disabled={disabled || value >= max}
                        onClick={() => nudge(step)}
                    >
                        <Icon name="plus" />
                    </button>
                ) : null}
            </div>
            {hint ? <div className="ui-slider-hint">{hint}</div> : null}
        </div>
    );
}

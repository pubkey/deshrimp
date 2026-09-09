/**
 * # StepList — a numbered sequence to work through
 *
 * ## What it does and how it looks
 * Numbered circles down the left, the step beside each one: an optional bold
 * title, the text, and a small duration under it. Pass `onToggle` and the
 * numbers become buttons — pressing one turns the circle green with a ✓ and
 * fades the step.
 *
 * Stateless on purpose. The version that **remembers** the ticks is `<Steps>`
 * in `.claude/app-builder/lib/Steps.tsx`, because remembering needs the
 * database and this library holds no data.
 *
 * ## Core parts
 * - `steps` — `{ title, text, duration, children }`, or a plain string as
 *   shorthand for `{ text }`.
 * - `done` — a boolean per index. `onToggle(i, step)` — its presence is what
 *   makes the numbers pressable.
 * - `text` is Markdown-lite, so a recipe step can bold an ingredient.
 *
 * ## Examples
 * ```tsx
 * <StepList steps={[
 *   { title: 'Zwiebeln', text: 'Fein würfeln und in *Olivenöl* dünsten.', duration: '5 min' },
 *   'Knoblauch dazu, 30 Sekunden.',
 * ]} />
 *
 * <StepList steps={steps} done={done} onToggle={(i) => flip(i)} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version, together with the RxDB-backed `<Steps>`.
 */

import { cx } from './cx';
import { inline } from './_inline';
import type { Base, ReactNode } from './_types';

export type Step = {
    id?: string;
    title?: ReactNode;
    /** Markdown-lite. */
    text?: string;
    duration?: ReactNode;
    children?: ReactNode;
};

export type StepListProps = Base & {
    /** A plain string is shorthand for `{ text }`. */
    steps: (Step | string)[];
    /** Per index: is this step done. */
    done?: boolean[];
    /** Present ⇒ the numbers become buttons. */
    onToggle?: (index: number, step: Step) => void;
    render?: (step: Step, i: number) => ReactNode;
};

export function StepList({ steps, done, onToggle, render, className, id, style }: StepListProps) {
    const list = (steps || []).filter(Boolean)
        .map((s) => (typeof s === 'string' ? { text: s } : s));
    if (!list.length) return null;
    const flags = done || [];

    return (
        <ol className={cx('ui-steps', onToggle && 'is-tickable', className)} id={id} style={style}>
            {list.map((s, i) => {
                const on = !!flags[i];
                const marker = on ? '✓' : i + 1;
                return (
                    <li key={s.id || i} className={cx('ui-steps-item', on && 'is-done')}>
                        {onToggle ? (
                            <button
                                type="button"
                                className="ui-steps-marker"
                                aria-pressed={on}
                                aria-label={`Schritt ${i + 1}${on ? ' erledigt' : ''}`}
                                onClick={() => onToggle(i, s)}
                            >
                                {marker}
                            </button>
                        ) : (
                            <span className="ui-steps-marker" aria-hidden="true">{marker}</span>
                        )}
                        <div className="ui-steps-body">
                            {s.title ? <div className="ui-steps-title">{s.title}</div> : null}
                            {s.text ? <div className="ui-steps-text">{inline(s.text, 'st' + i)}</div> : null}
                            {s.duration ? <div className="ui-steps-meta">{s.duration}</div> : null}
                            {s.children || (render ? render(s, i) : null)}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

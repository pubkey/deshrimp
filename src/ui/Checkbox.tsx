/**
 * # Checkbox — a tick with its label
 *
 * ## What it does and how it looks
 * A native checkbox and its label inside one `<label>`, so the whole line is
 * the hit area — which is what makes a shopping list usable with a thumb.
 *
 * `onChange` is handed the **boolean**, not the event: every caller wanted
 * `e.target.checked` and nothing else.
 *
 * ## Core parts
 * - `checked` / `onChange(checked)` — controlled. The state lives in RxDB in
 *   these pages, never in the checkbox.
 * - `label` — text or elements. A link inside it would swallow its own click as
 *   a toggle, so put links *next* to the checkbox, not inside its label.
 *
 * ## Examples
 * ```tsx
 * <Checkbox checked={on} onChange={() => toggleDone()} label={<strong>{item.name}</strong>} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type CheckboxProps = Base & {
    checked?: boolean;
    /** Receives the new checked state, not the event. */
    onChange?: (checked: boolean) => void;
    label?: ReactNode;
};

export function Checkbox({ checked, onChange, label, className, children, style, id }: CheckboxProps) {
    return (
        <label id={id} style={style} className={cx('ui-check', className)}>
            <input
                type="checkbox"
                checked={!!checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
            />
            <span>{label || children}</span>
        </label>
    );
}

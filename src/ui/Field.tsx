/**
 * # Field — label, control, and the line underneath
 *
 * ## What it does and how it looks
 * The wrapper around a form control: a label above it, and below it either a
 * hint in muted grey or an error in red. `<Input>`, `<TextArea>` and `<Select>`
 * put themselves in one automatically when given a `label`, `hint` or `error`,
 * so a page usually meets this only when wrapping something custom.
 *
 * ## Core parts
 * - `label` + `htmlFor` — pass the control's `id` so clicking the label focuses
 *   the control.
 * - `error` beats `hint`: when both are set only the error shows, because two
 *   lines under one field is one line too many and the error is the one that
 *   matters.
 *
 * ## Examples
 * ```tsx
 * <Field label="Notiz" hint="Bleibt auf diesem Gerät." htmlFor="note">
 *   <textarea id="note" className="ui-textarea" />
 * </Field>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type FieldProps = Base & {
    label?: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
    htmlFor?: string;
};

export function Field({ label, hint, error, htmlFor, className, children, style, id }: FieldProps) {
    return (
        <div id={id} style={style} className={cx('ui-field', className)}>
            {label ? <label htmlFor={htmlFor}>{label}</label> : null}
            {children}
            {error
                ? <div className="ui-error">{error}</div>
                : hint ? <div className="ui-hint">{hint}</div> : null}
        </div>
    );
}

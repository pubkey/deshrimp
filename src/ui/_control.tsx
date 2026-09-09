/**
 * The shared body of `<Input>`, `<TextArea>` and `<Select>`.
 *
 * All three are the native element plus a class, and all three wrap themselves
 * in a `<Field>` as soon as a `label`, `hint` or `error` is passed. Everything
 * else — `value`, `onInput`, `placeholder`, `rows`, `disabled` — is passed
 * straight through to the DOM, so there is no prop list here to fall behind the
 * platform.
 *
 * **A `ref` reaches the element itself** _(2026-09-01)_. Without that these
 * three are the only components on a page that cannot be focused, measured or
 * selected from code — and a textarea sized to its own content (`scrollHeight`)
 * needs exactly that. React strips `ref` from props of a plain function
 * component, so the wrapper has to forward it explicitly.
 *
 * **A labelled control always gets an id** _(2026-09-03)_. `<Field>` renders
 * `<label htmlFor>`, and no page ever passed an `id`, so every label on every
 * page pointed at nothing: clicking it did not focus the field and a screen
 * reader read the control unnamed. `useId()` fills it in when the caller has
 * not — an explicit `id` still wins, because that is what a page needs when
 * something else has to point at the same field.
 */

import { createElement, forwardRef, useId } from 'react';
import { cx } from './cx';
import { Field } from './Field';
import type { ReactNode } from './_types';

export type ControlExtras = {
    label?: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
    className?: string;
    id?: string;
};

export function controlComponent<P extends ControlExtras>(tag: string, cls: string) {
    return forwardRef<any, P>(function Control(props, ref) {
        const { label, hint, error, className, ...rest } =
            props as ControlExtras & Record<string, any>;
        const generated = useId();
        const id = props.id || (label ? generated : undefined);
        const node = createElement(tag, { ...rest, id, ref, className: cx(cls, className) });
        return (label || hint || error)
            ? <Field label={label} hint={hint} error={error} htmlFor={id}>{node}</Field>
            : node;
    });
}

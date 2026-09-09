/**
 * # Button — the thing you press
 *
 * ## What it does and how it looks
 * A pill with optional icon and label. `variant="primary"` is the accent fill
 * and there should be one of those in view at a time; the default is a quiet
 * outline, and `"ghost"` is text-only, for the action that must be available
 * but should not compete.
 *
 * With `href` it renders an `<a>` styled identically — because a thing that
 * navigates should be a link (middle-click, open in a new tab, copy the
 * address), and a thing that acts should be a button. Same look, right element.
 *
 * ## Core parts
 * - `variant` — `"primary"` · `"ghost"` · `"danger"` · unset.
 * - `size` — `"sm"` for a row-level action, `"lg"` for the one call to action
 *   on a slide.
 * - `active` — pressed state; it also sets `aria-pressed`, so a toggle is a
 *   toggle for a screen reader too.
 * - `href` + `newTab` — links open in a new tab unless `newTab={false}`. A
 *   published page is something he keeps open; taking it away to a shop is not
 *   what he asked for.
 * - `block` — full width, for a phone-width call to action.
 *
 * ## Examples
 * ```tsx
 * <Button variant="primary" onClick={add}>Hinzufügen</Button>
 * <Button size="sm" variant="ghost" onClick={reset}>Zurücksetzen</Button>
 * <Button href={item.url}>Ansehen ↗</Button>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type ButtonProps = Base & {
    variant?: 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'lg';
    block?: boolean;
    active?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    /** Renders an `<a>` instead — for anything that navigates. */
    href?: string;
    /** Links open in a new tab unless this is `false`. */
    newTab?: boolean;
};

export function Button(props: ButtonProps) {
    const cls = cx('ui-btn', props.variant, props.size, props.block && 'block',
        props.active && 'on', props.className);
    const inner = (
        <>
            {props.icon ? <span aria-hidden="true">{props.icon}</span> : null}
            {props.children}
        </>
    );

    if (props.href) {
        return (
            <a
                className={cls}
                href={props.href}
                id={props.id}
                style={props.style}
                title={props.title}
                target={props.newTab === false ? undefined : '_blank'}
                rel={props.newTab === false ? undefined : 'noopener noreferrer'}
            >
                {inner}
            </a>
        );
    }
    return (
        <button
            className={cls}
            id={props.id}
            style={props.style}
            title={props.title}
            onClick={props.onClick}
            disabled={props.disabled}
            type={props.type || 'button'}
            aria-pressed={props.active == null ? undefined : !!props.active}
        >
            {inner}
        </button>
    );
}

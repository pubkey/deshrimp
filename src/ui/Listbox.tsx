/**
 * # Listbox - pick one from a list whose entries are more than a word
 *
 * ## What it does and how it looks
 * Closed, it is the same 40px control as `<Select>`: hairline, 6px, the
 * chevron on the right. Open, it drops a list under itself in which every
 * entry is a row of real markup rather than a line of text, so a row can carry
 * a picture, a figure in tabular mono or an icon on its right, which a native
 * `<option>` cannot _(2026-10-19, his call: „make a custom select-component so
 * in the dropdown for the sounds we can dispplay the shrimpcoin price of the
 * sounds etc.")_.
 *
 * **`<Select>` is still the default.** On a phone the native picker is faster
 * and more accessible than anything drawn here, so this is for the list that
 * needs to show something a word cannot, and only for that.
 *
 * ## How it behaves
 * - The list is a WAI-ARIA listbox. Focus moves into it on open and the
 *   highlighted row is `aria-activedescendant`, so a screen reader follows the
 *   arrows the way it follows a native select.
 * - Arrow keys, Home, End, Enter and Space as a native select has them; a
 *   letter jumps to the next row whose `text` starts with it. Escape and a
 *   click outside close it without choosing, and focus goes back to the
 *   button.
 * - **It is drawn on `document.body`, not in place.** A tile clips what spills
 *   out of it, and a list that is cut off at the tile's edge is a list with
 *   its most expensive entries missing. It is positioned against the button,
 *   follows it when anything scrolls, and opens upwards when there is no room
 *   below.
 * - It leaves the page the way a dialog does, so it is one of the few things
 *   that may wear `--shadow-card` (`DESIGN.md` §"Surfaces").
 *
 * ## Core parts
 * - `options` - `{ value, label, text, detail?, disabled? }`. `label` is what
 *   the row and the closed button show. `text` is the same in plain words: it
 *   is the row's accessible name and what typing a letter searches, so it
 *   should say everything the row shows, the price included. `detail` sits on
 *   the right of the row only, never on the button.
 * - `value` / `onChange(value)` - controlled, like every other control here.
 *   Choosing a row only reports it: whether the value then changes is the
 *   caller's call, which is what lets a locked entry open a dialog instead.
 * - `label` / `hint` / `error`, as with `<Select>`.
 *
 * ## Examples
 * ```tsx
 * <Listbox label="Sound" value={name} onChange={setName} options={[
 *     { value: 'fart', label: 'Fart', text: 'Fart' },
 *     { value: 'whip', label: 'Whip', text: 'Whip, 1500',
 *       detail: <CoinAmount tenths={15000} /> },
 * ]} />
 * ```
 *
 * ## Changelog
 * - 2026-10-19 First version, for the sound picker.
 */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { cx } from './cx';
import { Field } from './Field';
import { Icon } from './Icon';
import type { ReactNode } from './_types';

export type ListboxOption<V extends string> = {
    value: V;
    label: ReactNode;
    text: string;
    detail?: ReactNode;
    disabled?: boolean;
};

export type ListboxProps<V extends string> = {
    value: V;
    options: ListboxOption<V>[];
    onChange: (value: V) => void;
    label?: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
    disabled?: boolean;
    className?: string;
    id?: string;
};

/** Where the open list sits, in viewport pixels. */
type Place = { left: number; width: number; top?: number; bottom?: number; maxHeight: number };

/** The gap between the button and the list, and the least room worth opening into. */
const GAP = 4;
const ROOM = 160;

export function Listbox<V extends string>(props: ListboxProps<V>) {
    const { value, options, onChange, label, hint, error, disabled, className } = props;
    const generated = useId();
    const id = props.id || generated;
    const listId = id + '-list';
    const button = useRef<HTMLButtonElement>(null);
    const list = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [place, setPlace] = useState<Place | null>(null);
    const typed = useRef({ text: '', at: 0 });

    const current = options.find((o) => o.value === value);
    const enabled = (i: number) => !!options[i] && !options[i].disabled;

    const measure = useCallback(() => {
        const box = button.current?.getBoundingClientRect();
        if (!box) return;
        const below = window.innerHeight - box.bottom - GAP * 2;
        const above = box.top - GAP * 2;
        const up = below < ROOM && above > below;
        setPlace({
            left: box.left,
            width: box.width,
            top: up ? undefined : box.bottom + GAP,
            bottom: up ? window.innerHeight - box.top + GAP : undefined,
            maxHeight: Math.max(up ? above : below, 0),
        });
    }, []);

    const show = () => {
        if (disabled) return;
        const at = options.findIndex((o) => o.value === value);
        setActive(at >= 0 ? at : options.findIndex((o) => !o.disabled));
        measure();
        setOpen(true);
    };

    const close = (refocus: boolean) => {
        setOpen(false);
        if (refocus) button.current?.focus();
    };

    const choose = (i: number) => {
        if (!enabled(i)) return;
        close(true);
        if (options[i].value !== value) onChange(options[i].value);
    };

    /* Focus goes into the list once it exists, so the keys below reach it. */
    useLayoutEffect(() => {
        if (open) list.current?.focus({ preventScroll: true });
    }, [open]);

    /* The highlighted row stays in view as the arrows walk past the edge. */
    useLayoutEffect(() => {
        if (!open) return;
        const row = list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
        row?.scrollIntoView({ block: 'nearest' });
    }, [open, active]);

    /* Follow the button through any scroll on the page, and let go of the list
       when someone presses anywhere else. Capture, because a tile that scrolls
       on its own does not bubble its scroll up to the window. */
    useEffect(() => {
        if (!open) return;
        const away = (e: PointerEvent) => {
            const target = e.target as Node;
            if (list.current?.contains(target) || button.current?.contains(target)) return;
            close(false);
        };
        window.addEventListener('scroll', measure, true);
        window.addEventListener('resize', measure);
        document.addEventListener('pointerdown', away, true);
        return () => {
            window.removeEventListener('scroll', measure, true);
            window.removeEventListener('resize', measure);
            document.removeEventListener('pointerdown', away, true);
        };
    }, [open, measure]);

    /** The next row that can be chosen, `step` at a time, stopping at the ends. */
    const walk = (from: number, step: 1 | -1) => {
        for (let i = from + step; i >= 0 && i < options.length; i += step) {
            if (enabled(i)) return i;
        }
        return from;
    };

    /** A letter, or a few typed quickly, jumps to the next row starting with them. */
    const seek = (key: string) => {
        const now = Date.now();
        const memo = typed.current;
        memo.text = now - memo.at > 700 ? key : memo.text + key;
        memo.at = now;
        const wanted = memo.text.toLocaleLowerCase();
        const start = memo.text.length > 1 ? active : active + 1;
        for (let n = 0; n < options.length; n++) {
            const i = (start + n) % options.length;
            if (enabled(i) && options[i].text.toLocaleLowerCase().startsWith(wanted)) {
                setActive(i);
                return;
            }
        }
    };

    const onListKey = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown': setActive(walk(active, 1)); break;
            case 'ArrowUp': setActive(walk(active, -1)); break;
            case 'Home': setActive(walk(-1, 1)); break;
            case 'End': setActive(walk(options.length, -1)); break;
            case 'Enter':
            case ' ': choose(active); break;
            case 'Escape': close(true); break;
            case 'Tab': close(true); return;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) seek(e.key);
                return;
        }
        e.preventDefault();
    };

    const onButtonKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            show();
        }
    };

    const node = (
        <button
            ref={button}
            id={id}
            type="button"
            className={cx('ui-select', 'ui-listbox-button', className)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            onClick={() => (open ? close(true) : show())}
            onKeyDown={onButtonKey}
        >
            <span className="ui-listbox-current">{current ? current.label : null}</span>
        </button>
    );

    const popup = open && place ? createPortal(
        <div
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            className="ui-listbox"
            aria-labelledby={id}
            aria-activedescendant={`${id}-opt-${active}`}
            style={{
                left: place.left, width: place.width, top: place.top,
                bottom: place.bottom, maxHeight: place.maxHeight,
            }}
            onKeyDown={onListKey}
        >
            {options.map((o, i) => (
                <div
                    key={o.value}
                    id={`${id}-opt-${i}`}
                    data-index={i}
                    role="option"
                    aria-label={o.text}
                    aria-selected={o.value === value}
                    aria-disabled={o.disabled || undefined}
                    className={cx('ui-listbox-option', i === active && 'is-active')}
                    onPointerMove={() => { if (enabled(i) && i !== active) setActive(i); }}
                    onClick={() => choose(i)}
                >
                    <span className="ui-listbox-tick">
                        {o.value === value ? <Icon name="check" /> : null}
                    </span>
                    <span className="ui-listbox-label">{o.label}</span>
                    {o.detail != null ? <span className="ui-listbox-detail">{o.detail}</span> : null}
                </div>
            ))}
        </div>,
        document.body,
    ) : null;

    return (
        <>
            {(label || hint || error)
                ? <Field label={label} hint={hint} error={error} htmlFor={id}>{node}</Field>
                : node}
            {popup}
        </>
    );
}

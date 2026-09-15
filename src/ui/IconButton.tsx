/**
 * # IconButton - a square button with no words
 *
 * ## What it does and how it looks
 * A 40px square holding one drawn glyph: the share button, the theme toggle, a
 * delete icon on a row. Secondary ink, hairline border, 6px - the same shape
 * as every other control at that height.
 *
 * `label` is **required in practice**, because a button whose only content is
 * a bare glyph is unusable with a screen reader and unlabelled on hover. It
 * becomes both the `title` and the `aria-label`.
 *
 * ## Core parts
 * - `icon` - an `<Icon>`. Never emoji and never a unicode symbol: the design
 *   system bans both as affordances, because a glyph out of the text stream
 *   cannot be given a stroke weight and renders differently on every platform.
 * - `label` - what it does, in words. Not optional in spirit.
 * - `text` - also *show* those words, on a screen wide enough to hold them.
 *   The `title` and the accessible name are the same either way, so the button
 *   is labelled at every width; past 900px it is labelled twice over.
 *
 * ## Examples
 * ```tsx
 * <IconButton icon={<Icon name="trash" size={20} />} label="Notiz löschen"
 *     onClick={() => remove(note.id)} />
 * <IconButton icon={<Icon name="download" size={20} />} label="Meine Eingaben sichern"
 *     onClick={save} />
 * ```
 *
 * ## Changelog
 * - 2026-09-15 `text`, for the top bar: icon and words on a wide screen, the
 *   glyph alone on a phone. His call.
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type IconButtonProps = Base & {
    icon?: ReactNode;
    /** What the button does, in words: it is the title *and* the aria-label. */
    label?: string;
    /**
     * Shows the words beside the glyph, but only past 900px _(2026-09-15, his
     * call, for the top bar)_. Off by default: most icon buttons in the system
     * sit in a row or a dialog header where a label would not fit at any width.
     * Pass `true` to show `label`, or a shorter string when `label` is a
     * sentence.
     */
    text?: ReactNode | boolean;
    disabled?: boolean;
    onClick?: () => void;
};

export function IconButton({
    icon, label, text, disabled, onClick, className, children, style, id,
}: IconButtonProps) {
    const words = text === true ? label : text === false ? null : text;
    return (
        <button
            id={id}
            style={style}
            className={cx('ui-iconbtn', words ? 'ui-iconbtn-wide' : null, className)}
            onClick={onClick}
            title={label}
            aria-label={label}
            type="button"
            disabled={disabled}
        >
            {icon || children}
            {words ? <span className="ui-iconbtn-label">{words}</span> : null}
        </button>
    );
}

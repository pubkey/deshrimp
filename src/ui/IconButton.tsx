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
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type IconButtonProps = Base & {
    icon?: ReactNode;
    /** What the button does, in words: it is the title *and* the aria-label. */
    label?: string;
    disabled?: boolean;
    onClick?: () => void;
};

export function IconButton({ icon, label, disabled, onClick, className, children, style, id }: IconButtonProps) {
    return (
        <button
            id={id}
            style={style}
            className={cx('ui-iconbtn', className)}
            onClick={onClick}
            title={label}
            aria-label={label}
            type="button"
            disabled={disabled}
        >
            {icon || children}
        </button>
    );
}

/**
 * # IconButton — a square button with no words
 *
 * ## What it does and how it looks
 * A small square holding one glyph: the share button, the theme toggle, a
 * delete cross on a row. Quiet until hovered.
 *
 * `label` is **required in practice**, because a button whose only content is
 * „✕" is unusable with a screen reader and unlabelled on hover. It becomes both
 * the `title` and the `aria-label`.
 *
 * ## Core parts
 * - `icon` — one character. Emoji or a symbol, never an image.
 * - `label` — what it does, in words. Not optional in spirit.
 *
 * ## Examples
 * ```tsx
 * <IconButton icon="✕" label="Notiz löschen" onClick={() => remove(note.id)} />
 * <IconButton icon="⤓" label="Meine Eingaben sichern" onClick={save} />
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

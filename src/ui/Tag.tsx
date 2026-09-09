/**
 * # Tag — a filter you can press
 *
 * ## What it does and how it looks
 * A pill like `<Badge>`, but a real `<button>`: a filter chip, a genre, a
 * sort option. Pressed state is a filled pill.
 *
 * Without `onClick` it renders disabled, and that is deliberate: a chip that
 * looks pressable and is not is worse than a plain label. If nothing happens
 * when you press it, use `<Badge>`.
 *
 * ## Core parts
 * - `active` — the filled, selected look.
 * - `onClick` — its absence disables the chip.
 *
 * ## Examples
 * ```tsx
 * <Tag active={tag === active} onClick={() => setActive(tag)}>{tag}</Tag>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type TagProps = Base & { active?: boolean; onClick?: () => void };

export function Tag({ active, onClick, className, children, style, id }: TagProps) {
    return (
        <button
            id={id}
            style={style}
            className={cx('ui-tag', active && 'on', className)}
            type="button"
            onClick={onClick}
            disabled={!onClick}
        >
            {children}
        </button>
    );
}

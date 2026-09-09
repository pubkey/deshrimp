/**
 * # Toolbar — a strip of controls
 *
 * ## What it does and how it looks
 * A low, wide, sunk strip that holds controls belonging together: a sort bar,
 * a filter row, a legend. It reads as chrome rather than content — quieter
 * background, tighter padding, no shadow.
 *
 * ## Core parts
 * - just `children`. What goes in is `<Tag>`s, `<Button>`s and `<Muted>` text;
 *   the strip itself has no opinions beyond spacing them.
 *
 * ## Examples
 * ```tsx
 * <Toolbar><Eyebrow>Sortieren</Eyebrow>{sorts.map((s) => <Tag key={s.id}>…</Tag>)}</Toolbar>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type ToolbarProps = Base;

export function Toolbar({ className, children, style, id }: ToolbarProps) {
    return <div id={id} style={style} className={cx('ui-toolbar', className)}>{children}</div>;
}

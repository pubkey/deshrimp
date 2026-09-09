/**
 * # Badge — a small standing label
 *
 * ## What it does and how it looks
 * A pill of text at caption size: a status („gehört"), a count („3× fehlt"), a
 * price beside a title. Static — a badge says something, it does not do
 * anything. The one you can press is `<Tag>`.
 *
 * ## Core parts
 * - `tone` — `"accent"` · `"ok"` · `"warn"` · `"bad"` · `"quiet"`. Unset is the neutral
 *   outline. The semantic tones are for state, not decoration.
 *
 * ## Examples
 * ```tsx
 * <Badge tone="ok">gehört</Badge>
 * <Badge tone="quiet"><Price value={option.price} /></Badge>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type BadgeProps = Base & { tone?: 'accent' | 'ok' | 'warn' | 'bad' | 'quiet' };

export function Badge({ tone, className, children, style, id }: BadgeProps) {
    return <span id={id} style={style} className={cx('ui-badge', tone, className)}>{children}</span>;
}

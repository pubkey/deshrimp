/**
 * # Wrap — the reading column
 *
 * ## What it does and how it looks
 * A centred column with a maximum width and the page's side padding. It is what
 * keeps a paragraph from running 1600 px wide on a desktop screen; on a phone
 * it is simply the page with its margins. `<Page>` already puts one around
 * everything, so a page reaches for this only when a section needs a *different*
 * width than the rest.
 *
 * ## Core parts
 * - `width` — `"narrow"` (720 px, text-heavy) or `"wide"` (1180 px, tables,
 *   maps, galleries). Unset is the default 940 px column.
 * - the widths themselves are `--maxw*` tokens in `theme.css`, never numbers
 *   here, so „the column" means one thing across every page.
 *
 * ## Examples
 * ```tsx
 * <Wrap width="narrow">…</Wrap>   // a long read
 * <Wrap width="wide"><Table … /></Wrap>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 `width="full"` — edge-to-edge, for dashboard pages whose
 *   content is tiles rather than prose.
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base } from './_types';

export type WrapProps = Base & { width?: 'narrow' | 'wide' | 'full' };

export function Wrap({ width, className, children, style, id }: WrapProps) {
    return <div className={cx('ui-wrap', width, className)} style={style} id={id}>{children}</div>;
}

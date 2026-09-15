/**
 * # Tiles - the page as one grid, not a stack of sections
 *
 * ## What it does and how it looks
 * A single grid that every tile on the page drops into. Columns are **at least
 * 330px and at most 660px**, as many as fit, and they share whatever width is
 * left over - so the same markup is one column on a phone, two on a tablet and
 * four on a desk monitor, with no breakpoints written anywhere.
 *
 * ## Why a grid rather than sections
 * The page used to be five sections stacked head to foot, which on a wide
 * screen meant a 940px column of content and a third of the window left empty
 * beside it. A dashboard is a set of readouts that are each independently
 * worth a glance, and that is a grid.
 *
 * ## How the two bounds are held
 * `repeat(auto-fit, minmax(min(330px, 100%), 1fr))`, and a `max-width: 660px`
 * on the tile itself:
 *
 * - **auto-fit** counts how many 330px columns fit and then lets them grow to
 *   share the row, so a row is always full rather than left-aligned with a gap
 *   at the end.
 * - **The 660px cap is on the tile, not on the track**, and that is not a
 *   detail. `auto-fit` takes its track count from the track's *max* sizing
 *   function whenever that is a definite length - so `minmax(330px, 660px)`
 *   asks for as many 660px columns as fit and answers "two" on a 1352px page,
 *   the opposite of what is wanted. `1fr` is indefinite, so the count falls
 *   back to the 330px minimum, which is the number we actually meant.
 * - **660px at all** because past it a line of text is too long to track back
 *   and a chart is mostly air. With `justify-content: center` a grid narrower
 *   than its container sits centred rather than pinned left.
 * - **`min(330px, 100%)`** keeps a 320px phone from overflowing: a bare 330px
 *   minimum is wider than the screen, and the page would scroll sideways.
 *
 * Tiles stretch to the height of their row, so a row reads as one band rather
 * than as a ragged edge; a tile's own content stays at its top.
 *
 * ## Core parts
 * - Children are the tiles - `<Panel>`, usually. Each one carries an `id`, so
 *   a tile can be linked to and named in a conversation about the page.
 * - Nothing spans two columns: two columns plus the gap is 684px, which is
 *   past the 660px a tile is allowed to be.
 *
 * ## Examples
 * ```tsx
 * <Tiles>
 *     <Panel id="video">…</Panel>
 *     <Panel id="daychart" title="Straight per day">…</Panel>
 * </Tiles>
 * ```
 *
 * ## Changelog
 * - 2026-09-15 First version, replacing the stacked `<Section>` layout.
 */

import { cx } from './cx';
import type { Base } from './_types';

export function Tiles({ className, children, style, id }: Base) {
    return (
        <div className={cx('ui-tiles', className)} id={id} style={style}>
            {children}
        </div>
    );
}

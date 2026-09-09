/**
 * # Details — the part that would bury the answer
 *
 * ## What it does and how it looks
 * A bordered strip with a caret and a summary line; clicking it unfolds the
 * content below. A count can sit at the right end („3"), for „how much is
 * hidden in here".
 *
 * A native `<details>`, which buys three things a scripted accordion does not:
 * it works before (and without) JavaScript, the browser's find-in-page can open
 * it, and **it prints open** — so a page that gets printed does not lose half
 * its content.
 *
 * ## Core parts
 * - `summary` — the always-visible line. Default „Mehr", which is a bad
 *   default: say what is inside.
 * - `open` — start unfolded.
 * - `count` — the right-hand number.
 *
 * ## Examples
 * ```tsx
 * <Details summary="Wie die Fahrzeit gerechnet ist" count={3}>…</Details>
 * <Details summary="Alle 24 Zutaten" open>…</Details>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export type DetailsProps = Base & {
    summary?: ReactNode;
    open?: boolean;
    /** Right-hand count, e.g. the number of hidden rows. */
    count?: number | string;
};

export function Details({ summary, open, count, className, children, id }: DetailsProps) {
    return (
        <details className={cx('ui-details', className)} open={open || undefined} id={id}>
            <summary className="ui-details-summary">
                <span className="ui-details-caret" aria-hidden="true">›</span>
                <span className="ui-details-label">{summary || uiText().more}</span>
                {count != null ? <span className="ui-details-count">{count}</span> : null}
            </summary>
            <div className="ui-details-body">{children}</div>
        </details>
    );
}

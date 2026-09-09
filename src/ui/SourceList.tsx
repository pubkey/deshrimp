/**
 * # SourceList — where the answer came from
 *
 * ## What it does and how it looks
 * A numbered list at the foot of the page: `[1]` in monospace in the margin,
 * the title as a link, the bare domain and path under it in small type, and
 * then **two sentences** saying what is on that page. It brings its own
 * `<Section>` titled „Quellen".
 *
 * The shape is not invented here: `CLAUDE.md` §3 prescribes exactly this for
 * every URL the repo stores — link, title, and two sentences so a future reader
 * knows what the link holds without fetching it. This renders that shape.
 *
 * Every entry is an anchor (`#src-1`), so a claim in the body can point at the
 * source it came from, and `:target` highlights it when someone follows the
 * link.
 *
 * ## Core parts
 * - `items` — `{ id, title, url, note, checked }`. An empty list renders
 *   nothing, so a page can always include the component.
 * - `checked` — an ISO date, shown as an `<AsOf>` chip beside the title.
 * - `section={false}` — the bare list, for embedding in a panel.
 *
 * ## Examples
 * ```tsx
 * <SourceList items={data.sources} />
 * <SourceList section={false} items={[{ title: 'Booking', url, note: '…' }]} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-09-01 `SOURCE_LIST_TITLE` exported; `<PageMeta>` renders the list
 *   inside the closing block, so a page passes `sources` to `<Page>`.
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version, and the blueprint ends every page with one.
 */

import { AsOf } from './AsOf';
import { Section } from './Section';
import { inline } from './_inline';
import { prettyUrl } from './links';
import { uiText } from './lang';
import type { ReactNode } from './_types';

/** One heading on every page, like „Datengrundlage" — `<PageMeta>` reuses it. */
/** @deprecated Read `uiText().sourcesTitle` — this one is always German. */
export const SOURCE_LIST_TITLE = 'Quellen';

export type Source = {
    /** Makes the anchor `#src-<id>` instead of `#src-<n>`. */
    id?: string;
    title?: string;
    url?: string;
    /** The two sentences CLAUDE.md §3 asks for on every stored URL. */
    note?: string;
    /** ISO date the link was last checked. */
    checked?: string;
};

export type SourceListProps = {
    items: Source[];
    title?: ReactNode;
    subtitle?: ReactNode;
    /** `false` drops the surrounding `<Section>`. */
    section?: boolean;
    id?: string;
};

export function SourceList({ items, title, subtitle, section, id }: SourceListProps) {
    const list = (items || []).filter(Boolean);
    if (!list.length) return null;

    const body = (
        <ol className="ui-sources">
            {list.map((it, i) => {
                const n = i + 1;
                return (
                    <li className="ui-sources-item" id={'src-' + (it.id || n)} key={it.id || i}>
                        <div className="ui-sources-top">
                            {it.url ? (
                                <a className="ui-sources-title" href={it.url}
                                    target="_blank" rel="noopener noreferrer">
                                    {it.title || prettyUrl(it.url)}
                                </a>
                            ) : (
                                <span className="ui-sources-title">{it.title}</span>
                            )}
                            {it.checked ? <AsOf date={it.checked} label="geprüft" /> : null}
                        </div>
                        {it.url ? <div className="ui-sources-url">{prettyUrl(it.url)}</div> : null}
                        {it.note ? (
                            <div className="ui-sources-note">{inline(it.note, 'src' + n)}</div>
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );

    if (section === false) return body;
    return (
        <Section id={id || 'quellen'} title={title || uiText().sourcesTitle} subtitle={subtitle}>
            {body}
        </Section>
    );
}

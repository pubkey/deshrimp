/**
 * # Markdown — researched prose, safely
 *
 * ## What it does and how it looks
 * Renders a short passage of Markdown-lite as body copy: paragraphs separated
 * by a blank line, with `**bold**`, `*italic*`, `` `code` `` and links inside
 * them. It looks like ordinary running text at the page's reading width — no
 * frame, no background, nothing that says „this is a widget".
 *
 * The reason it exists rather than a `<p>{text}</p>` is safety: everything a
 * skill researches comes from someone else's page. This builds **real React
 * elements**, never `innerHTML`, so a `<script>` in a scraped hotel description
 * lands on the page as visible text, and a `javascript:` URL never becomes a
 * link.
 *
 * ## Core parts
 * - `text` — the source. Empty or missing renders nothing at all, so a page can
 *   pass an optional field straight in without guarding it.
 * - `inline()` from `_inline.tsx` — the shared span-level parser, used here and
 *   by every component that renders one line of researched prose.
 * - block splitting on a blank line is the only block-level rule there is:
 *   no headings, no lists, no tables. A page that needs those has components.
 *
 * ## Examples
 * ```tsx
 * <Markdown text={slide.why_look} />
 * <Markdown text={"Erste Zeile\nZweite Zeile\n\nNeuer Absatz"} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Moved out of `components.js` into its own file; the inline
 *   parser it shares with the prose components moved to `_inline.tsx`.
 */

import { cx } from './cx';
import { inline } from './_inline';

export type MarkdownProps = {
    text?: string | null;
    className?: string;
};

export function Markdown({ text, className }: MarkdownProps) {
    if (!text) return null;
    return (
        <div className={cx('ui-prose', className)}>
            {String(text).split(/\n{2,}/).map((block, i) => (
                <p key={i}>{inline(block, 'p' + i)}</p>
            ))}
        </div>
    );
}

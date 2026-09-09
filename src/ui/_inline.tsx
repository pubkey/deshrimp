/**
 * Markdown-lite, the inline half: `**bold**`, `*italic*`, `` `code` ``,
 * `[text](url)`, and a single newline as a line break.
 *
 * Deliberately tiny, and deliberately building **real React elements** rather
 * than setting `innerHTML`: researched copy arrives from shops, hotels and
 * strangers' pages, and a stray `<script>` in it has to end up as text. The
 * link rule is part of that — only `http(s)`, `mailto`, `#` and `/` survive, so
 * a `javascript:` URL in a scraped description cannot become a link.
 *
 * Not a component: `<Markdown>` is the component, this is what it and the
 * half-dozen one-line-of-prose components (`<Because>`, `<Hours>`, …) share.
 */

import type { ReactNode } from 'react';
import { Fragment } from 'react';

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/;

export function inline(text: string, keyBase: string): ReactNode[] {
    return String(text).split(INLINE).map((part, i) => {
        const key = `${keyBase}-${i}`;
        if (!part) return null;
        if (part.slice(0, 2) === '**' && part.slice(-2) === '**') {
            return <b key={key}>{part.slice(2, -2)}</b>;
        }
        if (part[0] === '*' && part.slice(-1) === '*' && part.length > 2) {
            return <i key={key}>{part.slice(1, -1)}</i>;
        }
        if (part[0] === '`' && part.slice(-1) === '`') {
            return <code key={key} className="ui-mono">{part.slice(1, -1)}</code>;
        }
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
            const href = link[2];
            if (!/^(https?:|mailto:|#|\/)/i.test(href)) return part;
            return (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer">{link[1]}</a>
            );
        }
        // Plain run: keep single newlines as line breaks.
        return part.split('\n').map((line, j) => (
            j === 0 ? line : <Fragment key={`${key}-${j}`}><br />{line}</Fragment>
        ));
    });
}

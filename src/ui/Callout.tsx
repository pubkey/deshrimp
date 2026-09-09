/**
 * # Callout — the one thing to read if you read nothing else
 *
 * ## What it does and how it looks
 * A tinted block with an optional icon on the left and a bold first line: the
 * summary at the top of a page, the warning that changes what the reader should
 * do. It is louder than a `<Panel>` on purpose, which is also why a page should
 * hold one or two, not six.
 *
 * ## Core parts
 * - `tone` — unset is the accent tint; `"warn"` and `"bad"` are the semantic
 *   colours, and they should mean it.
 * - `title` — the bold first line.
 * - `icon` — a single emoji, decorative and hidden from screen readers.
 * - a string child is run through `<Markdown>`, so bold and links work without
 *   the caller thinking about it; element children pass through untouched.
 *
 * ## Examples
 * ```tsx
 * <Callout title="Kurz gesagt">{intro}</Callout>
 * <Callout tone="warn" icon="✎" title="Beantworte das">…</Callout>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import { Markdown } from './Markdown';
import type { Base, ReactNode } from './_types';

export type CalloutProps = Base & {
    tone?: 'warn' | 'bad';
    title?: ReactNode;
    icon?: string;
};

export function Callout({ tone, title, icon, className, children, style, id }: CalloutProps) {
    return (
        <div id={id} style={style} className={cx('ui-callout', tone, className)}>
            {icon ? <div className="ui-callout-icon" aria-hidden="true">{icon}</div> : null}
            <div className="ui-grow">
                {title ? <div className="ui-h5">{title}</div> : null}
                {typeof children === 'string' ? <Markdown text={children} /> : children}
            </div>
        </div>
    );
}

/**
 * # Because — the one line of reasoning under a recommendation
 *
 * ## What it does and how it looks
 * A small uppercase label — „WARUM" in the accent colour — and one sentence
 * beside it, at caption size, in the softer ink. It sits directly under the
 * thing it justifies: a shoe, a hotel, a track, a stop on a route.
 *
 * It exists because the demand was measured, not guessed: **32 passages across
 * the SKILL.md files ask for a reason in their own words.** That is what a
 * reason turns into when nothing renders it — prose that gets dropped the
 * moment the page is busy. As a component it is a slot that is visibly empty
 * when nobody filled it.
 *
 * ## Core parts
 * - `children` or `text` — the sentence. Markdown-lite, so a bold word or a
 *   link works without ceremony.
 * - `label` — default „Warum". Use „Warum nicht" for the counter-case, which is
 *   often the more useful of the two.
 * - `tone` — colours the label only: `ok` · `warn` · `bad` · `rec`.
 *
 * ## Examples
 * ```tsx
 * <Because>Einziger Schuh in deiner Weite, den es in 44 noch gibt.</Because>
 * <Because label="Warum nicht" tone="bad">Zimmer zur Straße.</Because>
 * <Because text={track.why} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version. Picked off a ballot of ~35 candidates; the 32
 *   SKILL.md hits made it the clearest case of the lot.
 */

import { cx } from './cx';
import { inline } from './_inline';
import type { Base } from './_types';
import { uiText } from './lang';

export type BecauseProps = Base & {
    /** Alternative to children. Markdown-lite. */
    text?: string;
    /** Default „Warum". */
    label?: string;
    tone?: 'ok' | 'warn' | 'bad' | 'rec';
};

export function Because({ text, label, tone, className, children }: BecauseProps) {
    const body = children != null && children !== '' ? children : text;
    if (body == null || body === '') return null;
    return (
        <p className={cx('ui-because', tone && 'is-' + tone, className)}>
            <span className="ui-because-label">{label || uiText().why}</span>
            <span className="ui-because-text">
                {typeof body === 'string' ? inline(body, 'bc') : body}
            </span>
        </p>
    );
}

/**
 * # Section — one part of the page, with its heading
 *
 * ## What it does and how it looks
 * A `<section>` with an optional heading block above it: a small uppercase
 * eyebrow, an `h2`, and a muted line of subtitle. Below that, the content.
 * Sections are the page's spine — the reader scrolls through them, and the
 * heading is what tells them where they are.
 *
 * `PAGE-SPEC.md` gives `<Page>` the single `h1`; everything inside starts at
 * `h2`, which is exactly what this renders. Never nest a `<Section>` in a
 * `<Section>`: two `h2`s at different depths make the outline a lie.
 *
 * ## Core parts
 * - `title` — the `h2`. Without it (and without `subtitle`) no heading block is
 *   rendered at all, which is the honest way to have an untitled section.
 * - `subtitle` — one line saying what the section is for.
 * - `eyebrow` — a category above the title, uppercase and tracked.
 * - `id` — the anchor. Give one to any section something links to.
 *
 * ## Examples
 * ```tsx
 * <Section title="Optionen" subtitle="Abhaken, bewerten, kommentieren.">…</Section>
 * <Section id="datengrundlage" title="Datengrundlage">…</Section>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type SectionProps = Base & {
    title?: ReactNode;
    subtitle?: ReactNode;
    eyebrow?: ReactNode;
};

export function Section({ title, subtitle, eyebrow, className, children, style, id }: SectionProps) {
    return (
        <section className={cx('ui-section', className)} id={id} style={style}>
            {(title || subtitle) ? (
                <div className="ui-section-head">
                    {eyebrow ? <div className="ui-eyebrow">{eyebrow}</div> : null}
                    {title ? <h2 className="ui-h2">{title}</h2> : null}
                    {subtitle ? <p className="ui-text ui-muted">{subtitle}</p> : null}
                </div>
            ) : null}
            {children}
        </section>
    );
}

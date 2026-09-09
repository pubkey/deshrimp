/**
 * # Heading — a heading whose level is a value
 *
 * ## What it does and how it looks
 * The same heading as `<H2>`, except the level is a prop. Identical output —
 * this exists only for the case where the level is computed, e.g. a component
 * rendered at different depths of the same page.
 *
 * Prefer `<H2>`…`<H6>` when you know the level: a literal in the markup is what
 * makes the document outline readable at a glance.
 *
 * ## Core parts
 * - `level` — `1`–`6`, default `2`.
 *
 * ## Examples
 * ```tsx
 * <Heading level={depth + 1}>{node.title}</Heading>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { renderHeading, type HeadingLevel, type HeadingProps } from './_heading';

export type { HeadingLevel };
export type HeadingComponentProps = HeadingProps & { level?: HeadingLevel };

export function Heading({ level = 2, ...props }: HeadingComponentProps) {
    return renderHeading(level, props);
}

/**
 * # H3 — a level-3 heading
 *
 * ## What it does and how it looks
 * An `<h3>` at the type scale's level 3. A heading inside a block, quieter
 * than the one above it.
 *
 * ## Core parts
 * - `className` / `id` / `style` — nothing else. A heading with options is a
 *   heading that will drift out of the type scale.
 * - the markup comes from `_heading.tsx`, shared by all six.
 *
 * ## Examples
 * ```tsx
 * <H3>Überschrift</H3>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { headingComponent, type HeadingProps } from './_heading';

export type H3Props = HeadingProps;

export const H3 = headingComponent(3);

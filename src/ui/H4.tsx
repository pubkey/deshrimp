/**
 * # H4 — a level-4 heading
 *
 * ## What it does and how it looks
 * An `<h4>` at the type scale's level 4. A heading inside a block, quieter
 * than the one above it.
 *
 * ## Core parts
 * - `className` / `id` / `style` — nothing else. A heading with options is a
 *   heading that will drift out of the type scale.
 * - the markup comes from `_heading.tsx`, shared by all six.
 *
 * ## Examples
 * ```tsx
 * <H4>Überschrift</H4>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { headingComponent, type HeadingProps } from './_heading';

export type H4Props = HeadingProps;

export const H4 = headingComponent(4);

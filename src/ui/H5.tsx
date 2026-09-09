/**
 * # H5 — a level-5 heading
 *
 * ## What it does and how it looks
 * An `<h5>` at the type scale's level 5. A heading inside a block, quieter
 * than the one above it.
 *
 * ## Core parts
 * - `className` / `id` / `style` — nothing else. A heading with options is a
 *   heading that will drift out of the type scale.
 * - the markup comes from `_heading.tsx`, shared by all six.
 *
 * ## Examples
 * ```tsx
 * <H5>Überschrift</H5>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { headingComponent, type HeadingProps } from './_heading';

export type H5Props = HeadingProps;

export const H5 = headingComponent(5);

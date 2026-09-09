/**
 * # H2 — a level-2 heading
 *
 * ## What it does and how it looks
 * An `<h2>` at the type scale's level 2. Section-heading weight; `<Section
 * title>` renders one for you, so use this only for a heading outside a
 * section.
 *
 * ## Core parts
 * - `className` / `id` / `style` — nothing else. A heading with options is a
 *   heading that will drift out of the type scale.
 * - the markup comes from `_heading.tsx`, shared by all six.
 *
 * ## Examples
 * ```tsx
 * <H2>Überschrift</H2>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { headingComponent, type HeadingProps } from './_heading';

export type H2Props = HeadingProps;

export const H2 = headingComponent(2);

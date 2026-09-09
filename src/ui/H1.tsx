/**
 * # H1 — a level-1 heading
 *
 * ## What it does and how it looks
 * An `<h1>` at the type scale's level 1. Page-wide title weight — but note
 * that `<Page>` already renders the page's single `h1` (`PAGE-SPEC.md`), so a
 * page body almost never needs this one.
 *
 * ## Core parts
 * - `className` / `id` / `style` — nothing else. A heading with options is a
 *   heading that will drift out of the type scale.
 * - the markup comes from `_heading.tsx`, shared by all six.
 *
 * ## Examples
 * ```tsx
 * <H1>Überschrift</H1>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { headingComponent, type HeadingProps } from './_heading';

export type H1Props = HeadingProps;

export const H1 = headingComponent(1);

/**
 * # Money — a number, formatted German
 *
 * ## What it does and how it looks
 * A `<span>` with tabular figures holding a formatted amount: `€1.284,50`.
 * Tabular is what makes a column of them line up.
 *
 * The rule it enforces is small but real: **anything the page computes goes
 * through here.** A sum printed as `1284.5` is a page that was written in
 * English and read in German.
 *
 * For a price that came *from a shop*, use `<Price>` instead — that one also
 * says how sure it is.
 *
 * ## Core parts
 * - `value` — a number gets formatted; a string passes through as written.
 * - `currency` — the symbol in front. Default `€`.
 * - `money(n, sym)` in `money.ts` is the function behind it, for a label or a
 *   title attribute where an element will not do.
 *
 * ## Examples
 * ```tsx
 * <Money value={1284.5} />              // €1.284,50
 * <Money value={total} currency="CHF" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import { money } from './currency';
import type { Base } from './_types';

export type MoneyProps = Base & { value?: string | number | null; currency?: string };

export function Money({ value, currency, className }: MoneyProps) {
    const text = typeof value === 'number' ? money(value, currency || '€') : value;
    if (text == null) return null;
    return <span className={cx('ui-money', className)}>{text}</span>;
}

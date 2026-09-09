/**
 * # Price — a price that says how sure it is
 *
 * ## What it does and how it looks
 * The amount in semibold tabular figures, an optional „/ Nacht" after it, and
 * then a small marker: `geprüft 30.08.2026`, `geschätzt`, or — when neither was
 * given — a red **`ungeprüft`**.
 *
 * That last case is the whole point. Every skill's SKILL.md says the same thing
 * in its own words: verify the price, mark it with the date it was checked,
 * never invent one (`CLAUDE.md` §1 rule 9). Until this component that was free
 * text every single time, i.e. a rule you had to remember. Here a price without
 * a date is *visibly* a price without a date, on the page, where he can see it.
 *
 * ## Core parts
 * - `value` — `"€290"` as the shop wrote it, or a number to be formatted.
 * - `checked` — ISO date it was actually looked at. This is the good case.
 * - `estimated` — not checked, and known not to be. Renders „geschätzt".
 * - `per` — what the price is per: `"/ Nacht"`, `"pro Person"`.
 * - `mark={false}` — drops the marker. Only where the page states the date
 *   itself, e.g. once above a whole table.
 *
 * ## Examples
 * ```tsx
 * <Price value="€290" checked="2026-08-30" />
 * <Price value="€79" estimated />
 * <Price value="€180" per="/ Nacht" />        // → „ungeprüft"
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version: the „ungeprüft" marker exists so an unverified
 *   number cannot look verified.
 */

import { cx } from './cx';
import { money } from './currency';
import type { Base } from './_types';

export type PriceProps = Base & {
    value?: string | number | null;
    currency?: string;
    per?: string;
    /** ISO date the price was actually checked at the shop. */
    checked?: string;
    /** Not checked and known not to be. */
    estimated?: boolean;
    /** `false` drops the marker. */
    mark?: boolean;
};

export function Price({ value, currency, per, checked, estimated, mark, className }: PriceProps) {
    const text = typeof value === 'number' ? money(value, currency || '€') : value;
    if (text == null || text === '') return null;

    let marker = null;
    if (estimated) {
        marker = (
            <span className="ui-price-mark ui-price-est" title="Geschätzt, nicht am Shop geprüft.">
                geschätzt
            </span>
        );
    } else if (checked) {
        marker = (
            <span className="ui-price-mark" title={`Am ${checked} im Shop geprüft.`}>
                geprüft {checked}
            </span>
        );
    } else {
        marker = (
            <span className="ui-price-mark ui-price-open" title="Kein Prüfdatum hinterlegt.">
                ungeprüft
            </span>
        );
    }

    return (
        <span className={cx('ui-price', className)}>
            <span className="ui-price-value">{text}</span>
            {per ? <span className="ui-price-per"> {per}</span> : null}
            {mark === false ? null : marker}
        </span>
    );
}

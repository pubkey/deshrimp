/**
 * # Score — what guests thought
 *
 * ## What it does and how it looks
 * A bold number („8,6") with a small label beside it and the review count under
 * it. German decimal comma, one decimal place — because that is how Booking
 * writes it and how he reads it.
 *
 * The counterpart to `<Stars>`: stars are what a hotel *is*, a score is what
 * people said about it.
 *
 * ## Core parts
 * - `score` — a number is formatted to one decimal with a comma; a string is
 *   printed as given, for a source that grades differently.
 * - `label` — „Fabelhaft", „Sehr gut".
 * - `count` — number of reviews. A 9,4 from three people is not a 9,4, and the
 *   count is what lets him see that.
 *
 * ## Examples
 * ```tsx
 * <Score score={8.6} label="Fabelhaft" count={1284} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import type { ReactNode } from './_types';

export type ScoreProps = { score?: number | string; label?: ReactNode; count?: number | string };

export function Score({ score, label, count }: ScoreProps) {
    if (score == null) return null;
    return (
        <span className="ui-score">
            <b>{typeof score === 'number' ? score.toFixed(1).replace('.', ',') : score}</b>
            <span>
                {label ? <span className="lbl">{label}</span> : null}
                {count ? <span className="cnt"> · {count} Bewertungen</span> : null}
            </span>
        </span>
    );
}

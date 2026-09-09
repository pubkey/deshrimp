/**
 * # Stars — a hotel's star rating
 *
 * ## What it does and how it looks
 * Between one and five ★ characters in the accent gold, inline in a listing's
 * meta line. Zero renders nothing at all, which is right: „no stars" and „not
 * rated" are the same thing here and neither deserves an empty row of outlines.
 *
 * The count is what a hotel *is* (a four-star hotel), not what guests thought —
 * that is `<Score>`.
 *
 * ## Core parts
 * - `count` — rounded to a whole number. The `aria-label` says „4 Sterne", so a
 *   screen reader gets the number rather than four bullet characters.
 *
 * ## Examples
 * ```tsx
 * <Stars count={hotel.stars} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

export type StarsProps = { count?: number };

export function Stars({ count }: StarsProps) {
    const n = Math.round(count || 0);
    if (!n) return null;
    return <span className="ui-stars" aria-label={`${n} Sterne`}>{'★'.repeat(n)}</span>;
}

/** Dates, the two ways this library needs them. */

/**
 * `"2026-08-30"` → `"30.08.2026"`. Anything that is not a plain ISO date comes
 * back untouched: a page may well have stored „Sommer 2027", and mangling that
 * into a wrong date is worse than printing it as written.
 */
export function deDate(value: string | null | undefined): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    return m ? `${m[3]}.${m[2]}.${m[1]}` : String(value ?? '');
}

/**
 * Whole days between an ISO date and today. `null` when unparseable — so a
 * caller can tell „not a date" from „today", which a `0` would hide.
 */
export function daysSince(value: string | null | undefined): number | null {
    const t = Date.parse(String(value || '') + 'T00:00:00');
    if (isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
}

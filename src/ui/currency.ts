/**
 * Prices as they arrive from shops, and prices the page works out itself.
 *
 * Shops write a price a dozen ways („€1.299,00", „290 EUR", „$1,299.00"), and a
 * page that adds them up has to read all of them. Every function here refuses
 * rather than guesses: a wrong total is worse than no total.
 */

/** German number formatting, in one place. `money(1284.5)` → `"€1.284,50"`. */
export function money(value: number | null | undefined, currency = '€'): string | null {
    if (value == null || isNaN(value)) return null;
    const s = Number(value).toLocaleString('de-DE', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    });
    return currency ? currency + s : s;
}

const CURRENCIES: [string, string][] = [
    ['€', '€'], ['eur', '€'], ['$', '$'], ['usd', '$'],
    ['£', '£'], ['gbp', '£'], ['chf', 'CHF'],
];

export type ParsedPrice = { sym: string; value: number };

/**
 * `"€1.299,00"` → `{ sym: '€', value: 1299 }`. `null` when unsure — including
 * when no currency is named at all, because a bare number could be anything.
 */
export function parsePrice(text: string | number | null | undefined): ParsedPrice | null {
    if (text == null) return null;
    if (typeof text === 'number') return { sym: '€', value: text };
    const low = String(text).toLowerCase();
    let sym: string | null = null;
    for (const [needle, symbol] of CURRENCIES) {
        if (low.indexOf(needle) !== -1) { sym = symbol; break; }
    }
    if (!sym) return null;
    const m = /\d[\d.,\s']*\d|\d/.exec(low);
    if (!m) return null;
    let raw = m[0].replace(/[\s']/g, '');
    if (raw.indexOf(',') !== -1 && raw.indexOf('.') !== -1) {
        // Both separators present: the last one is the decimal point.
        const dec = raw.lastIndexOf(',') > raw.lastIndexOf('.') ? ',' : '.';
        raw = raw.split(dec === '.' ? ',' : '.').join('').replace(dec, '.');
    } else if (raw.indexOf(',') !== -1 || raw.indexOf('.') !== -1) {
        // One separator: three trailing digits means thousands, else decimals.
        const sep = raw.indexOf(',') !== -1 ? ',' : '.';
        const parts = raw.split(sep);
        const thousands = parts[parts.length - 1].length === 3 && parts.length === 2;
        raw = thousands ? parts.join('') : parts.join('.');
    }
    const v = parseFloat(raw);
    return isNaN(v) ? null : { sym, value: v };
}

export function formatPrice(sym: string, value: number): string {
    const whole = Math.abs(value - Math.round(value)) < 0.005
        ? Math.round(value).toLocaleString('de-DE')
        : value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (sym === '€' || sym === '$' || sym === '£') ? sym + whole : whole + ' ' + sym;
}

/**
 * A piece he already owns carries no price to add. A helper rather than a
 * regex in two places, so the row and the total agree on what „hab ich" means.
 */
export function isOwned(it: { owned?: boolean; price?: string | number | null }): boolean {
    return it.owned === true || /^\s*(hab|habe) ich\b/i.test(String(it.price || ''));
}

/**
 * Total of a list of items — `null` if a price is missing or the currencies
 * differ, because „€290 + $79" has no answer. Items he owns are skipped.
 */
export function sumPrices(
    items: { owned?: boolean; price?: string | number | null }[],
): string | null {
    const parsed: ParsedPrice[] = [];
    const syms: Record<string, true> = {};
    for (const it of items || []) {
        if (isOwned(it) || it.price == null || it.price === '') continue;
        const p = parsePrice(it.price);
        if (!p) return null;
        syms[p.sym] = true;
        parsed.push(p);
    }
    const keys = Object.keys(syms);
    if (!parsed.length || keys.length !== 1) return null;
    return formatPrice(keys[0], parsed.reduce((a, p) => a + p.value, 0));
}

/** Outbound links a page builds rather than stores. */

export type Place = {
    lat?: number;
    lon?: number;
    url?: string;
    query?: string;
    address?: string;
    name?: string;
    title?: string;
};

/**
 * „Auf der Karte ansehen" for a place. Coordinates win over a name, because a
 * name is ambiguous and a coordinate is not; a stored `url` wins over both,
 * since that one was actually checked.
 */
export function mapsUrl(x: Place | string | null | undefined): string {
    if (!x) return '';
    if (typeof x === 'string') {
        return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(x);
    }
    if (x.url) return x.url;
    if (typeof x.lat === 'number' && typeof x.lon === 'number') {
        return `https://www.google.com/maps/search/?api=1&query=${x.lat},${x.lon}`;
    }
    const q = x.query || x.address || x.title || x.name;
    return q ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) : '';
}

/**
 * Directions from one place to another.
 *
 * A plain string is accepted as well as a `Place`, and that is not sugar: every
 * caller in this repo passed a bare place name, which the object-only version
 * turned into `origin=undefined` — a link that opened Maps with nothing in it.
 * The type surfaced it; accepting a string fixes it wherever it is called.
 */
export function directionsUrl(
    from: Place | string | null | undefined,
    to: Place | string | null | undefined,
    mode = 'driving',
): string {
    const pt = (x: Place | string | null | undefined) => {
        if (!x) return '';
        if (typeof x === 'string') return encodeURIComponent(x);
        return (typeof x.lat === 'number' && typeof x.lon === 'number')
            ? `${x.lat},${x.lon}`
            : encodeURIComponent(x.query || x.name || x.title || '');
    };
    return 'https://www.google.com/maps/dir/?api=1&travelmode=' + mode
        + '&origin=' + pt(from) + '&destination=' + pt(to);
}

/** `"https://www.zalando.de/x/y?ref=1"` → `"zalando.de/x/y"`. */
export function prettyUrl(url: string): string {
    let s = String(url || '').replace(/^https?:\/\//, '').replace(/^www\./, '');
    s = s.split('?')[0].split('#')[0].replace(/\/$/, '');
    return s.length > 64 ? s.slice(0, 61) + '…' : s;
}

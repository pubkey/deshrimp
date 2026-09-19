/**
 * # QRCode - the link, for a phone camera
 *
 * ## What it does and how it looks
 * A crisp square SVG QR code, **always dark on white in both themes**. That is
 * deliberate and not an oversight: an inverted QR is legal by the spec, and
 * plenty of scanners refuse it. This code exists to be pointed at with a phone,
 * so it looks the same in dark mode as in light.
 *
 * ## Core parts
 * - `value` - the URL. Too long a URL yields no matrix; the component then
 *   renders `fallback`, or nothing when there is none. An empty value is the
 *   same case: a code of nothing is worth less than the words in its place.
 * - `fallback` - what to show instead when the value does not fit into a code.
 *   Worth passing wherever the QR is the point of the block: a silent gap
 *   leaves the reader thinking the page is broken.
 * - `size` - pixel size of the square, default 208.
 * - the encoder is `qr.ts`, ours, imported like anything else.
 *
 * ## Examples
 * ```tsx
 * <QRCode value={location.href} />
 * <QRCode value={link} fallback={<Muted>Too long for a QR code.</Muted>} />
 * ```
 *
 * ## Changelog
 * - 2026-09-16 The encoder is imported rather than read off `window.QR`, which
 *   nothing ever set: every code fell through to the fallback.
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 `fallback`, for a block whose whole point is the code.
 * - 2026-08-31 Own file.
 */

import { useMemo } from 'react';
import { cx } from './cx';
import type { ReactNode } from './_types';
import { uiText } from './lang';
import { qrMatrix, qrSvgPath } from './qr';

export type QRCodeProps = {
    value?: string;
    size?: number;
    label?: string;
    className?: string;
    /** Shown when the value is too long to encode. */
    fallback?: ReactNode;
};

export function QRCode({ value, size, label, className, fallback }: QRCodeProps) {
    const v = value || '';
    const code = useMemo(() => (v ? qrMatrix(v) : null), [v]);
    if (!code) return <>{fallback || null}</>;

    const quiet = 4;
    const total = code.size + quiet * 2;
    return (
        <svg
            className={cx('ui-qr', className)}
            viewBox={`0 0 ${total} ${total}`}
            width={size || 208}
            height={size || 208}
            shapeRendering="crispEdges"
            role="img"
            aria-label={label || uiText().qrFor(v)}
        >
            <rect width={total} height={total} fill="#ffffff" />
            <g transform={`translate(${quiet},${quiet})`} fill="#111111">
                <path d={qrSvgPath(code)} />
            </g>
        </svg>
    );
}

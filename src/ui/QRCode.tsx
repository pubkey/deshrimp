/**
 * # QRCode — the link, for a phone camera
 *
 * ## What it does and how it looks
 * A crisp square SVG QR code, **always dark on white in both themes**. That is
 * deliberate and not an oversight: an inverted QR is legal by the spec, and
 * plenty of scanners refuse it. This code exists to be pointed at with a phone,
 * so it looks the same in dark mode as in light.
 *
 * ## Core parts
 * - `value` — the URL. Too long a URL yields no matrix; the component then
 *   renders `fallback`, or nothing when there is none.
 * - `fallback` — what to show instead when the value does not fit into a code.
 *   Worth passing wherever the QR is the point of the block: a silent gap
 *   leaves the reader thinking the page is broken.
 * - `size` — pixel size of the square, default 208.
 * - the encoder is `qr.js`, ours, loaded on the same tier as the library and
 *   read off `window.QR`.
 *
 * ## Examples
 * ```tsx
 * <QRCode value={location.href} />
 * <QRCode value={link} fallback={<Muted>Zu lang für einen QR-Code.</Muted>} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 `fallback`, for a block whose whole point is the code.
 * - 2026-08-31 Own file.
 */

import { useMemo } from 'react';
import { cx } from './cx';
import type { ReactNode } from './_types';
import { uiText } from './lang';

type QRLib = {
    matrix: (value: string) => { size: number } | null;
    svgPath: (code: any) => string;
};

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
    const QR = (globalThis as any).QR as QRLib | undefined;
    const code = useMemo(() => (QR ? QR.matrix(v) : null), [v]);
    if (!code || !QR) return <>{fallback || null}</>;

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
                <path d={QR.svgPath(code)} />
            </g>
        </svg>
    );
}

/**
 * # Box — the escape hatch, with the knobs attached
 *
 * ## What it does and how it looks
 * A plain `<div>` that speaks the design system: padding, radius, shadow and
 * surface come from tokens rather than from numbers typed into a style
 * attribute. It looks like whatever you ask for — nothing by default, a raised
 * card with `surface`, an inset well with `sunk`.
 *
 * It is here so that the one-off block a page genuinely needs still lands on
 * the token scale instead of inventing `padding: 13px`.
 *
 * ## Core parts
 * - `pad` — a named step (`xs` `sm` `md` `lg` `xl`), `true` for the default, or
 *   a real CSS length. Named steps map onto `--sN`; a raw length passes through.
 *   This used to put the name straight into the style attribute, where
 *   `padding: sm` is invalid and silently dropped — the box then had no padding
 *   at all, which is exactly the failure a design system is supposed to prevent.
 * - `surface` / `sunk` — raised card, or inset well.
 * - `radius` / `shadow` / `lift` — token steps, not values.
 *
 * ## Examples
 * ```tsx
 * <Box surface pad="md">…</Box>
 * <Box sunk pad="sm" radius="sm">…</Box>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-25 `pad="sm"` mapped onto a token; it used to be emitted as an
 *   invalid CSS length and thrown away by the browser.
 */

import { cx } from './cx';
import type { Base, CSSProperties } from './_types';

const PAD_STEPS: Record<string, string> = {
    '0': '0', none: '0', xs: 'var(--s2)', sm: 'var(--s3)',
    md: 'var(--s4)', lg: 'var(--s5)', xl: 'var(--s6)',
};

export function padValue(pad: BoxProps['pad']): string | undefined {
    if (pad == null || pad === false) return undefined;
    if (pad === true) return 'var(--s4)';
    const key = String(pad);
    return Object.prototype.hasOwnProperty.call(PAD_STEPS, key) ? PAD_STEPS[key] : key;
}

export type BoxProps = Base & {
    surface?: boolean;
    sunk?: boolean;
    pad?: boolean | 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
    radius?: 'sm' | 'md' | 'lg' | 'xl';
    shadow?: 0 | 1 | 2 | 3 | 4;
    lift?: boolean;
};

export function Box(
    { surface, sunk, pad, radius, shadow, lift, className, children, style, id }: BoxProps,
) {
    const merged: CSSProperties = { padding: padValue(pad), ...style };
    return (
        <div
            id={id}
            style={merged}
            className={cx(surface && 'ui-surface', sunk && 'ui-sunk',
                radius && 'ui-r-' + radius, shadow != null && 'ui-sh-' + shadow,
                lift && 'ui-lift', className)}
        >
            {children}
        </div>
    );
}

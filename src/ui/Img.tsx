/**
 * # Img — a picture that holds its space
 *
 * ## What it does and how it looks
 * An image in a box with a fixed aspect ratio, rounded corners and a quiet
 * background. The ratio is the point: the box reserves its height before the
 * image has loaded, so nothing on the page jumps when it arrives.
 *
 * Missing `src` renders **nothing at all** rather than a broken-image icon,
 * which is what lets a page pass an optional photo straight through.
 *
 * ## Core parts
 * - `ratio` — any CSS aspect ratio, `"3/4"` for a product, `"16/9"` for a
 *   place. Prefer it over `height`.
 * - `fit="contain"` — for a product shot on white, which must not be cropped.
 *   The default covers the box.
 * - `eager` — skip lazy loading. Only for an image above the fold.
 * - `alt` — say what is in the picture. It is also what a reader gets when the
 *   image cannot load.
 *
 * ## Examples
 * ```tsx
 * <Img src={option.image} alt={option.name} ratio="3/4" />
 * <Img src={shot} alt="Produktfoto" ratio="1/1" fit="contain" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, CSSProperties } from './_types';

export type ImgProps = Base & {
    src?: string | null;
    alt?: string;
    /** Any CSS aspect ratio, e.g. `"3/4"`. */
    ratio?: string;
    height?: string;
    /** `"contain"` for a product shot on white. */
    fit?: 'cover' | 'contain';
    radius?: 'sm' | 'md' | 'lg' | 'xl';
    eager?: boolean;
};

export function Img({ src, alt, ratio, height, fit, radius, eager, className, style, id }: ImgProps) {
    if (!src) return null;
    const merged: CSSProperties = { ...style };
    if (ratio) merged.aspectRatio = ratio;
    if (height) merged.height = height;
    return (
        <div
            id={id}
            style={merged}
            className={cx('ui-img', fit === 'contain' && 'contain',
                radius && 'ui-r-' + radius, className)}
        >
            <img src={src} alt={alt || ''} loading={eager ? undefined : 'lazy'} />
        </div>
    );
}

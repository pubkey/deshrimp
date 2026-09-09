/**
 * # Listing — the shape of „a thing you could book or buy"
 *
 * ## What it does and how it looks
 * A row: picture on the left, body in the middle, a right-hand column for the
 * price and its button. On a phone it stacks. With `recommended` it takes the
 * gold border.
 *
 * It is the skeleton the three real listings are built from —
 * `<BookingListing>`, `<PlaceCard>` and `<ShopItem>` — so a hotel, a restaurant
 * and a pair of shoes look like siblings and only their *content* differs. A
 * page uses this directly only for a fourth kind of thing.
 *
 * ## Core parts
 * - `image` + `alt` — the media column. Without an image the body takes the
 *   full width instead of leaving a hole.
 * - `side` — the right-hand column: price, score, the button.
 * - `media` — `"portrait"` (products) or `"landscape"` (places).
 * - `compact` — the tighter variant used inside `<ShopList>`.
 *
 * ## Examples
 * ```tsx
 * <Listing image={x.image} alt={x.name} side={<Price value={x.price} />}>
 *   <h3 className="ui-listing-title">{x.name}</h3>
 * </Listing>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import { Img } from './Img';
import type { Base, ReactNode } from './_types';

export type ListingProps = Base & {
    image?: string | null;
    alt?: string;
    side?: ReactNode;
    media?: 'portrait' | 'landscape' | 'square';
    compact?: boolean;
    recommended?: boolean;
};

export function Listing({ image, alt, side, media, compact, recommended, className, children }: ListingProps) {
    return (
        <div className={cx('ui-listing', compact && 'compact', media && 'media-' + media,
            recommended && 'rec', className)}>
            {image ? (
                <div className="ui-listing-media"><Img src={image} alt={alt || ''} /></div>
            ) : null}
            <div className="ui-listing-body">{children}</div>
            {side ? <div className="ui-listing-side">{side}</div> : null}
        </div>
    );
}

/** A title that is a link when there is somewhere to go, and plain text when not. */
export function titleLink(title: ReactNode, url?: string): ReactNode {
    return url
        ? <a href={url} target="_blank" rel="noopener noreferrer">{title} ↗</a>
        : title;
}

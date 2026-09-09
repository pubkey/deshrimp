/**
 * # ShopItem — one buyable thing
 *
 * ## What it does and how it looks
 * A `<Listing>` for a garment, a shoe, a piece of furniture: product photo
 * (portrait, because that is how products are shot), brand and name, size,
 * colour and availability, why it fits him, and on the right the price with a
 * „Zum Shop" button.
 *
 * Two details carry real weight. **A struck-through `oldPrice`** beside the
 * current one, so a sale is visible as a sale. And **„hab ich"**: an item he
 * already owns says so instead of a price, and is skipped by every total —
 * `isOwned()` is shared between the row and the sum so the two can never
 * disagree about what he owns.
 *
 * ## Core parts
 * - `title` + `url` + `brand` + `image`.
 * - `price` / `oldPrice` / `priceNote`. `owned`, or a price starting with „hab
 *   ich", takes it out of the arithmetic.
 * - `size` / `color` / `availability` — the meta line.
 * - `role` — the eyebrow above the title in an outfit („Oberteil", „Schuh").
 * - `compact` — the tighter row `<ShopList>` uses; it drops the shop button,
 *   which would repeat once per line in a list of eight.
 * - `desc` is Markdown-lite; `note` is the plain line under it.
 *
 * ## Examples
 * ```tsx
 * <ShopItem title="Racquet" brand="CQP" price="€290" oldPrice="€340"
 *   size="EU 45,5" url={item.url} image={item.photo} recommended />
 * <ShopItem title="Weißes T-Shirt" price="hab ich" role="Oberteil" compact />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 */

import { Badge } from './Badge';
import { Button } from './Button';
import { Listing, titleLink } from './Listing';
import { Markdown } from './Markdown';
import { Row } from './Row';
import { isOwned } from './currency';
import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export type ShopItemProps = Base & {
    title?: ReactNode;
    url?: string;
    image?: string | null;
    brand?: ReactNode;
    price?: string;
    /** Struck through beside the current price. */
    oldPrice?: string;
    priceNote?: ReactNode;
    /** Takes the item out of every total. So does a price starting „hab ich". */
    owned?: boolean;
    size?: ReactNode;
    color?: ReactNode;
    availability?: ReactNode;
    /** The eyebrow above the title in an outfit: „Oberteil", „Schuh". */
    role?: ReactNode;
    badge?: ReactNode;
    desc?: string;
    note?: ReactNode;
    recommended?: boolean;
    compact?: boolean;
    media?: 'portrait' | 'landscape' | 'square';
};

export function ShopItem(props: ShopItemProps) {
    const owned = isOwned(props);
    return (
        <Listing
            image={props.image}
            alt={typeof props.title === 'string' ? props.title : ''}
            compact={props.compact}
            media={props.media || 'portrait'}
            recommended={props.recommended}
            className={props.className}
            side={
                <div>
                    <div className="ui-listing-price">
                        {props.oldPrice ? <span className="was">{props.oldPrice}</span> : null}
                        {owned ? (props.price || uiText().owned) : props.price}
                    </div>
                    {props.priceNote ? <div className="ui-listing-per">{props.priceNote}</div> : null}
                    {props.url && !props.compact ? (
                        <div style={{ marginTop: 'var(--s2)' }}>
                            <Button size="sm" variant="primary" href={props.url}>{uiText().toShop}</Button>
                        </div>
                    ) : null}
                </div>
            }
        >
            {props.role ? <div className="ui-eyebrow">{props.role}</div> : null}
            <Row justify="between" wrap gap={2}>
                <h3 className="ui-listing-title">{titleLink(props.title, props.url)}</h3>
                {props.recommended ? <Badge>{uiText().topPick}</Badge> : null}
                {props.badge ? <Badge>{props.badge}</Badge> : null}
            </Row>
            <div className="ui-listing-meta">
                {props.brand ? <span>{props.brand}</span> : null}
                {props.size ? <span>Größe {props.size}</span> : null}
                {props.color ? <span>{props.color}</span> : null}
                {props.availability ? <span>{props.availability}</span> : null}
            </div>
            {props.desc ? <Markdown className="ui-listing-desc" text={props.desc} /> : null}
            {props.note ? <div className="ui-listing-note">{props.note}</div> : null}
            {props.children}
        </Listing>
    );
}

/**
 * # ShopList — the pieces of an outfit, with a total
 *
 * ## What it does and how it looks
 * A stack of compact `<ShopItem>` rows and, underneath, a bold total line.
 *
 * The total is the honest part: it is computed **only when every price parses
 * and they are all in one currency**. Otherwise it is left out rather than
 * guessed, because a sum that quietly ignored the one item priced in dollars is
 * worse than no sum. Items he already owns are skipped, not counted as zero.
 *
 * ## Core parts
 * - `items` — `<ShopItem>` props, one per piece.
 * - `total` — override the computation. Pass it when the shop states a bundle
 *   price the parts do not add up to.
 * - `totalLabel` — default „Summe"; „Zu kaufen" reads better when some pieces
 *   are already his.
 * - `compact={false}` — full rows with their own shop buttons.
 *
 * ## Examples
 * ```tsx
 * <ShopList items={slide.items} totalLabel="Zu kaufen" />
 * <ShopList items={items} total="€412 (Set-Preis)" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { ShopItem, type ShopItemProps } from './ShopItem';
import { sumPrices } from './currency';
import type { ReactNode } from './_types';

export type ShopListProps = {
    items: ShopItemProps[];
    /** Override the computed sum. */
    total?: ReactNode;
    totalLabel?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function ShopList({ items, total, totalLabel, compact, className }: ShopListProps) {
    const list = items || [];
    const sum = total !== undefined ? total : sumPrices(list);
    return (
        <div className={className}>
            {list.map((it, i) => <ShopItem key={i} compact={compact !== false} {...it} />)}
            {sum ? (
                <div className="ui-listing-total">
                    <span>{totalLabel || 'Summe'}</span><span>{sum}</span>
                </div>
            ) : null}
        </div>
    );
}

/**
 * # Facts — key and value, in a row of chips
 *
 * ## What it does and how it looks
 * A wrapping row of small key/value pairs: „Fahrt 2:20 h", „Größe EU 45,5",
 * „Distanz 210 km". The compact alternative to a two-column table, and the
 * right shape when there are three to six facts about one thing.
 *
 * ## Core parts
 * - `items` — `{ k, v }` (or `{ label, value }`, which reads better in some
 *   data files; both work).
 * - `stat: true` on an item borrows the bigger `<Stat>` treatment for one
 *   number that matters more than its neighbours.
 *
 * ## Examples
 * ```tsx
 * <Facts items={[
 *   { k: 'Strecke', v: '210 km' },
 *   { k: 'Fahrt', v: '2:20 h' },
 *   { k: 'Laden', v: '1× 25 min' },
 * ]} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type Fact = {
    k?: ReactNode;
    v?: ReactNode;
    label?: ReactNode;
    value?: ReactNode;
    /** Renders this one in the larger `<Stat>` style. */
    stat?: boolean;
};

export type FactsProps = Base & { items: Fact[] };

export function Facts({ items, className, style, id }: FactsProps) {
    return (
        <div className={cx('ui-facts', className)} style={style} id={id}>
            {(items || []).map((it, i) => (
                <div className={cx('ui-fact', it.stat && 'ui-stat')} key={i}>
                    <span className="k">{it.k != null ? it.k : it.label}</span>
                    <span className="v">{it.v != null ? it.v : it.value}</span>
                </div>
            ))}
        </div>
    );
}

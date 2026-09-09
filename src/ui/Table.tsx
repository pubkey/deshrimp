/**
 * # Table — rows, columns, and a sort you can click
 *
 * ## What it does and how it looks
 * A bordered table inside a horizontally scrolling wrapper, with a sticky
 * header row whose cells sort when clicked. The wrapper is the important part:
 * a wide table scrolls **inside its own box** rather than pushing the page
 * sideways, which is what keeps a comparison usable on a phone.
 *
 * A row with `recommended: true` gets the gold treatment, matching
 * `<Panel tone="rec">`.
 *
 * ## Core parts
 * - `columns` — `{ key, label, align, width, render, value, sort }`.
 *   `render(row, i)` puts a component in a cell; `value(row)` gives the sorter
 *   something comparable when the cell is not plain text.
 * - `rows` — the data. `row.id` is the React key when present.
 * - `align: 'num'` — right-aligned, tabular figures. Use it for every number.
 * - `sort={false}` on a column, or `sortable={false}` on the table, for data
 *   whose order carries meaning (a day plan, a route).
 * - sorting is `localeCompare` with `numeric: true` in German, so „Etappe 2"
 *   sorts before „Etappe 10" and umlauts land where a reader expects them.
 * - empty rows render `<Empty>` instead of a headed table with nothing in it.
 *
 * ## Examples
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'name', label: 'Hotel' },
 *     { key: 'price', label: 'Preis', align: 'num', render: (r) => <Price value={r.price} /> },
 *   ]}
 *   rows={hotels}
 * />
 * <Table columns={cols} rows={days} sortable={false} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 */

import { useMemo, useState } from 'react';
import { cx } from './cx';
import { Empty } from './Empty';
import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export type TableColumn<R = any> = {
    key: string;
    label?: ReactNode;
    /** `'num'` right-aligns and uses tabular figures. */
    align?: 'num';
    width?: string;
    /** `false` makes this one column unsortable. */
    sort?: boolean;
    render?: (row: R, i: number) => ReactNode;
    /** What to sort by when the cell is not plain text. */
    value?: (row: R) => string | number | null | undefined;
};

export type TableProps<R = any> = Base & {
    columns: TableColumn<R>[];
    rows: R[];
    caption?: ReactNode;
    dense?: boolean;
    striped?: boolean;
    /** `false` when the row order itself is the information. */
    sortable?: boolean;
    sortKey?: string;
    sortDir?: 1 | -1;
    emptyText?: string;
};

export function Table<R extends Record<string, any>>(props: TableProps<R>) {
    const cols = props.columns || [];
    const [sort, setSort] = useState<{ key: string | null; dir: 1 | -1 }>(
        { key: props.sortKey || null, dir: props.sortDir || 1 },
    );

    const rows = useMemo(() => {
        const data = (props.rows || []).slice();
        if (!sort.key) return data;
        const col = cols.filter((c) => c.key === sort.key)[0] || ({} as TableColumn<R>);
        return data.sort((a, b) => {
            const x = col.value ? col.value(a) : a[sort.key as string];
            const y = col.value ? col.value(b) : b[sort.key as string];
            if (x == null) return 1;
            if (y == null) return -1;
            if (typeof x === 'number' && typeof y === 'number') return (x - y) * sort.dir;
            return String(x).localeCompare(String(y), 'de', { numeric: true }) * sort.dir;
        });
    }, [props.rows, sort.key, sort.dir]);

    const clickHead = (c: TableColumn<R>) => {
        if (props.sortable === false || c.sort === false) return;
        setSort((s) => (s.key === c.key
            ? { key: c.key, dir: (-s.dir) as 1 | -1 }
            : { key: c.key, dir: 1 }));
    };

    return (
        <div className={cx('ui-table-wrap', props.className)} id={props.id} style={props.style}>
            <table className={cx('ui-table', props.dense && 'dense', props.striped && 'striped')}>
                {props.caption ? <caption>{props.caption}</caption> : null}
                <thead>
                    <tr>
                        {cols.map((c) => {
                            const sortable = props.sortable !== false && c.sort !== false;
                            return (
                                <th
                                    key={c.key}
                                    scope="col"
                                    style={c.width ? { width: c.width } : undefined}
                                    className={cx(c.align === 'num' && 'num', sortable && 'sortable',
                                        sort.key === c.key && 'on')}
                                    onClick={() => clickHead(c)}
                                    aria-sort={sort.key === c.key
                                        ? (sort.dir === 1 ? 'ascending' : 'descending')
                                        : undefined}
                                >
                                    {c.label != null ? c.label : c.key}
                                    {sortable ? (
                                        <span className="ui-sortmark" aria-hidden="true">
                                            {sort.key === c.key ? (sort.dir === 1 ? '▲' : '▼') : '↕'}
                                        </span>
                                    ) : null}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={r.id != null ? r.id : i} className={r.recommended ? 'rec' : undefined}>
                            {cols.map((c) => (
                                <td key={c.key} className={c.align === 'num' ? 'num' : undefined}>
                                    {c.render ? c.render(r, i) : r[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {!rows.length ? <Empty title={props.emptyText || uiText().noEntries} /> : null}
        </div>
    );
}

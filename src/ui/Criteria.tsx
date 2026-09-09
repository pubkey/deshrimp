/**
 * # Criteria — criteria as rows, options as columns
 *
 * ## What it does and how it looks
 * Two shapes from one component. With a single option it is a list: a ✓, ✕, ~
 * or ? in the margin, the criterion beside it, and „2 von 5 erfüllt" above.
 * With several options it is a table — criteria down the left, one column per
 * option, a mark in every cell, and a count row at the foot.
 *
 * A criterion marked `must` that an option fails is a **knock-out**: the option
 * is struck through in its column header and gets a red „raus" beside it. That
 * is the difference between a comparison and a decision — one ✕ among twelve
 * disappears, a struck-out column does not.
 *
 * `travel/hotels.md` has held a hotel checklist all along that no page ever
 * showed. This is what showing it looks like.
 *
 * ## Core parts
 * - `criteria` — `{ key, label, must, note }`, and `ok` in the single-option
 *   shape. `key` defaults to the row index.
 * - `options` — `{ name, met: { [key]: value } }`. Its absence chooses the list.
 * - values: `true` / `false` (short for `'yes'` / `'no'`), `'partial'`,
 *   `'unknown'` or `null`. Unknown is a real answer and looks like one.
 * - `score={false}` — drops the „x von y erfüllt" line and the foot row.
 * - the table sits in `ui-table-wrap`, so it scrolls inside itself on a phone.
 *
 * ## Examples
 * ```tsx
 * <Criteria criteria={[
 *   { label: 'Parkplatz am Haus', ok: true, must: true },
 *   { label: 'Ruhige Lage', ok: false, note: 'Zur Straße' },
 * ]} />
 *
 * <Criteria
 *   label="Hotelkriterium"
 *   criteria={[{ key: 'park', label: 'Parkplatz', must: true }]}
 *   options={[{ name: 'Marisol', met: { park: true } }]}
 * />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version; the note now sits directly after its criterion
 *   instead of at the far right edge, where it read as a separate column.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export const CRITERIA_STATES = {
    yes: { mark: '✓', label: 'erfüllt' },
    no: { mark: '✕', label: 'nicht erfüllt' },
    partial: { mark: '~', label: 'teilweise' },
    unknown: { mark: '?', label: 'unbekannt' },
} as const;

export type CriteriaState = keyof typeof CRITERIA_STATES;
/** `true`/`false` are the short forms of `'yes'`/`'no'`. */
export type CriteriaValue = boolean | CriteriaState | null | undefined;

export function criteriaState(v: CriteriaValue): CriteriaState {
    if (v === true) return 'yes';
    if (v === false) return 'no';
    if (v == null || (v as string) === '') return 'unknown';
    return CRITERIA_STATES[v as CriteriaState] ? (v as CriteriaState) : 'unknown';
}

function Mark({ state }: { state: CriteriaState }) {
    const meta = CRITERIA_STATES[state];
    return (
        <span className={cx('ui-crit-mark', state)} title={meta.label} aria-label={meta.label}>
            {meta.mark}
        </span>
    );
}

export type Criterion = {
    /** Key the options are keyed by. Defaults to the row index. */
    key?: string;
    label: ReactNode;
    /** A knock-out: an option failing it is marked „raus". */
    must?: boolean;
    note?: ReactNode;
    /** Single-option mode only. */
    ok?: CriteriaValue;
};

export type CriteriaOption = {
    name: ReactNode;
    /** `{ [criterion.key]: value }`. */
    met?: Record<string, CriteriaValue>;
};

export type CriteriaProps = Base & {
    criteria: Criterion[];
    options?: CriteriaOption[];
    /** Header above the criteria column. Default „Kriterium". */
    label?: ReactNode;
    /** `false` drops the „x von y erfüllt" line. */
    score?: boolean;
};

export function Criteria({ criteria, options, label, score, className, id, style }: CriteriaProps) {
    const rows = (criteria || []).filter(Boolean);
    if (!rows.length) return null;
    const opts = (options || []).filter(Boolean);

    // One option: a plain list reads better than a one-column table.
    if (!opts.length) {
        const met = rows.filter((c) => criteriaState(c.ok) === 'yes').length;
        return (
            <div className={cx('ui-crit', className)} id={id} style={style}>
                {score !== false ? (
                    <div className="ui-crit-score">{met} von {rows.length} erfüllt</div>
                ) : null}
                <ul className="ui-crit-list">
                    {rows.map((c, i) => {
                        const st = criteriaState(c.ok);
                        return (
                            <li key={c.key || i} className={cx('ui-crit-row', st, c.must && 'is-must')}>
                                <Mark state={st} />
                                <span className="ui-crit-label">
                                    {c.label}
                                    {c.must ? <span className="ui-crit-must">{uiText().must}</span> : null}
                                </span>
                                {c.note ? <span className="ui-crit-note">{c.note}</span> : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    const scored = opts.map((o) => {
        const vals = o.met || {};
        const out = rows.some((c, i) => c.must && criteriaState(vals[c.key || String(i)]) === 'no');
        const hits = rows.filter((c, i) => criteriaState(vals[c.key || String(i)]) === 'yes').length;
        return { option: o, vals, hits, out };
    });

    return (
        <div className={cx('ui-crit', 'ui-crit-matrix', className)} id={id} style={style}>
            <div className="ui-table-wrap">
                <table className="ui-table ui-crit-table">
                    <thead>
                        <tr>
                            <th scope="col">{label || uiText().criterion}</th>
                            {scored.map((s, k) => (
                                <th key={k} scope="col" className={cx('ui-crit-opt', s.out && 'is-out')}>
                                    {s.option.name}
                                    {s.out ? (
                                        <span className="ui-crit-outflag"
                                            title={uiText().mustFailed}>{uiText().out}</span>
                                    ) : null}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((c, i) => {
                            const key = c.key || String(i);
                            return (
                                <tr key={key}>
                                    <th scope="row" className="ui-crit-rowhead">
                                        {c.label}
                                        {c.must ? <span className="ui-crit-must">{uiText().must}</span> : null}
                                        {c.note ? <span className="ui-crit-note">{c.note}</span> : null}
                                    </th>
                                    {scored.map((s, k) => (
                                        <td key={k} className="ui-crit-cell">
                                            <Mark state={criteriaState(s.vals[key])} />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                    {score !== false ? (
                        <tfoot>
                            <tr>
                                <th scope="row">erfüllt</th>
                                {scored.map((s, k) => (
                                    <td key={k} className="ui-crit-cell">
                                        <b>{s.hits}</b>
                                        <span className="ui-crit-of"> / {rows.length}</span>
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    ) : null}
                </table>
            </div>
        </div>
    );
}

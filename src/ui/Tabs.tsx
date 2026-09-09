/**
 * # Tabs — one page, several answers
 *
 * ## What it does and how it looks
 * A row of pill buttons where exactly one is active: route variants, the
 * sections of the reference page, „alles" versus one category. It renders the
 * strip only — the page owns which tab is selected and what each one shows.
 *
 * ## Core parts
 * - `tabs` — `{ id, label, badge }` objects, or plain strings when the label
 *   *is* the id.
 * - `value` / `onChange` — controlled, always. A tab strip that owns its own
 *   state cannot be linked to, restored, or driven by anything else.
 * - `badge` — a count on a tab, for „3 offen".
 *
 * ## Examples
 * ```tsx
 * <Tabs value={tab} onChange={setTab} tabs={[
 *   { id: 'kurz', label: 'Kurze Route' },
 *   { id: 'lang', label: 'Lange Route', badge: 2 },
 * ]} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type TabItem = { id: string; label?: ReactNode; badge?: ReactNode };

export type TabsProps = Base & {
    tabs: (TabItem | string)[];
    value?: string;
    onChange?: (id: string) => void;
};

export function Tabs({ tabs, value, onChange, className, style, id }: TabsProps) {
    return (
        <div id={id} style={style} className={cx('ui-tabs', className)} role="tablist">
            {(tabs || []).map((t) => {
                const tabId = typeof t === 'string' ? t : t.id;
                const label = typeof t === 'string' ? t : (t.label != null ? t.label : t.id);
                const badge = typeof t === 'string' ? null : t.badge;
                return (
                    <button
                        key={tabId}
                        role="tab"
                        type="button"
                        className={cx('ui-btn', value === tabId && 'on')}
                        aria-selected={value === tabId}
                        onClick={() => onChange && onChange(tabId)}
                    >
                        {label}
                        {badge ? <> <span className="ui-badge">{badge}</span></> : null}
                    </button>
                );
            })}
        </div>
    );
}

/**
 * A list he ticks off, stored locally — shopping list, packing list, what to
 * book before the trip.
 *
 * The ticks are `Decision`s like everything else, so a line is identified by
 * `<keyPrefix>/<group>/<name>` and survives a rebuild of the page. Groups are
 * optional; a flat list is one group without a name.
 */

import React from 'react';
import { Button, Checkbox, Col, Grid, Muted, Panel, Row, Text, toast } from '@ui';
import { useCollection, useDecision, useDecisions } from './hooks';
import { DECISIONS, type DecisionDoc } from './db';

export type ChecklistItem = {
    name: string;
    /** Amount, size, price — whatever the line needs after the name. */
    qty?: string;
    note?: string;
    url?: string;
};

export type ChecklistGroup = { group?: string; items: ChecklistItem[] };

export type ChecklistProps = {
    groups: ChecklistGroup[];
    /** Keeps two lists on one page apart. */
    keyPrefix?: string;
    /** Minimum column width; one column below it. */
    min?: number;
    /** „x von y erledigt" plus a reset. Default true. */
    progress?: boolean;
    resetLabel?: string;
};

const lineId = (prefix: string, group: string | undefined, name: string) =>
    `${prefix}/${group || ''}/${name}`;

function Line({ id, item }: { id: string; item: ChecklistItem }) {
    const { decision, toggleDone } = useDecision(id);
    const on = decision.done;

    return (
        <div style={{ opacity: on ? 0.45 : 1 }}>
            <Checkbox
                checked={on}
                onChange={() => toggleDone()}
                label={
                    <span style={{ textDecoration: on ? 'line-through' : 'none' }}>
                        <strong>{item.name}</strong>
                        {item.qty ? <span className="ui-muted"> · {item.qty}</span> : null}
                    </span>
                }
            />
            {/* Note and link sit outside the <label>: a link inside it would
                swallow the click as a toggle instead of opening. */}
            {item.note || item.url ? (
                <div style={{ paddingLeft: '26px' }}>
                    {item.note ? <div className="ui-small ui-muted">{item.note}</div> : null}
                    {item.url ? (
                        <div style={{ marginTop: 'var(--s1)' }}>
                            <Button size="sm" variant="ghost" href={item.url}>Ansehen ↗</Button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export function Checklist({
    groups, keyPrefix = 'list', min = 300, progress = true, resetLabel = 'Zurücksetzen',
}: ChecklistProps) {
    const all = useDecisions();
    const { collection } = useCollection<DecisionDoc>(DECISIONS);

    const ids = groups.flatMap((g) => g.items.map((it) => lineId(keyPrefix, g.group, it.name)));
    const done = all.filter((d) => d.done && ids.includes(d.id)).length;

    const reset = async () => {
        // Only this list's lines — a page may hold more than one.
        await collection?.find({ selector: { id: { $in: ids } } }).remove();
        toast('Liste zurückgesetzt');
    };

    return (
        <Col gap={4}>
            {progress ? (
                <Row justify="between" align="bottom" stack gap={3}>
                    <Muted>{done} von {ids.length} erledigt</Muted>
                    <Button size="sm" variant="ghost" onClick={reset}>{resetLabel}</Button>
                </Row>
            ) : null}

            <Grid min={min} gap={4}>
                {groups.map((g, gi) => (
                    <Panel key={g.group || gi} title={g.group}>
                        <Col gap={2}>
                            {g.items.map((it) => (
                                <Line
                                    key={it.name}
                                    id={lineId(keyPrefix, g.group, it.name)}
                                    item={it}
                                />
                            ))}
                        </Col>
                    </Panel>
                ))}
            </Grid>
        </Col>
    );
}

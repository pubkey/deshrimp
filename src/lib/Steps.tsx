/**
 * A numbered sequence he works through, with the ticks stored locally —
 * a recipe, a preparation, the things to do before a trip.
 *
 * `<StepList>` from `@ui` renders the same thing but forgets everything on
 * reload; this is the variant that remembers, so it lives here next to the
 * database rather than in `components.js`.
 *
 * A tick is a `Decision` like every other, identified by
 * `<keyPrefix>/<step id>` — which is why a step should carry an `id` (or at
 * least a title) whenever the order might change: an index-keyed tick moves to
 * whatever step lands in that slot on the next build.
 */

import React from 'react';
import { Button, Col, Muted, Row, StepList, toast, type Step } from '@ui';
import { useCollection, useDecisions } from './hooks';
import { DECISIONS, type DecisionDoc } from './db';

export type StepsProps = {
    /** A plain string is shorthand for `{ text }`. */
    steps: (Step | string)[];
    /** Keeps two sequences on one page apart. */
    keyPrefix?: string;
    /** „x von y erledigt" plus a reset. Default true. */
    progress?: boolean;
    resetLabel?: string;
    render?: (step: Step, i: number) => React.ReactNode;
};

const asStep = (s: Step | string): Step => (typeof s === 'string' ? { text: s } : s);

const stepId = (prefix: string, step: Step, i: number) =>
    `${prefix}/${step.id || step.title || `schritt-${i + 1}`}`;

export function Steps({
    steps, keyPrefix = 'steps', progress = true, resetLabel = 'Zurücksetzen', render,
}: StepsProps) {
    const all = useDecisions();
    const { collection, upsert } = useCollection<DecisionDoc>(DECISIONS);

    const list = steps.map(asStep);
    const ids = list.map((s, i) => stepId(keyPrefix, s, i));
    const byId = new Map(all.map((d) => [d.id, d]));
    const done = ids.map((id) => !!byId.get(id)?.done);
    const count = done.filter(Boolean).length;

    const toggle = (i: number) => {
        const id = ids[i];
        const stored = byId.get(id);
        upsert({
            id,
            choice: stored?.choice || '',
            rating: stored?.rating || 0,
            note: stored?.note || '',
            done: !stored?.done,
            updatedAt: Date.now(),
        });
    };

    const reset = async () => {
        // Only this sequence's steps — a page may hold more than one.
        await collection?.find({ selector: { id: { $in: ids } } }).remove();
        toast('Schritte zurückgesetzt');
    };

    return (
        <Col gap={3}>
            {progress ? (
                <Row justify="between" align="bottom" stack gap={3}>
                    <Muted>{count} von {ids.length} erledigt</Muted>
                    <Button size="sm" variant="ghost" onClick={reset}>{resetLabel}</Button>
                </Row>
            ) : null}
            <StepList steps={list} done={done} onToggle={toggle} render={render} />
        </Col>
    );
}

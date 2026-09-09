/**
 * The decision row: a set of choices, optionally a tick and a note.
 *
 * This lives here rather than in `.claude/ui/components.js` on purpose: that
 * library is data-free, props in and markup out, and this one reads and writes
 * the database. Everything visual it uses comes from there.
 *
 *     <Decision id={option.id} options={[
 *         { id: 'buy',   label: 'Kaufe ich' },
 *         { id: 'maybe', label: 'Überlege noch' },
 *         { id: 'no',    label: 'Raus' },
 *     ]} note notePlaceholder="Größe prüfen …" />
 */

import React from 'react';
import { Button, Col, Panel, Row, TextArea, Checkbox } from '@ui';
import { useDecision } from './hooks';

export type DecisionOption = { id: string; label: string };

export type DecisionProps = {
    /** What is being decided about — an option id, a track id, a list line. */
    id: string;
    /** The page's own choices. Pressing the active one again clears it. */
    options?: DecisionOption[];
    /** A tick next to the choices ("gebucht", "gepackt", "erledigt"). */
    doneLabel?: string;
    /** Show a note field. */
    note?: boolean;
    noteLabel?: string;
    notePlaceholder?: string;
    /** 1–5 stars. Off by default: most pages decide, they do not score. */
    rating?: boolean;
    /** Wrap it in a titled panel. `false` renders the bare controls. */
    title?: string | false;
};

export function Decision({
    id, options, doneLabel, note, noteLabel = 'Notiz', notePlaceholder,
    rating, title = 'Deine Entscheidung',
}: DecisionProps) {
    const d = useDecision(id);

    const body = (
        <Col gap={3}>
            {options?.length || doneLabel ? (
                <Row gap={2} wrap>
                    {options?.map((o) => (
                        <Button
                            key={o.id}
                            size="sm"
                            active={d.decision.choice === o.id}
                            onClick={() => d.choose(o.id)}
                        >
                            {o.label}
                        </Button>
                    ))}
                    {doneLabel ? (
                        <Checkbox
                            checked={d.decision.done}
                            onChange={(v) => d.setDone(v)}
                            label={doneLabel}
                        />
                    ) : null}
                </Row>
            ) : null}

            {rating ? (
                <Row gap={1}>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Button
                            key={n}
                            size="sm"
                            variant="ghost"
                            title={`${n} von 5`}
                            onClick={() => d.rate(n)}
                        >
                            {d.decision.rating >= n ? '★' : '☆'}
                        </Button>
                    ))}
                </Row>
            ) : null}

            {note ? (
                <TextArea
                    label={noteLabel}
                    rows={2}
                    value={d.decision.note}
                    placeholder={notePlaceholder}
                    onInput={(e: any) => d.setNote(e.target.value)}
                />
            ) : null}
        </Col>
    );

    if (title === false) return body;
    return <Panel title={title} sunk pad="sm">{body}</Panel>;
}

/**
 * React hooks for the local database.
 *
 * The official ones from `rxdb/plugins/react` are re-exported unchanged. On top
 * of them sits `useQuery`, which fixes one ergonomic trap: `useLiveRxQuery`
 * keeps its Mango query in a dependency array, so the usual
 *
 *     useLiveRxQuery({ collection: 'items', query: { selector: { done: false } } })
 *
 * hands it a *new object every render* and re-subscribes in a loop. `useQuery`
 * memoises the query by value first, and returns plain JSON next to the
 * `RxDocument`s so a component can render without reaching into documents.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DECISIONS, type DecisionDoc } from './db';
import {
    useLiveRxQuery,
    useRxCollection,
    useRxDatabase,
} from 'rxdb/plugins/react';
import type { MangoQuery, RxCollection, RxDatabase, RxDocument } from 'rxdb';

export {
    RxDatabaseProvider,
    useLiveRxQuery,
    useReplicationStatus,
    useRxCollection,
    useRxDatabase,
    useRxDocument,
    useRxQuery,
} from 'rxdb/plugins/react';

export type UseQueryResult<T> = {
    /** Plain JSON, ready to render. */
    data: T[];
    /** The live `RxDocument`s, for `.patch()`, `.remove()`, `.incrementalModify()`. */
    docs: RxDocument<T>[];
    loading: boolean;
    error: string | null;
};

/**
 * Live query against a collection. Re-renders whenever a matching document
 * changes, in this tab and in any other tab showing the same page.
 *
 *     const { data, docs } = useQuery<Item>('items', { sort: [{ createdAt: 'asc' }] });
 */
export function useQuery<T = any>(
    collection: string,
    query: MangoQuery<T> = {},
): UseQueryResult<T> {
    // JSON is the right identity here: a Mango query is data, and two queries
    // that serialise the same select the same documents.
    const key = JSON.stringify(query);
    const stable = useMemo(() => query, [key]);

    const { results, loading, error } = useLiveRxQuery<T>({ collection, query: stable });
    const data = useMemo(() => results.map((d) => d.toJSON() as T), [results]);

    return { data, docs: results as RxDocument<T>[], loading, error };
}

/**
 * The write side: a collection plus the three operations a page actually needs,
 * already bound and stable across renders.
 *
 *     const items = useCollection<Item>('items');
 *     items.upsert({ id: crypto.randomUUID(), text, done: false });
 */
export function useCollection<T = any>(name: string) {
    const collection = useRxCollection<T>(name);

    const insert = useCallback(
        async (doc: T) => collection?.insert(doc), [collection],
    );
    const upsert = useCallback(
        async (doc: T) => collection?.upsert(doc), [collection],
    );
    const patch = useCallback(
        async (primaryKey: string, changes: Partial<T>) => {
            const doc = await collection?.findOne(primaryKey).exec();
            return doc?.incrementalPatch(changes as any);
        },
        [collection],
    );
    const remove = useCallback(
        async (primaryKey: string) => {
            const doc = await collection?.findOne(primaryKey).exec();
            return doc?.remove();
        },
        [collection],
    );

    return { collection: collection as RxCollection<T> | null, insert, upsert, patch, remove };
}

/** The database itself — for `exportAppData`, `resetAppDatabase` and the like. */
export function useDatabase(): RxDatabase<any> {
    return useRxDatabase<any>();
}

/* ------------------------------------------------------------- decisions */

const EMPTY: Omit<DecisionDoc, 'id'> = {
    choice: '', done: false, rating: 0, note: '', updatedAt: 0,
};

export type UseDecisionResult = {
    /** Never null: an undecided thing reads as the empty decision. */
    decision: DecisionDoc;
    /** Pick one of the page's options; picking the current one clears it. */
    choose: (choice: string) => Promise<unknown>;
    /** Flip the tick. */
    toggleDone: () => Promise<unknown>;
    setDone: (done: boolean) => Promise<unknown>;
    /** 1–5; setting the current value clears it back to 0. */
    rate: (rating: number) => Promise<unknown>;
    setNote: (note: string) => Promise<unknown>;
    /** Anything at once, when a page needs its own combination. */
    set: (changes: Partial<DecisionDoc>) => Promise<unknown>;
};

/**
 * What the reader decided about one thing, and how to change it.
 *
 *     const { decision, choose, setNote } = useDecision(option.id);
 *     <Button active={decision.choice === 'buy'} onClick={() => choose('buy')}>
 *
 * Reads live, writes through. `updatedAt` is stamped for you — five skills
 * used to write that line by hand.
 */
export function useDecision(id: string): UseDecisionResult {
    const { data } = useQuery<DecisionDoc>(DECISIONS, { selector: { id } });
    const { upsert } = useCollection<DecisionDoc>(DECISIONS);
    const stored = data[0];
    const decision: DecisionDoc = stored || { id, ...EMPTY };

    const set = useCallback(
        (changes: Partial<DecisionDoc>) => upsert({
            ...decision, ...changes, id, updatedAt: Date.now(),
        }),
        [upsert, decision.choice, decision.done, decision.rating, decision.note, id],
    );

    return {
        decision,
        set,
        // Picking what is already picked clears it: the second press is how you
        // undo, without a separate "keine Angabe" button on every page.
        choose: (choice) => set({ choice: decision.choice === choice ? '' : choice }),
        toggleDone: () => set({ done: !decision.done }),
        setDone: (done) => set({ done }),
        rate: (rating) => set({ rating: decision.rating === rating ? 0 : rating }),
        setNote: (note) => set({ note }),
    };
}

/** Every decision on the page — for a counter, or a "what did I keep" list. */
export function useDecisions(): DecisionDoc[] {
    const { data } = useQuery<DecisionDoc>(DECISIONS, {});
    return data;
}

/* ---------------------------------------------------------------- listnav */

/**
 * `j`/`k` (and the arrows) move a cursor through a list, Enter acts on it.
 *
 *     const { cursor } = useListKeyboard(shown.length, {
 *         onEnter: (i) => play(shown[i]),
 *         idOf: (i) => `track-${shown[i].id}`,   // scrolls it into view
 *     });
 *
 * Ignores keystrokes while an input or textarea has focus, so typing a note
 * does not scroll the page away underneath.
 */
export function useListKeyboard(
    length: number,
    options: { onEnter?: (index: number) => void; idOf?: (index: number) => string } = {},
) {
    const [cursor, setCursor] = useState(0);
    const { onEnter, idOf } = options;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = document.activeElement as HTMLElement | null;
            if (el && (/input|textarea|select/i.test(el.tagName) || el.isContentEditable)) return;

            const step = (d: number) => {
                e.preventDefault();
                setCursor((c) => {
                    const next = Math.max(0, Math.min(length - 1, c + d));
                    if (idOf) {
                        document.getElementById(idOf(next))
                            ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
                    return next;
                });
            };

            if (e.key === 'j' || e.key === 'ArrowDown') step(1);
            else if (e.key === 'k' || e.key === 'ArrowUp') step(-1);
            else if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(cursor); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [length, cursor, onEnter, idOf]);

    // A shorter list must not leave the cursor pointing past its end.
    useEffect(() => { setCursor((c) => Math.min(c, Math.max(0, length - 1))); }, [length]);

    return { cursor, setCursor };
}

/** A stable id for a new document. `crypto.randomUUID` needs a secure context. */
export function newId(): string {
    const c = globalThis.crypto as Crypto | undefined;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

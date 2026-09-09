/**
 * Opens the database once, then renders the app inside it.
 *
 * Creating an RxDB database is asynchronous, React rendering is not — every app
 * would otherwise write the same "await it, hold it in state, guard the first
 * render" boilerplate. This is that boilerplate, written once.
 *
 *     <DatabaseGate create={openDatabase}>
 *       <App />
 *     </DatabaseGate>
 *
 * The promise is kept module-side, so a remount does not open a second
 * database — RxDB would refuse that with a duplicate-name error.
 */

import React, { useEffect, useState } from 'react';
import type { RxDatabase } from 'rxdb';
import { RxDatabaseProvider } from 'rxdb/plugins/react';
import { Callout, Panel, Text } from '@ui';

export type DatabaseGateProps = {
    /** Opens the database. Called at most once, however often this remounts. */
    create: () => Promise<RxDatabase<any>>;
    children: React.ReactNode;
    /** Shown while the database opens. Keep it quiet — this takes milliseconds. */
    fallback?: React.ReactNode;
    /**
     * Shown when the database cannot be opened. This is the one string in here
     * a reader ever sees, and readers of these pages read German — so a page
     * passes its own text (see README §5, "The pages are German"). The defaults
     * below are English because this folder is.
     */
    errorTitle?: string;
    errorText?: string;
};

let pending: Promise<RxDatabase<any>> | null = null;

export function DatabaseGate({
    create,
    children,
    fallback = null,
    errorTitle = 'The local database cannot be opened',
    errorText = 'This page cannot save your input right now. In a browser\'s private '
        + 'mode that is normal. The content of the page itself still works.',
}: DatabaseGateProps) {
    const [database, setDatabase] = useState<RxDatabase<any> | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!pending) pending = create();
        pending.then(
            (db) => { if (!cancelled) setDatabase(db); },
            (err) => { if (!cancelled) setError(err as Error); },
        );
        return () => { cancelled = true; };
    }, []);

    if (error) {
        // A page whose database fails is still a useful page: it just cannot
        // remember anything. Say that plainly instead of rendering nothing.
        return (
            <Panel>
                <Callout tone="bad" title={errorTitle}>
                    <Text>{errorText}</Text>
                    <Text small muted>{String(error.message || error)}</Text>
                </Callout>
            </Panel>
        );
    }

    if (!database) return <>{fallback}</>;

    return <RxDatabaseProvider database={database}>{children}</RxDatabaseProvider>;
}

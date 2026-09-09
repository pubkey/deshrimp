/**
 * The local database layer: RxDB, wired the way every page here needs it.
 *
 * A generated page is a finished answer — the researched payload sits in
 * `PAGE_DATA` and never changes. But the reader *uses* the page: he ticks off
 * a shopping list, rates an option, writes a note, marks a stop as done. That
 * state has to survive a reload, and there is no server: the page is one HTML
 * file on a static host. RxDB stores it in the browser, on his device.
 *
 *     import { createAppDatabase, DatabaseGate, useQuery } from '@db';
 *
 * ## Storage: always Dexie
 *
 * Every page uses IndexedDB through `storage-dexie`, and a page does not get to
 * pick — there is no `storage` option to pass. One storage across all pages
 * means one set of behaviours to know: asynchronous, quota in the hundreds of
 * megabytes rather than localStorage's ~5 MB, and no ceiling a page can walk
 * into once it starts holding images or a few thousand documents.
 *
 * ## The database name is shared across every published page
 *
 * All pages live on the same origin (`pubkey.github.io`), so IndexedDB is
 * shared between *all* of them. Two apps that both call their database `app`
 * would read each other's documents. `createAppDatabase` therefore prefixes
 * every name with `me-` and demands an app id that is unique per page —
 * `app.config.ts` in the blueprint holds it, and `new_app.py` fills it from the
 * folder name.
 *
 * ## WebMCP: the state is readable by an agent, not only by the reader
 *
 * Every collection is registered as a set of MCP tools at the browser's model
 * context, so an agent sitting in the browser next to the open page can query
 * it, count it, follow its changes and write to it. That is what makes the
 * state more than a private scribble: „was ist auf der Packliste noch offen"
 * is answerable without him exporting anything. It is on by default and turns
 * itself off in a browser that has no registry — `webmcp: false` or
 * `{ readOnly: true }` in `createAppDatabase` narrows it.
 */

import {
    addRxPlugin,
    createRxDatabase,
    removeRxDatabase,
    type RxCollectionCreator,
    type RxDatabase,
    type RxJsonSchema,
    type RxStorage,
} from 'rxdb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBWebMCPPlugin, getModelContext } from 'rxdb/plugins/webmcp';
import type { WebMCPOptions } from 'rxdb';

/** Replaced by esbuild: `true` only for `build_app.py --dev`. */
declare const __DEV__: boolean;

// Schema migrations, in every page. A page that is rebuilt after its schema
// moved on has to carry the reader's existing documents across rather than
// throw them away -- see `migrationStrategies` in the blueprint's `db.ts`.
addRxPlugin(RxDBMigrationSchemaPlugin);

// WebMCP, in every page. A published page is a finished answer, but the state
// on top of it -- what he ticked, chose, rated, noted -- is data he produced,
// and until now the only way back out of it was the „Daten sichern" download.
// This plugin publishes every collection of the page as a set of MCP tools at
// `document.modelContext`, so a browser-side agent standing next to the open
// page can read that state and write to it: „was habe ich auf der Packliste
// noch offen", „hak die Ladekabel ab". The tools are per collection and carry
// the collection's own JSON schema, so the agent gets validation for free.
//
// Registering is safe in a browser that knows nothing about WebMCP: the plugin
// looks for a registry, finds none, and registers nothing. Nothing is
// transmitted either way -- the tools run in this tab, against the local
// IndexedDB, and only an agent already inside the browser can call them.
addRxPlugin(RxDBWebMCPPlugin);

/** Prefix that keeps one page's data out of another page's database. */
const DB_PREFIX = 'me-';

const NAME_RE = /^[a-z][a-z0-9-]*$/;

export type AppCollections = Record<string, RxCollectionCreator<any>>;

/* ------------------------------------------------------- the one decision */

/**
 * What the reader decided about one thing on the page.
 *
 * Every page here turns out to need the same shape: an id, a choice out of a
 * small set, a tick, sometimes a rating, sometimes a note. Before this existed
 * five skills had invented six names for it — `SlideVerdict`, `OptionVerdict`,
 * `ShoppingTick`, `TrackVerdict`, `StopState`, `ItemState` — each with its own
 * schema and its own hand-written upsert. Worse than the duplication: „Kaufe
 * ich" on a shopping page and „Behalte ich" on a listening page were stored
 * under different schemas, so nothing could ever ask what he actually decided.
 *
 * So it is one collection, added to every app database. What a `choice` means
 * is the page's business; that it is a choice is not.
 */
export type DecisionDoc = {
    /** What this decision is about: an option id, a track id, a list line. */
    id: string;
    /** One of the page's own options, or `''` for "not decided". */
    choice: string;
    /** The tick: bought, booked, packed, done. */
    done: boolean;
    /** 0 = not rated, 1–5. */
    rating: number;
    note: string;
    updatedAt: number;
};

/** The collection name. A page reads it through `useDecision`, not by name. */
export const DECISIONS = 'decisions';

const decisionSchema: RxJsonSchema<DecisionDoc> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 250 },
        choice: { type: 'string', maxLength: 40 },
        done: { type: 'boolean' },
        rating: { type: 'number', minimum: 0, maximum: 5, multipleOf: 1 },
        note: { type: 'string' },
        updatedAt: { type: 'number', minimum: 0, maximum: 9999999999999, multipleOf: 1 },
    },
    required: ['id', 'choice', 'done', 'rating', 'note', 'updatedAt'],
};

export type CreateAppDatabaseOptions<C> = {
    /**
     * Unique id of this app, e.g. `packliste-portugal`. Becomes the database
     * name `me-<appId>`; lowercase letters, digits and hyphens only.
     */
    appId: string;
    /**
     * Collections beyond `decisions`, which every page gets. Most pages need
     * none: what the reader ticks, chooses, rates or notes is a `Decision`.
     */
    collections?: C;
    /** Keep tabs of the same page in sync. Default true. */
    multiInstance?: boolean;
    /**
     * Expose this page's collections to a browser agent as WebMCP tools.
     * Default on -- see the `addRxPlugin(RxDBWebMCPPlugin)` note above.
     *
     * Pass `false` to register nothing at all, or options to narrow it:
     * `{ readOnly: true }` keeps insert, upsert and delete out and leaves the
     * agent with query, count and changes.
     */
    webmcp?: boolean | WebMCPOptions;
};

let devModeAdded = false;

/**
 * Dev mode: readable error messages and RxDB's own correct-usage checks.
 * `build_app.py --dev` turns it on. It is *not* what validates documents —
 * that happens in every build, see `createAppDatabase` — so the published page
 * ships without dev mode but never without validation.
 */
async function enableDevMode(): Promise<void> {
    if (devModeAdded) return;
    devModeAdded = true;
    const devMode = await import('rxdb/plugins/dev-mode');
    devMode.disableWarnings();
    addRxPlugin(devMode.RxDBDevModePlugin);
}

/**
 * The one storage every page uses: Dexie, wrapped in the schema validator.
 *
 * Both are settled here rather than per app — see the header for Dexie, and
 * `createAppDatabase` for why validation is not optional.
 */
function appStorage(): RxStorage<any, any> {
    return wrappedValidateAjvStorage({ storage: getRxStorageDexie() });
}

/**
 * Open (or create) this page's database.
 *
 * Call it once — `DatabaseGate` does that for you and hands the result to the
 * component tree.
 */
export async function createAppDatabase<C extends AppCollections>(
    options: CreateAppDatabaseOptions<C>,
): Promise<RxDatabase<any>> {
    const { appId, collections } = options;

    // Schema validation, in every build — asked for explicitly on 2026-08-29.
    // A page writes what the reader types into it, so a schema that does not
    // match the data fails at the write, with the field named, rather than
    // silently storing something the next render chokes on. RxDB's storages do
    // not validate on their own; this wrapper is what does it.
    const storage = appStorage();

    if (!NAME_RE.test(appId)) {
        throw new Error(
            `Invalid appId ${JSON.stringify(appId)}: lowercase letters, digits and ` +
            'hyphens only, starting with a letter. It is the database name, and it ' +
            'has to be unique across every page published from this repo.',
        );
    }

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
        await enableDevMode();
    }

    const db = await createRxDatabase<any>({
        name: DB_PREFIX + appId,
        storage,
        multiInstance: options.multiInstance !== false,
        eventReduce: true,
        ignoreDuplicate: false,
    });

    // `autoMigrate` defaults to true, so a collection whose schema version rose
    // migrates its documents here, before the page renders. A version that rose
    // *without* a strategy for it throws (RxDB code DM3) and a schema that
    // changed *without* the version rising throws too (DB6) — both of those are
    // the author's mistake and belong on screen, not swallowed. Earlier this
    // function caught them and deleted the database; that quietly threw away
    // what the reader had entered, which is the one thing it must not do.
    await db.addCollections({
        [DECISIONS]: { schema: decisionSchema, migrationStrategies: {} },
        ...(collections || {}),
    });

    const webmcp = options.webmcp ?? true;
    if (webmcp !== false) {
        registerWebMCP(db, webmcp === true ? {} : webmcp);
    }

    return db;
}

/**
 * Hand this page's collections to the browser's agent.
 *
 * Called on the database rather than per collection, because that also covers
 * collections added later: the plugin remembers the options and registers
 * anything created after this point.
 *
 * A failing tool call is reported to the caller by the tool itself, so the
 * subscription here is only so it is not *also* invisible in the console —
 * without it, a rejected write from an agent leaves no trace on the page side.
 */
function registerWebMCP(db: RxDatabase<any>, options: WebMCPOptions): void {
    const { error$ } = db.registerWebMCP(options);
    error$.subscribe((err: unknown) => console.warn('[webmcp]', err));

    if (typeof __DEV__ !== 'undefined' && __DEV__ && !getModelContext(options)) {
        // The normal case in a plain browser, and the reason a missing registry
        // must not throw: no agent is present, so no tools were registered.
        console.info('[webmcp] no model context in this browser — no tools registered');
    }
}

/** Delete everything this page stored on this device. Irreversible. */
export async function resetAppDatabase(appId: string): Promise<void> {
    await removeRxDatabase(DB_PREFIX + appId, appStorage());
}

/**
 * Every document of every collection as plain JSON — for a "Daten sichern"
 * button, or to hand the state back to the agent so it can be written into the
 * repo. Deliberately not the `json-dump` plugin: this is ten lines and keeps
 * the bundle smaller.
 */
export async function exportAppData(
    db: RxDatabase<any>,
): Promise<Record<string, any[]>> {
    const out: Record<string, any[]> = {};
    for (const [name, collection] of Object.entries(db.collections)) {
        const docs = await (collection as any).find().exec();
        out[name] = docs.map((d: any) => d.toJSON());
    }
    return out;
}

/** The counterpart to `exportAppData`. Upserts, so it merges rather than wipes. */
export async function importAppData(
    db: RxDatabase<any>,
    data: Record<string, any[]>,
): Promise<void> {
    for (const [name, rows] of Object.entries(data)) {
        const collection = (db.collections as any)[name];
        if (!collection) continue;
        await collection.bulkUpsert(rows);
    }
}

/** Trigger a download of the exported data. */
export async function downloadAppData(
    db: RxDatabase<any>,
    filename = 'daten.json',
): Promise<void> {
    const blob = new Blob([JSON.stringify(await exportAppData(db), null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export type { RxCollectionCreator, RxDatabase, RxJsonSchema, RxStorage, WebMCPOptions };

export * from './hooks';
export { DatabaseGate } from './DatabaseGate';
export { Decision, type DecisionOption, type DecisionProps } from './Decision';
export { Checklist, type ChecklistGroup, type ChecklistItem } from './Checklist';
export { Steps, type StepsProps } from './Steps';
export { DataSyncButton, type DataSyncButtonProps } from './DataSync';
export {
    downloadData, importFromFile, newSyncCode, DEFAULT_SIGNALING_SERVER,
    type SyncHandle,
} from './sync';

/**
 * Getting the data of an app-builder page off the device it is on — and back.
 *
 * Every page from this blueprint keeps what the reader does in RxDB on *that*
 * browser. That is the point (`README.md` §5), and it is also the whole problem:
 * a device is a single point of failure, and a second device knows nothing. This
 * module is the four answers to that, in rising order of convenience and falling
 * order of self-sufficiency:
 *
 * | | needs | keeps working when |
 * | --- | --- | --- |
 * | **file** | nothing | forever — it is a JSON file on his disk |
 * | **P2P** | both devices online at once | the signalling server is up |
 * | **Google Drive** | an OAuth client id | Google keeps the API |
 * | **OneDrive** | an OAuth client id | Microsoft keeps the API |
 *
 * The file path is deliberately first and deliberately dependency-free: it is
 * the one that still works in ten years, and the one that works with no account
 * anywhere. The rest are conveniences layered on top.
 *
 * **Nothing here runs unless he asks for it.** No token is fetched, no socket is
 * opened and no plugin is even touched until a button in `<DataSyncButton>` is
 * pressed — a page that syncs by itself would be a page that phones home, which
 * is the opposite of what these pages promise.
 *
 * The one exception is **resuming a P2P session he already started**
 * _(2026-09-09: „when p2p sync was started it should remember the token and
 * auto-restart on reload of the page")_. That is not the page deciding to phone
 * home; it is the page keeping a promise he made. `resumeP2P` only ever acts on
 * a code stored by a previous *Start*, and pressing *Stop* forgets it for good.
 * The two clouds deliberately do **not** resume: their tokens last an hour and
 * are fetched through a popup, so an automatic attempt would either fail
 * silently or throw a sign-in window at him on every page load.
 */

import type { RxDatabase } from 'rxdb';
import { exportAppData, importAppData } from './db';

/* --------------------------------------------------------------- the file */

/** Download every collection as one JSON file. */
export async function downloadData(db: RxDatabase<any>, filename: string): Promise<void> {
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

/**
 * Read a file the reader picked and merge it in.
 *
 * **Merge, not replace** — `importAppData` upserts. Importing a backup onto a
 * device that has kept measuring since does not throw the newer rows away, and
 * importing the same file twice changes nothing. The cost is that a document
 * deleted on one device comes back from an older export, which is the right
 * trade for a backup file: losing data is worse than resurrecting some.
 */
export async function importFromFile(db: RxDatabase<any>, file: File): Promise<number> {
    const parsed = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Not an export of this app: expected an object of collections.');
    }
    const known = Object.keys(db.collections);
    const rows = Object.entries(parsed as Record<string, unknown>)
        .filter(([name, value]) => known.indexOf(name) !== -1 && Array.isArray(value));
    if (!rows.length) {
        throw new Error(
            `No collection of this app in the file. It has ${Object.keys(parsed).join(', ') || 'nothing'}, ` +
            `this app has ${known.join(', ')}.`,
        );
    }
    await importAppData(db, Object.fromEntries(rows) as Record<string, any[]>);
    return rows.reduce((sum, [, value]) => sum + (value as any[]).length, 0);
}

/* ------------------------------------------------------------ the plumbing */

/**
 * `simple-peer` is a browser port of a Node library and still reaches for
 * `process.nextTick`. esbuild bundles for the browser, where there is no
 * `process`, so the call would throw the moment a peer connects — the RxDB
 * plugin even has a check that says so in as many words.
 *
 * A microtask is the right stand-in: `nextTick` means "after this turn, before
 * I/O", and `queueMicrotask` is exactly that.
 */
function ensureProcessShim(): void {
    const g = globalThis as any;
    if (!g.process) g.process = {};
    if (typeof g.process.nextTick !== 'function') {
        g.process.nextTick = (fn: (...args: any[]) => void, ...args: any[]) =>
            queueMicrotask(() => fn(...args));
    }
    if (!g.process.env) g.process.env = {};
}

/** Load a `<script>` once and resolve when it has run. */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if ((existing as any).dataset.loaded) return resolve();
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Could not load ' + src)));
            return;
        }
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.onload = () => { (el as any).dataset.loaded = '1'; resolve(); };
        el.onerror = () => reject(new Error('Could not load ' + src));
        document.head.appendChild(el);
    });
}

/** A running sync. `stop()` cancels it; `error` is the reason it gave up. */
export type SyncHandle = {
    stop: () => Promise<void>;
    /** Fires once per replication error, with a message fit to show a reader. */
    onError: (listener: (message: string) => void) => void;
};

function handleFor(states: any[]): SyncHandle {
    const listeners: ((message: string) => void)[] = [];
    for (const state of states) {
        state.error$?.subscribe((err: any) => {
            const message = String(err?.parameters?.errors?.[0]?.message || err?.message || err);
            for (const l of listeners) l(message);
        });
    }
    return {
        stop: async () => { for (const s of states) await s.cancel(); },
        onError: (listener) => { listeners.push(listener); },
    };
}

/* ----------------------------------------------------------- Google Drive */

const GOOGLE_GSI = 'https://accounts.google.com/gsi/client';

/**
 * The narrowest scope that can do the job: `drive.appdata` reaches **only** a
 * hidden folder that belongs to this one OAuth client. It cannot read his
 * documents, his photos or anything else in his Drive — which is the difference
 * between "sync my posture readings" and "give a web page your Drive".
 */
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

/**
 * Ask Google for an access token, through Google's own popup.
 *
 * Google Identity Services rather than a hand-rolled redirect: it is the only
 * flow Google still documents for a browser app, and the token never touches a
 * server of ours because there is none.
 *
 * The token lives about an hour. There is no refresh token in this flow by
 * design, so a sync that has been running all afternoon will eventually fail
 * with 401 — the modal shows that and he presses connect again.
 */
export function googleAccessToken(clientId: string): Promise<string> {
    return loadScript(GOOGLE_GSI).then(() => new Promise<string>((resolve, reject) => {
        const google = (globalThis as any).google;
        if (!google?.accounts?.oauth2) return reject(new Error('Google sign-in did not load.'));
        const client = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: GOOGLE_SCOPE,
            callback: (response: any) => {
                if (response?.access_token) resolve(response.access_token);
                else reject(new Error(response?.error_description || response?.error || 'No token'));
            },
            error_callback: (err: any) => reject(new Error(err?.message || 'Sign-in cancelled')),
        });
        client.requestAccessToken();
    }));
}

/** Replicate every collection into the app's own hidden Drive folder. */
export async function syncGoogleDrive(
    db: RxDatabase<any>,
    options: { clientId: string; authToken: string; folderPath: string },
): Promise<SyncHandle> {
    const { replicateGoogleDrive } = await import('rxdb/plugins/replication-google-drive');
    const states = [];
    for (const collection of Object.values(db.collections)) {
        states.push(await replicateGoogleDrive({
            replicationIdentifier: `gdrive-${options.folderPath}-${(collection as any).name}`,
            collection: collection as any,
            googleDrive: {
                oauthClientId: options.clientId,
                authToken: options.authToken,
                space: 'appDataFolder',
                folderPath: `${options.folderPath}/${(collection as any).name}`,
            },
            live: true,
            pull: {},
            push: {},
        }));
    }
    return handleFor(states);
}

/* ---------------------------------------------------------------- OneDrive */

/**
 * `Files.ReadWrite.AppFolder` is Microsoft's equivalent of Google's appdata
 * scope — a folder of this app's own under "Apps", and nothing else.
 */
const MS_SCOPE = 'Files.ReadWrite.AppFolder offline_access';
const MS_AUTHORITY = 'https://login.microsoftonline.com/consumers/oauth2/v2.0';

function base64url(bytes: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Microsoft, by authorisation code with PKCE in a popup.
 *
 * Not MSAL: the library is larger than everything else this module adds
 * together, and the flow it wraps is the eighty lines below. Not the implicit
 * flow either — Microsoft does not accept it for single-page apps any more.
 *
 * The popup lands back on this very page (`redirect_uri` is our own URL), which
 * is what lets us read the code straight out of `popup.location`: same origin,
 * so the read is allowed. The page itself never navigates away, so nothing the
 * reader typed is lost.
 */
export async function microsoftAccessToken(clientId: string): Promise<string> {
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(48)).buffer);
    const challenge = base64url(await crypto.subtle.digest(
        'SHA-256', new TextEncoder().encode(verifier),
    ));
    const redirectUri = location.origin + location.pathname;
    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: MS_SCOPE,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        prompt: 'select_account',
    });

    const popup = window.open(`${MS_AUTHORITY}/authorize?${params}`, 'onedrive-auth',
        'width=520,height=640');
    if (!popup) throw new Error('The browser blocked the sign-in window.');

    const code = await new Promise<string>((resolve, reject) => {
        const timer = setInterval(() => {
            if (popup.closed) { clearInterval(timer); reject(new Error('Sign-in cancelled')); return; }
            let url: URL | null = null;
            try {
                // Throws while the popup sits on Microsoft's own origin, which
                // is every tick until it comes back to us. Not an error.
                url = new URL(popup.location.href);
            } catch { return; }
            if (url.origin !== location.origin) return;
            const got = url.searchParams.get('code');
            const failed = url.searchParams.get('error_description') || url.searchParams.get('error');
            if (!got && !failed) return;
            clearInterval(timer);
            popup.close();
            got ? resolve(got) : reject(new Error(failed || 'Sign-in failed'));
        }, 300);
    });

    const response = await fetch(`${MS_AUTHORITY}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
        }),
    });
    const token = await response.json();
    if (!response.ok || !token.access_token) {
        throw new Error(token.error_description || token.error || 'No token from Microsoft');
    }
    return token.access_token as string;
}

/** Replicate every collection into the app folder on his OneDrive. */
export async function syncOneDrive(
    db: RxDatabase<any>,
    options: { clientId: string; authToken: string; folderPath: string },
): Promise<SyncHandle> {
    const { replicateMicrosoftOneDrive } = await import('rxdb/plugins/replication-microsoft-onedrive');
    const states = [];
    for (const collection of Object.values(db.collections)) {
        states.push(await replicateMicrosoftOneDrive({
            replicationIdentifier: `onedrive-${options.folderPath}-${(collection as any).name}`,
            collection: collection as any,
            oneDrive: {
                oauthClientId: options.clientId,
                authToken: options.authToken,
                folderPath: `${options.folderPath}/${(collection as any).name}`,
            },
            live: true,
            pull: {},
            push: {},
        } as any));
    }
    return handleFor(states);
}

/* -------------------------------------------------------------------- P2P */

/** RxDB's public test server. Free, unauthenticated, and explicitly not reliable. */
export const DEFAULT_SIGNALING_SERVER = 'wss://signaling.rxdb.info/';

/**
 * A room name that is also its own password.
 *
 * 128 bits of randomness, printed in base36. Anyone who joins the same room
 * replicates with him, and the *only* thing standing between his readings and a
 * stranger is that the name cannot be guessed — the same bargain the published
 * page URL makes (`CLAUDE.md` §9), for the same reason: there is no server here
 * that could hold an account.
 */
export function newSyncCode(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('');
}

/**
 * Replicate directly with whoever else is in the room, over WebRTC.
 *
 * The signalling server only introduces the two browsers; once they have found
 * each other the documents travel straight from device to device and the server
 * sees none of them. It has to be **running at the same time on both ends** —
 * this is a live connection, not a mailbox.
 */
export async function syncP2P(
    db: RxDatabase<any>,
    options: { code: string; appId: string; signalingServerUrl?: string },
): Promise<SyncHandle> {
    ensureProcessShim();
    const { replicateWebRTC, getConnectionHandlerSimplePeer } =
        await import('rxdb/plugins/replication-webrtc');
    const connectionHandlerCreator = getConnectionHandlerSimplePeer({
        signalingServerUrl: options.signalingServerUrl || DEFAULT_SIGNALING_SERVER,
    });
    const states = [];
    for (const collection of Object.values(db.collections)) {
        // One room per collection: the plugin replicates a single collection,
        // and two collections sharing a room would hand each other documents
        // that fail the other's schema.
        states.push(await replicateWebRTC({
            collection: collection as any,
            topic: `${options.appId}-${options.code}-${(collection as any).name}`,
            connectionHandlerCreator,
            pull: {},
            push: {},
        } as any));
    }
    return handleFor(states);
}

/* ---------------------------------------------------------- the live session

   A running replication belongs to the page, not to the modal that started it.
   Keeping the handle in `<SyncPanel>` meant it died the moment the modal closed
   — `<Modal>` unmounts its children — which is exactly the bug he reported
   _(„it should continue syncing when the modal is closed")_. So it lives here,
   in module scope, and React subscribes to it rather than owning it. */

export type SyncTarget = 'google' | 'onedrive' | 'p2p';

export type SyncSession = {
    target: SyncTarget;
    /** The room, for P2P. Shown in the modal so he can see what is connected. */
    code?: string;
    handle: SyncHandle;
};

let session: SyncSession | null = null;
const listeners = new Set<() => void>();

function announce(): void {
    for (const listener of Array.from(listeners)) listener();
}

/** For `useSyncExternalStore`. */
export function subscribeSync(listener: () => void): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

/** The running session, or null. Identity is stable while nothing changes. */
export function currentSync(): SyncSession | null {
    return session;
}

/** Stop whatever is running. Safe to call when nothing is. */
export async function stopSync(): Promise<void> {
    const running = session;
    session = null;
    announce();
    await running?.handle.stop();
}

/**
 * Replace the running session with a new one.
 *
 * Announces twice on purpose: once when the old one is gone so the modal shows
 * the connecting state, once when the new one is up.
 */
export async function setSync(target: SyncTarget, begin: () => Promise<SyncHandle>, code?: string): Promise<void> {
    await stopSync();
    const handle = await begin();
    session = { target, code, handle };
    announce();
}

/* ------------------------------------------------- remembering the P2P codes

   Three separate things, and conflating them was a bug _(2026-09-09: „remember
   the copied and pasted p2p code")_:

   - **`own`** is his address. He copies it and hands it to someone, and that
     someone may open the link tomorrow. A code regenerated on the next page load
     would silently make the one he already gave away point at nobody.
   - **`join`** is the code he was given. Worth keeping so the field is still
     filled after a reload — otherwise the page resumes a room whose name it can
     no longer show him.
   - **`room`** is what was actually running. Its *presence* is the flag that
     says „resume this on the next visit", and *Stop* is what removes it.

   All three swallow their storage errors: a private window throws on read and on
   write, and a browser that will not remember a code should cost him a paste,
   not a broken modal. */

function p2pKey(appId: string, name: 'own' | 'join' | 'room'): string {
    return name === 'room' ? `me-${appId}-p2p-code` : `me-${appId}-p2p-${name}`;
}

function readLocal(key: string): string {
    try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function writeLocal(key: string, value: string): void {
    try {
        if (value) localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    } catch { /* private window: it just will not stick */ }
}

/**
 * His own room — generated once, then kept for good.
 *
 * This is the closest thing the page has to an address, so it has to outlive
 * the tab: a code he copied last week must still reach him today.
 */
export function ownP2PCode(appId: string): string {
    const stored = readLocal(p2pKey(appId, 'own'));
    if (stored) return stored;
    const fresh = newSyncCode();
    writeLocal(p2pKey(appId, 'own'), fresh);
    return fresh;
}

/** Deliberately throw the old address away and mint a new one. */
export function newOwnP2PCode(appId: string): string {
    const fresh = newSyncCode();
    writeLocal(p2pKey(appId, 'own'), fresh);
    return fresh;
}

/** The last code he was given, so the field is filled again after a reload. */
export function joinP2PCode(appId: string): string {
    return readLocal(p2pKey(appId, 'join'));
}

export function setJoinP2PCode(appId: string, code: string): void {
    writeLocal(p2pKey(appId, 'join'), code);
}

/** The room that is running — its presence is what `resumeP2P` acts on. */
export function rememberP2P(appId: string, code: string): void {
    writeLocal(p2pKey(appId, 'room'), code);
}

export function forgetP2P(appId: string): void {
    writeLocal(p2pKey(appId, 'room'), '');
}

export function rememberedP2P(appId: string): string {
    return readLocal(p2pKey(appId, 'room'));
}

/**
 * Pick up a P2P session that a previous visit started.
 *
 * Called once when the page mounts. It does nothing at all unless there is a
 * stored code, so a page he never connected stays as quiet as it always was.
 */
export async function resumeP2P(
    db: RxDatabase<any>,
    options: { appId: string; signalingServerUrl?: string },
): Promise<string> {
    const code = rememberedP2P(options.appId);
    if (!code || session) return '';
    await setSync('p2p', () => syncP2P(db, { ...options, code }), code);
    return code;
}

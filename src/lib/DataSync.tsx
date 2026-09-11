/**
 * # DataSyncButton — the ⇅ in the top bar, and everything behind it
 *
 * ## What it does and how it looks
 * One round icon button next to the theme toggle. It opens a modal with four
 * ways to get the page's data off this device and back: a **file**, **Google
 * Drive**, **OneDrive**, and a **direct link to another device** over WebRTC.
 *
 * It replaces the plain download button every page used to carry _(asked for
 * 2026-09-09: „anstatt direkt zu download öffnet er ein modal")_. The reason a
 * modal beats a download is not the extra options — it is that a download is a
 * one-way door. A page whose only export is a file you can never load back is a
 * page that watched you for three months and then shrugged.
 *
 * ## Core parts
 * - **File first, always.** It needs no account, no network and no provider
 *   still being in business. The three others are conveniences stacked on top.
 * - **Nothing starts by itself.** No token is requested, no socket opened and
 *   no replication plugin even loaded until a button here is pressed. These
 *   pages promise that nothing leaves the device; the promise holds until *he*
 *   decides otherwise, per option, per session.
 * - **A missing client id is asked for, not announced** _(2026-09-09: „let the
 *   user input the id when clicking the google-drive or onedrive button")_.
 *   Google and Microsoft each need an OAuth client id, and it can only be
 *   created by a person. So the button opens a field instead of being switched
 *   off: paste it once and it stays in `localStorage`. `app.config.ts` → `sync`
 *   still supplies a default when a page ships with one.
 * - **Two codes, not one, on the P2P side** _(same day: „it need an input field
 *   where i can paste the code from someone else")_. The page generates *his*
 *   code to hand out, and takes *theirs* in a second field. One box doing both
 *   jobs meant overwriting his own code to join someone — and losing it.
 * - **The P2P code is the password.** 128 bits of randomness names the room;
 *   whoever has the string replicates with him. Same bargain as the published
 *   page URL, and the modal says so in those words.
 * - **A started sync outlives the modal, and the page** _(2026-09-09: „when p2p
 *   sync was started it should remember the token and auto-restart on reload of
 *   the page. also it should continue syncing when the modal is closed")_. The
 *   handle lives in `sync.ts`, in module scope, because `<Modal>` unmounts its
 *   children — a sync owned by the modal was a sync that could not be left on.
 *   The P2P room is remembered and picked back up on the next visit; *Stop* is
 *   also what forgets it. The clouds are not resumed: their tokens expire after
 *   an hour and come from a popup, so trying would mean a sign-in window on
 *   every page load.
 * - **His own code is an address, so it is kept for good** _(2026-09-09:
 *   „remember the copied and pasted p2p code")_. A code minted fresh on each
 *   load would quietly break the one he had already handed to someone. The
 *   pasted code is kept too, so the field still names the room after a reload.
 *   *New code* is the one way to throw the old address away.
 *
 * ## Examples
 * ```tsx
 * <Page actions={<DataSyncButton database={database} filename="sitzhaltung.json" />}>
 * ```
 *
 * ## Changelog
 * - 2026-09-09 His own P2P code and the pasted one both survive a reload.
 * - 2026-09-09 The session moved to module scope: it survives the modal closing
 *   and a P2P room is resumed on the next page load.
 * - 2026-09-09 A client id can be pasted into the modal, and P2P has its own
 *   field for the other side's code.
 * - 2026-09-09 First version: file export/import, Google Drive, OneDrive and
 *   WebRTC P2P, replacing the download-only button.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
    Button, Callout, Col, IconButton, Input, Modal, Muted, Row, Text, toast, uiText,
} from '@ui';
import { appConfig } from '@app';
import type { RxDatabase } from 'rxdb';
import {
    currentSync, downloadData, forgetP2P, googleAccessToken, importFromFile,
    joinP2PCode, microsoftAccessToken, newOwnP2PCode, ownP2PCode, rememberP2P,
    resumeP2P, setJoinP2PCode, setSync, stopSync, subscribeSync, syncGoogleDrive,
    syncOneDrive, syncP2P, type SyncHandle, type SyncTarget,
} from './sync';

export type DataSyncButtonProps = {
    database: RxDatabase<any>;
    /** File name for the export. Defaults to `<appId>.json`. */
    filename?: string;
    className?: string;
};

export function DataSyncButton({ database, filename, className }: DataSyncButtonProps) {
    const [open, setOpen] = useState(false);
    const session = useSyncExternalStore(subscribeSync, currentSync, () => null);
    const config = appConfig();
    const sync = (config as any).sync || {};

    // Pick a P2P session back up where the last visit left it. Runs once, on the
    // button — which is mounted for as long as the page is, unlike the modal.
    useEffect(() => {
        void resumeP2P(database, {
            appId: config.appId,
            signalingServerUrl: sync.signalingServer,
        }).catch(() => { /* the modal will show it when he opens it */ });
    }, [database]);

    const t = uiText();
    return (
        <>
            <IconButton
                icon="⇅"
                label={session ? `${t.syncTitle} · ${t.syncConnected}` : t.syncTitle}
                className={cx(className, session ? 'ui-syncing' : undefined)}
                onClick={() => setOpen(true)}
            />
            <Modal open={open} onClose={() => setOpen(false)} title={t.syncTitle}>
                <SyncPanel database={database} filename={filename} />
            </Modal>
        </>
    );
}

/** Local `cx`: the one in `@ui` is not exported, and this needs two classes. */
function cx(...parts: (string | undefined)[]): string | undefined {
    const joined = parts.filter(Boolean).join(' ');
    return joined || undefined;
}

function SyncPanel({ database, filename }: { database: RxDatabase<any>; filename?: string }) {
    const t = uiText();
    const config = appConfig();
    const sync = (config as any).sync || {};
    const file = filename || `${config.appId}.json`;

    /**
     * What is running lives in the module, not here: the modal unmounts when it
     * closes, and a sync that stops with it would be a sync he cannot leave on
     * _(„it should continue syncing when the modal is closed")_.
     */
    const session = useSyncExternalStore(subscribeSync, currentSync, () => null);
    const running: SyncTarget | null = session?.target ?? null;
    const [busy, setBusy] = useState<SyncTarget | null>(null);
    /**
     * His own room, to hand out — and the one he was handed, if any. **Both are
     * remembered** _(„remember the copied and pasted p2p code")_: his own is an
     * address he may already have given away, and a code he pasted should still
     * be in the field after a reload rather than leaving him looking at a room
     * he cannot name.
     */
    const [code, setCode] = useState(() => ownP2PCode(config.appId));
    const [joinCode, setJoinCode] = useState(() => joinP2PCode(config.appId));
    const [copied, setCopied] = useState(false);
    const picker = useRef<HTMLInputElement | null>(null);

    /**
     * Client ids: the page's own if this origin is allowed to use it, otherwise
     * whatever he pasted last. A client id is public by nature, so `localStorage`
     * is the right shelf — it belongs to this browser, like the data it unlocks.
     */
    const [ids, setIds] = useState<Record<string, string>>(() => ({
        google: bundledId(sync.googleClientId, sync.googleClientOrigins) || readId(config.appId, 'google'),
        onedrive: sync.microsoftClientId || readId(config.appId, 'onedrive'),
    }));
    /** Which provider is currently showing its id field. */
    const [asking, setAsking] = useState<'google' | 'onedrive' | null>(null);
    const [draft, setDraft] = useState('');

    async function stop() {
        // Stopping is also the way to say "do not come back": a remembered code
        // that outlives an explicit Stop would resurrect the session on reload.
        forgetP2P(config.appId);
        await stopSync();
    }

    async function start(target: SyncTarget, begin: () => Promise<SyncHandle>, room?: string) {
        if (running === target) return stop();
        setBusy(target);
        try {
            await setSync(target, async () => {
                const started = await begin();
                started.onError((message) => toast(t.syncFailed(message)));
                return started;
            }, room);
            if (room) rememberP2P(config.appId, room);
        } catch (failure) {
            toast(t.syncFailed(String((failure as Error)?.message || failure)));
        } finally {
            setBusy(null);
        }
    }

    const folderPath = `rxdb/${config.appId}`;
    /** Someone else's code wins while it is filled in; that is what joining is. */
    const roomCode = joinCode.trim() || code;

    /** Connect, asking for the client id first if we have not got one. */
    function cloud(target: 'google' | 'onedrive') {
        const id = ids[target];
        if (!id) {
            setAsking(asking === target ? null : target);
            setDraft('');
            return;
        }
        const connect = target === 'google'
            ? async () => syncGoogleDrive(database, {
                clientId: id, authToken: await googleAccessToken(id), folderPath,
            })
            : async () => syncOneDrive(database, {
                clientId: id, authToken: await microsoftAccessToken(id), folderPath,
            });
        void start(target, connect);
    }

    return (
        <Col gap={4}>
            <Text>{t.syncIntro}</Text>

            {/* ------------------------------------------------------- file */}
            <Block title={t.syncFileTitle} note={t.syncFileNote}>
                <Row gap={2} wrap>
                    <Button
                        variant="primary"
                        icon="⤓"
                        onClick={async () => { await downloadData(database, file); }}
                    >
                        {t.syncExport}
                    </Button>
                    <Button icon="⤒" onClick={() => picker.current?.click()}>
                        {t.syncImport}
                    </Button>
                </Row>
                <input
                    ref={picker}
                    type="file"
                    accept="application/json,.json"
                    hidden
                    onChange={async (event) => {
                        const chosen = event.target.files?.[0];
                        event.target.value = '';
                        if (!chosen) return;
                        try {
                            toast(t.syncImported(await importFromFile(database, chosen)));
                        } catch (failure) {
                            toast(t.syncFailed(String((failure as Error)?.message || failure)));
                        }
                    }}
                />
            </Block>

            {/* ------------------------------------------------------ clouds
                Both providers share one block. They are the same offer with a
                different logo, and printing the identical paragraph twice made
                the modal twice as long as it needed to be. */}
            <Block title={t.syncCloudTitle} note={t.syncCloudNote}>
                <Row gap={2} wrap>
                    <Cloud
                        label={t.syncGoogleTitle}
                        running={running === 'google'}
                        busy={busy === 'google'}
                        onToggle={() => cloud('google')}
                    />
                    <Cloud
                        label={t.syncOneDriveTitle}
                        running={running === 'onedrive'}
                        busy={busy === 'onedrive'}
                        onToggle={() => cloud('onedrive')}
                    />
                </Row>
                {asking ? (
                    <Col gap={2}>
                        <Callout tone="warn">{t.syncNeedsClientId}</Callout>
                        <Row gap={2} align="bottom" wrap>
                            <Input
                                label={`${asking === 'google' ? t.syncGoogleTitle : t.syncOneDriveTitle} · ${t.syncClientIdLabel}`}
                                value={draft}
                                spellCheck={false}
                                autoFocus
                                onChange={(e: any) => setDraft(e.target.value)}
                            />
                            <Button
                                variant="primary"
                                disabled={!draft.trim()}
                                onClick={() => {
                                    const id = draft.trim();
                                    const target = asking;
                                    writeId(config.appId, target, id);
                                    setIds({ ...ids, [target]: id });
                                    setAsking(null);
                                    // The id is in `ids` only after the next
                                    // render, so this call carries it itself.
                                    void start(target, target === 'google'
                                        ? async () => syncGoogleDrive(database, {
                                            clientId: id, authToken: await googleAccessToken(id), folderPath,
                                        })
                                        : async () => syncOneDrive(database, {
                                            clientId: id, authToken: await microsoftAccessToken(id), folderPath,
                                        }));
                                }}
                            >
                                {t.syncSaveAndConnect}
                            </Button>
                        </Row>
                    </Col>
                ) : null}
            </Block>

            {/* -------------------------------------------------------- p2p */}
            <Block title={t.syncP2PTitle} note={t.syncP2PNote}>
                <Row gap={2} align="bottom" wrap>
                    <Input
                        label={t.syncCode}
                        value={code}
                        spellCheck={false}
                        readOnly
                    />
                    <Button
                        icon={copied ? '✓' : '⧉'}
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(code);
                                setCopied(true);
                                toast(t.syncCopied);
                            } catch {
                                toast(t.copyFailed);
                            }
                        }}
                    >
                        {copied ? t.syncCopied : t.syncCopy}
                    </Button>
                    <Button
                        icon="⟳"
                        disabled={running === 'p2p'}
                        onClick={() => { setCode(newOwnP2PCode(config.appId)); setCopied(false); }}
                    >
                        {t.syncNewCode}
                    </Button>
                </Row>
                <Input
                    label={t.syncJoinCode}
                    hint={t.syncJoinHint}
                    value={joinCode}
                    spellCheck={false}
                    disabled={running === 'p2p'}
                    placeholder="…"
                    onChange={(e: any) => {
                        const next = e.target.value.trim();
                        setJoinCode(next);
                        setJoinP2PCode(config.appId, next);
                    }}
                />
                <Row gap={2} wrap>
                    <Button
                        variant={running === 'p2p' ? 'danger' : 'primary'}
                        disabled={busy === 'p2p' || !roomCode}
                        onClick={() => start('p2p', async () => syncP2P(database, {
                            code: roomCode,
                            appId: config.appId,
                            signalingServerUrl: sync.signalingServer,
                        }), roomCode)}
                    >
                        {running === 'p2p' ? t.syncStop : t.syncStart}
                    </Button>
                    {running === 'p2p' ? <Muted>{`${t.syncConnected} · ${session?.code || roomCode}`}</Muted> : null}
                </Row>
                <Muted>{t.syncBothOpen}</Muted>
            </Block>
        </Col>
    );
}

function Block({ title, note, children }: {
    title: string; note: string; children: React.ReactNode;
}) {
    return (
        <Col gap={2}>
            <Text><strong>{title}</strong></Text>
            <Muted>{note}</Muted>
            {children}
        </Col>
    );
}

/**
 * One provider — always pressable. Without a client id the press opens the
 * field to paste one, which is the only thing that could have unblocked it
 * anyway; a disabled button just left the reader with nowhere to go.
 */
function Cloud({ label, running, busy, onToggle }: {
    label: string; running: boolean; busy: boolean; onToggle: () => void;
}) {
    const t = uiText();
    return (
        <Button
            variant={running ? 'danger' : 'primary'}
            disabled={busy}
            onClick={onToggle}
        >
            {`${label} · ${running ? t.syncDisconnect : t.syncConnect}`}
        </Button>
    );
}

/**
 * A pasted client id, remembered per page and provider.
 *
 * `localStorage` is shared by every page this repo publishes (one origin), so
 * the key carries the `appId`. Both accessors swallow their errors: a private
 * window can throw on read *and* on write, and a browser that will not remember
 * a client id should cost him one extra paste, not a broken modal.
 */
function idKey(appId: string, provider: string): string {
    return `me-${appId}-${provider}-client-id`;
}

function readId(appId: string, provider: string): string {
    try {
        return localStorage.getItem(idKey(appId, provider)) || '';
    } catch {
        return '';
    }
}

function writeId(appId: string, provider: string, id: string): void {
    try {
        localStorage.setItem(idKey(appId, provider), id);
    } catch { /* private window: it just will not stick */ }
}

function bundledId(id?: string, origins?: string[]): string {
    if (!id) return '';
    if (!origins?.length) return id;
    return origins.indexOf(location.origin) !== -1 ? id : '';
}

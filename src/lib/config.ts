/**
 * The page's identity, in one place: what it is called, what it was asked, what
 * colour it wears — and the id its local database is namespaced under.
 *
 * This module **touches no browser global**, because `build_app.py` also
 * imports it in Node to turn the config into the flags for
 * `.claude/ui/build_page.py`. Keep it that way: one source of truth for the
 * page header, the favicon, the slug and the database name.
 *
 * It does keep one piece of state: `defineApp` remembers what it was handed, so
 * that shared components can read the config without every page threading it
 * down as a prop. Harmless in Node — it is a variable, not a global — and it is
 * what lets `<DataSyncButton>` find its OAuth client ids on its own.
 */

/** The accent presets in `.claude/ui/theme.css`. A new domain adds one there. */
export type Accent = 'fashion' | 'travel' | 'music' | 'ink' | 'food' | 'home' | 'health' | 'shrimp-calm' | 'shrimp-warm';

export type AppConfig = {
     /**
     * Unique id of this page. Becomes the RxDB database name (`me-<appId>`), so
     * it must be unique across everything this repo publishes: every page is
     * served from the same origin and therefore shares one IndexedDB and one
     * localStorage namespace. Two pages called `app` would read each other's
     * documents.
     *
     * It is **not** the published slug — that one is random, and being
     * unguessable is what protects the page (CLAUDE.md §9).
     */
    appId: string;
    /**
     * **The page's permanent URL.** `new_app.py` mints it once, when the app
     * folder is created, and it never changes again on its own: every
     * `build_app.py --publish` passes it straight back to `publish-page.py`, so
     * rebuilding an app republishes it *at the same address* rather than
     * scattering a new link each time.
     *
     * Shape: `<date>-<title>-<16 hex characters>`. Those 16 characters are 64
     * bits of randomness and they are **the password** — whoever has the URL can
     * read the page, and nobody can guess it (CLAUDE.md §9). Never shorten it,
     * never make it descriptive, never reuse one across apps.
     *
     * Changing it strands every link he already has, so it changes **only when
     * he asks**: `new_app.py --new-url` mints a fresh one,
     * `build_app.py --slug …` publishes to a different address once.
     */
    slug?: string;
    /** The `h1`. Names *the answer*, not the tool. Max ~22 characters wide. */
    title: string;
    /** One line under it: count, budget, dates, distance. Separator ` · `. */
    subtitle?: string;
    /** His request, **verbatim** — wording and typos intact (PAGE-SPEC.md §5). */
    task: string;
    /** Label above the task text, when „Aufgabe" is not the right word. */
    taskLabel?: string;
    accent: Accent;
    /** Emoji for the favicon and the installed app icon. */
    icon: string;
    /** The skill that produced the page. Shown in the footer. */
    source: string;
    lang?: string;
    /**
     * What the ⇅ button may sync to, beyond a file on his disk.
     *
     * **Both client ids are public by design** — an OAuth client id identifies
     * the app, it does not authorise anything on its own, and the whole flow
     * happens in the reader's browser. They still have to be registered by hand
     * once per provider; a page built without them shows the option and says
     * what is missing, rather than offering a button that cannot work.
     */
    sync?: SyncConfig;
};

export type SyncConfig = {
    /**
     * Google Cloud console → Credentials → OAuth client id, type "Web
     * application", with the published page's origin under "Authorised
     * JavaScript origins". Scope used: `drive.appdata` — a hidden folder of
     * this client's own, never the reader's other files.
     */
    googleClientId?: string;
    /**
     * Entra ID → App registrations → new registration, platform
     * "Single-page application", redirect URI = the published page URL.
     * Scope used: `Files.ReadWrite.AppFolder`.
     */
    microsoftClientId?: string;
    /**
     * Signalling server for the peer-to-peer option. Defaults to RxDB's public
     * test server, which is free, unauthenticated and explicitly not reliable —
     * fine for two of his own devices, not something to depend on.
     */
    signalingServer?: string;
};

let current: AppConfig | null = null;

/**
 * The config of the page that is running.
 *
 * Set by `defineApp`, which every `app.config.ts` calls at module scope, so it
 * is there before anything renders. Shared components use it instead of asking
 * every page to hand its own identity down through props.
 */
export function appConfig(): AppConfig {
    if (!current) {
        throw new Error(
            'No app config: the page must import its own app.config.ts ' +
            '(defineApp registers it) before a component asks for it.',
        );
    }
    return current;
}

/** Registers the config and hands it straight back, so it also types the file. */
export function defineApp(config: AppConfig): AppConfig {
    current = config;
    return config;
}

/**
 * # PageMeta — everything *about* the page, in one block at the end
 *
 * ## What it does and how it looks
 * The closing block of every generated page, headed „Zu dieser Seite" and set
 * off from the content by a hairline above it. Under the heading a row of tabs
 * — „Aufgabe", „Datengrundlage", „Quellen" — of which exactly one is open at a
 * time, and under them the faint build stamp („Erstellt am 2026-09-01 um 10:47
 * Uhr · app-trip-routes"), which is always visible.
 *
 * Two decisions made it what it is:
 *
 * 1. **It is one block, and it is last** _(requested 2026-09-01: „Bau eine
 *    generische Komponente die immer am Schluss angezeigt wird. nur dort werden
 *    die meta-infos wie prompt/datengrundlage/etc angezeigt")_. Everything above
 *    it is **the answer**; everything in it is **about** the answer — what was
 *    asked, what it rests on, where it came from, when it was made. Before that
 *    the task box sat under the title and pushed the answer below the fold.
 * 2. **Its parts are tabs, not a stack** _(requested 2026-09-01: „alles im
 *    abschlussblock sollte in tabs sein die man togglen kann, nicht
 *    untereinander")_. Stacked, the provenance was longer than some answers —
 *    a gap list plus a source list is easily two screens of scrolling past the
 *    thing he actually came for. Tabbed, the block is four lines tall until he
 *    asks it something.
 *
 * `<Page>` renders it automatically as the last thing on the page, so a page
 * body never places it and never renders `<DataGaps>` or `<SourceList>`
 * itself — it hands them to `<Page>` as `gaps` and `sources`.
 *
 * ## Core parts
 * - `task` + `taskLabel` — his request, verbatim. Defaults to
 *   `PAGE_DATA.meta.task`, which `build_page.py` fills from `--task`.
 * - `gaps` — the `<DataGaps>` items. `gapsProps` passes that component its
 *   remaining options (`intro`, `ask`, `askTitle`, `subtitle`).
 * - `sources` — the `<SourceList>` items.
 * - `footer` — replaces the build stamp. Only ever to *add* to it: the date and
 *   time are what make a link found months later legible. It sits **below** the
 *   tabs and is never hidden behind one — a page whose date needs a click has
 *   no date.
 * - a part with nothing in it grows no tab; the first one that exists is open.
 * - **a link into a closed tab opens it** — `useTabForHash` below. `<Assumed
 *   to="gewicht">` points at `#gap-gewicht`, which lives inside
 *   „Datengrundlage"; without this the link would be dead the moment the block
 *   became tabbed.
 * - the tabs keep the ids the parts had when they were sections of their own,
 *   `#datengrundlage` and `#quellen`, and their fixed names come from
 *   `DATA_GAPS_TITLE` and `SOURCE_LIST_TITLE`.
 * - the block owns the page's last `h2`; nothing inside it is a heading, since
 *   the open tab is what names its panel.
 *
 * ## Examples
 * ```tsx
 * <PageMeta gaps={data.gaps} sources={data.sources} />
 * <PageMeta gaps={data.gaps} gapsProps={{ intro: data.gapsIntro }} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-09-01 The parts are tabs instead of a stack, and a link into a closed
 *   tab opens it.
 * - 2026-09-01 The build stamp carries the time of day, not only the date —
 *   two builds of a page on one day are the normal case.
 * - 2026-09-01 First version: the task box moved out of the header into here,
 *   together with „Datengrundlage", „Quellen" and the build stamp.
 */

import { useEffect, useState } from 'react';
import { PAGE } from './page-data';
import { DataGaps, type DataGapsProps, type Gap } from './DataGaps';
import { Section } from './Section';
import { SourceList, type Source } from './SourceList';
import { Tabs } from './Tabs';
import { TaskBox } from './TaskBox';
import { uiLang, uiText } from './lang';
import type { ReactNode } from './_types';

/** One heading for every page, like the tab names inside it. */
/** @deprecated Read `uiText().metaTitle` — these are always German. */
export const PAGE_META_TITLE = 'Zu dieser Seite';
export const PAGE_META_SUBTITLE =
    'Die Anfrage, auf der sie beruht, und woher die Angaben stammen.';

/** The tab ids, which are also the anchors the parts have always had. */
export const TASK_TAB = 'aufgabe';
export const GAPS_TAB = 'datengrundlage';
export const SOURCES_TAB = 'quellen';

export type PageMetaProps = {
    /** His request, verbatim. Defaults to `PAGE_DATA.meta.task`. */
    task?: ReactNode;
    taskLabel?: ReactNode;
    gaps?: Gap[];
    /** The rest of `<DataGaps>`: `intro`, `ask`, `askTitle`, `subtitle`. */
    gapsProps?: Omit<DataGapsProps, 'items' | 'section' | 'title'>;
    sources?: Source[];
    /** Replaces the build stamp. Never drop the date from it. */
    footer?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    id?: string;
};

type Part = { id: string; label: ReactNode; badge?: ReactNode; body: ReactNode; note?: ReactNode };

/**
 * Which tab an anchor belongs to.
 *
 * `<Assumed to="x">` links to `#gap-x` and a source citation to `#src-3`; both
 * of those live inside a panel that may be closed. Everything else — including
 * the block's own `#zur-seite` — is not a part and returns null.
 */
function tabForHash(hash: string): string | null {
    const h = (hash || '').replace(/^#/, '');
    if (!h) return null;
    if (h === TASK_TAB || h === GAPS_TAB || h === SOURCES_TAB) return h;
    if (h.indexOf('gap-') === 0) return GAPS_TAB;
    if (h.indexOf('src-') === 0) return SOURCES_TAB;
    return null;
}

/**
 * Keeps the open tab in step with the URL fragment: on load, and whenever a
 * link on the page points into one of the panels. The target is scrolled to
 * *after* the tab has rendered — the element does not exist before that, which
 * is exactly why the browser's own jump does nothing here.
 */
function useTabForHash(available: string[], initial: string) {
    const [tab, setTab] = useState<string>(
        () => pick(typeof location !== 'undefined' ? location.hash : '', available) || initial,
    );
    const [pending, setPending] = useState<string>('');

    useEffect(() => {
        const onHash = () => {
            const want = pick(location.hash, available);
            if (!want) return;
            setTab(want);
            setPending(location.hash.replace(/^#/, ''));
        };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, [available.join(',')]);

    useEffect(() => {
        if (!pending) return;
        const el = document.getElementById(pending);
        if (el) el.scrollIntoView({ block: 'center' });
        setPending('');
    }, [pending, tab]);

    return [tab, setTab] as const;
}

function pick(hash: string, available: string[]): string | null {
    const want = tabForHash(hash);
    return want && available.indexOf(want) !== -1 ? want : null;
}

/**
 * „Erstellt am 2026-09-01 um 10:47 Uhr · app-trip-routes".
 *
 * The time of day is part of it because two builds of the same page on the same
 * day are the normal case while it is being worked on, and a bare date cannot
 * tell them apart. It is the clock in **Stuttgart** at the moment of the build,
 * not the reader's and not the build machine's — `build_page.py` converts it —
 * and the `<time>` element carries the full timestamp with its offset, so
 * nothing is guessed from the rendered text.
 */
function BuildStamp() {
    const meta = PAGE.meta || {};
    const at: string = typeof meta.generatedAt === 'string' ? meta.generatedAt : '';
    const day: string = meta.generated || at.slice(0, 10);
    // Sliced rather than parsed: `new Date(at)` would re-render the moment in
    // whatever zone the reader's browser is in, which is not what was meant.
    const hhmm = at.slice(11, 16);

    if (!day) return <>{meta.source || ''}</>;
    const english = uiLang() === 'en';
    return (
        <>
            {english ? 'Built on ' : 'Erstellt am '}
            <time dateTime={at || day}>
                {day}{hhmm ? (english ? ' at ' + hhmm : ' um ' + hhmm + ' Uhr') : ''}
            </time>
            {meta.source ? ' · ' + meta.source : ''}
        </>
    );
}

export function PageMeta(props: PageMetaProps) {
    const meta = PAGE.meta || {};
    const t = uiText();
    const task = props.task != null ? props.task : meta.task;
    const gaps = (props.gaps || []).filter(Boolean);
    const sources = (props.sources || []).filter(Boolean);
    const gapsProps = props.gapsProps || {};

    const parts: Part[] = [];
    if (task) {
        parts.push({
            id: TASK_TAB,
            // `meta.taskLabel` comes from `build_page.py --task-label`, which
            // is written once at build time and therefore always German. It
            // only wins on a German page; otherwise the frame's own word does.
            label: props.taskLabel != null ? props.taskLabel
                : ((uiLang() === 'de' && meta.taskLabel) || t.taskLabel),
            // The tab already says „Aufgabe"; the box saying it again is noise.
            body: <TaskBox label={false}>{task}</TaskBox>,
        });
    }
    if (gaps.length) {
        parts.push({
            id: GAPS_TAB,
            label: t.gapsTitle,
            badge: gaps.length,
            note: gapsProps.subtitle != null ? gapsProps.subtitle : t.gapsSubtitle,
            body: <DataGaps {...gapsProps} items={gaps} section={false} />,
        });
    }
    if (sources.length) {
        parts.push({
            id: SOURCES_TAB,
            label: t.sourcesTitle,
            badge: sources.length,
            body: <SourceList items={sources} section={false} />,
        });
    }

    const ids = parts.map((p) => p.id);
    const [tab, setTab] = useTabForHash(ids, ids[0] || '');
    const open = parts.filter((p) => p.id === tab)[0] || parts[0];

    return (
        <Section
            className="ui-meta"
            id={props.id || 'zur-seite'}
            title={props.title || t.metaTitle}
            subtitle={props.subtitle != null ? props.subtitle : t.metaSubtitle}
        >
            {parts.length > 1 ? (
                <Tabs
                    className="ui-meta-tabs"
                    value={open ? open.id : ''}
                    onChange={setTab}
                    tabs={parts.map((p) => ({ id: p.id, label: p.label, badge: p.badge }))}
                />
            ) : null}

            {open ? (
                <div className="ui-meta-panel" id={open.id} role="tabpanel">
                    {open.note ? <p className="ui-text ui-muted ui-meta-note">{open.note}</p> : null}
                    {open.body}
                </div>
            ) : null}

            <div className="ui-meta-stamp">{props.footer || <BuildStamp />}</div>
        </Section>
    );
}

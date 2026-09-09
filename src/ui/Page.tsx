/**
 * # Page — the frame every generated page wears
 *
 * ## What it does and how it looks
 * Top bar with the share and theme buttons on the right, then the centred
 * header (eyebrow, the single `h1`, subtitle), then the content in a reading
 * column, then `<PageMeta>` at the foot: the verbatim task, the
 * „Datengrundlage", the „Quellen" and the build stamp.
 *
 * Every page in this repo renders exactly this frame. `PAGE-SPEC.md` is the
 * specification and this is its implementation — deviating from it needs a
 * reason, not a preference. The point is that his pages are recognisably one
 * product: the share button is always in the same corner, the task is always
 * quoted in the same place, the footer always says when.
 *
 * ## Core parts
 * - title, subtitle, task and the build stamp default to `PAGE_DATA.meta`,
 *   which `build_page.py` filled from its flags. A page passes them only to
 *   override.
 * - `gaps` / `gapsProps` / `sources` — handed to `<PageMeta>`. A page never
 *   renders `<DataGaps>` or `<SourceList>` itself: everything *about* the
 *   answer belongs in the one block at the end.
 * - `actions` — extra icon buttons left of share and theme (an export button,
 *   a reset).
 * - `share={false}` / `theme={false}` — remove those buttons. Rarely right.
 * - `lang` — `"de"` (default) or `"en"`, for the frame's own labels.
 * - `languages` + `onLangChange` — turn the top-bar language control from a
 *   label into a picker. Without them it shows the one language and nothing else.
 * - `width` — `"narrow"`, `"wide"` or `"full"`, applied to header, main and
 *   footer alike. `"full"` goes edge to edge: for a dashboard, where the
 *   content is tiles and charts rather than prose, a reading column wastes the
 *   half of the screen the tiles want.
 * - it sets `document.title` from the title, so a browser tab and a bookmark
 *   say what the page is.
 *
 * ## Examples
 * ```tsx
 * <Page gaps={data.gaps} sources={data.sources}>{sections}</Page>
 * <Page width="wide" actions={<IconButton icon="⤓" label="Sichern" onClick={save} />}>…</Page>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 `<LanguagePicker>` in the top bar, right of the theme toggle.
 * - 2026-09-08 `lang` switches the frame's fixed labels to English.
 * - 2026-09-01 The task box left the header; `<PageMeta>` closes every page
 *   and takes `gaps` and `sources` with it.
 * - 2026-08-31 Own file.
 */

import { useEffect } from 'react';
import { PAGE } from './page-data';
import { PageHeader } from './PageHeader';
import { PageMeta, type PageMetaProps } from './PageMeta';
import { ShareButton } from './ShareButton';
import { ThemeToggle } from './ThemeToggle';
import { LanguagePicker } from './LanguagePicker';
import { setUiLang, type UiLang } from './lang';
import { Wrap } from './Wrap';
import type { ReactNode } from './_types';

export type PageProps = Pick<PageMetaProps, 'task' | 'taskLabel' | 'gaps' | 'gapsProps' | 'sources'> & {
    title?: ReactNode;
    subtitle?: ReactNode;
    eyebrow?: ReactNode;
    /** Extra buttons in the top bar, left of share and theme. */
    actions?: ReactNode;
    /** Replaces the build stamp at the very bottom. Keep the date in it. */
    footer?: ReactNode;
    share?: boolean;
    theme?: boolean;
    /**
     * The language of the page frame — the labels this component and
     * `<PageMeta>` own, not the page's own copy. Defaults to German, which is
     * what every page in this repo is; `"en"` exists because `app-haltung` can
     * be switched (2026-09-08) and a German „Zu dieser Seite" under an English
     * answer reads like a bug.
     */
    lang?: UiLang;
    /**
     * Which languages this page actually has. One (the default) makes the
     * control in the top bar a label; two or more, together with `onLangChange`,
     * make it a picker.
     */
    languages?: UiLang[];
    /** Called when he picks another language. Store it and re-render with it. */
    onLangChange?: (lang: UiLang) => void;
    width?: 'narrow' | 'wide' | 'full';
    children?: ReactNode;
};

export function Page(props: PageProps) {
    // Set before the subtree renders, so the frame components below read the
    // right labels on this very pass. A module value rather than a context
    // because <ShareButton> and <DataGaps> are also used outside any <Page>.
    setUiLang(props.lang);
    const meta = PAGE.meta || {};
    const title = props.title != null ? props.title : meta.title;
    const subtitle = props.subtitle != null ? props.subtitle : meta.subtitle;
    useEffect(() => { if (typeof title === 'string' && title) document.title = title; }, [title]);

    return (
        <div className="ui-shell">
            <div className="ui-topbar">
                {props.actions}
                {props.share === false ? null : <ShareButton title={typeof title === 'string' ? title : undefined} />}
                {props.theme === false ? null : <ThemeToggle />}
                {/* Right of the theme toggle, on every page — a label when the
                    page has one language, a picker when it has several. */}
                <LanguagePicker
                    value={props.lang}
                    languages={props.languages || (props.lang ? [props.lang] : ['de'])}
                    onChange={props.onLangChange}
                />
            </div>

            <Wrap width={props.width}>
                <PageHeader title={title} subtitle={subtitle} eyebrow={props.eyebrow} />
            </Wrap>

            <main className="ui-main">
                <Wrap width={props.width}>{props.children}</Wrap>
            </main>

            {/* Everything *about* the page, always last, always the same shape. */}
            <footer className="ui-pagefoot">
                <Wrap width={props.width}>
                    <PageMeta
                        task={props.task}
                        taskLabel={props.taskLabel}
                        gaps={props.gaps}
                        gapsProps={props.gapsProps}
                        sources={props.sources}
                        footer={props.footer}
                    />
                </Wrap>
            </footer>
        </div>
    );
}

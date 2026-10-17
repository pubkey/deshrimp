/**
 * # Page - the frame every generated page wears
 *
 * ## What it does and how it looks
 * Top bar with the share and theme buttons on the right, then the header
 * (eyebrow, the single `h1`, subtitle), then the content. That is the whole
 * frame: the page ends where its content ends.
 *
 * Every page in this repo renders exactly this frame. The point is that his
 * pages are recognisably one product: the share button is always in the same
 * corner, the header is always the same shape.
 *
 * ## Core parts
 * - title and subtitle default to `PAGE_DATA.meta`. A page passes them only to
 *   override.
 * - `actions` - extra icon buttons left of share and theme (an export button,
 *   a reset).
 * - `share={false}` / `theme={false}` - remove those buttons. Rarely right.
 * - `lang` - `"de"` (default) or `"en"`, for the frame's own labels.
 * - `languages` + `onLangChange` - turn the top-bar language control from a
 *   label into a picker. Without them it shows the one language and nothing else.
 * - `width` - `"narrow"`, `"wide"` or `"full"`, applied to header, main and
 *   footer alike. `"full"` goes edge to edge: for a dashboard, where the
 *   content is tiles and charts rather than prose, a reading column wastes the
 *   half of the screen the tiles want.
 * - it sets `document.title` from the title, so a browser tab and a bookmark
 *   say what the page is.
 *
 * ## Examples
 * ```tsx
 * <Page lang="en">{sections}</Page>
 * <Page width="wide" actions={<IconButton icon={<Icon name="download" size={20} />}
 *     label="Save" onClick={save} />}>…</Page>
 * ```
 *
 * ## Changelog
 * - 2026-09-15 The frame's default language is English, not German.
 * - 2026-09-15 The „About this page" block is gone - his call, „wir brauchen
 *   das nicht". With it went the task box, the „Data basis" and „Sources" tabs
 *   and the build stamp, and the `task` / `gaps` / `sources` / `footer` props that fed
 *   them. The sources outlived it in `scripts/seo.mjs`, where only a crawler
 *   could read them, and are gone from there too _(2026-09-15, his call)_.
 * - 2026-09-08 `<LanguagePicker>` in the top bar, right of the theme toggle.
 * - 2026-09-08 `lang` switches the frame's fixed labels to English.
 * - 2026-08-31 Own file.
 */

import { useEffect } from 'react';
import { PAGE } from './page-data';
import { PageHeader } from './PageHeader';
import { ShareButton } from './ShareButton';
import { ThemeToggle } from './ThemeToggle';
import { LanguagePicker } from './LanguagePicker';
import { setUiLang, type UiLang } from './lang';
import { Wrap } from './Wrap';
import type { ReactNode } from './_types';

export type PageProps = {
    title?: ReactNode;
    subtitle?: ReactNode;
    eyebrow?: ReactNode;
    /**
     * What the browser tab says, when that is not the h1. Overrides
     * `PAGE_DATA.meta.documentTitle`, which is fixed at load: a page whose
     * language can change while it is open needs to say so in the tab too.
     */
    documentTitle?: string;
    /** Extra buttons in the top bar, left of share and theme. */
    actions?: ReactNode;
    share?: boolean;
    theme?: boolean;
    /**
     * The language of the page frame - the labels this component and the ones
     * in the top bar own, not the page's own copy. Defaults to English
     * (2026-09-15); pass one of the thirteen to switch the frame with the
     * content, because a label in one language over an answer in another
     * reads like a bug.
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
    // because <ShareButton> is also used outside any <Page>.
    setUiLang(props.lang);
    const meta = PAGE.meta || {};
    const title = props.title != null ? props.title : meta.title;
    const subtitle = props.subtitle != null ? props.subtitle : meta.subtitle;
    // The tab title is allowed to differ from the h1: a page can be branded in
    // the heading and still say what it is in the tab and in a search result.
    // The `documentTitle` prop wins, then `meta.documentTitle`, then the h1.
    const docTitle = props.documentTitle
        || meta.documentTitle
        || (typeof title === 'string' ? title : '');
    useEffect(() => { if (docTitle) document.title = docTitle; }, [docTitle]);

    return (
        <div className="ui-shell">
            <div className="ui-topbar">
                {props.actions}
                {props.share === false ? null : <ShareButton title={typeof title === 'string' ? title : undefined} />}
                {props.theme === false ? null : <ThemeToggle />}
                {/* Right of the theme toggle, on every page - a label when the
                    page has one language, a picker when it has several. */}
                <LanguagePicker
                    value={props.lang}
                    languages={props.languages || (props.lang ? [props.lang] : ['en'])}
                    onChange={props.onLangChange}
                />
            </div>

            <Wrap width={props.width}>
                <PageHeader title={title} subtitle={subtitle} eyebrow={props.eyebrow} />
            </Wrap>

            <main className="ui-main">
                <Wrap width={props.width}>{props.children}</Wrap>
            </main>
        </div>
    );
}

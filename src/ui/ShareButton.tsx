/**
 * # ShareButton — „Teilen", top right
 *
 * ## What it does and how it looks
 * A small icon button with the word „Teilen" beside it, in the page's top bar.
 * Pressing it opens `<ShareDialog>`.
 *
 * It is a **deliberate act, never automatic**: the URL is the page's only
 * access control, so nothing here copies or transmits a link on its own. He
 * presses the button, sees what he is about to hand out, and then hands it out.
 *
 * `<Page>` places one; a page does not add its own.
 *
 * ## Core parts
 * - `url` — defaults to the current address, which is the right answer on a
 *   published page.
 * - `title` / `text` — passed through to the native share sheet.
 * - `label` — default „Teilen".
 *
 * ## Examples
 * ```tsx
 * <ShareButton />
 * <ShareButton title="Route Portugal" text="Die geplante Strecke" />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 */

import { useState } from 'react';
import { ShareDialog } from './ShareDialog';
import { uiText } from './lang';

export type ShareButtonProps = {
    url?: string;
    title?: string;
    text?: string;
    label?: string;
};

export function ShareButton({ url, title, text, label }: ShareButtonProps) {
    const [open, setOpen] = useState(false);
    const l = label || uiText().share;
    const href = url || (typeof location !== 'undefined' ? location.href : '');

    return (
        <>
            <button
                className="ui-iconbtn ui-share"
                onClick={() => setOpen(true)}
                title={l}
                aria-label={l}
                aria-haspopup="dialog"
            >
                <span aria-hidden="true">⤴</span>
                <span className="ui-small">{l}</span>
            </button>
            <ShareDialog open={open} onClose={() => setOpen(false)}
                url={href} title={title} text={text} />
        </>
    );
}

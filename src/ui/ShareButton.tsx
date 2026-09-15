/**
 * # ShareButton - the share glyph, top right
 *
 * ## What it does and how it looks
 * An icon button in the page's top bar: the share glyph alone on a phone, the
 * glyph and the word past 900px _(2026-09-15, his calls, in that order)_.
 * Pressing it opens `<ShareDialog>`.
 *
 * The word survives as the `title` and the `aria-label`, which is the whole
 * reason an icon-only button is allowed to be one: the tray-and-arrow is the
 * most conventional glyph on the web, and a button whose only content is a
 * glyph is still unusable without words underneath it.
 *
 * It is a **deliberate act, never automatic**: the URL is the page's only
 * access control, so nothing here copies or transmits a link on its own. He
 * presses the button, sees what he is about to hand out, and then hands it out.
 *
 * `<Page>` places one; a page does not add its own.
 *
 * ## Core parts
 * - `url` - defaults to the current address, which is the right answer on a
 *   published page.
 * - `title` / `text` - passed through to the native share sheet.
 * - `label` - the words the glyph stands for. Default „Teilen", and it is the
 *   title and the accessible name rather than visible text.
 *
 * ## Examples
 * ```tsx
 * <ShareButton />
 * <ShareButton title="Route Portugal" text="Die geplante Strecke" />
 * ```
 *
 * ## Changelog
 * - 2026-09-15 The glyph alone, and it is a drawn `<Icon>`: this button had
 *   kept its `⤴` through the sweep that took unicode affordances out of the
 *   rest of the interface.
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 */

import { useState } from 'react';
import { Icon } from './Icon';
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
                className="ui-iconbtn ui-iconbtn-wide"
                onClick={() => setOpen(true)}
                title={l}
                aria-label={l}
                aria-haspopup="dialog"
            >
                <Icon name="share" size={20} />
                <span className="ui-iconbtn-label">{l}</span>
            </button>
            <ShareDialog open={open} onClose={() => setOpen(false)}
                url={href} title={title} text={text} />
        </>
    );
}

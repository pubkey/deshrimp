/**
 * # Flag - twelve flags, drawn rather than typed
 *
 * ## Why this file exists
 * The language picker used the regional-indicator emoji (`🇩🇪`, `🇬🇧`), and on
 * Windows those are **not flags**. Microsoft ships no glyphs for the
 * regional-indicator pairs, so the platform falls back to drawing the two
 * letters they are made of: a German page showed `DE` and an English one `EN`
 * _(2026-09-15, his report)_. There is no font fallback that fixes it and
 * nothing to feature-detect. The fix is to stop asking a font for a picture.
 *
 * ## Where they come from
 * `flags/*.svg`, downloaded from flag-icons rather than drawn here _(his
 * call)_ - see `flags/README.md` for the source, the licence and the one file
 * that is not theirs. They are imported `?raw`, so the markup is inlined into
 * the bundle at build time: no request per flag, and the picker still works on
 * the offline load.
 *
 * ## Colour
 * This is the one place in the product that paints outside the six locked
 * values, and it is not a palette decision: a flag in the system's slate would
 * not be a flag. They are identity marks, like the brand coral, and nothing
 * else on the page may borrow these colours.
 *
 * ## Core parts
 * - `lang` - which one. The set is the twelve `UiLang` values, no more.
 * - Always `aria-hidden`: the control around it carries the language's name,
 *   and a flag is a poor name for a language in any case.
 *
 * ## Changelog
 * - 2026-09-15 Own file, because the emoji do not render on Windows.
 */

import type { CSSProperties } from 'react';
import type { UiLang } from './lang';

import de from './flags/de.svg?raw';
import en from './flags/en.svg?raw';
import es from './flags/es.svg?raw';
import fr from './flags/fr.svg?raw';
import it from './flags/it.svg?raw';
import ja from './flags/ja.svg?raw';
import nl from './flags/nl.svg?raw';
import pl from './flags/pl.svg?raw';
import pt from './flags/pt.svg?raw';
import ru from './flags/ru.svg?raw';
import tr from './flags/tr.svg?raw';
import zh from './flags/zh.svg?raw';

const FLAGS: Record<UiLang, string> = {
    de, en, es, fr, it, ja, nl, pl, pt, ru, tr, zh,
};

export type FlagProps = {
    lang: UiLang;
    className?: string;
    style?: CSSProperties;
};

/**
 * The markup goes in with `dangerouslySetInnerHTML`, which is safe here and
 * only here: these are twelve files in this repository, read at build time and
 * checked in, not anything a page or a person supplies. The alternative is a
 * `<img src>`, and that is a request per flag on a page that has to work with
 * the network gone.
 */
export function Flag({ lang, className, style }: FlagProps) {
    return (
        <span
            className={className ? `ui-flag ${className}` : 'ui-flag'}
            style={style}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: FLAGS[lang] || FLAGS.en }}
        />
    );
}

/**
 * # LanguagePicker — which language the page is in, top right
 *
 * ## What it does and how it looks
 * A round control the size of the theme toggle, sitting immediately to its
 * right, showing the current language as its flag: 🇩🇪, 🇬🇧. `<Page>` renders it
 * on every page; a page never places it itself.
 *
 * A flag is not a language — Austrian German is not a different language,
 * English is not British, and Spanish is spoken by far more people outside
 * Spain than in it. It is used here anyway because it is read in a glance at
 * 40 px, which two letters at that size are not. The cost grew when the list
 * went from two languages to twelve on 2026-09-08, so **the flag is only the
 * button**: the menu behind it names every language in its own words
 * („Português", „Русский", „日本語"), and that list is what anyone actually
 * picks from. On the handful of platforms that do not draw regional
 * indicator pairs (Windows, mostly) the browser falls back to the letters
 * themselves — `DE`, `GB` — which is exactly what this control showed before,
 * so nobody ends up with a blank button.
 *
 * **With one language it is a label, not a control** _(so specified 2026-09-08:
 * „By default only show the one language the site is build in. only if the
 * users asks for more languages, make it a selectable thing")_. That is the
 * common case — nearly every page here is German — and a dropdown offering one
 * option is furniture pretending to be a choice. It still shows, because
 * knowing what language a page is in is useful and because the control must not
 * jump into existence somewhere else once a second language is added.
 *
 * **With two or more it becomes a picker**: the same round button, opening a
 * native `<select>` laid over it. Native rather than a custom menu — it gets
 * the keyboard, the mobile wheel and the escape key for free, and there is
 * nothing here worth reimplementing them for.
 *
 * ## Core parts
 * - `value` — the language showing now.
 * - `languages` — what the page offers. One entry (or none) renders the label.
 * - `onChange` — called with the new language. Without it the control stays a
 *   label however many languages are listed: a picker that cannot pick is
 *   worse than no picker.
 * - The page's own strings are the page's business; this only reports and
 *   changes which one is active. `setUiLang` is `<Page>`'s job.
 *
 * ## Examples
 * ```tsx
 * <LanguagePicker value="de" />                          // label: 🇩🇪
 * <LanguagePicker value={lang} languages={['de', 'en']}   // picker
 *     onChange={(l) => save({ lang: l })} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Flags instead of letters, on his request.
 * - 2026-09-08 First version.
 */

import { cx } from './cx';
import { uiLang, type UiLang } from './lang';

export type LanguagePickerProps = {
    value?: UiLang;
    languages?: UiLang[];
    onChange?: (lang: UiLang) => void;
    className?: string;
};

/**
 * What the button shows, and what a screen reader says.
 *
 * `full` is the language in its own name, which is what a language menu should
 * say — a German speaker looking for German should not have to find „German".
 */
const LABEL: Record<UiLang, { flag: string; full: string }> = {
    de: { flag: '🇩🇪', full: 'Deutsch' },
    en: { flag: '🇬🇧', full: 'English' },
    es: { flag: '🇪🇸', full: 'Español' },
    fr: { flag: '🇫🇷', full: 'Français' },
    it: { flag: '🇮🇹', full: 'Italiano' },
    pt: { flag: '🇵🇹', full: 'Português' },
    nl: { flag: '🇳🇱', full: 'Nederlands' },
    pl: { flag: '🇵🇱', full: 'Polski' },
    tr: { flag: '🇹🇷', full: 'Türkçe' },
    ru: { flag: '🇷🇺', full: 'Русский' },
    zh: { flag: '🇨🇳', full: '中文' },
    ja: { flag: '🇯🇵', full: '日本語' },
};

export function LanguagePicker({ value, languages, onChange, className }: LanguagePickerProps) {
    const current: UiLang = value || uiLang();
    const list = (languages || []).filter((l) => LABEL[l]);
    const shown = LABEL[current] || LABEL.de;
    const pickable = list.length > 1 && !!onChange;

    if (!pickable) {
        return (
            <span
                className={cx('ui-iconbtn', 'ui-langtag', className)}
                title={shown.full}
                aria-label={shown.full}
            >
                {shown.flag}
            </span>
        );
    }

    return (
        <span className={cx('ui-iconbtn', 'ui-langpick', className)} title={shown.full}>
            <span aria-hidden="true">{shown.flag}</span>
            <select
                aria-label={shown.full}
                value={current}
                onChange={(e) => onChange!(e.target.value as UiLang)}
            >
                {list.map((l) => (
                    <option key={l} value={l}>{LABEL[l].full}</option>
                ))}
            </select>
        </span>
    );
}

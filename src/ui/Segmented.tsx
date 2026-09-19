/**
 * # Segmented - two or three ways to see the same thing, side by side
 *
 * ## What it does and how it looks
 * An inset track with one button per option and the chosen one raised out of
 * it: the track sits at the inset value with the system's hairline, the picked
 * segment steps back up to the inactive-control slate and takes the white ink,
 * the others stay transparent in the secondary slate. Columns are equal, so
 * „left" and „right" mean something and stay where they are when the words
 * change length.
 *
 * ## Why not two buttons, or a <select>
 * A `<select>` hides the alternative behind a click, which is the wrong trade
 * when there are two of them and both fit. Two plain buttons say what they do
 * but not which one you are in; this says both at once, and it is the shape
 * everyone already reads as „one of these, currently that one".
 *
 * **No accent anywhere in it.** The accent is a budget (`DESIGN.md` §"The 10%
 * rule") and a view switch is not one of the six places it may be spent, so
 * the pressed segment is carried by the value ladder instead: the raised fill
 * and the ink going from slate to white. `<Button active>` would have painted
 * it coral, which is why this is its own control rather than two of those.
 *
 * ## Core parts
 * - `options` - `{ value, label, icon?, description?, title? }`. `title` is the
 *   sentence about what picking it gets you, on hover. It is deliberately *not*
 *   the accessible name - that is the visible word, which is the opposite of
 *   the bargain `<IconButton>` makes, because a segment here is never wordless.
 * - `description` - the same sentence, but on the face of the segment instead
 *   of behind a hover: a second line under the word, 11px and muted. A hover
 *   title is invisible on a phone and invisible to anyone who does not know to
 *   wait over a control, so when the choice needs explaining at all, it needs
 *   explaining where it can be read. Give an option `description` or `title`,
 *   not both - the sentence is the same sentence, and printing it twice makes
 *   a tooltip that only repeats what is already on screen.
 * - `value` + `onChange` - controlled, always. There is no internal state: the
 *   chosen view is something the page already knows.
 * - `label` / `hint` - wraps itself in a `<Field>`, so its label is the same
 *   11px tracked uppercase eyebrow as the one over a `<Select>` beside it.
 *
 * ## Examples
 * ```tsx
 * <Segmented
 *     label="View"
 *     value={view}
 *     onChange={(next) => save(next)}
 *     options={[
 *         {
 *             value: 'zen', label: 'Zen', icon: <Icon name="minimize" />,
 *             description: 'Show the camera and the angles only',
 *         },
 *         {
 *             value: 'dashboard', label: 'Dashboard', icon: <Icon name="grid" />,
 *             description: 'Show the numbers, the history and the settings',
 *         },
 *     ]}
 * />
 * ```
 *
 * ## Changelog
 * - 2026-09-18 `description`, a second line under the word.
 * - 2026-09-16 First version, for the switch between zen and the dashboard.
 */

import { cx } from './cx';
import { Field } from './Field';
import type { Base, ReactNode } from './_types';

export type SegmentedOption = {
    value: string;
    label: ReactNode;
    /** An `<Icon>`, left of the label. Never emoji - see `Icon.tsx`. */
    icon?: ReactNode;
    /**
     * What picking this one gets you, in words, printed under the label. Use
     * this or `title`, never both.
     */
    description?: ReactNode;
    /** The same sentence as `description`, but only on hover. */
    title?: string;
};

export type SegmentedProps = Base & {
    label?: ReactNode;
    hint?: ReactNode;
    /** Which option is current. Controlled - there is no internal state. */
    value: string;
    options: SegmentedOption[];
    onChange?: (value: string) => void;
};

export function Segmented({
    label, hint, value, options, onChange, className, style, id,
}: SegmentedProps) {
    const track = (
        <div className={cx('ui-seg', label || hint ? null : className)} role="group">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    /* Pressed rather than checked: the library says „this control
                       is on" with `aria-pressed` everywhere else, and a group of
                       two where exactly one is always pressed reads the same. */
                    aria-pressed={option.value === value}
                    /* `title` only, never `aria-label`: the segment carries
                       its word, so the word is its accessible name, and an
                       aria-label would replace it with a sentence that does not
                       contain it - which is exactly what „label in name" is
                       about, and it breaks saying „click Zen" out loud. The
                       sentence is the hover explanation, not the name. */
                    title={option.title}
                    onClick={() => onChange?.(option.value)}
                >
                    {/* The word and its glyph are their own row, so a
                        description lands under the word rather than beside it
                        and the two stay centred as a block. With no
                        description the column has one child and measures
                        exactly what a plain segment always did. */}
                    <span className="ui-seg-head">
                        {option.icon ? <span aria-hidden="true">{option.icon}</span> : null}
                        {option.label}
                    </span>
                    {option.description
                        ? <span className="ui-seg-desc">{option.description}</span>
                        : null}
                </button>
            ))}
        </div>
    );

    if (!label && !hint) return track;
    return (
        <Field label={label} hint={hint} className={className} style={style} id={id}>
            {track}
        </Field>
    );
}

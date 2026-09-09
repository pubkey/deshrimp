/**
 * # TextArea — a multi-line field
 *
 * ## What it does and how it looks
 * `<Input>`'s taller sibling: a native `<textarea>` with the same border,
 * radius and focus ring, and the same automatic `<Field>` wrapper. Used for the
 * note under a decision — the place a page lets him write something back.
 *
 * ## Core parts
 * - `rows` — the visible height. Two or three is usually right for a note; a
 *   tall empty box asks for an essay.
 * - `label` / `hint` / `error`, and everything else straight to the DOM.
 *
 * ## Examples
 * ```tsx
 * <TextArea rows={2} placeholder="Was dir dazu einfällt …"
 *   value={decision.note} onInput={(e) => setNote(e.target.value)} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { controlComponent, type ControlExtras } from './_control';

export type TextAreaProps = ControlExtras & Record<string, any>;

export const TextArea = controlComponent<TextAreaProps>('textarea', 'ui-textarea');

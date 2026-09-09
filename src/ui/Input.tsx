/**
 * # Input — a single-line field
 *
 * ## What it does and how it looks
 * A native `<input>` with the sheet's border, radius and focus ring. With a
 * `label`, `hint` or `error` it wraps itself in a `<Field>`; without one it is
 * just the box.
 *
 * ## Core parts
 * - `label` / `hint` / `error` — turn it into a full field.
 * - everything else passes through to the DOM: `value`, `onInput`, `onKeyDown`,
 *   `placeholder`, `type`, `disabled`. There is no prop whitelist to maintain,
 *   which means the platform's features are all available.
 *
 * ## Examples
 * ```tsx
 * <Input label="Neue Notiz" value={draft} placeholder="…"
 *   onInput={(e) => setDraft(e.target.value)}
 *   onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { controlComponent, type ControlExtras } from './_control';

export type InputProps = ControlExtras & Record<string, any>;

export const Input = controlComponent<InputProps>('input', 'ui-input');

/**
 * # Select — pick one from a list
 *
 * ## What it does and how it looks
 * A native `<select>`, styled to match the other controls. Native on purpose:
 * on a phone it opens the system picker, which is faster and more accessible
 * than any custom dropdown, and it works before the JavaScript has settled.
 *
 * ## Core parts
 * - `children` — plain `<option>` elements. No `options` prop: the native
 *   markup already supports groups, disabled entries and everything else.
 * - `label` / `hint` / `error`, as with `<Input>`.
 *
 * ## Examples
 * ```tsx
 * <Select label="Sortieren" value={sort} onChange={(e) => setSort(e.target.value)}>
 *   <option value="name">Name</option>
 *   <option value="price">Preis</option>
 * </Select>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { controlComponent, type ControlExtras } from './_control';

export type SelectProps = ControlExtras & Record<string, any>;

export const Select = controlComponent<SelectProps>('select', 'ui-select');

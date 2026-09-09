/**
 * # Spinner — something is happening, and it will take a moment
 *
 * ## What it does and how it looks
 * A small ring that turns, optionally with a line of text beside it. Sized to
 * sit inline with body text (`sm`), beside a control (default), or centred in
 * an empty panel (`lg`).
 *
 * Use it for a wait the page **cannot put a number on**. When there is a
 * number — bytes of a download, steps of a job — `<Progress>` is the honest
 * component and a spinner is a worse version of it. A spinner says only „not
 * frozen", which is exactly the right thing to say when a browser is compiling
 * WASM or a model is warming up and no percentage exists.
 *
 * ## Core parts
 * - `label` — what is being waited for, in the page's own words. Worth writing:
 *   „Modell wird geladen (17 MB, nur beim ersten Mal)" tells him whether to
 *   wait; a bare ring does not.
 * - `size` — `"sm"` | `"md"` (default) | `"lg"`.
 * - It is `role="status"` with `aria-live="polite"`, so a screen reader
 *   announces the label once rather than reading a spinning div forever.
 * - **Reduced motion is respected**: the ring stops turning and pulses instead,
 *   because a permanently spinning element is a known trigger and the animation
 *   is decoration — the label carries the meaning.
 *
 * ## Examples
 * ```tsx
 * <Spinner label="Modell wird geladen …" />
 * <Spinner size="sm" />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 First version, for the pose model's first load.
 */

import { cx } from './cx';
import type { ReactNode } from './_types';

export type SpinnerProps = {
    label?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export function Spinner({ label, size, className }: SpinnerProps) {
    return (
        <div className={cx('ui-spinner', size, className)} role="status" aria-live="polite">
            <span className="ui-spinner-ring" aria-hidden="true" />
            {label ? <span className="ui-spinner-label">{label}</span> : null}
        </div>
    );
}

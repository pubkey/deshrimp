/**
 * # LoadingOverlay — the page is not ready yet, and nothing else should be
 *
 * ## What it does and how it looks
 * A dimmed, blurred sheet over the whole page with a card in the middle: a
 * spinner, an optional title, and a line saying what is being waited for.
 *
 * Use it only for a wait that genuinely **blocks the page** — a model or a
 * dataset that everything below depends on. For a wait that leaves the rest of
 * the page usable, an inline `<Spinner>` is the honest signal and an overlay is
 * a lie about how stuck things are.
 *
 * It is a native `<dialog>` opened with `showModal()`, which is the entire
 * design decision: the top layer, the inert background and the focus trap come
 * from the browser. **Escape is deliberately blocked** — dismissing the overlay
 * would not cancel the download it is reporting, it would only hide it, and a
 * page that looks ready while it is not is worse than one that says it is busy.
 * That is also why there is no ✕ and no backdrop click, unlike `<Modal>`.
 * The Escape block is a **native** listener: React 18 has no synthetic `cancel`
 * event for `<dialog>`, so a JSX `onCancel` prop is never called at all.
 *
 * ## Core parts
 * - `open` — controlled. Nothing renders while closed.
 * - `title` — optional bold line, for when „loading" alone is too little.
 * - `label` — what is being waited for, in the page's own words. Say the size
 *   and whether it is a one-off if you know: that is what someone needs in
 *   order to decide whether to wait.
 * - `role="status"` + `aria-live="polite"` on the inner spinner, so the wait is
 *   announced once instead of read as a spinning box.
 *
 * ## Examples
 * ```tsx
 * <LoadingOverlay open={loadingModel}
 *     title="Einen Moment"
 *     label="Das Erkennungsmodell wird geladen — 17 MB, nur beim ersten Mal." />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 First version, replacing the inline spinner on `app-haltung`.
 */

import { useEffect, useRef } from 'react';
import { cx } from './cx';
import { Spinner } from './Spinner';
import type { ReactNode } from './_types';

export type LoadingOverlayProps = {
    open?: boolean;
    title?: ReactNode;
    label?: ReactNode;
    className?: string;
};

export function LoadingOverlay({ open, title, label, className }: LoadingOverlayProps) {
    const ref = useRef<HTMLDialogElement>(null);
    // Read inside the listener, which is registered once and must not close
    // over a stale `open`.
    const openRef = useRef(open);
    openRef.current = open;

    /**
     * Block Escape with a **native** listener, not React's `onCancel`.
     *
     * React 18 has no synthetic `cancel` event for `<dialog>`, so a JSX
     * `onCancel` prop is silently never called — the overlay closed on Escape
     * and the test caught it. `addEventListener` is the only thing that works
     * on both React 18 and 19.
     */
    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        const block = (e: Event) => e.preventDefault();
        // Belt and braces: `preventDefault()` on `cancel` is specified to keep
        // the dialog open, and in a real browser it did not — Escape still
        // closed it, which the test caught. So the `close` event re-opens it
        // whenever the page still says it is loading. Whichever of the two the
        // browser honours, the overlay stays up.
        const reopen = () => {
            if (openRef.current && !d.open && d.showModal) d.showModal();
        };
        d.addEventListener('cancel', block);
        d.addEventListener('close', reopen);
        return () => {
            d.removeEventListener('cancel', block);
            d.removeEventListener('close', reopen);
        };
    }, []);

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) {
            if (d.showModal) d.showModal(); else d.setAttribute('open', '');
        } else if (!open && d.open) {
            d.close();
        }
    }, [open]);

    return (
        <dialog ref={ref} className={cx('ui-loadwrap', className)}>
            {open ? (
                <div className="ui-loadcard">
                    {title ? <div className="ui-loadcard-title">{title}</div> : null}
                    <Spinner label={label} />
                </div>
            ) : null}
        </dialog>
    );
}

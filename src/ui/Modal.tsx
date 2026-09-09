/**
 * # Modal — a dialog, from the browser
 *
 * ## What it does and how it looks
 * A centred card over a dimmed backdrop, with a title row and a ✕ on the right.
 * Clicking the backdrop closes it, and so does Esc.
 *
 * It is a **native `<dialog>`**, which is the entire design decision: the focus
 * trap, the Esc key, making the rest of the page inert and the top-layer
 * stacking all come from the browser, instead of from eighty lines of our own
 * that would get one of them subtly wrong.
 *
 * ## Core parts
 * - `open` / `onClose` — controlled. The `close` event is forwarded, so Esc and
 *   the backdrop both go through the same callback as the ✕.
 * - the backdrop test is `e.target === the dialog itself`: the card fills the
 *   element, so any click on content has a child as its target.
 * - children render only while open, so a heavy body costs nothing when closed.
 *
 * ## Examples
 * ```tsx
 * <Modal open={open} onClose={() => setOpen(false)} title="Seite teilen">…</Modal>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 */

import { useEffect, useRef } from 'react';
import { cx } from './cx';
import type { ReactNode } from './_types';
import { uiText } from './lang';

export type ModalProps = {
    open?: boolean;
    onClose?: () => void;
    title?: ReactNode;
    footer?: ReactNode;
    className?: string;
    children?: ReactNode;
};

export function Modal({ open, onClose, title, footer, className, children }: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        const closed = () => { if (onClose) onClose(); };
        d.addEventListener('close', closed);
        return () => d.removeEventListener('close', closed);
    }, [onClose]);

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
        <dialog
            ref={ref}
            className={cx('ui-modal', className)}
            aria-label={typeof title === 'string' ? title : undefined}
            onClick={(e) => { if (e.target === ref.current && onClose) onClose(); }}
        >
            <div className="ui-modal-card">
                <div className="ui-modal-head">
                    <h2 className="ui-h3">{title}</h2>
                    <button className="ui-iconbtn" onClick={onClose} aria-label={uiText().close}>✕</button>
                </div>
                {open ? children : null}
                {footer ? <div className="ui-modal-foot">{footer}</div> : null}
            </div>
        </dialog>
    );
}

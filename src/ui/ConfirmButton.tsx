/**
 * # ConfirmButton — a button that asks first
 *
 * ## What it does and how it looks
 * Renders exactly the button you would have rendered — a `<Button>`, or an
 * `<IconButton>` with `icon`+`label` and no children — and puts a `<Modal>` in
 * front of the action. The modal states what is about to happen and offers two
 * buttons: the danger-coloured confirmation and a plain cancel. Nothing runs
 * until the confirmation is pressed.
 *
 * It exists because a destructive action on a page that stores things locally
 * is **not undoable**: there is no server copy, no trash and no history. One
 * mis-tap on „Verlauf löschen" and weeks of readings are gone. He asked for
 * this on 2026-09-08 („der 'verlauf löschen' button sollte immer nochmal im
 * modal fragen ob das wirklich gewollt ist"), and the rule that follows is
 * general: **every irreversible action in an app-builder page goes through
 * this component, not through a bare button.**
 *
 * `window.confirm` would have been one line, and is the wrong line: it is
 * unstyled, it blocks the whole thread, it is suppressible, and on iOS it can
 * be refused outright — a destructive action guarded by a dialog that may not
 * appear is a destructive action with no guard.
 *
 * ## Core parts
 * - `onConfirm` — runs only after the confirmation. May be async; the modal
 *   closes first so the button never sits half-pressed.
 * - `body` — what will be lost, in the page's own words. Worth writing: „Alle
 *   Messungen von heute" tells him something, „Bist du sicher?" does not.
 * - `confirmLabel` / `cancelLabel` / `title` — default to the page's language
 *   via `lang.ts`.
 * - `icon` + `label` with no children renders an `<IconButton>` (a top-bar
 *   action); children render a normal `<Button>`, danger-styled by default.
 *
 * ## Examples
 * ```tsx
 * <ConfirmButton icon="🗑" label="Verlauf löschen"
 *     body="Alle Messungen dieses Geräts werden gelöscht. Das lässt sich nicht rückgängig machen."
 *     onConfirm={() => readings.find().remove()} />
 *
 * <ConfirmButton body="Die Packliste wird geleert." onConfirm={reset}>Zurücksetzen</ConfirmButton>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 First version, so no page can delete his data on one tap.
 */

import { useState } from 'react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Modal } from './Modal';
import { Row } from './Row';
import { Text } from './Text';
import { uiText } from './lang';
import type { ReactNode } from './_types';

export type ConfirmButtonProps = {
    /** What to do once he has said yes. Awaited, so a slow delete still closes. */
    onConfirm: () => void | Promise<unknown>;
    /** What is about to happen, in the page's own words. */
    body?: ReactNode;
    title?: ReactNode;
    confirmLabel?: ReactNode;
    cancelLabel?: ReactNode;
    /** With `label` and no children: an icon button for the top bar. */
    icon?: ReactNode;
    label?: string;
    /** The trigger's look. The confirmation inside is always `danger`. */
    variant?: 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'lg';
    disabled?: boolean;
    className?: string;
    children?: ReactNode;
};

export function ConfirmButton(props: ConfirmButtonProps) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const t = uiText();

    const run = async () => {
        setBusy(true);
        try {
            await props.onConfirm();
        } finally {
            setBusy(false);
            setOpen(false);
        }
    };

    const trigger = props.children != null
        ? (
            <Button
                icon={props.icon}
                variant={props.variant || 'danger'}
                size={props.size}
                disabled={props.disabled}
                className={props.className}
                onClick={() => setOpen(true)}
            >
                {props.children}
            </Button>
        )
        : (
            <IconButton
                icon={props.icon}
                label={props.label || ''}
                disabled={props.disabled}
                className={props.className}
                onClick={() => setOpen(true)}
            />
        );

    return (
        <>
            {trigger}
            <Modal
                open={open}
                onClose={() => { if (!busy) setOpen(false); }}
                title={props.title != null ? props.title : (props.label || t.confirmTitle)}
                footer={
                    <Row gap={2} justify="end" wrap>
                        <Button variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
                            {props.cancelLabel != null ? props.cancelLabel : t.confirmNo}
                        </Button>
                        <Button variant="danger" disabled={busy} onClick={() => void run()}>
                            {props.confirmLabel != null ? props.confirmLabel : t.confirmYes}
                        </Button>
                    </Row>
                }
            >
                <Text>{props.body != null ? props.body : t.confirmTitle}</Text>
            </Modal>
        </>
    );
}

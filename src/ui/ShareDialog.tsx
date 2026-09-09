/**
 * # ShareDialog — the sheet behind the share button
 *
 * ## What it does and how it looks
 * A modal holding a QR code („Mit der Handykamera scannen"), the full URL in a
 * selectable monospace box, a „Link kopieren" button, the system share sheet
 * where the browser offers one, and one line underneath: **„Der Link ist das
 * Schloss: wer ihn hat, kann die Seite lesen."**
 *
 * That line is the product. A published page's URL *is* its access control
 * (`CLAUDE.md` §9), so the moment of sharing is the moment to say so — once,
 * plainly, where he is about to press the button.
 *
 * Two cases it handles rather than ignores: a page opened from disk (`file:`),
 * where the link points at his own hard drive and cannot be shared at all; and
 * a URL too long to encode, where the QR is dropped but the link still works.
 *
 * ## Core parts
 * - `url` — what gets copied, encoded and shared.
 * - `title` / `text` — passed to the native share sheet.
 * - the copy path falls back to a toast when the clipboard API is missing,
 *   rather than failing silently.
 *
 * ## Examples
 * ```tsx
 * <ShareDialog open={open} onClose={close} url={location.href} title={title} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 */

import { Button } from './Button';
import { Callout } from './Callout';
import { Col } from './Col';
import { Modal } from './Modal';
import { QRCode } from './QRCode';
import { Row } from './Row';
import { toast } from './toast';
import { uiText } from './lang';

export type ShareDialogProps = {
    open?: boolean;
    onClose?: () => void;
    url: string;
    title?: string;
    text?: string;
};

export function ShareDialog({ open, onClose, url, title, text }: ShareDialogProps) {
    const local = /^file:/i.test(url);
    const QR = (globalThis as any).QR;
    const encodable = !!(QR && QR.matrix(url));

    const copy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(
                () => toast(uiText().linkCopied),
                () => toast(uiText().copyFailed),
            );
        } else {
            toast(uiText().copyUnsupported);
        }
    };

    const nativeShare = () => {
        const data: ShareData = { title: title || document.title, url };
        if (text) data.text = text;
        navigator.share(data).catch((err) => {
            if (!err || err.name !== 'AbortError') toast(uiText().shareFailed);
        });
    };

    return (
        <Modal open={open} onClose={onClose} title={uiText().shareTitle}>
            <Col gap={4}>
                {local ? (
                    <Callout tone="warn" icon="⚠">
                        {uiText().shareLocalFile}
                    </Callout>
                ) : encodable ? (
                    <div className="ui-qr-wrap">
                        <QRCode value={url} />
                        <div className="ui-small ui-muted">{uiText().scanWithPhone}</div>
                    </div>
                ) : (
                    <Callout tone="warn" icon="⚠">
                        {uiText().shareTooLongForQr}
                    </Callout>
                )}

                <div className="ui-urlbox" title={url}>{url}</div>

                <Row wrap gap={2}>
                    <Button variant="primary" icon="⧉" onClick={copy}>{uiText().copyLink}</Button>
                    {/* `in`, not a truthiness test: the type says `share` is
                        always defined, but on a desktop browser it is not. */}
                    {typeof navigator !== 'undefined' && 'share' in navigator
                        ? <Button icon="⤴" onClick={nativeShare}>{uiText().shareNative}</Button>
                        : null}
                </Row>

                <div className="ui-small ui-muted">{uiText().shareLinkIsTheLock}</div>
            </Col>
        </Modal>
    );
}

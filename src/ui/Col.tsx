/**
 * # Col — things stacked
 *
 * ## What it does and how it looks
 * A vertical flex stack with one consistent gap between its children. The
 * counterpart to `<Row>`, and the honest way to space a group of blocks —
 * margins on the children themselves collapse, double up and drift apart.
 *
 * ## Core parts
 * - `gap` — `0`–`6` on the `--sN` scale, the only spacing there is.
 *
 * ## Examples
 * ```tsx
 * <Col gap={3}><Text>…</Text><Button>…</Button></Col>
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, GapStep } from './_types';

export type ColProps = Base & { gap?: GapStep };

export function Col({ gap, className, children, style, id }: ColProps) {
    return (
        <div id={id} style={style}
            className={cx('ui-col', gap != null && 'ui-gap-' + gap, className)}>
            {children}
        </div>
    );
}

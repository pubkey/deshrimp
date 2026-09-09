/**
 * # Row — things side by side
 *
 * ## What it does and how it looks
 * A horizontal flex line with a gap from the spacing scale. Used for a title
 * with a badge after it, a price beside a button, an image next to its text.
 *
 * The prop that matters most is `stack`: below 640 px the row becomes a column.
 * A picture beside a paragraph is a row on a laptop and a disaster on a phone,
 * so **every image-beside-text block gets `stack`**.
 *
 * ## Core parts
 * - `gap` — `0`–`6` on the `--sN` scale. Nothing in between exists.
 * - `align` — `"top"` / `"bottom"`; the default is centred.
 * - `justify` — `"between"` / `"end"` / `"center"`.
 * - `wrap` — let items flow onto a second line instead of squeezing.
 * - `stack` — drop to a column below 640 px.
 *
 * ## Examples
 * ```tsx
 * <Row justify="between" align="bottom"><Muted>…</Muted><Button>…</Button></Row>
 * <Row gap={4} stack><Img … /><Col>…</Col></Row>
 * <Row gap={2} wrap>{tags.map((t) => <Tag key={t}>{t}</Tag>)}</Row>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 `align="bottom"` lines up the controls rather than the boxes:
 *   a button next to a <Field> now sits level with the input, not with the
 *   hint underneath it.
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import type { Base, GapStep } from './_types';

export type RowProps = Base & {
    align?: 'top' | 'bottom';
    justify?: 'between' | 'end' | 'center';
    wrap?: boolean;
    /** Drops to a column below 640 px — use it for every image-beside-text block. */
    stack?: boolean;
    gap?: GapStep;
};

export function Row({ align, justify, wrap, stack, gap, className, children, style, id }: RowProps) {
    return (
        <div
            id={id}
            style={style}
            className={cx('ui-row', align, justify, wrap && 'wrap', stack && 'stack',
                gap != null && 'ui-gap-' + gap, className)}
        >
            {children}
        </div>
    );
}

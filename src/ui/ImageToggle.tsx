/**
 * # ImageToggle — the same subject, in more than one state
 *
 * ## What it does and how it looks
 * Two shapes for one job, chosen by `mode`.
 *
 * **Tabs** (default): one large image with small labelled buttons sitting *on*
 * it, top left. Press one and the picture changes. The buttons are on the image
 * rather than under it because the eye is already there when it changes, and
 * because a control below would push the caption around.
 *
 * **Slider** (`mode="slider"`, exactly two images): both pictures stacked with a
 * draggable seam between them — before and after. Draggable with pointer, and
 * with the arrow keys, Home and End for anyone not using one.
 *
 * ## Core parts
 * - `options` — `{ src, label, caption }`. Entries without a `src` are dropped,
 *   so a missing render never becomes a blank tab.
 * - `mode` — `"slider"` needs two options; with fewer it falls back to tabs.
 * - `height` — the stage height. Default 420 px.
 * - `caption` — under the image; an option's own `caption` wins for that one.
 * - `onChange(i, option)` — so a page can follow along.
 *
 * ## Examples
 * ```tsx
 * <ImageToggle options={[
 *   { src: tryOn, label: 'An mir' },
 *   { src: product, label: 'Produktfoto' },
 * ]} height="520px" />
 *
 * <ImageToggle mode="slider" options={[
 *   { src: before, label: 'Jetzt' },
 *   { src: after, label: 'Mit Teppich' },
 * ]} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file; the slider moved to `_Compare.tsx` beside it.
 */

import { useState } from 'react';
import { cx } from './cx';
import { Compare, type CompareOption } from './_Compare';
import { Img } from './Img';
import type { ReactNode } from './_types';

export type ImageToggleOption = CompareOption;

export type ImageToggleProps = {
    options: ImageToggleOption[];
    /** `"slider"` is the before/after seam; it needs exactly two options. */
    mode?: 'tabs' | 'slider';
    height?: string;
    fit?: 'cover' | 'contain';
    initial?: number;
    caption?: ReactNode;
    className?: string;
    onChange?: (i: number, option: ImageToggleOption) => void;
};

export function ImageToggle(props: ImageToggleProps) {
    const opts = (props.options || []).filter((o) => o && o.src);
    const [i, setI] = useState(props.initial || 0);
    if (!opts.length) return null;

    if (props.mode === 'slider' && opts.length >= 2) {
        return <Compare options={opts} height={props.height} caption={props.caption} />;
    }

    const cur = opts[Math.min(i, opts.length - 1)];
    return (
        <div className={cx('ui-toggle-img', props.className)}>
            <div className="ui-toggle-stage" style={{ height: props.height || '420px' }}>
                <Img src={cur.src} alt={cur.label || ''} fit={props.fit} eager />
                <div className="ui-toggle-tabs" role="tablist">
                    {opts.map((o, k) => (
                        <button
                            key={k}
                            type="button"
                            role="tab"
                            aria-selected={k === i}
                            className={cx('ui-toggle-tab', k === i && 'on')}
                            onClick={() => { setI(k); if (props.onChange) props.onChange(k, o); }}
                        >
                            {o.label || `Bild ${k + 1}`}
                        </button>
                    ))}
                </div>
            </div>
            {(cur.caption || props.caption) ? (
                <div className="ui-toggle-caption">{cur.caption || props.caption}</div>
            ) : null}
        </div>
    );
}

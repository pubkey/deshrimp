/**
 * The before/after slider behind `<ImageToggle mode="slider">`.
 *
 * Not a component of its own: it is one of `<ImageToggle>`'s two shapes, chosen
 * by a prop, and a page never reaches for it directly.
 *
 * Two details worth keeping: the drag is tracked in a ref rather than trusting
 * `e.buttons`, because touch and pen do not report buttons the way a mouse
 * does and a pointer that leaves the element mid-drag must keep moving the seam
 * instead of stopping at the edge. And `lostpointercapture` is deliberately not
 * wired up — the browser fires it right after `setPointerCapture` inside the
 * same `pointerdown`, which would end every drag before it started.
 */

import { useRef, useState } from 'react';
import type { ReactNode } from './_types';

export type CompareOption = { src: string; label?: string; caption?: ReactNode };

export type CompareProps = {
    options: CompareOption[];
    height?: string;
    caption?: ReactNode;
};

export function Compare({ options, height, caption }: CompareProps) {
    const a = options[0];
    const b = options[1];
    const [pct, setPct] = useState(50);
    const box = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const seek = (clientX: number) => {
        const el = box.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        setPct(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
    };

    return (
        <div className="ui-toggle-img">
            <div
                ref={box}
                className="ui-compare"
                style={{ height: height || '420px', ['--clip' as any]: (100 - pct) + '%' }}
                onPointerDown={(e) => {
                    dragging.current = true;
                    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* older Safari */ }
                    seek(e.clientX);
                }}
                onPointerMove={(e) => { if (dragging.current) seek(e.clientX); }}
                onPointerUp={() => { dragging.current = false; }}
                onPointerCancel={() => { dragging.current = false; }}
                onDragStart={(e) => e.preventDefault()}
                role="slider"
                tabIndex={0}
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${a.label || 'Vorher'} / ${b.label || 'Nachher'}`}
                onKeyDown={(e) => {
                    const step = e.shiftKey ? 10 : 4;
                    if (e.key === 'ArrowLeft') { e.preventDefault(); setPct(Math.max(0, pct - step)); }
                    if (e.key === 'ArrowRight') { e.preventDefault(); setPct(Math.min(100, pct + step)); }
                    if (e.key === 'Home') setPct(0);
                    if (e.key === 'End') setPct(100);
                }}
            >
                <img src={b.src} alt={b.label || ''} draggable={false} />
                <img className="top" src={a.src} alt={a.label || ''} draggable={false} />
                <div className="ui-compare-handle" style={{ left: pct + '%' }}>
                    <div className="ui-compare-knob" aria-hidden="true">↔</div>
                </div>
                <span className="ui-compare-tag a">{a.label || 'Vorher'}</span>
                <span className="ui-compare-tag b">{b.label || 'Nachher'}</span>
            </div>
            {caption ? <div className="ui-toggle-caption">{caption}</div> : null}
        </div>
    );
}

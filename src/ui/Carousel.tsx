/**
 * # Carousel — one option at a time
 *
 * ## What it does and how it looks
 * A full-width slide track with a previous/next arrow on each side, an optional
 * thumbnail strip underneath, and a hint line explaining how to move. One
 * option per slide — this is how a fashion slideshow shows five pairs of shoes
 * without shrinking any of them to a thumbnail.
 *
 * Three ways to move, because the page is read on a phone as well as a laptop:
 * the arrows, the ← → keys, and a swipe of more than 40 px.
 *
 * ## Core parts
 * - `items` + `render(item, i)` — the slides. `render` returns whatever a slide
 *   is; the carousel has no opinion about it.
 * - `thumb(item, i)` — the strip below. Without it there is no strip, which is
 *   right for slides that have no picture.
 * - `onChange(i)` — so the page can follow along (a player, a map pin).
 * - the keyboard handler ignores keystrokes while an input has focus, so typing
 *   a note never slides the page out from under the writer.
 *
 * ## Examples
 * ```tsx
 * <Carousel
 *   items={slides}
 *   render={(s) => <Slide slide={s} />}
 *   thumb={(s) => <img src={s.image} alt="" />}
 * />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type CarouselProps<T = any> = Base & {
    items: T[];
    render: (item: T, i: number) => ReactNode;
    /** A thumbnail strip below the slides. Omit it and there is none. */
    thumb?: (item: T, i: number) => ReactNode;
    onChange?: (i: number) => void;
    hint?: string;
};

export function Carousel<T>({ items, render, thumb, onChange, hint, className, style, id }: CarouselProps<T>) {
    const list = items || [];
    const n = list.length;
    const [i, setI] = useState(0);
    const touch = useRef<number | null>(null);

    const go = useCallback((x: number) => {
        if (!n) return;
        const next = ((x % n) + n) % n;
        setI(next);
        if (onChange) onChange(next);
    }, [n, onChange]);

    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement | null;
            if (el && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return;
            if (e.key === 'ArrowRight') go(i + 1);
            if (e.key === 'ArrowLeft') go(i - 1);
        };
        document.addEventListener('keydown', key);
        return () => document.removeEventListener('keydown', key);
    }, [i, go]);

    return (
        <div className={cx('ui-carousel-outer', className)} style={style} id={id}>
            <div
                className="ui-carousel"
                onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                    if (touch.current == null) return;
                    const dx = e.changedTouches[0].clientX - touch.current;
                    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
                    touch.current = null;
                }}
            >
                <div className="ui-track" style={{ transform: `translateX(${-i * 100}%)` }}>
                    {list.map((item, k) => (
                        <div key={k} aria-hidden={k !== i}>{render(item, k)}</div>
                    ))}
                </div>
                {n > 1 ? (
                    <>
                        <button className="ui-nav prev" aria-label="Zurück" onClick={() => go(i - 1)}>‹</button>
                        <button className="ui-nav next" aria-label="Weiter" onClick={() => go(i + 1)}>›</button>
                    </>
                ) : null}
            </div>

            {n > 1 && thumb ? (
                <div className="ui-thumbs">
                    {list.map((item, k) => (
                        <button
                            key={k}
                            type="button"
                            className={cx('ui-thumb', k === i && 'on')}
                            onClick={() => go(k)}
                            aria-label={`Slide ${k + 1}`}
                        >
                            {thumb(item, k)}
                        </button>
                    ))}
                </div>
            ) : null}

            {n > 1 ? (
                <p className="ui-hint">
                    {hint || '← → Pfeiltasten, Vorschaubild antippen, oder wischen'}
                </p>
            ) : null}
        </div>
    );
}

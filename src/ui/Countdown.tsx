/**
 * # Countdown — how long until it happens
 *
 * ## What it does and how it looks
 * Four tiles — Tage, Std, Min, Sek — counting down to a moment, retimed once a
 * second. When the moment arrives it renders `done` instead and calls `onDone`
 * exactly once, so the page around it can change state without polling.
 *
 * The seconds are the point. A page that says „in 6 Tagen" is a statement; a
 * page whose last tile moves is a thing that is *happening*, and that is worth
 * the one interval it costs.
 *
 * ## Core parts
 * - `to` — epoch milliseconds, an ISO string, or a `Date`.
 * - `variant` — `"blocks"` (default) are the four tiles; `"inline"` is the same
 *   figure as one quiet line, for a row or a card.
 * - `done` — what replaces the digits once the moment has passed. Without it
 *   the tiles simply stand at zero.
 * - `onDone` — fired once, on the tick that crosses the moment. It does not
 *   fire for a target that was already in the past when the page opened; that
 *   is a state the page can read for itself.
 * - `label` above, `hint` below — „Ankunft", „Ortszeit New York".
 * - the interval is cleared on unmount, and the component re-arms when `to`
 *   changes.
 *
 * ## Examples
 * ```tsx
 * <Countdown to={arrival} label="Ankunft in" hint="8. September, 14:12 Uhr"
 *   done={<Badge tone="ok">Angekommen</Badge>} onDone={() => setArrived(true)} />
 * <Countdown to={arrival} variant="inline" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 First version.
 */

import { useEffect, useRef, useState } from 'react';
import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type CountdownProps = Base & {
    to: number | string | Date;
    label?: ReactNode;
    hint?: ReactNode;
    done?: ReactNode;
    onDone?: () => void;
    variant?: 'blocks' | 'inline';
};

const UNITS: [string, number][] = [
    ['Tage', 86400000],
    ['Std', 3600000],
    ['Min', 60000],
    ['Sek', 1000],
];

function target(to: number | string | Date): number {
    if (to instanceof Date) return to.getTime();
    if (typeof to === 'number') return to;
    const t = Date.parse(to);
    return isNaN(t) ? 0 : t;
}

function split(ms: number): number[] {
    let rest = Math.max(0, ms);
    return UNITS.map(([, size]) => {
        const n = Math.floor(rest / size);
        rest -= n * size;
        return n;
    });
}

export function Countdown(props: CountdownProps) {
    const when = target(props.to);
    const [now, setNow] = useState(() => Date.now());
    // Whether it was already over on the first render: `onDone` is for the
    // moment of crossing, not for a page opened long afterwards.
    const wasOver = useRef(when > 0 && Date.now() >= when);
    const fired = useRef(false);

    useEffect(() => {
        wasOver.current = when > 0 && Date.now() >= when;
        fired.current = false;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [when]);

    const over = when > 0 && now >= when;

    useEffect(() => {
        if (over && !wasOver.current && !fired.current) {
            fired.current = true;
            props.onDone && props.onDone();
        }
    }, [over]);

    if (over && props.done != null) {
        return (
            <div className={cx('ui-countdown', 'is-done', props.className)}
                style={props.style} id={props.id}>
                {props.label ? <div className="ui-countdown-label">{props.label}</div> : null}
                <div className="ui-countdown-body">{props.done}</div>
                {props.hint ? <div className="ui-countdown-hint">{props.hint}</div> : null}
            </div>
        );
    }

    const parts = split(when - now);

    if (props.variant === 'inline') {
        return (
            <span className={cx('ui-countdown-inline', props.className)}
                style={props.style} id={props.id}>
                {parts.map((n, i) => `${n} ${UNITS[i][0]}`).join(' · ')}
            </span>
        );
    }

    return (
        <div className={cx('ui-countdown', props.className)} style={props.style} id={props.id}>
            {props.label ? <div className="ui-countdown-label">{props.label}</div> : null}
            <div className="ui-countdown-cells">
                {parts.map((n, i) => (
                    <div className="ui-countdown-cell" key={UNITS[i][0]}>
                        <span className="ui-countdown-num">
                            {i === 0 ? n : String(n).padStart(2, '0')}
                        </span>
                        <span className="ui-countdown-unit">{UNITS[i][0]}</span>
                    </div>
                ))}
            </div>
            {props.hint ? <div className="ui-countdown-hint">{props.hint}</div> : null}
        </div>
    );
}

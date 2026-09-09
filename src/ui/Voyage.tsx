/**
 * # Voyage — something is on its way
 *
 * ## What it does and how it looks
 * A wide strip with a soft sky, a dashed arc from A to B, and the traveller —
 * a bird, a plane, a parcel — sitting on the arc at exactly the fraction of the
 * way it has come. The part already flown is drawn solid in the accent, the
 * rest stays dashed and faint, so the picture answers „wie weit ist es noch"
 * before a single number is read.
 *
 * It is the picture for anything that moves and takes time: a pigeon over the
 * Atlantic, a parcel, a night train, the leg of a route between two hotels.
 * `<Progress>` is the same fact as a bar; this one is the same fact as a
 * journey, and a journey is what a reader watches.
 *
 * The arc is SVG (it stretches to the box), but every *object* on it — the two
 * end dots, the waypoints, the traveller — is absolutely positioned HTML. That
 * is deliberate: inside a stretched SVG a circle turns into an ellipse and an
 * emoji shrinks to nothing at 390 px, while an HTML dot stays round and the
 * traveller stays the size it was set to.
 *
 * ## Core parts
 * - `progress` — `0`…`1`, clamped. The one number the whole component is about.
 * - `from` / `to` — the place labels under the two ends.
 * - `icon` — what is travelling. Default `✈`; a pigeon page passes `🕊️`.
 * - `paused` — the traveller rests: no bobbing, the strip dims a little. A
 *   night stop, a delay, a parcel sitting in a depot.
 * - `status` — one line under the arc: what is happening right now.
 * - `marks` — waypoints along the way, `{ at: 0…1, label, reached }`. Reached
 *   ones are filled, the others hollow.
 * - `height` — a *minimum*, default `220px`. The strip may grow: a long status
 *   line on a narrow screen makes the box taller rather than landing on the arc.
 * - honours `prefers-reduced-motion`: nothing drifts, nothing bobs.
 *
 * ## Examples
 * ```tsx
 * <Voyage from="Stuttgart" to="New York" progress={0.42} icon="🕊️"
 *   status="unterwegs über dem Nordatlantik" />
 *
 * <Voyage from="Porto" to="Lissabon" progress={1} icon="🚗" height="140px"
 *   marks={[{ at: 0.5, label: 'Coimbra', reached: true }]} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 First version, for the Brieftaube: „wie weit ist sie" is a
 *   journey, not a bar.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type VoyageMark = {
    /** Where along the way, `0`…`1`. */
    at: number;
    label?: ReactNode;
    reached?: boolean;
};

export type VoyageProps = Base & {
    progress?: number;
    from?: ReactNode;
    to?: ReactNode;
    icon?: ReactNode;
    /** The traveller rests: no bobbing, the strip dims. */
    paused?: boolean;
    status?: ReactNode;
    marks?: VoyageMark[];
    height?: string;
    /** Accessible description of the whole picture. */
    label?: string;
};

/* The arc, in viewBox units. The SVG stretches to the box, so these are the
   only coordinates in play — HTML objects are placed at the same fractions. */
const VB_W = 1000;
const VB_H = 300;
const P0: [number, number] = [42, 236];
const P1: [number, number] = [500, 34];
const P2: [number, number] = [958, 236];

/** Point on the quadratic Bézier at `t` — exact, so no `getPointAtLength()`. */
function pointAt(t: number): [number, number] {
    const u = 1 - t;
    return [
        u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0],
        u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1],
    ];
}

function place(t: number) {
    const [x, y] = pointAt(t);
    return { left: (x / VB_W) * 100 + '%', top: (y / VB_H) * 100 + '%' };
}

export function Voyage(props: VoyageProps) {
    const p = Math.max(0, Math.min(1, props.progress || 0));
    const marks = (props.marks || []).filter((m) => m && m.at >= 0 && m.at <= 1);
    const path = `M${P0[0]},${P0[1]} Q${P1[0]},${P1[1]} ${P2[0]},${P2[1]}`;

    return (
        <div className={cx('ui-voyage', props.paused && 'is-paused', props.className)}
            style={{ ...(props.style || {}), minHeight: props.height || '220px' }}
            id={props.id}
            role="img"
            aria-label={props.label || `Fortschritt ${Math.round(p * 100)} %`}
        >
            <svg className="ui-voyage-sky" viewBox={`0 0 ${VB_W} ${VB_H}`}
                preserveAspectRatio="none" aria-hidden="true">
                <path className="ui-voyage-arc" d={path} pathLength={1} />
                <path className="ui-voyage-arc is-done" d={path} pathLength={1}
                    strokeDasharray="1" strokeDashoffset={1 - p} />
            </svg>

            <span className="ui-voyage-cloud c1" aria-hidden="true" />
            <span className="ui-voyage-cloud c2" aria-hidden="true" />
            <span className="ui-voyage-cloud c3" aria-hidden="true" />

            <span className="ui-voyage-dot is-start" style={place(0)} aria-hidden="true" />
            <span className="ui-voyage-dot is-end" style={place(1)} aria-hidden="true" />

            {marks.map((m, i) => (
                <span key={i} className={cx('ui-voyage-mark', m.reached && 'is-reached')}
                    style={place(m.at)} title={typeof m.label === 'string' ? m.label : undefined}
                    aria-hidden="true" />
            ))}

            <span className="ui-voyage-traveller" style={place(p)} aria-hidden="true">
                <span className="ui-voyage-bird">{props.icon != null ? props.icon : '✈'}</span>
            </span>

            <div className="ui-voyage-ends">
                <span className="ui-voyage-place">{props.from}</span>
                <span className="ui-voyage-place is-right">{props.to}</span>
            </div>

            {props.status ? <div className="ui-voyage-status">{props.status}</div> : null}
        </div>
    );
}

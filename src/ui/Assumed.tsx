/**
 * # Assumed — the marker right at the uncertain value
 *
 * ## What it does and how it looks
 * A small underlined chip with a „?" in front of it, sitting inline in the
 * sentence it qualifies: „…passt bei deiner <?angenommenen Schuhweite>". Its
 * tooltip says what was assumed and why. With `to` it becomes a link to the
 * matching entry in the page's `<DataGaps>` block.
 *
 * `PAGE-SPEC.md` requires unverified data to be marked **where it is shown**,
 * not only in a footnote nobody reads. This is that marker.
 *
 * **Not the same as `<Confidence>`.** This one marks a hole in the *repo* —
 * „dazu steht nichts, ich habe etwas eingesetzt". `<Confidence>` marks the
 * standing of something researched — „gefunden, aber nicht nachgeprüft".
 *
 * ## Core parts
 * - `severity` — `missing` · `assumed` (default) · `stale`, sharing
 *   `GAP_SEVERITIES` with `<DataGaps>` so the words match across the page.
 * - `reason` — the tooltip. Say what was assumed instead of the real value.
 * - `to` — the id of a `<DataGaps>` item; makes it a link to `#gap-<id>`.
 *
 * ## Examples
 * ```tsx
 * <Assumed reason="Kein Server, nichts wird übertragen.">auf diesem Gerät</Assumed>
 * <Assumed to="weite" severity="missing">Schuhweite</Assumed>
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import { gapSeverity, type GapSeverity, severityHint, severityLabel } from './DataGaps';
import type { ReactNode } from './_types';

export type AssumedProps = {
    /** Id of a `<DataGaps>` item — makes this a link to it. */
    to?: string;
    reason?: string;
    severity?: GapSeverity;
    className?: string;
    children?: ReactNode;
};

export function Assumed({ to, reason, severity, className, children }: AssumedProps) {
    const sev = gapSeverity(severity);
    const label = children || severityLabel(sev);
    const title = reason || severityHint(sev);
    const cls = cx('ui-assumed', sev, className);

    if (to) {
        return (
            <a className={cls} href={'#gap-' + to} title={title}>
                <span aria-hidden="true">?</span>{label}
            </a>
        );
    }
    return (
        <span className={cls} title={title} tabIndex={0}>
            <span aria-hidden="true">?</span>{label}
        </span>
    );
}

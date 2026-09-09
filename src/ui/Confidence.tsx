/**
 * # Confidence — how sure the page is about one statement
 *
 * ## What it does and how it looks
 * A small outlined pill with a coloured dot: green „geprüft", amber
 * „geschätzt", red „ungeprüft". It sits **next to the statement it qualifies**,
 * not in a footnote at the bottom that nobody reads.
 *
 * Three levels on purpose. „72 % sicher" is a number nobody can act on; „nicht
 * nachgesehen" is.
 *
 * **Not the same as `<Assumed>`.** That one marks a hole in the *repo* — „dazu
 * steht nichts". This one marks the standing of something *researched* — „habe
 * ich gefunden, aber nicht nachgeprüft". A page can need both in one sentence.
 *
 * ## Core parts
 * - `level` — `verified` · `estimated` · `unverified`, or the `high` / `medium`
 *   / `low` spelling `CLAUDE.md` §3 uses for stored facts. Both map to the same
 *   three.
 * - `reason` — the tooltip: why it is only this sure.
 * - `date` — when it was checked, shown after the label.
 * - `CONFIDENCE_LEVELS` — the labels and default hints, exported so a page can
 *   build a legend from the same source.
 *
 * ## Examples
 * ```tsx
 * <Confidence level="verified" date="2026-08-30" />
 * <Confidence level="estimated" reason="Aus dem Vorjahrespreis fortgeschrieben." />
 * <Confidence level="low" />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version; 10 SKILL.md passages ask for „unverified".
 */

import { cx } from './cx';
import { deDate } from './dates';
import type { Base, ReactNode } from './_types';

export const CONFIDENCE_LEVELS = {
    verified: { label: 'geprüft', tone: 'ok', hint: 'Am Original nachgesehen.' },
    estimated: { label: 'geschätzt', tone: 'warn', hint: 'Aus vorhandenen Daten abgeleitet, nicht am Original geprüft.' },
    unverified: { label: 'ungeprüft', tone: 'bad', hint: 'Nicht nachgesehen — kann falsch sein.' },
} as const;

export type ConfidenceLevel =
    | keyof typeof CONFIDENCE_LEVELS
    | 'high' | 'medium' | 'low';

// CLAUDE.md §3 writes confidence as high/medium/low; a page may say either.
const ALIASES: Record<string, keyof typeof CONFIDENCE_LEVELS> = {
    high: 'verified', medium: 'estimated', low: 'unverified',
    ok: 'verified', 'geprüft': 'verified', 'geschätzt': 'estimated',
    'ungeprüft': 'unverified',
};

export function confidenceLevel(v: string | undefined): keyof typeof CONFIDENCE_LEVELS {
    const k = String(v || '').toLowerCase();
    const resolved = (ALIASES[k] || k) as keyof typeof CONFIDENCE_LEVELS;
    return CONFIDENCE_LEVELS[resolved] ? resolved : 'unverified';
}

export type ConfidenceProps = Base & {
    level?: ConfidenceLevel;
    /** Why it is only this sure — the tooltip. */
    reason?: string;
    date?: string;
    /** Overrides the default label. */
    label?: ReactNode;
};

export function Confidence({ level, reason, date, label, className, children }: ConfidenceProps) {
    const lvl = confidenceLevel(level);
    const meta = CONFIDENCE_LEVELS[lvl];
    return (
        <span className={cx('ui-conf', lvl, className)} title={reason || meta.hint} tabIndex={0}>
            <span className="ui-conf-dot" aria-hidden="true" />
            {children || label || meta.label}
            {date ? <span className="ui-conf-date">{deDate(date)}</span> : null}
        </span>
    );
}

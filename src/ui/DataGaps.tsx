/**
 * # DataGaps — what this page had to assume
 *
 * ## What it does and how it looks
 * The last section of every page, headed „Datengrundlage". A row of count
 * badges („2× fehlt · 3× angenommen"), then one block per gap: the severity,
 * what is missing, what was used instead, what wobbles because of it, the
 * question that would fix it, and where the answer belongs in the repo. At the
 * foot, a „Fragen kopieren" button and a warm callout inviting him to answer.
 *
 * Every page here answers a question out of an incomplete repo. This is the
 * section that says which parts rest on knowledge and which on a guess — so a
 * page can be confident about the first without pretending about the second.
 *
 * The heading is a **constant**, not a suggestion: recognisability beats the
 * nicer wording, because he should find this section in the same place on every
 * page without looking for it.
 *
 * ## Core parts
 * - `items` — `{ id, label, severity, assumed, impact, ask, file, field, since }`.
 *   Sorted heaviest first: what is missing outweighs what is merely old.
 * - `severity` — `missing` · `assumed` · `stale`, shared with `<Assumed>` so
 *   the inline marker and the block use the same words.
 * - `ask` — the question. Items that have one feed the „Fragen kopieren"
 *   button, which puts them on the clipboard numbered, ready to paste back
 *   into a chat.
 * - `file` + `field` — „gehört nach `health/nutrition.md` → Gewicht". The
 *   answer has a home, and saying where turns an answer into a repo edit.
 * - `id` — the anchor `#gap-<id>` that `<Assumed to>` links to.
 * - `section={false}` — the bare block, for the reference page.
 *
 * ## Examples
 * ```tsx
 * <DataGaps items={[{
 *   id: 'gewicht', severity: 'stale', label: 'Gewicht',
 *   since: '2026-03', assumed: '84 kg', impact: 'Kalorienziel ±150 kcal',
 *   ask: 'Was wiegst du gerade?', file: 'health/fitness.md', field: 'Gewicht',
 * }]} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-09-08 Fixed labels come from `lang.ts`, so an English page is
 *   English all the way into the frame. German is still the default.
 * - 2026-08-31 Own file; `<Assumed>` moved into its own beside it.
 */

import { Button } from './Button';
import { Callout } from './Callout';
import { Markdown } from './Markdown';
import { Section } from './Section';
import { cx } from './cx';
import { uiText } from './lang';
import { toast } from './toast';
import type { ReactNode } from './_types';

export const GAP_SEVERITIES = {
    missing: { label: 'fehlt', rank: 0, hint: 'Dazu steht nichts im Repo.' },
    assumed: { label: 'angenommen', rank: 1, hint: 'Ich habe eine Annahme eingesetzt.' },
    stale: { label: 'veraltet', rank: 2, hint: 'Gespeichert, aber möglicherweise nicht mehr aktuell.' },
} as const;

export type GapSeverity = keyof typeof GAP_SEVERITIES;

/**
 * The severity words in the page's language.
 *
 * `GAP_SEVERITIES` keeps the ranks (which are what the sort needs) and its
 * German labels, because other code has always read them; these two read
 * `lang.ts` instead and are what anything user-facing should use.
 */
export function severityLabel(sev: GapSeverity): string {
    const t = uiText();
    return sev === 'missing' ? t.severityMissing
        : sev === 'stale' ? t.severityStale
            : t.severityAssumed;
}

export function severityHint(sev: GapSeverity): string {
    const t = uiText();
    return sev === 'missing' ? t.severityMissingHint
        : sev === 'stale' ? t.severityStaleHint
            : t.severityAssumedHint;
}

export function gapSeverity(v: GapSeverity | undefined): GapSeverity {
    return v && GAP_SEVERITIES[v] ? v : 'assumed';
}

/** One heading for every page — a constant, so he finds it without looking. */
/** @deprecated Read `uiText().gapsTitle` — these are always German. */
export const DATA_GAPS_TITLE = 'Datengrundlage';
/**
 * A shift of register: the section describes where the figures come from, it
 * does not address him. The invitation sits further down in the callout — that
 * is the one place where the page speaks to him directly.
 */
export const DATA_GAPS_SUBTITLE =
    'Herkunft und Belastbarkeit der Angaben, auf denen diese Seite beruht.';

export type Gap = {
    id?: string;
    label?: ReactNode;
    severity?: GapSeverity;
    /** What was used instead of the real value. */
    assumed?: ReactNode;
    /** What is less reliable because of it. */
    impact?: ReactNode;
    /** The question that would close the gap. */
    ask?: string;
    /** Where the answer belongs: `health/fitness.md`. */
    file?: string;
    field?: string;
    /** „seit 2026-03" for a stale value. */
    since?: ReactNode;
};

function GapItem({ item }: { item: Gap }) {
    const sev = gapSeverity(item.severity);
    const where = item.file ? item.file + (item.field ? ' → ' + item.field : '') : null;

    return (
        <div className={cx('ui-gaps-item', sev)} id={item.id ? 'gap-' + item.id : undefined}>
            <div className="ui-gaps-top">
                <span className="ui-gaps-sev">{severityLabel(sev)}</span>
                <span className="ui-gaps-label">{item.label}</span>
                {item.since ? <span className="ui-gaps-where">seit {item.since}</span> : null}
            </div>
            {item.assumed ? (
                <div className="ui-gaps-line">
                    <span className="k">{uiText().assumedInstead}</span>{item.assumed}
                </div>
            ) : null}
            {item.impact ? (
                <div className="ui-gaps-line">
                    <span className="k">{uiText().wobbles}</span>{item.impact}
                </div>
            ) : null}
            {item.ask ? <div className="ui-gaps-ask">{item.ask}</div> : null}
            {where ? <div className="ui-gaps-where">gehört nach {where}</div> : null}
        </div>
    );
}

export type DataGapsProps = {
    items: Gap[];
    intro?: string;
    ask?: string | false;
    askTitle?: string;
    copy?: boolean;
    title?: ReactNode;
    subtitle?: ReactNode;
    section?: boolean;
    id?: string;
    className?: string;
};

export function DataGaps(props: DataGapsProps) {
    const items = (props.items || []).filter(Boolean);
    if (!items.length) return null;

    // Heaviest first: what is missing weighs more than what is merely old.
    const sorted = items.slice().sort(
        (a, b) => GAP_SEVERITIES[gapSeverity(a.severity)].rank
            - GAP_SEVERITIES[gapSeverity(b.severity)].rank,
    );

    const counts: Partial<Record<GapSeverity, number>> = {};
    for (const it of sorted) {
        const k = gapSeverity(it.severity);
        counts[k] = (counts[k] || 0) + 1;
    }

    const questions = sorted.filter((it) => it.ask);

    const copyQuestions = () => {
        const text = questions.map((it, i) => `${i + 1}. ${it.ask}`).join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(
                () => toast(uiText().gapsCopied),
                () => toast(uiText().gapsCopyFailed),
            );
        } else {
            toast(uiText().gapsCopyFailed);
        }
    };

    const block = (
        <div className={cx('ui-gaps', props.className)}>
            <div className="ui-gaps-head">
                <div className="ui-gaps-counts">
                    {(['missing', 'assumed', 'stale'] as GapSeverity[]).map((k) => (
                        counts[k] ? (
                            <span key={k}
                                className={cx('ui-badge',
                                    k === 'missing' ? 'bad' : k === 'assumed' ? 'warn' : 'quiet')}>
                                {counts[k]}× {severityLabel(k)}
                            </span>
                        ) : null
                    ))}
                </div>
                {questions.length > 0 && props.copy !== false ? (
                    <Button size="sm" variant="ghost" onClick={copyQuestions}>
                        {uiText().copyQuestions}
                    </Button>
                ) : null}
            </div>

            {props.intro ? <Markdown text={props.intro} /> : null}

            <div className="ui-gaps-list">
                {sorted.map((it, i) => <GapItem key={it.id || i} item={it} />)}
            </div>

            {props.ask !== false ? (
                <Callout tone="warn" icon="✎"
                    title={props.askTitle || uiText().gapsAskTitle}>
                    {props.ask || uiText().gapsAskText}
                </Callout>
            ) : null}
        </div>
    );

    if (props.section === false) return block;
    return (
        <Section id={props.id || 'datengrundlage'}
            title={props.title || DATA_GAPS_TITLE}
            subtitle={props.subtitle || DATA_GAPS_SUBTITLE}>
            {block}
        </Section>
    );
}

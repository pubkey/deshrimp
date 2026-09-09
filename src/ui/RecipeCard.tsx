/**
 * # RecipeCard — a dish, with its picture
 *
 * ## What it does and how it looks
 * A panel split in two: the photo on the left with the cooking time in a corner
 * badge, and on the right the name, the portions/kcal/protein line, tags, a
 * note, and then two columns — „Zutaten" as a list and „So geht's" as a
 * numbered one.
 *
 * **The picture is mandatory, and its absence is drawn.** With no `image` the
 * card renders a visible placeholder reading „Bild fehlt — jedes Rezept braucht
 * eins", so the gap is noticed while the page is being built rather than by him
 * afterwards. A recipe without a picture is an ingredients list _(his rule,
 * 2026-08-21)_.
 *
 * ## Core parts
 * - `image` + `imageAlt` — 3:2. `eager` for the first card on the page.
 * - `name`, `portions`, `kcal`, `protein` — the meta line, joined with middots
 *   and with German thousands separators.
 * - `ingredients` / `steps` — plain string arrays; the two columns.
 * - `time` — the badge on the photo.
 * - `note` — Markdown-lite, above the columns. What to prep ahead, what to swap.
 * - `id` — becomes the anchor `#rezept-<id>`, so the shopping list can link to
 *   the recipe a line belongs to.
 *
 * ## Examples
 * ```tsx
 * <RecipeCard id="dal" name="Rotes Linsen-Dal" image={img} time="25 min"
 *   portions="2 Portionen" kcal={640} protein={31}
 *   ingredients={['200 g rote Linsen', '1 Dose Tomaten']}
 *   steps={['Zwiebeln anbraten.', 'Linsen und Tomaten dazu, 20 min köcheln.']} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 */

import { cx } from './cx';
import { Img } from './Img';
import { Markdown } from './Markdown';
import { Tag } from './Tag';
import type { ReactNode } from './_types';
import { uiText } from './lang';

/** 3300 → „3.300". Numbers on these pages are set German. */
function fmtNum(n: number | string): string {
    return typeof n === 'number' ? n.toLocaleString('de-DE') : String(n);
}

export type RecipeCardProps = {
    id?: string;
    name?: ReactNode;
    /** Mandatory in spirit: without it the card draws a visible gap. */
    image?: string | null;
    imageAlt?: string;
    eager?: boolean;
    time?: ReactNode;
    portions?: ReactNode;
    kcal?: number;
    protein?: number | string;
    tags?: ReactNode[];
    note?: string;
    ingredients?: ReactNode[];
    steps?: ReactNode[];
    className?: string;
    children?: ReactNode;
};

export function RecipeCard(props: RecipeCardProps) {
    const ing = props.ingredients || [];
    const steps = props.steps || [];
    const meta = [
        props.portions,
        props.kcal != null && fmtNum(props.kcal) + ' kcal',
        props.protein != null && props.protein + ' g Protein',
    ].filter(Boolean);

    return (
        <div className={cx('ui-panel', 'ui-recipe', props.className)}
            id={props.id ? 'rezept-' + props.id : undefined}>
            <div className="ui-recipe-media">
                {props.image ? (
                    <Img src={props.image}
                        alt={props.imageAlt || (typeof props.name === 'string' ? props.name : '')}
                        ratio="3/2" eager={props.eager} />
                ) : (
                    <div className="ui-recipe-noimg">
                        <span aria-hidden="true">▨</span>
                        <span>{uiText().recipeImageMissing}</span>
                    </div>
                )}
                {props.time ? <span className="ui-recipe-time">{props.time}</span> : null}
            </div>

            <div className="ui-recipe-body">
                <div>
                    <h3 className="ui-h4">{props.name}</h3>
                    {meta.length ? (
                        <div className="ui-small ui-muted">
                            {meta.map((m, i) => <span key={i}>{i ? ' · ' : ''}{m}</span>)}
                        </div>
                    ) : null}
                </div>

                {props.tags && props.tags.length ? (
                    <div className="ui-row wrap ui-gap-2">
                        {props.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
                    </div>
                ) : null}

                {props.note ? <Markdown text={props.note} /> : null}

                <div className="ui-recipe-cols">
                    <div className="ing">
                        <h4 className="ui-h5">{uiText().ingredients}</h4>
                        <ul>{ing.map((z, i) => <li key={i}>{z}</li>)}</ul>
                    </div>
                    <div className="steps">
                        <h4 className="ui-h5">{uiText().method}</h4>
                        <ol>{steps.map((z, i) => <li key={i}>{z}</li>)}</ol>
                    </div>
                </div>

                {props.children}
            </div>
        </div>
    );
}

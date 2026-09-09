/**
 * # PlaceCard — a place on the map
 *
 * ## What it does and how it looks
 * A `<Listing>` for a restaurant, a sight, a viewpoint: title, category, rating
 * and address, a photo, tags, and on the right how far it is plus an „In Maps
 * öffnen" button.
 *
 * The Maps link **always resolves**, because it is built by `mapsUrl()`:
 * coordinates win over a name, and a stored `url` wins over both. A search link
 * built from a name alone lands on the wrong „Café Central" often enough to
 * matter when he is standing on the street.
 *
 * ## Core parts
 * - `lat` / `lon` / `query` / `address` / `url` — whatever the place has; the
 *   link takes the best of them.
 * - `distance` + `duration` + `detour` — the right column. `detour` is what a
 *   stop actually costs on a route, which is the number that decides.
 * - `hours` — a plain string here. For hours that answer „is it open now", use
 *   `<Hours>` in the body.
 * - `badge`, `tags`, `note`, `recommended`.
 *
 * ## Examples
 * ```tsx
 * <PlaceCard title="Tasca do Zé" category="Restaurant" rating={4.6}
 *   lat={41.14} lon={-8.61} distance={1.2} detour="10 min"
 *   tags={['günstig', 'kein Englisch']} />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 */

import { Badge } from './Badge';
import { Button } from './Button';
import { Distance } from './Distance';
import { Listing, titleLink } from './Listing';
import { Row } from './Row';
import { mapsUrl } from './links';
import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export type PlaceCardProps = Base & {
    title?: ReactNode;
    image?: string | null;
    lat?: number;
    lon?: number;
    url?: string;
    query?: string;
    address?: ReactNode;
    category?: ReactNode;
    rating?: number | string;
    hours?: ReactNode;
    distance?: number;
    duration?: ReactNode;
    /** What the stop costs on a route — usually the deciding number. */
    detour?: ReactNode;
    badge?: ReactNode;
    tags?: ReactNode[];
    desc?: ReactNode;
    note?: ReactNode;
    recommended?: boolean;
};

export function PlaceCard(props: PlaceCardProps) {
    const url = mapsUrl({
        lat: props.lat, lon: props.lon, url: props.url, query: props.query,
        address: typeof props.address === 'string' ? props.address : undefined,
        title: typeof props.title === 'string' ? props.title : undefined,
    });
    return (
        <Listing
            image={props.image}
            alt={typeof props.title === 'string' ? props.title : ''}
            recommended={props.recommended}
            className={props.className}
            side={
                <div>
                    {(props.distance != null || props.duration) ? (
                        <div className="ui-listing-price">
                            <Distance value={props.distance} duration={props.duration} icon="→" />
                        </div>
                    ) : null}
                    {props.detour ? <div className="ui-listing-per">Umweg {props.detour}</div> : null}
                    {url ? (
                        <div style={{ marginTop: 'var(--s2)' }}>
                            <Button size="sm" href={url}>{uiText().openInMaps}</Button>
                        </div>
                    ) : null}
                </div>
            }
        >
            <Row justify="between" wrap gap={2}>
                <h3 className="ui-listing-title">{titleLink(props.title, url)}</h3>
                {props.badge ? <Badge>{props.badge}</Badge> : null}
            </Row>
            <div className="ui-listing-meta">
                {props.category ? <span>{props.category}</span> : null}
                {props.rating != null ? (
                    <span className="ui-stars">★ {String(props.rating).replace('.', ',')}</span>
                ) : null}
                {props.hours ? <span>{props.hours}</span> : null}
                {props.address ? <span>{props.address}</span> : null}
            </div>
            {props.desc ? <p className="ui-listing-desc">{props.desc}</p> : null}
            {props.tags && props.tags.length ? (
                <div className="ui-listing-facilities">
                    {props.tags.map((t, i) => <span key={i}>{t}</span>)}
                </div>
            ) : null}
            {props.note ? <div className="ui-listing-note">{props.note}</div> : null}
            {props.children}
        </Listing>
    );
}

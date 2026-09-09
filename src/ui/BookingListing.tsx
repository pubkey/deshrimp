/**
 * # BookingListing — a hotel, in Booking's own reading order
 *
 * ## What it does and how it looks
 * A `<Listing>` filled in the order the eye already knows from Booking.com:
 * photo, name, stars, type and location with a distance, the review score, the
 * facility chips, and on the right the price for the stay with a „Auf Booking
 * ansehen" button.
 *
 * Matching that order is the point. He compares these against the site he
 * searched on, and a card that reshuffles the same facts costs him a second
 * every time to re-find the price.
 *
 * ## Core parts
 * - `name` + `url` — the title links out when there is a URL.
 * - `stars` / `score` + `reviews` — what it is, and what guests said.
 * - `price` + `nights` — the right column says „3 Nächte" or „pro Nacht", so a
 *   total is never mistaken for a nightly rate.
 * - `facilities` — the chips: Parkplatz, Frühstück, Klimaanlage.
 * - `recommended` — gold border plus a „Top-Pick" badge. One per list.
 * - `distance` + `distanceLabel` — „850 m vom Zentrum".
 *
 * ## Examples
 * ```tsx
 * <BookingListing
 *   name="Hotel Marisol" url={h.url} image={h.photo}
 *   stars={4} score={8.6} scoreLabel="Fabelhaft" reviews={1284}
 *   location="Porto, Portugal" distance={0.85} distanceLabel="vom Zentrum"
 *   price="€312" nights={3} facilities={['Parkplatz', 'Frühstück']}
 *   recommended
 * />
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
import { Score } from './Score';
import { Stars } from './Stars';
import type { Base, ReactNode } from './_types';
import { uiText } from './lang';

export type BookingListingProps = Base & {
    name?: ReactNode;
    url?: string;
    image?: string | null;
    stars?: number;
    type?: ReactNode;
    location?: ReactNode;
    distance?: number;
    distanceLabel?: ReactNode;
    score?: number | string;
    scoreLabel?: ReactNode;
    /** A number, or an already formatted string. */
    reviews?: number | string;
    price?: ReactNode;
    /** Number of nights the price covers. Without it the label says „pro Nacht". */
    nights?: number;
    priceNote?: string;
    facilities?: ReactNode[];
    desc?: ReactNode;
    note?: ReactNode;
    recommended?: boolean;
};

export function BookingListing(props: BookingListingProps) {
    const { nights } = props;
    return (
        <Listing
            image={props.image}
            alt={typeof props.name === 'string' ? props.name : ''}
            recommended={props.recommended}
            className={props.className}
            side={
                <>
                    {props.score != null ? (
                        <Score score={props.score} label={props.scoreLabel} count={props.reviews} />
                    ) : null}
                    <div>
                        {props.price ? <div className="ui-listing-price">{props.price}</div> : null}
                        {props.price ? (
                            <div className="ui-listing-per">
                                {nights ? uiText().nights(nights) : uiText().perNight}
                                {props.priceNote ? ' · ' + props.priceNote : ''}
                            </div>
                        ) : null}
                        {props.url ? (
                            <div style={{ marginTop: 'var(--s2)' }}>
                                <Button size="sm" variant="primary" href={props.url}>
                                    Auf Booking ansehen
                                </Button>
                            </div>
                        ) : null}
                    </div>
                </>
            }
        >
            <Row justify="between" wrap gap={2}>
                <h3 className="ui-listing-title">{titleLink(props.name, props.url)}</h3>
                {props.recommended ? <Badge>{uiText().topPick}</Badge> : null}
            </Row>
            <div className="ui-listing-meta">
                <Stars count={props.stars} />
                {props.type ? <span>{props.type}</span> : null}
                {props.location ? <span>{props.location}</span> : null}
                {(props.distance != null || props.distanceLabel) ? (
                    <Distance value={props.distance} of={props.distanceLabel} />
                ) : null}
            </div>
            {props.desc ? <p className="ui-listing-desc">{props.desc}</p> : null}
            {props.facilities && props.facilities.length ? (
                <div className="ui-listing-facilities">
                    {props.facilities.map((f, i) => <span key={i}>{f}</span>)}
                </div>
            ) : null}
            {props.note ? <div className="ui-listing-note">{props.note}</div> : null}
            {props.children}
        </Listing>
    );
}

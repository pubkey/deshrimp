/**
 * # YouTubeEmbed — a clip for what is not on Spotify
 *
 * ## What it does and how it looks
 * A 16:9 embedded player. `youtube-nocookie.com` and lazy-loaded, so nothing is
 * requested until the reader scrolls to it and no cookie is set for merely
 * having the page open.
 *
 * ## Core parts
 * - `videoId` — the YouTube id. Nothing renders without one.
 * - `title` — the iframe's accessible name. Say which track it is.
 * - `autoPlay` — on by default, matching the Spotify player: a row he pressed
 *   should play. `false` for an embed further down a page.
 * - the URL carries `rel=0&modestbranding=1`, so the end screen does not offer
 *   somebody else's video.
 *
 * ## Examples
 * ```tsx
 * <YouTubeEmbed videoId={track.youtube} title={`${track.artist} – ${track.name}`} />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version, for tracks Spotify does not have.
 */

import { cx } from './cx';
import type { CSSProperties } from './_types';

export type YouTubeEmbedProps = {
    videoId?: string | null;
    title?: string;
    autoPlay?: boolean;
    className?: string;
    style?: CSSProperties;
};

export function YouTubeEmbed({ videoId, title, autoPlay, className, style }: YouTubeEmbedProps) {
    if (!videoId) return null;
    const src = `https://www.youtube-nocookie.com/embed/${videoId}`
        + '?rel=0&modestbranding=1' + (autoPlay === false ? '' : '&autoplay=1');
    return (
        <div className={cx('ui-youtube', className)} style={style}>
            <iframe
                src={src}
                title={title || 'YouTube'}
                loading="lazy"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
            />
        </div>
    );
}

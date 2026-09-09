/**
 * # SpotifyPlayer — one player, for whichever track is selected
 *
 * ## What it does and how it looks
 * Spotify's own embed, 152 px tall, sitting wherever the page puts it — usually
 * pinned under a list of tracks. Which track it holds is **page state**: a
 * listening page is a list of rows plus one player, not thirty iframes.
 *
 * It uses Spotify's IFrame API when that loads, which is what makes the *next*
 * track start playing rather than merely appearing. Without it (offline,
 * blocked, still loading) the `src` is swapped instead, which works but needs a
 * click. While the API is still being waited on there is a „Player lädt …"
 * placeholder rather than an empty box: the wait is bounded at 1.2 s, because a
 * blocked script otherwise leaves a hole on the page forever.
 *
 * This is one of the two components that reach the network (the other is
 * `<GeoMap>`'s tiles), and for the same kind of reason: a page about music that
 * cannot play the music is not an answer to the question.
 *
 * ## Core parts
 * - `trackId` — the Spotify track id. Nothing renders without one.
 * - `autoPlay` — on by default; `play()` is retried once after 400 ms because a
 *   call right after `loadUri` can land before the track is ready.
 * - `height` — default `"152px"`, Spotify's compact player.
 *
 * ## Examples
 * ```tsx
 * <SpotifyPlayer trackId={current} />
 * <SpotifyPlayer trackId={id} autoPlay={false} height="352px" />
 * ```
 *
 * ## Changelog
 * - 2026-09-08 Its fixed words come from `lang.ts`, so they follow the page's
 *   language. German is still the default.
 * - 2026-08-31 Own file.
 * - 2026-08-30 First version; the 1.2 s bound and the placeholder came from
 *   watching it show an empty box for four seconds with the script blocked.
 */

import { useEffect, useRef } from 'react';
import { cx } from './cx';
import type { CSSProperties } from './_types';
import { uiText } from './lang';

const SPOTIFY_API = 'https://open.spotify.com/embed/iframe-api/v1';
let apiPromise: Promise<any> | null = null;

function loadSpotifyApi(): Promise<any> {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve) => {
        const g = globalThis as any;
        g.onSpotifyIframeApiReady = (api: any) => resolve(api);
        const s = document.createElement('script');
        s.src = SPOTIFY_API;
        s.async = true;
        s.onerror = () => resolve(null);
        document.head.appendChild(s);
        // Bounded: a blocked script would otherwise never resolve, and the page
        // would sit on a placeholder forever.
        setTimeout(() => resolve(g.SpotifyIframeApi || null), 1200);
    });
    return apiPromise;
}

export type SpotifyPlayerProps = {
    trackId?: string | null;
    autoPlay?: boolean;
    height?: string;
    className?: string;
    style?: CSSProperties;
};

export function SpotifyPlayer({ trackId, autoPlay, height, className, style }: SpotifyPlayerProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const ctrlRef = useRef<any>(null);

    useEffect(() => {
        if (!trackId || !hostRef.current) return;
        let cancelled = false;

        loadSpotifyApi().then((api) => {
            if (cancelled || !hostRef.current) return;

            if (!api) {
                // No API: a plain iframe still shows the track, it just needs a
                // click to start.
                hostRef.current.innerHTML = '';
                const frame = document.createElement('iframe');
                frame.src = 'https://open.spotify.com/embed/track/' + trackId
                    + '?utm_source=generator';
                frame.allow = 'encrypted-media; autoplay; clipboard-write; fullscreen; '
                    + 'picture-in-picture';
                frame.loading = 'lazy';
                frame.style.cssText = 'width:100%;height:100%;border:0;display:block';
                hostRef.current.appendChild(frame);
                return;
            }

            if (ctrlRef.current) {
                ctrlRef.current.loadUri('spotify:track:' + trackId);
                if (autoPlay !== false) {
                    const kick = () => { try { ctrlRef.current.play(); } catch { /* not ready yet */ } };
                    kick();
                    setTimeout(kick, 400);
                }
                return;
            }

            hostRef.current.innerHTML = '';
            const mountPoint = document.createElement('div');
            hostRef.current.appendChild(mountPoint);
            api.createController(
                mountPoint,
                { uri: 'spotify:track:' + trackId, width: '100%', height: '100%' },
                (controller: any) => { if (!cancelled) ctrlRef.current = controller; },
            );
        });

        return () => { cancelled = true; };
    }, [trackId]);

    if (!trackId) return null;

    // The placeholder lives *inside* the host, so whatever the effect puts
    // there replaces it — and the bar is never an empty rectangle meanwhile.
    return (
        <div
            ref={hostRef}
            className={cx('ui-spotify', className)}
            style={{ height: height || '152px', ...style }}
        >
            <div className="ui-spotify-wait">{uiText().playerLoading}</div>
        </div>
    );
}

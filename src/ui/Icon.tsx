/**
 * # Icon - the only glyphs in the system
 *
 * ## What it does and how it looks
 * A 24×24 stroked outline at `stroke-width: 1.5`, painted in `currentColor`, so
 * it takes the ink of whatever it sits in and needs no colour of its own. Two
 * sizes: 16px inside a line of text or a button, 20px standing alone.
 *
 * ## Why it exists
 * The design system is deliberately near-iconless - status is carried by 6px
 * dots, uppercase labels, borders and numbers - and it bans two things
 * outright: emoji as an icon, and unicode symbols (✓ ✕ ▲) as UI affordances.
 * A glyph borrowed from the text stream is at the mercy of the platform's font,
 * renders in full colour on a phone and in outline on a desktop, and cannot be
 * given a stroke weight. This file is what replaced them.
 *
 * **The geometry is Lucide's**, at the weight the system asks for. That is a
 * substitution, not a brand decision: no icon set was supplied with the design
 * system, and Lucide's hairline geometric stroke is the closest match to the
 * hairline-border aesthetic. Flag it if it ships.
 *
 * The paths are inlined rather than pulled from the CDN the design system
 * suggests. This page installs and has to keep working with the network gone,
 * and an icon set that arrives over the wire is an icon set that is missing on
 * the offline load - the one where the user is looking at an alarm.
 *
 * ## Core parts
 * - `name` - which glyph. The set is closed on purpose: adding one is a design
 *   decision, so it happens here rather than inline at a call site.
 * - `size` - 16 (default) or 20.
 * - Always `aria-hidden`. An icon here never carries meaning on its own; the
 *   button it sits in has the words, or a `label`.
 *
 * ## Examples
 * ```tsx
 * <Button variant="primary" icon={<Icon name="play" />}>Start</Button>
 * <IconButton icon={<Icon name="sun" size={20} />} label="Light theme" />
 * ```
 *
 * ## Changelog
 * - 2026-09-15 Own file, and the end of emoji in the interface.
 * - 2026-09-15 `minus` and `plus`, for the slider's stepper. Drawn rather than
 *   the characters, for the reason at the top of this file: `+` and `-` out of
 *   the text stream come at whatever weight the platform's font has, which next
 *   to a 1.5 stroke is visibly wrong.
 */

import type { CSSProperties } from 'react';

/* Each entry is the inside of a 24×24 `<svg>`: no fill, stroke inherited from
   the wrapper, round caps and joins. Kept as data so the component below is the
   only place that knows how to draw one. */
const PATHS = {
    play: <polygon points="6 3 20 12 6 21 6 3" />,
    stop: <rect x="4" y="4" width="16" height="16" rx="2" />,
    refresh: (
        <>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </>
    ),
    volume: (
        <>
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
    ),
    lock: (
        <>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
    ),
    trash: (
        <>
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    'check-circle': (
        <>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </>
    ),
    alert: (
        <>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </>
    ),
    eye: (
        <>
            <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </>
    ),
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    sync: (
        <>
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="m21 8-4-4-4 4" />
            <path d="M17 4v16" />
        </>
    ),
    download: (
        <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
            <path d="M12 15V3" />
        </>
    ),
    upload: (
        <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m17 8-5-5-5 5" />
            <path d="M12 3v12" />
        </>
    ),
    copy: (
        <>
            <rect x="8" y="8" width="14" height="14" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </>
    ),
    /* The tray with an arrow coming out of it, not the three-node graph
       _(2026-09-15, his call: "the official share icon that other websites
       use")_. Both are Lucide's, and the node graph is the one that reads as
       "share" only once you already know the convention; this one is what iOS
       put on every share sheet and what the web copied. */
    share: (
        <>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <path d="m8 6 4-4 4 4" />
            <path d="M12 2v14" />
        </>
    ),
    pencil: (
        <>
            <path d="M21.17 6.81a1 1 0 0 0-3.98-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.63l4.35-1.32a2 2 0 0 0 .83-.5z" />
            <path d="m15 5 4 4" />
        </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    minus: <path d="M5 12h14" />,
    plus: (
        <>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </>
    ),
    x: (
        <>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </>
    ),
} as const;

export type IconName = keyof typeof PATHS;

export type IconProps = {
    name: IconName;
    /** 16 inside a line of text or a button, 20 standing alone. */
    size?: 16 | 20;
    className?: string;
    style?: CSSProperties;
};

export function Icon({ name, size = 16, className, style }: IconProps) {
    return (
        <svg
            className={className}
            style={style}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {PATHS[name]}
        </svg>
    );
}

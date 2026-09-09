/** Props every component accepts, so a caller never has to fight the library. */

import type { CSSProperties, ReactNode } from 'react';

export type Base = {
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    id?: string;
};

/** The only allowed gaps: the `--sN` scale from `theme.css`, nothing between. */
export type GapStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type { CSSProperties, ReactNode };

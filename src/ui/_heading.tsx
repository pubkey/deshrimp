/**
 * The shared body of `<H1>`…`<H6>` and `<Heading>`.
 *
 * Not a component: six near-identical files would otherwise each carry the same
 * four lines, and the day the heading markup changes it would have to change in
 * seven places.
 */

import { createElement } from 'react';
import { cx } from './cx';
import type { Base } from './_types';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingProps = Base;

export function renderHeading(level: HeadingLevel, props: Base) {
    return createElement(
        'h' + level,
        { className: cx('ui-h' + level, props.className), id: props.id, style: props.style },
        props.children,
    );
}

/** `<H2>` and friends, made one at a time. */
export function headingComponent(level: HeadingLevel) {
    return (props: HeadingProps) => renderHeading(level, props);
}

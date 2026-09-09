/**
 * # ChatBubble — one message in a conversation
 *
 * ## What it does and how it looks
 * A rounded speech bubble in a row of its own: **`out` sits right** in the
 * accent tint (mine), **`in` sits left** on a card (theirs), each with one
 * squared-off corner on its own side so a run of bubbles reads as a
 * conversation rather than a list of pills. Underneath the content, a quiet
 * line for the time and, pushed to the end, a status — a tick, a clock, a
 * pigeon.
 *
 * The content is whatever you put in it: text, a progress bar for something
 * still on its way, a read-only textarea when the point is being able to copy
 * the message out.
 *
 * ## Core parts
 * - `side` — `'out'` (right, accent) or `'in'` (left, card). Default `'in'`.
 * - `name` — a small label above the content, for who wrote it.
 * - `meta` / `status` — the footer line; `status` is pushed to the far end and
 *   is the place for ✓✓ or „unterwegs".
 * - `tone` — `'quiet'` mutes a bubble that is not really a message yet (one
 *   still travelling, one that cannot be read).
 * - `onClick` makes the whole bubble a button; without it, it is plain text
 *   that can be selected.
 *
 * ## Examples
 * ```tsx
 * <ChatBubble side="out" meta="09:24" status="✓✓">Bin unterwegs.</ChatBubble>
 * <ChatBubble side="in" tone="quiet" status="🕊️ unterwegs">
 *   <Progress value={0.62} label="Zurückgelegt" />
 * </ChatBubble>
 * ```
 *
 * ## Changelog
 * - 2026-09-01 First version — for the Brieftaube, once it became a messenger.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type ChatBubbleProps = Base & {
    side?: 'in' | 'out';
    name?: ReactNode;
    meta?: ReactNode;
    status?: ReactNode;
    tone?: 'default' | 'quiet';
    onClick?: () => void;
    children?: ReactNode;
};

export function ChatBubble(props: ChatBubbleProps) {
    const side = props.side === 'out' ? 'out' : 'in';
    const body = (
        <>
            {props.name ? <div className="ui-bubble-name">{props.name}</div> : null}
            <div className="ui-bubble-content">{props.children}</div>
            {props.meta || props.status ? (
                <div className="ui-bubble-meta">
                    <span>{props.meta}</span>
                    {props.status ? <span className="ui-bubble-status">{props.status}</span> : null}
                </div>
            ) : null}
        </>
    );

    return (
        <div
            className={cx('ui-bubble', 'is-' + side, props.tone === 'quiet' && 'is-quiet',
                props.className)}
            id={props.id}
            style={props.style}
        >
            {props.onClick ? (
                <button type="button" className="ui-bubble-body" onClick={props.onClick}>
                    {body}
                </button>
            ) : (
                <div className="ui-bubble-body">{body}</div>
            )}
        </div>
    );
}

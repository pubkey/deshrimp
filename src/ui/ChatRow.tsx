/**
 * # ChatRow — one conversation in a list of conversations
 *
 * ## What it does and how it looks
 * The line a messenger's home screen is made of: a round avatar with an
 * initial, the name, one line of preview underneath, and on the right the time
 * plus an optional count. The whole row is one button, full width, with a hover
 * and a selected state — so a list of them reads as a list of *places to go*,
 * not as a table.
 *
 * The preview is deliberately a single clipped line. Two lines of preview and
 * the eye stops scanning names, which is the one thing this list is for.
 *
 * ## Core parts
 * - `name` — the conversation's title; its first letter becomes the avatar
 *   unless `avatar` says otherwise.
 * - `preview` / `time` — last thing that happened, and when.
 * - `badge` — a count, for what is waiting in there.
 * - `active` — the row is the one currently open.
 *
 * ## Examples
 * ```tsx
 * <ChatRow name="Anna" preview="🕊️ unterwegs" time="vor 3 Tagen" badge={2}
 *     onClick={() => open('anna')} />
 * ```
 *
 * ## Changelog
 * - 2026-09-01 First version — for the Brieftaube, once it became a messenger.
 */

import { cx } from './cx';
import type { Base, ReactNode } from './_types';

export type ChatRowProps = Base & {
    name: string;
    avatar?: ReactNode;
    preview?: ReactNode;
    time?: ReactNode;
    badge?: ReactNode;
    active?: boolean;
    onClick?: () => void;
};

export function ChatRow(props: ChatRowProps) {
    const initial = (props.name || '?').trim().charAt(0).toUpperCase() || '?';
    return (
        <button
            type="button"
            className={cx('ui-chatrow', props.active && 'is-active', props.className)}
            id={props.id}
            style={props.style}
            onClick={props.onClick}
        >
            <span className="ui-chatrow-avatar" aria-hidden="true">
                {props.avatar != null ? props.avatar : initial}
            </span>
            <span className="ui-chatrow-main">
                <span className="ui-chatrow-name">{props.name}</span>
                {props.preview != null
                    ? <span className="ui-chatrow-preview">{props.preview}</span>
                    : null}
            </span>
            <span className="ui-chatrow-side">
                {props.time != null ? <span className="ui-chatrow-time">{props.time}</span> : null}
                {props.badge != null && props.badge !== 0
                    ? <span className="ui-badge ok">{props.badge}</span>
                    : null}
            </span>
        </button>
    );
}

/**
 * `cx('ui-btn', big && 'lg')` — join class names, drop the falsy ones.
 *
 * Every component builds its class list with this, which is why `false`,
 * `null` and `undefined` are all safe to pass inline from a condition.
 */
export function cx(...parts: unknown[]): string {
    const out: string[] = [];
    for (const part of parts) if (part) out.push(String(part));
    return out.join(' ');
}

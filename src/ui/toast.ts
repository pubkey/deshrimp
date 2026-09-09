/**
 * One line, bottom centre, gone after 2.2 s.
 *
 * Imperative on purpose: a toast is feedback for something that just happened
 * („Link kopiert"), not state a component should own. One element is reused for
 * every message, so calling it twice never stacks two boxes.
 */
export function toast(message: string, ms?: number): void {
    let el = toastEl;
    if (!el) {
        el = toastEl = document.createElement('div');
        el.className = 'ui-toast';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = message;
    // Force a reflow so re-showing the same toast re-runs the fade-in.
    void el.offsetWidth;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el!.classList.remove('on'), ms || 2200);
}

let toastEl: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout>;

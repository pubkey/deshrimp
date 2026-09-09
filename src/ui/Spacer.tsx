/**
 * # Spacer — a deliberate gap
 *
 * ## What it does and how it looks
 * Empty vertical space, one section-sized step tall. Nothing is drawn.
 *
 * It exists so that „I want more air here" has an answer that is not a margin
 * typed onto some neighbouring element, where the next person cannot tell
 * whether it belongs to the thing above or the thing below.
 *
 * ## Core parts
 * - none. It takes no props on purpose; a spacer with a size is a layout bug
 *   wearing a costume — use `<Col gap>` or `<Section>` instead.
 *
 * ## Examples
 * ```tsx
 * <Spacer />
 * ```
 *
 * ## Changelog
 * - 2026-08-31 Own file.
 */

export function Spacer() {
    return <div className="ui-spacer" />;
}

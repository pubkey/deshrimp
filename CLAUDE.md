# Working on deshrimp

## Punctuation: no dashes beyond the hyphen

**The em dash (U+2014) and the en dash (U+2013) are not allowed anywhere** - not in code,
not in comments, not in UI copy, not in the thirteen translation tables, not in
Markdown, not in commit messages or pull request descriptions. Use a plain
hyphen `-`, or recast the sentence with a comma, a colon or a full stop.

This holds for every language in `src/app/i18n.*.ts`. Chinese normally sets an
appositive with a doubled em dash; there it becomes a full-width comma `，`, which
is what the sentence would otherwise have used.

`public/brand/*.svg` used to be the one exception, because they carried C2PA
content credentials and editing a byte broke the signature. The credentials
were dropped on 2026-10-17 on his call, so those files are ordinary SVGs now and
there is no exception any more.

To check before committing:

```bash
# The locale prefix is not optional: without it grep's PCRE refuses a
# \x{} above 0xFF with "character code point value is too large".
LC_ALL=C.UTF-8 grep -rnP '\x{2014}|\x{2013}' \
  src/ scripts/ *.md index.html public/manifest.webmanifest
```

It exits 1 and prints nothing when the repo is clean.

## Design system

The interface is the deshrimp design system, written up in `src/ui/DESIGN.md`:
five locked colours, accent as a budget, borders rather than shadows, IBM Plex
with tabular figures on every number. Read it before adding a colour, a radius,
a shadow or an animation - most of those answers are already no.

The page is **one grid of tiles**, not stacked sections. `src/ui/Tiles.tsx`
holds the mechanism and the one trap in it.

## Components

`src/ui` holds **only what this app renders**. A component that stops being
rendered gets deleted rather than carried along; the same goes for its CSS in
`theme.css` and for any `UiText` labels that existed only for it.

New UI work should reference the design-system token names
(`--surface-card`, `--text-secondary`, `--space-6`) rather than the legacy
aliases in `src/ui/tokens/bridge.css`, which exists so the port could happen in
one step and is meant to shrink.

## Copy

`src/app/i18n.ts` is the interface in thirteen languages and `src/app/data.json`
is the written answer. `Copy` is derived from the German table, so a key added
there and forgotten elsewhere is a type error rather than a German word on a
Japanese page. Removing a key means removing it from all thirteen.

His requests are recorded verbatim, typos and all, and `CHANGELOG.md` records
the decisions behind them. A recorded decision of his outranks a rule that
arrived later: the page title keeps its emoji because he asked for that wording
exactly, in every language.

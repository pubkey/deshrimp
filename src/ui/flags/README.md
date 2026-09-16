# The thirteen flags

Downloaded rather than drawn _(2026-09-15, his call: "draw the language emojis,
download one svg for each of them")_, and kept as files so that replacing one
is replacing a file.

**Source:** [flag-icons](https://github.com/lipis/flag-icons) 7.2.3, the `4x3`
set, MIT licensed. Unmodified, except where noted below. Each file is the
country whose flag the language is conventionally shown with: `en` is `gb`,
`zh` is `cn`, `ja` is `jp`, `ka` is `ge`.

**`es.svg` is the one that is not theirs.** Their Spanish flag carries the full
coat of arms and weighs **91 KB** - more than twice the page's own JavaScript,
for a drawing that is four pixels wide at the size this is rendered. This is
the Spanish civil flag instead, which is the same three bands without the arms
and is an official flag in its own right, written out by hand at 221 bytes.

`pt.svg` keeps its armillary sphere at 8.3 KB, which is the only other one
above a kilobyte and small enough to leave alone.

They are inlined into the bundle with `?raw` rather than linked, for the same
reason the fonts are vendored: this page installs and has to keep working with
the network gone.

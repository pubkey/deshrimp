import { defineApp } from '@app';

/**
 * Everything that identifies this page. `build_app.py` reads it and turns it
 * into the flags for `.claude/ui/build_page.py` — you never pass a title on the
 * command line, it lives here.
 */
export default defineApp({
    // Unique per page: it is the name the local database is stored under.
    appId: 'haltung',

    // The page's permanent URL, minted once by new_app.py. The 16 hex
    // characters at the end are the password — never edit this by hand.
    slug: 'sit-straight-shrimp',

    title: "Sitz aufrecht du Garnele! 🦐",
    subtitle: "Local-First-App fürs Haltungstraining · Erkennung lokal, gespeichert mit RxDB",

    // His request, verbatim — and his requests are German, so this is one of
    // the few strings in a real app that is not English. Copy what he actually
    // wrote, typos and all.
    task: "Bau eine App wo es so die Webcam schaut ob ich zu schräg Sitz und dann gibt er mir ein Signal so alle 10 Sekunden ein frame und dann schickst du das so an die KI und frägst den sitzwinkel von der Haltung an",

    accent: 'shrimp-calm',
    icon: '🦐',
    source: 'app-haltung',
});

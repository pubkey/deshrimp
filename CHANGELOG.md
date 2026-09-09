# Changelog — deshrimp

Entries up to 2026-09-09 were written while this app lived inside a private
knowledge-base repository, built by a page generator rather than by a normal
bundler. They are copied here unchanged rather than rewritten, because a
reconstructed history is worse than an awkward one — but note that paths and
build commands they mention belong to that older setup, not to this project.

## 2026-09-09 — an ordinary Vite project

### Geändert
- **Nur noch die Komponenten, die diese App benutzt.** Aus der geteilten
  Bibliothek kamen 100 Dateien mit; 48 davon hat keine Seite hier je gerendert
  (Shop-Listings, Karten, Rezeptkarten, Chat-Blasen, Zeitleisten …). Sie sind
  raus, dazu drei Datenbank-Komponenten (`Checklist`, `Decision`, `Steps`) und
  vier ungenutzte Diagrammtypen. **Am Bundle ändert das nichts** — Vite hatte sie
  ohnehin herausgeworfen; es ändert, was jemand liest, der das Repo aufmacht.
- **`theme.css` von 1.499 auf 924 Zeilen.** 16 Abschnitte gehörten ausschließlich
  zu gelöschten Komponenten. Das *ist* eine echte Ersparnis, anders als beim JS:
  CSS wird nicht baumgeschüttelt, die Regeln wurden bis eben mitgeliefert —
  gebaut 55,4 → 34,4 KB. Abschnitte mit gemischtem Inhalt blieben unangetastet:
  einige Klassen dort werden zur Laufzeit zusammengesetzt (`ui-gap-${n}`), und
  eine statische Suche hielte sie fälschlich für tot.
- **Die App ist jetzt ein normales JavaScript-Projekt** — `package.json`,
  `vite.config.ts`, `tsconfig.json`, `src/`, `npm run dev`. Vorher wurde die
  Seite von einem Generator gebaut, der React und die Komponenten als Globals in
  eine einzelne HTML-Datei einsetzte; die App importierte sie über einen
  Typ-Schatten auf `window.UI`. Jetzt sind es gewöhnliche ES-Module, und der
  Bundler sieht echte Importe: ungenutzte Komponenten fallen raus, und RxDBs
  WebRTC-Teil landet in einem eigenen Chunk, der erst beim Sync geladen wird.
- **Das Pose-Modell kommt über npm.** Drei der vier Dateien liegen in
  `@mediapipe/tasks-vision`, also einer normalen Abhängigkeit — npm lädt und
  prüft sie. Nur die Gewichte werden noch geholt. Die gepinnten SHA-256 bleiben.
- **Kein Python mehr** im Projekt.


## 2026-09-09 (Nachtrag 12)

### Geändert
- Der eigene P2P-Code der Seite bleibt jetzt derselbe, und ein eingefügter
  fremder Code steht nach dem Neuladen noch im Feld. Beides steckt im geteilten
  Bauteil: `.claude/app-builder/CHANGELOG.md`.


## 2026-09-09 (Nachtrag 11)

### Geändert
- **Die Überschrift „Jetzt / Jede Sekunde ein Bild" ist weg** _(„remove these
  texts we do not need them")_. Kamera, Urteil und die drei Zahlen stehen ganz
  oben auf der Seite und brauchen niemanden, der sie ankündigt; der Takt ist eine
  Einstellung und steht dort, wo man ihn einstellt. Die vier Wörter
  (`nowTitle`, `nowIdle`, `nowEverySecond`, `nowEvery`) sind aus allen zwölf
  Sprachtabellen entfernt — ein Schlüssel, den keine Seite mehr rendert, ist beim
  nächsten Lesen nur eine Frage.
- Die P2P-Sync der Seite überlebt jetzt das Schließen des Modals und wird nach
  einem Reload von selbst wieder aufgenommen. Das steckt im geteilten Bauteil:
  `.claude/app-builder/CHANGELOG.md`.

## 2026-09-09 (Nachtrag 10)

### Geändert
- Das ⇅-Modal fragt jetzt nach der Client-ID, statt den Cloud-Knopf
  abzuschalten, und P2P hat ein eigenes Feld für den Code der Gegenseite. Beides
  steckt im geteilten Bauteil — hier ändert sich nur, was er auf der Seite
  sieht. Einzelheiten: `.claude/app-builder/CHANGELOG.md`.

## 2026-09-09 (Nachtrag 9)

### Geändert
- **Aus „Messungen sichern" ist das ⇅-Modal geworden** — die Seite ruft jetzt
  `<DataSyncButton>` aus dem app-builder auf, statt direkt herunterzuladen. Damit
  kann sie zum ersten Mal auch **lesen**, was sie geschrieben hat: eine
  exportierte Datei lässt sich zurückladen, ein zweites Gerät per WebRTC auf
  denselben Stand bringen, und in eine Cloud sichern, sobald eine Client-ID
  eingetragen ist. Für eine Seite, deren Tageszeilen *für immer* bleiben sollen,
  war der reine Download die eigentliche Lücke: die Daten überlebten den
  Browser nicht.
- `t.saveReadings` und `t.saved` sind nicht mehr in Gebrauch — die Wörter des
  Modals stehen im Seitenrahmen, weil sie auf jeder Seite dieselben sind.

## 2026-09-08 (Nachtrag 8)

### Neu
- **Zehn weitere Sprachen** _(„add 10 more languages")_: Spanisch,
  Französisch, Italienisch, Portugiesisch, Niederländisch, Polnisch, Türkisch,
  Russisch, Chinesisch, Japanisch — zusammen mit Deutsch und Englisch zwölf.
  Übersetzt ist **alles, was auf der Seite steht**: die App-Texte
  (`i18n.<code>.ts`), der Seitenrahmen (`.claude/ui`) und der geschriebene
  Inhalt in `data.json` — Intro, die fünf Schritte, die sieben Quellennotizen
  und die vier Datenlücken. Auch der Titel: „¡Siéntate derecho, gamba!",
  „Siedź prosto, krewetko!", „坐直了，虾米！".

### Geändert
- **Die Sprachliste steht an einer Stelle.** `LANGUAGES` aus `i18n.ts` speist
  sowohl den Picker als auch `preferredUiLang()`. Vorher stand `['de','en']`
  zweimal wörtlich im `index.tsx` — bei zwei Sprachen harmlos, bei zwölf eine
  Liste, die auseinanderläuft.
- **`settings` ist auf v9.** Das Enum für `lang` ist von zwei auf zwölf Werte
  geweitet; das ist eine Schemaänderung, also muss die Version hoch, sonst weist
  RxDB das gespeicherte Dokument ab. Die Migration ändert **nichts**: die zehn
  neuen Sprachen sind ein Angebot, und jemanden still in eine Sprache zu
  schieben, die er nie gewählt hat, ist genau das, was eine Migration nicht tun
  darf.

### Nicht übersetzt, mit Absicht
- **Quellentitel.** Ein Dokument heißt, wie es heißt; übersetzt wird nur die
  Notiz darunter. Ebenso `id` und `severity` einer Datenlücke — das sind
  Schlüssel, kein Fließtext.
- **Kein Rechts-nach-links.** Arabisch, Hebräisch, Persisch, Urdu fehlen, weil
  der Seitenrahmen `dir="rtl"` nicht kann. Steht als Lücke in `.claude/ui`.

### Geprüft
- `tsc --noEmit` sauber — das ist bei zwölf Wörterlisten der eigentliche Test:
  ein vergessener Schlüssel ist ein Typfehler, kein deutsches Wort auf einer
  japanischen Seite.
- Im Browser durch alle zwölf geschaltet: Titel, Überschriften und der
  Abschlussblock wechseln mit, kein deutscher Rest, kein Querlauf, Konsole
  sauber.
- Erkennung: `ja` → Japanisch, `zh` → Chinesisch, `pl` → Polnisch, `ru` →
  Russisch, `tr` → Türkisch, **`pt-BR` → Portugiesisch** (Abgleich am
  Primär-Subtag), `sv` → Englisch (nicht im Angebot, also letzte Instanz),
  `['de-AT','en-US']` → Deutsch. Eine getroffene Wahl („Polski" in einem
  japanischen Browser) überlebt den Reload.

## 2026-09-08 (Nachtrag 7)

### Geändert
- **Die Kamera wird im Eingangsformat gezeigt, nichts wird abgeschnitten**
  _(„zeig die kamera immer im input format, schneide nichts ab")_ — das ersetzt
  das feste 16:9 von heute früh. Drei Stellen mussten zusammen umgestellt
  werden, jede einzeln hätte weiter beschnitten:
  1. **`getUserMedia` fragt nur noch eine Breite an.** Das `height: {ideal:
     720}` daneben legt eine Form fest; eine von Haus aus 4:3 arbeitende Kamera
     liefert dann einen 16:9-Ausschnitt ihres eigenen Sensors statt ihres
     Bildes.
  2. **`fitToStream()` schreibt das echte Verhältnis auf das Element** — bei
     `loadedmetadata` und bei `resize` (eine Kamera, die mitten im Strom die
     Betriebsart wechselt). **Einmal** in einem Effekt registriert, nicht in
     `start()`: `start` läuft bei jedem Klick auf Starten erneut, und ein dort
     angehängter Listener sammelt sich mit jedem Mal.
  3. **Das 16:9 im CSS ist nur noch der Platzhalter**, bis der Strom da ist.
     Irgendein Wert muss dort stehen, weil ein `<video>` ohne Quelle 300×150
     meldet und die Box sonst sichtbar springt. `object-fit: contain` statt
     `cover` ist die Rückfalllinie: sollten Element und Strom je auseinander
     gehen, entstehen Balken statt eines fehlenden Randes.

  **Die Messung hing nie daran** — `frameOf()` hat die Leinwand immer aus
  `videoHeight / videoWidth` bemessen. Falsch war die Vorschau: sie zeigte
  etwas anderes, als das Modell zu sehen bekam.

## 2026-09-08 (Nachtrag 6)

### Geändert
- **Aus dem Spinner ist ein Overlay geworden** _(„loading spinner sieht nicht
  gut aus, der text dreht aich mit. mach ein overlay modal loading lieber")_.
  Das Drehen des Textes war ein Fehler in `.claude/ui` und ist dort behoben; der
  zweite Teil der Bitte ist die Bauart: `<LoadingOverlay>` legt sich über die
  ganze Seite, statt sich einen Platz darin suchen zu müssen. Auf einer Seite,
  die beim Laden noch keine Messung hat und danach schon, gibt es diesen Platz
  nämlich nicht — er verdeckt oder er verschiebt.
- **Der Zustand hängt jetzt am Promise, nicht am Umfragen.** `preloadPose()`
  gibt ein Promise zurück; `setLoadingModel(true)` davor, `false` im `.then()`.
  Vorher wurde `poseLoading()` im Takt abgefragt — das verpasst einen Ladelauf,
  der schnell scheitert und neu startet, und macht jeden Test von der Uhr
  abhängig.

## 2026-09-08 (Nachtrag 5)

### Neu
- **Ein Spinner, solange das Modell lädt.** 17 MB dauern beim ersten Mal
  spürbar, und bis eben passierte nach dem Klick auf „Starten" sichtbar gar
  nichts. `preloadPose()` wird jetzt **vor** der Kamera angestoßen, damit die
  Anzeige auf den Klick erscheint und nicht erst, wenn der Browser den
  Video-Stream ausgehandelt hat. Die Beschriftung nennt die Größe und dass es
  einmalig ist — das ist die Information, mit der man entscheidet, ob man
  wartet.

### Behoben
- **`poseReady()` hat gelogen.** Es prüfte `landmarkerPromise !== null`, also
  war es in dem Moment wahr, in dem das Laden *beginnt* — die Seite behauptete
  „lokal gerechnet", während sie noch siebzehn Megabyte herunterlud. Jetzt gibt
  es ein echtes `landmarkerLoaded` und daneben `poseLoading()` für den Spinner.
- **Die Fehlermeldung des Modells war fest deutsch.** Ein `PoseError` trägt
  jetzt nur noch die Worte des Browsers als Detail; den Satz liefert `i18n.ts`,
  also steht auf einer englischen Seite auch Englisches.


## 2026-09-08 (Nachtrag 4)

### Geändert
- **Das Kamerabild ist immer 16:9** (vorher 4:3) — auf seine Ansage. Das ist
  auch die Form, in der die Kamera angefragt wird (`1280×720`), im Normalfall
  wird also gar nichts beschnitten; `object-fit: cover` fängt die Kameras ab,
  die nur 4:3 können, und schneidet oben und unten ab, wo nichts liegt, was
  diese Seite misst.

### Behoben
- **Das Dashboard-Layout ist wieder raus** („ok thats confusing, go back to the
  previous page layout not the dashboard"). Zurück auf die Lesespalte mit
  zentriertem Kopf, Kamera in der Mitte, Diagramme untereinander. Behalten
  wurden die zwei Dinge, die er einzeln verlangt hat: 16:9 und **offene
  Einstellungen** („settings must not be toggled, directly show them") — die
  waren im Dashboard hinter einem `<Details>` verschwunden.
  Die generischen Bausteine bleiben in `.claude/ui` liegen und sind dokumentiert;
  diese Seite benutzt sie nicht mehr.


## 2026-09-08 (Nachtrag 3)

### Geändert
- **Die Seite ist jetzt ein Dashboard, kein Dokument** („make the app look more
  like a fullscreen dashboard like it was built for the CEO of a company"):
  `<Page width="full">`, linksbündiger Kopf, und oben ein **Live-Band** mit der
  Kamera links und den Zahlen rechts statt einer Kamera mitten in einer
  Lesespalte.
- **Genau eine Hero-Zahl**, und es ist die, für die es die Seite gibt: der Kopf
  vor der Schulter. Seitneigung und Kopfneigung sind daneben normale Kacheln.
  Zwei Hero-Zahlen wären keine.
- **Die Diagramme stehen nebeneinander** statt untereinander — auf voller Breite
  ist das der ganze Gewinn, und der Zeitfenster-Filter darüber ist eine schmale
  Leiste statt eines formularbreiten Feldes.
- **Einstellungen und Erklärung sind eingeklappt.** Ein Dashboard, das mit
  seinem eigenen Einstellungsformular aufmacht, ist ein Einstellungsformular.
- **Die Kamerahöhe ist gedeckelt.** Bei 640 px Spaltenbreite ist 4:3 gleich
  480 px hoch — höher als die Zahlen daneben, also stand die halbe rechte Hälfte
  leer. Der Ausschnitt kostet nichts: das Bild zeigt, ob man im Bild ist, es ist
  kein Foto.
- Das Urteil steht als eigene Zeile unter den Zahlen, nicht mehr in einem
  Callout über der Kamera — auf einem Dashboard muss der Zustand aus zwei Metern
  lesbar sein.


## 2026-09-08 (Nachtrag 2)

### Geändert
- **Volle Lautstärke nach vier Messungen statt acht** — auf seine Ansage („mach
  nur 4 messungen bis voller lautstärke"). Im Sekundentakt also nach vier
  Sekunden. Acht war zu geduldig für einen Anstupser.
- **Die Startsprache wird erkannt: gespeicherte Wahl → Browsersprache →
  Englisch.** Vorher war jeder erste Aufruf Deutsch, auch auf einem englischen
  System — was zu „soll für alle funktionieren" nicht passte.
  Erkannt wird nur, **solange nichts gespeichert ist**; sobald ein
  Einstellungs-Dokument existiert, entscheidet das und die Erkennung schweigt.
  Eine Seite, die nicht in der gewählten Sprache bleibt, ist schlimmer als eine,
  die einmal falsch geraten hat.
  Die Falle dabei war nicht die Erkennung, sondern das Speichern: der erste
  Schreibvorgang ging von `DEFAULTS` aus und hätte ein frisches Gerät auf
  Deutsch festgenagelt, sobald er irgendeine andere Einstellung ändert. Deshalb
  `INITIAL_SETTINGS` mit der erkannten Sprache. Migration v3 schreibt weiterhin
  `'de'` für Geräte, die es vorher schon gab — die waren deutsch und sollen es
  bleiben.


## 2026-09-08 (Nachtrag)

### Neu
- **Das Tab-Symbol färbt sich nach Haltung** — grün, gelb, rot („the favicon of
  the url should change on bad posture to something red and go back to green on
  good posture"). Eine schlichte Scheibe als Inline-SVG statt einer eingefärbten
  Garnele: bei 16 px ist ein Emoji Matsch und eine Farbe nicht. Das ist der
  einzige Kanal, der noch funktioniert, während die Seite hinter der Arbeit
  liegt — also fast immer, wenn man der Empfehlung folgt, sie in einem eigenen
  Tab offen zu lassen.
- **Ein gleitender Durchschnitt über die letzten Minuten** (Vorgabe 30, wählbar
  5–120). Beantwortet eine andere Frage als das Tages-Diagramm darunter: das
  geht über Wochen und lässt sich nur im Nachhinein lesen, dieses über die
  Stunde, in der er gerade sitzt — die, in der er noch etwas ändern kann.
  Minutenweise gebündelt und über je drei Minuten geglättet, weil ein einzelnes
  Bild um ein, zwei Grad wackelt.
- **Fünfter Ton: Räuspern**, von ihm geschickt.

### Geändert
- **Der Ton fängt leise an und wird lauter**, solange es schief bleibt („the
  sound should start quiet and get louder if the posture is bad for times in a
  row"): von einem Viertel auf volle Lautstärke über acht Messungen in Folge.
  Eine einzige gute Messung setzt ihn zurück, Aufrichten wird also sofort
  belohnt. Das ist die richtige Antwort auf das, was die abgeschaffte
  Minutenpause lösen sollte.
- **Titel exakt** „Sitz aufrecht du Garnele! 🦐" / „Sit straight shrimp! 🦐",
  mit Ausrufezeichen und Emoji, in beiden Sprachen.
- **Neue Adresse:** `/p/sit-straight-shrimp/`. Die alte `/p/haltung/` ist offline
  genommen — eine eingefrorene Zweitfassung derselben Seite wäre schlechter als
  ein toter Link, weil sie nie wieder aktualisiert würde.
- **Der erste Abschnitt sagt jetzt, was die Seite tut** und empfiehlt, sie in
  einem eigenen Browser-Tab offen zu lassen, statt eine Zeile Fülltext zu
  zeigen.


## 2026-09-08 (später Abend)

### Neu
- **Der Kopf-vor-Schulter-Winkel ist zurück — und ist jetzt der Hauptwert.**
  Grund dafür ist er selbst: *„i need this because my neck posture is a bit too
  much to the front."* Genau das hat die App bis eben nicht gemessen.
  Zwei Fassungen davor waren falsch, und woran, ist die eigentliche Erkenntnis:
  gemessen wurde an der **Nase**, die bei jedem weit vor den Schultern sitzt
  (0,161 m im Testbild), kerzengerade oder nicht — deshalb war die Zahl vor
  allem Gesichtsgeometrie und brauchte ein Referenzbild, um überhaupt etwas zu
  bedeuten. Richtig ist das **Ohr**, das auch der klinische Wert benutzt: 0,035 m
  vor der Schulterlinie im selben Bild. Gemessen wird die Linie Schultermitte →
  Ohrmitte gegen die Senkrechte.
  **Damit fällt das Referenzbild weg, ohne dass die Messung mitfällt** — der Ohr-
  Wert braucht keine persönliche Eichung.

### Geändert
- **Körpergröße spielt keine Rolle mehr** („do not care about body size"): der
  Winkel ist ein Verhältnis zweier Längen am selben Körper, groß und klein lesen
  identisch. Das ist zugleich, was die Seite **für alle** benutzbar macht („it
  should work in general for all people, not only for me at my coworking
  space").
- **Die Datengrundlage ist entpersonalisiert.** Die alten Lücken über den
  STEYG-Coworking-Space, den Gaming-Stuhl im Wohnzimmer und die 194 cm sind weg.
  An ihre Stelle treten die Einschränkungen, die für jeden gelten: dass der
  Winkel nicht der kraniovertebrale ist, dass die Tiefe die schwächste Achse
  einer einzelnen Kamera ist, dass es keinen belegten Grenzwert gibt und dass
  die Kamera ungefähr auf Augenhöhe stehen muss.
- **Der Ton spielt jetzt wirklich bei jeder Prüfung** („each single time the
  check runs and detects wrong posture, it should play the sound"). Die letzte
  Bremse — einen noch laufenden Ton nicht neu zu starten — ist auch weg; jede
  Wiedergabe bekommt einen eigenen Audio-Knoten, die Töne überlagern sich also,
  statt sich abzuschneiden.
- Voreingestellte Grenze 18°: im einzigen verfügbaren Kalibrierbild las eine
  klar akzeptable Haltung 12°, und eine Vorgabe, die das am ersten Nachmittag
  als „grenzwertig" zählt, ist eine Vorgabe, nach der man die Seite zumacht.
  Nachziehen, sobald ein Tag echter Messungen zeigt, wo sein Normal liegt.
- Schema-Migrationen: `readings` v2, `days` v2 und `settings` v6 holen die
  Vorlage-Felder zurück. Alte Werte werden **nicht** übernommen — sie stammen
  vom Nasen-Maß und wären gegen das neue bedeutungslos.


## 2026-09-08 (nachts)

### Geändert
- **Der Ton kommt jetzt bei jeder schiefen Messung** („do not limit how often it
  plays the sound. play it each time the user sits wrong"). Die Pause von einer
  Minute ist weg; im Sekundentakt heißt das jede Sekunde, bis er sich
  aufrichtet. Einziges, was `play()` weiter verweigert: einen noch laufenden Ton
  neu zu starten — das ist keine Bremse, sondern das Gegenteil. Der Schrei läuft
  3,3 Sekunden; ihn jede Sekunde zurückzuspulen hieße, nie mehr als seine erste
  Sekunde zu hören.
- **Die Sprache wird oben rechts umgeschaltet**, nicht mehr in den
  Einstellungen — über die neue, für alle Seiten gedachte Komponente
  `<LanguagePicker>` neben dem Hell/Dunkel-Schalter. Das Panel „Sprache" in den
  Einstellungen entfällt.
- **„Local-First" im Untertitel verlinkt** auf rxdb.info/articles/local-first-future.html,
  „RxDB" weiterhin auf rxdb.info.


## 2026-09-08 (spät)

### Geändert
- **Vier echte Signaltöne statt sechs synthetisierter** — er hat sie selbst
  geschickt („use these sounds"): Furz, Schrei, Fingerknacken, Bada-Bumm-Tss.
  Sie liegen **committet** in `sounds/` und werden von `install_sounds.py` in
  den Seitenordner kopiert; `fetch_sounds.py` ist damit weg.
  Der Versuch davor, sie von Wikimedia Commons zu holen, ist an einem banalen
  Grund gescheitert und das ist notiert, damit es niemand nochmal probiert:
  **von einer geteilten Cloud-IP antwortet Wikimedia praktisch durchgehend mit
  429** — in einer Stunde kam eine von sechs Dateien durch. Vier Dateien von ihm
  schlagen das in jeder Hinsicht: kein Rate-Limit, kein Link-Rot, keine Lizenz
  zu verfolgen, und es sind die Töne, die er will.
  Das ist eine bewusste Ausnahme von der Regel, die beim Pose-Modell gilt: die
  betrifft 17 MB WASM, die sich jederzeit von einer gepinnten URL nachladen
  lassen. Diese 181 KB kamen von ihm und existieren sonst nirgends.
- `settings` v5 verengt das Enum und schiebt ein Gerät, das noch auf einem der
  abgeschafften Namen sitzt (`schaf`, `raeuspern`, `laser`, `piep`), auf die
  Vorgabe, statt an der Validierung zu scheitern.
- Die Oszillatoren bleiben als Notfallfassung, eine Form je Ton.


## 2026-09-08 (abends)

### Neu
- **Die Seite spricht Deutsch oder Englisch** („mach die app optional in
  english"). Umschaltbar in den Einstellungen, gespeichert wie jede andere
  Einstellung. Neu: `i18n.ts` mit beiden Fassungen aller sichtbaren Strings —
  `Copy` wird aus der deutschen abgeleitet, ein vergessener englischer Schlüssel
  ist also ein Typfehler und kein deutsches Wort auf einer englischen Seite.
  `data.json` liegt jetzt einmal pro Sprache vor, und `pose.ts` gibt einen
  `AdviceKey` statt eines Satzes zurück — dadurch liest sich eine auf Deutsch
  aufgezeichnete Messung auch nach dem Umschalten richtig.
- **Neuer Name und neues Icon**: „Sitz aufrecht du Garnele!" / „Sit straight
  shrimp", 🦐, auf seinen Wortlaut.
- **Neue Beschreibung** mit Link auf rxdb.info, ebenfalls auf seinen Wortlaut:
  Local-First-App fürs Haltungstraining, lokale Erkennung, RxDB als Speicher.
- **Echte Signaltöne statt Oszillatoren** („the sound files are bad. can you
  download real sounds from somewhere"). `fetch_sounds.py` holt beim Bauen sechs
  Aufnahmen von Wikimedia Commons unter freien Lizenzen nach `snd/` — gleiche
  Bauart wie beim Pose-Modell, also gleiche Herkunft, kein CDN, vom Service
  Worker gecacht, nicht im Repo. Die Seite nennt jede Aufnahme mit Urheber und
  Lizenz in den Quellen; bei CC BY und CC BY-SA ist das Pflicht, nicht Kür.

### Geändert
- **Die Referenz ist raus** („remove the Referenz stuff its confusing") — und
  mit ihr die **Vorlage-Messung**, weil beides dasselbe war: Vorlage war nur als
  Abweichung von einem gespeicherten Referenzbild rechenbar, ohne Referenz stand
  dort fest verdrahtet 0°. Eine Zahl, die immer 0 ist, sieht aus wie eine
  Messung und ist keine. Geblieben sind zwei Winkel, die ohne Kalibrierung
  stimmen — Schulterlinie gegen die Waagerechte, Augenlinie gegen die
  Schulterlinie —, und die Seite misst ab dem ersten Bild. Der Preis steht als
  erste Datenlücke auf der Seite: ein Zusammensacken nach vorn erkennt sie
  nicht mehr, dafür bräuchte es die Hüften, und die sind am Schreibtisch bei
  Sichtbarkeit 0,01.
- Drei Migrationen dazu, alle datenerhaltend: `readings` v1 ohne `forward`,
  `days` v1 ohne `forwardSum` (das sind die Zeilen, die für immer bleiben — jede
  Zählung und jede andere Summe überlebt), `settings` v4 ohne `maxForward`.
  `settings` v3 hatte davor die Sprache ergänzt, bewusst mit `de`, damit ein
  laufendes Gerät nicht unter ihm die Sprache wechselt.
- **„Verlauf löschen" fragt jetzt nach** — über die neue Komponente
  `<ConfirmButton>` in `.claude/ui`, nicht über einen Sonderfall hier.

### Behoben
- **Eine Pause verlängert die „längste gute Strecke" nicht mehr** („when there
  is no human in the picture, do not add that to the ‚längste gute Strecke'").
  Bilder ohne Person wurden schon vorher verworfen statt gespeichert — aber die
  Strecke wurde als Wanduhrzeit von der ersten bis zur letzten guten Messung
  gerechnet, also zählte die Mittagspause zwischen zwei aufrechten Messungen als
  eine Stunde vorbildliche Haltung. Jetzt bricht auch **eine Lücke in der
  Aufzeichnung** die Strecke, egal woher sie kommt.
- Die Lückengrenze skaliert mit dem Takt (drei verpasste Bilder, mindestens
  30 s). Fest auf 30 s sah bei einem Bild pro Sekunde richtig aus und hätte die
  Statistik bei jeder Einstellung darüber still kaputtgemacht: bei zwei Minuten
  pro Bild wäre *jede* normale Messung eine Lücke gewesen und keine Strecke
  jemals länger als 0.


## 2026-09-08

### Neu
- **Ein lokales Pose-Modell, und es ist die Voreinstellung.** Auf seine Frage
  („können wir ein locales model dafür nehmen das im browser läuft? lasst den
  user entscheiden ob local oder via api key"): MediaPipe Pose Landmarker läuft
  im Browser, liest 33 Körperpunkte und die Seite rechnet die Winkel selbst
  daraus. Kein Schlüssel, kein Kontingent, kein Bild, das das Gerät verlässt —
  und genauer als ein Sprachmodell, das ein flaches Bild schätzt.
- **Umschalter „Wo gerechnet wird"** in den Einstellungen. Das Schlüsselfeld
  erscheint nur noch auf dem Gemini-Weg, und der Datenschutz-Hinweis sagt je
  nach Weg die Wahrheit statt pauschal „geht an Google".
- **Verlauf über die Tage** — auf seine Bitte, sehen zu können, ob er besser
  wird. Jede Messung wird zusätzlich in eine Tageszeile gefaltet (Zähler je
  Urteil, Gradsummen, Signale); die bleibt erhalten, während die Einzelmessungen
  nach zwei Wochen aufgeräumt werden. Zwei Kurven aus `@charts` plus der
  Vergleich „letzte 7 Tage gegen die 7 davor".
- `fetch_pose_model.py` + `pose-model.sha256`: holt Modell und WASM beim Bauen
  in den Seitenordner, mit gepinnter Version und Prüfsummen. **Nicht ins Repo
  vendort** — seine Entscheidung: 17 MB blieben sonst dauerhaft in der Historie.

### Geändert
- Kopf der Seite, Schritte und `<DataGaps>` neu geschrieben: es gibt jetzt zwei
  Messwege, und die Seite behauptete überall noch, sie schicke Bilder an Google.
- Schema-Migrationen statt Neuanlage: `settings` v0→v1 (`source`), `reference`
  v0→v1 (`baseline`), neue Collection `days`. Seine bestehenden Einstellungen,
  Messungen und sein Referenzbild überleben das Update.

### Geändert (nach dem Merge von master)
- `new_app.py` vergibt seit #146 eine dauerhafte Zufalls-URL pro App. Diese
  Seite gehört zu den zwei mit festem Slug, also pinnt der Rebuild ihn jetzt
  ausdrücklich in `app.config.ts`, bevor gebaut wird — sonst trüge die Seite
  intern eine Adresse, unter der sie gar nicht liegt.

### Behoben
- **Der lokale Weg ließ sich gar nicht starten**: `start()` verlangte weiterhin
  einen API-Schlüssel. Im Browsertest aufgefallen, nicht beim Lesen.
- **Alle Winkel kamen als ~178° zurück.** Die Landmarks kommen in Körper-, nicht
  in Bildreihenfolge, also läuft die Schulterlinie rechts-nach-links und `atan2`
  liest für eine waagerechte Linie ±180°. Jetzt in den ersten Quadranten
  gefaltet.
- **Urteil und Ratschlag widersprachen sich** („Du sitzt gerade" über „richt dich
  auf"), weil der Satz eigene Schwellen hatte. Er bekommt jetzt seine.
- **Das Auswahlfeld war leer**: `<Select>` nimmt `<option>`-Kinder, keinen
  `options`-Prop — und `SelectProps` ist `Record<string, any>`, also hat der
  Typecheck es durchgelassen. Auch das kam aus dem Browsertest.

## 2026-09-08

### Neu
- **Der Schlüssel darf im Fragment stehen: `…/haltung/#k=AIza…`.** Auf seine
  Frage hin, warum die Seite ihn nicht schon hat: hier in der Session liegt er,
  aber die Seite ist weltlesbar — im Bundle wäre er veröffentlicht, und einen
  Server, der ihn hält, gibt es bei GitHub Pages nicht. Das Fragment ist der
  einzige Teil einer URL, den ein Browser nirgendwohin schickt: so bekommt die
  Seite den Schlüssel, ohne dass GitHub, das CDN oder irgendein Zugriffslog ihn
  je sieht, und ohne dass er in einer committeten Datei landet.
- **Einmal übernommen, dann aus der Adresszeile geputzt** (`replaceState`) —
  ein offener Tab soll ihn nicht anzeigen. Das Lesezeichen behält ihn, und
  damit ist ein neues Gerät ein Klick statt einer Tipperei.

## 2026-09-03

### Neu
- Erste Version. Auf seine Anfrage vom 2026-09-03: alle zehn Sekunden ein
  Webcam-Bild an Gemini, drei Winkel zurück, Ton wenn er zu schief sitzt.
  Veröffentlicht unter <https://pubkey.github.io/me/p/sit-straight-shrimp/>.
- **Fester Slug `haltung`** — die zweite Seite im Repo nach `app-brieftaube`,
  bei der das richtig ist. Sie ist ein Werkzeug, das er täglich öffnet, aufs
  Handy legt und bookmarkt; ein neuer Slug beim nächsten Build hinge das Icon
  ins Leere. Der übliche Grund für Zufall entfällt, weil die Seite selbst nichts
  enthält: kein Messwert, kein Schlüssel, kein Foto — alles davon schreibt erst
  sein Browser.
- **Referenzbild statt absoluter Winkel.** Er nimmt einmal auf, wie er sitzen
  will; danach misst jede Prüfung die Abweichung von genau dieser Haltung. Ohne
  das schätzt das Modell gegen seine eigene Vorstellung von „gerade", und das
  ist die schwächere Frage.
- **Das Modell misst, die Seite urteilt.** Zurück kommen nur Gradzahlen plus ein
  deutscher Satz; ob das „schief" ist, rechnet `index.tsx` gegen seine
  Schwellen. So bedeuten die Einstellungen etwas, und zwei Messungen bleiben
  vergleichbar, nachdem er eine Schwelle verschoben hat.
- **Das Signal ist rationiert**: höchstens ein Ton pro Minute, nie unter 0,4
  Konfidenz, und Bilder ohne erkannten Oberkörper werden verworfen statt
  gespeichert. Ein Signal alle zehn Sekunden ist ein Signal, das er abschaltet.
- **Der API-Schlüssel liegt in `localStorage`, nicht in RxDB.** Jede Collection
  wird als WebMCP-Werkzeug samt Schema veröffentlicht — die Messungen soll ein
  Agent im Browser lesen können, einen Google-Schlüssel nicht.

### Geändert
- `.claude/ui`: neues Accent-Preset **`health`** (Teal, hell und dunkel), weil
  es für Körper-Themen bisher keines gab und ein Hex-Wert auf der
  Kommandozeile keine Option ist (`DESIGN.md`).
- `.claude/ui`: neue Komponente **`<StatusStrip>`** — ein Balken je Messung,
  eingefärbt nach Ergebnis. Bei einer Messung alle zehn Sekunden sagt die Form
  des Verlaufs mehr als jede einzelne Zahl, und das ist nicht seitenspezifisch.

### Behoben
- `.claude/ui`: `<Input>`, `<Select>` und `<TextArea>` mit `label` bekommen
  jetzt eine `id`, sodass das `<label for>` tatsächlich auf das Feld zeigt.
  Vorher zeigte jedes Label auf jeder Seite ins Leere: Klick fokussierte nicht,
  und ein Screenreader las das Feld ohne Namen vor.

# QUAIN – Case Study Produktmanagement

Öffentliche Web-Version des QUAIN-Praxisprojekts von Nicolas Moegelin:
klickbarer Prototyp im iPhone-Rahmen, Pitch und Lebenslauf – auf Deutsch und Englisch.

**Live:** https://nmooh.github.io/quain/

> QUAIN – kuratierte Seasons für (Senior) Product Professionals: kleine, feste Runden aus
> 3–5 Personen oder ein 1:1, die sich sechs Monate lang offline und online begegnen.
> Die Projektdokumentation (Research, Synthese, Strategie, Hypothesen) liegt im privaten
> Projekt-Repo `DL_11`; dieses Repo enthält nur, was öffentlich sein soll.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html`, `src/shell/` | Case-Study-Seite: Einordnung, Buttons (Pitch, Lebenslauf, LinkedIn), Sprachumschalter. Desktop: App im iPhone-Rahmen; Handy: App im Vollbild, Case Study als Blatt |
| `app.html`, `src/App.tsx` | Der Prototyp aus Figma Make („QUAIN B2B2C / Private“, Export vom 2026-11-11) |
| `src/i18n/` | Übersetzung des Prototyps ohne Umbau von `App.tsx` (siehe unten) |
| `public/pitch/` | Pitch (12 öffentliche Folien) als Web-Ansicht und PDF, erzeugt aus `DL_11/pitch-deck` |
| `public/cv/` | Lebenslauf, öffentliche Fassung ohne Telefonnummer und E-Mail |
| `public/fonts/` | Instrument Serif und Outfit, lokal ausgeliefert (SIL Open Font License) |
| `scripts/` | `import_pitch.py` (Pitch übernehmen), `extract_strings.py` (Texte für die Übersetzung finden) |

## Anpassungen gegenüber dem Figma-Export

- Firmenbeispiel neutral: **Lumio** statt eines realen Unternehmens.
- Programmschritt „Online-Challenge“ statt „Online-Meeting/Online-Game“ (Entscheidung 2026-11-06).
- Season-Ende ohne Pausieren: „Ohne unangenehme Absage — Wiedereinstieg über ein neues QUAIN“.
- Gruppengröße im Text an das Konzept angeglichen (zwei bis vier weitere Personen, also 3–5).
- Figma-eigene Vite-Plugins entfernt, Schriften lokal statt über Google Fonts.

## Lokal starten

```bash
npm install --ignore-scripts
npx vite
```

Dann `http://localhost:5173/quain/` öffnen. Parameter: `?lang=de|en`.

## Übersetzung

`App.tsx` bleibt so nah wie möglich am Figma-Export, damit ein neuer Export leicht übernommen
werden kann. Die Sprache wird im Browser umgestellt: `src/i18n/runtime.ts` ersetzt sichtbare
Texte und Attribute anhand von `src/i18n/en.ts` (Deutsch → Englisch) bzw. `src/i18n/de.ts`
(englische Reste des Exports → Deutsch).

Nach einem neuen Export:

```bash
python3 scripts/extract_strings.py > /tmp/strings.json
```

listet alle Texte; fehlende Einträge in `en.ts` ergänzen.

## Pitch aktualisieren

Quelle bleibt `DL_11/pitch-deck/src/deck.html`. Übernehmen (braucht Playwright und Google Chrome):

```bash
python3 scripts/import_pitch.py --deck ../DL_11/pitch-deck/src/deck.html --lang de
```

## Veröffentlichen

Jeder Push auf `main` baut die Seite über GitHub Actions (`.github/workflows/deploy.yml`) und
veröffentlicht sie auf GitHub Pages. Einmalig nötig: im Repo unter **Settings → Pages → Source**
„GitHub Actions“ wählen.

Die Seite ist bewusst auf `noindex` gesetzt: Sie ist über den Link erreichbar, erscheint aber nicht
in Suchmaschinen.

## Rechte

- Schriften: Instrument Serif und Outfit, SIL Open Font License 1.1 (`public/fonts/OFL-*.txt`).
- Personen und Daten im Prototyp sind fiktiv.

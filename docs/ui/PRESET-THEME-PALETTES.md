# Preset × Theme – Paletten-Übersicht

Welche Designfarben (M3-Paletten) in welcher Kombination genutzt werden und wie sie ungefähr aussehen.

## Kombinationen (4)

| Preset      | Theme | Primary (Palette) | Tertiary (Palette) | Charakter |
|------------|-------|-------------------|--------------------|-----------|
| **Seriös**   | Hell  | Azure              | Cyan               | Kühles Blau + Türkis |
| **Seriös**   | Dunkel| Azure              | Cyan               | Gleiche Paletten, hellere Töne auf dunklem Grund |
| **Spielerisch** | Hell  | Magenta            | Violet             | Pink + Violett |
| **Spielerisch** | Dunkel| Magenta            | Violet             | Gleiche Paletten, hellere Töne auf dunklem Grund |

Die **Paletten** wechseln nur mit dem **Preset** (Seriös vs. Spielerisch).  
**Hell/Dunkel** wählt nur andere **Töne** aus derselben Palette (M3 berechnet Kontrast automatisch).

---

## Seriös (Azure + Cyan)

- **Primary:** `mat.$azure-palette` – Blau (von kräftigem Blau bis helles Azur).
- **Tertiary:** `mat.$cyan-palette` – Cyan/Türkis (von dunkel bis hell).

Typische sichtbare Farben (aus der Palette, Töne 40/50 für Hell, 80 für Dunkel):

| Rolle     | Hell (Beispiel) | Dunkel (Beispiel) |
|----------|------------------|-------------------|
| Primary  | `#005cbb` / `#0074e9` | `#abc7ff` |
| Tertiary | `#006a6a` / `#008585` | `#00dddd` |

---

## Spielerisch (Magenta + Violet)

- **Primary:** `mat.$magenta-palette` – Magenta/Pink.
- **Tertiary:** `mat.$violet-palette` – Violett.

Typische sichtbare Farben:

| Rolle     | Hell (Beispiel) | Dunkel (Beispiel) |
|----------|------------------|-------------------|
| Primary  | `#a900a9` / `#d200d2` | `#ffabf3` |
| Tertiary | `#7d00fa` / `#944aff` | `#d5baff` |

---

## Visuelle Vorschau

Zum Ansehen der Farbflächen: **`docs/ui/palette-preview.html`** im Browser öffnen.  
Die Datei zeigt für alle 4 Kombinationen Primary- und Tertiary-Farben als Flächen (Hell/Dunkel mit den obigen Beispiel-Hex-Werten).

---

## Code-Stelle

Definition in **`apps/frontend/src/styles.scss`**:

- **Seriös (Default):** `html` → `primary: mat.$azure-palette`, `tertiary: mat.$cyan-palette`.
- **Spielerisch:** `html.preset-playful` → `primary: mat.$magenta-palette`, `tertiary: mat.$violet-palette`.

Theme (Hell/Dunkel) wird über `html.light` / `html.dark` und `color-scheme` gesteuert; die Paletten bleiben pro Preset gleich.

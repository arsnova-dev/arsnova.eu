# Migration Zod v3 → v4

**Ziel:** Zod auf v4 heben für bessere Performance (u. a. ~7× schnelleres Objekt-Parsing bei wiederverwendeten Schemas), kleineres Bundle und weniger TypeScript-Instanziierungen. tRPC v11 ist mit Zod 4 kompatibel.

**Betroffene Pakete:** `libs/shared-types` (einzige Stelle mit Zod-Import), `apps/backend`, `apps/frontend` (nutzen shared-types).

---

## 1. Version umstellen

- **Root / shared-types / backend / frontend:** `zod` von `^3.23.0` auf `^4.0.0`.
- Nach dem Wechsel: `npm install` im Repo-Root.

---

## 2. API-Anpassungen (Breaking Changes)

### 2.1 Fehlermeldungen: `message` → `error`

In v4 ist der `message`-Parameter deprecated; verwendet wird der einheitliche `error`-Parameter.

| v3 | v4 |
|----|-----|
| `.min(1, 'Quiz-Name darf nicht leer sein')` | `.min(1, { error: 'Quiz-Name darf nicht leer sein' })` |
| `.length(6, 'Session-Code muss 6 Zeichen lang sein')` | `.length(6, { error: 'Session-Code muss 6 Zeichen lang sein' })` |
| `.min(1, 'Mindestens eine Frage erforderlich')` | `.min(1, { error: 'Mindestens eine Frage erforderlich' })` |

**Betroffen in `libs/shared-types/src/schemas.ts`:**
- Alle Aufrufe von `.min(..., '...')`, `.max(..., '...')`, `.length(..., '...')` mit String-Argument auf Objektform `{ error: '...' }` umstellen.

*(Hinweis: Die alte `message`-Form wird in v4 noch unterstützt, ist aber deprecated – für saubere Migration die neue Form verwenden.)*

### 2.2 String-Formate: Top-Level statt Methoden

`z.string().uuid()` und ähnliche Formate sind in v4 deprecated; empfohlen sind die Top-Level-APIs (besser tree-shakable).

| v3 | v4 (empfohlen) |
|----|----------------|
| `z.string().uuid()` | `z.uuid()` |
| `z.string().email()` | `z.email()` |

**V4-UUID-Strictness:** `z.uuid()` prüft in v4 streng nach RFC 9562/4122 (Variant-Bits). Falls ihr „UUID-ähnliche“ Werte ohne strenge RFC-Prüfung braucht: `z.guid()`. Prisma-UUIDs sind in der Regel RFC-konform → `z.uuid()` beibehalten.

**Betroffen in `schemas.ts`:** Alle `z.string().uuid()` durch `z.uuid()` ersetzen (oder vorerst belassen – deprecated, aber funktionsfähig).

### 2.3 Optional + Default

- In v4 muss der Wert bei `.default()` dem **Output**-Typ entsprechen (nicht mehr dem Input). Bei unseren Schemas (keine `.transform()` vor `.default()`) ändert sich das Verhalten praktisch nicht.
- Optionale Felder mit Default: In v4 werden Defaults auch innerhalb optionaler Felder angewendet; das Verhalten ist oft intuitiver als in v3. Bestehende Typen/Contracts prüfen (z. B. ob irgendwo „fehlender Key“ erwartet wird).

### 2.4 `.extend()`

`.extend()` bleibt die empfohlene API (`.merge()` ist deprecated). Unser `JoinSessionOutputSchema = SessionInfoDTOSchema.extend({ ... })` kann unverändert bleiben.

### 2.5 `z.infer`

`z.infer<>` gibt es in v4 unverändert; optional kann `z.output<>` verwendet werden (bei unseren Schemas ohne Transform äquivalent). Keine Änderung nötig.

### 2.6 `z.record`

Wir nutzen bereits `z.record(z.string(), z.number())` (Key-Schema, Value-Schema). Entspricht der v4-API – keine Anpassung nötig.

---

## 3. Optionale Hilfsmittel

- **Codemod (Community):** [zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4) – viele mechanische Ersetzungen (z. B. `message` → `error`, Top-Level-Formate). Danach manuell prüfen und Tests ausführen.
- **Codemod.com:** `npx codemod jssg run zod-3-4` (falls im Projekt genutzt).

---

## 4. Ablauf (empfohlen)

1. Branch anlegen (z. B. `chore/zod-v4`).
2. In `libs/shared-types/package.json` und ggf. Root/Backend/Frontend: `"zod": "^4.0.0"`.
3. `npm install`.
4. In `libs/shared-types/src/schemas.ts`:
   - Alle benutzerdefinierten Fehlermeldungen auf `{ error: '...' }` umstellen.
   - Optional: `z.string().uuid()` durch `z.uuid()` ersetzen.
5. `npm run build` (shared-types → backend → frontend).
6. `npm run test`.
7. Manuell: Einige tRPC-Endpunkte (Session erstellen, Join, Vote) durchspielen; Fehlerausgaben bei ungültigen Inputs prüfen.
8. Merge nach Review.

---

## 5. Rollback

Bei Problemen: `zod` wieder auf `^3.23.0` setzen, `npm install`, Commit revert. Keine Datenbank- oder API-Änderungen – nur Laufzeit- und Build-Bibliothek.

---

## 6. Referenzen

- [Zod v4 Migration Guide (Changelog)](https://v4.zod.dev/v4/changelog)
- [Zod v4 – What’s New](https://v4.zod.dev/v4)
- Codemod: [nicoespeon/zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)

# Kontroversitäts-Score für das Q&A-Forum (Story 8.6)

> **Zielgruppe:** Product Owner, Entwickler, QA  
> **Verknüpfung:** User-Story in Kurzform siehe [`Backlog.md`](../../Backlog.md) (Epic 8, Story 8.6).

## Hintergrund

Eine einfache Differenz (Upvotes minus Downvotes) rutscht bei **ausgeglichener Polarität** nach unten: z. B. 50 Up- und 50 Downvotes ergeben Differenz 0, obwohl die Frage für die Diskussion im Raum zentral sein kann.

Live-Events haben eine **begrenzte Teilnehmerzahl** (typisch 10–200). Gesucht ist ein Score, der **„Reibung“** (hohe, ausgeglichene Up-/Down-Beteiligung) misst und sich **an die Raumgröße anpasst**, damit vereinzelte Gegenstimmen in großen Räumen nicht als künstliche Kontroverse gelten.

---

## Berechnung

Für jede Frage (Post) wird ein `controversy_score` berechnet. Wertebereich: **0,0** (eindeutige Stimmung) bis **1,0** (hohe Kontroverse bei vielen Stimmen im Verhältnis zur Glättung).

### Formel

$$
S = \frac{2 \cdot \min(U, D)}{U + D + C}
$$

| Symbol | Bedeutung                                                                                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U      | Anzahl Upvotes                                                                                                                                                                                    |
| D      | Anzahl Downvotes                                                                                                                                                                                  |
| N      | Bezugsgröße für die Raumgröße des Events (bei Implementierung **eindeutig** festlegen, z. B. konfigurierte Maximalteilnehmerzahl der Session oder aktuell gezählte Teilnehmende — nicht mischen). |
| C      | Glättungs-/Prior-Term im Nenner: `max(1, 0.1 * N)` (siehe Formel und technische Regeln)                                                                                                           |

Der Term \(C\) wirkt wie ein **Prior**: wenige Stimmen in einem großen Raum erhöhen den Score nur moderat; viele ausgeglichene Stimmen erhöhen ihn stark.

### Technische Regeln

1. **Gleitkomma:** Der Score wird als Float/Decimal berechnet (keine Ganzzahl-Division).
2. **Untergrenze für C:** \(C = \max(1,\, 0.1 \cdot N)\) verhindert einen Nenner von 0 und stabilisiert den Fall \(N = 0\).

---

## Sortierung (Tie-Breaker)

Bei gleichem `controversy_score` (häufig in kleinen Gruppen) gilt strikt:

1. `controversy_score` **DESC**
2. `upvotes` **DESC**
3. `created_at` **DESC** (aktuellere Frage zuerst — sinnvoll für Live-Betrieb)

---

## UI und Copy (Referenz Deutsch)

Damit Host/Moderation **nachvollziehen**, warum eine Frage oben steht, kann ein Kontroversitäts-Sortiermodus durch UI unterstützt werden.

### Badge und Kennzeichnung (optional, nicht bei jedem Eintrag)

Anzeige nur wenn **beides** gilt:

- `controversy_score > 0.5`
- \((U + D) \geq C\) (genug Gesamtstimmen im Verhältnis zur Raumgröße)

**Deutsche Referenzbegriffe** für Labels (Übersetzungen nach ADR-0008 in alle UI-Sprachen): z. B. „Umstritten“, „Polarisierend“, „Diskussionslage“ — keine festen englischen UI-Strings in der Produktions-UI.

**Icons** (Auswahl bei Umsetzung): z. B. Blitz, gekreuzte Schwerter, Waage — konsistent zum bestehenden Designsystem.

**Visualisierung:** Falls eine Voting-Anzeige existiert, kann ein Verlauf von neutral zu „warnend“ den steigenden Score andeuten (`prefers-reduced-motion` beachten).

---

## Akzeptanzkriterien

- [ ] **AC 1:** Sortierung bevorzugt stark **ausgeglichene** Up-/Down-Beteiligung gegenüber einseitiger Zustimmung.
- [ ] **AC 2:** \(C\) wird **pro Event/Session** aus der gewählten Definition von \(N\) abgeleitet (kleinerer Raum → kleineres \(C\) als bei großem Raum, bei gleicher Formel).
- [ ] **AC 3:** Gleicher Score → eindeutige Reihenfolge über Upvotes, dann `created_at`.
- [ ] **AC 4:** Kein Absturz bei 0 Stimmen oder \(N = 0\); keine Division durch Null.
- [ ] **AC 5:** Fragen oberhalb der Badge-Schwellen werden sichtbar als kontrovers/umstritten gekennzeichnet (siehe Abschnitt UI).

---

## Beispiel: SQL

Illustration — Tabellen- und Feldnamen an das echte Q&A-Schema anpassen.

```sql
SELECT
    id,
    title,
    upvotes,
    downvotes,
    created_at,
    (2.0 * CASE WHEN upvotes < downvotes THEN upvotes ELSE downvotes END)
    / (upvotes + downvotes + GREATEST(1.0, 0.1 * :N)) AS controversy_score
FROM posts
WHERE event_id = :current_event_id
ORDER BY
    controversy_score DESC,
    upvotes DESC,
    created_at DESC;
```

---

## Testfälle und QA

### Voraussetzungen (Szenario 1–3)

\(N = 100\) → \(C = \max(1, 10) = 10\).

### 1. Keine Interaktion / einseitige Stimmung

| Post | U   | D   | Erwarteter Score | Kurz           |
| ---- | --- | --- | ---------------- | -------------- |
| A    | 0   | 0   | 0,000            | Keine Stimmen  |
| B    | 50  | 0   | 0,000            | Nur Zustimmung |
| C    | 0   | 50  | 0,000            | Nur Ablehnung  |

### 2. Einfluss von C (kleine vs. große ausgeglichene Masse)

| Post | U   | D   | Erwarteter Score | Kurz                          |
| ---- | --- | --- | ---------------- | ----------------------------- |
| D    | 1   | 1   | 0,166            | 2/(2+10) — stark gedämpft     |
| E    | 40  | 40  | 0,888            | 80/(80+10) — hohe Kontroverse |

Reihenfolge: E vor D (gleiche Balance, mehr Masse → höherer Score).

### 3. Tie-Breaker

| Post | U   | D   | Zeit  | Score        |
| ---- | --- | --- | ----- | ------------ |
| F    | 2   | 1   | 10:00 | 2/13 ≈ 0,153 |
| G    | 1   | 2   | 10:05 | 2/13 ≈ 0,153 |
| H    | 2   | 1   | 10:10 | 2/13 ≈ 0,153 |

Erwartete Reihenfolge: H, dann F, dann G — zuerst neuer bei gleichen Upvotes (H vs. F), dann mehr Upvotes als G.

### 4. Randfälle N

| N   | U   | D   | C    | Erwarteter Score | Kurz                                       |
| --- | --- | --- | ---- | ---------------- | ------------------------------------------ |
| 0   | 1   | 1   | 1,0  | 0,666            | Fallback max(1, …)                         |
| 10  | 2   | 2   | 1,0  | 0,800            | kleiner Raum                               |
| 200 | 2   | 2   | 20,0 | 0,166            | großer Raum, wenige Stimmen = wenig Signal |

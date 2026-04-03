<!-- markdownlint-disable MD060 -->

# Didaktische Reihenfolge: Offene User Stories

**Zielgruppe:** Betreuende, Studierende im Praktikum  
**Voraussetzung:** Die **Kohorte** soll die **offenen Stories** aus dem Produkt-Backlog **didaktisch sinnvoll abdecken** — **ausgenommen** die Story **1.7a**, wenn diese in der **Greenfield-Demo** (3×45 Min.) von der **Lehrperson** mit KI-Agent live umgesetzt wird; siehe [`docs/didaktik/greenfield-demo-1-7a-vorlesung.md`](../didaktik/greenfield-demo-1-7a-vorlesung.md). **Epic 10 (MOTD)** bleibt im Repo **bereits fertig** und dient bei Bedarf als Referenzcode. Für **eine einzelne Person** im Rahmen von ca. **40 Stunden** ist der Standard **nicht** der Vollkatalog, sondern **Pflichtkern + Vertiefungspfad**. Die **Reihenfolge** bleibt entscheidend für **Verständnis**, **Lernkurve** und **Review-Sicherheit**, wenn die **Umsetzung überwiegend mit KI-Unterstützung** erfolgt und die studierende Person **überwacht, steuert und abnimmt**.

**Referenz:** [`Backlog.md`](../../Backlog.md) (Status ⬜ Offen).  
**Stand dieser Empfehlung:** 2026-04-01 — bei Änderungen im Backlog Reihenfolge und Begründungen anpassen.

## Kurz gesagt

Wenn du nur wissen willst, **was das für dich praktisch heißt**, dann ist der Regelfall:

- Du machst **nicht** alle 13 Tickets allein.
- Du startest nach der Vorlesungs-Demo mit dem **Pflichtkern**: **5.4a**, **8.7**, **8.6**.
- Danach nimmst du **mindestens ein** Vertiefungsticket aus dem mittleren Block.
- Die letzten Tickets mit **Security** oder großem **Querschnitt** machst du nur mit enger Betreuung.

---

## 0. Einstieg: Greenfield 1.7a — diese Story wird nicht parallel umgesetzt

Der Einstieg beginnt mit einer **Greenfield-Demo** am Beamer: **Story 1.7a** (Markdown-Bilder: nur URL + Lightbox) — **3×45 Minuten** (135 Min.), Leitfaden: [`docs/didaktik/greenfield-demo-1-7a-vorlesung.md`](../didaktik/greenfield-demo-1-7a-vorlesung.md).

- **Lehrperson** und **KI-Agent** zeigen **Ende-zu-Ende**: Backlog-Akzeptanzkriterien → [ADR-0015](../architecture/decisions/0015-markdown-images-url-only-and-lightbox.md) → Angular/Markdown-Pipeline → Lightbox → i18n/Tests (soweit in der Zeit reicht).
- **Parallel:** Mini-Inputs **VS Code**, **Git**, **GitHub**, **Stack** (TypeScript, Angular, Monorepo — nach Terminplan).
- **Studierende** bearbeiten **1.7a nicht** als eigene Praktikums-Story, wenn die Demo diese Story **inhaltlich abdeckt** (Merge/DoD können außerhalb der 135 Min. nachgezogen werden).
- **Epic 10 (MOTD)** dient **optional** als **zweites** Referenzbeispiel (fertiger Full-Stack-Strang: Spec, ADR-0018, `motd`-Router) — **nicht** Ersatz für die 1.7a-Greenfield-Demo.

---

## 1. Warum überhaupt eine feste Reihenfolge?

| Aspekt      | Ohne Reihenfolge                                       | Mit didaktischer Reihenfolge                              |
| ----------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Einstieg    | Risiko: große oder sicherheitskritische Stories zuerst | Kleine, prüfbare Schritte am Anfang                       |
| Verständnis | Codebase wirkt „alles gleich wichtig“                  | Aufbau von **Mustern** (Feature → Q&A → Infra → Security) |
| KI-Einsatz  | Schwer zu validieren bei undurchsichtigen Änderungen   | Stories mit **klarer Spezifikation** früh üben            |
| Review      | Betreuende müssen alles gleich tief prüfen             | Spätere Stories erfordern **bewusst** mehr Audit-Zeit     |

**Leitidee:** Zuerst **lernen, KI-Output gegen Anforderungen und Tests zu prüfen**, dann **komplexere Flächen** und zuletzt **hohes Schadenspotenzial** (Security, Querschnitt).

---

## 2. Rollenklärung (didaktisch)

Kurz übersetzt:

- **Du** steuerst, prüfst und dokumentierst.
- **Die KI** hilft beim Umsetzen, entscheidet aber nicht über Richtigkeit.
- **Die Betreuung** hilft bei Scope, Reihenfolge und riskanten Themen.

- **Studierende Person:** Versteht die Story, zerlegt sie in Schritte, formuliert Aufträge an die KI, **liest Diff und Tests**, führt manuelle Checks aus und dokumentiert kurz das Ergebnis.
- **KI:** Implementiert nach Vorgabe; **kein Ersatz** für Abnahme gegen Backlog und DoD.
- **Betreuung:** Reihenfolge durchsetzen oder begründet abweichen; bei Security-/A11y-Stories zusätzliche Review-Luke einplanen.

---

## 3. Empfohlene Reihenfolge (Pflichtkern + Vertiefung)

Die folgende Struktur listet **alle aktuell offenen Stories** didaktisch geordnet — **ohne** Epic 10 (MOTD) und **ohne 1.7a**, sofern diese in der **Greenfield-Demo** durch die Lehrperson abgedeckt wird.

**Standard für eine einzelne Person nach dem Vorlesungsblock (Abschnitt 0):**

- **Pflichtkern:** Ticket **1 → 3**
- **Vertiefung:** **mindestens ein** Ticket aus **4 → 10** nach Absprache
- **Nur mit enger Betreuung / Pair-Review:** Ticket **11 → 13**

Wenn die Kohorte klein ist oder Vorerfahrung hoch ist, kann eine Person mehr übernehmen. Wenn die Kohorte größer oder heterogener ist, sollte die **Kohorte gemeinsam** den Katalog abdecken.

### 3.1 Pflichtkern

| Nr. | Story    | Titel (Kurz)                      | Didaktischer Schwerpunkt                       | Warum im Pflichtkern                                                                                                                                                   |
| --- | -------- | --------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **5.4a** | Foyer-Einflug, Preset Spielerisch | Mini-Feature, schnelles Feedback               | **Einstieg:** wenige Dateien, Ergebnis oft visuell und sofort prüfbar; Training im Umgang mit Repo, Branch und CI.                                                     |
| 2   | **8.7**  | Q&A „Beste Fragen“ (Wilson-Score) | Algorithmus + tRPC + Tests                     | **Spezifikationsgetrieben:** Formel und SQL-Hintergrund in [`docs/features/controversy-score.md`](../features/controversy-score.md); gut gegen Dokument verifizierbar. |
| 3   | **8.6**  | Q&A Kontroversitäts-Score         | Gleiche Domäne wie 8.7, mehr Produktentscheide | **Aufbau:** gleiche Q&A-Basis; zusätzlich \(N\) für Glättung, Badge/Schwellen und i18n, wenn Sortier- und Score-Muster schon verstanden sind.                          |

### 3.2 Vertiefungspfad

Mindestens **ein** Ticket aus diesem Block ist der sinnvolle Regelfall. Die Auswahl hängt von Gruppengröße, Vorwissen und Semesterdynamik ab.

| Nr. | Story     | Titel (Kurz)                       | Didaktischer Schwerpunkt        | Warum als Vertiefung sinnvoll                                                      |
| --- | --------- | ---------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| 4   | **6.6**   | UX Thinking Aloud & Umsetzung      | Methode, Findings, iterative UX | Bricht die reine Code-Linie bewusst auf und stärkt Methodenkompetenz.              |
| 5   | **8.5**   | Delegierbare Q&A-Moderation        | Rollen, Tokens, Rechte, UI      | Komplexes Feature mit vielen Schichten; sinnvoll nach Q&A-Vertrautheit.            |
| 6   | **0.7**   | Last- & Performance-Tests (E2E)    | Tooling, CI, Metriken           | Qualitätsschicht statt reinem Nutzerfeature; passt gut nach ersten Produktstories. |
| 7   | **1.6d**  | Sync-Performance & Skalierung      | Messen, Profiling, Hypothesen   | Lernziel ist evidenzbasierte Optimierung, nicht nur Codeänderung.                  |
| 8   | **1.2d**  | Numerische Schätzfrage             | Voller Fragentyp End-to-End     | Hoher Koordinationsaufwand über Backend, Shared Types, UI und Auswertung.          |
| 9   | **1.14a** | Word Cloud 2.0                     | Layout, UX, Performance         | Große UX-Fläche mit mehreren Feinschliff-Runden; braucht klare Abnahme-Kriterien.  |
| 10  | **1.7b**  | Markdown/KaTeX-Editor, MD3-Toolbar | Großes Editor-Feature           | Viele Kantenfälle und UI-Zustände; baut inhaltlich auf 1.7a aus der Vorlesung auf. |

### 3.3 Nur mit enger Betreuung

Diese Tickets sind didaktisch wertvoll, aber für **eine einzelne Person** in kurzer Zeit nur mit enger Betreuung, Pair-Review oder als Teamverantwortung sinnvoll.

| Nr. | Story    | Titel (Kurz)                         | Didaktischer Schwerpunkt  | Warum nicht Standard für jede Person                                                              |
| --- | -------- | ------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------- |
| 11  | **2.1c** | Host-/Presenter-Session-Token härten | Security                  | Hohes Risiko bei Fehlern; Bedrohungsmodell und Review-Tiefe sollten aktiv begleitet werden.       |
| 12  | **1.6c** | Sync-Sicherheit härten               | Security, verteilte Logik | Eigenständiges Audit nötig; Fehlerwirkung deutlich größer als bei typischen Einstiegstickets.     |
| 13  | **6.5**  | Barrierefreiheit (Projektende)       | Querschnitt               | Greift in viele bestehende Oberflächen; sinnvoll, wenn der Produktstand schon relativ stabil ist. |

---

## 4. Phasen (übergeordnet)

Zur Orientierung für die Betreuung — nicht separate „Pflicht“, sondern **Lernbogen**:

1. **Phase A (1):** Erstes eigenes Feature nach der Vorlesung (**5.4a**).
2. **Phase B (2–3):** Q&A-Scores, Spezifikation lesen, Backend/Frontend/tRPC durchgängig.
3. **Phase C (4–10):** Vertiefungen nach Schwerpunkt der Person oder des Teams.
4. **Phase D (11–13):** Security und Querschnitt nur mit erhöhter Review-Sorgfalt.

---

## 5. Abnahme-Checkliste pro Story

Kurz und wiederholbar — unabhängig von der Story-Nummer:

- [ ] Akzeptanzkriterien aus `Backlog.md` erfüllt (oder Abweichung dokumentiert und mit Betreuung abgestimmt).
- [ ] `shared-types` / Zod bei tRPC-Eingaben und -Ausgaben konsistent (`AGENT.md`, Monorepo-Regeln).
- [ ] Tests grün; bei neuem Verhalten sinnvolle Specs ergänzt.
- [ ] UI-Texte: bei deutschen Änderungen **alle** Zielsprachen nachgezogen (ADR-0008), sofern Story UI berührt.
- [ ] Kein blindes Merge: **Diff gelesen**, keine offensichtlichen Sicherheits- oder Datenlecks.

---

## 6. Abweichungen von der Reihenfolge

Erlaubt, wenn **begründet**, z. B.:

- **6.6** früher einsetzen, wenn eine Person **explizit UX/Methoden** stärken soll (parallel zu technischen Tickets einer anderen Person ist möglich, solange der **Pflichtkern** stabil bleibt und die **Kohorte gemeinsam** die relevanten Flächen abdeckt).
- Backlog-**Priorität** (🔴 Must) zwingt zur Vorderei — dann Reihenfolge mit Betreuung neu bewerten und dieses Dokument aktualisieren.
- Wenn **1.7a** in der Vorlesung **nicht** abgeschlossen wird: entweder nachziehen (Lehrperson) oder **1.7a** wieder als Studierenden-Ticket einplanen — Tabelle und Abschnitt 0 anpassen.

---

## 7. Verknüpfungen

| Dokument                                                                                           | Inhalt                                                          |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`Backlog.md`](../../Backlog.md)                                                                   | Story-Liste, Status, Akzeptanzkriterien                         |
| [`docs/didaktik/greenfield-demo-1-7a-vorlesung.md`](../didaktik/greenfield-demo-1-7a-vorlesung.md) | **Ablauf 3×45 Min.** Greenfield 1.7a                            |
| [`docs/features/controversy-score.md`](../features/controversy-score.md)                           | Kontroversität (8.6), Wilson (8.7), Hintergrund                 |
| [`docs/praktikum/PRAKTIKUM.md`](./PRAKTIKUM.md)                                                    | Rahmen Praktikum, Bewertung, Ablauf                             |
| [`EINSTIEG-TOOLS-UND-STACK.md`](./EINSTIEG-TOOLS-UND-STACK.md)                                     | **Pflicht-Orientierung** bei fehlender Tool-/Stack-Vorerfahrung |
| [`docs/features/motd.md`](../features/motd.md)                                                     | MOTD, Epic 10 (optional Referenzcode)                           |
| [`AGENT.md`](../../AGENT.md)                                                                       | Arbeitsweise mit KI im Editor                                   |

---

_Diese Datei beschreibt eine **didaktische** Empfehlung; die fachliche Priorisierung im Produkt bleibt im Backlog und bei Product Owner bzw. Projektleitung._

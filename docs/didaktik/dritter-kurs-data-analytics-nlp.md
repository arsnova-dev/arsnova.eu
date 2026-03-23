# Dritter Kurs: Data Analytics und NLP (nicht zwingend parallel)

> **Kurs 3** vertieft **NLP und Auswertelogik** rund um die **geplante intelligente Wortwolke** (semantisches Bündeln von Freitext, Themenlabels, ggf. Abgrenzung zur rein lexikalischen Wolke). Der Kurs muss **nicht** parallel zu Kurs 1 (Entwicklung) und Kurs 2 (SQM) laufen — er eignet sich z. B. als **folgender** oder **eigenständiger** Block, sobald Produktkontext und Begriffe aus [`BEGRIFFE-FREITEXT-UND-SEMANTIK.md`](../praktikum/BEGRIFFE-FREITEXT-UND-SEMANTIK.md) bekannt sind.

### Ausführliche Praktikumsbeschreibung (studierendenfreundlich)

**→ [`docs/praktikum/PRAKTIKUM-DATA-ANALYTICS.md`](../praktikum/PRAKTIKUM-DATA-ANALYTICS.md)**

---

## Kurzmodell

| Aspekt           | Inhalt                                                                                                                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Produktbezug** | Gleiche Codebasis **arsnova.eu**; Fokus auf **Daten- und Sprachpipeline** für Freitext (Host-Auswertung), nicht auf komplette Feature-Implementierung im Monorepo — es sei denn, die Betreuung koppelt explizit an Kurs 1.                               |
| **Schwerpunkt**  | **Modellwahl** und **Prompting** für **selbst gehostete** (on-prem) Sprachmodelle; Einordnung von **klassischem NLP** (z. B. **spaCy**) und **mehrsprachigen Encodern** (z. B. **mBERT** / Sentence-Transformers) als **Baseline oder Vorverarbeitung**. |
| **Synergie**     | Optional: Ergebnisse (Prompt-Bibliothek, Evaluationsprotokoll, JSON-Schema-Vorschläge) können **Kurs 1** als Spezifikation dienen; **Kurs 2** kann Qualitätskriterien und Nachvollziehbarkeit der Evaluierung prüfen — **kein** Muss für den Kursablauf. |

Die Synergie von Kurs 1 und 2 bleibt in [`zweiter-kurs-und-agentische-ki.md`](./zweiter-kurs-und-agentische-ki.md) beschrieben; Kurs 3 ergänzt das Modell **optional** inhaltlich, ohne denselben Parallelrhythmus zu erzwingen.

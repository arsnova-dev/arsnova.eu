# Screenshot-Uebersicht

Dieser Ordner enthaelt kuratierte Screenshots zu Wortwolken, Stopwoertern und dem Zielbild der semantischen Begriffwolke fuer Kurs 3.

## Ziel und Leselogik

- Die Dateien mit Stopwoertern zeigen den aktuellen lexikalischen Stand auf Basis realer oder skriptgesteuert erzeugter Inhalte.
- Die Dateien mit Eingeblendet zeigen denselben Inhalt, jedoch mit sichtbaren Stopwoertern zum direkten Vergleich.
- Die Dateien mit Zielbild zeigen den konzeptionellen Soll-Zustand fuer Kurs 3: semantische Cluster statt einzelner Tokens.

## Screenshots im Ueberblick

| Datei                                                                                                            | Typ             | Inhalt                                                  | Aussage                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [QA-Word-Cloud-Stopwoerter.png](./QA-Word-Cloud-Stopwoerter.png)                                                 | Ist-Zustand     | Q&A-Wortwolke mit ausgeblendeten Stopwoertern           | Zeigt, wie die aktuelle Wortwolke bei denselben Statistikfragen die fachlich relevanten Begriffe hervorhebt.                                               |
| [QA-Word-Cloud-Stopwoerter-Eingeblendet.png](./QA-Word-Cloud-Stopwoerter-Eingeblendet.png)                       | Vergleich       | Q&A-Wortwolke mit eingeblendeten Stopwoertern           | Macht sichtbar, welche Fragewoerter und Funktionswoerter ohne Filter wieder in der Wolke erscheinen.                                                       |
| [QA-Word-Cloud-Presenter-Kontext.png](./QA-Word-Cloud-Presenter-Kontext.png)                                     | Kontextansicht  | Q&A-Wortwolke in der Presenter-Ansicht                  | Zeigt die verdichtete Darstellung mit Orientierungstext, Gewichtungshinweis und Praesentationsrahmen direkt im Praesentationskontext.                      |
| [QA-Word-Cloud-Host-Kontext.png](./QA-Word-Cloud-Host-Kontext.png)                                               | Kontextansicht  | Q&A-Wortwolke in der Host-Ansicht                       | Zeigt, wie Hosts die gewichtete Wortwolke im laufenden Moderationskontext oeffnen und lesen.                                                               |
| [Quiz-Freitext-Word-Cloud-Stopwoerter.png](./Quiz-Freitext-Word-Cloud-Stopwoerter.png)                           | Ist-Zustand     | Quiz-Freitext-Wortwolke mit ausgeblendeten Stopwoertern | Zeigt die aktuelle lexikalische Verdichtung freier Rueckmeldungen zu zentralen Fachbegriffen.                                                              |
| [Quiz-Freitext-Word-Cloud-Stopwoerter-Eingeblendet.png](./Quiz-Freitext-Word-Cloud-Stopwoerter-Eingeblendet.png) | Vergleich       | Quiz-Freitext-Wortwolke mit eingeblendeten Stopwoertern | Zeigt denselben Datensatz mit sichtbarem sprachlichem Rauschen als Kontrast.                                                                               |
| [Quiz-Freitext-Word-Cloud-Presenter-Kontext.png](./Quiz-Freitext-Word-Cloud-Presenter-Kontext.png)               | Kontextansicht  | Freitext-Wortwolke in der Presenter-Ansicht             | Zeigt die live verdichtete Freitext-Wortwolke im laufenden Unterrichtskontext statt nur als isolierte Karte.                                               |
| [Quiz-Freitext-Word-Cloud-Host-Kontext.png](./Quiz-Freitext-Word-Cloud-Host-Kontext.png)                         | Kontextansicht  | Freitext-Wortwolke in der Host-Ansicht                  | Zeigt die Wortwolke im Steuerkontext der laufenden Freitextfrage inklusive Zusammenfassung und Oeffner.                                                    |
| [QA-Semantische-Begriffwolke-Zielbild.png](./QA-Semantische-Begriffwolke-Zielbild.png)                           | Zielbild Kurs 3 | Semantische Begriffwolke fuer Q&A                       | Gruppiert dieselben Fragen nicht mehr nur nach einzelnen Woertern, sondern nach Themenclustern wie Deskriptive Statistik, Zusammenhaenge und Modellierung. |
| [Quiz-Freitext-Semantische-Begriffwolke-Zielbild.png](./Quiz-Freitext-Semantische-Begriffwolke-Zielbild.png)     | Zielbild Kurs 3 | Semantische Begriffwolke fuer Quiz-Freitext             | Verdichtet dieselben Rueckmeldungen zu didaktisch lesbaren Bedeutungsraeumen mit Themenlabels und Clusterkarten.                                           |

## Empfohlene Verwendung

- Fuer Produktdiskussionen: zuerst den Ist-Zustand ohne Stopwoerter zeigen, dann den Vergleich mit eingeblendeten Stopwoertern und anschliessend das semantische Zielbild.
- Fuer Kurs 3: die beiden Zielbilder als visuelle Leitplanke fuer semantisches Buendeln, Labeling und Evaluationskriterien verwenden.
- Fuer Architektur- oder NLP-Gespraeche: die Zielbilder immer als Konzeptbilder kennzeichnen, nicht als bereits implementierte Produktoberflaechen.

## Herkunft der Dateien

- Die lexikalischen Wortwolken und die neuen Host-/Presenter-Kontextbilder werden ueber [../../apps/frontend/scripts/capture-doc-word-cloud-screenshots.mjs](../../apps/frontend/scripts/capture-doc-word-cloud-screenshots.mjs) erzeugt.
- Die beiden semantischen Zielbilder werden ueber [../../apps/frontend/scripts/capture-doc-semantic-cloud-target-screenshots.mjs](../../apps/frontend/scripts/capture-doc-semantic-cloud-target-screenshots.mjs) gerendert.

## Begriffsabgrenzung

- Lexikalische Wortwolke: gleiche oder aehnliche Tokens werden gezaehlt und gewichtet.
- Stopwort-Filter: haeufige, wenig aussagekraeftige Woerter werden optional ausgeblendet.
- Semantische Begriffwolke: aehnliche Aussagen, Varianten und Paraphrasen werden zu Themenclustern zusammengefuehrt und mit sprechenden Labels versehen.

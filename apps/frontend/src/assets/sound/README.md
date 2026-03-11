# Sound-Assets (Epic 5)

Alle Sound-Effekte und Hintergrundmusik für die App liegen unter **`apps/frontend/src/assets/sound`** und werden als statische Assets gebundelt.

## Struktur

- **`lobby/`** – Hintergrundmusik für Lobby und Countdown-Phase (Story 5.3). Mind. 3 Tracks (z.B. Entspannt, Spannend, Episch).
- **`countdownEnd/`** – Gong/Pfiff beim Session-Ende (`FINISHED`) (Story 5.1).
- **`countdownRunning/`** – Tick-Sounds für die letzten Sekunden des Countdowns (Story 5.1).
- **`connecting/`** – Optional: Sound beim Start einer neuen Frage (`ACTIVE`) (Story 5.1).
- Belohnungssounds (Platz 1–3, Story 5.4) können hier ergänzt werden (z.B. `rewards/`).

## Verwendung im Code

- Pfade relativ zu `assets/` (Angular kopiert `src/assets` ins Build-Output).
- Im Code z.B. `assets/sound/lobby/Song0.mp3` oder per `environment`/Konstante auf den Basis-Pfad verweisen.

## Anforderungen

- Lizenzfreie Dateien (z.B. CC0, eigene Produktion).
- Web Audio API; Autoplay-Policy beachten (erster Nutzer-Input aktiviert Audio-Context).
- Bei `prefers-reduced-motion: reduce` Sounds optional stumm schalten (Story 6.5).

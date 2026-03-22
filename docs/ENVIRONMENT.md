<!-- markdownlint-disable MD013 -->

# Umgebungsvariablen (Referenz)

**Lokal:** Vorlage [`../.env.example`](../.env.example) nach `.env` kopieren und anpassen.  
**Produktion (Docker):** Vorlage [`.env.production.example`](../.env.production.example) → `.env.production`; siehe auch [deployment-debian-root-server.md](deployment-debian-root-server.md).

---

## Backend (Lokal / Standard-Dev)

Variablen, die der Node-Backend-Prozess unter `apps/backend` typischerweise liest:

| Variable                                     | Erforderlich | Standard / Beispiel        | Zweck                                                                                                                                   |
| -------------------------------------------- | ------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                               | ja (für DB)  | siehe `.env.example`       | PostgreSQL-Verbindung (Prisma)                                                                                                          |
| `REDIS_URL`                                  | nein         | `redis://localhost:6379`   | Redis (Pub/Sub, Rate-Limit, Blitzlicht-State)                                                                                           |
| `PORT`                                       | nein         | `3000`                     | HTTP-API (Express + tRPC)                                                                                                               |
| `HOST`                                       | nein         | —                          | In Docker/Compose oft `0.0.0.0` (HTTP-Server); wird auch als Default für den Yjs-Child genutzt, wenn `YJS_WS_HOST` fehlt                |
| `WS_PORT`                                    | nein         | `3001`                     | WebSocket-Server (tRPC-Subscriptions)                                                                                                   |
| `YJS_WS_PORT`                                | nein         | `3002`                     | y-websocket-Relay (Quiz-Sync)                                                                                                           |
| `YJS_WS_HOST`                                | nein         | siehe `HOST` / `127.0.0.1` | Bind-Adresse des Yjs-Childs (`@y/websocket-server`). **Nicht** nur `127.0.0.1` in Docker, sonst scheitert `wss://…/yjs-ws` hinter Nginx |
| `NODE_ENV`                                   | nein         | —                          | `production` u. a. für CORS/Static; `development` für lokale Defaults                                                                   |
| `RATE_LIMIT_SESSION_CODE_ATTEMPTS`           | nein         | `5`                        | Fehlversuche Session-Code pro IP                                                                                                        |
| `RATE_LIMIT_SESSION_CODE_WINDOW_MINUTES`     | nein         | `5`                        | Zeitfenster (Minuten)                                                                                                                   |
| `RATE_LIMIT_SESSION_CODE_LOCKOUT_SECONDS`    | nein         | `60`                       | Sperre nach zu vielen Fehlversuchen                                                                                                     |
| `RATE_LIMIT_VOTE_REQUESTS_PER_SECOND`        | nein         | `1`                        | Vote-Throttling pro IP                                                                                                                  |
| `RATE_LIMIT_SESSION_CREATE_PER_HOUR`         | nein         | `10`                       | Session-Erstellungen pro IP und Stunde                                                                                                  |
| `RATE_LIMIT_SESSION_CREATE_BYPASS_LOCALHOST` | nein         | —                          | Wenn gesetzt: Bypass-Logik für Session-Create-Limit (siehe `rateLimit.ts`)                                                              |
| `ADMIN_SECRET`                               | für `/admin` | —                          | Shared Secret für Admin-Login (Epic 9); in Prod **stark setzen**                                                                        |
| `ADMIN_SESSION_TTL_SECONDS`                  | nein         | `28800` (8 h)              | Admin-Session-TTL                                                                                                                       |
| `ADMIN_LEGAL_HOLD_DEFAULT_DAYS`              | nein         | `30`                       | Default-Tage für Legal-Hold-Angaben (Admin)                                                                                             |

### `JWT_SECRET` (`.env.example`)

In **`.env.example`** und **Docker-/Deploy-Vorlagen** enthalten; im aktuellen **`apps/backend`-Quellcode** ohne direkten Verbrauch. Für **Produktions-Compose** trotzdem einen starken Wert setzen (Konsistenz mit Deploy-Doku), bis ggf. künftige Features ihn nutzen.

---

## Produktion (Auszug)

Zusätzlich zu den Backend-Variablen (angepasste Hosts: `postgres`, `redis` im Netzwerk) siehe [`.env.production.example`](../.env.production.example) für **PostgreSQL-Credentials** und Secrets. Nie echte Secrets in Git committen.

---

## Schnelldiagnose

| Symptom                                                        | Prüfen                                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Prisma-Fehler / keine DB                                       | `DATABASE_URL`, Container `postgres`, `npx prisma db push`                                                       |
| Keine Live-Updates / Rate-Limit seltsam                        | `REDIS_URL`, Container `redis`                                                                                   |
| WebSocket hängt                                                | `WS_PORT` frei, Frontend-Proxy auf gleichen WS-Port                                                              |
| Quiz-Sync zwischen Geräten tot / `wss://…/yjs-ws` schlägt fehl | Container: `HOST=0.0.0.0` oder `YJS_WS_HOST=0.0.0.0`, Nginx `location /yjs-ws` → `127.0.0.1:3002`, Prozess läuft |
| Admin-Login scheitert                                          | `ADMIN_SECRET` gesetzt und mit Eingabe übereinstimmend                                                           |

---

## Verwandte Dokumente

- [onboarding.md](onboarding.md) — Setup-Reihenfolge
- [cursor-context.md](cursor-context.md) — Ports und Stack-Kurzreferenz
- [README.md](../README.md) — `npm run dev`, Docker-Hinweise

**Stand:** 2026-03-20 — bei neuen `process.env`-Lesern diese Tabelle und `.env.example` mitziehen.

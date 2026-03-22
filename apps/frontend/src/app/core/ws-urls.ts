/**
 * WebSocket-URLs für tRPC-Subscriptions und Yjs (Story 0.2, 0.3).
 * Lokale Dev: Port-basiert (3001, 3002). Produktion hinter Nginx: Pfad-basiert (/trpc-ws, /yjs-ws).
 */
function isLocalDevHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function isProductionLike(): boolean {
  if (typeof window === 'undefined') return false;
  const { protocol, hostname } = window.location;
  if (protocol === 'https:') return true;
  return !isLocalDevHostname(hostname);
}

/**
 * Basis-URL für WebSockets (ohne Pfad/Port).
 * z. B. wss://arsnova.eu oder ws://localhost
 */
function wsBaseUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost';
  const { protocol, hostname } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${hostname}`;
}

/** URL für tRPC WebSocket (Subscriptions). */
export function getTrpcWsUrl(): string {
  if (isProductionLike()) {
    return `${wsBaseUrl()}/trpc-ws`;
  }
  return 'ws://127.0.0.1:3001';
}

/** URL für Yjs WebSocket (Quiz Multi-Device-Sync, Story 1.6). */
export function getYjsWsUrl(): string {
  if (isProductionLike()) {
    return `${wsBaseUrl()}/yjs-ws`;
  }
  return 'ws://127.0.0.1:3002';
}

/**
 * WebSocket-URLs für tRPC-Subscriptions und Yjs (Story 0.2, 0.3).
 * Lokale Dev: Port-basiert (3001, 3002) oder über Dev-Proxy (z. B. :4200/trpc-ws).
 * Produktion hinter Nginx: Pfad-basiert (/trpc-ws, /yjs-ws).
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
 * Ports, auf denen `ng serve --proxy-config` bzw. `serve-localized-with-api.mjs`
 * WebSocket-Upgrades an Backend-Port WS_PORT / YJS_WS_PORT weiterreichen.
 * Direkt `ws://127.0.0.1:3001` scheitert, wenn 3001 nicht vom Browser aus erreichbar ist
 * (Docker, nur :4200 exponiert, Firewall).
 */
const LOCAL_WS_PROXY_PORTS = new Set(['4200']);

/** ws(s)://… inkl. Seitenport (für Dev-Proxy und HTTPS auf Nicht-Standard-Port). */
function pageWsOrigin(): string {
  if (typeof window === 'undefined') return 'ws://127.0.0.1';
  const { protocol, hostname, port } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const portPart = port ? `:${port}` : '';
  return `${wsProtocol}//${hostname}${portPart}`;
}

/**
 * Basis-URL für WebSockets (ohne Pfad), für Reverse-Proxy-Pfade (/trpc-ws).
 * Nicht-Standard-Ports der Seite übernehmen (z. B. https://host:8443).
 */
function wsBaseUrl(): string {
  if (typeof window === 'undefined') return 'ws://localhost';
  const { protocol, hostname, port } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const defaultHttp = protocol === 'http:' && (port === '' || port === '80');
  const defaultHttps = protocol === 'https:' && (port === '' || port === '443');
  const portSuffix = !defaultHttp && !defaultHttps && port ? `:${port}` : '';
  return `${wsProtocol}//${hostname}${portSuffix}`;
}

/** URL für tRPC WebSocket (Subscriptions). */
export function getTrpcWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://127.0.0.1:3001';
  const { protocol, hostname, port } = window.location;

  if (LOCAL_WS_PROXY_PORTS.has(port)) {
    return `${pageWsOrigin()}/trpc-ws`;
  }

  /** Node-Bundle: HTTP auf :3000, tRPC-WS separat auf :3001 — ohne Nginx greift kein /trpc-ws auf :3000. */
  if (protocol === 'http:' && port === '3000' && !isLocalDevHostname(hostname)) {
    return `ws://${hostname}:3001`;
  }

  if (isProductionLike()) {
    return `${wsBaseUrl()}/trpc-ws`;
  }

  return 'ws://127.0.0.1:3001';
}

/** URL für Yjs WebSocket (Quiz Multi-Device-Sync, Story 1.6). */
export function getYjsWsUrl(): string {
  if (typeof window === 'undefined') return 'ws://127.0.0.1:3002';
  const { protocol, hostname, port } = window.location;

  if (LOCAL_WS_PROXY_PORTS.has(port)) {
    return `${pageWsOrigin()}/yjs-ws`;
  }

  if (protocol === 'http:' && port === '3000' && !isLocalDevHostname(hostname)) {
    return `ws://${hostname}:3002`;
  }

  if (isProductionLike()) {
    return `${wsBaseUrl()}/yjs-ws`;
  }

  return 'ws://127.0.0.1:3002';
}

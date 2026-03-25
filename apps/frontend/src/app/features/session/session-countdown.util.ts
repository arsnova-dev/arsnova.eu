/**
 * Verbleibende Countdown-Sekunden bis zur Server-Deadline.
 * Host und Vote nutzen dieselbe Formel, damit Beamer und Handys dieselbe Zahl zeigen.
 * `ceil`: volle Sekunde zählt noch, bis die Deadline wirklich erreicht ist (kein Round-Drift zwischen Clients).
 */
export function remainingCountdownSeconds(deadlineMs: number, nowMs = Date.now()): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

/**
 * ARIA-Label für den angezeigten Session-Code.
 * Nutzt dieselbe Übersetzungs-ID wie das Blitzlicht-Teilnehmer-Template (`feedback-vote`).
 */
export function sessionCodeAriaLabel(code: string): string {
  return $localize`:@@feedback.voteSessionCodeAria:Session-Code ${code}:INTERPOLATION:`;
}

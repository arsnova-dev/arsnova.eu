export interface FeedbackOption {
  value: string;
  label: string;
  icon?: string;
}

export const MOOD_OPTIONS: FeedbackOption[] = [
  { value: 'POSITIVE', label: $localize`Gut`, icon: '😊' },
  { value: 'NEUTRAL', label: $localize`Okay`, icon: '😐' },
  { value: 'NEGATIVE', label: $localize`Schlecht`, icon: '😟' },
];

export const YESNO_OPTIONS: FeedbackOption[] = [
  { value: 'YES', label: $localize`Ja`, icon: '👍' },
  { value: 'NO', label: $localize`Nein`, icon: '👎' },
  { value: 'MAYBE', label: $localize`Vielleicht`, icon: '🤷' },
];

export const ABCD_OPTIONS: FeedbackOption[] = [
  { value: 'A', label: $localize`Antwort A` },
  { value: 'B', label: $localize`Antwort B` },
  { value: 'C', label: $localize`Antwort C` },
  { value: 'D', label: $localize`Antwort D` },
];

export function feedbackDisplayLabel(key: string, type: string): string {
  if (type === 'MOOD') {
    const opt = MOOD_OPTIONS.find((o) => o.value === key);
    if (opt?.icon) return opt.icon;
  }
  if (type === 'YESNO') {
    const opt = YESNO_OPTIONS.find((o) => o.value === key);
    if (opt?.icon) return opt.icon;
  }
  return key;
}

export function feedbackTitle(type: string): string {
  switch (type) {
    case 'MOOD': return $localize`Stimmungsbild`;
    case 'YESNO': return $localize`ja · nein · vielleicht`;
    case 'ABCD': return $localize`ABCD-Voting`;
    default: return $localize`Feedback`;
  }
}

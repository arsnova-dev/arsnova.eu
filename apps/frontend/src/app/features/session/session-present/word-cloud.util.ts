export interface WordAggregate {
  word: string;
  count: number;
}

const MIN_WORD_LENGTH = 3;

export const DEFAULT_STOPWORDS = new Set([
  'und',
  'oder',
  'aber',
  'der',
  'die',
  'das',
  'ein',
  'eine',
  'einer',
  'eines',
  'dem',
  'den',
  'des',
  'ist',
  'sind',
  'war',
  'waren',
  'mit',
  'für',
  'bei',
  'von',
  'auf',
  'aus',
  'zum',
  'zur',
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'you',
  'your',
  'ich',
  'wir',
  'ihr',
  'sie',
  'man',
  'nicht',
  'kein',
  'keine',
  'sehr',
  'auch',
]);

export function aggregateWords(
  responses: string[],
  stopwords: Set<string> = DEFAULT_STOPWORDS,
): WordAggregate[] {
  const counts = new Map<string, number>();

  for (const response of responses) {
    const words = tokenize(response);
    for (const word of words) {
      if (word.length < MIN_WORD_LENGTH) continue;
      if (stopwords.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9äöüß-]+/gi, ' ')
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

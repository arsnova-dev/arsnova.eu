import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearFeedbackHostToken,
  getFeedbackHostToken,
  hasFeedbackHostToken,
  normalizeFeedbackCode,
  setFeedbackHostToken,
} from './feedback-host-token';

describe('feedback-host-token', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    clearFeedbackHostToken('ABC123');
  });

  it('normalisiert Codes fuer Speicherung und Lookup', () => {
    setFeedbackHostToken('abc123', 'feedback-token-123');

    expect(normalizeFeedbackCode(' abc123 ')).toBe('ABC123');
    expect(getFeedbackHostToken('ABC123')).toBe('feedback-token-123');
    expect(hasFeedbackHostToken('abc123')).toBe(true);
  });

  it('entfernt gespeicherte Tokens wieder', () => {
    setFeedbackHostToken('ABC123', 'feedback-token-123');
    clearFeedbackHostToken('ABC123');

    expect(getFeedbackHostToken('ABC123')).toBeNull();
    expect(hasFeedbackHostToken('ABC123')).toBe(false);
  });
});

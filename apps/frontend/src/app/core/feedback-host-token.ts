const FEEDBACK_HOST_TOKEN_STORAGE_PREFIX = 'arsnova-feedback-host-token:';
const feedbackHostTokens = new Map<string, string>();
let feedbackHostTokensLoaded = false;

function isBrowser(): boolean {
  return globalThis.window !== undefined;
}

export function normalizeFeedbackCode(sessionCode: string): string {
  return sessionCode.trim().toUpperCase();
}

function getFeedbackHostTokenStorageKey(sessionCode: string): string {
  return `${FEEDBACK_HOST_TOKEN_STORAGE_PREFIX}${normalizeFeedbackCode(sessionCode)}`;
}

function loadFeedbackHostTokensFromSessionStorage(): void {
  if (!isBrowser() || feedbackHostTokensLoaded) {
    return;
  }

  for (let index = 0; index < globalThis.window.sessionStorage.length; index++) {
    const key = globalThis.window.sessionStorage.key(index);
    if (!key?.startsWith(FEEDBACK_HOST_TOKEN_STORAGE_PREFIX)) {
      continue;
    }

    const sessionCode = key.slice(FEEDBACK_HOST_TOKEN_STORAGE_PREFIX.length).trim().toUpperCase();
    const token = globalThis.window.sessionStorage.getItem(key)?.trim();
    if (sessionCode && token) {
      feedbackHostTokens.set(sessionCode, token);
    }
  }

  feedbackHostTokensLoaded = true;
}

export function getFeedbackHostToken(sessionCode: string): string | null {
  loadFeedbackHostTokensFromSessionStorage();
  return feedbackHostTokens.get(normalizeFeedbackCode(sessionCode)) ?? null;
}

export function hasFeedbackHostToken(sessionCode: string): boolean {
  return getFeedbackHostToken(sessionCode) !== null;
}

export function setFeedbackHostToken(sessionCode: string, token: string | null): void {
  const normalizedSessionCode = normalizeFeedbackCode(sessionCode);
  const normalizedToken = token?.trim() || null;

  feedbackHostTokensLoaded = true;
  if (normalizedToken) {
    feedbackHostTokens.set(normalizedSessionCode, normalizedToken);
  } else {
    feedbackHostTokens.delete(normalizedSessionCode);
  }

  if (!isBrowser()) return;
  if (normalizedToken) {
    globalThis.window.sessionStorage.setItem(
      getFeedbackHostTokenStorageKey(normalizedSessionCode),
      normalizedToken,
    );
  } else {
    globalThis.window.sessionStorage.removeItem(
      getFeedbackHostTokenStorageKey(normalizedSessionCode),
    );
  }
}

export function clearFeedbackHostToken(sessionCode: string): void {
  setFeedbackHostToken(sessionCode, null);
}

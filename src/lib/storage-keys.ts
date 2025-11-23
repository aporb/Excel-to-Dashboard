/**
 * Centralized localStorage key constants
 * Prevents typos and ensures consistency across the codebase
 */
export const STORAGE_KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  OPENAI_API_KEY: 'openai_api_key',
  NOTIFICATION_PREFERENCES: 'notification-preferences',
  THEME: 'theme',
  IMPROVEMENT_HISTORY_PREFIX: 'improvement-history-',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Helper function to generate improvement history key for a session
 */
export function getImprovementHistoryKey(sessionId: string): string {
  return `${STORAGE_KEYS.IMPROVEMENT_HISTORY_PREFIX}${sessionId}`;
}

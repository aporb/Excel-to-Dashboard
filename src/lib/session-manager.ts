import localforage from 'localforage';
import { ChartSuggestion } from './openai-ai';
import { AlertRule } from './alert-engine';

export interface DashboardSession {
  id: string;
  uploadedData: Record<string, any[]>;
  processedData: Record<string, any>[];
  columnMapping: Record<string, string>;
  chartSuggestion?: ChartSuggestion;
  alertRules: AlertRule[];
  lastUpdated: string;
  selectedSheet?: string;
}

class SessionManager {
  private store = localforage.createInstance({
    name: 'excel-to-dashboard',
    storeName: 'sessions',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  });

  async saveSession(session: DashboardSession): Promise<void> {
    try {
      session.lastUpdated = new Date().toISOString();
      await this.store.setItem(session.id, session);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Unable to save session data');
    }
  }

  async loadSession(sessionId: string): Promise<DashboardSession | null> {
    try {
      const session = await this.store.getItem(sessionId) as DashboardSession | null;
      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  async createSession(): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session: DashboardSession = {
      id: sessionId,
      uploadedData: {},
      processedData: [],
      columnMapping: {},
      alertRules: [],
      lastUpdated: new Date().toISOString()
    };

    await this.saveSession(session);
    return sessionId;
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.store.removeItem(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  async clearAllSessions(): Promise<void> {
    try {
      await this.store.clear();
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }

  async getAllSessionIds(): Promise<string[]> {
    try {
      const keys = await this.store.keys();
      return keys;
    } catch (error) {
      console.error('Failed to get session keys:', error);
      return [];
    }
  }

  // Utility method to check storage quota
  async getStorageInfo(): Promise<{ used: number; available: number } | null> {
    try {
      // Estimate storage usage (approximate)
      const keys = await this.getAllSessionIds();
      let totalSize = 0;

      for (const key of keys) {
        const session = await this.loadSession(key);
        if (session) {
          const sessionSize = JSON.stringify(session).length;
          totalSize += sessionSize;
        }
      }

      // localStorage has ~5-10MB limit, IndexedDB has more
      const estimatedLimit = 50 * 1024 * 1024; // 50MB estimate

      return {
        used: totalSize,
        available: Math.max(0, estimatedLimit - totalSize)
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

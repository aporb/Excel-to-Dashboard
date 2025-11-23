import localforage from 'localforage';
import { ChartSuggestion } from './openai-ai';
import { AlertRule } from './alert-engine';
import { DashboardConfig, createEmptyDashboardConfig, ChartConfig } from './dashboard-types';
import { DashboardVariation } from './dashboard-variations';
import { ImprovementRecord } from './improvement-history';

export interface DashboardSession {
  id: string;
  uploadedData: Record<string, any[]>;
  processedData: Record<string, any>[];
  columnMapping: Record<string, string>;

  // DEPRECATED: Keep for backward compatibility with old sessions
  chartSuggestion?: ChartSuggestion;

  // NEW: Multi-chart dashboard config
  dashboardConfig?: DashboardConfig;

  // PHASE 3: Dashboard variations (P9)
  dashboardVariations?: DashboardVariation[];
  selectedVariationIndex?: number;

  // PHASE 3: Improvement history (P10)
  improvementHistory?: ImprovementRecord[];

  alertRules: AlertRule[];
  lastUpdated: string;
  selectedSheet?: string;

  // NEW: Optional metadata
  name?: string;
  description?: string;
  tags?: string[];
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

      if (session) {
        // MIGRATION: If old session has chartSuggestion but no dashboardConfig
        if (session.chartSuggestion && !session.dashboardConfig) {
          session.dashboardConfig = this.migrateChartSuggestionToConfig(session.chartSuggestion);
        }

        // Ensure dashboardConfig exists
        if (!session.dashboardConfig) {
          session.dashboardConfig = createEmptyDashboardConfig();
        }
      }

      return session;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  // NEW: Migration helper
  private migrateChartSuggestionToConfig(suggestion: ChartSuggestion): DashboardConfig {
    const config = createEmptyDashboardConfig();

    // Create single chart from old suggestion
    const chartId = crypto.randomUUID();
    const chart: ChartConfig = {
      id: chartId,
      type: suggestion.chartType,
      title: `${suggestion.chartType.charAt(0).toUpperCase() + suggestion.chartType.slice(1)} Chart`,
      xField: suggestion.xKey,
      yField: suggestion.yKey,
      span: 12, // Full width
    };
    config.charts.push(chart);

    // Create default layout
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: [chartId],
      span: [12],
    });

    return config;
  }

  // NEW: Load the most recent session
  async loadLatestSession(): Promise<DashboardSession | null> {
    try {
      const sessionIds = await this.getAllSessionIds();
      if (sessionIds.length === 0) return null;

      // Load all sessions and find the most recent one
      const sessions: DashboardSession[] = [];
      for (const id of sessionIds) {
        const session = await this.loadSession(id);
        if (session) sessions.push(session);
      }

      if (sessions.length === 0) return null;

      // Sort by lastUpdated and return the most recent
      sessions.sort((a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      return sessions[0];
    } catch (error) {
      console.error('Failed to load latest session:', error);
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

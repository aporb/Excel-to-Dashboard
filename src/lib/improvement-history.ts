import { ChartConfig } from './dashboard-types';
import { getImprovementHistoryKey } from './storage-keys';

/**
 * Improvement History Tracker
 * Tracks all AI-powered chart improvements with undo capability
 */

export interface ImprovementRecord {
  id: string;
  chartId: string;
  timestamp: string;
  userRequest: string;
  beforeConfig: ChartConfig;
  afterConfig: ChartConfig;
  changes: string[];
  reasoning: string;
}

export class ImprovementHistory {
  private records: ImprovementRecord[] = [];
  private readonly maxRecords: number = 50; // Prevent unlimited growth

  /**
   * Add a new improvement record
   */
  add(record: Omit<ImprovementRecord, 'id' | 'timestamp'>): ImprovementRecord {
    const newRecord: ImprovementRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.records.unshift(newRecord); // Add to beginning

    // Trim to max records
    if (this.records.length > this.maxRecords) {
      this.records = this.records.slice(0, this.maxRecords);
    }

    return newRecord;
  }

  /**
   * Get all records
   */
  getAll(): ImprovementRecord[] {
    return [...this.records];
  }

  /**
   * Get records for a specific chart
   */
  getByChartId(chartId: string): ImprovementRecord[] {
    return this.records.filter(r => r.chartId === chartId);
  }

  /**
   * Get the most recent record for a chart
   */
  getLatestForChart(chartId: string): ImprovementRecord | undefined {
    return this.records.find(r => r.chartId === chartId);
  }

  /**
   * Get a specific record by ID
   */
  getById(recordId: string): ImprovementRecord | undefined {
    return this.records.find(r => r.id === recordId);
  }

  /**
   * Undo a specific improvement (returns the before config)
   */
  undo(recordId: string): ChartConfig | null {
    const record = this.records.find(r => r.id === recordId);
    if (!record) return null;

    // Remove this record and all subsequent records for the same chart
    const recordIndex = this.records.indexOf(record);
    this.records = this.records.filter((r, i) => {
      if (r.chartId !== record.chartId) return true; // Keep other charts
      return i > recordIndex; // Keep only records after this one
    });

    return record.beforeConfig;
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.records = [];
  }

  /**
   * Clear records for a specific chart
   */
  clearForChart(chartId: string): void {
    this.records = this.records.filter(r => r.chartId !== chartId);
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalImprovements: number;
    uniqueCharts: number;
    mostImprovedChart: { chartId: string; count: number } | null;
  } {
    const totalImprovements = this.records.length;
    const uniqueCharts = new Set(this.records.map(r => r.chartId)).size;

    // Find most improved chart
    const chartCounts = this.records.reduce((acc, record) => {
      acc[record.chartId] = (acc[record.chartId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostImproved = Object.entries(chartCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      totalImprovements,
      uniqueCharts,
      mostImprovedChart: mostImproved
        ? { chartId: mostImproved[0], count: mostImproved[1] }
        : null,
    };
  }

  /**
   * Export history to JSON
   */
  toJSON(): string {
    return JSON.stringify(this.records, null, 2);
  }

  /**
   * Import history from JSON
   */
  fromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        this.records = data;
      }
    } catch (error) {
      console.error('Failed to import history:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(sessionId: string): void {
    try {
      const key = getImprovementHistoryKey(sessionId);
      const stored = localStorage.getItem(key);
      if (stored) {
        this.fromJSON(stored);
      }
    } catch (error) {
      console.error('Failed to load history from storage:', error);
    }
  }

  /**
   * Save to localStorage
   */
  saveToStorage(sessionId: string): void {
    try {
      const key = getImprovementHistoryKey(sessionId);
      localStorage.setItem(key, this.toJSON());
    } catch (error) {
      console.error('Failed to save history to storage:', error);
    }
  }

  /**
   * Get human-readable summary of a record
   */
  static getSummary(record: ImprovementRecord): string {
    const date = new Date(record.timestamp);
    const timeAgo = getTimeAgo(date);

    return `${timeAgo}: "${record.userRequest}" - ${record.changes.length} change(s)`;
  }
}

/**
 * Helper function to get human-readable time difference
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Global history instance (can be used across components)
 */
export const improvementHistory = new ImprovementHistory();

/**
 * KPI Calculator
 * Calculates key performance indicators and metrics from data
 */

import { KPIExpression, FilterExpression, AggregationType } from './dashboard-types';

// ============================================================================
// NEW: KPI CALCULATION ENGINE for DashboardConfig
// ============================================================================

export function calculateKPI(
  expression: KPIExpression,
  data: Record<string, any>[]
): number {
  // Apply filter if present
  let filteredData = data;
  if (expression.filter) {
    filteredData = data.filter(row => evaluateFilter(row, expression.filter!));
  }

  // Extract field values
  const values = filteredData
    .map(row => row[expression.field])
    .filter(v => v != null && v !== '' && !isNaN(Number(v)))
    .map(Number);

  if (values.length === 0) return 0;

  // Apply aggregation
  switch (expression.aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);

    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;

    case 'min':
      return Math.min(...values);

    case 'max':
      return Math.max(...values);

    case 'count':
      return filteredData.length;

    case 'countDistinct':
      return new Set(values).size;

    default:
      return 0;
  }
}

export function evaluateFilter(
  row: Record<string, any>,
  filter: FilterExpression
): boolean {
  const fieldValue = row[filter.field];

  switch (filter.operator) {
    case '==':
      return fieldValue === filter.value;

    case '!=':
      return fieldValue !== filter.value;

    case '>':
      return Number(fieldValue) > Number(filter.value);

    case '<':
      return Number(fieldValue) < Number(filter.value);

    case '>=':
      return Number(fieldValue) >= Number(filter.value);

    case '<=':
      return Number(fieldValue) <= Number(filter.value);

    case 'in':
      return Array.isArray(filter.value) && filter.value.includes(fieldValue);

    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());

    case 'between':
      if (Array.isArray(filter.value) && filter.value.length === 2) {
        const numValue = Number(fieldValue);
        return numValue >= filter.value[0] && numValue <= filter.value[1];
      }
      return false;

    default:
      return true;
  }
}

export function formatKPIValue(
  value: number,
  format: 'number' | 'currency' | 'percentage'
): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;

    case 'number':
    default:
      if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
      }
      return value.toFixed(0);
  }
}

// ============================================================================
// LEGACY: Original KPIMetric interface and KPICalculator class
// ============================================================================

export interface KPIMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  formatted: string;
}

export interface KPISummary {
  totalRecords: number;
  totalColumns: number;
  dataQuality: number; // 0-100
  lastUpdated: string;
  keyMetrics: KPIMetric[];
}

export class KPICalculator {
  /**
   * Calculate data quality percentage
   * Based on non-null values and valid data types
   */
  static calculateDataQuality(data: Record<string, any>[]): number {
    if (data.length === 0) return 0;

    let totalCells = 0;
    let validCells = 0;

    data.forEach(row => {
      Object.values(row).forEach(value => {
        totalCells++;
        if (value !== null && value !== undefined && value !== '') {
          validCells++;
        }
      });
    });

    return totalCells > 0 ? Math.round((validCells / totalCells) * 100) : 0;
  }

  /**
   * Calculate trend for a numeric column
   * Compares first half vs second half of data
   */
  static calculateTrend(
    data: Record<string, any>[],
    columnName: string
  ): { trend: 'up' | 'down' | 'stable'; percent: number } {
    const values = data
      .map(d => {
        const val = d[columnName];
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/[,$%]/g, ''));
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      })
      .filter(v => v !== null) as number[];

    if (values.length < 2) {
      return { trend: 'stable', percent: 0 };
    }

    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const percentChange = firstAvg !== 0 ? Math.abs((change / firstAvg) * 100) : 0;

    if (Math.abs(change) < firstAvg * 0.05) {
      return { trend: 'stable', percent: 0 };
    }

    return {
      trend: change > 0 ? 'up' : 'down',
      percent: Math.round(percentChange)
    };
  }

  /**
   * Format number for display
   */
  static formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  }

  /**
   * Calculate all KPIs for a dataset
   */
  static calculateKPIs(
    data: Record<string, any>[],
    columnMapping: Record<string, string>
  ): KPISummary {
    // Get numeric columns
    const numericColumns = Object.entries(columnMapping)
      .filter(([_, type]) => type === 'number')
      .map(([col]) => col);

    // Calculate key metrics
    const keyMetrics: KPIMetric[] = numericColumns.slice(0, 4).map(col => {
      const values = data
        .map(d => {
          const val = d[col];
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const parsed = parseFloat(val.replace(/[,$%]/g, ''));
            return isNaN(parsed) ? null : parsed;
          }
          return null;
        })
        .filter(v => v !== null) as number[];

      const sum = values.reduce((a, b) => a + b, 0);
      const { trend, percent } = this.calculateTrend(data, col);

      return {
        name: col,
        value: sum,
        trend,
        trendPercent: percent,
        formatted: this.formatNumber(sum)
      };
    });

    return {
      totalRecords: data.length,
      totalColumns: Object.keys(data[0] || {}).length,
      dataQuality: this.calculateDataQuality(data),
      lastUpdated: new Date().toISOString(),
      keyMetrics
    };
  }

  /**
   * Calculate summary statistics for a column
   */
  static calculateColumnStats(values: number[]): {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  } {
    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { min, max, mean, median, stdDev };
  }

  /**
   * Get color for trend indicator
   */
  static getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '#10b981'; // Green
      case 'down':
        return '#ef4444'; // Red
      case 'stable':
        return '#6b7280'; // Gray
    }
  }

  /**
   * Get trend icon
   */
  static getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
    }
  }
}

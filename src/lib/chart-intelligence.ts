/**
 * Chart Intelligence System
 * Analyzes data patterns and recommends optimal chart types
 * Uses data science approach to understand data characteristics
 */

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface DataAnalysis {
  xType: 'date' | 'number' | 'category' | 'unknown';
  yType: 'number' | 'category' | 'unknown';
  dataSize: number;
  yDistribution: 'normal' | 'skewed' | 'bimodal' | 'uniform';
  temporalTrend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  volatility: number; // 0-1, higher = more volatile
  uniqueXValues: number;
  yRange: number;
  yMean: number;
  yStdDev: number;
}

export class ChartIntelligence {
  /**
   * Infer column type from sample values
   */
  static inferColumnType(values: any[]): 'date' | 'number' | 'category' | 'unknown' {
    if (!values || values.length === 0) return 'unknown';

    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    if (nonNullValues.length === 0) return 'unknown';

    // Check for dates
    const dateCount = nonNullValues.filter(v => {
      if (v instanceof Date) return true;
      if (typeof v === 'string') {
        const parsed = new Date(v);
        return !isNaN(parsed.getTime());
      }
      return false;
    }).length;

    if (dateCount / nonNullValues.length > 0.8) {
      return 'date';
    }

    // Check for numbers
    const numberCount = nonNullValues.filter(v => {
      if (typeof v === 'number') return true;
      if (typeof v === 'string') {
        const parsed = parseFloat(v.replace(/[,$%]/g, ''));
        return !isNaN(parsed);
      }
      return false;
    }).length;

    if (numberCount / nonNullValues.length > 0.8) {
      return 'number';
    }

    // Default to category
    return 'category';
  }

  /**
   * Analyze distribution of numeric values
   */
  static analyzeDistribution(values: number[]): 'normal' | 'skewed' | 'bimodal' | 'uniform' {
    if (values.length < 3) return 'uniform';

    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q2 = sorted[Math.floor(sorted.length * 0.5)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    // Check for skewness
    const iqr = q3 - q1;
    const skewness = (q3 + q1 - 2 * q2) / iqr;

    if (Math.abs(skewness) > 0.5) {
      return 'skewed';
    }

    // Check for bimodal (simplified)
    const histogram = this.createHistogram(values, 10);
    const peaks = histogram.filter((v, i) => v > histogram[i - 1] && v > histogram[i + 1]).length;

    if (peaks >= 2) {
      return 'bimodal';
    }

    return 'normal';
  }

  /**
   * Detect trend in time series data
   */
  static detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (values.length < 2) return 'stable';

    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const volatility = Math.sqrt(
      changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length
    );

    // High volatility
    if (volatility > Math.abs(avgChange) * 2) {
      return 'volatile';
    }

    // Increasing trend
    if (avgChange > 0) {
      return 'increasing';
    }

    // Decreasing trend
    if (avgChange < 0) {
      return 'decreasing';
    }

    return 'stable';
  }

  /**
   * Calculate volatility coefficient (0-1)
   */
  static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (normalized volatility)
    return mean !== 0 ? Math.min(stdDev / Math.abs(mean), 1) : 0;
  }

  /**
   * Comprehensive data analysis
   */
  static analyzeDataPattern(
    data: Record<string, any>[],
    xKey: string,
    yKey: string
  ): DataAnalysis {
    const xValues = data.map(d => d[xKey]).filter(v => v !== null && v !== undefined);
    const yValues = data
      .map(d => {
        const val = d[yKey];
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/[,$%]/g, ''));
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      })
      .filter(v => v !== null) as number[];

    const xType = this.inferColumnType(xValues);
    const yType: 'number' | 'category' | 'unknown' = 'number'; // Y-axis is always numeric for charts

    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    const yVariance = yValues.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0) / yValues.length;
    const yStdDev = Math.sqrt(yVariance);
    const yRange = Math.max(...yValues) - Math.min(...yValues);

    return {
      xType,
      yType,
      dataSize: data.length,
      yDistribution: this.analyzeDistribution(yValues),
      temporalTrend: this.detectTrend(yValues),
      volatility: this.calculateVolatility(yValues),
      uniqueXValues: new Set(xValues).size,
      yRange,
      yMean,
      yStdDev
    };
  }

  /**
   * Recommend optimal chart type based on data analysis
   */
  static recommendChartType(analysis: DataAnalysis): ChartType {
    // Temporal data (dates on X-axis)
    if (analysis.xType === 'date') {
      // High volatility → Area chart to show magnitude
      if (analysis.volatility > 0.5) {
        return 'area';
      }
      // Stable trend → Line chart
      return 'line';
    }

    // Categorical data on X-axis
    if (analysis.xType === 'category') {
      // Few categories (≤5) → Pie chart
      if (analysis.uniqueXValues <= 5) {
        return 'pie';
      }
      // Many categories → Bar chart
      return 'bar';
    }

    // Numeric data on X-axis
    if (analysis.xType === 'number') {
      // Continuous relationship → Line or Area
      if (analysis.volatility > 0.5) {
        return 'area';
      }
      return 'line';
    }

    // Default fallback
    return 'line';
  }

  /**
   * Get reasoning for chart recommendation
   */
  static getRecommendationReasoning(analysis: DataAnalysis, chartType: ChartType): string {
    const reasons: string[] = [];

    if (analysis.xType === 'date') {
      reasons.push('Temporal data detected on X-axis');
      if (analysis.volatility > 0.5) {
        reasons.push(`High volatility (${(analysis.volatility * 100).toFixed(0)}%) suggests area chart to show magnitude`);
      } else {
        reasons.push('Stable trend suggests line chart for clarity');
      }
    } else if (analysis.xType === 'category') {
      reasons.push('Categorical data detected on X-axis');
      if (analysis.uniqueXValues <= 5) {
        reasons.push(`Few categories (${analysis.uniqueXValues}) make pie chart effective`);
      } else {
        reasons.push(`Multiple categories (${analysis.uniqueXValues}) suit bar chart for comparison`);
      }
    }

    reasons.push(`Dataset size: ${analysis.dataSize} records`);
    reasons.push(`Y-axis distribution: ${analysis.yDistribution}`);

    return reasons.join('. ');
  }

  /**
   * Helper: Create histogram for distribution analysis
   */
  private static createHistogram(values: number[], bins: number): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;

    const histogram = new Array(bins).fill(0);

    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });

    return histogram;
  }
}

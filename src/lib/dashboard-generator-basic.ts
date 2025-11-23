import { DashboardConfig, ChartConfig, KPIConfig, ChartType } from './dashboard-types';
import { ChartIntelligence } from './chart-intelligence';

/**
 * Basic Dashboard Generator (AI-Free Fallback)
 *
 * Creates a simple dashboard with KPIs and charts using data analysis.
 * This generator NEVER calls AI APIs - it uses pure data pattern detection.
 *
 * Strategy:
 * - Generates 2-3 KPIs from numeric fields
 * - Creates 1-2 charts based on data structure analysis
 * - Uses ChartIntelligence for chart type selection
 *
 * @param data - The processed dataset
 * @param columnMapping - Column name to type mapping
 * @returns Promise<DashboardConfig> - Always succeeds with valid config
 */
export async function generateBasicDashboard(
  data: Record<string, any>[],
  columnMapping: Record<string, string>
): Promise<DashboardConfig> {
  const config: DashboardConfig = {
    id: crypto.randomUUID(),
    version: '1.0',
    kpis: [],
    charts: [],
    layout: {
      type: 'grid',
      columns: 12,
      rows: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Categorize columns by type
  const numericColumns = Object.entries(columnMapping)
    .filter(([_, type]) => type === 'number')
    .map(([col, _]) => col);

  const dateColumns = Object.entries(columnMapping)
    .filter(([_, type]) => type === 'date')
    .map(([col, _]) => col);

  const categoryColumns = Object.entries(columnMapping)
    .filter(([_, type]) => type === 'string')
    .map(([col, _]) => col);

  const allColumns = Object.keys(data[0] || {});

  // ============================================================================
  // GENERATE KPIs
  // ============================================================================

  // KPI 1: Total Records (always useful)
  const totalRecordsKPI: KPIConfig = {
    id: crypto.randomUUID(),
    title: 'Total Records',
    description: 'Total number of data rows',
    expression: {
      aggregation: 'count',
      field: allColumns[0] || 'id',
    },
    format: 'number',
    icon: 'Database',
    span: 6,
  };
  config.kpis.push(totalRecordsKPI);

  // KPI 2: Sum or Average of first numeric column
  if (numericColumns.length > 0) {
    const firstNumeric = numericColumns[0];
    const sumKPI: KPIConfig = {
      id: crypto.randomUUID(),
      title: `Total ${formatFieldName(firstNumeric)}`,
      description: `Sum of all ${firstNumeric} values`,
      expression: {
        aggregation: 'sum',
        field: firstNumeric,
      },
      format: detectFormat(firstNumeric),
      icon: 'TrendingUp',
      span: 6,
    };
    config.kpis.push(sumKPI);
  }

  // KPI 3: Additional numeric metric if available
  if (numericColumns.length > 1) {
    const secondNumeric = numericColumns[1];
    const avgKPI: KPIConfig = {
      id: crypto.randomUUID(),
      title: `Average ${formatFieldName(secondNumeric)}`,
      description: `Average ${secondNumeric} value`,
      expression: {
        aggregation: 'avg',
        field: secondNumeric,
      },
      format: detectFormat(secondNumeric),
      icon: 'Activity',
      span: 6,
    };
    config.kpis.push(avgKPI);
  }

  // ============================================================================
  // GENERATE CHARTS
  // ============================================================================

  // Chart 1: Time-series or primary visualization
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    // Time-series chart
    const chartType = ChartIntelligence.selectBestChart(data, allColumns) as ChartType;
    const chart: ChartConfig = {
      id: crypto.randomUUID(),
      type: chartType,
      title: `${formatFieldName(numericColumns[0])} Over Time`,
      description: `Trend of ${numericColumns[0]} across ${dateColumns[0]}`,
      xField: dateColumns[0],
      yField: numericColumns[0],
      span: 12,
    };
    config.charts.push(chart);
  } else if (categoryColumns.length > 0 && numericColumns.length > 0) {
    // Categorical comparison
    const chart: ChartConfig = {
      id: crypto.randomUUID(),
      type: 'bar',
      title: `${formatFieldName(numericColumns[0])} by ${formatFieldName(categoryColumns[0])}`,
      description: `Comparison of ${numericColumns[0]} across ${categoryColumns[0]}`,
      xField: categoryColumns[0],
      yField: numericColumns[0],
      span: 12,
    };
    config.charts.push(chart);
  } else if (numericColumns.length >= 2) {
    // Two numeric columns - scatter or comparison
    const chart: ChartConfig = {
      id: crypto.randomUUID(),
      type: 'bar',
      title: `${formatFieldName(numericColumns[0])} vs ${formatFieldName(numericColumns[1])}`,
      description: `Comparison of two metrics`,
      xField: allColumns[0], // Use first column as categories
      yField: numericColumns[0],
      span: 12,
    };
    config.charts.push(chart);
  } else if (allColumns.length >= 2) {
    // Fallback: use first two columns
    const chartType = ChartIntelligence.selectBestChart(data, allColumns) as ChartType;
    const chart: ChartConfig = {
      id: crypto.randomUUID(),
      type: chartType,
      title: 'Data Visualization',
      description: `Overview of ${allColumns[0]} and ${allColumns[1]}`,
      xField: allColumns[0],
      yField: allColumns[1],
      span: 12,
    };
    config.charts.push(chart);
  }

  // Chart 2: Secondary visualization if enough data
  if (categoryColumns.length > 0 && numericColumns.length > 1) {
    const chart: ChartConfig = {
      id: crypto.randomUUID(),
      type: 'bar',
      title: `${formatFieldName(numericColumns[1])} by ${formatFieldName(categoryColumns[0])}`,
      description: `Secondary metric breakdown`,
      xField: categoryColumns[0],
      yField: numericColumns[1],
      span: 12,
    };
    config.charts.push(chart);
  } else if (dateColumns.length > 0 && numericColumns.length > 1) {
    const chart: ChartConfig = {
      id: crypto.randomUUID(),
      type: 'area',
      title: `${formatFieldName(numericColumns[1])} Trend`,
      description: `Time-series view of ${numericColumns[1]}`,
      xField: dateColumns[0],
      yField: numericColumns[1],
      span: 12,
    };
    config.charts.push(chart);
  }

  // ============================================================================
  // BUILD LAYOUT
  // ============================================================================

  // Row 1: KPIs (evenly distributed)
  if (config.kpis.length > 0) {
    const kpiSpan = Math.floor(12 / config.kpis.length);
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: config.kpis.map(k => k.id),
      span: config.kpis.map(() => kpiSpan),
    });
  }

  // Rows 2+: Charts (one per row for clarity)
  config.charts.forEach(chart => {
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: [chart.id],
      span: [12],
    });
  });

  return config;
}

/**
 * Helper: Format field names for display
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Helper: Detect appropriate format for numeric fields
 */
function detectFormat(fieldName: string): 'number' | 'currency' | 'percentage' {
  const lower = fieldName.toLowerCase();

  if (lower.includes('price') || lower.includes('revenue') ||
      lower.includes('cost') || lower.includes('amount') ||
      lower.includes('salary') || lower.includes('dollar')) {
    return 'currency';
  }

  if (lower.includes('percent') || lower.includes('rate') ||
      lower.includes('ratio')) {
    return 'percentage';
  }

  return 'number';
}

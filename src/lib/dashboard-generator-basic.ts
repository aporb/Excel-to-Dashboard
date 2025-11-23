import { DashboardConfig, ChartConfig, KPIConfig } from './dashboard-types';
import { suggestChart, ChartSuggestion } from './gemini-ai';

/**
 * TEMPORARY: Basic dashboard generator
 * Creates simple 2-chart + 2-KPI layout
 * Will be replaced by AI-powered generator in P4
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

  // Create 2 default KPIs
  const totalRecordsKPI: KPIConfig = {
    id: crypto.randomUUID(),
    title: 'Total Records',
    description: 'Total number of data rows',
    expression: {
      aggregation: 'count',
      field: Object.keys(data[0])[0], // Use first column
    },
    format: 'number',
    icon: 'Database',
    span: 6,
  };

  const numericColumns = Object.entries(columnMapping)
    .filter(([_, type]) => type === 'number')
    .map(([col, _]) => col);

  if (numericColumns.length > 0) {
    const sumKPI: KPIConfig = {
      id: crypto.randomUUID(),
      title: `Total ${numericColumns[0]}`,
      description: `Sum of all ${numericColumns[0]} values`,
      expression: {
        aggregation: 'sum',
        field: numericColumns[0],
      },
      format: 'number',
      icon: 'TrendingUp',
      span: 6,
    };
    config.kpis.push(sumKPI);
  }

  config.kpis.push(totalRecordsKPI);

  // Get AI suggestion for first chart
  try {
    const suggestion = await suggestChart(data);

    const chart1: ChartConfig = {
      id: crypto.randomUUID(),
      type: suggestion.chartType,
      title: `${suggestion.chartType.charAt(0).toUpperCase() + suggestion.chartType.slice(1)} Chart`,
      xField: suggestion.xKey,
      yField: suggestion.yKey,
      span: 12,
    };
    config.charts.push(chart1);
  } catch (error) {
    console.error('AI suggestion failed, using fallback', error);
  }

  // Create layout
  // Row 1: KPIs
  if (config.kpis.length > 0) {
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: config.kpis.map(k => k.id),
      span: config.kpis.map(k => k.span || 6),
    });
  }

  // Row 2: Charts
  if (config.charts.length > 0) {
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: config.charts.map(c => c.id),
      span: config.charts.map(c => c.span || 12),
    });
  }

  return config;
}

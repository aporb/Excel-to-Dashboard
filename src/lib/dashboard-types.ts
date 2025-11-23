import { z } from 'zod';

// ============================================================================
// AI CHART SUGGESTION (Provider-agnostic)
// ============================================================================
// @deprecated This interface is from the old single-chart generation system.
//
// MIGRATION PATH:
// - Old System (Method 1): Used ChartSuggestion via suggestChart()
// - New System (Method 2/3): Uses DashboardConfig via generateDashboard()
//
// This is kept for backward compatibility with old sessions that used
// the single-chart suggestion format. New code should use DashboardConfig.
//
// See: /src/lib/dashboard-generator.ts for the unified approach
// ============================================================================

export interface ChartSuggestion {
  chartType: 'line' | 'bar' | 'pie' | 'area';
  xKey: string;
  yKey: string;
  reasoning?: string;
}

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

// Canonical ChartType definition - matches implemented chart components
// Only include types that have corresponding widget implementations in src/components/charts/
export const ChartTypeSchema = z.enum(['line', 'bar', 'area', 'pie']);
export type ChartType = z.infer<typeof ChartTypeSchema>;

export interface ChartConfig {
  id: string;                        // Unique identifier (UUID)
  type: ChartType;
  title: string;
  description?: string;

  // Data mapping
  xField: string;                    // Column name for X-axis
  yField: string;                    // Column name for Y-axis
  groupBy?: string;                  // Optional grouping column

  // Filtering (future)
  filters?: FilterExpression[];

  // Sorting
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };

  // Display options
  limit?: number;                    // Max data points
  colors?: string[];                 // Custom color palette

  // Interactions (future)
  interactions?: ChartInteraction[];

  // Layout hints
  span?: number;                     // Grid column span (1-12)
  height?: number;                   // Height in grid units
}

export interface ChartInteraction {
  type: 'hover' | 'click' | 'crossfilter' | 'drilldown';
  action: string;
}

// ============================================================================
// KPI CONFIGURATION
// ============================================================================

export const AggregationTypeSchema = z.enum([
  'sum', 'avg', 'min', 'max', 'count', 'countDistinct'
]);
export type AggregationType = z.infer<typeof AggregationTypeSchema>;

export interface KPIExpression {
  aggregation: AggregationType;
  field: string;
  filter?: FilterExpression;
}

export interface KPIConfig {
  id: string;
  title: string;
  description?: string;
  expression: KPIExpression;
  format: 'number' | 'currency' | 'percentage';
  icon?: string;                     // Lucide icon name

  // Comparison (future)
  comparison?: {
    type: 'previous_period' | 'target';
    value: number;
    label?: string;
  };

  // Layout hints
  span?: number;                     // Grid column span
}

// ============================================================================
// FILTERS (Placeholder for future)
// ============================================================================

export interface FilterExpression {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains' | 'between';
  value: any;
}

export interface FilterConfig {
  id: string;
  type: 'dateRange' | 'category' | 'numericRange';
  field: string;
  label: string;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
}

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

export interface LayoutRow {
  id: string;
  widgets: string[];                 // Widget IDs (KPI or Chart)
  span: number[];                    // Column spans for each widget
  height?: number;                   // Row height in pixels
}

export interface LayoutConfig {
  type: 'grid' | 'flex';
  columns: number;                   // Default: 12
  rows: LayoutRow[];
}

// ============================================================================
// DASHBOARD CONFIGURATION (Main Interface)
// ============================================================================

export interface DashboardConfig {
  id: string;
  name?: string;
  description?: string;
  version: string;                   // Config schema version

  // Widgets
  kpis: KPIConfig[];
  charts: ChartConfig[];
  filters?: FilterConfig[];          // Future: Global filters

  // Layout
  layout: LayoutConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ZOD SCHEMAS (Validation)
// ============================================================================

export const KPIExpressionSchema = z.object({
  aggregation: AggregationTypeSchema,
  field: z.string(),
  filter: z.any().optional(),
});

export const KPIConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  expression: KPIExpressionSchema,
  format: z.enum(['number', 'currency', 'percentage']),
  icon: z.string().optional(),
  span: z.number().optional(),
});

export const ChartConfigSchema = z.object({
  id: z.string(),
  type: ChartTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  xField: z.string(),
  yField: z.string(),
  groupBy: z.string().optional(),
  span: z.number().optional(),
  height: z.number().optional(),
});

export const LayoutRowSchema = z.object({
  id: z.string(),
  widgets: z.array(z.string()),
  span: z.array(z.number()),
  height: z.number().optional(),
});

export const LayoutConfigSchema = z.object({
  type: z.enum(['grid', 'flex']),
  columns: z.number(),
  rows: z.array(LayoutRowSchema),
});

export const DashboardConfigSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string(),
  kpis: z.array(KPIConfigSchema),
  charts: z.array(ChartConfigSchema),
  layout: LayoutConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createEmptyDashboardConfig(): DashboardConfig {
  return {
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
}

export function findWidget(
  config: DashboardConfig,
  widgetId: string
): KPIConfig | ChartConfig | undefined {
  const kpi = config.kpis.find(k => k.id === widgetId);
  if (kpi) return kpi;

  const chart = config.charts.find(c => c.id === widgetId);
  return chart;
}

export function isKPIConfig(widget: any): widget is KPIConfig {
  return 'expression' in widget;
}

export function isChartConfig(widget: any): widget is ChartConfig {
  return 'type' in widget && 'xField' in widget && 'yField' in widget;
}

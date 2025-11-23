import { GoogleGenerativeAI } from '@google/generative-ai';
import { DashboardConfig, KPIConfig, ChartConfig } from './dashboard-types';

/**
 * SHARED AI DASHBOARD UTILITIES
 *
 * Common functions used by both ai-dashboard-generator and dashboard-variations
 * to reduce code duplication.
 */

/**
 * Prepare field metadata for AI prompts
 */
export interface FieldMetadata {
  name: string;
  type: string;
  sampleValues: any[];
}

export interface PreparedDataContext {
  fields: FieldMetadata[];
  numericFields: FieldMetadata[];
  dateFields: FieldMetadata[];
  categoryFields: FieldMetadata[];
  rowCount: number;
  sampleData: Record<string, any>[];
}

export function prepareDataContext(
  data: Record<string, any>[],
  columnMapping: Record<string, string>
): PreparedDataContext {
  const fields = Object.entries(columnMapping).map(([name, type]) => ({
    name,
    type,
    sampleValues: data.slice(0, 3).map(row => row[name]),
  }));

  const numericFields = fields.filter(f => f.type === 'number');
  const dateFields = fields.filter(f => f.type === 'date');
  const categoryFields = fields.filter(f => f.type === 'string');

  return {
    fields,
    numericFields,
    dateFields,
    categoryFields,
    rowCount: data.length,
    sampleData: data.slice(0, 3),
  };
}

/**
 * Generate base prompt for AI dashboard generation
 */
export function generateBasePrompt(context: PreparedDataContext): string {
  return `
You are an expert data visualization designer. Analyze this dataset and create a complete dashboard configuration.

Dataset Profile:
- Total Rows: ${context.rowCount}
- Numeric Fields: ${context.numericFields.map(f => f.name).join(', ') || 'none'}
- Date Fields: ${context.dateFields.map(f => f.name).join(', ') || 'none'}
- Category Fields: ${context.categoryFields.map(f => f.name).join(', ') || 'none'}

Sample Data (first 3 rows):
${JSON.stringify(context.sampleData, null, 2)}

Field Details:
${JSON.stringify(context.fields, null, 2)}
`.trim();
}

/**
 * Generate instruction section for AI prompts
 */
export function generateInstructions(): string {
  return `
IMPORTANT: Return ONLY valid JSON (no markdown, no explanations, no code blocks).

Return a JSON object with this EXACT structure:
{
  "kpis": [
    {
      "title": "Total Revenue",
      "description": "Sum of all sales",
      "field": "revenue",
      "aggregation": "sum",
      "format": "currency",
      "icon": "DollarSign"
    }
  ],
  "charts": [
    {
      "type": "line",
      "title": "Revenue Trend Over Time",
      "xField": "date",
      "yField": "revenue",
      "description": "Shows revenue trends"
    }
  ]
}

RULES:
1. KPI aggregations: "sum", "avg", "min", "max", "count", "countDistinct"
2. KPI formats: "number", "currency", "percentage"
3. KPI icons: "Activity", "TrendingUp", "TrendingDown", "DollarSign", "Users", "ShoppingCart", "Database", "BarChart3", "PieChart", "Target"
4. Chart types: "line", "bar", "area", "pie"
5. For time-series data: use "line" or "area" charts with date field as xField
6. For categorical comparisons: use "bar" charts
7. For proportions: use "pie" charts (only if ≤7 categories)
8. Chart xField and yField must exist in the dataset
9. Ensure all field names exactly match the dataset columns
10. Title should be descriptive and business-friendly
11. Description should explain what insight the visualization provides

Respond with ONLY the JSON object (no markdown formatting, no \`\`\`json\`\`\` blocks).
`.trim();
}

/**
 * Parse and clean AI response
 */
export function parseAIResponse(responseText: string): any {
  // Clean response (remove markdown if present)
  let cleanJson = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  // Sometimes AI adds extra text, try to extract JSON
  const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanJson = jsonMatch[0];
  }

  return JSON.parse(cleanJson);
}

/**
 * Validate AI response structure
 */
export function validateAIResponse(aiResponse: any): void {
  if (!aiResponse.kpis || !Array.isArray(aiResponse.kpis)) {
    throw new Error('Invalid AI response: missing kpis array');
  }
  if (!aiResponse.charts || !Array.isArray(aiResponse.charts)) {
    throw new Error('Invalid AI response: missing charts array');
  }
}

/**
 * Build KPI configs from AI response
 */
export function buildKPIConfigs(aiKPIs: any[]): KPIConfig[] {
  return aiKPIs.map((kpi: any) => ({
    id: crypto.randomUUID(),
    title: kpi.title || 'Untitled KPI',
    description: kpi.description,
    expression: {
      aggregation: kpi.aggregation || 'sum',
      field: kpi.field,
    },
    format: kpi.format || 'number',
    icon: kpi.icon || 'Activity',
    span: 6, // Default half-width
  }));
}

/**
 * Build chart configs from AI response
 */
export function buildChartConfigs(aiCharts: any[]): ChartConfig[] {
  return aiCharts.map((chart: any) => ({
    id: crypto.randomUUID(),
    type: chart.type || 'bar',
    title: chart.title || 'Untitled Chart',
    description: chart.description,
    xField: chart.xField,
    yField: chart.yField,
    groupBy: chart.groupBy,
    span: 12, // Default full-width
  }));
}

/**
 * Build dashboard layout from KPIs and charts
 */
export function buildDashboardLayout(
  kpis: KPIConfig[],
  charts: ChartConfig[]
): {
  type: 'grid' | 'flex';
  columns: number;
  rows: Array<{
    id: string;
    widgets: string[];
    span: number[];
  }>;
} {
  const rows: Array<{
    id: string;
    widgets: string[];
    span: number[];
  }> = [];

  // Row 1: KPIs (distribute evenly)
  if (kpis.length > 0) {
    rows.push({
      id: crypto.randomUUID(),
      widgets: kpis.map(k => k.id),
      span: kpis.map(() => Math.floor(12 / kpis.length)),
    });
  }

  // Subsequent rows: Charts (one per row for clarity)
  charts.forEach(chart => {
    rows.push({
      id: crypto.randomUUID(),
      widgets: [chart.id],
      span: [12],
    });
  });

  return {
    type: 'grid',
    columns: 12,
    rows,
  };
}

/**
 * Generate complete dashboard config from AI response
 */
export function buildDashboardConfig(aiResponse: any): DashboardConfig {
  validateAIResponse(aiResponse);

  const kpis = buildKPIConfigs(aiResponse.kpis);
  const charts = buildChartConfigs(aiResponse.charts);
  const layout = buildDashboardLayout(kpis, charts);

  return {
    id: crypto.randomUUID(),
    version: '1.0',
    kpis,
    charts,
    layout,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Call Gemini API with prompt
 */
export async function callGeminiAI(
  apiKey: string,
  prompt: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Enhanced error handling for AI calls
 */
export function handleAIError(error: unknown): never {
  console.error('AI dashboard generation failed:', error);

  // Provide more specific error message
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing Gemini API key');
    } else if (error.message.includes('JSON')) {
      throw new Error('AI returned invalid JSON format');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
  }

  throw new Error('Failed to generate dashboard with AI. Using fallback.');
}

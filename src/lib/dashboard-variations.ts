import { GoogleGenerativeAI } from '@google/generative-ai';
import { DashboardConfig, DashboardConfigSchema } from './dashboard-types';

/**
 * Dashboard Variations Generator
 * Generates multiple AI-powered dashboard layout proposals
 */

export type VariationStrategy = 'kpi-focused' | 'analytical' | 'balanced';

export interface DashboardVariation {
  id: string;
  config: DashboardConfig;
  strategy: VariationStrategy;
  description: string;
  createdAt: string;
}

const STRATEGY_PROMPTS: Record<VariationStrategy, string> = {
  'kpi-focused': `
STRATEGY: KPI-Focused Dashboard
Create a dashboard that emphasizes KEY PERFORMANCE INDICATORS:
- Generate 4-6 KPIs (more than usual)
- Create 1-2 supporting charts
- KPIs should be the primary focus
- Layout: KPIs in top rows, charts below
- Best for: Executive summaries, metric tracking
`,
  'analytical': `
STRATEGY: Analytical Dashboard
Create a dashboard that emphasizes DEEP DATA ANALYSIS:
- Generate 1-2 KPIs (minimal)
- Create 3-4 detailed charts
- Charts should show different perspectives
- Layout: Charts dominate the space
- Best for: Data exploration, trend analysis
`,
  'balanced': `
STRATEGY: Balanced Dashboard
Create a dashboard with EQUAL EMPHASIS on metrics and visualizations:
- Generate 2-3 KPIs
- Create 2-3 charts
- Balance between overview and details
- Layout: KPIs at top, charts distributed below
- Best for: General-purpose dashboards
`,
};

export async function generateDashboardVariations(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey: string,
  strategies: VariationStrategy[] = ['kpi-focused', 'analytical', 'balanced']
): Promise<DashboardVariation[]> {
  if (!apiKey) {
    throw new Error('Gemini API key required for variation generation');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Prepare field metadata
  const fields = Object.entries(columnMapping).map(([name, type]) => ({
    name,
    type,
    sampleValues: data.slice(0, 3).map(row => row[name]),
  }));

  const numericFields = fields.filter(f => f.type === 'number');
  const dateFields = fields.filter(f => f.type === 'date');
  const categoryFields = fields.filter(f => f.type === 'string');

  const basePrompt = `
You are an expert data visualization designer. Analyze this dataset and create a complete dashboard configuration.

Dataset Profile:
- Total Rows: ${data.length}
- Numeric Fields: ${numericFields.map(f => f.name).join(', ') || 'none'}
- Date Fields: ${dateFields.map(f => f.name).join(', ') || 'none'}
- Category Fields: ${categoryFields.map(f => f.name).join(', ') || 'none'}

Sample Data (first 3 rows):
${JSON.stringify(data.slice(0, 3), null, 2)}

Field Details:
${JSON.stringify(fields, null, 2)}
`.trim();

  const instructions = `
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
12. EACH VARIATION MUST BE DIFFERENT - vary chart types, KPI selections, and insights shown

Respond with ONLY the JSON object (no markdown formatting, no \`\`\`json\`\`\` blocks).
`.trim();

  const variations: DashboardVariation[] = [];

  // Generate variations in parallel for speed
  const promises = strategies.map(async (strategy) => {
    const strategyPrompt = STRATEGY_PROMPTS[strategy];
    const fullPrompt = `${basePrompt}\n\n${strategyPrompt}\n\n${instructions}`;

    try {
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      // Clean response
      let cleanJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }

      const aiResponse = JSON.parse(cleanJson);

      // Validate structure
      if (!aiResponse.kpis || !Array.isArray(aiResponse.kpis)) {
        throw new Error('Invalid AI response: missing kpis array');
      }
      if (!aiResponse.charts || !Array.isArray(aiResponse.charts)) {
        throw new Error('Invalid AI response: missing charts array');
      }

      // Build dashboard config
      const config: DashboardConfig = {
        id: crypto.randomUUID(),
        version: '1.0',
        kpis: aiResponse.kpis.map((kpi: any) => ({
          id: crypto.randomUUID(),
          title: kpi.title || 'Untitled KPI',
          description: kpi.description,
          expression: {
            aggregation: kpi.aggregation || 'sum',
            field: kpi.field,
          },
          format: kpi.format || 'number',
          icon: kpi.icon || 'Activity',
          span: 6,
        })),
        charts: aiResponse.charts.map((chart: any) => ({
          id: crypto.randomUUID(),
          type: chart.type || 'bar',
          title: chart.title || 'Untitled Chart',
          description: chart.description,
          xField: chart.xField,
          yField: chart.yField,
          groupBy: chart.groupBy,
          span: 12,
        })),
        layout: {
          type: 'grid',
          columns: 12,
          rows: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Build layout
      // Row 1: KPIs
      if (config.kpis.length > 0) {
        config.layout.rows.push({
          id: crypto.randomUUID(),
          widgets: config.kpis.map(k => k.id),
          span: config.kpis.map(() => Math.floor(12 / config.kpis.length)),
        });
      }

      // Subsequent rows: Charts
      config.charts.forEach(chart => {
        config.layout.rows.push({
          id: crypto.randomUUID(),
          widgets: [chart.id],
          span: [12],
        });
      });

      // Validate with Zod
      try {
        DashboardConfigSchema.parse(config);
      } catch (zodError) {
        console.warn('Zod validation warning:', zodError);
      }

      return {
        id: crypto.randomUUID(),
        config,
        strategy,
        description: getStrategyDescription(strategy),
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to generate ${strategy} variation:`, error);
      throw error;
    }
  });

  try {
    const results = await Promise.all(promises);
    variations.push(...results);
  } catch (error) {
    console.error('Variation generation failed:', error);
    throw new Error('Failed to generate dashboard variations. Please try again.');
  }

  return variations;
}

/**
 * Generate a single variation (useful for regenerating one strategy)
 */
export async function generateSingleVariation(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey: string,
  strategy: VariationStrategy = 'balanced'
): Promise<DashboardVariation> {
  const variations = await generateDashboardVariations(data, columnMapping, apiKey, [strategy]);
  return variations[0];
}

/**
 * Get human-readable description for strategy
 */
function getStrategyDescription(strategy: VariationStrategy): string {
  switch (strategy) {
    case 'kpi-focused':
      return 'Emphasizes key metrics with 4-6 KPIs and minimal charts. Best for executive summaries.';
    case 'analytical':
      return 'Emphasizes deep analysis with 3-4 detailed charts. Best for data exploration.';
    case 'balanced':
      return 'Balanced mix of metrics and visualizations. Best for general-purpose dashboards.';
    default:
      return 'Custom dashboard layout';
  }
}

/**
 * Compare two variations and highlight differences
 */
export function compareVariations(
  v1: DashboardVariation,
  v2: DashboardVariation
): {
  kpiCountDiff: number;
  chartCountDiff: number;
  layoutDiff: string;
} {
  const kpiCountDiff = v1.config.kpis.length - v2.config.kpis.length;
  const chartCountDiff = v1.config.charts.length - v2.config.charts.length;

  let layoutDiff = 'similar';
  if (Math.abs(kpiCountDiff) > 2) layoutDiff = 'very different';
  else if (Math.abs(kpiCountDiff) > 0 || Math.abs(chartCountDiff) > 0) layoutDiff = 'different';

  return { kpiCountDiff, chartCountDiff, layoutDiff };
}

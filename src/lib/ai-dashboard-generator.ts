import { GoogleGenerativeAI } from '@google/generative-ai';
import { DashboardConfig, DashboardConfigSchema, ChartConfig, KPIConfig } from './dashboard-types';

/**
 * AI-Powered Dashboard Generator
 * Uses Google Gemini to generate complete dashboard configurations
 */

export async function generateDashboardWithAI(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey?: string
): Promise<DashboardConfig> {
  if (!apiKey) {
    throw new Error('Gemini API key required for AI dashboard generation');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Prepare field metadata for AI
  const fields = Object.entries(columnMapping).map(([name, type]) => ({
    name,
    type,
    sampleValues: data.slice(0, 3).map(row => row[name]),
  }));

  const numericFields = fields.filter(f => f.type === 'number');
  const dateFields = fields.filter(f => f.type === 'date');
  const categoryFields = fields.filter(f => f.type === 'string');

  const prompt = `
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
1. Create 2-4 KPIs based on NUMERIC fields only
2. Create 2-3 charts showing different insights
3. KPI aggregations: "sum", "avg", "min", "max", "count", "countDistinct"
4. KPI formats: "number", "currency", "percentage"
5. KPI icons: "Activity", "TrendingUp", "TrendingDown", "DollarSign", "Users", "ShoppingCart", "Database", "BarChart3", "PieChart", "Target"
6. Chart types: "line", "bar", "area", "pie"
7. For time-series data: use "line" or "area" charts with date field as xField
8. For categorical comparisons: use "bar" charts
9. For proportions: use "pie" charts (only if ≤7 categories)
10. Chart xField and yField must exist in the dataset
11. Ensure all field names exactly match the dataset columns
12. Title should be descriptive and business-friendly
13. Description should explain what insight the visualization provides

Respond with ONLY the JSON object (no markdown formatting, no \`\`\`json\`\`\` blocks).
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

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

    const aiResponse = JSON.parse(cleanJson);

    // Validate AI response structure
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
        span: 6, // Default half-width
      })),
      charts: aiResponse.charts.map((chart: any) => ({
        id: crypto.randomUUID(),
        type: chart.type || 'bar',
        title: chart.title || 'Untitled Chart',
        description: chart.description,
        xField: chart.xField,
        yField: chart.yField,
        groupBy: chart.groupBy,
        span: 12, // Default full-width
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
    // Row 1: KPIs (distribute evenly)
    if (config.kpis.length > 0) {
      config.layout.rows.push({
        id: crypto.randomUUID(),
        widgets: config.kpis.map(k => k.id),
        span: config.kpis.map(() => Math.floor(12 / config.kpis.length)),
      });
    }

    // Subsequent rows: Charts (one per row for clarity)
    config.charts.forEach(chart => {
      config.layout.rows.push({
        id: crypto.randomUUID(),
        widgets: [chart.id],
        span: [12],
      });
    });

    // Validate with Zod schema
    try {
      const validated = DashboardConfigSchema.parse(config);
      return validated;
    } catch (zodError) {
      console.error('Zod validation failed:', zodError);
      // Return config anyway, Zod is for extra safety
      return config;
    }

  } catch (error) {
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
}

/**
 * Validates that AI-suggested fields exist in the dataset
 */
export function validateDashboardFields(
  config: DashboardConfig,
  availableFields: string[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check KPI fields
  config.kpis.forEach(kpi => {
    if (!availableFields.includes(kpi.expression.field)) {
      errors.push(`KPI "${kpi.title}" references non-existent field: ${kpi.expression.field}`);
    }
  });

  // Check chart fields
  config.charts.forEach(chart => {
    if (!availableFields.includes(chart.xField)) {
      errors.push(`Chart "${chart.title}" references non-existent xField: ${chart.xField}`);
    }
    if (!availableFields.includes(chart.yField)) {
      errors.push(`Chart "${chart.title}" references non-existent yField: ${chart.yField}`);
    }
    if (chart.groupBy && !availableFields.includes(chart.groupBy)) {
      errors.push(`Chart "${chart.title}" references non-existent groupBy: ${chart.groupBy}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

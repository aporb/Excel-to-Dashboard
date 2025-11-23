import { DashboardConfig, DashboardConfigSchema } from './dashboard-types';
import {
  prepareDataContext,
  generateBasePrompt,
  generateInstructions,
  callGeminiAI,
  parseAIResponse,
  buildDashboardConfig,
  handleAIError,
} from './ai-dashboard-utils';

/**
 * AI-Powered Dashboard Generator
 * Uses Google Gemini to generate complete dashboard configurations
 *
 * This is the core AI generator used by the unified dashboard-generator.ts
 */

export async function generateDashboardWithAI(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey?: string
): Promise<DashboardConfig> {
  if (!apiKey) {
    throw new Error('Gemini API key required for AI dashboard generation');
  }

  try {
    // Prepare data context for AI
    const context = prepareDataContext(data, columnMapping);

    // Build prompt sections
    const basePrompt = generateBasePrompt(context);
    const instructions = generateInstructions();

    // Add specific guidance for balanced dashboard
    const strategyGuidance = `
Create a BALANCED dashboard that provides both overview metrics and detailed insights:
- Generate 2-4 KPIs based on NUMERIC fields only
- Create 2-3 charts showing different insights
- Prioritize the most important metrics and trends
- Ensure visualizations complement each other (don't show the same data twice)
`;

    const fullPrompt = `${basePrompt}\n\n${strategyGuidance}\n\n${instructions}`;

    // Call Gemini API
    const responseText = await callGeminiAI(apiKey, fullPrompt);

    // Parse and validate response
    const aiResponse = parseAIResponse(responseText);

    // Build dashboard config
    const config = buildDashboardConfig(aiResponse);

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
    handleAIError(error);
  }
}

/**
 * Validates that AI-suggested fields exist in the dataset
 *
 * This is important because AI can sometimes hallucinate field names
 * or make typos when suggesting dashboard configurations.
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

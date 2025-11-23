import { DashboardConfig, DashboardConfigSchema } from './dashboard-types';
import {
  prepareDataContext,
  generateBasePrompt,
  generateInstructions,
  callGeminiAI,
  parseAIResponse,
  buildDashboardConfig,
} from './ai-dashboard-utils';

/**
 * Dashboard Variations Generator
 * Generates multiple AI-powered dashboard layout proposals with different strategies
 *
 * Uses shared utilities from ai-dashboard-utils.ts to reduce code duplication
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

/**
 * Generate multiple dashboard variations with different strategies
 */
export async function generateDashboardVariations(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey: string,
  strategies: VariationStrategy[] = ['kpi-focused', 'analytical', 'balanced']
): Promise<DashboardVariation[]> {
  if (!apiKey) {
    throw new Error('Gemini API key required for variation generation');
  }

  // Prepare data context once (shared across all variations)
  const context = prepareDataContext(data, columnMapping);
  const basePrompt = generateBasePrompt(context);
  const instructions = generateInstructions();

  // Add variation-specific instruction
  const variationInstruction = `
12. EACH VARIATION MUST BE DIFFERENT - vary chart types, KPI selections, and insights shown
`;

  const variations: DashboardVariation[] = [];

  // Generate variations in parallel for speed
  const promises = strategies.map(async (strategy) => {
    const strategyPrompt = STRATEGY_PROMPTS[strategy];
    const fullPrompt = `${basePrompt}\n\n${strategyPrompt}\n\n${instructions}${variationInstruction}`;

    try {
      // Call Gemini API
      const responseText = await callGeminiAI(apiKey, fullPrompt);

      // Parse and validate response
      const aiResponse = parseAIResponse(responseText);

      // Build dashboard config using shared utility
      const config = buildDashboardConfig(aiResponse);

      // Validate with Zod
      try {
        DashboardConfigSchema.parse(config);
      } catch (zodError) {
        console.warn('Zod validation warning for variation:', zodError);
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

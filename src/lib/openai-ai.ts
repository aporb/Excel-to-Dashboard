import OpenAI from 'openai';
import { ChartSuggestion } from './dashboard-types';
import { toast } from 'sonner';

const VALID_CHART_TYPES = ['line', 'bar', 'pie', 'area'] as const;

// Re-export for backward compatibility
export type { ChartSuggestion };

// Lazy-load OpenAI client to prevent initialization errors
let client: OpenAI | null = null;

function getClient(apiKey?: string): OpenAI | null {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) return null;

  if (!client) {
    client = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true // Allow client-side usage
    });
  }
  return client;
}

/**
 * @deprecated This function is from the old single-chart generation system (Method 1).
 *
 * MIGRATION PATH:
 * - Old: suggestChart() → returns ChartSuggestion (single chart)
 * - New: generateDashboard() → returns DashboardConfig (multiple charts + KPIs)
 *
 * This function is kept for backward compatibility with old sessions.
 * The project now uses Gemini AI by default, but OpenAI support is maintained
 * for users who prefer it.
 *
 * NEW CODE: Use generateDashboard() from /src/lib/dashboard-generator.ts
 *
 * @see /src/lib/dashboard-generator.ts for the unified approach
 */
export async function suggestChart(
  dataSample: Record<string, any>[],
  apiKey?: string
): Promise<ChartSuggestion> {
  const openaiClient = getClient(apiKey);
  
  if (!openaiClient) {
    // Fallback when no API key is provided
    const keys = Object.keys(dataSample[0] || {});
    return {
      chartType: 'line',
      xKey: keys[0] || 'date',
      yKey: keys[1] || 'value',
      reasoning: 'No OpenAI API key provided - using default suggestion'
    };
  }

  const sample = JSON.stringify(dataSample.slice(0, 5), null, 2);
  const prompt = `You are a data visualization assistant. Given the following tabular sample, suggest the most appropriate chart type (line, bar, pie, or area) and which columns should be used for the X-axis and Y-axis.

Sample data:
${sample}

CRITICAL: The chartType field MUST be exactly one of these four strings:
- "line"
- "bar"
- "pie"
- "area"

DO NOT use: "table", "scatter", "heatmap", "histogram", or any other type.

Respond ONLY with a valid JSON object in this exact format:
{
  "chartType": "line",
  "xKey": "column_name",
  "yKey": "column_name",
  "reasoning": "brief explanation"
}`;

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    const text = completion.choices[0]?.message?.content || '{}';

    // Extract JSON from response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    const parsed = JSON.parse(jsonText);

    // VALIDATE CHART TYPE
    if (!VALID_CHART_TYPES.includes(parsed.chartType)) {
      console.warn(`Invalid chart type from AI: ${parsed.chartType}, using fallback`);

      // Fallback to intelligent selection
      const ChartIntelligence = await import('./chart-intelligence');
      const fallback = ChartIntelligence.ChartIntelligence.selectBestChart(dataSample, Object.keys(dataSample[0] || {}));
      parsed.chartType = fallback;
      parsed.reasoning = `AI suggested invalid type "${parsed.chartType}", using data analysis fallback: ${fallback}`;
    }

    return parsed as ChartSuggestion;
  } catch (error) {
    console.error('OpenAI API error:', error);

    // User-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API key') || errorMessage.includes('401')) {
      toast.error('Invalid OpenAI API key. Please check Settings.');
    } else if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      toast.error('API quota exceeded. Please try again later.');
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      toast.error('Network error. Please check your connection.');
    } else if (errorMessage.includes('rate limit')) {
      toast.error('Rate limit reached. Please wait a moment and try again.');
    } else {
      toast.error('AI generation failed. Using fallback visualization.');
    }

    // Fallback suggestion
    const keys = Object.keys(dataSample[0] || {});
    return {
      chartType: 'line',
      xKey: keys[0] || 'date',
      yKey: keys[1] || 'value',
      reasoning: 'Error occurred - using default suggestion'
    };
  }
}

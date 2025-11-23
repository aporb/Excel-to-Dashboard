// src/lib/gemini-ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChartSuggestion } from './dashboard-types';
import { toast } from 'sonner';

const MODEL_NAME = 'gemini-1.5-flash';
const VALID_CHART_TYPES = ['line', 'bar', 'pie', 'area'] as const;

// Re-export for backward compatibility
export type { ChartSuggestion };

/**
 * @deprecated This function is from the old single-chart generation system (Method 1).
 *
 * MIGRATION PATH:
 * - Old: suggestChart() → returns ChartSuggestion (single chart)
 * - New: generateDashboard() → returns DashboardConfig (multiple charts + KPIs)
 *
 * This function is kept for:
 * 1. Backward compatibility with old sessions
 * 2. The "Get AI Chart Suggestion" button in the UI (legacy feature)
 *
 * NEW CODE: Use generateDashboard() from /src/lib/dashboard-generator.ts
 *
 * @see /src/lib/dashboard-generator.ts for the unified approach
 */
export async function suggestChart(
    dataSample: Record<string, any>[],
    apiKey?: string
): Promise<ChartSuggestion> {
    if (!apiKey) {
        // Fallback when no API key is provided
        const keys = Object.keys(dataSample[0] || {});
        return {
            chartType: 'line',
            xKey: keys[0] || 'date',
            yKey: keys[1] || 'value',
            reasoning: 'No Gemini API key provided - using default suggestion'
        };
    }

    // Initialize client with passed API key
    const genAI = new GoogleGenerativeAI(apiKey);

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
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        const text = result.response?.text() || '{}';

        // Extract JSON from markdown code blocks if present
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
        console.error('Gemini AI error:', error);

        // User-friendly error messages
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
            toast.error('Invalid Gemini API key. Please check Settings.');
        } else if (errorMessage.includes('quota') || errorMessage.includes('QUOTA')) {
            toast.error('API quota exceeded. Please try again later.');
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            toast.error('Network error. Please check your connection.');
        } else if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
            toast.error('Content blocked by AI safety filters. Using fallback visualization.');
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

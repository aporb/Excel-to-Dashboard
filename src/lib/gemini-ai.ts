// src/lib/gemini-ai.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-1.5-flash';

// Initialize the client – the API key should be stored in an env var
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface ChartSuggestion {
    chartType: 'line' | 'bar' | 'pie' | 'area';
    xKey: string;
    yKey: string;
    reasoning?: string;
}

export async function suggestChart(
    dataSample: Record<string, any>[]
): Promise<ChartSuggestion> {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        // Fallback when no API key is provided
        const keys = Object.keys(dataSample[0] || {});
        return {
            chartType: 'line',
            xKey: keys[0] || 'date',
            yKey: keys[1] || 'value',
            reasoning: 'No API key provided - using default suggestion'
        };
    }

    const sample = JSON.stringify(dataSample.slice(0, 5), null, 2);
    const prompt = `You are a data visualization assistant. Given the following tabular sample, suggest the most appropriate chart type (line, bar, pie, or area) and which columns should be used for the X-axis and Y-axis.

Sample data:
${sample}

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
        return parsed as ChartSuggestion;
    } catch (error) {
        console.error('Gemini AI error:', error);
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

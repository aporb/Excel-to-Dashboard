import OpenAI from 'openai';

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

export interface ChartSuggestion {
  chartType: 'line' | 'bar' | 'pie' | 'area';
  xKey: string;
  yKey: string;
  reasoning?: string;
}

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
    return parsed as ChartSuggestion;
  } catch (error) {
    console.error('OpenAI API error:', error);
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

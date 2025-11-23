import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChartConfig, ChartConfigSchema } from './dashboard-types';

/**
 * Chart Improvement AI
 * Uses natural language to refine and improve individual chart configurations
 */

export interface ChartImprovementRequest {
  chartConfig: ChartConfig;
  userRequest: string;
  data: Record<string, any>[];
  availableFields: string[];
}

export interface ChartImprovementResult {
  updatedConfig: ChartConfig;
  changes: string[];
  reasoning: string;
}

export async function improveChartWithAI(
  request: ChartImprovementRequest,
  apiKey: string
): Promise<ChartImprovementResult> {
  if (!apiKey) {
    throw new Error('Gemini API key required for chart improvement');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const { chartConfig, userRequest, data, availableFields } = request;

  // Prepare sample data
  const sampleData = data.slice(0, 5);

  const prompt = `
You are an expert data visualization consultant. A user wants to improve their chart.

CURRENT CHART CONFIGURATION:
${JSON.stringify(chartConfig, null, 2)}

AVAILABLE FIELDS IN DATASET:
${availableFields.join(', ')}

SAMPLE DATA (first 5 rows):
${JSON.stringify(sampleData, null, 2)}

USER REQUEST:
"${userRequest}"

TASK:
Analyze the user's request and update the chart configuration to fulfill it.
You can change:
- Chart type (line, bar, area, pie)
- X-axis field (xField)
- Y-axis field (yField)
- Grouping field (groupBy)
- Chart title
- Chart description
- Sort order
- Color scheme

IMPORTANT RULES:
1. xField, yField, and groupBy MUST be from the available fields list
2. Chart type must be one of: line, bar, area, pie
3. Maintain the chart ID (do not change it)
4. Only make changes relevant to the user's request
5. If the request is unclear or impossible, suggest the closest alternative
6. Return ONLY valid JSON (no markdown, no code blocks)

Return a JSON object with this EXACT structure:
{
  "updatedConfig": {
    "id": "${chartConfig.id}",
    "type": "line",
    "title": "Updated Chart Title",
    "description": "What this chart shows",
    "xField": "field_name",
    "yField": "field_name",
    "groupBy": "optional_field_name",
    "span": ${chartConfig.span || 12}
  },
  "changes": [
    "Changed chart type from bar to line",
    "Updated Y-axis to show revenue instead of count"
  ],
  "reasoning": "Brief explanation of why these changes were made"
}

Respond with ONLY the JSON object (no markdown formatting).
`.trim();

  try {
    const result = await model.generateContent(prompt);
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

    // Validate response structure
    if (!aiResponse.updatedConfig) {
      throw new Error('Invalid AI response: missing updatedConfig');
    }
    if (!aiResponse.changes || !Array.isArray(aiResponse.changes)) {
      throw new Error('Invalid AI response: missing changes array');
    }
    if (!aiResponse.reasoning) {
      throw new Error('Invalid AI response: missing reasoning');
    }

    // Validate fields exist
    const updatedConfig = aiResponse.updatedConfig;
    if (!availableFields.includes(updatedConfig.xField)) {
      throw new Error(`Invalid field: ${updatedConfig.xField} does not exist`);
    }
    if (!availableFields.includes(updatedConfig.yField)) {
      throw new Error(`Invalid field: ${updatedConfig.yField} does not exist`);
    }
    if (updatedConfig.groupBy && !availableFields.includes(updatedConfig.groupBy)) {
      throw new Error(`Invalid field: ${updatedConfig.groupBy} does not exist`);
    }

    // Ensure ID is preserved
    updatedConfig.id = chartConfig.id;

    // Validate with Zod
    try {
      ChartConfigSchema.parse(updatedConfig);
    } catch (zodError) {
      console.warn('Zod validation warning:', zodError);
    }

    return {
      updatedConfig,
      changes: aiResponse.changes,
      reasoning: aiResponse.reasoning,
    };
  } catch (error) {
    console.error('Chart improvement failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid or missing Gemini API key');
      } else if (error.message.includes('JSON')) {
        throw new Error('AI returned invalid JSON format');
      } else if (error.message.includes('field')) {
        throw error; // Re-throw field validation errors
      }
    }

    throw new Error('Failed to improve chart. Please try rephrasing your request.');
  }
}

/**
 * Suggest improvement prompts based on chart type and data
 */
export function suggestImprovementPrompts(
  chartConfig: ChartConfig,
  availableFields: string[]
): string[] {
  const prompts: string[] = [];

  // Generic prompts
  prompts.push('Make this chart more visually appealing');
  prompts.push('Show this data differently');

  // Type-specific prompts
  switch (chartConfig.type) {
    case 'line':
      prompts.push('Change to a bar chart');
      prompts.push('Add trend analysis');
      break;
    case 'bar':
      prompts.push('Change to a line chart');
      prompts.push('Sort by value descending');
      break;
    case 'area':
      prompts.push('Change to a line chart');
      prompts.push('Emphasize volume trends');
      break;
    case 'pie':
      prompts.push('Change to a bar chart');
      prompts.push('Show top 5 categories only');
      break;
  }

  // Field-based prompts
  const numericFields = availableFields.filter(f => f !== chartConfig.xField && f !== chartConfig.yField);
  if (numericFields.length > 0) {
    prompts.push(`Show ${numericFields[0]} instead`);
  }

  const categoryFields = availableFields.filter(f =>
    !['date', 'time', 'timestamp'].some(t => f.toLowerCase().includes(t))
  );
  if (categoryFields.length > 0 && !chartConfig.groupBy) {
    prompts.push(`Group by ${categoryFields[0]}`);
  }

  return prompts.slice(0, 5); // Return top 5 suggestions
}

/**
 * Validate if a user request is safe and reasonable
 */
export function validateImprovementRequest(request: string): {
  isValid: boolean;
  reason?: string;
} {
  const trimmed = request.trim();

  if (trimmed.length === 0) {
    return { isValid: false, reason: 'Request cannot be empty' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, reason: 'Request is too short' };
  }

  if (trimmed.length > 500) {
    return { isValid: false, reason: 'Request is too long (max 500 characters)' };
  }

  // Check for malicious patterns
  const dangerousPatterns = [
    /delete|drop|truncate/i,
    /script>/i,
    /eval\(/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { isValid: false, reason: 'Request contains invalid content' };
    }
  }

  return { isValid: true };
}

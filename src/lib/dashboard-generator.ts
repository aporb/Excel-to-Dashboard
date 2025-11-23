import { generateDashboardWithAI } from './ai-dashboard-generator';
import { generateBasicDashboard } from './dashboard-generator-basic';
import { DashboardConfig, createEmptyDashboardConfig } from './dashboard-types';

/**
 * UNIFIED DASHBOARD GENERATOR
 *
 * This is the single entry point for all dashboard generation.
 * Supports multiple generation strategies with intelligent error recovery.
 *
 * Strategy:
 * 1. If API key provided → Try AI generation (full or with strategy)
 * 2. If AI fails or no key → Use basic generation
 * 3. All errors are gracefully handled with user-friendly messages
 *
 * @param data - The processed dataset
 * @param columnMapping - Column name to type mapping (date, number, string)
 * @param options - Generation options (apiKey, strategy, etc.)
 * @returns Promise<DashboardConfig> - Always returns a valid config
 *
 * @example
 * ```typescript
 * // Simple usage with AI
 * const config = await generateDashboard(data, mapping, { apiKey });
 *
 * // Use basic generator without AI
 * const config = await generateDashboard(data, mapping);
 *
 * // Generate with specific strategy
 * const config = await generateDashboard(data, mapping, {
 *   apiKey,
 *   strategy: 'kpi-focused'
 * });
 *
 * // Manual empty dashboard
 * const config = await generateDashboard(data, mapping, {
 *   strategy: 'manual'
 * });
 * ```
 */

export type GenerationStrategy =
  | 'ai-full'        // Full AI generation with balanced approach
  | 'ai-basic'       // Basic data-driven generation (no AI)
  | 'manual'         // Empty dashboard for manual building
  | 'kpi-focused'    // AI with emphasis on KPIs
  | 'analytical'     // AI with emphasis on charts
  | 'balanced';      // AI with balanced approach (same as ai-full)

export interface GenerationOptions {
  apiKey?: string;
  strategy?: GenerationStrategy;
  templateId?: string; // Future: Use pre-defined templates
}

export interface GenerationResult {
  config: DashboardConfig;
  strategy: GenerationStrategy;
  usedFallback: boolean;
  error?: string;
}

/**
 * Main entry point for dashboard generation
 * Automatically handles AI fallback and error recovery
 */
export async function generateDashboard(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  options?: GenerationOptions
): Promise<DashboardConfig> {
  const result = await generateDashboardWithDetails(data, columnMapping, options);
  return result.config;
}

/**
 * Generate dashboard with detailed result information
 * Useful for debugging and showing user what strategy was used
 */
export async function generateDashboardWithDetails(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  // Input validation
  if (!data || data.length === 0) {
    throw new Error('Cannot generate dashboard: No data provided');
  }

  if (!columnMapping || Object.keys(columnMapping).length === 0) {
    throw new Error('Cannot generate dashboard: No column mapping provided');
  }

  const { apiKey, strategy = 'ai-full' } = options;

  // Manual strategy: Return empty dashboard
  if (strategy === 'manual') {
    console.log('Creating empty dashboard for manual building');
    return {
      config: createEmptyDashboardConfig(),
      strategy: 'manual',
      usedFallback: false,
    };
  }

  // AI-Basic strategy: Skip AI entirely
  if (strategy === 'ai-basic') {
    console.log('Using basic dashboard generation (AI-free)');
    const config = await generateBasicDashboard(data, columnMapping);
    return {
      config,
      strategy: 'ai-basic',
      usedFallback: false,
    };
  }

  // AI-based strategies: Try AI first, fallback to basic on failure
  if (apiKey && apiKey.trim().length > 0) {
    try {
      console.log(`Attempting AI-powered dashboard generation with strategy: ${strategy}`);

      // Import strategy-specific generator for non-standard strategies
      if (strategy === 'kpi-focused' || strategy === 'analytical') {
        const { generateSingleVariation } = await import('./dashboard-variations');
        const variation = await generateSingleVariation(data, columnMapping, apiKey, strategy);
        console.log(`AI generation successful with ${strategy} strategy`);
        return {
          config: variation.config,
          strategy,
          usedFallback: false,
        };
      }

      // Default: Use standard AI generation for 'ai-full' or 'balanced'
      const aiConfig = await generateDashboardWithAI(data, columnMapping, apiKey);
      console.log('AI generation successful');
      return {
        config: aiConfig,
        strategy: strategy === 'balanced' ? 'balanced' : 'ai-full',
        usedFallback: false,
      };
    } catch (error) {
      // Log AI failure but don't throw - we'll use fallback
      console.warn('AI dashboard generation failed, using fallback:', error);

      // Provide specific error context for debugging
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('API key')) {
          console.warn('API key issue detected');
        } else if (error.message.includes('quota')) {
          console.warn('API quota exceeded');
        } else if (error.message.includes('JSON')) {
          console.warn('AI returned invalid JSON');
        }
      }

      // Fallback to basic generation
      console.log('Using basic dashboard generation as fallback');
      const config = await generateBasicDashboard(data, columnMapping);
      return {
        config,
        strategy: 'ai-basic',
        usedFallback: true,
        error: errorMessage,
      };
    }
  } else {
    console.log('No API key provided, using basic dashboard generation');
    const config = await generateBasicDashboard(data, columnMapping);
    return {
      config,
      strategy: 'ai-basic',
      usedFallback: false,
    };
  }
}

/**
 * Generate multiple dashboard variations with different strategies
 * This is a convenience wrapper around the variations generator
 */
export async function generateDashboardVariations(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey: string,
  strategies: Array<'kpi-focused' | 'analytical' | 'balanced'> = ['kpi-focused', 'analytical', 'balanced']
): Promise<Array<{ config: DashboardConfig; strategy: string; description: string }>> {
  if (!apiKey) {
    throw new Error('API key required for variation generation');
  }

  // Import the variations generator
  const { generateDashboardVariations: genVariations } = await import('./dashboard-variations');
  const variations = await genVariations(data, columnMapping, apiKey, strategies);

  return variations.map(v => ({
    config: v.config,
    strategy: v.strategy,
    description: v.description,
  }));
}

/**
 * Re-export validation function for field checking
 */
export { validateDashboardFields } from './ai-dashboard-generator';

/**
 * Re-export basic generator for direct access if needed
 */
export { generateBasicDashboard } from './dashboard-generator-basic';

/**
 * Re-export AI generator for direct access if needed
 */
export { generateDashboardWithAI } from './ai-dashboard-generator';

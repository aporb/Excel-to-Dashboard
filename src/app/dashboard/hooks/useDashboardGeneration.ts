import { useState } from 'react';
import { DashboardConfig, ChartSuggestion } from '@/lib/dashboard-types';
import { generateDashboard, validateDashboardFields } from '@/lib/dashboard-generator';
import { suggestChart } from '@/lib/gemini-ai';
import { generateDashboardVariations, DashboardVariation } from '@/lib/dashboard-variations';
import { generateFiltersFromData } from '@/lib/filter-utils';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { toast } from 'sonner';

export interface UseDashboardGenerationReturn {
  isLoadingSuggestion: boolean;
  isGeneratingDashboard: boolean;
  isGeneratingVariations: boolean;
  dashboardFilters: any[];
  handleGetAISuggestion: (processedData: Record<string, any>[]) => Promise<ChartSuggestion | null>;
  handleGenerateDashboard: (
    processedData: Record<string, any>[],
    columnMapping: Record<string, string>
  ) => Promise<{
    config: DashboardConfig | null;
    filters: any[];
  }>;
  handleGenerateVariations: (
    processedData: Record<string, any>[],
    columnMapping: Record<string, string>
  ) => Promise<DashboardVariation[]>;
}

export function useDashboardGeneration() {
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isGeneratingDashboard, setIsGeneratingDashboard] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState<any[]>([]);

  const handleGetAISuggestion = async (
    processedData: Record<string, any>[]
  ): Promise<ChartSuggestion | null> => {
    if (processedData.length === 0) return null;

    setIsLoadingSuggestion(true);
    try {
      // Get API key from localStorage
      const apiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
      const suggestion = await suggestChart(processedData, apiKey);
      return suggestion;
    } catch (err) {
      console.error('AI suggestion error:', err);
      toast.error('Failed to get AI suggestion. Please check your API key in Settings.');
      return null;
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const handleGenerateDashboard = async (
    processedData: Record<string, any>[],
    columnMapping: Record<string, string>
  ): Promise<{
    config: DashboardConfig | null;
    filters: any[];
  }> => {
    if (processedData.length === 0) {
      toast.error('No data to visualize');
      return { config: null, filters: [] };
    }

    setIsLoadingSuggestion(true);
    setIsGeneratingDashboard(true);

    // Get API key from localStorage
    const apiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';

    // Show appropriate loading message
    const loadingMessage = apiKey
      ? 'Generating AI-powered dashboard...'
      : 'Generating dashboard...';
    const loadingToast = toast.loading(loadingMessage);

    try {
      // Use unified generator - handles AI/fallback automatically
      const config = await generateDashboard(
        processedData,
        columnMapping,
        {
          apiKey: apiKey || undefined,
          strategy: 'ai-full'
        }
      );

      // Validate fields exist in dataset
      const availableFields = Object.keys(columnMapping);
      const validation = validateDashboardFields(config, availableFields);

      if (!validation.isValid) {
        console.warn('Generated dashboard has invalid fields:', validation.errors);
        toast.dismiss(loadingToast);
        toast.warning('Some fields are invalid. Please check the dashboard.');
      } else {
        toast.dismiss(loadingToast);
        const successMessage = apiKey
          ? 'AI dashboard generated successfully!'
          : 'Dashboard generated successfully!';
        toast.success(successMessage);
      }

      // Generate filters from data
      const filters = generateFiltersFromData(processedData, columnMapping);
      setDashboardFilters(filters);

      return { config, filters };
    } catch (error) {
      console.error('Dashboard generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.dismiss(loadingToast);
      toast.error(`Failed to generate dashboard: ${errorMessage}`);
      return { config: null, filters: [] };
    } finally {
      setIsLoadingSuggestion(false);
      setIsGeneratingDashboard(false);
    }
  };

  const handleGenerateVariations = async (
    processedData: Record<string, any>[],
    columnMapping: Record<string, string>
  ): Promise<DashboardVariation[]> => {
    if (processedData.length === 0) {
      toast.error('No data available to generate variations');
      return [];
    }

    const apiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
    if (!apiKey) {
      toast.error('Please set your Gemini API key in Settings to generate variations');
      return [];
    }

    setIsGeneratingVariations(true);
    const loadingToast = toast.loading('Generating 3 dashboard variations...');

    try {
      const variations = await generateDashboardVariations(
        processedData,
        columnMapping,
        apiKey
      );

      toast.dismiss(loadingToast);
      toast.success(`Generated ${variations.length} dashboard variations!`);
      return variations;
    } catch (error) {
      console.error('Variation generation failed:', error);
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate variations: ${errorMessage}. Please check your API key.`);
      return [];
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  return {
    isLoadingSuggestion,
    isGeneratingDashboard,
    isGeneratingVariations,
    dashboardFilters,
    handleGetAISuggestion,
    handleGenerateDashboard,
    handleGenerateVariations,
  };
}

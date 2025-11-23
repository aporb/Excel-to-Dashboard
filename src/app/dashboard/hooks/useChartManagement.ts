import { useState } from 'react';
import { DashboardConfig, ChartType as DashboardChartType, KPIConfig } from '@/lib/dashboard-types';
import { improvementHistory, ImprovementRecord } from '@/lib/improvement-history';
import { toast } from 'sonner';

export interface UseChartManagementReturn {
  selectedChartId: string | null;
  setSelectedChartId: (id: string | null) => void;
  showKPIBuilder: boolean;
  setShowKPIBuilder: (show: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  showImprovementDialog: boolean;
  setShowImprovementDialog: (show: boolean) => void;
  improvingChartId: string | null;
  setImprovingChartId: (id: string | null) => void;
  showVariations: boolean;
  setShowVariations: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  handleChartTypeChange: (
    chartId: string,
    newType: DashboardChartType,
    dashboardConfig: DashboardConfig | null
  ) => DashboardConfig | null;
  handleAddKPI: (
    kpi: KPIConfig,
    dashboardConfig: DashboardConfig | null
  ) => DashboardConfig | null;
  handleLayoutChange: (newConfig: DashboardConfig) => DashboardConfig;
  handleImproveChart: (chartId: string) => void;
  handleChartImproved: (
    updatedConfig: any,
    changes: string[],
    reasoning: string,
    dashboardConfig: DashboardConfig | null,
    improvingChartId: string | null,
    onHistoryVersionChange: () => void
  ) => DashboardConfig | null;
  handleUndoImprovement: (
    record: ImprovementRecord,
    dashboardConfig: DashboardConfig | null,
    onHistoryVersionChange: () => void
  ) => DashboardConfig | null;
  handleClearHistory: (onHistoryVersionChange: () => void) => void;
}

export function useChartManagement() {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [showKPIBuilder, setShowKPIBuilder] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showImprovementDialog, setShowImprovementDialog] = useState(false);
  const [improvingChartId, setImprovingChartId] = useState<string | null>(null);
  const [showVariations, setShowVariations] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleChartTypeChange = (
    chartId: string,
    newType: DashboardChartType,
    dashboardConfig: DashboardConfig | null
  ): DashboardConfig | null => {
    if (!dashboardConfig) return null;

    const updatedConfig: DashboardConfig = {
      ...dashboardConfig,
      charts: dashboardConfig.charts.map(chart =>
        chart.id === chartId
          ? { ...chart, type: newType }
          : chart
      ),
      updatedAt: new Date().toISOString(),
    };

    toast.success(`Chart type changed to ${newType}`);
    return updatedConfig;
  };

  const handleAddKPI = (
    kpi: KPIConfig,
    dashboardConfig: DashboardConfig | null
  ): DashboardConfig | null => {
    if (!dashboardConfig) return null;

    const updatedConfig: DashboardConfig = {
      ...dashboardConfig,
      kpis: [...dashboardConfig.kpis, kpi],
      updatedAt: new Date().toISOString(),
    };

    // Add KPI to layout (first row if exists, or create new row)
    if (updatedConfig.layout.rows.length > 0) {
      const firstRow = updatedConfig.layout.rows[0];
      firstRow.widgets.push(kpi.id);
      firstRow.span.push(kpi.span || 6);
    } else {
      updatedConfig.layout.rows.push({
        id: crypto.randomUUID(),
        widgets: [kpi.id],
        span: [kpi.span || 6],
      });
    }

    toast.success('KPI added successfully!');
    return updatedConfig;
  };

  const handleLayoutChange = (newConfig: DashboardConfig): DashboardConfig => {
    toast.success('Layout updated');
    return newConfig;
  };

  const handleImproveChart = (chartId: string) => {
    setImprovingChartId(chartId);
    setShowImprovementDialog(true);
  };

  const handleChartImproved = (
    updatedConfig: any,
    changes: string[],
    reasoning: string,
    dashboardConfig: DashboardConfig | null,
    improvingChartId: string | null,
    onHistoryVersionChange: () => void
  ): DashboardConfig | null => {
    if (!dashboardConfig || !improvingChartId) return null;

    // Find old chart
    const oldChart = dashboardConfig.charts.find(c => c.id === improvingChartId);
    if (!oldChart) {
      toast.error('Chart not found');
      return null;
    }

    // Add to history
    improvementHistory.add({
      chartId: improvingChartId,
      userRequest: 'User improvement request',
      beforeConfig: oldChart,
      afterConfig: updatedConfig,
      changes,
      reasoning,
    });

    // Update dashboard config
    const newConfig: DashboardConfig = {
      ...dashboardConfig,
      charts: dashboardConfig.charts.map(c =>
        c.id === improvingChartId ? updatedConfig : c
      ),
      updatedAt: new Date().toISOString(),
    };

    onHistoryVersionChange();
    setShowImprovementDialog(false);
    setImprovingChartId(null);

    return newConfig;
  };

  const handleUndoImprovement = (
    record: ImprovementRecord,
    dashboardConfig: DashboardConfig | null,
    onHistoryVersionChange: () => void
  ): DashboardConfig | null => {
    if (!dashboardConfig) return null;

    const undoneConfig = improvementHistory.undo(record.id);
    if (!undoneConfig) {
      toast.error('Cannot undo improvement');
      return null;
    }

    // Update dashboard config
    const newConfig: DashboardConfig = {
      ...dashboardConfig,
      charts: dashboardConfig.charts.map(c =>
        c.id === record.chartId ? undoneConfig : c
      ),
      updatedAt: new Date().toISOString(),
    };

    onHistoryVersionChange();
    return newConfig;
  };

  const handleClearHistory = (onHistoryVersionChange: () => void) => {
    improvementHistory.clear();
    onHistoryVersionChange();
    toast.success('History cleared');
  };

  return {
    selectedChartId,
    setSelectedChartId,
    showKPIBuilder,
    setShowKPIBuilder,
    isEditMode,
    setIsEditMode,
    showImprovementDialog,
    setShowImprovementDialog,
    improvingChartId,
    setImprovingChartId,
    showVariations,
    setShowVariations,
    showHistory,
    setShowHistory,
    handleChartTypeChange,
    handleAddKPI,
    handleLayoutChange,
    handleImproveChart,
    handleChartImproved,
    handleUndoImprovement,
    handleClearHistory,
  };
}

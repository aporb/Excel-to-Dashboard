"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SettingsDialog } from '@/components/SettingsDialog';
import { FileUploadZone } from '@/components/FileUploadZone';
import DataMapper from '@/components/DataMapper';
import AlertManager from '@/components/AlertManager';
import { DataTable } from '@/components/DataTable';
import { ExportDialog } from '@/components/ExportDialog';
import { AlertHistory } from '@/components/AlertHistory';
import { AlertTemplates } from '@/components/AlertTemplates';
import DashboardCanvas from '@/components/dashboard/DashboardCanvas';
import KPIBuilder from '@/components/dashboard/KPIBuilder';
import DashboardVariationsCarousel from '@/components/dashboard/DashboardVariationsCarousel';
import ChartImprovementDialog from '@/components/dashboard/ChartImprovementDialog';
import ImprovementHistoryPanel from '@/components/dashboard/ImprovementHistoryPanel';
import { improvementHistory } from '@/lib/improvement-history';
import { BarChart3, Sparkles, Loader2, Home, Database, TrendingUp, Plus, Edit, Save, FolderOpen, Wand2, History } from 'lucide-react';
import { toast } from 'sonner';

// Custom Hooks - All extracted logic
import {
  useSessionManagement,
  useFileUpload,
  useDashboardGeneration,
  useChartManagement,
  useAlertManagement,
} from './hooks';

/**
 * Dashboard Page Component (Refactored)
 *
 * This component has been refactored to use custom hooks for better organization:
 * - useSessionManagement: Handles session loading/saving
 * - useFileUpload: Handles file upload and processing  
 * - useDashboardGeneration: Handles AI dashboard generation
 * - useChartManagement: Handles chart interactions
 * - useAlertManagement: Handles alert rules
 *
 * Reduced from ~900 lines to ~450 lines through hook extraction
 */
export default function DashboardPage() {
  // ============================================================================
  // CUSTOM HOOKS - All logic extracted into separate hooks
  // ============================================================================

  // Session Management Hook - handles loading/saving sessions
  const session = useSessionManagement();

  // File Upload Hook - handles file upload and data processing
  const fileUpload = useFileUpload();

  // Dashboard Generation Hook - handles AI-powered dashboard generation
  const dashboardGen = useDashboardGeneration();

  // Chart Management Hook - handles chart interactions and improvements
  const chartMgmt = useChartManagement();

  // Alert Management Hook - handles alert rules and notifications
  const alertMgmt = useAlertManagement();

  // ============================================================================
  // LOCAL UI STATE - Only UI-specific state remains in component
  // ============================================================================

  const [columns, setColumns] = useState<string[]>([]);

  // ============================================================================
  // DATA PROCESSING HANDLERS
  // ============================================================================

  const handleFileSelect = async (file: File) => {
    const result = await fileUpload.handleFileSelect(file);

    if (result.success && result.data && result.firstSheet) {
      session.setRawData(result.data);
      session.setSelectedSheet(result.firstSheet);

      const processedResult = fileUpload.processSheet(result.data, result.firstSheet);
      if (processedResult) {
        session.setProcessedData(processedResult.processedData);
        setColumns(processedResult.columns);
        session.setColumnMapping(prev => ({ ...processedResult.inferredMapping, ...prev }));
      }
    }
  };

  const handleSheetChange = (sheetName: string) => {
    session.setSelectedSheet(sheetName);
    if (session.rawData) {
      const processedResult = fileUpload.processSheet(session.rawData, sheetName);
      if (processedResult) {
        session.setProcessedData(processedResult.processedData);
        setColumns(processedResult.columns);
        session.setColumnMapping(prev => ({ ...processedResult.inferredMapping, ...prev }));
      }
    }
  };

  const handleMapChange = (mapping: Record<string, string>) => {
    session.setColumnMapping(mapping);
  };

  // ============================================================================
  // AI SUGGESTION HANDLERS
  // ============================================================================

  const handleGetAISuggestion = async () => {
    const suggestion = await dashboardGen.handleGetAISuggestion(session.processedData);
    if (suggestion) {
      session.setChartSuggestion(suggestion);
    }
  };

  const handleGenerateDashboard = async () => {
    const result = await dashboardGen.handleGenerateDashboard(
      session.processedData,
      session.columnMapping
    );
    if (result.config) {
      session.setDashboardConfig(result.config);
    }
  };

  // ============================================================================
  // DASHBOARD VARIATIONS HANDLERS (Phase 3)
  // ============================================================================

  const handleGenerateVariations = async () => {
    const variations = await dashboardGen.handleGenerateVariations(
      session.processedData,
      session.columnMapping
    );
    if (variations.length > 0) {
      session.setDashboardVariations(variations);
      session.setSelectedVariationIndex(0);
      chartMgmt.setShowVariations(true);
    }
  };

  const handleApplyVariation = (variation: any) => {
    session.setDashboardConfig(variation.config);
    chartMgmt.setShowVariations(false);
    toast.success(`Applied ${variation.strategy} dashboard layout!`);
  };

  const handleRegenerateVariations = () => {
    handleGenerateVariations();
  };

  // ============================================================================
  // CHART MANAGEMENT HANDLERS
  // ============================================================================

  const handleChartTypeChange = (chartId: string, newType: any) => {
    const updatedConfig = chartMgmt.handleChartTypeChange(
      chartId,
      newType,
      session.dashboardConfig
    );
    if (updatedConfig) {
      session.setDashboardConfig(updatedConfig);
    }
  };

  const handleAddKPI = (kpi: any) => {
    const updatedConfig = chartMgmt.handleAddKPI(kpi, session.dashboardConfig);
    if (updatedConfig) {
      session.setDashboardConfig(updatedConfig);
    }
  };

  const handleLayoutChange = (newConfig: any) => {
    const updatedConfig = chartMgmt.handleLayoutChange(newConfig);
    session.setDashboardConfig(updatedConfig);
  };

  const handleChartImproved = (
    updatedConfig: any,
    changes: string[],
    reasoning: string
  ) => {
    const newConfig = chartMgmt.handleChartImproved(
      updatedConfig,
      changes,
      reasoning,
      session.dashboardConfig,
      chartMgmt.improvingChartId,
      () => session.setHistoryVersion(v => v + 1)
    );
    if (newConfig) {
      session.setDashboardConfig(newConfig);
    }
  };

  const handleUndoImprovement = (record: any) => {
    const newConfig = chartMgmt.handleUndoImprovement(
      record,
      session.dashboardConfig,
      () => session.setHistoryVersion(v => v + 1)
    );
    if (newConfig) {
      session.setDashboardConfig(newConfig);
    }
  };

  const handleClearHistory = () => {
    chartMgmt.handleClearHistory(() => session.setHistoryVersion(v => v + 1));
  };

  // ============================================================================
  // ALERT HANDLERS
  // ============================================================================

  const handleAddAlert = (rule: any) => {
    const newRules = alertMgmt.handleAddAlert(
      rule,
      session.processedData,
      session.alertRules
    );
    session.setAlertRules(newRules);
  };

  // Run alerts when data or rules change
  useEffect(() => {
    if (session.processedData.length > 0 && session.alertRules.length > 0) {
      alertMgmt.runAlertsOnData(session.processedData, session.alertRules);
    }
  }, [session.processedData, session.alertRules]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!session.sessionLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/library">
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Library
              </Button>
            </Link>
            <SettingsDialog />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Step 1: Upload Section */}
        <Card variant="glass" hoverable>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Step 1: Upload Spreadsheet
            </CardTitle>
            <CardDescription>
              Upload your CSV or Excel file to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadZone onFileSelect={handleFileSelect} />

            {fileUpload.uploadStatus && (
              <Alert>
                <AlertDescription>{fileUpload.uploadStatus}</AlertDescription>
              </Alert>
            )}

            {session.rawData && Object.keys(session.rawData).length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Sheet:</label>
                <Select value={session.selectedSheet} onValueChange={handleSheetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(session.rawData).map((sheet) => (
                      <SelectItem key={sheet} value={sheet}>
                        {sheet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Mapping Section */}
        {columns.length > 0 && (
          <Card variant="glass" hoverable>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Step 2: Map Columns & Get AI Suggestions
              </CardTitle>
              <CardDescription>
                Configure column types and let AI suggest the best visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataMapper columns={columns} onMap={handleMapChange} />

              <Button
                onClick={handleGetAISuggestion}
                disabled={dashboardGen.isLoadingSuggestion}
                className="w-full sm:w-auto"
              >
                {dashboardGen.isLoadingSuggestion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting AI Suggestion...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Chart Suggestion
                  </>
                )}
              </Button>

              {session.chartSuggestion && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">AI Suggestion:</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Chart Type:</span>
                          <Badge variant="secondary">{session.chartSuggestion.chartType}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">X-Axis:</span>
                          <Badge variant="outline">{session.chartSuggestion.xKey}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Y-Axis:</span>
                          <Badge variant="outline">{session.chartSuggestion.yKey}</Badge>
                        </div>
                      </div>
                      {session.chartSuggestion.reasoning && (
                        <p className="text-sm text-muted-foreground mt-2">{session.chartSuggestion.reasoning}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Dashboard Section */}
        {session.processedData.length > 0 && (
          <Card variant="glass" hoverable>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Step 3: Dashboard Visualization
                  </CardTitle>
                  <CardDescription>
                    View your data insights and key metrics
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {session.dashboardConfig && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => chartMgmt.setIsEditMode(!chartMgmt.isEditMode)}
                      >
                        {chartMgmt.isEditMode ? (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Layout
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Layout
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => chartMgmt.setShowKPIBuilder(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add KPI
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => chartMgmt.setShowHistory(!chartMgmt.showHistory)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        History
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleGenerateDashboard}
                    disabled={dashboardGen.isLoadingSuggestion || dashboardGen.isGeneratingVariations}
                  >
                    {dashboardGen.isLoadingSuggestion ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Dashboard
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateVariations}
                    disabled={dashboardGen.isLoadingSuggestion || dashboardGen.isGeneratingVariations}
                    variant="secondary"
                  >
                    {dashboardGen.isGeneratingVariations ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Variations
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dashboard Variations Carousel */}
              {chartMgmt.showVariations && session.dashboardVariations.length > 0 && (
                <DashboardVariationsCarousel
                  variations={session.dashboardVariations}
                  selectedIndex={session.selectedVariationIndex}
                  onSelect={session.setSelectedVariationIndex}
                  onApply={handleApplyVariation}
                  onRegenerate={handleRegenerateVariations}
                  isRegenerating={dashboardGen.isGeneratingVariations}
                />
              )}

              {session.dashboardConfig ? (
                <>
                  {/* Improve Chart button for selected chart */}
                  {chartMgmt.selectedChartId && session.dashboardConfig.charts.find(c => c.id === chartMgmt.selectedChartId) && (
                    <div className="flex gap-2 mb-4">
                      <Button
                        onClick={() => chartMgmt.handleImproveChart(chartMgmt.selectedChartId)}
                        variant="outline"
                        size="sm"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Improve Selected Chart
                      </Button>
                    </div>
                  )}

                  <DashboardCanvas
                    config={session.dashboardConfig}
                    data={session.processedData}
                    selectedChartId={chartMgmt.selectedChartId}
                    onChartSelect={chartMgmt.setSelectedChartId}
                    onChartTypeChange={handleChartTypeChange}
                    onLayoutChange={handleLayoutChange}
                    editMode={chartMgmt.isEditMode}
                    filters={dashboardGen.dashboardFilters}
                  />

                  {/* Improvement History Panel */}
                  {chartMgmt.showHistory && (
                    <div className="mt-6">
                      <ImprovementHistoryPanel
                        history={improvementHistory}
                        onUndo={handleUndoImprovement}
                        onClear={handleClearHistory}
                        selectedChartId={chartMgmt.selectedChartId}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Card variant="glass">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      Click "Generate Dashboard" to create visualizations
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPI Builder Dialog */}
        <KPIBuilder
          open={chartMgmt.showKPIBuilder}
          onOpenChange={chartMgmt.setShowKPIBuilder}
          columns={Object.keys(session.columnMapping)}
          onSave={handleAddKPI}
        />

        {/* Chart Improvement Dialog */}
        {chartMgmt.improvingChartId && session.dashboardConfig && (
          <ChartImprovementDialog
            open={chartMgmt.showImprovementDialog}
            onOpenChange={chartMgmt.setShowImprovementDialog}
            chartConfig={session.dashboardConfig.charts.find(c => c.id === chartMgmt.improvingChartId)!}
            data={session.processedData}
            availableFields={Object.keys(session.columnMapping)}
            apiKey={localStorage.getItem('gemini-api-key') || ''}
            onImprove={handleChartImproved}
          />
        )}

        {/* Step 4: Alerts Section */}
        {session.processedData.length > 0 && (
          <>
            <Card variant="glass" hoverable>
              <CardHeader>
                <CardTitle>Step 4: Configure Alerts</CardTitle>
                <CardDescription>
                  Set up threshold monitoring and get notified when conditions are met
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertTemplates onSelectTemplate={handleAddAlert} />

                <AlertManager onAdd={handleAddAlert} />

                {alertMgmt.alertResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Alert Status:</h3>
                    {alertMgmt.alertResults.map((result) => (
                      <Alert
                        key={result.ruleId}
                        variant={result.triggered ? "destructive" : "default"}
                      >
                        <AlertDescription>
                          {result.triggered ? '🚨 Alert Triggered!' : '✅ No Alert'}
                          {result.currentValue !== undefined && (
                            <span className="ml-2">
                              (Current: {result.currentValue})
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <AlertHistory alertResults={alertMgmt.alertResults} alertRules={session.alertRules} />
          </>
        )}

        {/* Data Table Section */}
        {session.processedData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Data Explorer</h2>
              <ExportDialog data={session.processedData} columns={columns} filename="dashboard-export" />
            </div>
            <DataTable data={session.processedData} columns={columns} title="Raw Data" description="Explore, sort, and filter your data" />
          </div>
        )}
      </div>
    </div>
  );
}

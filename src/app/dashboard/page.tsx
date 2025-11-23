"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import DashboardGrid from '@/components/DashboardGrid';
import ChartWidget from '@/components/ChartWidget';
import AlertManager from '@/components/AlertManager';
import { DataSummary } from '@/components/dashboard/DataSummary';
import { ChartTypeSelector } from '@/components/dashboard/ChartTypeSelector';
import { LineChartWidget } from '@/components/charts/LineChartWidget';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { AreaChartWidget } from '@/components/charts/AreaChartWidget';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { DataTable } from '@/components/DataTable';
import { ExportDialog } from '@/components/ExportDialog';
import { AlertHistory } from '@/components/AlertHistory';
import { AlertTemplates } from '@/components/AlertTemplates';
import { rowsToObjects } from '@/lib/data-processor';
import { runAlerts, AlertRule, AlertResult } from '@/lib/alert-engine';
import { suggestChart, ChartSuggestion } from '@/lib/openai-ai';
import { sessionManager, DashboardSession } from '@/lib/session-manager';
import { DataValidator } from '@/lib/data-schemas';
import { ChartIntelligence, ChartType } from '@/lib/chart-intelligence';
import { KPICalculator } from '@/lib/kpi-calculator';
import { notificationManager } from '@/lib/notification-manager';
import { DashboardConfig, ChartType as DashboardChartType, KPIConfig } from '@/lib/dashboard-types';
import { generateBasicDashboard } from '@/lib/dashboard-generator-basic';
import { generateDashboardWithAI, validateDashboardFields } from '@/lib/ai-dashboard-generator';
import { generateFiltersFromData } from '@/lib/filter-utils';
import DashboardCanvas from '@/components/dashboard/DashboardCanvas';
import KPIBuilder from '@/components/dashboard/KPIBuilder';
// PHASE 3 IMPORTS
import { generateDashboardVariations, DashboardVariation } from '@/lib/dashboard-variations';
import { improveChartWithAI } from '@/lib/chart-improvement';
import { improvementHistory, ImprovementRecord } from '@/lib/improvement-history';
import DashboardVariationsCarousel from '@/components/dashboard/DashboardVariationsCarousel';
import ChartImprovementDialog from '@/components/dashboard/ChartImprovementDialog';
import ImprovementHistoryPanel from '@/components/dashboard/ImprovementHistoryPanel';
import { BarChart3, Sparkles, Loader2, Home, Database, TrendingUp, Bell, Plus, Edit, Save, FolderOpen, Wand2, History } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [uploadStatus, setUploadStatus] = useState('');
    const [rawData, setRawData] = useState<Record<string, any[]> | null>(null);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [processedData, setProcessedData] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [chartSuggestion, setChartSuggestion] = useState<ChartSuggestion | null>(null);
    const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
    const [showKPIBuilder, setShowKPIBuilder] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
    const [alertResults, setAlertResults] = useState<AlertResult[]>([]);
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    const [dashboardFilters, setDashboardFilters] = useState<any[]>([]);

    // PHASE 3 STATE
    const [dashboardVariations, setDashboardVariations] = useState<DashboardVariation[]>([]);
    const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
    const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
    const [showImprovementDialog, setShowImprovementDialog] = useState(false);
    const [improvingChartId, setImprovingChartId] = useState<string | null>(null);
    const [historyVersion, setHistoryVersion] = useState(0); // Force re-render for history
    const [showVariations, setShowVariations] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Load session on component mount
    useEffect(() => {
        const loadSession = async () => {
            try {
                // Try to load existing session or create new one
                const sessionIds = await sessionManager.getAllSessionIds();
                let session: DashboardSession | null = null;

                if (sessionIds.length > 0) {
                    // Load the most recent session
                    const latestSessionId = sessionIds[sessionIds.length - 1];
                    session = await sessionManager.loadSession(latestSessionId);
                }

                if (session) {
                    // Restore session state
                    setCurrentSessionId(session.id);
                    setRawData(session.uploadedData);
                    setProcessedData(session.processedData);
                    setColumnMapping(session.columnMapping);
                    setChartSuggestion(session.chartSuggestion || null);
                    setDashboardConfig(session.dashboardConfig || null);
                    setAlertRules(session.alertRules);
                    setSelectedSheet(session.selectedSheet || '');

                    // PHASE 3: Restore variations and history
                    if (session.dashboardVariations) {
                        setDashboardVariations(session.dashboardVariations);
                        setSelectedVariationIndex(session.selectedVariationIndex || 0);
                    }
                    if (session.improvementHistory) {
                        improvementHistory.fromJSON(JSON.stringify(session.improvementHistory));
                        setHistoryVersion(v => v + 1);
                    }

                    // Process data if available
                    if (session.processedData.length > 0) {
                        const sampleData = session.processedData.slice(0, 10);
                        const inferredMapping = DataValidator.inferColumnTypes(sampleData);
                        setColumnMapping(prev => ({ ...inferredMapping, ...prev }));
                    }

                    // Run alerts if rules exist
                    if (session.alertRules.length > 0 && session.processedData.length > 0) {
                        const results = runAlerts(session.processedData, session.alertRules);
                        setAlertResults(results);
                    }
                } else {
                    // Create new session
                    const newSessionId = await sessionManager.createSession();
                    setCurrentSessionId(newSessionId);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
                // Create new session as fallback
                const newSessionId = await sessionManager.createSession();
                setCurrentSessionId(newSessionId);
            } finally {
                setSessionLoaded(true);
            }
        };

        loadSession();
    }, []);

    // Auto-save session when state changes
    useEffect(() => {
        if (!sessionLoaded || !currentSessionId) return;

        const saveSession = async () => {
            try {
                const session: DashboardSession = {
                    id: currentSessionId,
                    uploadedData: rawData || {},
                    processedData,
                    columnMapping,
                    chartSuggestion: chartSuggestion || undefined,
                    dashboardConfig: dashboardConfig || undefined,
                    alertRules,
                    selectedSheet: selectedSheet || undefined,
                    // PHASE 3: Save variations and history
                    dashboardVariations: dashboardVariations.length > 0 ? dashboardVariations : undefined,
                    selectedVariationIndex: dashboardVariations.length > 0 ? selectedVariationIndex : undefined,
                    improvementHistory: improvementHistory.getAll(),
                    lastUpdated: new Date().toISOString()
                };

                await sessionManager.saveSession(session);
            } catch (error) {
                console.error('Failed to save session:', error);
            }
        };

        // Debounce saves to avoid excessive writes
        const timeoutId = setTimeout(saveSession, 1000);
        return () => clearTimeout(timeoutId);
    }, [rawData, processedData, columnMapping, chartSuggestion, dashboardConfig, alertRules, selectedSheet, currentSessionId, sessionLoaded, dashboardVariations, selectedVariationIndex, historyVersion]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadStatus('Uploading and parsing...');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setRawData(res.data.data);
                const sheets = Object.keys(res.data.data);
                if (sheets.length > 0) {
                    const firstSheet = sheets[0];
                    setSelectedSheet(firstSheet);
                    processSheet(res.data.data, firstSheet);
                }
                setUploadStatus('Upload successful!');
            } else {
                setUploadStatus('Upload failed: ' + res.data.error);
            }
        } catch (err) {
            console.error(err);
            setUploadStatus('Upload failed');
        }
    };

    const processSheet = (data: Record<string, any[]>, sheetName: string) => {
        const rows = data[sheetName];
        if (!rows || rows.length === 0) return;

        // Validate workbook data
        const validation = DataValidator.validateWorkbookData(data);
        if (!validation.success) {
            console.error('Workbook validation failed:', validation.error);
            setUploadStatus('Data validation failed. Please check your file format.');
            return;
        }

        const objects = rowsToObjects(rows);

        // Validate and clean data using Zod
        const inferredMapping = DataValidator.inferColumnTypes(objects.slice(0, 10));
        const validationResult = DataValidator.validateAndCleanData(rows, inferredMapping);

        if (validationResult.warnings && validationResult.warnings.length > 0) {
            console.warn('Data validation warnings:', validationResult.warnings);
        }

        if (!validationResult.isValid) {
            console.error('Data validation errors:', validationResult.errors);
            setUploadStatus(`Data processing completed with ${validationResult.errors.length} errors. Check console for details.`);
        }

        setProcessedData(validationResult.cleanedData);

        if (rows[0]) {
            setColumns(rows[0] as string[]);
        }

        // Update column mapping with inferred types
        setColumnMapping(prev => ({ ...inferredMapping, ...prev }));
    };

    const handleSheetChange = (sheetName: string) => {
        setSelectedSheet(sheetName);
        if (rawData) {
            processSheet(rawData, sheetName);
        }
    };

    const handleMapChange = (mapping: Record<string, string>) => {
        setColumnMapping(mapping);
    };

    const handleGetAISuggestion = async () => {
        if (processedData.length === 0) return;

        setIsLoadingSuggestion(true);
        try {
            const suggestion = await suggestChart(processedData);
            setChartSuggestion(suggestion);
        } catch (err) {
            console.error('AI suggestion error:', err);
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleGenerateDashboard = async () => {
        if (processedData.length === 0) {
            toast.error('No data to visualize');
            return;
        }

        setIsLoadingSuggestion(true);
        const loadingToast = toast.loading('Generating AI-powered dashboard...');

        try {
            // Get API key from localStorage
            const apiKey = localStorage.getItem('gemini-api-key') || '';

            let config: DashboardConfig;

            if (apiKey) {
                // Try AI-powered generation
                try {
                    config = await generateDashboardWithAI(
                        processedData,
                        columnMapping,
                        apiKey
                    );

                    // Validate fields exist in dataset
                    const availableFields = Object.keys(columnMapping);
                    const validation = validateDashboardFields(config, availableFields);

                    if (!validation.isValid) {
                        console.warn('AI suggested invalid fields:', validation.errors);
                        toast.dismiss(loadingToast);
                        toast.warning('AI suggested some invalid fields. Using fallback.');

                        // Fall back to basic generator
                        config = await generateBasicDashboard(processedData, columnMapping);
                    } else {
                        toast.dismiss(loadingToast);
                        toast.success('AI dashboard generated successfully!');
                    }
                } catch (aiError) {
                    console.error('AI generation failed:', aiError);
                    toast.dismiss(loadingToast);
                    toast.warning('AI generation failed. Using basic generator.');

                    // Fall back to basic generator
                    config = await generateBasicDashboard(processedData, columnMapping);
                }
            } else {
                // No API key, use basic generator
                toast.dismiss(loadingToast);
                toast.info('Configure Gemini API key in Settings for AI-powered dashboards');
                config = await generateBasicDashboard(processedData, columnMapping);
            }

            setDashboardConfig(config);

            // Generate filters from data
            const filters = generateFiltersFromData(processedData, columnMapping);
            setDashboardFilters(filters);
        } catch (error) {
            console.error('Dashboard generation error:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to generate dashboard');
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleChartTypeChange = (chartId: string, newType: DashboardChartType) => {
        if (!dashboardConfig) return;

        const updatedConfig: DashboardConfig = {
            ...dashboardConfig,
            charts: dashboardConfig.charts.map(chart =>
                chart.id === chartId
                    ? { ...chart, type: newType }
                    : chart
            ),
            updatedAt: new Date().toISOString(),
        };

        setDashboardConfig(updatedConfig);
        toast.success(`Chart type changed to ${newType}`);
    };

    const handleAddKPI = (kpi: KPIConfig) => {
        if (!dashboardConfig) return;

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

        setDashboardConfig(updatedConfig);
        toast.success('KPI added successfully!');
    };

    const handleLayoutChange = (newConfig: DashboardConfig) => {
        setDashboardConfig(newConfig);
        toast.success('Layout updated');
    };

    const handleAddAlert = (rule: AlertRule) => {
        const newRules = [...alertRules, rule];
        setAlertRules(newRules);

        // Run alerts immediately
        if (processedData.length > 0) {
            const results = runAlerts(processedData, newRules);
            setAlertResults(results);

            // Send notification if alert is triggered
            results.forEach((result) => {
                if (result.triggered) {
                    notificationManager.notifyAlert(
                        rule.metric,
                        `Alert triggered: ${rule.metric} ${rule.condition} ${rule.threshold}`,
                        'warning'
                    );
                }
            });
        }
    };

    const handleFileSelect = async (file: File) => {
        setUploadStatus('Uploading and parsing...');
        toast.loading('Processing file...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.success) {
                setRawData(res.data.data);
                const sheets = Object.keys(res.data.data);
                if (sheets.length > 0) {
                    const firstSheet = sheets[0];
                    setSelectedSheet(firstSheet);
                    processSheet(res.data.data, firstSheet);
                }
                setUploadStatus('Upload successful!');
                toast.success('File uploaded successfully!');
            } else {
                setUploadStatus('Upload failed: ' + res.data.error);
                toast.error('Upload failed: ' + res.data.error);
            }
        } catch (err) {
            console.error(err);
            setUploadStatus('Upload failed');
            toast.error('Upload failed. Please try again.');
        }
    };

    // PHASE 3 HANDLERS

    // P9: Dashboard Variations Handlers
    const handleGenerateVariations = async () => {
        if (processedData.length === 0) {
            toast.error('No data available to generate variations');
            return;
        }

        const apiKey = localStorage.getItem('gemini-api-key') || '';
        if (!apiKey) {
            toast.error('Please set your Gemini API key in Settings to generate variations');
            return;
        }

        setIsGeneratingVariations(true);
        const loadingToast = toast.loading('Generating 3 dashboard variations...');

        try {
            const variations = await generateDashboardVariations(
                processedData,
                columnMapping,
                apiKey
            );

            setDashboardVariations(variations);
            setSelectedVariationIndex(0);
            setShowVariations(true);
            toast.dismiss(loadingToast);
            toast.success(`Generated ${variations.length} dashboard variations!`);
        } catch (error) {
            console.error('Variation generation failed:', error);
            toast.dismiss(loadingToast);
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate variations';
            toast.error(errorMessage);
        } finally {
            setIsGeneratingVariations(false);
        }
    };

    const handleApplyVariation = (variation: DashboardVariation) => {
        setDashboardConfig(variation.config);
        setShowVariations(false);
        toast.success(`Applied ${variation.strategy} dashboard layout!`);
    };

    const handleRegenerateVariations = () => {
        handleGenerateVariations();
    };

    // P10: Chart Improvement Handlers
    const handleImproveChart = (chartId: string) => {
        setImprovingChartId(chartId);
        setShowImprovementDialog(true);
    };

    const handleChartImproved = (
        updatedConfig: any,
        changes: string[],
        reasoning: string
    ) => {
        if (!dashboardConfig || !improvingChartId) return;

        // Find old chart
        const oldChart = dashboardConfig.charts.find(c => c.id === improvingChartId);
        if (!oldChart) {
            toast.error('Chart not found');
            return;
        }

        // Add to history
        improvementHistory.add({
            chartId: improvingChartId,
            userRequest: 'User improvement request', // This will be set from dialog
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

        setDashboardConfig(newConfig);
        setHistoryVersion(v => v + 1);
        setShowImprovementDialog(false);
        setImprovingChartId(null);
    };

    const handleUndoImprovement = (record: ImprovementRecord) => {
        if (!dashboardConfig) return;

        const undoneConfig = improvementHistory.undo(record.id);
        if (!undoneConfig) {
            toast.error('Cannot undo improvement');
            return;
        }

        // Update dashboard config
        const newConfig: DashboardConfig = {
            ...dashboardConfig,
            charts: dashboardConfig.charts.map(c =>
                c.id === record.chartId ? undoneConfig : c
            ),
            updatedAt: new Date().toISOString(),
        };

        setDashboardConfig(newConfig);
        setHistoryVersion(v => v + 1);
    };

    const handleClearHistory = () => {
        improvementHistory.clear();
        setHistoryVersion(v => v + 1);
        toast.success('History cleared');
    };

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
                {/* Upload Section */}
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
                        
                        {uploadStatus && (
                            <Alert>
                                <AlertDescription>{uploadStatus}</AlertDescription>
                            </Alert>
                        )}

                        {rawData && Object.keys(rawData).length > 1 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Sheet:</label>
                                <Select value={selectedSheet} onValueChange={handleSheetChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a sheet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(rawData).map((sheet) => (
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

                {/* Mapping Section */}
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
                                disabled={isLoadingSuggestion}
                                className="w-full sm:w-auto"
                            >
                                {isLoadingSuggestion ? (
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

                            {chartSuggestion && (
                                <Alert>
                                    <Sparkles className="h-4 w-4" />
                                    <AlertDescription>
                                        <div className="space-y-2">
                                            <p className="font-semibold">AI Suggestion:</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">Chart Type:</span>
                                                    <Badge variant="secondary">{chartSuggestion.chartType}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">X-Axis:</span>
                                                    <Badge variant="outline">{chartSuggestion.xKey}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">Y-Axis:</span>
                                                    <Badge variant="outline">{chartSuggestion.yKey}</Badge>
                                                </div>
                                            </div>
                                            {chartSuggestion.reasoning && (
                                                <p className="text-sm text-muted-foreground mt-2">{chartSuggestion.reasoning}</p>
                                            )}
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Dashboard Section */}
                {processedData.length > 0 && (
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
                                    {dashboardConfig && (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditMode(!isEditMode)}
                                            >
                                                {isEditMode ? (
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
                                                onClick={() => setShowKPIBuilder(true)}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add KPI
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowHistory(!showHistory)}
                                            >
                                                <History className="mr-2 h-4 w-4" />
                                                History
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={handleGenerateDashboard}
                                        disabled={isLoadingSuggestion || isGeneratingVariations}
                                    >
                                        {isLoadingSuggestion ? (
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
                                        disabled={isLoadingSuggestion || isGeneratingVariations}
                                        variant="secondary"
                                    >
                                        {isGeneratingVariations ? (
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
                            {/* PHASE 3: Dashboard Variations Carousel */}
                            {showVariations && dashboardVariations.length > 0 && (
                                <DashboardVariationsCarousel
                                    variations={dashboardVariations}
                                    selectedIndex={selectedVariationIndex}
                                    onSelect={setSelectedVariationIndex}
                                    onApply={handleApplyVariation}
                                    onRegenerate={handleRegenerateVariations}
                                    isRegenerating={isGeneratingVariations}
                                />
                            )}

                            {dashboardConfig ? (
                                <>
                                    {/* Add Improve Chart button on each chart */}
                                    {selectedChartId && dashboardConfig.charts.find(c => c.id === selectedChartId) && (
                                        <div className="flex gap-2 mb-4">
                                            <Button
                                                onClick={() => handleImproveChart(selectedChartId)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Wand2 className="mr-2 h-4 w-4" />
                                                Improve Selected Chart
                                            </Button>
                                        </div>
                                    )}

                                    <DashboardCanvas
                                        config={dashboardConfig}
                                        data={processedData}
                                        selectedChartId={selectedChartId}
                                        onChartSelect={setSelectedChartId}
                                        onChartTypeChange={handleChartTypeChange}
                                        onLayoutChange={handleLayoutChange}
                                        editMode={isEditMode}
                                        filters={dashboardFilters}
                                    />

                                    {/* PHASE 3: Improvement History Panel */}
                                    {showHistory && (
                                        <div className="mt-6">
                                            <ImprovementHistoryPanel
                                                history={improvementHistory}
                                                onUndo={handleUndoImprovement}
                                                onClear={handleClearHistory}
                                                selectedChartId={selectedChartId}
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
                    open={showKPIBuilder}
                    onOpenChange={setShowKPIBuilder}
                    columns={Object.keys(columnMapping)}
                    onSave={handleAddKPI}
                />

                {/* PHASE 3: Chart Improvement Dialog */}
                {improvingChartId && dashboardConfig && (
                    <ChartImprovementDialog
                        open={showImprovementDialog}
                        onOpenChange={setShowImprovementDialog}
                        chartConfig={dashboardConfig.charts.find(c => c.id === improvingChartId)!}
                        data={processedData}
                        availableFields={Object.keys(columnMapping)}
                        apiKey={localStorage.getItem('gemini-api-key') || ''}
                        onImprove={handleChartImproved}
                    />
                )}

                {/* Alerts Section */}
                {processedData.length > 0 && (
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

                                {alertResults.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Alert Status:</h3>
                                        {alertResults.map((result) => (
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

                        <AlertHistory alertResults={alertResults} alertRules={alertRules} />
                    </>
                )}

                {/* Data Table Section */}
                {processedData.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Data Explorer</h2>
                            <ExportDialog data={processedData} columns={columns} filename="dashboard-export" />
                        </div>
                        <DataTable data={processedData} columns={columns} title="Raw Data" description="Explore, sort, and filter your data" />
                    </div>
                )}
            </div>
        </div>
    );
}

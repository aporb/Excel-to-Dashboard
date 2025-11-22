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
import { BarChart3, Sparkles, Loader2, Home, Database, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [uploadStatus, setUploadStatus] = useState('');
    const [rawData, setRawData] = useState<Record<string, any[]> | null>(null);
    const [selectedSheet, setSelectedSheet] = useState<string>('');
    const [processedData, setProcessedData] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [chartSuggestion, setChartSuggestion] = useState<ChartSuggestion | null>(null);
    const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
    const [alertResults, setAlertResults] = useState<AlertResult[]>([]);
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);

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
                    setAlertRules(session.alertRules);
                    setSelectedSheet(session.selectedSheet || '');

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
                    alertRules,
                    selectedSheet: selectedSheet || undefined,
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
    }, [rawData, processedData, columnMapping, chartSuggestion, alertRules, selectedSheet, currentSessionId, sessionLoaded]);

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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <Home className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">Dashboard</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <SettingsDialog />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Upload Section */}
                <Card>
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
                    <Card>
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
                                        <div className="space-y-1">
                                            <p className="font-semibold">AI Suggestion:</p>
                                            <p>Chart Type: <Badge variant="secondary">{chartSuggestion.chartType}</Badge></p>
                                            <p>X-Axis: <Badge variant="outline">{chartSuggestion.xKey}</Badge></p>
                                            <p>Y-Axis: <Badge variant="outline">{chartSuggestion.yKey}</Badge></p>
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Step 3: Dashboard Visualization
                            </CardTitle>
                            <CardDescription>
                                View your data insights and key metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DashboardGrid>
                                {chartSuggestion && (
                                    <ChartWidget
                                        data={processedData}
                                        xKey={chartSuggestion.xKey}
                                        yKey={chartSuggestion.yKey}
                                        title={`${chartSuggestion.yKey} over ${chartSuggestion.xKey}`}
                                    />
                                )}

                                {/* KPI Cards */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{processedData.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium">Columns</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold">{columns.length}</div>
                                    </CardContent>
                                </Card>
                            </DashboardGrid>
                        </CardContent>
                    </Card>
                )}

                {/* Alerts Section */}
                {processedData.length > 0 && (
                    <>
                        <Card>
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

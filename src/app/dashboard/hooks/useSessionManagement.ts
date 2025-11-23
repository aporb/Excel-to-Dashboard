import { useState, useEffect } from 'react';
import { sessionManager, DashboardSession } from '@/lib/session-manager';
import { DataValidator } from '@/lib/data-schemas';
import { runAlerts, AlertRule, AlertResult } from '@/lib/alert-engine';
import { improvementHistory } from '@/lib/improvement-history';
import { DashboardConfig, ChartSuggestion } from '@/lib/dashboard-types';
import { DashboardVariation } from '@/lib/dashboard-variations';
import { toast } from 'sonner';

export interface UseSessionManagementReturn {
  currentSessionId: string | null;
  sessionLoaded: boolean;
  isLoadingSession: boolean;
  loadSession: () => Promise<void>;
  saveSessionData: (data: Partial<DashboardSession>) => void;
  createNewSession: () => Promise<void>;
}

export function useSessionManagement() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // State that will be managed by the session
  const [rawData, setRawData] = useState<Record<string, any[]> | null>(null);
  const [processedData, setProcessedData] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [chartSuggestion, setChartSuggestion] = useState<ChartSuggestion | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [dashboardVariations, setDashboardVariations] = useState<DashboardVariation[]>([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);

  // Load session on component mount
  useEffect(() => {
    const loadInitialSession = async () => {
      setIsLoadingSession(true);
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

          // Restore variations and history
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
        } else {
          // Create new session
          const newSessionId = await sessionManager.createSession();
          setCurrentSessionId(newSessionId);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        toast.error('Failed to load previous session. Starting fresh.');
        // Create new session as fallback
        const newSessionId = await sessionManager.createSession();
        setCurrentSessionId(newSessionId);
      } finally {
        setIsLoadingSession(false);
        setSessionLoaded(true);
      }
    };

    loadInitialSession();
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
          dashboardVariations: dashboardVariations.length > 0 ? dashboardVariations : undefined,
          selectedVariationIndex: dashboardVariations.length > 0 ? selectedVariationIndex : undefined,
          improvementHistory: improvementHistory.getAll(),
          lastUpdated: new Date().toISOString()
        };

        await sessionManager.saveSession(session);
      } catch (error) {
        console.error('Failed to save session:', error);
        toast.error('Failed to save session. Your changes may not be preserved.');
      }
    };

    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(saveSession, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    rawData,
    processedData,
    columnMapping,
    chartSuggestion,
    dashboardConfig,
    alertRules,
    selectedSheet,
    currentSessionId,
    sessionLoaded,
    dashboardVariations,
    selectedVariationIndex,
    historyVersion
  ]);

  const createNewSession = async () => {
    try {
      const newSessionId = await sessionManager.createSession();
      setCurrentSessionId(newSessionId);
      setRawData(null);
      setProcessedData([]);
      setColumnMapping({});
      setChartSuggestion(null);
      setDashboardConfig(null);
      setAlertRules([]);
      setSelectedSheet('');
      setDashboardVariations([]);
      setSelectedVariationIndex(0);
      improvementHistory.clear();
      setHistoryVersion(v => v + 1);
      toast.success('New session created');
    } catch (error) {
      console.error('Failed to create new session:', error);
      toast.error('Failed to create new session');
    }
  };

  return {
    // Session state
    currentSessionId,
    sessionLoaded,
    isLoadingSession,

    // Data state
    rawData,
    setRawData,
    processedData,
    setProcessedData,
    columnMapping,
    setColumnMapping,
    chartSuggestion,
    setChartSuggestion,
    dashboardConfig,
    setDashboardConfig,
    alertRules,
    setAlertRules,
    selectedSheet,
    setSelectedSheet,

    // Phase 3 state
    dashboardVariations,
    setDashboardVariations,
    selectedVariationIndex,
    setSelectedVariationIndex,
    historyVersion,
    setHistoryVersion,

    // Methods
    createNewSession,
  };
}

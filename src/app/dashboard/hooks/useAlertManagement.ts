import { useState } from 'react';
import { runAlerts, AlertRule, AlertResult } from '@/lib/alert-engine';
import { notificationManager } from '@/lib/notification-manager';
import { toast } from 'sonner';

export interface UseAlertManagementReturn {
  alertResults: AlertResult[];
  handleAddAlert: (rule: AlertRule, processedData: Record<string, any>[]) => void;
  runAlertsOnData: (data: Record<string, any>[], rules: AlertRule[]) => AlertResult[];
}

/**
 * Custom Hook: Alert Management
 *
 * Handles alert rule management and execution:
 * - Adding new alert rules
 * - Running alert evaluations
 * - Triggering browser notifications
 */
export function useAlertManagement() {
  const [alertResults, setAlertResults] = useState<AlertResult[]>([]);

  const handleAddAlert = (rule: AlertRule, processedData: Record<string, any>[], currentAlertRules: AlertRule[]) => {
    const newRules = [...currentAlertRules, rule];

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

    return newRules;
  };

  const runAlertsOnData = (data: Record<string, any>[], rules: AlertRule[]): AlertResult[] => {
    if (data.length === 0 || rules.length === 0) {
      return [];
    }

    const results = runAlerts(data, rules);
    setAlertResults(results);
    return results;
  };

  return {
    alertResults,
    handleAddAlert,
    runAlertsOnData,
  };
}

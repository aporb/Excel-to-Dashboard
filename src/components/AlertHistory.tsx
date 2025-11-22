"use client";

import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertRule, AlertResult } from '@/lib/alert-engine';

interface AlertHistoryEntry {
  id: string;
  rule: AlertRule;
  triggered: boolean;
  timestamp: Date;
  value?: number;
}

interface AlertHistoryProps {
  alertResults: AlertResult[];
  alertRules: AlertRule[];
  onClearHistory?: () => void;
}

export function AlertHistory({ alertResults, alertRules, onClearHistory }: AlertHistoryProps) {
  const [history, setHistory] = useState<AlertHistoryEntry[]>([]);

  // Add new alert result to history
  React.useEffect(() => {
    alertResults.forEach(result => {
      const rule = alertRules.find(r => r.id === result.ruleId);
      if (rule) {
        const entry: AlertHistoryEntry = {
          id: `${result.ruleId}-${Date.now()}`,
          rule,
          triggered: result.triggered,
          timestamp: new Date(),
          value: result.currentValue,
        };

        // Only add if it's a new entry (not already in history)
        setHistory(prev => {
          const isDuplicate = prev.some(
            h => h.rule.id === entry.rule.id && 
            h.timestamp.getTime() === entry.timestamp.getTime()
          );
          return isDuplicate ? prev : [entry, ...prev].slice(0, 50); // Keep last 50 entries
        });
      }
    });
  }, [alertResults, alertRules]);

  const handleClearHistory = () => {
    setHistory([]);
    onClearHistory?.();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>
            Recent alert triggers and status changes
          </CardDescription>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No alert history yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">
                  {entry.triggered ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{entry.rule.metric}</span>
                    <Badge variant={entry.triggered ? 'destructive' : 'secondary'} className="text-xs">
                      {entry.rule.condition} {entry.rule.threshold}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {entry.triggered ? 'Alert triggered' : 'Condition not met'}
                    {entry.value !== undefined && ` • Value: ${entry.value}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

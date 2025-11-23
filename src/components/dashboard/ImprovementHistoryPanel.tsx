'use client';

import React from 'react';
import { ImprovementRecord, ImprovementHistory } from '@/lib/improvement-history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  History,
  Undo,
  Trash2,
  ChevronRight,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImprovementHistoryPanelProps {
  history: ImprovementHistory;
  onUndo: (record: ImprovementRecord) => void;
  onClear: () => void;
  selectedChartId?: string | null;
}

export default function ImprovementHistoryPanel({
  history,
  onUndo,
  onClear,
  selectedChartId,
}: ImprovementHistoryPanelProps) {
  const allRecords = history.getAll();
  const stats = history.getStats();

  // Filter records if a chart is selected
  const displayRecords = selectedChartId
    ? history.getByChartId(selectedChartId)
    : allRecords;

  const handleUndo = (record: ImprovementRecord) => {
    onUndo(record);
    toast.success('Improvement undone');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all improvement history?')) {
      onClear();
      toast.success('History cleared');
    }
  };

  if (allRecords.length === 0) {
    return (
      <Card className="glass-standard">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground space-y-2">
            <History className="h-12 w-12 mx-auto opacity-50" />
            <p className="text-sm">No improvement history yet</p>
            <p className="text-xs">
              Click "Improve Chart" on any chart to start using AI improvements
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-standard">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Improvement History
            </CardTitle>
            <CardDescription className="mt-2">
              {selectedChartId
                ? `${displayRecords.length} improvement(s) for selected chart`
                : `${stats.totalImprovements} total improvements across ${stats.uniqueCharts} chart(s)`}
            </CardDescription>
          </div>
          {allRecords.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {displayRecords.length === 0 ? (
          <Alert className="glass-subtle">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No improvements for the selected chart yet
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {displayRecords.map((record, index) => (
                <div key={record.id}>
                  <ImprovementRecordItem
                    record={record}
                    onUndo={() => handleUndo(record)}
                  />
                  {index < displayRecords.length - 1 && (
                    <Separator className="my-3" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ImprovementRecordItem({
  record,
  onUndo,
}: {
  record: ImprovementRecord;
  onUndo: () => void;
}) {
  const date = new Date(record.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <div className="glass-subtle rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <p className="text-sm font-medium truncate">
              {record.afterConfig.title}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="flex-shrink-0"
        >
          <Undo className="h-4 w-4 mr-1" />
          Undo
        </Button>
      </div>

      {/* User Request */}
      <div className="glass-subtle rounded p-2 border border-border">
        <p className="text-xs text-muted-foreground mb-1">Request:</p>
        <p className="text-sm">"{record.userRequest}"</p>
      </div>

      {/* Changes */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Changes Made:</p>
        <ul className="space-y-1">
          {record.changes.map((change, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Reasoning */}
      {record.reasoning && (
        <div className="glass-subtle rounded p-2 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">AI Reasoning:</p>
          <p className="text-xs italic">{record.reasoning}</p>
        </div>
      )}

      {/* Before/After Config Diff */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground mb-1">Before:</p>
          <div className="space-y-0.5">
            <div>
              Type:{' '}
              <Badge variant="outline" className="ml-1 text-xs capitalize">
                {record.beforeConfig.type}
              </Badge>
            </div>
            <div className="text-muted-foreground">
              X: {record.beforeConfig.xField}
            </div>
            <div className="text-muted-foreground">
              Y: {record.beforeConfig.yField}
            </div>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">After:</p>
          <div className="space-y-0.5">
            <div>
              Type:{' '}
              <Badge variant="secondary" className="ml-1 text-xs capitalize">
                {record.afterConfig.type}
              </Badge>
            </div>
            <div className="text-muted-foreground">
              X: {record.afterConfig.xField}
            </div>
            <div className="text-muted-foreground">
              Y: {record.afterConfig.yField}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

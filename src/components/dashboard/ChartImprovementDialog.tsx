'use client';

import React, { useState } from 'react';
import { ChartConfig } from '@/lib/dashboard-types';
import {
  improveChartWithAI,
  suggestImprovementPrompts,
  validateImprovementRequest,
} from '@/lib/chart-improvement';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Lightbulb, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChartImprovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartConfig: ChartConfig;
  data: Record<string, any>[];
  availableFields: string[];
  apiKey: string;
  onImprove: (updatedConfig: ChartConfig, changes: string[], reasoning: string) => void;
}

export default function ChartImprovementDialog({
  open,
  onOpenChange,
  chartConfig,
  data,
  availableFields,
  apiKey,
  onImprove,
}: ChartImprovementDialogProps) {
  const [request, setRequest] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = suggestImprovementPrompts(chartConfig, availableFields);

  const handleImprove = async () => {
    setError(null);

    // Validate request
    const validation = validateImprovementRequest(request);
    if (!validation.isValid) {
      setError(validation.reason || 'Invalid request');
      return;
    }

    setIsImproving(true);

    try {
      const result = await improveChartWithAI(
        {
          chartConfig,
          userRequest: request,
          data,
          availableFields,
        },
        apiKey
      );

      onImprove(result.updatedConfig, result.changes, result.reasoning);
      toast.success('Chart improved successfully!');
      onOpenChange(false);
      setRequest(''); // Clear input
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to improve chart';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setRequest(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleImprove();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-standard sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Improve Chart with AI
          </DialogTitle>
          <DialogDescription>
            Describe how you'd like to improve "{chartConfig.title}". Use natural
            language to request changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Chart Info */}
          <div className="glass-subtle rounded-lg p-3 border border-border">
            <p className="text-sm font-medium mb-2">Current Configuration:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Type:</span>{' '}
                <Badge variant="secondary" className="ml-1 capitalize">
                  {chartConfig.type}
                </Badge>
              </div>
              <div>
                <span className="font-medium">X-Axis:</span> {chartConfig.xField}
              </div>
              <div>
                <span className="font-medium">Y-Axis:</span> {chartConfig.yField}
              </div>
              {chartConfig.groupBy && (
                <div>
                  <span className="font-medium">Group By:</span> {chartConfig.groupBy}
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Suggestions:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Request Input */}
          <div>
            <Textarea
              placeholder="E.g., 'Change to a bar chart and sort by value', 'Show revenue by region', 'Use a different color scheme'"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              className="glass-subtle resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Press <kbd className="px-1 py-0.5 rounded bg-muted">Cmd</kbd> +{' '}
              <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> to submit
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="glass-subtle">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Examples */}
          <div className="glass-subtle rounded-lg p-3 border border-border">
            <p className="text-xs font-medium mb-2">Example Requests:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Change to a line chart and show trends over time</li>
              <li>Group by category and show top 10 only</li>
              <li>Switch X and Y axes</li>
              <li>Add a more descriptive title</li>
              <li>Focus on the most recent data</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImprove}
            disabled={isImproving || !request.trim()}
          >
            {isImproving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Improve Chart
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

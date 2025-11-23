'use client';

import React, { useState } from 'react';
import { DashboardVariation, compareVariations } from '@/lib/dashboard-variations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  RefreshCw,
  BarChart3,
  Activity,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardVariationsCarouselProps {
  variations: DashboardVariation[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onApply: (variation: DashboardVariation) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export default function DashboardVariationsCarousel({
  variations,
  selectedIndex,
  onSelect,
  onApply,
  onRegenerate,
  isRegenerating = false,
}: DashboardVariationsCarouselProps) {
  const currentVariation = variations[selectedIndex];

  if (!currentVariation) {
    return (
      <Card className="glass-standard">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No variations available</p>
        </CardContent>
      </Card>
    );
  }

  const goToPrevious = () => {
    if (selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex < variations.length - 1) {
      onSelect(selectedIndex + 1);
    }
  };

  const handleApply = () => {
    onApply(currentVariation);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Dashboard Variations</h3>
          <Badge variant="secondary">
            {selectedIndex + 1} of {variations.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All
            </>
          )}
        </Button>
      </div>

      {/* Carousel */}
      <Card className="glass-standard">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {getStrategyIcon(currentVariation.strategy)}
                {getStrategyTitle(currentVariation.strategy)}
              </CardTitle>
              <CardDescription className="mt-2">
                {currentVariation.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentVariation.strategy.replace('-', ' ')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Variation Preview */}
          <div className="grid gap-4">
            {/* KPIs Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">
                  KPIs ({currentVariation.config.kpis.length})
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentVariation.config.kpis.map((kpi) => (
                  <div
                    key={kpi.id}
                    className="glass-subtle rounded-lg p-3 border border-border"
                  >
                    <p className="text-xs font-medium truncate">{kpi.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {kpi.expression.aggregation} • {kpi.format}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">
                  Charts ({currentVariation.config.charts.length})
                </h4>
              </div>
              <div className="space-y-2">
                {currentVariation.config.charts.map((chart) => (
                  <div
                    key={chart.id}
                    className="glass-subtle rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate flex-1">
                        {chart.title}
                      </p>
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {chart.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      X: {chart.xField} • Y: {chart.yField}
                      {chart.groupBy && ` • Group: ${chart.groupBy}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison with other variations */}
            {variations.length > 1 && selectedIndex > 0 && (
              <Alert className="glass-subtle border-primary/20">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {getComparisonText(
                    currentVariation,
                    variations[selectedIndex - 1]
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={selectedIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={selectedIndex === variations.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Button onClick={handleApply} size="sm">
              <Check className="h-4 w-4 mr-2" />
              Select This Layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2">
        {variations.map((_, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === selectedIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Go to variation ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function getStrategyIcon(strategy: string) {
  switch (strategy) {
    case 'kpi-focused':
      return <Activity className="h-5 w-5" />;
    case 'analytical':
      return <BarChart3 className="h-5 w-5" />;
    case 'balanced':
      return <Sparkles className="h-5 w-5" />;
    default:
      return <BarChart3 className="h-5 w-5" />;
  }
}

function getStrategyTitle(strategy: string): string {
  switch (strategy) {
    case 'kpi-focused':
      return 'KPI-Focused Dashboard';
    case 'analytical':
      return 'Analytical Dashboard';
    case 'balanced':
      return 'Balanced Dashboard';
    default:
      return 'Custom Dashboard';
  }
}

function getComparisonText(
  current: DashboardVariation,
  previous: DashboardVariation
): string {
  const { kpiCountDiff, chartCountDiff } = compareVariations(current, previous);

  const kpiText =
    kpiCountDiff > 0
      ? `${Math.abs(kpiCountDiff)} more KPIs`
      : kpiCountDiff < 0
      ? `${Math.abs(kpiCountDiff)} fewer KPIs`
      : 'same KPIs';

  const chartText =
    chartCountDiff > 0
      ? `${Math.abs(chartCountDiff)} more charts`
      : chartCountDiff < 0
      ? `${Math.abs(chartCountDiff)} fewer charts`
      : 'same charts';

  return `Compared to previous: ${kpiText}, ${chartText}`;
}

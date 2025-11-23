"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIMetric } from '@/lib/kpi-calculator';
import { cn } from '@/lib/utils';

interface KPICardProps {
  metric: KPIMetric;
  icon?: React.ReactNode;
}

export function KPICard({ metric, icon }: KPICardProps) {
  const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';

  const getTrendColorClass = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      case 'stable':
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="hover:border-primary transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{metric.name}</CardTitle>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-foreground">{metric.formatted}</div>
        {metric.trendPercent > 0 && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            getTrendColorClass(metric.trend)
          )}>
            <span>{trendIcon}</span>
            <span>{metric.trendPercent}% from previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

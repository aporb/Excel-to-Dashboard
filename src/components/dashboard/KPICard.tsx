"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIMetric } from '@/lib/kpi-calculator';

interface KPICardProps {
  metric: KPIMetric;
  icon?: React.ReactNode;
}

export function KPICard({ metric, icon }: KPICardProps) {
  const trendColor = metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280';
  const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';

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
          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: trendColor }}>
            <span>{trendIcon}</span>
            <span>{metric.trendPercent}% from previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

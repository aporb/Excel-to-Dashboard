"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPISummary, KPICalculator } from '@/lib/kpi-calculator';
import { KPICard } from './KPICard';
import { Database, Columns3, CheckCircle2, Clock } from 'lucide-react';

interface DataSummaryProps {
  kpiSummary: KPISummary;
}

export function DataSummary({ kpiSummary }: DataSummaryProps) {
  const lastUpdatedTime = new Date(kpiSummary.lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              <Database className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiSummary.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">rows in dataset</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Columns</CardTitle>
              <Columns3 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiSummary.totalColumns}</div>
            <p className="text-xs text-muted-foreground mt-1">fields mapped</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpiSummary.dataQuality}%</div>
            <p className="text-xs text-muted-foreground mt-1">valid values</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">Just now</div>
            <p className="text-xs text-muted-foreground mt-1">{lastUpdatedTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      {kpiSummary.keyMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiSummary.keyMetrics.map(metric => (
              <KPICard key={metric.name} metric={metric} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

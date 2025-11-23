"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from './CustomTooltip';
import { useChartColors } from '@/hooks/useChartColors';

interface BarChartWidgetProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  title?: string;
}

export function BarChartWidget({ data, xKey, yKey, title }: BarChartWidgetProps) {
  const colors = useChartColors();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Bar Chart'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title || `${yKey} by ${xKey}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              dataKey={xKey}
              stroke={colors.mutedForeground}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke={colors.mutedForeground}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: `${colors.chart3}20` }}
            />
            <Legend />
            <Bar
              dataKey={yKey}
              fill={colors.chart3}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

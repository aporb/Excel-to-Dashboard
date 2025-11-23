"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from './CustomTooltip';
import { useChartColors } from '@/hooks/useChartColors';

interface LineChartWidgetProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  title?: string;
}

export function LineChartWidget({ data, xKey, yKey, title }: LineChartWidgetProps) {
  const colors = useChartColors();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Line Chart'}</CardTitle>
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
        <CardTitle>{title || `${yKey} over ${xKey}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
              cursor={{ stroke: colors.chart1, strokeWidth: 2 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={colors.chart1}
              strokeWidth={2}
              dot={{ fill: colors.chart1, r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

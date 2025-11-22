"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaChartWidgetProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
}

export function AreaChartWidget({ data, xKey, yKey, title, color = '#f59e0b' }: AreaChartWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'Area Chart'}</CardTitle>
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
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={xKey} 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              cursor={{ stroke: color, strokeWidth: 2 }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorArea)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useChartColors } from '@/hooks/useChartColors';

interface ChartWidgetProps {
    data: any[];
    xKey: string;
    yKey: string;
    title?: string;
}

export default function ChartWidget({ data, xKey, yKey, title }: ChartWidgetProps) {
    const colors = useChartColors();

    return (
        <div className="glass-panel">
            {title && <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
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
                        contentStyle={{
                            backgroundColor: colors.background,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '8px',
                            color: colors.mutedForeground
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={colors.chart5}
                        strokeWidth={2}
                        dot={{ fill: colors.chart5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

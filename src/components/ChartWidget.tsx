"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartWidgetProps {
    data: any[];
    xKey: string;
    yKey: string;
    title?: string;
}

export default function ChartWidget({ data, xKey, yKey, title }: ChartWidgetProps) {
    return (
        <div className="glass-panel">
            {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={xKey} stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px'
                        }}
                    />
                    <Line type="monotone" dataKey={yKey} stroke="#a78bfa" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

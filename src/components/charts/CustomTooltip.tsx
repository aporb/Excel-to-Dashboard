"use client";

import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-strong rounded-lg p-3 shadow-xl border border-border animate-fade-in-up">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm text-foreground-muted">
              {entry.name}: <span className="font-medium text-foreground">
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

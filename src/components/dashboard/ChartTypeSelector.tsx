"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChartType } from '@/lib/chart-intelligence';
import { LineChart as LineChartIcon, BarChart3, AreaChart as AreaChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onSelect: (type: ChartType) => void;
}

const chartTypes: Array<{
  type: ChartType;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    type: 'line',
    label: 'Line Chart',
    description: 'Best for trends over time',
    icon: <LineChartIcon className="h-5 w-5" />
  },
  {
    type: 'bar',
    label: 'Bar Chart',
    description: 'Best for comparisons',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    type: 'area',
    label: 'Area Chart',
    description: 'Best for magnitude & trends',
    icon: <AreaChartIcon className="h-5 w-5" />
  },
  {
    type: 'pie',
    label: 'Pie Chart',
    description: 'Best for proportions',
    icon: <PieChartIcon className="h-5 w-5" />
  }
];

export function ChartTypeSelector({ selectedType, onSelect }: ChartTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold">Chart Type</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {chartTypes.map(({ type, label, description, icon }) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            onClick={() => onSelect(type)}
            className="flex flex-col items-center justify-center h-auto py-3 gap-1"
            title={description}
          >
            <div className="text-lg">{icon}</div>
            <span className="text-xs font-medium">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

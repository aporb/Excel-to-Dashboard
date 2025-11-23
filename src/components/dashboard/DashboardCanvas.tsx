'use client';

import React, { useState, useMemo } from 'react';
import { DashboardConfig, findWidget, isKPIConfig, isChartConfig, ChartType, FilterConfig } from '@/lib/dashboard-types';
import { calculateKPI, formatKPIValue } from '@/lib/kpi-calculator';
import { applyGlobalFilters } from '@/lib/filter-utils';
import { FilterBar, FilterValues } from './FilterBar';
import KPICardDynamic from './KPICardDynamic';
import { LineChartWidget } from '@/components/charts/LineChartWidget';
import { BarChartWidget } from '@/components/charts/BarChartWidget';
import { AreaChartWidget } from '@/components/charts/AreaChartWidget';
import { PieChartWidget } from '@/components/charts/PieChartWidget';
import { ChartTypeSelector } from './ChartTypeSelector';
import { GripVertical } from 'lucide-react';

interface DashboardCanvasProps {
  config: DashboardConfig;
  data: Record<string, any>[];
  onChartSelect?: (chartId: string) => void;
  onChartTypeChange?: (chartId: string, newType: ChartType) => void;
  onLayoutChange?: (newConfig: DashboardConfig) => void;
  selectedChartId?: string | null;
  editMode?: boolean;
  filters?: FilterConfig[];
}

export default function DashboardCanvas({
  config,
  data,
  onChartSelect,
  onChartTypeChange,
  onLayoutChange,
  selectedChartId,
  editMode = false,
  filters = [],
}: DashboardCanvasProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOverRow, setDragOverRow] = useState<string | null>(null);
  const [globalFilters, setGlobalFilters] = useState<FilterValues>({});

  // Apply global filters to data
  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;
    return applyGlobalFilters(data, filters, globalFilters);
  }, [data, filters, globalFilters]);

  // Drag handlers
  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent, rowId: string) => {
    e.preventDefault();
    setDragOverRow(rowId);
  };

  const handleDrop = (e: React.DragEvent, targetRowId: string, targetIndex: number) => {
    e.preventDefault();

    if (!draggedWidget || !onLayoutChange) return;

    // Find source row
    const sourceRow = config.layout.rows.find(row =>
      row.widgets.includes(draggedWidget)
    );

    if (!sourceRow) return;

    const sourceIndex = sourceRow.widgets.indexOf(draggedWidget);
    const targetRow = config.layout.rows.find(r => r.id === targetRowId);

    if (!targetRow) return;

    // Create new config with updated layout
    const newRows = config.layout.rows.map(row => {
      if (row.id === sourceRow.id) {
        // Remove from source
        return {
          ...row,
          widgets: row.widgets.filter(w => w !== draggedWidget),
          span: row.span.filter((_, i) => i !== sourceIndex),
        };
      } else if (row.id === targetRow.id) {
        // Add to target
        const newWidgets = [...row.widgets];
        const newSpan = [...row.span];

        newWidgets.splice(targetIndex, 0, draggedWidget);

        // Get widget to determine span
        const widget = findWidget(config, draggedWidget);
        const widgetSpan = isKPIConfig(widget) ? (widget?.span || 6) : (widget?.span || 12);
        newSpan.splice(targetIndex, 0, widgetSpan);

        return {
          ...row,
          widgets: newWidgets,
          span: newSpan,
        };
      }
      return row;
    }).filter(row => row.widgets.length > 0); // Remove empty rows

    const newConfig: DashboardConfig = {
      ...config,
      layout: {
        ...config.layout,
        rows: newRows,
      },
      updatedAt: new Date().toISOString(),
    };

    onLayoutChange(newConfig);
    setDraggedWidget(null);
    setDragOverRow(null);
  };
  // Render individual widget
  const renderWidget = (widgetId: string) => {
    const widget = findWidget(config, widgetId);
    if (!widget) return null;

    if (isKPIConfig(widget)) {
      // Render KPI with filtered data
      const value = calculateKPI(widget.expression, filteredData);
      const formatted = formatKPIValue(value, widget.format);

      return (
        <KPICardDynamic
          key={widget.id}
          config={widget}
          value={value}
          formatted={formatted}
        />
      );
    } else if (isChartConfig(widget)) {
      // Render Chart with filtered data
      const isSelected = selectedChartId === widget.id;
      const chartData = filteredData; // Uses global filters

      const commonProps = {
        data: chartData,
        xKey: widget.xField,
        yKey: widget.yField,
        title: widget.title,
      };

      const handleClick = () => {
        if (onChartSelect) {
          onChartSelect(widget.id);
        }
      };

      const handleTypeChange = (newType: ChartType) => {
        if (onChartTypeChange) {
          onChartTypeChange(widget.id, newType);
        }
      };

      const className = `cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary rounded-lg' : ''
      }`;

      return (
        <div key={widget.id} className="space-y-2">
          {/* Chart Type Selector */}
          {isSelected && onChartTypeChange && widget.type !== 'scatter' && widget.type !== 'table' && (
            <ChartTypeSelector
              selectedType={widget.type as 'line' | 'bar' | 'area' | 'pie'}
              onSelect={handleTypeChange}
            />
          )}

          {/* Chart */}
          <div onClick={handleClick} className={className}>
            {widget.type === 'line' && <LineChartWidget {...commonProps} />}
            {widget.type === 'bar' && <BarChartWidget {...commonProps} />}
            {widget.type === 'area' && <AreaChartWidget {...commonProps} />}
            {widget.type === 'pie' && <PieChartWidget {...commonProps} />}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      {filters && filters.length > 0 && (
        <FilterBar
          filters={filters}
          data={data}
          values={globalFilters}
          onChange={setGlobalFilters}
        />
      )}

      {/* Dashboard Grid */}
      {config.layout.rows.map((row) => (
        <div
          key={row.id}
          className={`grid grid-cols-12 gap-4 transition-all ${
            dragOverRow === row.id ? 'ring-2 ring-primary/50 rounded-lg p-2' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, row.id)}
        >
          {row.widgets.map((widgetId, index) => {
            const span = row.span[index] || 12;
            const widget = findWidget(config, widgetId);

            return (
              <div
                key={widgetId}
                className={`col-span-${span} relative group`}
                draggable={editMode}
                onDragStart={() => handleDragStart(widgetId)}
                onDrop={(e) => handleDrop(e, row.id, index)}
              >
                {/* Drag Handle */}
                {editMode && (
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="glass-subtle rounded p-1 cursor-move">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )}

                {renderWidget(widgetId)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

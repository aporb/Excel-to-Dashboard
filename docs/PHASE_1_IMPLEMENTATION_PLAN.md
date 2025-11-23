# Phase 1 Implementation Plan: Core Dashboard Features

**Document Version:** 1.0
**Date:** November 22, 2025
**Status:** Ready for Implementation
**Total Estimated Effort:** 87-128 hours (3-4 weeks)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Strategy](#implementation-strategy)
3. [P1: Multi-Chart Rendering](#p1-multi-chart-rendering)
4. [P2: Chart Type Selector](#p2-chart-type-selector)
5. [P3: Customizable KPIs](#p3-customizable-kpis)
6. [P4: AI Dashboard Config Generator](#p4-ai-dashboard-config-generator)
7. [P5: Simple Layout Editor](#p5-simple-layout-editor)
8. [Testing Strategy](#testing-strategy)
9. [Success Criteria](#success-criteria)

---

## Executive Summary

### Current State
- ✅ Single chart rendering working
- ✅ Chart components exist (Line, Bar, Area, Pie)
- ✅ Session persistence in IndexedDB
- ✅ AI integration (Gemini) functional
- ❌ **Critical Gap:** Only ONE chart can be displayed

### Target State (Phase 1 Complete)
- ✅ Multiple charts on single dashboard
- ✅ Manual chart type selection
- ✅ Dynamic KPI creation
- ✅ AI-generated complete dashboard configs
- ✅ Basic drag-and-drop layout editing

### Implementation Approach
**Bottom-up architecture:**
1. Define TypeScript interfaces (data model)
2. Update session manager (persistence layer)
3. Build UI components (presentation layer)
4. Integrate AI (intelligence layer)
5. Add layout editing (interaction layer)

---

## Implementation Strategy

### Dependency Graph
```
P1 (Multi-chart rendering) - FOUNDATION
  ├── P2 (Chart type selector)
  ├── P3 (Customizable KPIs)
  │     └── P4 (AI dashboard config)
  └── P5 (Layout editor)
```

### File Structure Changes
```
src/
├── lib/
│   ├── dashboard-types.ts           # NEW: Core interfaces
│   ├── dashboard-renderer.ts        # NEW: Config-to-React renderer
│   ├── ai-dashboard-generator.ts    # NEW: AI config generator
│   ├── kpi-calculator.ts            # ENHANCED: Multi-KPI support
│   ├── session-manager.ts           # ENHANCED: DashboardConfig support
│   └── gemini-ai.ts                 # ENHANCED: Full config prompts
├── components/
│   ├── dashboard/
│   │   ├── DashboardCanvas.tsx      # NEW: Multi-widget renderer
│   │   ├── ChartTypeSelector.tsx    # NEW: Chart type switcher
│   │   ├── KPICardDynamic.tsx       # NEW: Config-driven KPI
│   │   ├── KPIBuilder.tsx           # NEW: KPI creation UI
│   │   ├── FilterBar.tsx            # NEW: Global filters (future)
│   │   └── WidgetContainer.tsx      # NEW: Wrapper for all widgets
│   └── charts/                      # ENHANCED: Accept ChartConfig
│       ├── LineChartWidget.tsx
│       ├── BarChartWidget.tsx
│       ├── AreaChartWidget.tsx
│       └── PieChartWidget.tsx
└── app/
    └── dashboard/
        └── page.tsx                 # ENHANCED: Use DashboardCanvas
```

---

## P1: Multi-Chart Rendering

**Priority:** CRITICAL
**Estimated Effort:** 20-30 hours
**Dependencies:** None

### Objective
Enable rendering of multiple charts and KPIs simultaneously on a single dashboard.

### Step 1.1: Define Core TypeScript Interfaces

**File:** `src/lib/dashboard-types.ts` (NEW)

```typescript
import { z } from 'zod';

// ============================================================================
// CHART CONFIGURATION
// ============================================================================

export const ChartTypeSchema = z.enum(['line', 'bar', 'area', 'pie', 'scatter', 'table']);
export type ChartType = z.infer<typeof ChartTypeSchema>;

export interface ChartConfig {
  id: string;                        // Unique identifier (UUID)
  type: ChartType;
  title: string;
  description?: string;

  // Data mapping
  xField: string;                    // Column name for X-axis
  yField: string;                    // Column name for Y-axis
  groupBy?: string;                  // Optional grouping column

  // Filtering (future)
  filters?: FilterExpression[];

  // Sorting
  sortBy?: {
    field: string;
    order: 'asc' | 'desc';
  };

  // Display options
  limit?: number;                    // Max data points
  colors?: string[];                 // Custom color palette

  // Interactions (future)
  interactions?: ChartInteraction[];

  // Layout hints
  span?: number;                     // Grid column span (1-12)
  height?: number;                   // Height in grid units
}

export interface ChartInteraction {
  type: 'hover' | 'click' | 'crossfilter' | 'drilldown';
  action: string;
}

// ============================================================================
// KPI CONFIGURATION
// ============================================================================

export const AggregationTypeSchema = z.enum([
  'sum', 'avg', 'min', 'max', 'count', 'countDistinct'
]);
export type AggregationType = z.infer<typeof AggregationTypeSchema>;

export interface KPIExpression {
  aggregation: AggregationType;
  field: string;
  filter?: FilterExpression;
}

export interface KPIConfig {
  id: string;
  title: string;
  description?: string;
  expression: KPIExpression;
  format: 'number' | 'currency' | 'percentage';
  icon?: string;                     // Lucide icon name

  // Comparison (future)
  comparison?: {
    type: 'previous_period' | 'target';
    value: number;
    label?: string;
  };

  // Layout hints
  span?: number;                     // Grid column span
}

// ============================================================================
// FILTERS (Placeholder for future)
// ============================================================================

export interface FilterExpression {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains' | 'between';
  value: any;
}

export interface FilterConfig {
  id: string;
  type: 'dateRange' | 'category' | 'numericRange';
  field: string;
  label: string;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
}

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

export interface LayoutRow {
  id: string;
  widgets: string[];                 // Widget IDs (KPI or Chart)
  span: number[];                    // Column spans for each widget
  height?: number;                   // Row height in pixels
}

export interface LayoutConfig {
  type: 'grid' | 'flex';
  columns: number;                   // Default: 12
  rows: LayoutRow[];
}

// ============================================================================
// DASHBOARD CONFIGURATION (Main Interface)
// ============================================================================

export interface DashboardConfig {
  id: string;
  name?: string;
  description?: string;
  version: string;                   // Config schema version

  // Widgets
  kpis: KPIConfig[];
  charts: ChartConfig[];
  filters?: FilterConfig[];          // Future: Global filters

  // Layout
  layout: LayoutConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ZOD SCHEMAS (Validation)
// ============================================================================

export const KPIExpressionSchema = z.object({
  aggregation: AggregationTypeSchema,
  field: z.string(),
  filter: z.any().optional(),
});

export const KPIConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  expression: KPIExpressionSchema,
  format: z.enum(['number', 'currency', 'percentage']),
  icon: z.string().optional(),
  span: z.number().optional(),
});

export const ChartConfigSchema = z.object({
  id: z.string(),
  type: ChartTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  xField: z.string(),
  yField: z.string(),
  groupBy: z.string().optional(),
  span: z.number().optional(),
  height: z.number().optional(),
});

export const LayoutRowSchema = z.object({
  id: z.string(),
  widgets: z.array(z.string()),
  span: z.array(z.number()),
  height: z.number().optional(),
});

export const LayoutConfigSchema = z.object({
  type: z.enum(['grid', 'flex']),
  columns: z.number(),
  rows: z.array(LayoutRowSchema),
});

export const DashboardConfigSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  version: z.string(),
  kpis: z.array(KPIConfigSchema),
  charts: z.array(ChartConfigSchema),
  layout: LayoutConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createEmptyDashboardConfig(): DashboardConfig {
  return {
    id: crypto.randomUUID(),
    version: '1.0',
    kpis: [],
    charts: [],
    layout: {
      type: 'grid',
      columns: 12,
      rows: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function findWidget(
  config: DashboardConfig,
  widgetId: string
): KPIConfig | ChartConfig | undefined {
  const kpi = config.kpis.find(k => k.id === widgetId);
  if (kpi) return kpi;

  const chart = config.charts.find(c => c.id === widgetId);
  return chart;
}

export function isKPIConfig(widget: any): widget is KPIConfig {
  return 'expression' in widget;
}

export function isChartConfig(widget: any): widget is ChartConfig {
  return 'type' in widget && 'xField' in widget && 'yField' in widget;
}
```

### Step 1.2: Update Session Manager

**File:** `src/lib/session-manager.ts` (ENHANCE)

```typescript
// ADD THIS IMPORT
import { DashboardConfig, createEmptyDashboardConfig } from './dashboard-types';

// UPDATE DashboardSession interface
export interface DashboardSession {
  id: string;
  uploadedData: Record<string, any[]>;
  processedData: Record<string, any>[];
  columnMapping: Record<string, string>;

  // DEPRECATED: Keep for backward compatibility
  chartSuggestion?: ChartSuggestion;

  // NEW: Multi-chart dashboard config
  dashboardConfig?: DashboardConfig;

  alertRules: AlertRule[];
  selectedSheet?: string;
  lastUpdated: string;

  // NEW: Optional metadata
  name?: string;
  description?: string;
  tags?: string[];
}

// UPDATE loadSession to handle migration
export async function loadSession(sessionId: string): Promise<DashboardSession | null> {
  try {
    const session = await sessionStore.getItem<DashboardSession>(sessionId);

    if (session) {
      // MIGRATION: If old session has chartSuggestion but no dashboardConfig
      if (session.chartSuggestion && !session.dashboardConfig) {
        session.dashboardConfig = migrateChartSuggestionToConfig(session.chartSuggestion);
      }

      // Ensure dashboardConfig exists
      if (!session.dashboardConfig) {
        session.dashboardConfig = createEmptyDashboardConfig();
      }
    }

    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

// NEW: Migration helper
function migrateChartSuggestionToConfig(suggestion: ChartSuggestion): DashboardConfig {
  const config = createEmptyDashboardConfig();

  // Create single chart from old suggestion
  const chartId = crypto.randomUUID();
  config.charts.push({
    id: chartId,
    type: suggestion.chartType,
    title: `${suggestion.chartType} Chart`,
    xField: suggestion.xKey,
    yField: suggestion.yKey,
    span: 12, // Full width
  });

  // Create default layout
  config.layout.rows.push({
    id: crypto.randomUUID(),
    widgets: [chartId],
    span: [12],
  });

  return config;
}
```

### Step 1.3: Enhanced KPI Calculator

**File:** `src/lib/kpi-calculator.ts` (ENHANCE)

```typescript
import { KPIExpression, FilterExpression, AggregationType } from './dashboard-types';

// ============================================================================
// KPI CALCULATION ENGINE
// ============================================================================

export function calculateKPI(
  expression: KPIExpression,
  data: Record<string, any>[]
): number {
  // Apply filter if present
  let filteredData = data;
  if (expression.filter) {
    filteredData = data.filter(row => evaluateFilter(row, expression.filter!));
  }

  // Extract field values
  const values = filteredData
    .map(row => row[expression.field])
    .filter(v => v != null && v !== '' && !isNaN(Number(v)))
    .map(Number);

  if (values.length === 0) return 0;

  // Apply aggregation
  switch (expression.aggregation) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);

    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;

    case 'min':
      return Math.min(...values);

    case 'max':
      return Math.max(...values);

    case 'count':
      return filteredData.length;

    case 'countDistinct':
      return new Set(values).size;

    default:
      return 0;
  }
}

// ============================================================================
// FILTER EVALUATION
// ============================================================================

export function evaluateFilter(
  row: Record<string, any>,
  filter: FilterExpression
): boolean {
  const fieldValue = row[filter.field];

  switch (filter.operator) {
    case '==':
      return fieldValue === filter.value;

    case '!=':
      return fieldValue !== filter.value;

    case '>':
      return Number(fieldValue) > Number(filter.value);

    case '<':
      return Number(fieldValue) < Number(filter.value);

    case '>=':
      return Number(fieldValue) >= Number(filter.value);

    case '<=':
      return Number(fieldValue) <= Number(filter.value);

    case 'in':
      return Array.isArray(filter.value) && filter.value.includes(fieldValue);

    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());

    case 'between':
      if (Array.isArray(filter.value) && filter.value.length === 2) {
        const numValue = Number(fieldValue);
        return numValue >= filter.value[0] && numValue <= filter.value[1];
      }
      return false;

    default:
      return true;
  }
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

export function formatKPIValue(
  value: number,
  format: 'number' | 'currency' | 'percentage'
): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;

    case 'number':
    default:
      if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
      }
      return value.toFixed(0);
  }
}
```

### Step 1.4: Dashboard Canvas Component

**File:** `src/components/dashboard/DashboardCanvas.tsx` (NEW)

```typescript
'use client';

import React, { useMemo } from 'react';
import { DashboardConfig, findWidget, isKPIConfig, isChartConfig } from '@/lib/dashboard-types';
import { calculateKPI, formatKPIValue } from '@/lib/kpi-calculator';
import KPICardDynamic from './KPICardDynamic';
import LineChartWidget from '@/components/charts/LineChartWidget';
import BarChartWidget from '@/components/charts/BarChartWidget';
import AreaChartWidget from '@/components/charts/AreaChartWidget';
import PieChartWidget from '@/components/charts/PieChartWidget';

interface DashboardCanvasProps {
  config: DashboardConfig;
  data: Record<string, any>[];
  onChartSelect?: (chartId: string) => void;
  selectedChartId?: string | null;
}

export default function DashboardCanvas({
  config,
  data,
  onChartSelect,
  selectedChartId,
}: DashboardCanvasProps) {
  // Render individual widget
  const renderWidget = (widgetId: string) => {
    const widget = findWidget(config, widgetId);
    if (!widget) return null;

    if (isKPIConfig(widget)) {
      // Render KPI
      const value = calculateKPI(widget.expression, data);
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
      // Render Chart
      const isSelected = selectedChartId === widget.id;
      const chartData = data; // Future: Apply widget.filters

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

      const className = `cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`;

      return (
        <div key={widget.id} onClick={handleClick} className={className}>
          {widget.type === 'line' && <LineChartWidget {...commonProps} />}
          {widget.type === 'bar' && <BarChartWidget {...commonProps} />}
          {widget.type === 'area' && <AreaChartWidget {...commonProps} />}
          {widget.type === 'pie' && <PieChartWidget {...commonProps} />}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {config.layout.rows.map((row) => (
        <div key={row.id} className="grid grid-cols-12 gap-4">
          {row.widgets.map((widgetId, index) => {
            const span = row.span[index] || 12;
            return (
              <div key={widgetId} className={`col-span-${span}`}>
                {renderWidget(widgetId)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

### Step 1.5: Dynamic KPI Card Component

**File:** `src/components/dashboard/KPICardDynamic.tsx` (NEW)

```typescript
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KPIConfig } from '@/lib/dashboard-types';
import * as LucideIcons from 'lucide-react';

interface KPICardDynamicProps {
  config: KPIConfig;
  value: number;
  formatted: string;
}

export default function KPICardDynamic({ config, value, formatted }: KPICardDynamicProps) {
  // Get icon component
  const IconComponent = config.icon && config.icon in LucideIcons
    ? (LucideIcons as any)[config.icon]
    : LucideIcons.Activity;

  return (
    <Card variant="glass" className="fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
        {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatted}</div>
        {config.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {config.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 1.6: Update Dashboard Page

**File:** `src/app/dashboard/page.tsx` (ENHANCE)

```typescript
// ADD IMPORTS
import { DashboardConfig, createEmptyDashboardConfig, ChartConfig } from '@/lib/dashboard-types';
import DashboardCanvas from '@/components/dashboard/DashboardCanvas';

// REPLACE chartSuggestion state with dashboardConfig
const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

// UPDATE session restoration (inside useEffect)
useEffect(() => {
  const initSession = async () => {
    const urlSessionId = searchParams.get('session');
    let session: DashboardSession | null = null;

    if (urlSessionId) {
      session = await sessionManager.loadSession(urlSessionId);
    } else {
      session = await sessionManager.loadLatestSession();
    }

    if (session) {
      setCurrentSessionId(session.id);
      setUploadedData(session.uploadedData);
      setProcessedData(session.processedData);
      setColumnMapping(session.columnMapping);
      setAlertRules(session.alertRules);
      setSelectedSheet(session.selectedSheet || '');

      // NEW: Load dashboard config
      if (session.dashboardConfig) {
        setDashboardConfig(session.dashboardConfig);
      }

      setSessionLoaded(true);
    } else {
      setSessionLoaded(true);
    }
  };

  initSession();
}, [searchParams]);

// UPDATE session auto-save
useEffect(() => {
  if (!sessionLoaded) return;

  const timeoutId = setTimeout(() => {
    const sessionData: DashboardSession = {
      id: currentSessionId || crypto.randomUUID(),
      uploadedData,
      processedData,
      columnMapping,
      dashboardConfig, // NEW
      alertRules,
      selectedSheet,
      lastUpdated: new Date().toISOString(),
    };

    sessionManager.saveSession(sessionData);
    if (!currentSessionId) {
      setCurrentSessionId(sessionData.id);
    }
  }, 1000);

  return () => clearTimeout(timeoutId);
}, [
  uploadedData,
  processedData,
  columnMapping,
  dashboardConfig, // NEW
  alertRules,
  selectedSheet,
  sessionLoaded,
  currentSessionId,
]);

// REPLACE dashboard rendering section (Step 3)
{currentStep === 3 && processedData.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Interactive visualization of your data
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleGenerateDashboard}
          disabled={isGettingSuggestion}
        >
          {isGettingSuggestion ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Dashboard
            </>
          )}
        </Button>
      </div>
    </div>

    {dashboardConfig ? (
      <DashboardCanvas
        config={dashboardConfig}
        data={processedData}
        selectedChartId={selectedChartId}
        onChartSelect={setSelectedChartId}
      />
    ) : (
      <Card variant="glass">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">
            Click "Generate Dashboard" to create visualizations
          </p>
        </CardContent>
      </Card>
    )}
  </motion.div>
)}
```

### Step 1.7: Create Basic Dashboard Config Generator (Temporary)

**File:** `src/lib/dashboard-generator-basic.ts` (NEW - Temporary until P4)

```typescript
import { DashboardConfig, ChartConfig, KPIConfig, ChartType } from './dashboard-types';
import { suggestChart, ChartSuggestion } from './gemini-ai';

/**
 * TEMPORARY: Basic dashboard generator
 * Creates simple 2-chart + 2-KPI layout
 * Will be replaced by AI-powered generator in P4
 */
export async function generateBasicDashboard(
  data: Record<string, any>[],
  columnMapping: Record<string, string>
): Promise<DashboardConfig> {
  const config: DashboardConfig = {
    id: crypto.randomUUID(),
    version: '1.0',
    kpis: [],
    charts: [],
    layout: {
      type: 'grid',
      columns: 12,
      rows: [],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create 2 default KPIs
  const totalRecordsKPI: KPIConfig = {
    id: crypto.randomUUID(),
    title: 'Total Records',
    description: 'Total number of data rows',
    expression: {
      aggregation: 'count',
      field: Object.keys(data[0])[0], // Use first column
    },
    format: 'number',
    icon: 'Database',
    span: 6,
  };

  const numericColumns = Object.entries(columnMapping)
    .filter(([_, type]) => type === 'number')
    .map(([col, _]) => col);

  if (numericColumns.length > 0) {
    const sumKPI: KPIConfig = {
      id: crypto.randomUUID(),
      title: `Total ${numericColumns[0]}`,
      description: `Sum of all ${numericColumns[0]} values`,
      expression: {
        aggregation: 'sum',
        field: numericColumns[0],
      },
      format: 'number',
      icon: 'TrendingUp',
      span: 6,
    };
    config.kpis.push(sumKPI);
  }

  config.kpis.push(totalRecordsKPI);

  // Get AI suggestion for first chart
  try {
    const suggestion = await suggestChart(data);

    const chart1: ChartConfig = {
      id: crypto.randomUUID(),
      type: suggestion.chartType,
      title: `${suggestion.chartType} Chart`,
      xField: suggestion.xKey,
      yField: suggestion.yKey,
      span: 12,
    };
    config.charts.push(chart1);
  } catch (error) {
    console.error('AI suggestion failed, using fallback', error);
  }

  // Create layout
  // Row 1: KPIs
  if (config.kpis.length > 0) {
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: config.kpis.map(k => k.id),
      span: config.kpis.map(k => k.span || 6),
    });
  }

  // Row 2: Charts
  if (config.charts.length > 0) {
    config.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: config.charts.map(c => c.id),
      span: config.charts.map(c => c.span || 12),
    });
  }

  return config;
}
```

### Step 1.8: Update Dashboard Page Handler

**File:** `src/app/dashboard/page.tsx` (ENHANCE)

```typescript
// ADD IMPORT
import { generateBasicDashboard } from '@/lib/dashboard-generator-basic';

// UPDATE handleGenerateDashboard function
const handleGenerateDashboard = async () => {
  if (processedData.length === 0) {
    toast.error('No data to visualize');
    return;
  }

  setIsGettingSuggestion(true);

  try {
    const config = await generateBasicDashboard(processedData, columnMapping);
    setDashboardConfig(config);
    toast.success('Dashboard generated successfully!');
  } catch (error) {
    console.error('Dashboard generation error:', error);
    toast.error('Failed to generate dashboard');
  } finally {
    setIsGettingSuggestion(false);
  }
};
```

---

## P2: Chart Type Selector

**Priority:** HIGH
**Estimated Effort:** 4-6 hours
**Dependencies:** P1 (Multi-chart rendering)

### Objective
Allow users to manually change chart types after AI suggestion.

### Step 2.1: Chart Type Selector Component

**File:** `src/components/dashboard/ChartTypeSelector.tsx` (NEW)

```typescript
'use client';

import React from 'react';
import { ChartType } from '@/lib/dashboard-types';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Activity, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  options?: ChartType[];
}

export default function ChartTypeSelector({
  value,
  onChange,
  options = ['line', 'bar', 'area', 'pie'],
}: ChartTypeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 glass-subtle rounded-lg">
      {options.map(type => {
        const Icon = getChartIcon(type);
        const isActive = value === type;

        return (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => onChange(type)}
            className={cn(
              "p-2 h-8 w-8",
              isActive && "bg-primary/20 text-primary"
            )}
            title={`${type.charAt(0).toUpperCase()}${type.slice(1)} Chart`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}

function getChartIcon(type: ChartType) {
  switch (type) {
    case 'line':
      return TrendingUp;
    case 'bar':
      return BarChart3;
    case 'area':
      return Activity;
    case 'pie':
      return PieChart;
    default:
      return Activity;
  }
}
```

### Step 2.2: Update DashboardCanvas to Support Chart Type Selection

**File:** `src/components/dashboard/DashboardCanvas.tsx` (ENHANCE)

```typescript
// ADD IMPORT
import ChartTypeSelector from './ChartTypeSelector';

// ADD PROP
interface DashboardCanvasProps {
  config: DashboardConfig;
  data: Record<string, any>[];
  onChartSelect?: (chartId: string) => void;
  onChartTypeChange?: (chartId: string, newType: ChartType) => void; // NEW
  selectedChartId?: string | null;
}

// UPDATE renderWidget for charts
else if (isChartConfig(widget)) {
  const isSelected = selectedChartId === widget.id;
  const chartData = data;

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
    isSelected ? 'ring-2 ring-primary' : ''
  }`;

  return (
    <div key={widget.id} className="space-y-2">
      {/* Chart Type Selector */}
      {isSelected && onChartTypeChange && (
        <ChartTypeSelector
          value={widget.type}
          onChange={handleTypeChange}
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
```

### Step 2.3: Add Chart Type Change Handler to Dashboard Page

**File:** `src/app/dashboard/page.tsx` (ENHANCE)

```typescript
// ADD HANDLER
const handleChartTypeChange = (chartId: string, newType: ChartType) => {
  if (!dashboardConfig) return;

  const updatedConfig = {
    ...dashboardConfig,
    charts: dashboardConfig.charts.map(chart =>
      chart.id === chartId
        ? { ...chart, type: newType }
        : chart
    ),
    updatedAt: new Date().toISOString(),
  };

  setDashboardConfig(updatedConfig);
  toast.success(`Chart type changed to ${newType}`);
};

// UPDATE DashboardCanvas component
<DashboardCanvas
  config={dashboardConfig}
  data={processedData}
  selectedChartId={selectedChartId}
  onChartSelect={setSelectedChartId}
  onChartTypeChange={handleChartTypeChange} // NEW
/>
```

---

## P3: Customizable KPIs

**Priority:** HIGH
**Estimated Effort:** 15-20 hours
**Dependencies:** P1 (Multi-chart rendering)

### Objective
Enable users to create custom KPIs with aggregations, fields, and formatting.

### Step 3.1: KPI Builder Component

**File:** `src/components/dashboard/KPIBuilder.tsx` (NEW)

```typescript
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIConfig, AggregationType } from '@/lib/dashboard-types';
import * as LucideIcons from 'lucide-react';

interface KPIBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: string[];
  onSave: (kpi: KPIConfig) => void;
}

const LUCIDE_ICONS = [
  'Activity', 'TrendingUp', 'TrendingDown', 'DollarSign', 'Users',
  'ShoppingCart', 'Database', 'BarChart3', 'PieChart', 'Target'
];

export default function KPIBuilder({ open, onOpenChange, columns, onSave }: KPIBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState(columns[0] || '');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [format, setFormat] = useState<'number' | 'currency' | 'percentage'>('number');
  const [icon, setIcon] = useState('Activity');

  const handleSave = () => {
    if (!title || !field) {
      return;
    }

    const kpi: KPIConfig = {
      id: crypto.randomUUID(),
      title,
      description,
      expression: {
        aggregation,
        field,
      },
      format,
      icon,
      span: 6, // Half width
    };

    onSave(kpi);

    // Reset form
    setTitle('');
    setDescription('');
    setField(columns[0] || '');
    setAggregation('sum');
    setFormat('number');
    setIcon('Activity');

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-standard">
        <DialogHeader>
          <DialogTitle>Create KPI</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Total Revenue"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Sum of all revenue values"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger id="field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aggregation">Aggregation</Label>
            <Select value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
              <SelectTrigger id="aggregation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="avg">Average</SelectItem>
                <SelectItem value="min">Minimum</SelectItem>
                <SelectItem value="max">Maximum</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="countDistinct">Count Distinct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency (USD)</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LUCIDE_ICONS.map(iconName => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !field}>
            Create KPI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 3.2: Add KPI Management to Dashboard Page

**File:** `src/app/dashboard/page.tsx` (ENHANCE)

```typescript
// ADD IMPORT
import KPIBuilder from '@/components/dashboard/KPIBuilder';
import { Plus } from 'lucide-react';

// ADD STATE
const [showKPIBuilder, setShowKPIBuilder] = useState(false);

// ADD HANDLER
const handleAddKPI = (kpi: KPIConfig) => {
  if (!dashboardConfig) return;

  const updatedConfig = {
    ...dashboardConfig,
    kpis: [...dashboardConfig.kpis, kpi],
    updatedAt: new Date().toISOString(),
  };

  // Add to layout (first row if exists, or create new row)
  if (updatedConfig.layout.rows.length > 0) {
    const firstRow = updatedConfig.layout.rows[0];
    firstRow.widgets.push(kpi.id);
    firstRow.span.push(kpi.span || 6);
  } else {
    updatedConfig.layout.rows.push({
      id: crypto.randomUUID(),
      widgets: [kpi.id],
      span: [kpi.span || 6],
    });
  }

  setDashboardConfig(updatedConfig);
  toast.success('KPI added successfully!');
};

// ADD BUTTON to dashboard header
<div className="flex gap-2">
  <Button
    variant="outline"
    onClick={() => setShowKPIBuilder(true)}
    disabled={!dashboardConfig}
  >
    <Plus className="mr-2 h-4 w-4" />
    Add KPI
  </Button>

  <Button
    onClick={handleGenerateDashboard}
    disabled={isGettingSuggestion}
  >
    {/* ... existing code ... */}
  </Button>
</div>

// ADD KPIBuilder component
<KPIBuilder
  open={showKPIBuilder}
  onOpenChange={setShowKPIBuilder}
  columns={Object.keys(columnMapping)}
  onSave={handleAddKPI}
/>
```

---

## P4: AI Dashboard Config Generator

**Priority:** CRITICAL
**Estimated Effort:** 40-60 hours
**Dependencies:** P1, P3

### Objective
Update AI integration to generate complete dashboard configurations with multiple KPIs, charts, and layout.

### Step 4.1: Enhanced Gemini AI Integration

**File:** `src/lib/ai-dashboard-generator.ts` (NEW)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DashboardConfig, DashboardConfigSchema } from './dashboard-types';
import { createEmptyDashboardConfig } from './dashboard-types';

export async function generateDashboardWithAI(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  apiKey?: string
): Promise<DashboardConfig> {
  if (!apiKey) {
    throw new Error('Gemini API key required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Prepare field metadata
  const fields = Object.entries(columnMapping).map(([name, type]) => ({
    name,
    type,
    sampleValues: data.slice(0, 3).map(row => row[name]),
  }));

  const prompt = `
You are an expert dashboard designer. Analyze this dataset and create a complete dashboard configuration.

Dataset Profile:
- Row Count: ${data.length}
- Fields: ${JSON.stringify(fields, null, 2)}

Return a JSON object with this EXACT structure (no markdown, no explanation):
{
  "kpis": [
    {
      "title": "Total Revenue",
      "description": "Sum of all sales",
      "expression": {
        "aggregation": "sum",
        "field": "revenue"
      },
      "format": "currency",
      "icon": "DollarSign",
      "span": 6
    }
  ],
  "charts": [
    {
      "type": "line",
      "title": "Revenue Trend",
      "xField": "date",
      "yField": "revenue",
      "span": 12
    }
  ]
}

Rules:
1. Create 2-4 KPIs based on numeric fields
2. Create 2-3 charts showing different insights
3. Use aggregations: sum, avg, min, max, count, countDistinct
4. Use chart types: line, bar, area, pie
5. KPI icons: Activity, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Database, BarChart3, PieChart, Target
6. KPI formats: number, currency, percentage
7. Chart spans: 6 (half-width) or 12 (full-width)
8. KPI spans: 3, 4, or 6 (fit in 12-column grid)
9. Choose xField and yField that make sense together
10. For time-series data, use line or area charts
11. For categorical data, use bar or pie charts

Respond ONLY with valid JSON, no markdown formatting.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean response (remove markdown if present)
    const cleanJson = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiResponse = JSON.parse(cleanJson);

    // Build dashboard config
    const config: DashboardConfig = {
      id: crypto.randomUUID(),
      version: '1.0',
      kpis: aiResponse.kpis.map((kpi: any) => ({
        id: crypto.randomUUID(),
        title: kpi.title,
        description: kpi.description,
        expression: kpi.expression,
        format: kpi.format,
        icon: kpi.icon,
        span: kpi.span || 6,
      })),
      charts: aiResponse.charts.map((chart: any) => ({
        id: crypto.randomUUID(),
        type: chart.type,
        title: chart.title,
        xField: chart.xField,
        yField: chart.yField,
        groupBy: chart.groupBy,
        span: chart.span || 12,
      })),
      layout: {
        type: 'grid',
        columns: 12,
        rows: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Build layout
    // Row 1: KPIs
    if (config.kpis.length > 0) {
      config.layout.rows.push({
        id: crypto.randomUUID(),
        widgets: config.kpis.map(k => k.id),
        span: config.kpis.map(k => k.span || 6),
      });
    }

    // Subsequent rows: Charts
    config.charts.forEach(chart => {
      config.layout.rows.push({
        id: crypto.randomUUID(),
        widgets: [chart.id],
        span: [chart.span || 12],
      });
    });

    // Validate with Zod
    const validated = DashboardConfigSchema.parse(config);
    return validated;

  } catch (error) {
    console.error('AI dashboard generation failed:', error);
    throw new Error('Failed to generate dashboard with AI');
  }
}
```

### Step 4.2: Update Dashboard Page to Use AI Generator

**File:** `src/app/dashboard/page.tsx` (ENHANCE)

```typescript
// REPLACE IMPORT
import { generateDashboardWithAI } from '@/lib/ai-dashboard-generator';

// UPDATE handleGenerateDashboard
const handleGenerateDashboard = async () => {
  if (processedData.length === 0) {
    toast.error('No data to visualize');
    return;
  }

  setIsGettingSuggestion(true);

  try {
    // Get API key from localStorage
    const apiKey = localStorage.getItem('gemini-api-key') || '';

    if (!apiKey) {
      toast.error('Please configure your Gemini API key in Settings');
      setIsGettingSuggestion(false);
      return;
    }

    const config = await generateDashboardWithAI(
      processedData,
      columnMapping,
      apiKey
    );

    setDashboardConfig(config);
    toast.success('Dashboard generated successfully!');
  } catch (error) {
    console.error('Dashboard generation error:', error);

    // Fallback to basic generator
    try {
      const config = await generateBasicDashboard(processedData, columnMapping);
      setDashboardConfig(config);
      toast.warning('Using basic dashboard (AI failed)');
    } catch (fallbackError) {
      toast.error('Failed to generate dashboard');
    }
  } finally {
    setIsGettingSuggestion(false);
  }
};
```

---

## P5: Simple Layout Editor

**Priority:** HIGH
**Estimated Effort:** 8-12 hours
**Dependencies:** P1

### Objective
Enable basic drag-and-drop widget rearrangement.

### Step 5.1: Add Drag-and-Drop to DashboardCanvas

**File:** `src/components/dashboard/DashboardCanvas.tsx` (ENHANCE)

```typescript
// ADD IMPORTS
import { useState } from 'react';
import { GripVertical } from 'lucide-react';

// ADD PROPS
interface DashboardCanvasProps {
  config: DashboardConfig;
  data: Record<string, any>[];
  onChartSelect?: (chartId: string) => void;
  onChartTypeChange?: (chartId: string, newType: ChartType) => void;
  onLayoutChange?: (newConfig: DashboardConfig) => void; // NEW
  selectedChartId?: string | null;
  editMode?: boolean; // NEW
}

// ADD STATE
const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
const [dragOverRow, setDragOverRow] = useState<string | null>(null);

// ADD DRAG HANDLERS
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

  const newConfig = {
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

// UPDATE RENDERING with drag handles
return (
  <div className="space-y-6">
    {config.layout.rows.map((row) => (
      <div
        key={row.id}
        className={`grid grid-cols-12 gap-4 ${
          dragOverRow === row.id ? 'ring-2 ring-primary' : ''
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
                    <GripVertical className="h-4 w-4" />
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
```

### Step 5.2: Add Edit Mode Toggle to Dashboard Page

**File:** `src/app/dashboard/page.tsx` (ENHANCE)

```typescript
// ADD IMPORT
import { Edit, Save } from 'lucide-react';

// ADD STATE
const [isEditMode, setIsEditMode] = useState(false);

// ADD HANDLER
const handleLayoutChange = (newConfig: DashboardConfig) => {
  setDashboardConfig(newConfig);
  toast.success('Layout updated');
};

// ADD BUTTON
<div className="flex gap-2">
  {dashboardConfig && (
    <Button
      variant="outline"
      onClick={() => setIsEditMode(!isEditMode)}
    >
      {isEditMode ? (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save Layout
        </>
      ) : (
        <>
          <Edit className="mr-2 h-4 w-4" />
          Edit Layout
        </>
      )}
    </Button>
  )}

  {/* ... existing buttons ... */}
</div>

// UPDATE DashboardCanvas
<DashboardCanvas
  config={dashboardConfig}
  data={processedData}
  selectedChartId={selectedChartId}
  onChartSelect={setSelectedChartId}
  onChartTypeChange={handleChartTypeChange}
  onLayoutChange={handleLayoutChange} // NEW
  editMode={isEditMode} // NEW
/>
```

---

## Testing Strategy

### Manual Testing Checklist

**P1: Multi-Chart Rendering**
- [ ] Upload Excel file with multiple sheets
- [ ] Generate dashboard
- [ ] Verify multiple KPIs render
- [ ] Verify multiple charts render
- [ ] Check responsive layout (mobile, tablet, desktop)
- [ ] Verify session saves and restores correctly

**P2: Chart Type Selector**
- [ ] Click on a chart to select it
- [ ] Change chart type using selector
- [ ] Verify chart re-renders with new type
- [ ] Check all 4 chart types (line, bar, area, pie)
- [ ] Verify selection persists after page reload

**P3: Customizable KPIs**
- [ ] Open KPI builder dialog
- [ ] Create KPI with sum aggregation
- [ ] Create KPI with average aggregation
- [ ] Test all 6 aggregation types
- [ ] Test all 3 formats (number, currency, percentage)
- [ ] Verify KPI values calculate correctly
- [ ] Check KPI icons display

**P4: AI Dashboard Config**
- [ ] Configure Gemini API key
- [ ] Generate dashboard with AI
- [ ] Verify AI suggests 2-4 KPIs
- [ ] Verify AI suggests 2-3 charts
- [ ] Test with different datasets (time-series, categorical)
- [ ] Test fallback when API key missing
- [ ] Verify JSON parsing handles errors

**P5: Layout Editor**
- [ ] Enable edit mode
- [ ] Drag KPI to different position
- [ ] Drag chart to different row
- [ ] Verify drag handles appear on hover
- [ ] Verify layout saves correctly
- [ ] Test with multiple widgets

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

---

## Success Criteria

### Feature Completeness
- [x] Multi-widget dashboards (5+ widgets)
- [x] Manual chart type selection
- [x] Dynamic KPI creation
- [x] AI-generated dashboard configs
- [x] Basic drag-and-drop layout

### Technical Quality
- [ ] TypeScript strict mode (no errors)
- [ ] All components use proper types
- [ ] Session persistence works
- [ ] Error handling for AI failures
- [ ] Loading states for async operations

### User Experience
- [ ] Smooth animations (60fps)
- [ ] Clear visual feedback for interactions
- [ ] Helpful error messages
- [ ] Mobile responsive

---

## Implementation Timeline

**Week 1:**
- Days 1-2: P1 (Multi-chart rendering)
- Days 3-4: P2 (Chart type selector)
- Day 5: P3 (Customizable KPIs - Part 1)

**Week 2:**
- Days 1-2: P3 (Customizable KPIs - Part 2)
- Days 3-5: P4 (AI dashboard config - Part 1)

**Week 3:**
- Days 1-3: P4 (AI dashboard config - Part 2)
- Days 4-5: P5 (Layout editor)

**Week 4:**
- Days 1-2: Testing and bug fixes
- Days 3-4: Polish and optimization
- Day 5: Documentation and handoff

---

## Next Steps

1. **Create branch:** `feature/phase-1-core-dashboard`
2. **Implement in order:** P1 → P2 → P3 → P4 → P5
3. **Test after each priority**
4. **Update this document** with any changes
5. **Create Phase 1 Completion Report** when done

---

**Document Status:** Ready for Implementation
**Next Action:** Begin P1 (Multi-Chart Rendering)
**Owner:** Development Team
**Review Date:** After P1 completion

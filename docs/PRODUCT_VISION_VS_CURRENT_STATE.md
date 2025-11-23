# Excel-to-Dashboard: Product Vision vs. Current State Analysis

**Document Version:** 1.0
**Date:** November 22, 2025
**Status:** Comprehensive Gap Analysis
**Purpose:** Compare original product vision with current implementation and define next steps

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Original Product Vision](#original-product-vision)
3. [Current Implementation State](#current-implementation-state)
4. [Feature-by-Feature Comparison](#feature-by-feature-comparison)
5. [Critical Gaps Analysis](#critical-gaps-analysis)
6. [Architecture Alignment](#architecture-alignment)
7. [Next Steps & Prioritization](#next-steps--prioritization)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Success Criteria](#success-criteria)

---

## Executive Summary

### Overall Completion Score: 65%

**What's Built (Excellent Foundation):**
- ✅ Privacy-first client-side architecture
- ✅ Multi-sheet Excel/CSV file processing
- ✅ AI integration with graceful fallback
- ✅ Basic 4-step workflow (Upload → Map → Dashboard → Alerts)
- ✅ Session persistence in IndexedDB
- ✅ Export to multiple formats
- ✅ Glassmorphic design system (foundation)

**Critical Missing Features:**
- ❌ **Multi-chart dashboards** - Only ONE chart displays (major gap)
- ❌ **Chart type selector** - No manual override of AI suggestions
- ❌ **Customizable KPIs** - Fixed to "Total Records" and "Columns" only
- ❌ **Dashboard layout editing** - No drag-and-drop, no repositioning
- ❌ **Component gene pool pattern** - AI doesn't compose from primitives
- ❌ **Dashboard variations/regeneration** - Can't flip through alternative layouts

**Product Positioning:**
- **Vision:** Spreadsheet-to-AI Dashboard Replacer with genetic layout engine
- **Reality:** Single-chart AI suggestion tool with alerts and export
- **Gap:** 35% of core vision unimplemented

---

## Original Product Vision

### 1. Mental Model (From Design Doc)

> "Spreadsheet-to-AI Dashboard Replacer is basically:
> 1. Local data profiler in the browser
> 2. AI layout engine that outputs a dashboard config
> 3. React dashboard renderer that reads that config"

**Key Principles:**
- AI does NOT do heavy analytics on raw data
- AI understands column meanings and proposes layouts
- AI returns **structured JSON config** (not just chart suggestions)
- Frontend renders based on config (component-driven)
- All client-side with user's own API key

### 2. End-to-End Workflow (4 Steps)

#### Step 1: Upload ✅ **IMPLEMENTED**
- ✅ Drag-and-drop or file picker for CSV/XLSX
- ✅ Multi-sheet support with sheet picker
- ✅ Client-side parsing with XLSX library
- ✅ Lightweight data profiling (column names, types, stats)

#### Step 2: AI Field Mapping ⚠️ **PARTIAL**
**Vision:**
- Deterministic inference (local rules) → THEN AI enrichment
- AI returns field mappings: `{ name, role: "dimension|measure|time|id|text", semanticType: "currency|percentage|..." }`
- User can tweak before generating dashboard

**Current Reality:**
- ✅ Deterministic type inference (date, number, category)
- ✅ Manual override in DataMapper UI
- ❌ No AI enrichment of field mappings
- ❌ No semantic type detection (currency, percentage, geo, etc.)
- ❌ No entity detection (Customer, Order, Project)

**Gap:** AI currently only suggests chart type, NOT field semantics.

#### Step 3: Auto Dashboard Preview ❌ **MISSING**
**Vision:**
- AI outputs **complete dashboard config** with:
  - `kpis`: Array of KPI cards (title, expression, breakdowns)
  - `charts`: Array of chart configs (type, xField, yField, groupBy, filters)
  - `alerts`: Array of alert conditions
  - `layout`: Grid positions for all widgets
  - `filters`: Global filter definitions (date range, category pickers)
- Frontend renders multiple widgets in responsive grid

**Current Reality:**
- ❌ AI returns only ONE chart suggestion (`ChartSuggestion` type)
- ❌ Dashboard shows ONE main chart + two fixed KPIs
- ❌ No layout config from AI
- ❌ No global filters (date range, category slicers)
- ❌ No multi-chart support

**Gap:** This is the CORE feature - completely missing.

#### Step 4: Customize ❌ **MISSING**
**Vision:**
- Left panel: Sections (KPIs, Charts, Filters, Alerts)
- Center: Selected widget preview
- Right: Inspector to adjust config (chart type, fields, colors)
- Features:
  - "Ask AI to improve this chart" button
  - "Add new chart" button (with AI suggestion)
  - Drag-and-drop layout editing
  - Save/export dashboard config

**Current Reality:**
- ❌ No left panel navigation
- ❌ No widget selection UI
- ❌ No inspector for customization
- ❌ Can only create alerts, not edit charts
- ❌ No "improve this chart" AI feature
- ❌ Cannot add additional charts

**Gap:** Entire customization layer is missing.

### 3. "Genetic" Dashboard Generation ❌ **NOT IMPLEMENTED**

**Vision:**
- Fixed set of component primitives (KPICard, TimeSeriesChart, CategoryBarChart, etc.)
- Each component has schema (inputs, outputs, interactions)
- AI decides:
  - Which components to use
  - How many
  - How to wire them to fields
  - Where to place in grid
- Multiple AI proposals → user flips through "dashboard variations"
- "Regenerate layout" button preserves mappings but changes layout

**Current Reality:**
- ✅ Component primitives exist (LineChartWidget, BarChartWidget, etc.)
- ❌ AI doesn't compose from component library
- ❌ No concept of dashboard "variations"
- ❌ No regeneration mechanism
- ❌ No layout engine

**Gap:** This is the MOST innovative feature - completely unbuilt.

### 4. Multi-Sheet Handling ⚠️ **BASIC ONLY**

**Vision - Option A (MVP):**
- Treat each sheet as separate dataset
- User selects one sheet to build dashboard

**Vision - Option B (Advanced):**
- Allow user to mark join keys between sheets
- AI proposes multi-source charts (e.g., "Orders" + "Customers")

**Current Reality:**
- ✅ Option A implemented (sheet selector dropdown)
- ❌ Option B not implemented (no joins)
- ⚠️ Can only visualize ONE sheet at a time

**Gap:** Multi-sheet is functional but basic.

### 5. Client-Side Storage, Keys, Privacy ✅ **EXCELLENT**

**Vision:**
- API key in settings modal, stored in sessionStorage
- Never send key to any backend
- Send AI only column names, types, stats, and tiny sample values
- Dashboard configs stored in IndexedDB/localStorage
- Export/import project (config + raw file)

**Current Reality:**
- ✅ API key in SettingsDialog, stored in localStorage
- ✅ Never sent to backend
- ✅ AI gets sample (first 5 rows)
- ✅ Sessions stored in IndexedDB (localforage)
- ❌ No export project feature (only export data formats)
- ❌ No import project feature

**Gap:** Privacy model is PERFECT. Export/import missing.

### 6. UI Structure ⚠️ **PARTIAL**

**Vision:**
- Top bar: App name, settings, API key status, import/export
- Left navigation: Steps or persistent menu
- Main canvas: Changes per step
- Right inspector: Contextual controls

**Current Reality:**
- ✅ Top bar with settings, theme toggle
- ❌ No left navigation (steps are inline)
- ✅ Main canvas changes per step (4-step wizard)
- ❌ No right inspector

**Gap:** Layout is simpler than vision. Inspector missing.

### 7. Interactive Chart Selection ❌ **MISSING**

**Vision:**
- Under each chart: Icons for bar, line, area, pie
- Click to toggle between types
- "Smart chart" toggle: AI adjusts when fields change

**Current Reality:**
- ❌ No chart type selector
- ❌ Locked to AI suggestion
- ❌ No "smart chart" mode

**Gap:** User has ZERO control over chart type.

---

## Current Implementation State

### What's Working (8.5/10 Foundation)

#### 1. File Processing Pipeline ✅ **EXCELLENT**
```
Upload → /api/parse (server) → Multi-sheet JSON →
rowsToObjects() → validateAndCleanData() → processedData
```
- Multi-format support (CSV, XLSX, XLS)
- Multi-sheet workbooks
- Type inference (date, number, category)
- Data validation with Zod schemas

#### 2. AI Integration ✅ **SOLID**
- **Google Gemini 1.5 Flash** (active)
- **OpenAI GPT** (switchable)
- **Graceful fallback** (ChartIntelligence.ts)
- Fallback analyzes: volatility, trends, distribution
- Decision tree for chart type when AI unavailable

**Current AI Prompt:**
```typescript
const prompt = `
  You are a data visualization assistant.
  Sample data: ${JSON.stringify(dataSample.slice(0, 5))}

  Respond with JSON:
  {
    "chartType": "line",
    "xKey": "column_name",
    "yKey": "column_name",
    "reasoning": "brief explanation"
  }
`;
```

**Gap:** Prompt is too simple. Should request full dashboard config.

#### 3. Chart Components ✅ **COMPLETE**
- LineChartWidget.tsx (time-series)
- BarChartWidget.tsx (categorical)
- AreaChartWidget.tsx (volume)
- PieChartWidget.tsx (proportions)
- CustomTooltip (glassmorphic)

**Issue:** Only ONE chart rendered at a time.

#### 4. Session Management ✅ **PROFESSIONAL**
```typescript
interface DashboardSession {
  id: string;
  uploadedData: Record<string, any[]>;
  processedData: Record<string, any>[];
  columnMapping: Record<string, string>;
  chartSuggestion?: ChartSuggestion;
  alertRules: AlertRule[];
  selectedSheet?: string;
  lastUpdated: string;
}
```
- Stored in IndexedDB (localforage)
- Auto-save with 1000ms debounce
- Session restoration on page load

#### 5. Alert System ✅ **COMPLETE**
- AlertManager.tsx (rule creation)
- AlertTemplates.tsx (pre-built patterns)
- AlertHistory.tsx (audit log)
- alert-engine.ts (evaluation)
- notification-manager.ts (browser notifications)
- Conditions: >, <, >=, <=, ==
- Evaluates latest data point only

#### 6. Export Features ✅ **COMPREHENSIVE**
- CSV (RFC 4180 compliant)
- JSON (with metadata wrapper)
- TSV (tab-separated)
- PNG (html2canvas)
- PDF (jsPDF)

**Issue:** Exports data, not dashboard config.

#### 7. Design System ✅ **WORLD-CLASS FOUNDATION**
- Glassmorphism utilities (.glass-standard, .glass-subtle, .glass-strong)
- OKLCH color system (<15% saturation)
- 13 animation keyframes
- Typography scale (Perfect Fourth ratio)
- Dark mode support
- Accessibility features

**Issue:** Only 65% adopted in components.

### What's Missing (Critical Gaps)

#### 1. Multi-Chart Dashboard Rendering ❌
**Current:** ONE chart per dashboard
**Needed:**
- Array of `ChartConfig` objects
- Render multiple charts in grid layout
- Each chart independently configured

**Impact:** Cannot build real dashboards.

#### 2. Chart Type Selector ❌
**Current:** AI suggestion is final
**Needed:**
- Dropdown or icon selector (line, bar, area, pie)
- Manual override of AI suggestion
- "Smart" mode that re-suggests on field change

**Impact:** Users frustrated by bad AI suggestions.

#### 3. Customizable KPIs ❌
**Current:** Fixed to "Total Records" and "Columns"
**Needed:**
- User-defined KPI expressions
- Aggregations (sum, avg, min, max, count)
- Filtering (e.g., "Sales this month")
- Comparisons (e.g., "vs. last month")

**Impact:** KPIs are useless for real data.

#### 4. Dashboard Layout Editor ❌
**Current:** Fixed grid layout
**Needed:**
- Drag-and-drop widgets
- Resize widgets
- Add/remove widgets
- Layout persistence

**Impact:** Cannot customize dashboard structure.

#### 5. AI Dashboard Config Generator ❌
**Current:** AI suggests ONE chart
**Needed:**
- AI analyzes ALL fields
- Proposes KPIs, charts, filters, alerts
- Returns structured JSON config
- Multiple variations/proposals

**Impact:** Not living up to "AI-powered" promise.

#### 6. Dashboard Variations/Regeneration ❌
**Current:** One-shot AI suggestion
**Needed:**
- "Regenerate" button for new layout
- Flip through variations (carousel)
- Save favorite variation

**Impact:** Missing the "genetic" innovation.

#### 7. Global Filters ❌
**Current:** No filtering capability
**Needed:**
- Date range picker
- Category multi-select
- Numeric range slider
- Applies to all charts

**Impact:** Cannot drill into data.

#### 8. "Ask AI to Improve" Feature ❌
**Current:** No AI interaction after initial suggestion
**Needed:**
- Click on chart → "Improve this chart" button
- Natural language request (e.g., "Show by region")
- AI updates that specific chart config

**Impact:** Limited AI utility.

#### 9. Dashboard Naming & Organization ❌
**Current:** Anonymous UUID sessions
**Needed:**
- Named dashboards
- Folders/tags
- Search dashboards
- Star favorites

**Impact:** Cannot manage multiple dashboards.

#### 10. Project Export/Import ❌
**Current:** Can export data, not dashboards
**Needed:**
- Export: Dashboard config + raw data → .json file
- Import: Load entire project instantly
- Share dashboards with colleagues

**Impact:** Cannot save work for later.

---

## Feature-by-Feature Comparison

| Feature | Vision | Current State | Gap | Priority |
|---------|--------|---------------|-----|----------|
| **File Upload** | Drag-drop CSV/Excel, multi-sheet | ✅ Fully implemented | None | - |
| **Data Profiling** | Column types, stats, samples | ✅ Fully implemented | None | - |
| **Field Mapping** | Auto-detect + AI enrichment | ⚠️ Auto-detect only | AI enrichment missing | MEDIUM |
| **AI Chart Suggestion** | One chart type | ✅ Working | None | - |
| **AI Dashboard Config** | Full config (KPIs, charts, layout, filters) | ❌ Missing | Complete feature | **CRITICAL** |
| **Multi-Chart Rendering** | Array of charts in grid | ❌ ONE chart only | Complete feature | **CRITICAL** |
| **Chart Type Selector** | Manual override with icons | ❌ Missing | Complete feature | **HIGH** |
| **Customizable KPIs** | User-defined expressions | ❌ Fixed KPIs | Complete feature | **HIGH** |
| **Layout Editing** | Drag-drop, resize widgets | ❌ Fixed layout | Complete feature | **HIGH** |
| **Global Filters** | Date range, category, numeric | ❌ No filters | Complete feature | MEDIUM |
| **Alert System** | Threshold-based monitoring | ✅ Fully implemented | None | - |
| **Dashboard Variations** | Flip through AI proposals | ❌ Missing | Complete feature | LOW |
| **"Improve Chart" AI** | Iterative refinement | ❌ Missing | Complete feature | LOW |
| **Dashboard Naming** | Named projects with folders | ❌ Anonymous sessions | Complete feature | MEDIUM |
| **Project Export/Import** | Save/load entire dashboard | ❌ Data export only | Complete feature | MEDIUM |
| **Session Persistence** | IndexedDB storage | ✅ Fully implemented | None | - |
| **Privacy Model** | Client-side only | ✅ Excellent | None | - |
| **Export Formats** | CSV, JSON, PNG, PDF | ✅ Fully implemented | None | - |
| **Design System** | Glassmorphic UI | ✅ Foundation built | 35% adoption gap | **HIGH** |
| **Accessibility** | WCAG 2.1 AA | ⚠️ Partial | Full audit needed | **HIGH** |

---

## Critical Gaps Analysis

### Gap #1: AI Dashboard Config Generator (**CRITICAL**)

**What's Missing:**
- AI prompt only requests ONE chart
- No concept of dashboard-level config
- No KPI generation
- No layout engine
- No filter generation

**What's Needed:**

#### Updated AI Prompt Structure:
```typescript
const prompt = `
You are an expert dashboard designer. Analyze this dataset and create a complete dashboard configuration.

Dataset Profile:
- Fields: ${JSON.stringify(fieldMappings)}
- Row Count: ${rowCount}
- Sample Data: ${JSON.stringify(sampleRows.slice(0, 5))}

Return a JSON object with this structure:
{
  "kpis": [
    {
      "id": "kpi-1",
      "title": "Total Revenue",
      "description": "Sum of all sales",
      "expression": { "aggregation": "sum", "field": "revenue" },
      "format": "currency",
      "icon": "DollarSign"
    }
  ],
  "charts": [
    {
      "id": "chart-1",
      "type": "line",
      "title": "Revenue Trend",
      "xField": "date",
      "yField": "revenue",
      "groupBy": null,
      "filters": [],
      "recommendedInteractions": ["hover", "crossfilter"]
    }
  ],
  "filters": [
    {
      "id": "filter-date-range",
      "type": "dateRange",
      "field": "date",
      "label": "Date Range",
      "defaultValue": "last30days"
    }
  ],
  "alerts": [
    {
      "id": "alert-1",
      "name": "Low Revenue Alert",
      "condition": "revenue < 10000",
      "description": "Alert when revenue drops below threshold"
    }
  ],
  "layout": {
    "type": "grid",
    "columns": 12,
    "rows": [
      { "widgets": ["kpi-1", "kpi-2", "kpi-3"], "span": [4, 4, 4] },
      { "widgets": ["chart-1"], "span": [12] },
      { "widgets": ["chart-2", "chart-3"], "span": [6, 6] }
    ]
  }
}
`;
```

#### New TypeScript Interfaces:
```typescript
interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  kpis: KPIConfig[];
  charts: ChartConfig[];
  filters: FilterConfig[];
  alerts: AlertConfig[];
  layout: LayoutConfig;
  createdAt: string;
  updatedAt: string;
}

interface KPIConfig {
  id: string;
  title: string;
  description: string;
  expression: {
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
    field: string;
    filter?: FilterExpression;
  };
  format: 'number' | 'currency' | 'percentage';
  icon: string;
  comparison?: {
    type: 'previous_period' | 'target';
    value: number;
  };
}

interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'table';
  title: string;
  description?: string;
  xField: string;
  yField: string;
  groupBy?: string;
  filters: FilterExpression[];
  sortBy?: { field: string; order: 'asc' | 'desc' };
  limit?: number;
  colors?: string[];
  recommendedInteractions: string[];
}

interface FilterConfig {
  id: string;
  type: 'dateRange' | 'category' | 'numericRange';
  field: string;
  label: string;
  defaultValue?: any;
  options?: string[];
}

interface LayoutConfig {
  type: 'grid' | 'flex';
  columns: number;
  rows: LayoutRow[];
}

interface LayoutRow {
  widgets: string[]; // IDs of KPIs, charts, filters
  span: number[];    // Column spans for each widget
  height?: number;   // Row height in pixels
}
```

#### Implementation Files Needed:
1. `src/lib/ai-dashboard-generator.ts` - AI config generator
2. `src/lib/dashboard-renderer.ts` - Config-to-React renderer
3. `src/components/DashboardCanvas.tsx` - Multi-widget grid
4. `src/components/KPICardDynamic.tsx` - Config-driven KPI
5. `src/components/FilterBar.tsx` - Global filters

**Estimated Effort:** 40-60 hours

---

### Gap #2: Multi-Chart Dashboard Rendering (**CRITICAL**)

**What's Missing:**
- Only ONE chart rendered
- No concept of widget array
- No grid layout manager

**What's Needed:**

#### DashboardCanvas Component:
```tsx
// src/components/DashboardCanvas.tsx
interface DashboardCanvasProps {
  config: DashboardConfig;
  data: Record<string, any>[];
}

export function DashboardCanvas({ config, data }: DashboardCanvasProps) {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [globalFilters, setGlobalFilters] = useState<FilterValues>({});

  // Apply global filters to data
  const filteredData = useMemo(() =>
    applyFilters(data, globalFilters),
    [data, globalFilters]
  );

  return (
    <div className="dashboard-canvas">
      {/* Filter Bar */}
      <FilterBar
        filters={config.filters}
        values={globalFilters}
        onChange={setGlobalFilters}
      />

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {config.layout.rows.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.widgets.map((widgetId, widgetIndex) => {
              const span = row.span[widgetIndex];
              const widget = findWidget(config, widgetId);

              return (
                <div
                  key={widgetId}
                  className={`col-span-${span}`}
                  onClick={() => setSelectedWidget(widgetId)}
                >
                  {renderWidget(widget, filteredData)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function renderWidget(
  widget: KPIConfig | ChartConfig,
  data: Record<string, any>[]
) {
  if ('expression' in widget) {
    // KPI
    const value = calculateKPI(widget.expression, data);
    return <KPICardDynamic config={widget} value={value} />;
  } else {
    // Chart
    switch (widget.type) {
      case 'line': return <LineChartWidget {...widget} data={data} />;
      case 'bar': return <BarChartWidget {...widget} data={data} />;
      case 'area': return <AreaChartWidget {...widget} data={data} />;
      case 'pie': return <PieChartWidget {...widget} data={data} />;
      default: return null;
    }
  }
}
```

#### Updated Dashboard Page:
```tsx
// src/app/dashboard/page.tsx
const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);

const handleGetAIDashboard = async () => {
  setIsGettingSuggestion(true);
  try {
    // NEW: Get full dashboard config
    const config = await generateDashboardConfig(
      processedData,
      columnMapping
    );
    setDashboardConfig(config);
  } catch (error) {
    toast.error('Failed to generate dashboard');
  } finally {
    setIsGettingSuggestion(false);
  }
};

// Render
{dashboardConfig && (
  <DashboardCanvas
    config={dashboardConfig}
    data={processedData}
  />
)}
```

**Estimated Effort:** 20-30 hours

---

### Gap #3: Chart Type Selector (**HIGH**)

**What's Missing:**
- Cannot change chart type after AI suggestion
- No manual override

**What's Needed:**

#### ChartTypeSelector Component:
```tsx
// src/components/ChartTypeSelector.tsx
interface ChartTypeSelectorProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  options?: ChartType[];
}

export function ChartTypeSelector({
  value,
  onChange,
  options = ['line', 'bar', 'area', 'pie']
}: ChartTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map(type => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "p-2 rounded-lg glass-subtle transition-all",
            value === type && "bg-primary/20 ring-2 ring-primary"
          )}
          title={`${type.charAt(0).toUpperCase()}${type.slice(1)} Chart`}
        >
          <ChartIcon type={type} className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

function ChartIcon({ type }: { type: ChartType }) {
  switch (type) {
    case 'line': return <TrendingUp />;
    case 'bar': return <BarChart3 />;
    case 'area': return <Activity />;
    case 'pie': return <PieChart />;
    default: return null;
  }
}
```

#### Usage in ChartConfig:
```tsx
<ChartContainer
  title="Revenue Trend"
  actions={
    <ChartTypeSelector
      value={chartConfig.type}
      onChange={(type) => updateChartConfig(chartConfig.id, { type })}
    />
  }
>
  <ChartWidget config={chartConfig} data={data} />
</ChartContainer>
```

**Estimated Effort:** 4-6 hours

---

### Gap #4: Customizable KPIs (**HIGH**)

**What's Missing:**
- KPIs hardcoded to "Total Records" and "Columns"
- No aggregation support
- No filtering

**What's Needed:**

#### KPI Expression Engine:
```typescript
// src/lib/kpi-calculator.ts (enhanced)
interface KPIExpression {
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct';
  field: string;
  filter?: FilterExpression;
}

interface FilterExpression {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains';
  value: any;
}

export function calculateKPI(
  expression: KPIExpression,
  data: Record<string, any>[]
): number {
  // Apply filter if present
  let filteredData = data;
  if (expression.filter) {
    filteredData = data.filter(row =>
      evaluateFilter(row, expression.filter!)
    );
  }

  // Extract values
  const values = filteredData
    .map(row => row[expression.field])
    .filter(v => v != null && !isNaN(Number(v)))
    .map(Number);

  // Aggregate
  switch (expression.aggregation) {
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min': return Math.min(...values);
    case 'max': return Math.max(...values);
    case 'count': return filteredData.length;
    case 'countDistinct': return new Set(values).size;
    default: return 0;
  }
}

function evaluateFilter(
  row: Record<string, any>,
  filter: FilterExpression
): boolean {
  const fieldValue = row[filter.field];
  switch (filter.operator) {
    case '==': return fieldValue === filter.value;
    case '!=': return fieldValue !== filter.value;
    case '>': return Number(fieldValue) > Number(filter.value);
    case '<': return Number(fieldValue) < Number(filter.value);
    case '>=': return Number(fieldValue) >= Number(filter.value);
    case '<=': return Number(fieldValue) <= Number(filter.value);
    case 'in': return Array.isArray(filter.value) && filter.value.includes(fieldValue);
    case 'contains': return String(fieldValue).includes(String(filter.value));
    default: return true;
  }
}
```

#### KPI Builder UI:
```tsx
// src/components/KPIBuilder.tsx
export function KPIBuilder({ onSave }: { onSave: (kpi: KPIConfig) => void }) {
  const [title, setTitle] = useState('');
  const [field, setField] = useState('');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'min' | 'max' | 'count'>('sum');
  const [format, setFormat] = useState<'number' | 'currency' | 'percentage'>('number');

  const handleSave = () => {
    onSave({
      id: generateId(),
      title,
      description: `${aggregation} of ${field}`,
      expression: { aggregation, field },
      format,
      icon: 'Activity'
    });
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Create KPI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Field</Label>
          <Select value={field} onValueChange={setField}>
            {/* Column options */}
          </Select>
        </div>
        <div>
          <Label>Aggregation</Label>
          <Select value={aggregation} onValueChange={setAggregation}>
            <SelectItem value="sum">Sum</SelectItem>
            <SelectItem value="avg">Average</SelectItem>
            <SelectItem value="min">Minimum</SelectItem>
            <SelectItem value="max">Maximum</SelectItem>
            <SelectItem value="count">Count</SelectItem>
          </Select>
        </div>
        <div>
          <Label>Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="currency">Currency</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
          </Select>
        </div>
        <Button onClick={handleSave}>Save KPI</Button>
      </CardContent>
    </Card>
  );
}
```

**Estimated Effort:** 15-20 hours

---

### Gap #5: Dashboard Layout Editor (**HIGH**)

**What's Missing:**
- Fixed grid layout
- Cannot rearrange widgets
- Cannot resize widgets

**What's Needed:**

**Option 1: Simple Grid (Recommended for MVP)**
```tsx
// src/components/DashboardGrid.tsx (enhanced)
export function DashboardGrid({
  widgets,
  onReorder
}: {
  widgets: WidgetConfig[];
  onReorder: (newOrder: WidgetConfig[]) => void;
}) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-12 gap-6">
      {widgets.map((widget, index) => (
        <div
          key={widget.id}
          className={`col-span-${widget.span || 12}`}
          draggable
          onDragStart={() => setDraggedWidget(widget.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
        >
          <WidgetWrapper config={widget}>
            {renderWidget(widget)}
          </WidgetWrapper>
        </div>
      ))}
    </div>
  );
}
```

**Option 2: React-Grid-Layout (Advanced)**
```tsx
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

export function DashboardGridAdvanced({
  config,
  onLayoutChange
}: DashboardGridAdvancedProps) {
  const layout = config.layout.rows.flatMap((row, rowIndex) =>
    row.widgets.map((widgetId, widgetIndex) => ({
      i: widgetId,
      x: row.span.slice(0, widgetIndex).reduce((a, b) => a + b, 0),
      y: rowIndex,
      w: row.span[widgetIndex],
      h: row.height || 4
    }))
  );

  return (
    <GridLayout
      layout={layout}
      cols={12}
      rowHeight={100}
      width={1200}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
      compactType="vertical"
    >
      {config.layout.rows.flatMap(row =>
        row.widgets.map(widgetId => (
          <div key={widgetId} className="glass-standard rounded-xl">
            <div className="drag-handle p-2 cursor-move">
              <GripVertical className="h-4 w-4" />
            </div>
            {renderWidget(findWidget(config, widgetId))}
          </div>
        ))
      )}
    </GridLayout>
  );
}
```

**Estimated Effort:**
- Simple grid: 8-12 hours
- React-Grid-Layout: 20-30 hours

---

### Gap #6: Global Filters (**MEDIUM**)

**What's Missing:**
- No date range picker
- No category filters
- No way to drill into data

**What's Needed:**

#### FilterBar Component:
```tsx
// src/components/FilterBar.tsx
export function FilterBar({
  filters,
  values,
  onChange
}: FilterBarProps) {
  return (
    <div className="glass-standard rounded-xl p-4 flex gap-4 flex-wrap mb-6">
      {filters.map(filter => {
        switch (filter.type) {
          case 'dateRange':
            return (
              <DateRangePicker
                key={filter.id}
                label={filter.label}
                value={values[filter.id]}
                onChange={(range) => onChange({ ...values, [filter.id]: range })}
              />
            );
          case 'category':
            return (
              <CategoryFilter
                key={filter.id}
                label={filter.label}
                options={filter.options || []}
                value={values[filter.id]}
                onChange={(selected) => onChange({ ...values, [filter.id]: selected })}
              />
            );
          case 'numericRange':
            return (
              <NumericRangeFilter
                key={filter.id}
                label={filter.label}
                min={filter.min}
                max={filter.max}
                value={values[filter.id]}
                onChange={(range) => onChange({ ...values, [filter.id]: range })}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
```

**Estimated Effort:** 12-16 hours

---

### Gap #7: Dashboard Naming & Organization (**MEDIUM**)

**What's Missing:**
- Sessions have UUIDs, not names
- No dashboard library
- Cannot search dashboards

**What's Needed:**

#### Enhanced Session Interface:
```typescript
interface DashboardSession {
  id: string;
  name: string;              // NEW
  description?: string;      // NEW
  tags: string[];            // NEW
  folder?: string;           // NEW
  isFavorite: boolean;       // NEW
  thumbnail?: string;        // NEW (base64 image)
  uploadedData: Record<string, any[]>;
  processedData: Record<string, any>[];
  columnMapping: Record<string, string>;
  dashboardConfig: DashboardConfig; // UPDATED
  alertRules: AlertRule[];
  selectedSheet?: string;
  createdAt: string;
  lastUpdated: string;
}
```

#### Dashboard Library Component:
```tsx
// src/components/DashboardLibrary.tsx
export function DashboardLibrary() {
  const [dashboards, setDashboards] = useState<DashboardSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadDashboards();
  }, []);

  const filteredDashboards = dashboards.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || d.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search dashboards..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="glass-subtle"
        />
        <TagFilter tags={allTags} selected={selectedTag} onChange={setSelectedTag} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDashboards.map(dashboard => (
          <DashboardCard
            key={dashboard.id}
            dashboard={dashboard}
            onOpen={() => openDashboard(dashboard.id)}
            onDelete={() => deleteDashboard(dashboard.id)}
            onToggleFavorite={() => toggleFavorite(dashboard.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

**Estimated Effort:** 16-20 hours

---

### Gap #8: Project Export/Import (**MEDIUM**)

**What's Missing:**
- Can export data, not dashboards
- Cannot share dashboards with colleagues
- No import feature

**What's Needed:**

#### Export Dashboard Project:
```typescript
// src/lib/dashboard-export.ts
export function exportDashboardProject(session: DashboardSession): void {
  const project = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    dashboard: {
      id: session.id,
      name: session.name,
      description: session.description,
      config: session.dashboardConfig,
      alertRules: session.alertRules
    },
    data: {
      uploadedData: session.uploadedData,
      processedData: session.processedData,
      columnMapping: session.columnMapping,
      selectedSheet: session.selectedSheet
    }
  };

  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${session.name.replace(/\s+/g, '-')}-dashboard.json`;
  link.click();
  URL.revokeObjectURL(url);
}
```

#### Import Dashboard Project:
```typescript
// src/lib/dashboard-import.ts
export async function importDashboardProject(
  file: File
): Promise<DashboardSession> {
  const text = await file.text();
  const project = JSON.parse(text);

  // Validate version
  if (project.version !== '1.0') {
    throw new Error('Unsupported project version');
  }

  // Create new session
  const session: DashboardSession = {
    id: generateId(),
    name: `${project.dashboard.name} (Imported)`,
    description: project.dashboard.description,
    tags: [],
    folder: undefined,
    isFavorite: false,
    uploadedData: project.data.uploadedData,
    processedData: project.data.processedData,
    columnMapping: project.data.columnMapping,
    dashboardConfig: project.dashboard.config,
    alertRules: project.dashboard.alertRules,
    selectedSheet: project.data.selectedSheet,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  // Save to IndexedDB
  await sessionManager.saveSession(session);
  return session;
}
```

**Estimated Effort:** 8-12 hours

---

## Architecture Alignment

### Vision Architecture ✅ **WELL-ALIGNED**

**Original Vision:**
1. Local data profiler in the browser
2. AI layout engine that outputs dashboard config
3. React dashboard renderer that reads config

**Current Reality:**
1. ✅ Data profiler: `data-processor.ts`, `data-schemas.ts`
2. ❌ AI layout engine: Only suggests ONE chart (needs expansion)
3. ⚠️ Dashboard renderer: Hardcoded components (needs config-driven)

**Alignment Score:** 60%

### Data Flow ✅ **PERFECT**

**Vision:**
```
Upload → Parse → Profile → AI Config → Render → Persist
```

**Current:**
```
Upload → /api/parse → rowsToObjects() → AI Suggestion →
Chart Component → sessionManager.saveSession()
```

**Alignment Score:** 90% (missing AI config step)

### Privacy Model ✅ **EXCELLENT**

**Vision:**
- All client-side
- User's own API key
- No backend database

**Current:**
- ✅ All client-side
- ✅ User's own API key (localStorage)
- ✅ No backend database (IndexedDB only)

**Alignment Score:** 100%

### Component Primitives ✅ **FOUNDATION READY**

**Vision:**
- Fixed component gene pool
- AI selects from library
- Component schemas define inputs/outputs

**Current:**
- ✅ Component library exists (LineChartWidget, BarChartWidget, etc.)
- ❌ No component schemas
- ❌ AI doesn't select from library

**Alignment Score:** 40%

**What's Needed:**
```typescript
// src/lib/component-library.ts
export const COMPONENT_LIBRARY = {
  'kpi-card': {
    name: 'KPI Card',
    description: 'Single metric display',
    inputs: {
      title: 'string',
      expression: 'KPIExpression',
      format: 'number | currency | percentage',
      icon: 'string'
    },
    outputs: {
      value: 'number',
      trend: 'number'
    },
    minWidth: 4,
    maxWidth: 6,
    recommendedHeight: 2
  },
  'line-chart': {
    name: 'Line Chart',
    description: 'Time-series trends',
    inputs: {
      xField: 'string',
      yField: 'string',
      groupBy: 'string?',
      title: 'string'
    },
    outputs: {
      onHover: 'DataPoint',
      onCrossfilter: 'FilterExpression'
    },
    minWidth: 6,
    maxWidth: 12,
    recommendedHeight: 4
  },
  // ... more components
};

// AI uses this to select components
export function selectComponents(
  fields: FieldMapping[],
  componentLibrary: typeof COMPONENT_LIBRARY
): ComponentSelection[] {
  // AI logic to choose which components to use
}
```

---

## Next Steps & Prioritization

### Immediate Actions (Week 1-2)

#### PRIORITY 1: Multi-Chart Rendering (**CRITICAL**)
**Goal:** Display multiple charts on one dashboard

**Tasks:**
1. Update `DashboardConfig` interface with `charts` array
2. Create `DashboardCanvas` component to render multiple widgets
3. Update dashboard page to use canvas instead of single chart
4. Test with 2-3 charts simultaneously

**Success Criteria:**
- [ ] Can render 3+ charts on same dashboard
- [ ] Each chart independently configured
- [ ] Responsive grid layout works
- [ ] No performance degradation

**Estimated Effort:** 20-30 hours
**Dependency:** None
**Agent:** `frontend-developer`

---

#### PRIORITY 2: Chart Type Selector (**HIGH**)
**Goal:** Let users manually change chart types

**Tasks:**
1. Create `ChartTypeSelector` component
2. Add to `ChartContainer` actions slot
3. Update chart config state on selection
4. Re-render chart with new type

**Success Criteria:**
- [ ] Icons for line, bar, area, pie
- [ ] Clicking changes chart type
- [ ] Current type highlighted
- [ ] Works with all chart types

**Estimated Effort:** 4-6 hours
**Dependency:** Multi-chart rendering
**Agent:** `frontend-developer`

---

#### PRIORITY 3: Customizable KPIs (**HIGH**)
**Goal:** User-defined KPI expressions

**Tasks:**
1. Enhance `calculateKPI()` function with aggregations
2. Create `KPIBuilder` UI component
3. Add "Add KPI" button to dashboard
4. Render dynamic KPIs from config

**Success Criteria:**
- [ ] Can create sum, avg, min, max, count KPIs
- [ ] Can select field from dropdown
- [ ] Can choose format (number, currency, %)
- [ ] KPIs update when data changes

**Estimated Effort:** 15-20 hours
**Dependency:** Multi-chart rendering
**Agent:** `frontend-developer`

---

### Short-Term Goals (Week 3-4)

#### PRIORITY 4: AI Dashboard Config Generator (**CRITICAL**)
**Goal:** AI suggests full dashboard, not just one chart

**Tasks:**
1. Design `DashboardConfig` JSON schema
2. Update AI prompt to request full config
3. Parse and validate AI response
4. Handle AI errors gracefully
5. Test with various datasets

**Success Criteria:**
- [ ] AI suggests 2-4 KPIs
- [ ] AI suggests 2-3 charts
- [ ] AI proposes layout grid
- [ ] Fallback to basic config if AI fails
- [ ] JSON validation catches errors

**Estimated Effort:** 40-60 hours
**Dependency:** Multi-chart rendering, Customizable KPIs
**Agent:** `fullstack-developer` (AI + frontend)

---

#### PRIORITY 5: Dashboard Layout Editor (**HIGH**)
**Goal:** Drag-and-drop widget rearrangement

**Tasks:**
1. Implement simple drag-and-drop (native HTML5)
2. Update layout config on drop
3. Add resize handles (optional)
4. Persist layout changes

**Success Criteria:**
- [ ] Can drag widgets to reorder
- [ ] Layout saves automatically
- [ ] Visual feedback during drag
- [ ] Works on desktop and tablet

**Estimated Effort:** 8-12 hours (simple) OR 20-30 hours (react-grid-layout)
**Dependency:** Multi-chart rendering
**Agent:** `frontend-developer`

---

### Medium-Term Goals (Week 5-6)

#### PRIORITY 6: Global Filters (**MEDIUM**)
**Goal:** Date range, category, numeric filters

**Tasks:**
1. Create `FilterBar` component
2. Implement `DateRangePicker`
3. Implement `CategoryFilter` (multi-select)
4. Implement `NumericRangeFilter` (slider)
5. Apply filters to all widgets

**Success Criteria:**
- [ ] Filters appear above dashboard
- [ ] Changing filter updates all charts
- [ ] Date range picker has presets (last 7 days, etc.)
- [ ] Category filter supports multi-select
- [ ] Numeric filter has min/max from data

**Estimated Effort:** 12-16 hours
**Dependency:** Multi-chart rendering
**Agent:** `frontend-developer`

---

#### PRIORITY 7: Dashboard Naming & Library (**MEDIUM**)
**Goal:** Manage multiple dashboards

**Tasks:**
1. Add name/description fields to session
2. Create dashboard library page
3. Implement search and filter
4. Add folder/tag support
5. Generate thumbnails (screenshot)

**Success Criteria:**
- [ ] Can name dashboards
- [ ] Dashboard library shows all saved dashboards
- [ ] Search works
- [ ] Can favorite dashboards
- [ ] Thumbnails auto-generate

**Estimated Effort:** 16-20 hours
**Dependency:** None (independent feature)
**Agent:** `fullstack-developer`

---

#### PRIORITY 8: Project Export/Import (**MEDIUM**)
**Goal:** Share dashboards as .json files

**Tasks:**
1. Create export function (dashboard + data)
2. Create import function with validation
3. Add export/import buttons to UI
4. Test with various dashboard configs
5. Handle version compatibility

**Success Criteria:**
- [ ] Export creates .json file
- [ ] Import loads dashboard correctly
- [ ] Data and config both restored
- [ ] Version mismatch detected
- [ ] Invalid JSON shows error

**Estimated Effort:** 8-12 hours
**Dependency:** Dashboard naming
**Agent:** `fullstack-developer`

---

### Long-Term Goals (Week 7+)

#### PRIORITY 9: Dashboard Variations (**LOW**)
**Goal:** Multiple AI-generated layouts

**Tasks:**
1. Generate 3-5 dashboard variations
2. Create carousel/tabs UI
3. Allow user to select favorite
4. Save selected variation

**Success Criteria:**
- [ ] AI generates 3+ variations
- [ ] User can flip through variations
- [ ] Visual diff highlights differences
- [ ] Can save selected variation

**Estimated Effort:** 20-25 hours
**Dependency:** AI Dashboard Config Generator
**Agent:** `fullstack-developer`

---

#### PRIORITY 10: "Improve Chart" AI Feature (**LOW**)
**Goal:** Iterative refinement with AI

**Tasks:**
1. Add "Improve" button to each chart
2. Show text input for natural language request
3. Send chart config + request to AI
4. Update chart with AI response
5. Track improvement history

**Success Criteria:**
- [ ] Can request changes (e.g., "show by region")
- [ ] AI updates chart config
- [ ] Chart re-renders with changes
- [ ] Can undo improvements

**Estimated Effort:** 16-20 hours
**Dependency:** AI Dashboard Config Generator
**Agent:** `fullstack-developer`

---

### Design System Completion (Parallel Track)

**From DESIGN_SYSTEM_ROADMAP.md:**

#### Week 1: Phase A (Critical Fixes)
- Typography system
- Chart color migration (CSS variables)
- FileUploadZone glassmorphism
- Color contrast testing

#### Week 2: Phase B+C (Glassmorphism Adoption)
- Dashboard cards glassmorphism
- Landing page redesign
- Component library updates
- Micro-interactions

#### Week 3: Phase D (Accessibility Audit)
- Automated testing (Axe, Lighthouse)
- Manual testing (keyboard, screen reader)
- Chart accessibility
- WCAG 2.1 AA compliance report

**Estimated Effort:** 80-100 hours (3 weeks)
**Agent:** `ui-designer` + `frontend-developer`

---

## Implementation Roadmap

### Phase 1: Core Dashboard Features (Weeks 1-4)

**Goal:** Multi-chart dashboards with customization

| Week | Priority | Feature | Effort | Dependencies |
|------|----------|---------|--------|--------------|
| 1 | P1 | Multi-chart rendering | 20-30h | None |
| 1-2 | P2 | Chart type selector | 4-6h | P1 |
| 2 | P3 | Customizable KPIs | 15-20h | P1 |
| 3-4 | P4 | AI dashboard config | 40-60h | P1, P3 |
| 3 | P5 | Layout editor (simple) | 8-12h | P1 |

**Total:** 87-128 hours (~3-4 weeks)

**Deliverables:**
- ✅ Multi-widget dashboards
- ✅ Manual chart type selection
- ✅ Dynamic KPI creation
- ✅ AI-generated dashboard configs
- ✅ Basic drag-and-drop layout

**Success Metrics:**
- [ ] Can render 5+ widgets on one dashboard
- [ ] AI suggests complete dashboard (not just one chart)
- [ ] User can customize all aspects of dashboard
- [ ] Dashboard saves and restores correctly

---

### Phase 2: Data Interaction & Organization (Weeks 5-6)

**Goal:** Filters, dashboard management

| Week | Priority | Feature | Effort | Dependencies |
|------|----------|---------|--------|--------------|
| 5 | P6 | Global filters | 12-16h | P1 |
| 5-6 | P7 | Dashboard library | 16-20h | None |
| 6 | P8 | Project export/import | 8-12h | P7 |

**Total:** 36-48 hours (~1.5-2 weeks)

**Deliverables:**
- ✅ Date range, category, numeric filters
- ✅ Dashboard library with search
- ✅ Export/import dashboard projects

**Success Metrics:**
- [ ] Filters apply to all charts
- [ ] Can manage 10+ dashboards easily
- [ ] Projects import/export without errors

---

### Phase 3: Advanced AI Features (Weeks 7-8)

**Goal:** Dashboard variations, iterative refinement

| Week | Priority | Feature | Effort | Dependencies |
|------|----------|---------|--------|--------------|
| 7 | P9 | Dashboard variations | 20-25h | P4 |
| 7-8 | P10 | "Improve chart" AI | 16-20h | P4 |

**Total:** 36-45 hours (~1.5-2 weeks)

**Deliverables:**
- ✅ Multiple dashboard proposals
- ✅ Natural language chart editing

**Success Metrics:**
- [ ] AI generates 3+ variations
- [ ] User can refine charts with AI
- [ ] Improvement history tracked

---

### Phase 4: Design System & Polish (Weeks 1-3, Parallel)

**Goal:** FAANG-level visual quality

| Week | Phase | Tasks | Effort | Agent |
|------|-------|-------|--------|-------|
| 1 | A | Critical fixes | 16h | frontend-developer |
| 2 | B+C | Glassmorphism adoption | 40h | ui-designer + frontend-developer |
| 3 | D | Accessibility audit | 24h | general-purpose + frontend-developer |

**Total:** 80 hours (~3 weeks)

**Deliverables:**
- ✅ 100% design system adoption
- ✅ WCAG 2.1 AA compliance
- ✅ Premium micro-interactions

**Success Metrics:**
- [ ] Lighthouse Accessibility > 95
- [ ] Axe DevTools 0 critical issues
- [ ] All charts use CSS variables
- [ ] No hardcoded colors

---

### Combined Timeline (8 Weeks)

```
Week 1:  P1 Multi-chart + Design Phase A
Week 2:  P2 Chart selector + P3 KPIs + Design Phase B
Week 3:  P4 AI config (start) + Design Phase C
Week 4:  P4 AI config (finish) + P5 Layout + Design Phase D
Week 5:  P6 Filters + P7 Library (start)
Week 6:  P7 Library (finish) + P8 Export/Import
Week 7:  P9 Variations
Week 8:  P10 Improve AI + Final QA
```

**Total Effort:**
- Core features: 159-221 hours
- Design system: 80 hours
- **Grand total: 239-301 hours (~6-8 weeks)**

---

## Success Criteria

### Feature Completeness

**Checklist:**
- [ ] **Multi-chart dashboards** - Display 3+ charts simultaneously
- [ ] **Chart type selector** - Manual override of AI suggestions
- [ ] **Customizable KPIs** - User-defined aggregations
- [ ] **AI dashboard config** - AI suggests full dashboard (KPIs + charts + layout)
- [ ] **Layout editor** - Drag-and-drop widget rearrangement
- [ ] **Global filters** - Date range, category, numeric filters
- [ ] **Dashboard library** - Manage multiple named dashboards
- [ ] **Project export/import** - Share dashboards as .json files
- [ ] **Dashboard variations** - Multiple AI-generated proposals
- [ ] **Improve chart AI** - Natural language refinement

**Vision Alignment Score Target:** > 90%

---

### Technical Quality

**Checklist:**
- [ ] **TypeScript strict mode** - No `any` types except where necessary
- [ ] **Error boundaries** - Graceful component failure handling
- [ ] **Loading states** - Skeletons for all async operations
- [ ] **Accessibility** - WCAG 2.1 AA compliance (Lighthouse > 95)
- [ ] **Performance** - Lighthouse Performance > 85
- [ ] **Browser compatibility** - Chrome, Safari, Firefox, Edge
- [ ] **Mobile responsive** - Works on tablets and phones
- [ ] **Bundle size** - < 500KB gzipped

---

### User Experience

**Checklist:**
- [ ] **Onboarding** - Clear first-time user flow
- [ ] **Error messages** - Helpful, actionable error messages
- [ ] **Loading feedback** - Progress indicators for AI calls
- [ ] **Undo/redo** - Ability to revert changes (optional)
- [ ] **Keyboard shortcuts** - Common actions accessible via keyboard (optional)
- [ ] **Dark mode** - Full theme support
- [ ] **Animations** - Smooth, 60fps transitions
- [ ] **Tooltips** - Helpful guidance throughout app

---

### Documentation

**Checklist:**
- [ ] **README** - Comprehensive installation and usage guide
- [ ] **API documentation** - All TypeScript interfaces documented
- [ ] **Component storybook** - Visual component library (optional)
- [ ] **User guide** - Step-by-step tutorials
- [ ] **Developer guide** - Architecture and contribution guidelines
- [ ] **Accessibility statement** - WCAG compliance details
- [ ] **Changelog** - Version history and breaking changes

---

## Appendix: Key Interfaces

### DashboardConfig (Target Schema)

```typescript
interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  version: string;

  // Widget definitions
  kpis: KPIConfig[];
  charts: ChartConfig[];
  filters: FilterConfig[];
  alerts: AlertConfig[];

  // Layout
  layout: LayoutConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags: string[];
}

interface KPIConfig {
  id: string;
  title: string;
  description: string;
  expression: KPIExpression;
  format: 'number' | 'currency' | 'percentage';
  icon: string;
  comparison?: ComparisonConfig;
}

interface KPIExpression {
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct';
  field: string;
  filter?: FilterExpression;
}

interface ComparisonConfig {
  type: 'previous_period' | 'target';
  value: number;
  label?: string;
}

interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'table';
  title: string;
  description?: string;
  xField: string;
  yField: string;
  groupBy?: string;
  filters: FilterExpression[];
  sortBy?: { field: string; order: 'asc' | 'desc' };
  limit?: number;
  colors?: string[];
  interactions: ChartInteraction[];
}

interface ChartInteraction {
  type: 'hover' | 'click' | 'crossfilter' | 'drilldown';
  action: string;
}

interface FilterConfig {
  id: string;
  type: 'dateRange' | 'category' | 'numericRange';
  field: string;
  label: string;
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
}

interface FilterExpression {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'contains' | 'between';
  value: any;
}

interface AlertConfig {
  id: string;
  name: string;
  description: string;
  condition: FilterExpression;
  severity: 'info' | 'warning' | 'error';
  enabled: boolean;
}

interface LayoutConfig {
  type: 'grid' | 'flex';
  columns: number;
  rows: LayoutRow[];
}

interface LayoutRow {
  id: string;
  widgets: string[]; // Widget IDs
  span: number[];    // Column spans
  height?: number;   // Row height in grid units
}
```

---

## Conclusion

### Current State Summary

Excel-to-Dashboard has a **solid foundation (65% complete)** with:
- ✅ Excellent privacy-first architecture
- ✅ World-class design system (foundation)
- ✅ Professional session management
- ✅ Complete alert system
- ✅ Comprehensive export features

### Critical Missing Features

The app is missing **35% of the original vision:**
- ❌ Multi-chart dashboard rendering
- ❌ AI-generated full dashboard configs
- ❌ Customizable KPIs and layouts
- ❌ Global filters and drill-down capabilities
- ❌ Dashboard variations and iterative refinement

### Recommended Next Steps

**Immediate (Week 1-2):**
1. Implement multi-chart rendering (P1)
2. Add chart type selector (P2)
3. Enable customizable KPIs (P3)

**Short-term (Week 3-4):**
4. Build AI dashboard config generator (P4)
5. Create simple layout editor (P5)

**Medium-term (Week 5-6):**
6. Add global filters (P6)
7. Build dashboard library (P7)
8. Implement project export/import (P8)

**Parallel Track (Week 1-3):**
- Complete design system adoption
- Achieve WCAG 2.1 AA compliance

### Success Timeline

**8 weeks** to full vision alignment (90%+ feature parity)

**Total effort:** 239-301 hours

**Result:** A truly AI-powered dashboard generator that matches the original product vision.

---

**Document Status:** Ready for Implementation
**Next Action:** Begin Priority 1 (Multi-Chart Rendering)
**Owner:** Development Team
**Review Date:** After Week 4 (Phase 1 completion)

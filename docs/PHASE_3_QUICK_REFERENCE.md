# Phase 3 Quick Reference Card

**Quick access guide for developers integrating Phase 3 features**

---

## P9: Dashboard Variations - Quick Start

### Generate Variations

```typescript
import { generateDashboardVariations } from '@/lib/dashboard-variations';

const variations = await generateDashboardVariations(
  processedData,      // Your dataset
  columnMapping,      // { columnName: type }
  apiKey,             // Gemini API key
  // Optional: ['kpi-focused', 'analytical', 'balanced']
);

// variations: DashboardVariation[] (3 items by default)
```

### Display Carousel

```typescript
import DashboardVariationsCarousel from '@/components/dashboard/DashboardVariationsCarousel';

<DashboardVariationsCarousel
  variations={variations}
  selectedIndex={0}
  onSelect={(index) => setSelectedIndex(index)}
  onApply={(variation) => setDashboardConfig(variation.config)}
  onRegenerate={() => generateDashboardVariations(...)}
  isRegenerating={false}
/>
```

### Types

```typescript
interface DashboardVariation {
  id: string;
  config: DashboardConfig;
  strategy: 'kpi-focused' | 'analytical' | 'balanced';
  description: string;
  createdAt: string;
}
```

---

## P10: Chart Improvement - Quick Start

### Improve a Chart

```typescript
import { improveChartWithAI } from '@/lib/chart-improvement';

const result = await improveChartWithAI(
  {
    chartConfig: myChart,
    userRequest: 'Change to bar chart and sort by value',
    data: processedData,
    availableFields: Object.keys(columnMapping),
  },
  apiKey
);

// result.updatedConfig: ChartConfig
// result.changes: string[]
// result.reasoning: string
```

### Track History

```typescript
import { improvementHistory } from '@/lib/improvement-history';

// Add record
const record = improvementHistory.add({
  chartId: myChart.id,
  userRequest: 'Show by region',
  beforeConfig: oldChart,
  afterConfig: newChart,
  changes: ['Changed groupBy to region'],
  reasoning: 'AI explanation',
});

// Undo
const originalConfig = improvementHistory.undo(record.id);

// Persist
improvementHistory.saveToStorage(sessionId);
improvementHistory.loadFromStorage(sessionId);
```

### Display Components

```typescript
import ChartImprovementDialog from '@/components/dashboard/ChartImprovementDialog';
import ImprovementHistoryPanel from '@/components/dashboard/ImprovementHistoryPanel';

// Improvement Dialog
<ChartImprovementDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  chartConfig={selectedChart}
  data={processedData}
  availableFields={columns}
  apiKey={apiKey}
  onImprove={(config, changes, reasoning) => {
    // Update chart and add to history
  }}
/>

// History Panel
<ImprovementHistoryPanel
  history={improvementHistory}
  onUndo={(record) => {
    const config = improvementHistory.undo(record.id);
    // Apply config
  }}
  onClear={() => improvementHistory.clear()}
  selectedChartId={selectedChartId}
/>
```

---

## Session Manager Integration

### Updated Interface

```typescript
interface DashboardSession {
  // Existing fields...

  // Phase 3 additions:
  dashboardVariations?: DashboardVariation[];
  selectedVariationIndex?: number;
  improvementHistory?: ImprovementRecord[];
}
```

### Save/Load

```typescript
// Automatic via session manager
const session = {
  ...existingFields,
  dashboardVariations,
  selectedVariationIndex,
  improvementHistory: improvementHistory.getAll(),
};

await sessionManager.saveSession(session);
```

---

## Common Patterns

### Generate Variations Button

```typescript
const handleGenerateVariations = async () => {
  setLoading(true);
  try {
    const vars = await generateDashboardVariations(data, mapping, key);
    setVariations(vars);
    toast.success(`Generated ${vars.length} variations!`);
  } catch (err) {
    toast.error('Failed to generate variations');
  } finally {
    setLoading(false);
  }
};

<Button onClick={handleGenerateVariations}>
  <Sparkles className="mr-2" />
  Generate Variations
</Button>
```

### Improve Chart Button

```typescript
const handleImproveClick = (chartId: string) => {
  setImprovingChartId(chartId);
  setShowImprovementDialog(true);
};

// On chart component
<Button size="sm" onClick={() => handleImproveClick(chart.id)}>
  <Sparkles className="mr-2" />
  Improve Chart
</Button>
```

### Handle Improvement

```typescript
const handleChartImproved = (updated, changes, reasoning) => {
  // Find old chart
  const oldChart = dashboardConfig.charts.find(c => c.id === improvingChartId);

  // Add to history
  improvementHistory.add({
    chartId: improvingChartId,
    userRequest: userInput, // From dialog
    beforeConfig: oldChart,
    afterConfig: updated,
    changes,
    reasoning,
  });

  // Update config
  setDashboardConfig({
    ...dashboardConfig,
    charts: dashboardConfig.charts.map(c =>
      c.id === improvingChartId ? updated : c
    ),
  });

  // Force re-render
  setHistoryVersion(v => v + 1);
};
```

---

## Error Handling

### Variations

```typescript
try {
  const variations = await generateDashboardVariations(...);
} catch (error) {
  if (error.message.includes('API key')) {
    toast.error('Please set your Gemini API key');
  } else if (error.message.includes('quota')) {
    toast.error('API quota exceeded. Try again later.');
  } else {
    toast.error('Failed to generate variations');
  }
}
```

### Improvements

```typescript
try {
  const result = await improveChartWithAI(...);
} catch (error) {
  if (error.message.includes('field')) {
    toast.error('AI suggested invalid fields');
  } else if (error.message.includes('JSON')) {
    toast.error('AI returned invalid response');
  } else {
    toast.error('Failed to improve chart');
  }
}
```

---

## State Management Checklist

For complete integration, add these to your dashboard page:

```typescript
// State
const [dashboardVariations, setDashboardVariations] = useState([]);
const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
const [showImprovementDialog, setShowImprovementDialog] = useState(false);
const [improvingChartId, setImprovingChartId] = useState(null);
const [historyVersion, setHistoryVersion] = useState(0);

// Load history on mount
useEffect(() => {
  if (sessionId) improvementHistory.loadFromStorage(sessionId);
}, [sessionId]);

// Save history on change
useEffect(() => {
  if (sessionId) improvementHistory.saveToStorage(sessionId);
}, [historyVersion, sessionId]);

// Include in session save
useEffect(() => {
  const session = {
    ...other,
    dashboardVariations,
    selectedVariationIndex,
    improvementHistory: improvementHistory.getAll(),
  };
  sessionManager.saveSession(session);
}, [dashboardVariations, selectedVariationIndex, historyVersion]);
```

---

## Testing Checklist

### P9 Tests
- [ ] Generate variations with default strategies
- [ ] Generate variations with custom strategies
- [ ] Navigate carousel (prev/next)
- [ ] Apply variation to dashboard
- [ ] Regenerate variations
- [ ] Error: No API key
- [ ] Error: API failure
- [ ] Persist and reload

### P10 Tests
- [ ] Improve chart (type change)
- [ ] Improve chart (field change)
- [ ] Improve chart (title change)
- [ ] View history
- [ ] Undo improvement
- [ ] Clear history
- [ ] Multiple improvements on same chart
- [ ] Error: Invalid request
- [ ] Error: API failure
- [ ] Persist and reload

---

## Performance Tips

1. **Debounce AI calls:** Don't regenerate on every keystroke
2. **Limit history:** Keep only last 50 records
3. **Lazy load components:** Use React.lazy for heavy components
4. **Memoize expensive ops:** Use useMemo for data transformations
5. **Parallel calls:** P9 already does this, don't break it

---

## Debugging

### Enable Logging

```typescript
// In dashboard-variations.ts or chart-improvement.ts
console.log('AI Prompt:', prompt);
console.log('AI Response:', responseText);
console.log('Parsed Config:', config);
```

### Check Storage

```typescript
// Variations
console.log('Variations:', dashboardVariations);

// History
console.log('History:', improvementHistory.getAll());
console.log('Stats:', improvementHistory.getStats());

// Session
const session = await sessionManager.loadSession(sessionId);
console.log('Session:', session);
```

### Validate API Key

```typescript
const apiKey = localStorage.getItem('gemini-api-key');
if (!apiKey || apiKey.trim() === '') {
  console.error('No API key found');
}
```

---

## Quick Links

- **Implementation Guide:** `docs/PHASE_3_IMPLEMENTATION_GUIDE.md`
- **Completion Report:** `docs/PHASE_3_COMPLETION_REPORT.md`
- **Executive Summary:** `docs/PHASE_3_EXECUTIVE_SUMMARY.md`

---

**Last Updated:** November 22, 2025
**Version:** 1.0

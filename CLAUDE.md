# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Excel-to-Dashboard** is a Next.js-based AI-powered data visualization platform that transforms Excel/CSV files into interactive dashboards. It uses client-side processing for privacy, integrates with Google Gemini AI for intelligent chart suggestions, and includes an alert system with browser notifications.

## Core Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (checks all files)
```

### Testing
No test framework is currently configured in this project.

## Architecture & Key Concepts

### Application Flow
The app follows a 4-step wizard workflow:
1. **Upload** - Users upload Excel/CSV files via drag-drop
2. **Map & Suggest** - AI analyzes data and suggests optimal chart types
3. **Dashboard** - Display interactive charts with KPIs
4. **Alerts** - Configure threshold-based alerts with browser notifications

### Data Flow Pattern
```
FileUploadZone → API Route (/api/parse) → Session Manager → Dashboard State
                                               ↓
                                    Client-Side Storage (IndexedDB)
```

### Client-Side Session Persistence
**Critical Pattern**: All data is stored client-side using localforage (IndexedDB → WebSQL → localStorage fallback). No backend database exists.

- **Session Manager** (`src/lib/session-manager.ts`): Handles all session CRUD operations
- **Storage**: Uses localforage with multi-driver support
- **Auto-save**: Sessions are saved automatically with debouncing
- **Privacy**: User data never leaves the browser

### AI Integration Strategy
**Two AI Providers Supported** (mutually exclusive):
1. **OpenAI** (`src/lib/openai-ai.ts`) - Uses GPT models
2. **Google Gemini** (`src/lib/gemini-ai.ts`) - Uses Gemini 1.5 Flash (currently active)

**API Key Management**:
- Keys stored in localStorage (client-side only)
- Configured via SettingsDialog component
- No server-side API keys
- Graceful fallback when no key is provided

**Chart Intelligence** (`src/lib/chart-intelligence.ts`):
- Fallback system when AI is unavailable
- Analyzes data patterns (temporal trends, distribution, volatility)
- Recommends chart types based on data characteristics
- Does NOT require API keys

### Alert System
**Multi-layered Alert Architecture**:
1. **Alert Engine** (`src/lib/alert-engine.ts`): Rule evaluation logic
2. **Notification Manager** (`src/lib/notification-manager.ts`): Browser notification API wrapper
3. **Alert History** (`src/components/AlertHistory.tsx`): Stores triggered alerts in localStorage
4. **Alert Templates** (`src/components/AlertTemplates.tsx`): Pre-configured alert patterns

**Alert Evaluation**: Runs on latest data point in processedData array

### State Management
**No Redux/Zustand** - Uses React useState with session persistence:
- `rawData`: Uploaded Excel data (multi-sheet support)
- `processedData`: Transformed data array (rows as objects)
- `columnMapping`: Maps columns to types (date, number, category)
- `chartSuggestion`: AI-generated chart recommendation
- `alertRules`: User-defined alert conditions

## Component Structure

### Page Components
- `src/app/page.tsx` - Landing page with hero and features
- `src/app/dashboard/page.tsx` - Main dashboard (4-step workflow orchestration)

### Feature Components (Custom Business Logic)
- `FileUploadZone.tsx` - Drag-drop file upload with validation
- `DataMapper.tsx` - Column type mapping UI
- `ChartWidget.tsx` - Legacy chart component (kept for backward compatibility)
- `AlertManager.tsx` - Alert rule creation/management
- `SettingsDialog.tsx` - API key configuration
- `DashboardGrid.tsx` - Chart layout container
- `DataTable.tsx` - Tabular data view (Phase 2)
- `ExportDialog.tsx` - Export to PNG/PDF (Phase 2B)
- `AlertHistory.tsx` - Alert log viewer (Phase 2)
- `AlertTemplates.tsx` - Pre-built alert patterns (Phase 2)

### Chart Components (Phase 1 Refactor)
Located in `src/components/charts/`:
- `LineChartWidget.tsx` - Time-series visualization
- `BarChartWidget.tsx` - Categorical comparison
- `AreaChartWidget.tsx` - Trend visualization with fill
- `PieChartWidget.tsx` - Proportion/distribution charts

**Chart Library**: Recharts (lazy-loaded for performance)

### UI Components (shadcn/ui)
Located in `src/components/ui/`:
- All components use Tailwind CSS + Radix UI primitives
- Theming via CSS variables (light/dark mode support)
- See `docs/BRAND_AND_DESIGN_GUIDE.md` for design tokens

## Critical Implementation Details

### API Routes
**File Parsing Route** (`src/app/api/parse/route.ts`):
- Accepts FormData with Excel/CSV files
- Uses `xlsx` library for parsing
- Returns JSON with sheet data
- Handles multi-sheet workbooks

### Data Processing Pipeline
1. Upload → `FileUploadZone` → POST `/api/parse`
2. Parse → `xlsx.read()` → Multi-sheet object
3. Transform → `rowsToObjects()` in `data-processor.ts`
4. Validate → `DataValidator.inferColumnTypes()` in `data-schemas.ts`
5. Persist → `sessionManager.saveSession()`

### KPI Calculation
**KPICalculator** (`src/lib/kpi-calculator.ts`):
- Computes aggregate metrics (sum, avg, min, max, change)
- Displays in `KPICard` components on dashboard
- Automatically updates when data changes

### Chart Intelligence Decision Tree
```
Data Analysis → Temporal Trend Detection → Chart Type Selection
                        ↓
    High Volatility → Line Chart (trends)
    Low Volatility, Categories → Bar Chart (comparison)
    Proportional Data → Pie Chart (distribution)
    Continuous Range → Area Chart (volume)
```

### Browser Notification System
**Permission Flow**:
1. User creates alert → Check `Notification.permission`
2. If "default" → Request permission
3. On alert trigger → `notificationManager.show()`
4. Fallback → Toast notification (sonner)

## Design System

**Design Tokens**: Defined in `src/app/globals.css`
- Uses CSS variables for theming
- OKLCH color space for better perceptual uniformity
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

**Component Guidelines**:
- Use shadcn/ui components as base
- Avoid blue/indigo colors (brand guideline)
- Reference `docs/BRAND_AND_DESIGN_GUIDE.md` for full design system
- All components must support light/dark mode via CSS variables

## File Organization Patterns

```
src/
├── app/                    # Next.js App Router
│   ├── api/parse/         # File parsing endpoint
│   ├── dashboard/         # Main app page
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── charts/            # Chart type components
│   └── dashboard/         # Dashboard-specific components
└── lib/                   # Business logic & utilities
    ├── *-ai.ts            # AI provider integrations
    ├── session-manager.ts # Client-side persistence
    ├── alert-engine.ts    # Alert evaluation
    ├── chart-intelligence.ts # AI-free chart recommendations
    └── data-*.ts          # Data processing utilities
```

## Important Constraints

1. **No Backend Database**: All persistence is client-side (localforage)
2. **No Server-Side API Keys**: Keys stored in localStorage, accessed client-side only
3. **Privacy-First**: Data never sent to server except for AI API calls
4. **Graceful Degradation**: App must work without AI API keys
5. **Multi-Sheet Support**: Always handle Excel files with multiple sheets
6. **Browser Compatibility**: Must support IndexedDB or localStorage fallback

## Common Development Scenarios

### Adding a New Chart Type
1. Create component in `src/components/charts/` (use existing as template)
2. Update `ChartType` union in `chart-intelligence.ts`
3. Add type to `ChartTypeSelector` dropdown
4. Update AI prompt in `gemini-ai.ts` or `openai-ai.ts`

### Adding a New Alert Condition
1. Extend `AlertRule` type in `alert-engine.ts`
2. Update `evaluate()` function with new condition logic
3. Add UI in `AlertManager.tsx`
4. Update template in `AlertTemplates.tsx` if needed

### Switching AI Providers
Currently uses Gemini. To switch to OpenAI:
1. Update import in `src/app/dashboard/page.tsx` (line 29)
2. Change from `import { suggestChart } from '@/lib/gemini-ai'`
3. To `import { suggestChart } from '@/lib/openai-ai'`
4. Update settings dialog to accept OpenAI key format

## Dependencies & Version Notes

**Critical Dependencies**:
- `next`: 16.0.3 (App Router, Server Actions)
- `react`: 19.2.0 (Latest stable)
- `xlsx`: 0.18.5 (Excel parsing)
- `recharts`: 3.4.1 (Charts)
- `@google/generative-ai`: 0.24.1 (Gemini AI)
- `localforage`: 1.10.0 (Client-side storage)
- `html2canvas`: 1.4.1 (Export to PNG)
- `jspdf`: 3.0.4 (Export to PDF)
- `sonner`: 2.0.7 (Toast notifications)
- `next-themes`: 0.4.6 (Theme management)

**UI Framework**: shadcn/ui (copy-paste components, not installed as dependency)

## Known Patterns & Conventions

1. **Component Naming**: PascalCase with descriptive names (e.g., `FileUploadZone` not `Upload`)
2. **File Naming**: kebab-case for libs (e.g., `session-manager.ts`), PascalCase for components
3. **State Updates**: Always use functional setState for dependent updates
4. **Session Saves**: Debounced auto-save pattern to avoid excessive writes
5. **Error Handling**: Toast notifications (sonner) for user-facing errors
6. **Loading States**: Boolean flags + Loader2 icon from lucide-react

## Performance Considerations

- **Lazy Loading**: AI clients initialized only when needed
- **Data Sampling**: AI suggestions use first 5 rows only
- **Chart Rendering**: Recharts handles virtual rendering
- **Bundle Size**: Tree-shake unused shadcn components
- **Session Storage**: Use IndexedDB (faster than localStorage for large data)

## Recent Major Changes (from git history)

- **Phase 2B** (6ad8ef4): Added PNG/PDF export, browser notifications
- **Phase 2** (8894b59): Added DataTable, ExportDialog, AlertHistory, AlertTemplates
- **Phase 1** (ed62e66): Chart intelligence system, KPI calculator, refactored chart components
- **Initial** (57c464c): Next.js scaffolding with basic upload/dashboard

## Future Considerations

Refer to `docs/BRAND_AND_DESIGN_GUIDE.md` for roadmap:
- Phase 3: Collaboration features (auth, sharing, comments)
- Phase 4: Enterprise features (self-hosting, SSO, API access)

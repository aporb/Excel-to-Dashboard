# Excel-to-Dashboard

> Transform Excel/CSV files into interactive AI-powered dashboards with real-time alerts and intelligent visualizations.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A privacy-first, client-side data visualization platform that leverages AI to automatically suggest optimal chart types, calculate KPIs, and enable threshold-based monitoring with browser notifications. Built with modern web technologies and a glassmorphic design system.

![Excel-to-Dashboard Preview](docs/preview.png)

---

## ✨ Key Features

### 🎯 Core Capabilities
- **📊 Smart File Processing** - Upload Excel (.xlsx, .xls) or CSV files with multi-sheet support
- **🤖 AI-Powered Insights** - Automatic chart type recommendations using Google Gemini or OpenAI
- **📈 Interactive Dashboards** - Line, Bar, Area, and Pie charts with responsive layouts
- **🔔 Real-Time Alerts** - Threshold-based monitoring with browser notifications
- **💾 Client-Side Storage** - All data stays in your browser (IndexedDB/localStorage)
- **🎨 Glassmorphic UI** - Modern design with dark mode support
- **📤 Export Options** - Save dashboards as PNG or PDF

### 🔒 Privacy-First Architecture
- **No backend database** - All processing happens in your browser
- **Data never leaves your device** - Except for optional AI API calls
- **API keys stored locally** - In browser localStorage, never on servers
- **Works offline** - With fallback chart intelligence when AI unavailable

### 📊 Visualization Intelligence
- **Automatic type detection** - Classifies columns as date, number, or category
- **Pattern analysis** - Detects trends, volatility, and distributions
- **Smart recommendations** - Suggests optimal chart types based on data characteristics
- **KPI auto-calculation** - Count, sum, average, min, max, and trend indicators

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/aporb/Excel-to-Dashboard.git
cd Excel-to-Dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### API Key Setup (Optional)

The app works without API keys using fallback chart intelligence. For AI-powered recommendations:

1. Click the **Settings** icon (⚙️) in the dashboard
2. Enter your API key:
   - **Google Gemini** (recommended): Get free key at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **OpenAI** (alternative): Get key at [OpenAI Platform](https://platform.openai.com/api-keys)
3. Keys are stored in your browser's localStorage

---

## 🎓 User Guide

### 4-Step Workflow

#### 1. Upload
Drag-and-drop or click to upload Excel/CSV files. Multi-sheet Excel files are fully supported.

```
Supported formats: .csv, .xlsx, .xls
Max file size: Browser-dependent (typically 100MB+)
```

#### 2. Map & Suggest
- **Auto-detection** - Columns are automatically classified as date, number, or category
- **Manual adjustment** - Override types if needed
- **AI analysis** - Get intelligent chart recommendations based on your data patterns

#### 3. Visualize
- **Interactive charts** - Hover for details, click to focus
- **KPI cards** - Auto-calculated metrics (count, sum, average, trends)
- **Responsive grid** - Adapts to screen size
- **Data table** - Sortable, filterable tabular view

#### 4. Monitor & Alert
- **Create rules** - Set thresholds (>, <, >=, <=, ==) on any metric
- **Browser notifications** - Get native OS alerts when conditions are met
- **Alert history** - View audit trail of triggered alerts
- **Templates** - Use pre-built patterns for common scenarios

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript 5+ |
| **UI Components** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS 4 + CSS Variables |
| **Charts** | Recharts 3.4 |
| **AI Integration** | Google Gemini 1.5 / OpenAI GPT |
| **File Parsing** | XLSX 0.18.5 |
| **Client Storage** | localforage (IndexedDB) |
| **Export** | html2canvas + jsPDF |
| **Notifications** | Browser Notification API |

### Data Flow

```
┌─────────────────┐
│  File Upload    │
│  (CSV/Excel)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │
│  /api/parse     │  ◄── Server-side XLSX parsing only
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data           │
│  Transformation │  ◄── Client-side processing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Analysis    │  ◄── Optional (Gemini/OpenAI)
│  or Fallback    │      Graceful degradation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React State    │
│  + IndexedDB    │  ◄── Session persistence
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Dashboard      │
│  Rendering      │
└─────────────────┘
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/page.tsx       # Main 4-step wizard
│   ├── api/parse/route.ts       # File parsing endpoint
│   ├── globals.css              # Design tokens & themes
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── charts/                  # Chart type components
│   │   ├── LineChartWidget.tsx
│   │   ├── BarChartWidget.tsx
│   │   ├── AreaChartWidget.tsx
│   │   └── PieChartWidget.tsx
│   ├── FileUploadZone.tsx       # Drag-drop upload
│   ├── DataMapper.tsx           # Column mapping UI
│   ├── DashboardGrid.tsx        # Chart layout
│   ├── AlertManager.tsx         # Alert creation
│   ├── DataTable.tsx            # Tabular data view
│   ├── ExportDialog.tsx         # PNG/PDF export
│   └── SettingsDialog.tsx       # API key config
└── lib/
    ├── session-manager.ts       # Client-side persistence
    ├── chart-intelligence.ts    # AI-free recommendations
    ├── gemini-ai.ts             # Google Gemini integration
    ├── openai-ai.ts             # OpenAI integration
    ├── alert-engine.ts          # Alert evaluation
    ├── notification-manager.ts  # Browser notifications
    ├── kpi-calculator.ts        # Metrics computation
    ├── chart-export.ts          # Export utilities
    ├── data-processor.ts        # Data transformation
    └── data-schemas.ts          # Zod validation
```

---

## 🎨 Design System

### Glassmorphic Philosophy
- **Semi-transparent surfaces** with backdrop blur (12-20px)
- **Muted professional palette** (max 15% saturation)
- **Depth through layering** with subtle shadows
- **Smooth micro-interactions** (200-300ms transitions)

### Theme Support
- **Light/Dark modes** with next-themes
- **CSS variables** for customization
- **OKLCH color space** for perceptual uniformity
- **Accessible contrast** (WCAG 2.1 AA compliant)

For comprehensive design guidelines, see [`docs/BRAND_AND_DESIGN_GUIDE.md`](docs/BRAND_AND_DESIGN_GUIDE.md).

---

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env.local` file for development:

```env
# Optional: Set default AI provider API key
# Users can override this in Settings UI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
# OR
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key_here
```

### Switching AI Providers

To switch from Gemini to OpenAI:

1. Open `src/app/dashboard/page.tsx`
2. Change line 29 from:
   ```typescript
   import { suggestChart } from '@/lib/gemini-ai'
   ```
   to:
   ```typescript
   import { suggestChart } from '@/lib/openai-ai'
   ```

### Customizing Chart Intelligence

Edit `src/lib/chart-intelligence.ts` to adjust:
- Volatility thresholds for chart type selection
- Data pattern detection algorithms
- Fallback recommendation logic

---

## 📦 Build & Deploy

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Static Export (Not Recommended)
Note: This app uses API routes and client-side features that work best with a Node.js server.

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint code quality checks
```

### Code Quality
- **TypeScript strict mode** enabled
- **ESLint** configured with Next.js rules
- **Path aliases**: `@/*` maps to `src/*`

### Testing
Currently no test framework configured. Recommended setup:
- **Unit tests**: Vitest or Jest
- **Component tests**: React Testing Library
- **E2E tests**: Playwright or Cypress

---

## 📊 Chart Intelligence System

### How It Works

#### With AI (Gemini/OpenAI)
1. Data sampled (first 5 rows) to reduce token usage
2. Column types and patterns sent to AI
3. AI analyzes and recommends optimal chart type
4. Recommendation includes reasoning and configuration

#### Without AI (Fallback)
1. **Type inference** - Classify columns (date, number, category)
2. **Pattern detection** - Analyze volatility, trends, distribution
3. **Decision tree**:
   - High volatility → Line Chart (trends visible)
   - Low volatility + categories → Bar Chart (comparison)
   - Proportional data → Pie Chart (distribution)
   - Continuous range → Area Chart (volume)

### Supported Chart Types

| Chart | Best For | Data Requirements |
|-------|----------|-------------------|
| **Line** | Time-series trends, high volatility | Numerical + temporal data |
| **Bar** | Category comparison, rankings | Categories + numerical values |
| **Area** | Volume over time, accumulation | Continuous numerical data |
| **Pie** | Proportions, distribution | Categories with percentages |

---

## 🔔 Alert System

### Creating Alerts

1. Navigate to the **Alerts** tab
2. Select a **metric** (column) to monitor
3. Choose a **condition** (>, <, >=, <=, ==)
4. Set a **threshold** value
5. Enable **browser notifications** (optional)

### Alert Evaluation

Alerts are evaluated against the **latest data point** in your dataset:
```typescript
const latestValue = processedData[processedData.length - 1][metric]
if (condition(latestValue, threshold)) {
  triggerAlert()
}
```

### Notification Permissions

On first alert creation:
1. Browser prompts for notification permission
2. Accept to receive native OS notifications
3. Fallback to toast notifications if denied

### Alert Templates

Pre-built patterns for common scenarios:
- Sales threshold alerts
- Inventory level monitoring
- Performance metric tracking
- Custom business rules

---

## 📤 Export Features

### PNG Export
- Uses **html2canvas** to capture dashboard
- Preserves styling and interactions
- High-resolution output

### PDF Export
- Uses **jsPDF** for document generation
- Includes charts and KPIs
- A4 page format

### Usage
1. Click **Export** button in dashboard
2. Choose PNG or PDF format
3. File downloads automatically

---

## 🗄️ Session Persistence

### How It Works

All data is stored **client-side** using localforage:

```
IndexedDB (preferred)
   ↓ (fallback if unavailable)
WebSQL
   ↓ (fallback if unavailable)
localStorage
```

### What's Persisted

- Uploaded file data (multi-sheet support)
- Processed data arrays
- Column type mappings
- Chart configurations
- Alert rules
- User settings (theme, API keys)

### Session Management

Sessions auto-save with **1000ms debounce** to prevent excessive writes:
```typescript
sessionManager.saveSession({
  rawData,
  processedData,
  columnMapping,
  chartSuggestion,
  alertRules
})
```

Sessions persist across browser sessions and survive page refreshes.

---

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core Functionality | ✅ | ✅ | ✅ | ✅ |
| IndexedDB Storage | ✅ | ✅ | ✅ | ✅ |
| Browser Notifications | ✅ | ✅ | ✅ | ✅ |
| PNG Export | ✅ | ✅ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ | ✅ |

**Minimum versions**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 🐛 Troubleshooting

### Charts Not Displaying
- Check browser console for errors
- Ensure data has been uploaded and processed
- Verify column types are correctly mapped

### AI Recommendations Failing
- Confirm API key is set in Settings
- Check API key has sufficient quota
- Fallback chart intelligence will activate automatically

### Browser Notifications Not Working
- Check notification permission in browser settings
- Notifications require **HTTPS** in production
- Localhost works for development

### Export Failures
- Ensure charts are fully rendered before exporting
- Large dashboards may take longer to export
- Check browser console for canvas-related errors

### Session Data Lost
- Check browser storage quota
- Ensure cookies/storage not blocked
- Try clearing browser cache and re-uploading

---

## 🛠️ Customization

### Adding New Chart Types

1. Create component in `src/components/charts/`:
```typescript
// src/components/charts/ScatterChartWidget.tsx
export function ScatterChartWidget({ data, config }) {
  // Implementation
}
```

2. Update `ChartType` in `src/lib/chart-intelligence.ts`:
```typescript
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'scatter'
```

3. Add to AI prompt in `src/lib/gemini-ai.ts` or `src/lib/openai-ai.ts`

### Customizing Theme

Edit CSS variables in `src/app/globals.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}
```

### Adding KPI Metrics

Edit `src/lib/kpi-calculator.ts`:
```typescript
export function calculateCustomKPI(data: ProcessedRow[]) {
  // Custom calculation logic
}
```

---

## 📚 Documentation

- **Project Instructions**: [`CLAUDE.md`](CLAUDE.md) - Development guidelines
- **Design System**: [`docs/BRAND_AND_DESIGN_GUIDE.md`](docs/BRAND_AND_DESIGN_GUIDE.md) - UI/UX standards
- **API Reference**: Coming soon
- **Contributing Guide**: Coming soon

---

## 🗺️ Roadmap

### Current Version: v2.0
- ✅ Core file upload and parsing
- ✅ AI-powered chart recommendations
- ✅ Interactive dashboard with KPIs
- ✅ Alert system with browser notifications
- ✅ PNG/PDF export
- ✅ Glassmorphic design system

### Planned Features

#### Phase 3: Collaboration
- User authentication
- Share dashboards via link
- Real-time collaborative editing
- Comments and annotations

#### Phase 4: Enterprise
- Self-hosting guide
- SSO integration (SAML, OAuth)
- API access for programmatic dashboards
- White-label customization

See [`docs/BRAND_AND_DESIGN_GUIDE.md`](docs/BRAND_AND_DESIGN_GUIDE.md) for detailed roadmap.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style (ESLint rules)
- Use TypeScript strict mode
- Test in multiple browsers
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **shadcn/ui** - Beautiful, accessible UI components
- **Recharts** - Composable charting library
- **Google Gemini** - AI-powered insights
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/aporb/Excel-to-Dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aporb/Excel-to-Dashboard/discussions)

---

<div align="center">

**Built with ❤️ using Next.js, React, and TypeScript**

[Documentation](docs/) · [Report Bug](https://github.com/aporb/Excel-to-Dashboard/issues)

</div>

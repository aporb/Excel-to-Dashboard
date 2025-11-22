# Excel-to-Dashboard: Brand & Design System Guide

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Author:** FAANG Product Design Review  
**Status:** Production Ready

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Design Philosophy](#design-philosophy)
3. [Visual Identity](#visual-identity)
4. [Design System](#design-system)
5. [Component Architecture](#component-architecture)
6. [Typography & Spacing](#typography--spacing)
7. [Color Palette](#color-palette)
8. [Interaction Patterns](#interaction-patterns)
9. [Accessibility Standards](#accessibility-standards)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Brand Overview

### Product Identity

**Excel-to-Dashboard** is a modern, AI-powered data visualization platform that transforms spreadsheets into beautiful, interactive dashboards with minimal friction.

### Brand Pillars

1. **Simplicity** - Effortless data transformation with intelligent automation
2. **Intelligence** - AI-powered insights and smart suggestions
3. **Trust** - Client-side processing, data privacy, and transparency
4. **Clarity** - Clean, intuitive interface that guides users through workflows
5. **Speed** - Rapid dashboard creation from raw data

### Target Audience

- **Primary:** Business analysts, data professionals, non-technical business users
- **Secondary:** Product managers, executives, data-driven decision makers
- **Use Cases:** Quick dashboards, data exploration, KPI monitoring, alert management

---

## Design Philosophy

### Core Principles

#### 1. **Progressive Disclosure**
- Show only what's necessary at each step
- Reveal advanced options when needed
- Guide users through a clear 4-step workflow

#### 2. **Intelligent Defaults**
- AI automatically suggests optimal visualizations
- Smart column type detection
- Sensible fallbacks when API keys are missing

#### 3. **Clarity Over Decoration**
- Minimal visual noise
- Purposeful use of color and spacing
- Every element serves a function

#### 4. **Accessibility First**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- High contrast ratios
- Semantic HTML structure

#### 5. **Performance Matters**
- Client-side session persistence (no server dependency)
- Lazy-loaded AI client
- Optimized bundle size
- Instant feedback on user actions

---

## Visual Identity

### Logo & Wordmark

**Primary Logo:** BarChart3 icon (from Lucide React)
- **Size:** 32px (header), 24px (secondary), 16px (tertiary)
- **Color:** Primary brand color (HSL: 221.2° 83.2% 53.3%)
- **Usage:** Header, favicon, brand mark

**Wordmark:** "Excel-to-Dashboard"
- **Font:** Geist Sans (system default)
- **Weight:** 700 (bold)
- **Size:** 20px (header), 28px (hero)
- **Spacing:** 8px gap between icon and text

### Brand Colors

**Primary Blue** (Action & Emphasis)
- HSL: 221.2° 83.2% 53.3%
- RGB: 51, 136, 255
- Usage: CTAs, links, primary actions, highlights

**Neutral Palette** (Structure & Text)
- Background: HSL: 0° 0% 100% (light), HSL: 222.2° 84% 4.9% (dark)
- Foreground: HSL: 222.2° 84% 4.9% (light), HSL: 210° 40% 98% (dark)
- Usage: Text, backgrounds, structural elements

**Semantic Colors**
- Success: HSL: 173° 58% 39% (chart-2)
- Warning: HSL: 43° 74% 66% (chart-4)
- Error: HSL: 0° 84.2% 60.2%
- Info: HSL: 221.2° 83.2% 53.3% (primary)

---

## Design System

### Design Tokens

#### Spacing Scale
```
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
2xl: 3rem    (48px)
```

#### Border Radius
```
sm: calc(var(--radius) - 4px) = 0.125rem
md: calc(var(--radius) - 2px) = 0.375rem
lg: var(--radius)              = 0.625rem
xl: calc(var(--radius) + 4px)  = 1.025rem
```

#### Typography Scale
```
h1: 3.75rem (60px) - Hero titles
h2: 2.25rem (36px) - Section headers
h3: 1.875rem (30px) - Card titles
h4: 1.5rem (24px) - Subsection headers
body: 1rem (16px) - Default text
small: 0.875rem (14px) - Secondary text
xs: 0.75rem (12px) - Captions
```

#### Shadow System
```
sm: 0 1px 3px 0px rgba(0,0,0,0.1)
md: 0 1px 3px 0px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.1)
lg: 0 1px 3px 0px rgba(0,0,0,0.1), 0 4px 6px -1px rgba(0,0,0,0.1)
xl: 0 1px 3px 0px rgba(0,0,0,0.1), 0 8px 10px -1px rgba(0,0,0,0.1)
```

### Component Library

All components use **shadcn/ui** as the foundation with custom theming.

#### Core Components

| Component | Purpose | Variants |
|-----------|---------|----------|
| Button | Primary actions | default, outline, ghost, destructive |
| Card | Content containers | elevated, flat |
| Input | Text entry | default, error, disabled |
| Select | Dropdown selection | default, multiple |
| Dialog | Modal interactions | default, alert |
| Badge | Labels & tags | default, secondary, outline, destructive |
| Alert | Messages & notifications | default, destructive |
| Table | Data display | striped, hover |

#### Custom Components

| Component | Purpose | Location |
|-----------|---------|----------|
| FileUploadZone | Drag-and-drop upload | src/components/FileUploadZone.tsx |
| SettingsDialog | API key management | src/components/SettingsDialog.tsx |
| ThemeToggle | Light/dark mode | src/components/ui/theme-toggle.tsx |
| ChartWidget | Data visualization | src/components/ChartWidget.tsx |
| DataMapper | Column configuration | src/components/DataMapper.tsx |
| AlertManager | Alert rule creation | src/components/AlertManager.tsx |

---

## Component Architecture

### Layered Component Structure

```
UI Layer (shadcn/ui)
    ↓
Custom Components (Business Logic)
    ↓
Page Components (Layout & Orchestration)
    ↓
App Shell (Layout, Theme, Providers)
```

### Component Hierarchy

#### Page Level
- `src/app/page.tsx` - Landing page
- `src/app/dashboard/page.tsx` - Main dashboard

#### Feature Components
- `FileUploadZone` - File input with drag-drop
- `DataMapper` - Column type configuration
- `ChartWidget` - Chart visualization
- `AlertManager` - Alert rule management
- `SettingsDialog` - Settings & API key input

#### UI Components (shadcn/ui)
- Button, Card, Input, Select, Dialog, Badge, Alert, Label, Table

#### Utility Components
- `ThemeProvider` - Theme context
- `ThemeToggle` - Theme switcher
- `Sonner` - Toast notifications

### State Management Pattern

**Client-Side Session Persistence**
```typescript
// Session Manager (src/lib/session-manager.ts)
- Stores: uploadedData, processedData, columnMapping, chartSuggestion, alertRules
- Storage: IndexedDB → WebSQL → localStorage (fallback)
- Auto-save: Debounced (1000ms) on state changes
- Recovery: Loads latest session on mount
```

---

## Typography & Spacing

### Font Stack

**Primary Font:** Geist Sans (system default)
- Used for: Headlines, body text, UI labels
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Fallback: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

**Monospace Font:** Geist Mono (for code/data)
- Used for: Code snippets, data values, technical text
- Fallback: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas

### Spacing Guidelines

**Vertical Rhythm**
- Base unit: 8px (0.5rem)
- Multiples: 8px, 16px, 24px, 32px, 48px
- Line height: 1.5 (body), 1.2 (headings)

**Horizontal Spacing**
- Container padding: 16px (mobile), 24px (tablet), 32px (desktop)
- Component gap: 8px (tight), 16px (normal), 24px (loose)
- Text indentation: 16px

### Responsive Breakpoints

```
Mobile:  < 640px  (sm)
Tablet:  640px - 1024px (md, lg)
Desktop: > 1024px (xl, 2xl)
```

---

## Color Palette

### Light Mode

| Token | HSL | Usage |
|-------|-----|-------|
| background | 0° 0% 100% | Page background |
| foreground | 222.2° 84% 4.9% | Primary text |
| card | 0° 0% 100% | Card backgrounds |
| primary | 221.2° 83.2% 53.3% | Actions, links |
| secondary | 210° 40% 96.1% | Secondary actions |
| muted | 210° 40% 96.1% | Disabled, secondary |
| accent | 210° 40% 96.1% | Highlights |
| destructive | 0° 84.2% 60.2% | Errors, alerts |
| border | 214.3° 31.8% 91.4% | Dividers, borders |

### Dark Mode

| Token | HSL | Usage |
|-------|-----|-------|
| background | 222.2° 84% 4.9% | Page background |
| foreground | 210° 40% 98% | Primary text |
| card | 222.2° 84% 4.9% | Card backgrounds |
| primary | 217.2° 91.2% 59.8% | Actions, links |
| secondary | 217.2° 32.6% 17.5% | Secondary actions |
| muted | 217.2° 32.6% 17.5% | Disabled, secondary |
| accent | 217.2° 32.6% 17.5% | Highlights |
| destructive | 0° 62.8% 30.6% | Errors, alerts |
| border | 217.2° 32.6% 17.5% | Dividers, borders |

### Chart Colors

```
chart-1: HSL 12° 76% 61%   (Orange/Red)
chart-2: HSL 173° 58% 39%  (Teal/Green)
chart-3: HSL 197° 37% 24%  (Dark Blue)
chart-4: HSL 43° 74% 66%   (Yellow)
chart-5: HSL 27° 87% 67%   (Orange)
```

---

## Interaction Patterns

### Navigation Flow

```
Landing Page (/)
    ↓
[Get Started Button]
    ↓
Dashboard (/dashboard)
    ├─ Step 1: Upload File
    ├─ Step 2: Map Columns & Get AI Suggestion
    ├─ Step 3: View Dashboard
    └─ Step 4: Configure Alerts
```

### User Interactions

#### File Upload
- **Trigger:** Click or drag-drop
- **Feedback:** Loading toast, status message
- **Success:** Auto-advance to Step 2
- **Error:** Error toast with retry option

#### AI Suggestion
- **Trigger:** "Get AI Chart Suggestion" button
- **Loading:** Spinner animation, disabled button
- **Success:** Display suggestion with reasoning
- **Error:** Fallback to default suggestion

#### Settings
- **Trigger:** Settings icon (gear)
- **Action:** Modal dialog opens
- **Input:** Password field for API key
- **Storage:** localStorage (client-side only)
- **Feedback:** Success/error toast

#### Theme Toggle
- **Trigger:** Moon/Sun icon
- **Action:** Instant theme switch
- **Persistence:** localStorage
- **Fallback:** System preference

### Micro-interactions

#### Button States
- **Hover:** Slight color shift, shadow increase
- **Active:** Color deepens, shadow decreases
- **Disabled:** Opacity 50%, cursor not-allowed
- **Loading:** Spinner animation, text change

#### Card Hover
- **Effect:** Border color change to primary
- **Transition:** 200ms ease-in-out
- **Usage:** Feature cards on landing page

#### Input Focus
- **Effect:** Ring color (primary), border highlight
- **Transition:** 150ms ease-out
- **Accessibility:** Visible focus indicator

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

#### Keyboard Navigation
- All interactive elements: Tab-accessible
- Focus indicators: Visible (ring color)
- Escape key: Closes modals/dialogs
- Enter key: Submits forms

#### Screen Reader Support
- Semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`
- ARIA labels: `aria-label`, `aria-describedby`
- Hidden text: `sr-only` class for screen readers
- Form labels: Associated with inputs

#### Motion & Animation
- Respects `prefers-reduced-motion`
- Animations: 200-400ms duration
- No auto-playing videos/animations
- Meaningful animations only

### Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] Form inputs have associated labels
- [ ] Color not sole means of conveying information
- [ ] Focus indicators visible on all interactive elements
- [ ] Sufficient color contrast (4.5:1 for normal text)
- [ ] Keyboard navigation works throughout
- [ ] Images have alt text
- [ ] Modals trap focus
- [ ] Error messages are clear and associated with inputs
- [ ] Loading states are announced

---

## Implementation Guidelines

### File Organization

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with providers
│   ├── globals.css           # Design tokens & Tailwind
│   └── dashboard/
│       └── page.tsx          # Main dashboard
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── label.tsx
│   │   ├── table.tsx
│   │   ├── sonner.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── FileUploadZone.tsx    # Custom components
│   ├── SettingsDialog.tsx
│   ├── ChartWidget.tsx
│   ├── DataMapper.tsx
│   ├── AlertManager.tsx
│   └── DashboardGrid.tsx
└── lib/
    ├── openai-ai.ts         # AI integration
    ├── session-manager.ts   # Client-side storage
    ├── data-schemas.ts      # Zod validation
    ├── data-processor.ts    # Data utilities
    ├── alert-engine.ts      # Alert logic
    └── utils.ts             # Helper functions
```

### Coding Standards

#### Component Structure
```typescript
// Imports
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

// Component definition
export function MyComponent() {
  // State
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // Logic
  }, [])
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  )
}
```

#### Tailwind Class Organization
```typescript
className="
  // Layout
  flex flex-col gap-4
  // Sizing
  w-full h-auto
  // Spacing
  p-4 m-0
  // Colors
  bg-background text-foreground
  // Borders
  border border-border rounded-lg
  // Effects
  shadow-md hover:shadow-lg
  // Responsive
  md:flex-row lg:gap-6
"
```

#### Component Props Pattern
```typescript
interface ComponentProps {
  // Required props
  title: string
  onSubmit: (data: FormData) => void
  
  // Optional props with defaults
  variant?: 'default' | 'outline'
  disabled?: boolean
  className?: string
}

export function Component({
  title,
  onSubmit,
  variant = 'default',
  disabled = false,
  className
}: ComponentProps) {
  // Implementation
}
```

### Theme Implementation

#### Using Design Tokens
```typescript
// Colors
className="bg-background text-foreground"
className="border-border"
className="text-primary"

// Spacing
className="p-4 gap-2 m-0"

// Sizing
className="rounded-lg"

// Shadows
className="shadow-md hover:shadow-lg"
```

#### Dark Mode
```typescript
// Automatic with next-themes
// No need for dark: prefix in most cases
// Design tokens handle light/dark automatically

// If needed:
className="dark:bg-slate-900 dark:text-white"
```

### Performance Optimization

#### Code Splitting
- Page components: Automatic with Next.js App Router
- Heavy components: Use `React.lazy()` for modals
- Charts: Lazy-load Recharts on demand

#### Bundle Size
- Tree-shake unused shadcn components
- Use dynamic imports for large libraries
- Minimize custom CSS (use Tailwind)

#### Client-Side Optimization
- Session persistence: Debounced saves (1000ms)
- AI client: Lazy-loaded only when needed
- Images: Use Next.js Image component
- Fonts: System fonts (no external font files)

---

## Design Decisions & Rationale

### Why shadcn/ui?

1. **Composable:** Build custom components easily
2. **Accessible:** Built-in WCAG compliance
3. **Themeable:** Design tokens system
4. **Lightweight:** Copy-paste, no dependencies
5. **Modern:** Tailwind CSS + Radix UI primitives

### Why Client-Side Storage?

1. **Privacy:** User data never leaves their browser
2. **Offline:** Works without server connection
3. **Speed:** Instant session recovery
4. **Simplicity:** No backend infrastructure needed

### Why Lazy-Load AI Client?

1. **Performance:** Only initialize when needed
2. **Reliability:** Graceful fallback without API key
3. **Security:** API key from localStorage, not env
4. **Flexibility:** Users can add/change API key anytime

### Why 4-Step Workflow?

1. **Clarity:** Each step has a clear purpose
2. **Guidance:** Progressive disclosure of features
3. **Flexibility:** Users can skip steps if needed
4. **Feedback:** Clear progress indication

---

## Future Enhancements

### Phase 2: Advanced Features
- [ ] Multiple chart types (pie, scatter, heatmap)
- [ ] Real-time data refresh with polling
- [ ] Dashboard sharing & embedding
- [ ] Custom color schemes per dashboard
- [ ] Data export (PNG, PDF, CSV)

### Phase 3: Collaboration
- [ ] User authentication
- [ ] Dashboard sharing with permissions
- [ ] Collaborative editing
- [ ] Comment & annotation system
- [ ] Version history

### Phase 4: Enterprise
- [ ] Self-hosted deployment
- [ ] Advanced security (SSO, SAML)
- [ ] Audit logging
- [ ] Custom branding
- [ ] API access

---

## Maintenance & Updates

### Design System Governance

1. **Changes:** Document in this guide
2. **Review:** FAANG design standards
3. **Testing:** Cross-browser, accessibility
4. **Communication:** Notify team of updates
5. **Versioning:** Semantic versioning for design tokens

### Component Updates

- Keep shadcn/ui components up-to-date
- Test theme changes across light/dark modes
- Verify accessibility after updates
- Update documentation

---

## Contact & Support

For design questions or contributions:
1. Review this guide first
2. Check component examples in Storybook (future)
3. Open design discussion in team channels
4. Submit design proposals with rationale

---

**End of Document**

*This guide represents the current state of the Excel-to-Dashboard design system. It will evolve as the product grows and user needs change.*

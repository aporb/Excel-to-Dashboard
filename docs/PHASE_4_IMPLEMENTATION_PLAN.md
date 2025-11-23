# Phase 4: Design System & Polish - Implementation Plan

**Version:** 1.0
**Date:** November 22, 2025
**Status:** Ready for Implementation
**Total Estimated Effort:** 80 hours (~3 weeks)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Phase A: Critical Fixes (Week 1, 16h)](#phase-a-critical-fixes)
4. [Phase B+C: Glassmorphism Adoption & Micro-interactions (Week 2, 40h)](#phase-bc-glassmorphism-adoption--micro-interactions)
5. [Phase D: Accessibility Audit (Week 3, 24h)](#phase-d-accessibility-audit)
6. [Implementation Timeline](#implementation-timeline)
7. [Success Criteria & Metrics](#success-criteria--metrics)
8. [Testing Strategy](#testing-strategy)
9. [Deliverables Checklist](#deliverables-checklist)

---

## Executive Summary

### Objective
Achieve FAANG-level visual quality through comprehensive design system adoption, accessibility compliance, and premium micro-interactions.

### Current Completion
- Design System Foundation: **100%** (globals.css is complete)
- Component Adoption: **65%** (critical gaps in charts and some UI components)
- Accessibility: **~70%** (needs formal audit and fixes)

### Target Completion
- Design System Adoption: **100%**
- WCAG 2.1 AA Compliance: **100%**
- Lighthouse Accessibility Score: **> 95**
- Axe DevTools Critical Issues: **0**

### Key Deliverables
1. ✅ All charts using CSS variables (no hardcoded colors)
2. ✅ 100% glassmorphism adoption across components
3. ✅ Premium micro-interactions on all interactive elements
4. ✅ WCAG 2.1 AA compliance with documentation
5. ✅ Comprehensive accessibility test report

---

## Current State Analysis

### Design System Assets (Completed ✅)

**globals.css Analysis:**
- ✅ Complete OKLCH color system (light + dark mode)
- ✅ 5 chart color variables (--chart-1 through --chart-5)
- ✅ Glassmorphism utilities (.glass-standard, .glass-subtle, .glass-strong)
- ✅ 13 animation keyframes (fade, slide, shimmer, glow, etc.)
- ✅ Typography scale (Perfect Fourth ratio: 1.333)
- ✅ Accessibility features (reduced motion, high contrast)
- ✅ Focus utilities (.focus-ring, .focus-glass)
- ✅ Skeleton loading states

### Component Adoption Gaps

#### ❌ Critical Issues (Must Fix)

**1. Chart Components (LineChartWidget, BarChartWidget, AreaChartWidget, PieChartWidget)**
- **Problem:** Using `hsl(var(--chart-X))` as string values instead of proper CSS color references
- **Impact:** Charts don't properly use design system colors
- **Example:**
  ```tsx
  // CURRENT (WRONG):
  color='hsl(var(--chart-1))'

  // SHOULD BE:
  style={{ stroke: 'var(--chart-1)' }}
  ```
- **Files to Fix:**
  - `src/components/charts/LineChartWidget.tsx`
  - `src/components/charts/BarChartWidget.tsx`
  - `src/components/charts/AreaChartWidget.tsx`
  - `src/components/charts/PieChartWidget.tsx`

**2. KPICard Component**
- **Problem:** Hardcoded hex colors for trend indicators
- **Current Code:**
  ```tsx
  const trendColor = metric.trend === 'up' ? '#10b981' :
                     metric.trend === 'down' ? '#ef4444' :
                     '#6b7280';
  ```
- **Should Use:** CSS variables (--success, --destructive, --muted-foreground)
- **File to Fix:** `src/components/dashboard/KPICard.tsx`

#### ⚠️ Needs Enhancement

**3. Components Not Using Glassmorphism**
- `DataMapper.tsx`
- `AlertManager.tsx`
- `DataTable.tsx`
- `AlertHistory.tsx`
- `ExportDialog.tsx`
- `SettingsDialog.tsx`
- Various `ui/` components (dialog, select, table, etc.)

**4. Components Lacking Micro-interactions**
- Missing hover states
- Missing loading animations
- Missing transition effects

### Accessibility Gaps

**Known Issues:**
- No formal accessibility audit completed
- Unknown keyboard navigation coverage
- No screen reader testing done
- Color contrast not validated programmatically
- Focus indicators may be inconsistent

**Tools Available:**
- ✅ axe-core (v4.11.0) - Already installed
- ⚠️ Lighthouse - Available in Chrome DevTools
- ⚠️ @axe-core/react - Not installed (will install)

---

## Phase A: Critical Fixes

**Duration:** Week 1 (16 hours)
**Priority:** CRITICAL
**Goal:** Fix hardcoded colors, ensure typography consistency, validate color contrast

### Task 1: Fix Chart Color System (6 hours)

#### Problem Statement
All chart components use `hsl(var(--chart-X))` string values instead of proper CSS variable references. Recharts components need actual color values, not CSS variable strings.

#### Solution Strategy
Create a custom hook `useChartColors()` that reads CSS variables at runtime and returns actual color values.

#### Implementation Steps

**Step 1.1: Create useChartColors Hook (1h)**

File: `src/hooks/useChartColors.ts`

```typescript
import { useEffect, useState } from 'react';

interface ChartColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  border: string;
  mutedForeground: string;
  background: string;
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>({
    chart1: '',
    chart2: '',
    chart3: '',
    chart4: '',
    chart5: '',
    border: '',
    mutedForeground: '',
    background: '',
  });

  useEffect(() => {
    // Read CSS variables from computed styles
    const root = document.documentElement;
    const styles = getComputedStyle(root);

    setColors({
      chart1: styles.getPropertyValue('--chart-1').trim(),
      chart2: styles.getPropertyValue('--chart-2').trim(),
      chart3: styles.getPropertyValue('--chart-3').trim(),
      chart4: styles.getPropertyValue('--chart-4').trim(),
      chart5: styles.getPropertyValue('--chart-5').trim(),
      border: styles.getPropertyValue('--border').trim(),
      mutedForeground: styles.getPropertyValue('--muted-foreground').trim(),
      background: styles.getPropertyValue('--background').trim(),
    });
  }, []);

  return colors;
}
```

**Step 1.2: Update LineChartWidget (1h)**

File: `src/components/charts/LineChartWidget.tsx`

Changes:
```tsx
import { useChartColors } from '@/hooks/useChartColors';

export function LineChartWidget({ data, xKey, yKey, title }: LineChartWidgetProps) {
  const colors = useChartColors();

  return (
    <Card className="col-span-2">
      {/* ... */}
      <LineChart>
        <CartesianGrid stroke={colors.border} />
        <XAxis stroke={colors.mutedForeground} />
        <YAxis stroke={colors.mutedForeground} />
        <Tooltip cursor={{ stroke: colors.chart1 }} />
        <Line
          dataKey={yKey}
          stroke={colors.chart1}
          dot={{ fill: colors.chart1 }}
        />
      </LineChart>
    </Card>
  );
}
```

**Step 1.3: Update BarChartWidget (1h)**

Similar changes to BarChartWidget, using `colors.chart3`.

**Step 1.4: Update AreaChartWidget (1h)**

Similar changes, including updating the `linearGradient` fill to use `colors.chart4`.

**Step 1.5: Update PieChartWidget (1h)**

Update to use an array of chart colors:
```tsx
const chartColors = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
];
```

**Step 1.6: Test Chart Color Updates (1h)**

- Verify all chart types render correctly
- Test in light mode
- Test in dark mode
- Ensure colors update when theme changes

#### Success Criteria
- [ ] All chart components use `useChartColors()` hook
- [ ] No hardcoded `hsl()` or `#hex` color values in chart files
- [ ] Charts render correctly in both light and dark modes
- [ ] Theme switching updates chart colors instantly

---

### Task 2: Fix KPICard Color System (2 hours)

#### Problem Statement
KPICard uses hardcoded hex colors for trend indicators instead of semantic CSS variables.

#### Implementation Steps

**Step 2.1: Update KPICard Component (1h)**

File: `src/components/dashboard/KPICard.tsx`

Changes:
```tsx
export function KPICard({ metric, icon }: KPICardProps) {
  // BEFORE:
  // const trendColor = metric.trend === 'up' ? '#10b981' :
  //                    metric.trend === 'down' ? '#ef4444' : '#6b7280';

  // AFTER: Use CSS variables
  const getTrendColorClass = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="hover:border-primary transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.name}
          </CardTitle>
          {icon && <div className="text-primary">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold text-foreground">{metric.formatted}</div>
        {metric.trendPercent > 0 && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            getTrendColorClass(metric.trend)
          )}>
            <span>{trendIcon}</span>
            <span>{metric.trendPercent}% from previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2.2: Test KPICard (1h)**

- Test with up trend (green)
- Test with down trend (red)
- Test with neutral trend (gray)
- Verify colors in light/dark mode

#### Success Criteria
- [ ] KPICard uses CSS variable classes (text-success, text-destructive, text-muted-foreground)
- [ ] No hardcoded hex colors
- [ ] Trend colors match design system

---

### Task 3: Typography Audit (4 hours)

#### Goal
Ensure all components use typography scale consistently.

#### Implementation Steps

**Step 3.1: Audit All Components (2h)**

Create checklist:
- [ ] Headings use correct scale (h1 = text-4xl, h2 = text-3xl, etc.)
- [ ] Body text uses text-base
- [ ] Small text uses text-sm or text-xs
- [ ] Font weights are consistent (semibold for headings, normal for body)

**Step 3.2: Fix Typography Issues (2h)**

Common fixes:
- Replace arbitrary text sizes with scale classes
- Ensure line-height consistency
- Add letter-spacing to headings (-0.025em)

Files to check:
- Landing page (`src/app/page.tsx`)
- Dashboard page (`src/app/dashboard/page.tsx`)
- All card components

#### Success Criteria
- [ ] All text uses typography scale from globals.css
- [ ] No arbitrary text sizes (e.g., `text-[17px]`)
- [ ] Consistent heading hierarchy

---

### Task 4: Color Contrast Validation (4 hours)

#### Goal
Ensure all text meets WCAG 2.1 AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

#### Implementation Steps

**Step 4.1: Install Contrast Checker (0.5h)**

```bash
npm install --save-dev @axe-core/react axe-core
```

**Step 4.2: Create Contrast Testing Script (1h)**

File: `scripts/check-contrast.js`

```javascript
const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read globals.css and extract color values
// Calculate contrast ratios
// Report violations
```

**Step 4.3: Manual Contrast Audit (2h)**

Use browser DevTools or online tools:
- Check all text colors against backgrounds
- Check link colors
- Check button text
- Check disabled states

**Step 4.4: Fix Contrast Issues (0.5h)**

Common fixes:
- Increase saturation for low-contrast colors
- Adjust lightness values in OKLCH
- Use stronger border colors

#### Success Criteria
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Large text (18px+) meets 3:1 ratio
- [ ] Interactive elements have sufficient contrast
- [ ] No contrast violations in automated tests

---

## Phase B+C: Glassmorphism Adoption & Micro-interactions

**Duration:** Week 2 (40 hours)
**Priority:** HIGH
**Goal:** Apply glassmorphism to all components, add premium micro-interactions

### Task 5: Component Glassmorphism Migration (24 hours)

#### Target Components

**5.1: DataMapper (3h)**
- Add `.glass-standard` to main container
- Add `.glass-subtle` to column mapping cards
- Add hover animations
- Add stagger animations for field list

**5.2: AlertManager (3h)**
- Apply `.glass-standard` to alert rule cards
- Add `.glass-subtle` to form inputs
- Add pulse animation to active alerts
- Add slide-in animation for new alerts

**5.3: DataTable (4h)**
- Apply `.glass-subtle` to table container
- Add `.glass-standard` to header row
- Add hover effects to rows
- Add loading skeleton states

**5.4: AlertHistory (3h)**
- Apply `.glass-standard` to history cards
- Add timeline connector with glassmorphic effect
- Add fade-in animation for new entries
- Add subtle glow for triggered alerts

**5.5: ExportDialog (2h)**
- Apply `.glass-strong` to dialog overlay
- Add `.glass-standard` to dialog content
- Add scale-in animation on open
- Add shimmer effect to export button during processing

**5.6: SettingsDialog (2h)**
- Similar to ExportDialog
- Add `.glass-subtle` to input fields
- Add focus-glass effect to inputs

**5.7: UI Components (7h)**

Components to update:
- `ui/dialog.tsx` - Add glass overlay
- `ui/select.tsx` - Add glass dropdown
- `ui/table.tsx` - Add glass rows on hover
- `ui/tabs.tsx` - Add glass active tab indicator
- `ui/card.tsx` - Ensure glass variant works properly
- `ui/button.tsx` - Add glass variant
- `ui/input.tsx` - Add glass variant

#### Implementation Pattern

Example for DataMapper:

```tsx
// BEFORE:
<div className="border rounded-lg p-6">
  {/* content */}
</div>

// AFTER:
<div className="glass-standard rounded-xl p-6 animate-fade-in-up">
  {/* content */}
</div>
```

#### Success Criteria
- [ ] All major components use glassmorphism
- [ ] Consistent use of .glass-standard, .glass-subtle, .glass-strong
- [ ] No plain border/background combinations
- [ ] All glass effects work in both themes

---

### Task 6: Premium Micro-interactions (16 hours)

#### 6.1: Button Interactions (4h)

**Features to Add:**
- Ripple effect on click (using `.animate-ripple`)
- Subtle scale on hover
- Glow effect on focus
- Loading state with spinner and shimmer
- Disabled state with reduced opacity

File: `src/components/ui/button.tsx`

Example:
```tsx
export function Button({ children, ...props }: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples(prev => [...prev, { x, y, id: Date.now() }]);

    props.onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden",
        "hover-lift hover-glow",
        "transition-smooth",
        props.className
      )}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute animate-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </button>
  );
}
```

**Success Criteria:**
- [ ] Ripple effect on all buttons
- [ ] Smooth hover lift animation
- [ ] Glow effect on primary buttons
- [ ] Loading state with shimmer

---

#### 6.2: Card Interactions (4h)

**Features to Add:**
- Hover lift effect (translateY(-4px))
- Border glow on hover
- Smooth transitions (300ms)
- Click feedback (scale down slightly)

File: `src/components/ui/card.tsx`

Update variants:
```tsx
const cardVariants = {
  glass: "glass-standard",
  default: "bg-card",
};

const interactionVariants = {
  hoverable: "hover-lift hover-glow cursor-pointer transition-smooth-lg",
  clickable: "active:scale-[0.98]",
};
```

**Success Criteria:**
- [ ] All hoverable cards have lift effect
- [ ] Smooth 300ms transitions
- [ ] Subtle glow on hover
- [ ] No janky animations

---

#### 6.3: Input Interactions (4h)

**Features to Add:**
- Focus glow effect (.focus-glass)
- Label float animation
- Error shake animation
- Success checkmark animation
- Loading spinner in input

File: `src/components/ui/input.tsx`

**Success Criteria:**
- [ ] Smooth focus transition
- [ ] Focus glow effect
- [ ] Error state with shake
- [ ] Success state with checkmark

---

#### 6.4: Loading States & Skeletons (4h)

**Features to Add:**
- Shimmer skeleton for charts
- Shimmer skeleton for cards
- Shimmer skeleton for text
- Stagger animation for skeleton grid

Already have:
- `.skeleton` utility in globals.css
- `ChartSkeleton.tsx` and `CardSkeleton.tsx`

Need to:
- Ensure all async components show skeletons
- Add stagger delay to skeleton grids
- Add shimmer animation

**Success Criteria:**
- [ ] All loading states show skeletons
- [ ] Shimmer effect on all skeletons
- [ ] Stagger animation for grids
- [ ] Smooth transition from skeleton to content

---

## Phase D: Accessibility Audit

**Duration:** Week 3 (24 hours)
**Priority:** HIGH
**Goal:** Achieve WCAG 2.1 AA compliance, Lighthouse score > 95

### Task 7: Automated Accessibility Testing (8 hours)

#### 7.1: Setup Automated Testing (2h)

**Install Dependencies:**
```bash
npm install --save-dev @axe-core/react jest-axe
```

**Create Test Setup:**

File: `tests/setup/accessibility.ts`

```typescript
import { configureAxe } from 'jest-axe';

export const axe = configureAxe({
  rules: {
    // WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'label': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'image-alt': { enabled: true },
    'document-title': { enabled: true },
    'html-has-lang': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
  },
});
```

**Create Test Utilities:**

File: `tests/utils/render-with-a11y.tsx`

```tsx
import { render } from '@testing-library/react';
import { axe } from '../setup/accessibility';

export async function renderWithA11y(component: React.ReactElement) {
  const { container } = render(component);
  const results = await axe(container);
  return { container, results };
}
```

#### 7.2: Create Component Accessibility Tests (4h)

**Test Files to Create:**

1. `tests/a11y/buttons.test.tsx` - Test all button variants
2. `tests/a11y/forms.test.tsx` - Test form inputs and labels
3. `tests/a11y/navigation.test.tsx` - Test header, links, navigation
4. `tests/a11y/charts.test.tsx` - Test chart accessibility
5. `tests/a11y/dialogs.test.tsx` - Test modal focus management

Example test:

```tsx
// tests/a11y/buttons.test.tsx
import { renderWithA11y } from '../utils/render-with-a11y';
import { Button } from '@/components/ui/button';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { results } = await renderWithA11y(
      <Button>Click Me</Button>
    );
    expect(results).toHaveNoViolations();
  });

  it('should have accessible name', async () => {
    const { container } = render(<Button>Submit</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAccessibleName('Submit');
  });

  it('should indicate disabled state to screen readers', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

#### 7.3: Run Automated Tests and Fix Issues (2h)

```bash
npm test -- --testPathPattern=a11y
```

Fix any violations found.

**Success Criteria:**
- [ ] All automated tests pass
- [ ] 0 critical axe violations
- [ ] 0 moderate axe violations
- [ ] All interactive elements have accessible names

---

### Task 8: Lighthouse Audits (4 hours)

#### 8.1: Run Lighthouse on All Pages (2h)

**Pages to Audit:**
1. Landing page (`/`)
2. Dashboard page (`/dashboard`)
3. Library page (`/library`)

**Run Lighthouse:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Build production
npm run build
npm run start

# Run audits
lighthouse http://localhost:3000 --output html --output-path ./reports/lighthouse-home.html
lighthouse http://localhost:3000/dashboard --output html --output-path ./reports/lighthouse-dashboard.html
lighthouse http://localhost:3000/library --output html --output-path ./reports/lighthouse-library.html
```

#### 8.2: Analyze and Fix Issues (2h)

**Common Issues to Fix:**

1. **Missing alt text on images**
   - Add descriptive alt text to all images
   - Use empty alt="" for decorative images

2. **Missing form labels**
   - Ensure all inputs have associated labels
   - Use aria-label for icon buttons

3. **Insufficient color contrast**
   - Already addressed in Phase A

4. **Missing ARIA roles**
   - Add role="main" to main content
   - Add role="navigation" to nav elements
   - Add role="complementary" to sidebars

5. **Keyboard navigation issues**
   - Ensure logical tab order
   - Add :focus-visible styles
   - Skip links for screen readers

**Success Criteria:**
- [ ] Lighthouse Accessibility score > 95 on all pages
- [ ] All images have alt text
- [ ] All forms have labels
- [ ] Logical heading hierarchy

---

### Task 9: Manual Accessibility Testing (8 hours)

#### 9.1: Keyboard Navigation Testing (3h)

**Test Scenarios:**

1. **Tab Navigation**
   - [ ] Can navigate entire app using only Tab/Shift+Tab
   - [ ] Focus order is logical
   - [ ] Focus indicator is always visible
   - [ ] No keyboard traps

2. **Keyboard Shortcuts**
   - [ ] Enter/Space activate buttons
   - [ ] Escape closes dialogs
   - [ ] Arrow keys navigate menus/tabs
   - [ ] Home/End navigate to first/last items

3. **Form Interaction**
   - [ ] All form fields accessible via keyboard
   - [ ] Error messages announced
   - [ ] Validation happens on blur or submit

**Testing Checklist:**

```markdown
## Keyboard Navigation Test Results

### Landing Page
- [ ] Header navigation works with Tab
- [ ] "Get Started" button activates with Enter
- [ ] "Learn More" button activates with Enter
- [ ] Theme toggle works with keyboard
- [ ] Settings dialog opens with keyboard
- [ ] Focus returns to trigger after dialog closes

### Dashboard Page
- [ ] File upload zone is keyboard accessible
- [ ] Can navigate data mapper fields
- [ ] Chart type selector works with arrow keys
- [ ] Alert manager forms are keyboard accessible
- [ ] Export dialog keyboard accessible

### Library Page
- [ ] Dashboard cards are keyboard navigable
- [ ] Search input works
- [ ] Filter buttons work with keyboard
```

#### 9.2: Screen Reader Testing (3h)

**Tools:**
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free)
- Chrome: ChromeVox extension

**Test Scenarios:**

1. **Page Structure**
   - [ ] Page title announced
   - [ ] Landmarks announced (main, nav, aside)
   - [ ] Headings announced with levels
   - [ ] Lists announced with item count

2. **Interactive Elements**
   - [ ] Buttons announced with role and state
   - [ ] Links announced with destination
   - [ ] Form fields announced with labels
   - [ ] Error messages announced

3. **Dynamic Content**
   - [ ] Toast notifications announced (aria-live)
   - [ ] Loading states announced
   - [ ] Chart data accessible (via table alternative)
   - [ ] Alert triggers announced

**Testing Checklist:**

```markdown
## Screen Reader Test Results

### VoiceOver Testing (macOS)
- [ ] Landing page structure announced correctly
- [ ] Dashboard workflow is understandable
- [ ] Chart data has text alternative
- [ ] Alerts are announced with aria-live
- [ ] Form errors announced
- [ ] Success messages announced

### Focus Management
- [ ] Focus moves to dialog when opened
- [ ] Focus returns to trigger when closed
- [ ] Skip to main content link works
- [ ] Focus never lost
```

#### 9.3: Visual Accessibility Testing (2h)

**Test Scenarios:**

1. **High Contrast Mode**
   - Test in Windows High Contrast Mode
   - Test with browser high contrast extensions
   - Ensure borders and focus indicators visible

2. **Zoom Testing**
   - [ ] Test at 200% zoom (no horizontal scroll)
   - [ ] Test at 400% zoom (WCAG AAA)
   - [ ] All content reachable
   - [ ] No overlapping content

3. **Color Blindness Simulation**
   - Use Chrome DevTools color vision deficiency emulation
   - [ ] Protanopia (red-blind)
   - [ ] Deuteranopia (green-blind)
   - [ ] Tritanopia (blue-blind)
   - [ ] Ensure information not conveyed by color alone

**Success Criteria:**
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces all content correctly
- [ ] No keyboard traps
- [ ] Focus always visible
- [ ] Works at 200% zoom
- [ ] Works in high contrast mode

---

### Task 10: Accessibility Documentation (4 hours)

#### 10.1: Create WCAG Compliance Report (2h)

File: `docs/ACCESSIBILITY_STATEMENT.md`

Structure:
```markdown
# Accessibility Statement

## Conformance Status
Excel-to-Dashboard is **fully conformant** with WCAG 2.1 Level AA.

## Testing Methods
- Automated testing with axe-core
- Lighthouse audits
- Manual keyboard navigation testing
- Screen reader testing with VoiceOver and NVDA
- Color contrast validation

## Conformance Details

### Perceivable
- ✅ Text Alternatives (1.1.1)
- ✅ Captions and Other Alternatives (1.2)
- ✅ Adaptable (1.3)
- ✅ Distinguishable (1.4)

### Operable
- ✅ Keyboard Accessible (2.1)
- ✅ Enough Time (2.2)
- ✅ Seizures and Physical Reactions (2.3)
- ✅ Navigable (2.4)
- ✅ Input Modalities (2.5)

### Understandable
- ✅ Readable (3.1)
- ✅ Predictable (3.2)
- ✅ Input Assistance (3.3)

### Robust
- ✅ Compatible (4.1)

## Known Limitations
[List any remaining issues]

## Feedback
Contact: [email] for accessibility feedback
```

#### 10.2: Create Accessibility Testing Guide (1h)

File: `docs/ACCESSIBILITY_TESTING_GUIDE.md`

Include:
- How to run automated tests
- How to test with screen readers
- How to test keyboard navigation
- How to report accessibility issues

#### 10.3: Add ARIA Labels Where Needed (1h)

**Components to Update:**

1. **Icon Buttons** - Add aria-label
   ```tsx
   <Button aria-label="Toggle theme">
     <Sun className="h-5 w-5" />
   </Button>
   ```

2. **Charts** - Add aria-label and role
   ```tsx
   <div role="img" aria-label="Line chart showing revenue over time">
     <ResponsiveContainer>...</ResponsiveContainer>
   </div>
   ```

3. **Loading States** - Add aria-busy
   ```tsx
   <div aria-busy={isLoading} aria-live="polite">
     {isLoading ? <Skeleton /> : <Content />}
   </div>
   ```

4. **Alerts** - Add aria-live
   ```tsx
   <div role="alert" aria-live="assertive">
     Error: {message}
   </div>
   ```

**Success Criteria:**
- [ ] Accessibility statement published
- [ ] Testing guide documented
- [ ] All icon buttons have aria-labels
- [ ] All charts have text alternatives
- [ ] All live regions have aria-live

---

## Implementation Timeline

### Week 1: Phase A - Critical Fixes (16h)

| Day | Hours | Tasks |
|-----|-------|-------|
| Mon | 4h | Create useChartColors hook, update LineChartWidget & BarChartWidget |
| Tue | 4h | Update AreaChartWidget & PieChartWidget, fix KPICard colors |
| Wed | 4h | Typography audit all components |
| Thu | 4h | Color contrast validation and fixes |

**Deliverables:**
- ✅ All charts using CSS variables
- ✅ KPICard using semantic colors
- ✅ Typography scale consistent
- ✅ Color contrast validated

---

### Week 2: Phase B+C - Glassmorphism & Micro-interactions (40h)

| Day | Hours | Tasks |
|-----|-------|-------|
| Mon | 8h | DataMapper, AlertManager, DataTable glassmorphism |
| Tue | 8h | AlertHistory, ExportDialog, SettingsDialog glassmorphism |
| Wed | 8h | UI component glassmorphism (dialog, select, table, tabs) |
| Thu | 8h | Button interactions, card interactions |
| Fri | 8h | Input interactions, loading states & skeletons |

**Deliverables:**
- ✅ 100% glassmorphism adoption
- ✅ Premium micro-interactions on all components
- ✅ Loading skeletons on all async content

---

### Week 3: Phase D - Accessibility Audit (24h)

| Day | Hours | Tasks |
|-----|-------|-------|
| Mon | 8h | Setup automated testing, create component tests, run and fix |
| Tue | 8h | Lighthouse audits (all pages), analyze and fix issues |
| Wed | 4h | Keyboard navigation testing |
| Wed | 4h | Screen reader testing (VoiceOver/NVDA) |
| Thu | 4h | Visual accessibility testing (zoom, high contrast, color blind) |
| Fri | 4h | Create accessibility documentation and final report |

**Deliverables:**
- ✅ Automated test suite passing
- ✅ Lighthouse score > 95
- ✅ Manual testing complete
- ✅ Accessibility documentation

---

## Success Criteria & Metrics

### Design System Adoption

**Target:** 100% adoption

**Checklist:**
- [ ] All chart components use CSS variables (no hsl() strings)
- [ ] All trend indicators use semantic colors
- [ ] All major components use glassmorphism
- [ ] Typography scale used consistently
- [ ] No hardcoded colors anywhere

**Measurement:**
```bash
# Search for hardcoded colors
grep -r "#[0-9a-fA-F]\{6\}" src/components --exclude-dir=node_modules
grep -r "rgb(" src/components --exclude-dir=node_modules

# Should return 0 results
```

---

### Glassmorphism Adoption

**Target:** 100% of cards/containers

**Checklist:**
- [ ] All Card components use glass variant
- [ ] All dialogs use glass-strong overlay
- [ ] All dropdowns use glass-subtle
- [ ] All tooltips use glass-standard
- [ ] Consistent use of border radius (rounded-xl)

**Components Using Glassmorphism:**
- ✅ FileUploadZone
- ✅ Landing page cards
- ✅ Dashboard header (on scroll)
- ⚠️ DataMapper (needs update)
- ⚠️ AlertManager (needs update)
- ⚠️ DataTable (needs update)
- ⚠️ All other components (needs update)

---

### Micro-interactions

**Target:** Premium interactions on all interactive elements

**Checklist:**
- [ ] All buttons have ripple effect
- [ ] All hoverable cards have lift effect
- [ ] All inputs have focus glow
- [ ] All loading states have shimmer
- [ ] All animations respect prefers-reduced-motion

---

### Accessibility Metrics

**Target:** WCAG 2.1 AA Compliance

**Quantitative Metrics:**
- [ ] Lighthouse Accessibility Score > 95 (all pages)
- [ ] Axe DevTools: 0 critical issues
- [ ] Axe DevTools: 0 moderate issues
- [ ] Color Contrast: All text meets 4.5:1 ratio

**Qualitative Metrics:**
- [ ] Keyboard navigation: 100% functional
- [ ] Screen reader: All content accessible
- [ ] Zoom: Works at 200% (no horizontal scroll)
- [ ] High contrast: All content visible

---

## Testing Strategy

### Automated Testing

**Tools:**
- axe-core (already installed)
- @axe-core/react (to install)
- jest-axe (to install)
- Lighthouse CI

**Test Coverage:**
- All UI components (100%)
- All page routes (100%)
- All interactive states (100%)

**Running Tests:**
```bash
# Run accessibility tests
npm test -- --testPathPattern=a11y

# Run Lighthouse CI
npm run lighthouse:ci
```

---

### Manual Testing

**Browser Matrix:**
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)

**Device Testing:**
- Desktop (1920x1080, 1366x768)
- Tablet (iPad, 768x1024)
- Mobile (iPhone, 375x812)

**Assistive Technology:**
- VoiceOver (macOS)
- NVDA (Windows)
- Keyboard navigation (all browsers)

---

### Visual Regression Testing

**Tool:** Percy or Chromatic (optional)

**Snapshots:**
- All page states
- All component variants
- Light and dark mode
- Hover states
- Focus states

---

## Deliverables Checklist

### Phase A Deliverables

- [ ] `src/hooks/useChartColors.ts` - Custom hook for chart colors
- [ ] Updated `LineChartWidget.tsx`
- [ ] Updated `BarChartWidget.tsx`
- [ ] Updated `AreaChartWidget.tsx`
- [ ] Updated `PieChartWidget.tsx`
- [ ] Updated `KPICard.tsx`
- [ ] Typography audit report
- [ ] Color contrast validation report

---

### Phase B+C Deliverables

- [ ] Updated `DataMapper.tsx` with glassmorphism
- [ ] Updated `AlertManager.tsx` with glassmorphism
- [ ] Updated `DataTable.tsx` with glassmorphism
- [ ] Updated `AlertHistory.tsx` with glassmorphism
- [ ] Updated `ExportDialog.tsx` with glassmorphism
- [ ] Updated `SettingsDialog.tsx` with glassmorphism
- [ ] Updated `ui/button.tsx` with ripple effect
- [ ] Updated `ui/card.tsx` with hover lift
- [ ] Updated `ui/input.tsx` with focus glow
- [ ] Updated `ui/dialog.tsx` with glass overlay
- [ ] Updated `ui/select.tsx` with glass dropdown
- [ ] Updated `ui/table.tsx` with glass rows
- [ ] Updated `ui/tabs.tsx` with glass indicator
- [ ] Skeleton loading states on all async components

---

### Phase D Deliverables

- [ ] `tests/setup/accessibility.ts` - Test setup
- [ ] `tests/utils/render-with-a11y.tsx` - Test utilities
- [ ] `tests/a11y/buttons.test.tsx`
- [ ] `tests/a11y/forms.test.tsx`
- [ ] `tests/a11y/navigation.test.tsx`
- [ ] `tests/a11y/charts.test.tsx`
- [ ] `tests/a11y/dialogs.test.tsx`
- [ ] `reports/lighthouse-home.html`
- [ ] `reports/lighthouse-dashboard.html`
- [ ] `reports/lighthouse-library.html`
- [ ] `docs/ACCESSIBILITY_STATEMENT.md`
- [ ] `docs/ACCESSIBILITY_TESTING_GUIDE.md`
- [ ] ARIA labels added to all icon buttons
- [ ] Text alternatives for all charts
- [ ] Keyboard navigation test results
- [ ] Screen reader test results
- [ ] Visual accessibility test results

---

## Final Acceptance Criteria

### Phase 4 is complete when:

1. **Design System Adoption**
   - [ ] 0 hardcoded colors in codebase
   - [ ] All components use CSS variables
   - [ ] 100% glassmorphism adoption
   - [ ] Typography scale consistent

2. **Visual Quality**
   - [ ] Premium micro-interactions on all elements
   - [ ] Smooth 60fps animations
   - [ ] Loading states on all async content
   - [ ] Consistent spacing and sizing

3. **Accessibility**
   - [ ] Lighthouse Accessibility > 95 (all pages)
   - [ ] Axe DevTools 0 critical issues
   - [ ] 100% keyboard navigable
   - [ ] Screen reader tested and working
   - [ ] WCAG 2.1 AA compliant

4. **Documentation**
   - [ ] Accessibility statement published
   - [ ] Testing guide documented
   - [ ] All tests passing
   - [ ] Phase 4 completion report generated

---

## Risk Assessment

### Potential Blockers

**Risk 1: Recharts Color System Complexity**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Use useChartColors hook to read CSS variables at runtime
- **Contingency:** Create a ChartThemeProvider with hardcoded theme colors

**Risk 2: Lighthouse Score Below Target**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:** Iterative testing and fixes throughout Phase D
- **Contingency:** Extend Phase D timeline by 4-8 hours if needed

**Risk 3: Screen Reader Compatibility Issues**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:** Test early and often with VoiceOver and NVDA
- **Contingency:** Hire accessibility consultant for complex issues

**Risk 4: Performance Regression from Animations**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Use CSS transforms (GPU-accelerated), respect prefers-reduced-motion
- **Contingency:** Make animations optional via settings

---

## Next Steps

1. **Review and Approve Plan**
   - Stakeholder review of this document
   - Confirm timeline and resource allocation
   - Approve budget for any external tools/services

2. **Begin Phase A**
   - Create feature branch: `phase-4/critical-fixes`
   - Start with Task 1: Chart Color System
   - Daily standups to track progress

3. **Continuous Integration**
   - Run accessibility tests on every commit
   - Lighthouse CI in GitHub Actions
   - Visual regression tests (optional)

4. **Weekly Reviews**
   - End of Week 1: Review Phase A deliverables
   - End of Week 2: Review Phase B+C deliverables
   - End of Week 3: Review Phase D deliverables

---

**Document Status:** Ready for Implementation
**Owner:** Development Team
**Review Date:** After each phase completion
**Final Completion Target:** End of Week 3

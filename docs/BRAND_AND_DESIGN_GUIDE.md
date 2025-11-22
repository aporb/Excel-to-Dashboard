# Excel-to-Dashboard: Professional Design System Guide
## FAANG-Level Glassmorphic Design Implementation

**Document Version:** 2.0 (Complete Redesign)
**Last Updated:** January 2025
**Design Lead:** Senior FAANG Product Designer
**Status:** Ready for Implementation
**Target:** Modern, Professional, Accessible Dashboard Interface

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy & Principles](#design-philosophy--principles)
3. [Glassmorphic Design System](#glassmorphic-design-system)
4. [Color System (Muted Professional Palette)](#color-system-muted-professional-palette)
5. [Typography System](#typography-system)
6. [Spacing & Layout](#spacing--layout)
7. [Component Design Specifications](#component-design-specifications)
8. [Animation & Micro-interactions](#animation--micro-interactions)
9. [Accessibility Standards](#accessibility-standards)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Code Examples & Patterns](#code-examples--patterns)
12. [Performance Optimization](#performance-optimization)
13. [Design Quality Checklist](#design-quality-checklist)

---

## Executive Summary

### Current State Analysis

**Problems Identified:**
- ❌ Generic bright blue color scheme (HSL 221.2° 83.2% 53.3% - highly saturated)
- ❌ Flat, lifeless design without depth or visual hierarchy
- ❌ No glassmorphism despite modern design trends
- ❌ Standard shadcn/ui implementation with no customization
- ❌ Insufficient spacing and visual breathing room
- ❌ Basic animations without professional polish
- ❌ Not visually competitive with modern SaaS products

### Redesign Goals

**Target Aesthetic:**
- ✅ Professional glassmorphic design with depth and layers
- ✅ Muted, sophisticated color palette (max 15% saturation)
- ✅ Generous spacing for premium feel
- ✅ Smooth micro-interactions throughout
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Industry-leading visual quality (Linear, Vercel, Stripe level)

### Key Differentiators

1. **Glassmorphism**: Semi-transparent surfaces with backdrop blur for modern, premium aesthetic
2. **Muted Colors**: Professional slate/gray palette instead of generic blue
3. **Depth Layers**: Strategic use of shadows, glows, and z-index for visual hierarchy
4. **Micro-interactions**: Smooth transitions, hover effects, and loading states
5. **Typography**: Inter font with perfect fourth scale for clarity and hierarchy

---

## Design Philosophy & Principles

### 1. **Clarity Through Simplicity**

> "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."

- Every visual element must serve a purpose
- Remove decorative elements that don't enhance usability
- Use whitespace as a design element, not empty space
- Progressive disclosure: Show complexity only when needed

### 2. **Professional Restraint**

**Color Saturation Rule**: Maximum 15% saturation for brand colors
- Exceptions: Alert states (destructive, success) can go to 25%
- Charts: Use harmonious low-saturation palette for data
- Rationale: High saturation appears amateurish and unprofessional

**Animation Speed Rule**: 200-300ms for most transitions
- Faster (150ms): Small hover states, button clicks
- Slower (400-500ms): Page transitions, modal entrances
- Rationale: Perceived as responsive without feeling sluggish

### 3. **Depth Without Distraction**

Glassmorphism creates depth while maintaining focus:
- Background blur: 12-20px (sweet spot for performance and aesthetics)
- Transparency: 60-85% opacity (allows context without interference)
- Layering: Proper z-index hierarchy for visual flow
- Shadows: Subtle, multi-layered for realistic depth

### 4. **Accessibility First**

Not a checkbox, but a core design principle:
- Color contrast: 4.5:1 minimum (normal text), 3:1 (large text/UI)
- Focus indicators: Visible 2px ring on ALL interactive elements
- Keyboard navigation: Logical tab order, escape/enter functionality
- Motion sensitivity: Respect `prefers-reduced-motion`
- Screen readers: Semantic HTML, proper ARIA labels

### 5. **Performance Conscious Design**

Visual quality shouldn't sacrifice performance:
- Optimize backdrop-filter usage (expensive operation)
- Use CSS transforms (GPU-accelerated) for animations
- Minimize repaints and reflows
- Lazy load heavy components
- Provide fallbacks for unsupported browsers

---

## Glassmorphic Design System

### What is Glassmorphism?

Glassmorphism is a design trend characterized by:
1. **Background blur** (frosted glass effect)
2. **Semi-transparency** (see-through surfaces)
3. **Subtle borders** (often with light glow)
4. **Layered shadows** (for depth perception)
5. **Vibrant backgrounds** (to show through the glass)

### Core Glass Properties

```css
/* Base Glass Effect */
.glass {
  background: oklch(from var(--card) l c h / 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid oklch(1 0 0 / 0.18);
  box-shadow:
    0 8px 32px 0 oklch(0 0 0 / 0.08),
    inset 0 1px 0 0 oklch(1 0 0 / 0.15);
}

/* Dark Mode Variant */
.dark .glass {
  background: oklch(from var(--card) l c h / 0.6);
  border: 1px solid oklch(1 0 0 / 0.1);
  box-shadow:
    0 8px 32px 0 oklch(0 0 0 / 0.2),
    inset 0 1px 0 0 oklch(1 0 0 / 0.08);
}
```

### Glass Variants

#### 1. **Subtle Glass** (Tooltips, Popovers)
```css
.glass-subtle {
  background: oklch(from var(--card) l c h / 0.5);
  backdrop-filter: blur(8px) saturate(150%);
  border: 1px solid oklch(1 0 0 / 0.12);
  box-shadow: 0 4px 16px 0 oklch(0 0 0 / 0.05);
}
```

#### 2. **Standard Glass** (Cards, Panels)
```css
.glass-standard {
  background: oklch(from var(--card) l c h / 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid oklch(1 0 0 / 0.18);
  box-shadow:
    0 8px 32px 0 oklch(0 0 0 / 0.08),
    inset 0 1px 0 0 oklch(1 0 0 / 0.15);
}
```

#### 3. **Strong Glass** (Modals, Dialogs)
```css
.glass-strong {
  background: oklch(from var(--card) l c h / 0.85);
  backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid oklch(1 0 0 / 0.25);
  box-shadow:
    0 16px 48px 0 oklch(0 0 0 / 0.12),
    inset 0 2px 0 0 oklch(1 0 0 / 0.2);
}
```

#### 4. **Dark Glass** (Overlays)
```css
.glass-dark {
  background: oklch(0.2 0.01 250 / 0.8);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid oklch(1 0 0 / 0.08);
}
```

### Glass Hover States

```css
.glass-hover {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  background: oklch(from var(--card) l c h / 0.85);
  border-color: oklch(1 0 0 / 0.25);
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px 0 oklch(0 0 0 / 0.12),
    inset 0 1px 0 0 oklch(1 0 0 / 0.2);
}

.glass-hover:active {
  transform: translateY(0px);
  box-shadow:
    0 4px 16px 0 oklch(0 0 0 / 0.08),
    inset 0 1px 0 0 oklch(1 0 0 / 0.12);
}
```

### Glass Gradient Borders

For premium elevated feel:

```css
.glass-gradient-border {
  position: relative;
  background: oklch(from var(--card) l c h / 0.7);
  backdrop-filter: blur(12px);
}

.glass-gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    oklch(1 0 0 / 0.3),
    oklch(1 0 0 / 0.05)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Browser Support & Fallbacks

```css
/* Feature Detection */
@supports (backdrop-filter: blur(10px)) {
  .glass {
    backdrop-filter: blur(12px) saturate(180%);
  }
}

@supports not (backdrop-filter: blur(10px)) {
  .glass {
    background: oklch(from var(--card) l c h / 0.95);
  }
}

/* Low Power Mode Detection */
@media (prefers-reduced-motion: reduce) {
  .glass {
    backdrop-filter: none;
    background: oklch(from var(--card) l c h / 0.98);
  }
}
```

---

## Color System (Muted Professional Palette)

### Philosophy: Restrained Sophistication

**Core Principle**: Maximum 15% saturation for all brand colors
- Professional applications use muted tones, not vibrant colors
- High saturation = consumer/entertainment apps (Netflix, Spotify)
- Low saturation = professional/enterprise apps (Linear, Stripe, Notion)

### Light Mode Color Tokens

```css
:root {
  /* === BACKGROUNDS === */
  --background: oklch(0.98 0.005 220);           /* Almost white, subtle cool tint */
  --background-elevated: oklch(0.99 0.003 220);   /* Elevated surfaces */
  --background-subtle: oklch(0.96 0.007 220);     /* Recessed areas */

  /* === FOREGROUND === */
  --foreground: oklch(0.25 0.015 250);            /* Deep slate for text */
  --foreground-muted: oklch(0.5 0.012 250);       /* Secondary text */
  --foreground-subtle: oklch(0.65 0.01 250);      /* Tertiary text */

  /* === CARD/SURFACE === */
  --card: oklch(0.99 0.003 220);                  /* Card backgrounds */
  --card-foreground: oklch(0.25 0.015 250);       /* Card text */

  /* === PRIMARY (Muted Slate) === */
  --primary: oklch(0.45 0.08 240);                /* Muted slate - 8% saturation! */
  --primary-foreground: oklch(0.98 0.005 220);    /* Text on primary */
  --primary-hover: oklch(0.40 0.10 240);          /* Hover state */
  --primary-active: oklch(0.35 0.12 240);         /* Active state */

  /* === SECONDARY === */
  --secondary: oklch(0.92 0.01 240);              /* Very light gray */
  --secondary-foreground: oklch(0.25 0.015 250);  /* Text on secondary */

  /* === ACCENT (Strategic Teal) === */
  --accent: oklch(0.55 0.12 200);                 /* Muted teal - use sparingly */
  --accent-foreground: oklch(0.98 0.005 220);     /* Text on accent */

  /* === MUTED === */
  --muted: oklch(0.94 0.008 240);                 /* Whisper gray */
  --muted-foreground: oklch(0.5 0.012 250);       /* Muted text */

  /* === BORDERS === */
  --border: oklch(0.88 0.01 240);                 /* Standard borders */
  --border-subtle: oklch(0.93 0.008 240);         /* Subtle dividers */
  --border-strong: oklch(0.75 0.015 250);         /* Emphasized borders */

  /* === SEMANTIC COLORS === */
  --destructive: oklch(0.55 0.22 25);             /* Error red */
  --destructive-foreground: oklch(0.98 0.005 220);
  --success: oklch(0.60 0.15 160);                /* Success green */
  --success-foreground: oklch(0.98 0.005 220);
  --warning: oklch(0.75 0.18 85);                 /* Warning amber */
  --warning-foreground: oklch(0.25 0.015 250);
  --info: oklch(0.55 0.12 240);                   /* Info blue */
  --info-foreground: oklch(0.98 0.005 220);

  /* === GLASS SPECIFIC === */
  --glass-background: oklch(0.98 0.005 220 / 0.7);
  --glass-border: oklch(1 0 0 / 0.18);
  --glass-shadow: oklch(0.2 0.01 240 / 0.08);

  /* === CHART COLORS (Harmonious Palette) === */
  --chart-1: oklch(0.55 0.12 240);                /* Muted slate blue */
  --chart-2: oklch(0.60 0.10 200);                /* Muted teal */
  --chart-3: oklch(0.65 0.10 160);                /* Muted green */
  --chart-4: oklch(0.70 0.12 85);                 /* Muted amber */
  --chart-5: oklch(0.60 0.14 300);                /* Muted purple */

  /* === SPACING & RADIUS === */
  --radius: 0.75rem;                              /* 12px - modern rounded */
  --radius-sm: 0.5rem;
  --radius-md: 0.625rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-full: 9999px;
}
```

### Dark Mode Color Tokens

```css
.dark {
  /* === BACKGROUNDS === */
  --background: oklch(0.15 0.015 250);            /* True deep with blue tint */
  --background-elevated: oklch(0.18 0.018 250);   /* Elevated surfaces */
  --background-subtle: oklch(0.12 0.012 250);     /* Recessed areas */

  /* === FOREGROUND === */
  --foreground: oklch(0.95 0.005 220);            /* Off-white, warm */
  --foreground-muted: oklch(0.65 0.008 230);      /* Secondary text */
  --foreground-subtle: oklch(0.50 0.010 240);     /* Tertiary text */

  /* === CARD/SURFACE === */
  --card: oklch(0.22 0.02 250);                   /* Card backgrounds */
  --card-foreground: oklch(0.95 0.005 220);       /* Card text */

  /* === PRIMARY === */
  --primary: oklch(0.65 0.12 240);                /* Brighter slate for contrast */
  --primary-foreground: oklch(0.15 0.015 250);    /* Dark text on light primary */
  --primary-hover: oklch(0.70 0.14 240);          /* Hover state */
  --primary-active: oklch(0.75 0.16 240);         /* Active state */

  /* === SECONDARY === */
  --secondary: oklch(0.28 0.02 250);              /* Dark gray */
  --secondary-foreground: oklch(0.95 0.005 220);

  /* === ACCENT === */
  --accent: oklch(0.60 0.15 200);                 /* Brighter teal for dark mode */
  --accent-foreground: oklch(0.15 0.015 250);

  /* === MUTED === */
  --muted: oklch(0.25 0.018 250);                 /* Muted dark */
  --muted-foreground: oklch(0.65 0.008 230);

  /* === BORDERS === */
  --border: oklch(1 0 0 / 0.1);                   /* 10% white borders */
  --border-subtle: oklch(1 0 0 / 0.05);
  --border-strong: oklch(1 0 0 / 0.15);

  /* === SEMANTIC COLORS === */
  --destructive: oklch(0.60 0.20 25);
  --destructive-foreground: oklch(0.95 0.005 220);
  --success: oklch(0.65 0.14 160);
  --success-foreground: oklch(0.15 0.015 250);
  --warning: oklch(0.75 0.16 85);
  --warning-foreground: oklch(0.15 0.015 250);
  --info: oklch(0.60 0.14 240);
  --info-foreground: oklch(0.95 0.005 220);

  /* === GLASS SPECIFIC === */
  --glass-background: oklch(0.22 0.02 250 / 0.6);
  --glass-border: oklch(1 0 0 / 0.1);
  --glass-shadow: oklch(0 0 0 / 0.2);

  /* === CHART COLORS === */
  --chart-1: oklch(0.60 0.15 240);
  --chart-2: oklch(0.65 0.12 200);
  --chart-3: oklch(0.70 0.12 160);
  --chart-4: oklch(0.75 0.14 85);
  --chart-5: oklch(0.65 0.16 300);
}
```

### Color Usage Guidelines

| Color Token | Usage | Examples |
|-------------|-------|----------|
| `--primary` | Primary actions, links, selected states | CTA buttons, active nav items, links |
| `--accent` | Strategic highlights only | Limited to 1-2 elements per screen |
| `--muted` | Disabled states, placeholders | Disabled buttons, input placeholders |
| `--destructive` | Errors, deletions, warnings | Delete buttons, error messages |
| `--success` | Success states, confirmations | Success toasts, completed tasks |
| `--chart-*` | Data visualization | Charts, graphs, data points |

**Important Rules:**
1. Never use `--accent` as the main brand color
2. Limit accent color to maximum 3 elements per viewport
3. All interactive elements must have hover states
4. Focus states must use `--primary` with high contrast ring
5. Chart colors must be distinguishable in both light and dark modes

---

## Typography System

### Font Stack

```css
:root {
  /* Primary Font: Inter (Sans-serif) */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont,
               'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
               'Cantarell', 'Fira Sans', 'Droid Sans',
               'Helvetica Neue', sans-serif;

  /* Monospace Font: JetBrains Mono */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono',
               'Monaco', 'Inconsolata', 'Roboto Mono',
               'Courier New', monospace;

  /* Display Font: Inter (Same as sans for consistency) */
  --font-display: var(--font-sans);
}
```

**Font Loading:**
```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Type Scale (Perfect Fourth - 1.333 Ratio)

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px - Captions, metadata */
  --text-sm: 0.875rem;     /* 14px - Secondary text, labels */
  --text-base: 1rem;       /* 16px - Body text */
  --text-lg: 1.125rem;     /* 18px - Emphasized body */
  --text-xl: 1.333rem;     /* 21px - Card titles, subheadings */
  --text-2xl: 1.777rem;    /* 28px - Section headers */
  --text-3xl: 2.369rem;    /* 38px - Page titles */
  --text-4xl: 3.157rem;    /* 50px - Hero text */
  --text-5xl: 4.209rem;    /* 67px - Large hero */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.75;

  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Typography Classes

```css
/* Headings */
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

.heading-4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

/* Body Text */
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
}

.body-base {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Utility Text */
.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--foreground-muted);
}

.code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--muted);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}
```

### Typography Usage Matrix

| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| Hero Title | 4xl | 700 | 1.25 | Landing page hero |
| Page Title | 3xl | 700 | 1.25 | Dashboard page title |
| Section Header | 2xl | 600 | 1.375 | Major sections |
| Card Title | xl | 600 | 1.375 | Card headers, widget titles |
| Subheading | lg | 500 | 1.5 | Subsections |
| Body | base | 400 | 1.5 | Paragraph text |
| Small Text | sm | 400 | 1.5 | Secondary info, descriptions |
| Label | sm | 500 | 1.5 | Form labels, badges |
| Caption | xs | 400 | 1.5 | Metadata, timestamps |

---

## Spacing & Layout

### Spacing Scale (8px Base Unit)

```css
:root {
  --space-0: 0px;
  --space-0_5: 4px;    /* 0.5 unit - Micro spacing */
  --space-1: 8px;      /* 1 unit - Tight */
  --space-2: 16px;     /* 2 units - Base */
  --space-3: 24px;     /* 3 units - Comfortable */
  --space-4: 32px;     /* 4 units - Spacious */
  --space-5: 40px;     /* 5 units */
  --space-6: 48px;     /* 6 units - Section spacing */
  --space-8: 64px;     /* 8 units - Large gaps */
  --space-10: 80px;    /* 10 units */
  --space-12: 96px;    /* 12 units - Hero spacing */
  --space-16: 128px;   /* 16 units - Page sections */
  --space-20: 160px;   /* 20 units - Major divisions */
  --space-24: 192px;   /* 24 units - Largest spacing */
}
```

### Component Spacing Guidelines

**Card Internal Padding:**
- Small cards: `--space-4` (32px)
- Medium cards: `--space-6` (48px)
- Large cards: `--space-8` (64px)

**Section Spacing:**
- Between related elements: `--space-2` to `--space-3` (16-24px)
- Between sections: `--space-8` to `--space-12` (64-96px)
- Page margins: `--space-6` to `--space-8` (48-64px)

**Form Spacing:**
- Between form fields: `--space-4` (32px)
- Label to input: `--space-1` (8px)
- Field to helper text: `--space-1` (8px)
- Form sections: `--space-6` (48px)

### Container System

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

### Grid System

```css
/* Dashboard Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  padding: var(--space-6);
}

/* Responsive Grid */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }
}

/* Grid Span Utilities */
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-6 { grid-column: span 6; }
.col-span-12 { grid-column: span 12; }

@media (max-width: 768px) {
  .col-span-3,
  .col-span-4,
  .col-span-6 {
    grid-column: span 12;
  }
}
```

---

## Component Design Specifications

### 1. FileUploadZone

**Current State**: Basic dashed border, flat background
**New Design**: Glassmorphic card with animated interactions

#### Visual Specifications

```tsx
// FileUploadZone.tsx - Enhanced Design
"use client"

import * as React from "react"
import { Upload, FileSpreadsheet, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  disabled?: boolean
  isUploading?: boolean
  uploadProgress?: number
}

export function FileUploadZone({
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  disabled = false,
  isUploading = false,
  uploadProgress = 0
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // ... handlers ...

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        /* Base Glass Styling */
        "relative overflow-hidden",
        "glass-standard glass-hover",
        "rounded-xl p-12",
        "text-center cursor-pointer",
        "transition-all duration-300 ease-out",

        /* Gradient Border on Drag */
        isDragging && [
          "glass-gradient-border",
          "scale-[1.02]",
        ],

        /* States */
        !isDragging && "hover:scale-[1.01]",
        disabled && "opacity-50 cursor-not-allowed",
        isUploading && "pointer-events-none"
      )}
    >
      {/* Animated Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br from-accent/10 via-transparent to-primary/10",
          isDragging && "opacity-100"
        )}
      />

      {/* Floating Particles (optional decoration) */}
      {isDragging && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Icon Container */}
        <div
          className={cn(
            "relative h-20 w-20 rounded-full",
            "glass-subtle",
            "flex items-center justify-center",
            "transition-all duration-300",
            isDragging && "scale-110 rotate-6"
          )}
        >
          {/* Icon Glow Effect */}
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-0 transition-opacity duration-300",
              "bg-gradient-to-br from-primary/40 to-accent/40",
              isDragging && "opacity-100 animate-pulse-subtle"
            )}
          />

          {isUploading ? (
            <div className="relative">
              {/* Progress Circle */}
              <svg className="h-10 w-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - uploadProgress / 100)}`}
                  className="text-primary transition-all duration-300"
                />
              </svg>
            </div>
          ) : isDragging ? (
            <FileSpreadsheet className="h-10 w-10 text-primary transition-transform duration-300" />
          ) : (
            <Upload className="h-10 w-10 text-primary transition-transform duration-300" />
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <p className="text-xl font-semibold text-foreground">
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : isDragging
                ? "Drop your file here"
                : "Upload your spreadsheet"}
          </p>
          {!isUploading && (
            <>
              <p className="text-sm text-foreground-muted">
                Drag and drop or click to browse
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-foreground-subtle">
                <div className="h-1 w-1 rounded-full bg-foreground-subtle" />
                <span>Supports CSV, Excel (.xlsx, .xls)</span>
                <div className="h-1 w-1 rounded-full bg-foreground-subtle" />
                <span>Max 10MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  )
}
```

#### CSS Additions for FileUploadZone

```css
/* Floating Particle Animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

---

### 2. Dashboard Cards

**Current State**: Solid backgrounds, flat design
**New Design**: Glassmorphic elevated surfaces

#### Card Component Specification

```tsx
// components/ui/card.tsx - Enhanced with Glass Variant
import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glass-strong'
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300",
          {
            /* Default Variant */
            'default': "bg-card border border-border shadow-md",

            /* Glass Variant */
            'glass': [
              "glass-standard",
              hoverable && "glass-hover"
            ],

            /* Strong Glass (Modals) */
            'glass-strong': "glass-strong"
          }[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 p-6 pb-4",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight",
      "text-foreground",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-foreground-muted",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-4", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-4",
      "border-t border-border-subtle",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

#### Usage Example

```tsx
// Dashboard Page - Using Glass Cards
<Card variant="glass" hoverable>
  <CardHeader>
    <CardTitle>Upload Analytics</CardTitle>
    <CardDescription>Last 30 days performance</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Chart content */}
  </CardContent>
</Card>
```

---

### 3. Navigation Header

**Current State**: Standard header bar
**New Design**: Fixed glass navbar with scroll-based blur

#### Header Component

```tsx
// components/Header.tsx - Glassmorphic Navigation
"use client"

import * as React from "react"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SettingsDialog } from "@/components/SettingsDialog"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        /* Fixed Positioning */
        "fixed top-0 left-0 right-0 z-50",

        /* Glass Effect */
        "transition-all duration-300",

        /* Default State */
        !isScrolled && [
          "bg-background/60",
          "backdrop-blur-sm",
          "border-b border-transparent"
        ],

        /* Scrolled State */
        isScrolled && [
          "glass-standard",
          "border-b border-border-subtle",
          "shadow-lg"
        ]
      )}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            {/* Logo Glow */}
            <div className="relative">
              <div
                className={cn(
                  "absolute inset-0 blur-lg opacity-0 transition-opacity duration-300",
                  "bg-primary/40",
                  "group-hover:opacity-100"
                )}
              />
              <BarChart3 className="relative h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Excel-to-Dashboard
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-foreground-muted hover:text-foreground transition-colors duration-200"
            >
              Docs
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <SettingsDialog />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Frosted Bottom Edge */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      )}
    </header>
  )
}
```

---

### 4. Button Component

**Current State**: Solid color fills
**New Design**: Glass buttons with interactive states

#### Button Variants

```tsx
// components/ui/button.tsx - Enhanced with Glass Variants
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  /* Base Styles */
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /* Default Solid */
        default: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-md hover:shadow-lg",

        /* Glass Primary */
        glass: [
          "glass-standard",
          "text-foreground",
          "hover:glass-hover",
          "shadow-md hover:shadow-xl",
          "border border-border",
        ],

        /* Glass with Gradient Overlay */
        "glass-gradient": [
          "relative overflow-hidden",
          "glass-standard",
          "text-foreground",
          "hover:glass-hover",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-br before:from-primary/20 before:to-accent/20",
          "before:opacity-0 hover:before:opacity-100",
          "before:transition-opacity before:duration-300",
        ],

        /* Outline */
        outline: "border border-border bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground",

        /* Ghost */
        ghost: "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm",

        /* Destructive Glass */
        "destructive-glass": [
          "glass-standard",
          "text-destructive",
          "border border-destructive/30",
          "hover:bg-destructive/10",
          "hover:border-destructive/50",
        ],

        /* Link */
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          loading && "relative text-transparent hover:text-transparent pointer-events-none"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Button Usage Examples

```tsx
{/* Glass Primary Button */}
<Button variant="glass" size="lg">
  Get Started
</Button>

{/* Glass Gradient Button (CTA) */}
<Button variant="glass-gradient" size="xl">
  Upload Spreadsheet
</Button>

{/* Loading State */}
<Button variant="glass" loading>
  Processing...
</Button>

{/* Destructive Glass */}
<Button variant="destructive-glass">
  Delete Dashboard
</Button>
```

---

### 5. Chart Containers

**Current State**: Basic recharts with default styling
**New Design**: Glass containers with enhanced visuals

#### Chart Wrapper Component

```tsx
// components/charts/ChartContainer.tsx
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChartContainerProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function ChartContainer({
  title,
  description,
  icon,
  children,
  className,
  actions
}: ChartContainerProps) {
  return (
    <Card variant="glass" hoverable className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="glass-subtle p-2.5 rounded-lg">
                {icon}
              </div>
            )}
            <div className="space-y-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Gradient Overlay at top of chart area */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <div className="pt-6">
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Enhanced Chart Styling

```css
/* Chart Customizations */
.recharts-wrapper {
  /* Ensure charts use theme colors */
  --chart-grid: var(--border-subtle);
  --chart-text: var(--foreground-muted);
}

/* Grid Lines */
.recharts-cartesian-grid line {
  stroke: var(--chart-grid);
  stroke-opacity: 0.3;
  stroke-dasharray: 4 4;
}

/* Axis */
.recharts-cartesian-axis-tick text {
  fill: var(--chart-text);
  font-size: var(--text-xs);
  font-family: var(--font-sans);
}

/* Tooltips */
.recharts-default-tooltip {
  @apply glass-strong rounded-lg shadow-xl !important;
  border: 1px solid var(--border) !important;
  padding: var(--space-3) !important;
}

.recharts-tooltip-label {
  @apply text-sm font-semibold text-foreground mb-2;
}

.recharts-tooltip-item {
  @apply text-sm text-foreground-muted !important;
}

/* Chart Lines/Areas with Gradients */
.chart-line-gradient {
  stroke: url(#lineGradient);
  stroke-width: 2.5;
  filter: drop-shadow(0 2px 4px oklch(from var(--primary) l c h / 0.3));
}

.chart-area-gradient {
  fill: url(#areaGradient);
}
```

#### Gradient Definitions for Charts

```tsx
// In Chart Components - Add SVG Gradients
<svg style={{ height: 0, width: 0, position: 'absolute' }}>
  <defs>
    {/* Line Gradient */}
    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor="var(--chart-1)" />
      <stop offset="50%" stopColor="var(--chart-2)" />
      <stop offset="100%" stopColor="var(--chart-3)" />
    </linearGradient>

    {/* Area Gradient */}
    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.4" />
      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.05" />
    </linearGradient>
  </defs>
</svg>
```

---

## Animation & Micro-interactions

### Animation Principles

1. **Purpose-Driven**: Every animation must serve a purpose (feedback, guidance, delight)
2. **Subtle & Fast**: 200-300ms for most interactions
3. **Easing Functions**: Use cubic-bezier for natural motion
4. **Respect Accessibility**: Honor `prefers-reduced-motion`

### Core Animation Keyframes

```css
/* === ENTRANCE ANIMATIONS === */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* === LOADING ANIMATIONS === */

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 oklch(from var(--primary) l c h / 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px oklch(from var(--primary) l c h / 0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* === MICRO-INTERACTIONS === */

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* === BLUR TRANSITIONS === */

@keyframes blurIn {
  from {
    filter: blur(10px);
    opacity: 0;
  }
  to {
    filter: blur(0);
    opacity: 1;
  }
}

@keyframes glassAppear {
  from {
    backdrop-filter: blur(0px);
    opacity: 0;
  }
  to {
    backdrop-filter: blur(12px);
    opacity: 1;
  }
}
```

### Animation Utility Classes

```css
/* Entrance Animations */
.animate-fade-in-up {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade-in-down {
  animation: fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-left {
  animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-right {
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Loading States */
.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    90deg,
    oklch(from var(--muted) l c h) 0%,
    oklch(from var(--muted-foreground) l c h / 0.2) 50%,
    oklch(from var(--muted) l c h) 100%
  );
  background-size: 1000px 100%;
}

.animate-pulse-glow {
  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Micro-interactions */
.animate-wiggle {
  animation: wiggle 0.5s ease-in-out;
}

.animate-bounce-subtle {
  animation: bounce-subtle 1s ease-in-out infinite;
}

/* Glass Specific */
.animate-glass-appear {
  animation: glassAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-blur-in {
  animation: blurIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Hover Effects

```css
/* Lift on Hover */
.hover-lift {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 40px 0 oklch(0 0 0 / 0.12),
    inset 0 1px 0 0 oklch(1 0 0 / 0.2);
}

/* Glow on Hover */
.hover-glow {
  position: relative;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    oklch(from var(--primary) l c h / 0.3),
    oklch(from var(--accent) l c h / 0.3)
  );
  opacity: 0;
  filter: blur(10px);
  transition: opacity 300ms ease;
  z-index: -1;
}

.hover-glow:hover::before {
  opacity: 1;
}

/* Scale on Hover */
.hover-scale {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Border Glow on Hover */
.hover-border-glow {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-border-glow:hover {
  border-color: oklch(from var(--primary) l c h / 0.5);
  box-shadow: 0 0 0 1px oklch(from var(--primary) l c h / 0.3);
}
```

### Focus States

```css
/* Accessible Focus Ring */
.focus-ring {
  outline: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.focus-ring:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px oklch(from var(--primary) l c h / 0.2);
}

/* Glass Focus State */
.focus-glass {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.focus-glass:focus-visible {
  background: oklch(from var(--card) l c h / 0.9);
  border-color: var(--primary);
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Loading Skeleton

```css
.skeleton {
  position: relative;
  overflow: hidden;
  background: var(--muted);
  border-radius: var(--radius);
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    oklch(from var(--background) l c h / 0.5),
    transparent
  );
  animation: shimmer 2s infinite;
}

/* Skeleton Variants */
.skeleton-text {
  height: 1rem;
  width: 100%;
}

.skeleton-title {
  height: 1.5rem;
  width: 60%;
}

.skeleton-avatar {
  height: 3rem;
  width: 3rem;
  border-radius: var(--radius-full);
}

.skeleton-card {
  height: 12rem;
  width: 100%;
}
```

### Page Transitions

```tsx
// Use with framer-motion or CSS
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}
```

### Stagger Children Animation

```css
/* Stagger Animation for Lists */
.stagger-container > * {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.stagger-container > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-container > *:nth-child(2) { animation-delay: 0.1s; }
.stagger-container > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-container > *:nth-child(4) { animation-delay: 0.2s; }
.stagger-container > *:nth-child(5) { animation-delay: 0.25s; }
.stagger-container > *:nth-child(6) { animation-delay: 0.3s; }
.stagger-container > *:nth-child(7) { animation-delay: 0.35s; }
.stagger-container > *:nth-child(8) { animation-delay: 0.4s; }
```

### Reduced Motion Support

```css
/* Respect User Preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .glass,
  .glass-standard,
  .glass-strong,
  .glass-subtle {
    backdrop-filter: none !important;
    background: oklch(from var(--card) l c h / 0.98) !important;
  }
}
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### 1. Color Contrast Requirements

**Minimum Ratios:**
- Normal text (< 18px): 4.5:1
- Large text (≥ 18px or ≥ 14px bold): 3:1
- UI components and graphics: 3:1

**Testing:**
```bash
# Install contrast checker
npm install --save-dev axe-core

# Or use online tools
# - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
# - Contrast Ratio: https://contrast-ratio.com/
```

**Validation Process:**
1. Test all text/background combinations
2. Test glassmorphic surfaces (ensure blur doesn't reduce contrast)
3. Test hover/focus states
4. Test both light and dark modes
5. Document any exceptions with rationale

#### 2. Focus Indicators

**Requirements:**
- Visible on ALL interactive elements
- Minimum 2px outline
- High contrast color (use `--primary`)
- Offset from element (2px minimum)
- Never remove `:focus` styles

**Implementation:**
```css
/* Global Focus Styles */
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Focus Ring with Glass Effect */
.focus-ring-glass:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  box-shadow:
    0 0 0 4px oklch(from var(--primary) l c h / 0.2),
    0 0 0 6px oklch(from var(--primary) l c h / 0.1);
}
```

#### 3. Keyboard Navigation

**Required Functionality:**
- Tab: Move forward through interactive elements
- Shift+Tab: Move backward
- Enter: Activate buttons, submit forms
- Space: Toggle checkboxes, activate buttons
- Escape: Close modals, cancel actions
- Arrow Keys: Navigate within components (select, tabs)

**Tab Order:**
```tsx
// Ensure logical tab order
<form>
  <input tabIndex={1} /> {/* First */}
  <input tabIndex={2} /> {/* Second */}
  <button tabIndex={3}>Submit</button> {/* Third */}
</form>

// Or use natural DOM order (preferred)
<form>
  <input /> {/* Tab order follows DOM */}
  <input />
  <button>Submit</button>
</form>
```

**Focus Trap (Modals):**
```tsx
// Use focus-trap-react or manually manage
import FocusTrap from 'focus-trap-react'

function Modal({ onClose, children }) {
  return (
    <FocusTrap>
      <div role="dialog" aria-modal="true">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </FocusTrap>
  )
}
```

#### 4. Screen Reader Support

**Semantic HTML:**
```tsx
// ✅ Good: Semantic elements
<header>
  <nav>
    <button>Menu</button>
  </nav>
</header>
<main>
  <section aria-labelledby="dashboard-title">
    <h1 id="dashboard-title">Dashboard</h1>
  </section>
</main>
<footer>
  <p>© 2025</p>
</footer>

// ❌ Bad: Generic divs
<div className="header">
  <div className="nav">
    <div onClick={handleClick}>Menu</div>
  </div>
</div>
```

**ARIA Labels:**
```tsx
// Icon-only buttons
<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>

// Form inputs
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-describedby="email-hint"
  aria-invalid={errors.email ? 'true' : 'false'}
/>
<span id="email-hint">We'll never share your email</span>

// Loading states
<button disabled aria-busy="true">
  <Loader2 className="animate-spin" />
  <span className="sr-only">Loading...</span>
</button>

// Status messages
<div role="status" aria-live="polite">
  File uploaded successfully
</div>
```

**Hidden Text for Context:**
```css
/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
// Usage
<button>
  <TrashIcon />
  <span className="sr-only">Delete item</span>
</button>
```

#### 5. Motion & Animation

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable decorative animations */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Remove blur effects */
  .glass,
  .glass-standard,
  .glass-strong {
    backdrop-filter: none !important;
  }

  /* Instant scrolling */
  html {
    scroll-behavior: auto !important;
  }
}
```

**Animation Guidelines:**
- Essential animations (loading indicators): Keep but reduce duration
- Decorative animations (parallax, floating): Remove completely
- Transitions: Reduce to near-instant (10ms)
- Respect user choice: Never override `prefers-reduced-motion`

#### 6. Touch Targets

**Minimum Size:**
- Touch targets: 44x44px minimum (iOS) / 48x48px (Android)
- Spacing between targets: 8px minimum

```css
/* Ensure adequate touch target size */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-2);
}

/* Add invisible padding for small icons */
.icon-button {
  position: relative;
  padding: var(--space-2);
}

.icon-button::before {
  content: '';
  position: absolute;
  inset: -8px;
  /* Expands clickable area */
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Goal**: Establish core design system and infrastructure

#### Tasks:
1. **Update Global CSS** (Day 1-2)
   - [ ] Replace color tokens with muted palette
   - [ ] Add glassmorphism utility classes
   - [ ] Update typography scale
   - [ ] Add animation keyframes
   - [ ] Test light/dark mode transitions

2. **Font Integration** (Day 2)
   - [ ] Install Inter and JetBrains Mono via next/font
   - [ ] Configure font variables
   - [ ] Test font loading performance
   - [ ] Add font-display: swap for performance

3. **Browser Compatibility** (Day 3)
   - [ ] Test backdrop-filter support
   - [ ] Add @supports fallbacks
   - [ ] Test in Safari, Chrome, Firefox, Edge
   - [ ] Document unsupported browsers

4. **Accessibility Baseline** (Day 4-5)
   - [ ] Audit color contrast ratios
   - [ ] Add focus-visible styles
   - [ ] Test keyboard navigation
   - [ ] Add prefers-reduced-motion support
   - [ ] Run axe-core accessibility tests

**Deliverables:**
- ✅ Updated `globals.css` with new design system
- ✅ Font integration working
- ✅ Browser compatibility matrix
- ✅ Accessibility audit report

---

### Phase 2: Core Components (Week 2-3)

**Goal**: Redesign essential UI components with glassmorphism

#### Tasks:
1. **Button Component** (Day 6-7)
   - [ ] Add glass variant
   - [ ] Add glass-gradient variant
   - [ ] Implement loading states with shimmer
   - [ ] Add ripple effect on click
   - [ ] Test all size variants
   - [ ] Accessibility review

2. **Card Component** (Day 8-9)
   - [ ] Add glass variant prop
   - [ ] Implement hover effects
   - [ ] Add gradient border option
   - [ ] Test nested cards
   - [ ] Performance test with many cards

3. **Input Components** (Day 10-11)
   - [ ] Input field with glass styling
   - [ ] Select dropdown with glass
   - [ ] Textarea with glass
   - [ ] Focus states with glow
   - [ ] Error states
   - [ ] Disabled states

4. **Dialog/Modal** (Day 12-13)
   - [ ] Strong glass variant
   - [ ] Backdrop blur overlay
   - [ ] Focus trap implementation
   - [ ] Escape key handler
   - [ ] Entrance/exit animations
   - [ ] Accessibility testing

5. **Navigation** (Day 14-15)
   - [ ] Header with scroll-based blur
   - [ ] Logo glow effect
   - [ ] Navigation links hover states
   - [ ] Mobile responsive menu
   - [ ] Sticky positioning

**Deliverables:**
- ✅ 5+ core components with glass variants
- ✅ Storybook documentation (optional)
- ✅ Component usage examples
- ✅ Accessibility compliance for all components

---

### Phase 3: Feature Components (Week 3-4)

**Goal**: Apply design system to application-specific components

#### Tasks:
1. **FileUploadZone** (Day 16-17)
   - [ ] Glass container with gradient border
   - [ ] Animated drag-over state
   - [ ] Floating particle effects
   - [ ] Progress indicator with gradient
   - [ ] Icon transitions
   - [ ] Success/error states

2. **Dashboard Grid** (Day 18-19)
   - [ ] Responsive grid layout
   - [ ] Card spacing optimization
   - [ ] Stagger animation on load
   - [ ] Empty state design
   - [ ] Loading skeleton screens

3. **Chart Components** (Day 20-22)
   - [ ] Glass chart containers
   - [ ] Gradient chart fills
   - [ ] Enhanced tooltips with glass
   - [ ] Axis styling improvements
   - [ ] Grid line opacity
   - [ ] Color palette application
   - [ ] Responsive chart sizing

4. **Data Table** (Day 23-24)
   - [ ] Glass table container
   - [ ] Row hover effects
   - [ ] Alternating row backgrounds (subtle)
   - [ ] Sticky header
   - [ ] Sort indicators
   - [ ] Pagination controls

5. **Alert Components** (Day 25-26)
   - [ ] Alert cards with glass
   - [ ] Toast notifications
   - [ ] Alert history list
   - [ ] Templates with glass cards

**Deliverables:**
- ✅ All feature components redesigned
- ✅ Dashboard fully updated
- ✅ Charts with new visual style
- ✅ Responsive design verified

---

### Phase 4: Polish & Optimization (Week 4-5)

**Goal**: Refine details, optimize performance, finalize accessibility

#### Tasks:
1. **Micro-interactions** (Day 27-28)
   - [ ] Button ripple effects
   - [ ] Hover state refinements
   - [ ] Loading state animations
   - [ ] Success/error micro-animations
   - [ ] Transition timing adjustments

2. **Performance Optimization** (Day 29-30)
   - [ ] Reduce backdrop-filter usage where possible
   - [ ] Optimize animation performance
   - [ ] Lazy load heavy components
   - [ ] Bundle size analysis
   - [ ] Lighthouse performance audit

3. **Cross-Browser Testing** (Day 31-32)
   - [ ] Safari (macOS/iOS)
   - [ ] Chrome (Windows/Mac/Android)
   - [ ] Firefox (Windows/Mac)
   - [ ] Edge (Windows)
   - [ ] Document browser-specific issues
   - [ ] Add polyfills if needed

4. **Final Accessibility Audit** (Day 33-34)
   - [ ] Run axe-core on all pages
   - [ ] Manual screen reader testing (NVDA/JAWS)
   - [ ] Keyboard navigation flow testing
   - [ ] Color contrast verification
   - [ ] Focus indicator review
   - [ ] Generate WCAG compliance report

5. **Documentation** (Day 35)
   - [ ] Update component documentation
   - [ ] Create design system style guide
   - [ ] Document color usage
   - [ ] Document animation guidelines
   - [ ] Create accessibility checklist

**Deliverables:**
- ✅ Performance optimized application
- ✅ Cross-browser compatibility verified
- ✅ WCAG 2.1 AA compliance achieved
- ✅ Complete design system documentation

---

## Code Examples & Patterns

### Complete globals.css Template

```css
/* /app/globals.css */
@import "tailwindcss";
@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

/* ========================================
   DESIGN TOKENS - LIGHT MODE
   ======================================== */
:root {
  /* Colors */
  --background: oklch(0.98 0.005 220);
  --foreground: oklch(0.25 0.015 250);
  --card: oklch(0.99 0.003 220);
  --card-foreground: oklch(0.25 0.015 250);
  --primary: oklch(0.45 0.08 240);
  --primary-foreground: oklch(0.98 0.005 220);
  --secondary: oklch(0.92 0.01 240);
  --secondary-foreground: oklch(0.25 0.015 250);
  --accent: oklch(0.55 0.12 200);
  --accent-foreground: oklch(0.98 0.005 220);
  --muted: oklch(0.94 0.008 240);
  --muted-foreground: oklch(0.5 0.012 250);
  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.98 0.005 220);
  --border: oklch(0.88 0.01 240);
  --input: oklch(0.88 0.01 240);
  --ring: oklch(0.45 0.08 240);

  /* Chart Colors */
  --chart-1: oklch(0.55 0.12 240);
  --chart-2: oklch(0.60 0.10 200);
  --chart-3: oklch(0.65 0.10 160);
  --chart-4: oklch(0.70 0.12 85);
  --chart-5: oklch(0.60 0.14 300);

  /* Glass */
  --glass-bg: oklch(0.98 0.005 220 / 0.7);
  --glass-border: oklch(1 0 0 / 0.18);

  /* Spacing & Radius */
  --radius: 0.75rem;
  --space-unit: 8px;
}

/* ========================================
   DESIGN TOKENS - DARK MODE
   ======================================== */
.dark {
  --background: oklch(0.15 0.015 250);
  --foreground: oklch(0.95 0.005 220);
  --card: oklch(0.22 0.02 250);
  --card-foreground: oklch(0.95 0.005 220);
  --primary: oklch(0.65 0.12 240);
  --primary-foreground: oklch(0.15 0.015 250);
  --secondary: oklch(0.28 0.02 250);
  --secondary-foreground: oklch(0.95 0.005 220);
  --accent: oklch(0.60 0.15 200);
  --accent-foreground: oklch(0.15 0.015 250);
  --muted: oklch(0.25 0.018 250);
  --muted-foreground: oklch(0.65 0.008 230);
  --destructive: oklch(0.60 0.20 25);
  --destructive-foreground: oklch(0.95 0.005 220);
  --border: oklch(1 0 0 / 0.1);
  --input: oklch(1 0 0 / 0.15);
  --ring: oklch(0.65 0.12 240);

  --chart-1: oklch(0.60 0.15 240);
  --chart-2: oklch(0.65 0.12 200);
  --chart-3: oklch(0.70 0.12 160);
  --chart-4: oklch(0.75 0.14 85);
  --chart-5: oklch(0.65 0.16 300);

  --glass-bg: oklch(0.22 0.02 250 / 0.6);
  --glass-border: oklch(1 0 0 / 0.1);
}

/* ========================================
   BASE STYLES
   ======================================== */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }
}

/* ========================================
   GLASSMORPHISM UTILITIES
   ======================================== */
@layer utilities {
  /* Base Glass Effect */
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid var(--glass-border);
    box-shadow:
      0 8px 32px 0 oklch(0 0 0 / 0.08),
      inset 0 1px 0 0 oklch(1 0 0 / 0.15);
  }

  .glass-standard {
    @apply glass;
  }

  .glass-subtle {
    background: oklch(from var(--card) l c h / 0.5);
    backdrop-filter: blur(8px) saturate(150%);
    border: 1px solid oklch(1 0 0 / 0.12);
    box-shadow: 0 4px 16px 0 oklch(0 0 0 / 0.05);
  }

  .glass-strong {
    background: oklch(from var(--card) l c h / 0.85);
    backdrop-filter: blur(20px) saturate(200%);
    border: 1px solid oklch(1 0 0 / 0.25);
    box-shadow:
      0 16px 48px 0 oklch(0 0 0 / 0.12),
      inset 0 2px 0 0 oklch(1 0 0 / 0.2);
  }

  .glass-hover {
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass-hover:hover {
    background: oklch(from var(--card) l c h / 0.85);
    border-color: oklch(1 0 0 / 0.25);
    transform: translateY(-2px);
    box-shadow:
      0 12px 40px 0 oklch(0 0 0 / 0.12),
      inset 0 1px 0 0 oklch(1 0 0 / 0.2);
  }

  /* Gradient Border */
  .glass-gradient-border {
    position: relative;
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
  }

  .glass-gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      135deg,
      oklch(1 0 0 / 0.3),
      oklch(1 0 0 / 0.05)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
}

/* ========================================
   ANIMATIONS
   ======================================== */
@layer utilities {
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 oklch(from var(--primary) l c h / 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px oklch(from var(--primary) l c h / 0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(
      90deg,
      oklch(from var(--muted) l c h) 0%,
      oklch(from var(--muted-foreground) l c h / 0.2) 50%,
      oklch(from var(--muted) l c h) 100%
    );
    background-size: 1000px 100%;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}

/* ========================================
   ACCESSIBILITY
   ======================================== */
@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .focus-ring:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    box-shadow: 0 0 0 4px oklch(from var(--primary) l c h / 0.2);
  }
}

/* ========================================
   REDUCED MOTION
   ======================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .glass,
  .glass-standard,
  .glass-strong,
  .glass-subtle {
    backdrop-filter: none !important;
    background: oklch(from var(--card) l c h / 0.98) !important;
  }
}

/* ========================================
   BROWSER FALLBACKS
   ======================================== */
@supports not (backdrop-filter: blur(10px)) {
  .glass,
  .glass-standard,
  .glass-strong,
  .glass-subtle {
    background: oklch(from var(--card) l c h / 0.95) !important;
  }
}
```

---

## Performance Optimization

### 1. Backdrop Filter Optimization

**Problem**: `backdrop-filter` is GPU-intensive

**Solutions:**
```css
/* Limit blur usage */
.glass {
  /* Use will-change sparingly */
  will-change: backdrop-filter;
}

/* Remove on scroll for better performance */
@media (hover: none) {
  .glass-hover:hover {
    backdrop-filter: blur(10px); /* Reduce blur on mobile */
  }
}

/* Disable on low-power devices */
@media (prefers-reduced-motion: reduce) {
  .glass {
    backdrop-filter: none;
    background: solid fallback;
  }
}
```

### 2. Animation Performance

**Use GPU-Accelerated Properties:**
```css
/* ✅ Good: GPU-accelerated */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ Bad: Forces repaint */
.animated {
  left: 100px;
  background-color: red;
}
```

**Composite Layers:**
```css
/* Force GPU layer */
.animated-element {
  will-change: transform;
  transform: translateZ(0); /* Force 3D context */
}

/* Remove will-change after animation */
.animated-element.done {
  will-change: auto;
}
```

### 3. Bundle Size Optimization

**Tree-shake unused code:**
```tsx
// ✅ Import only what you need
import { Button } from '@/components/ui/button'

// ❌ Don't import entire library
import * as UI from '@/components/ui'
```

**Lazy load heavy components:**
```tsx
import dynamic from 'next/dynamic'

const ChartWidget = dynamic(() => import('@/components/ChartWidget'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

### 4. Font Loading Strategy

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap', // Prevent FOIT
  preload: true,
  fallback: ['system-ui', 'arial']
})
```

### 5. Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/hero.png"
  alt="Dashboard"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur" // Blur placeholder
  quality={85} // Reduce if acceptable
/>
```

---

## Design Quality Checklist

### Visual Design
- [ ] All colors from approved palette (max 15% saturation)
- [ ] Glassmorphism applied to cards and surfaces
- [ ] Consistent border radius (0.75rem default)
- [ ] Proper spacing (8px base unit)
- [ ] Typography scale implemented
- [ ] Light and dark modes tested
- [ ] Hover states on all interactive elements
- [ ] Loading states with shimmer/skeleton
- [ ] Empty states designed
- [ ] Error states designed

### Accessibility
- [ ] Color contrast ratios meet WCAG 2.1 AA (4.5:1)
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works throughout
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] ARIA labels on icon-only buttons
- [ ] Semantic HTML used
- [ ] Forms have associated labels
- [ ] Modals trap focus correctly
- [ ] Skip links provided
- [ ] Reduced motion respected

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Backdrop-filter usage minimized
- [ ] Images optimized and lazy loaded
- [ ] Fonts use display: swap
- [ ] Bundle size < 200KB (gzipped)
- [ ] No layout shifts (CLS < 0.1)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android)
- [ ] Fallbacks for unsupported features

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No console errors
- [ ] Components documented
- [ ] Prop types defined
- [ ] Reusable patterns extracted
- [ ] No hardcoded values
- [ ] CSS variables used for theming
- [ ] Responsive breakpoints tested

---

## Conclusion

This design system provides a comprehensive foundation for building a modern, professional, accessible dashboard application with glassmorphic aesthetics and muted color palette.

**Key Takeaways:**
1. **Muted Colors**: Maximum 15% saturation for professional feel
2. **Glassmorphism**: Semi-transparent surfaces with backdrop blur
3. **Accessibility**: WCAG 2.1 AA compliance is non-negotiable
4. **Performance**: Optimize blur effects and animations
5. **Consistency**: Use design tokens for all values

**Next Steps:**
1. Review this guide with the team
2. Set up development environment with new design system
3. Begin Phase 1 implementation
4. Conduct design reviews at each phase milestone
5. Gather user feedback and iterate

**Maintenance:**
- Update this guide as design evolves
- Document all design decisions
- Keep accessibility at the forefront
- Monitor performance metrics
- Stay current with design trends

---

**Document End**

*For questions or clarifications, refer to the Implementation Roadmap or contact the design team.*

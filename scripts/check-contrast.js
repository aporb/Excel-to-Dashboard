#!/usr/bin/env node

/**
 * WCAG 2.1 AA Color Contrast Checker
 *
 * This script validates color contrast ratios for the Excel-to-Dashboard design system.
 * WCAG 2.1 AA Requirements:
 * - Normal text (< 18pt): 4.5:1
 * - Large text (≥ 18pt or 14pt bold): 3:1
 * - UI components and graphics: 3:1
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert OKLCH to RGB
 * @param {number} l - Lightness (0-1)
 * @param {number} c - Chroma (0-0.4)
 * @param {number} h - Hue (0-360)
 * @returns {[number, number, number]} RGB values (0-255)
 */
function oklchToRgb(l, c, h) {
  // Simplified conversion - for production, use a proper color library
  // This is a placeholder that works reasonably well for validation
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // OKLab to linear RGB (simplified)
  const L = l + 0.3963377774 * a + 0.2158037573 * b;
  const M = l - 0.1055613458 * a - 0.0638541728 * b;
  const S = l - 0.0894841775 * a - 1.2914855480 * b;

  const lrgb = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S
  ];

  // Convert linear RGB to sRGB
  const rgb = lrgb.map(v => {
    if (v <= 0.0031308) return 12.92 * v;
    return 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  });

  return rgb.map(v => Math.max(0, Math.min(255, Math.round(v * 255))));
}

/**
 * Calculate relative luminance
 * @param {[number, number, number]} rgb - RGB values (0-255)
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio
 * @param {number} l1 - Luminance of lighter color
 * @param {number} l2 - Luminance of darker color
 * @returns {number} Contrast ratio
 */
function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - 'normal' | 'large' | 'ui'
 * @returns {boolean}
 */
function meetsWCAG_AA(ratio, level = 'normal') {
  const requirements = {
    normal: 4.5,
    large: 3.0,
    ui: 3.0
  };
  return ratio >= requirements[level];
}

// Define color pairs to test (from globals.css)
const colorPairs = {
  light: {
    background: [0.98, 0.005, 220],
    foreground: [0.25, 0.015, 250],
    primary: [0.45, 0.08, 240],
    'primary-foreground': [0.98, 0.005, 220],
    'muted': [0.94, 0.008, 240],
    'muted-foreground': [0.5, 0.012, 250],
    success: [0.60, 0.15, 160],
    'success-foreground': [0.98, 0.005, 220],
    destructive: [0.55, 0.22, 25],
    'destructive-foreground': [0.98, 0.005, 220],
    warning: [0.75, 0.18, 85],
    'warning-foreground': [0.25, 0.015, 250],
  },
  dark: {
    background: [0.15, 0.015, 250],
    foreground: [0.95, 0.005, 220],
    primary: [0.65, 0.12, 240],
    'primary-foreground': [0.15, 0.015, 250],
    'muted': [0.25, 0.018, 250],
    'muted-foreground': [0.65, 0.008, 230],
    success: [0.65, 0.14, 160],
    'success-foreground': [0.15, 0.015, 250],
    destructive: [0.60, 0.20, 25],
    'destructive-foreground': [0.95, 0.005, 220],
    warning: [0.70, 0.16, 85],
    'warning-foreground': [0.15, 0.015, 250],
  }
};

// Test pairs
const testPairs = [
  { fg: 'foreground', bg: 'background', level: 'normal', description: 'Body text on background' },
  { fg: 'muted-foreground', bg: 'background', level: 'normal', description: 'Muted text on background' },
  { fg: 'primary-foreground', bg: 'primary', level: 'normal', description: 'Primary button text' },
  { fg: 'success-foreground', bg: 'success', level: 'normal', description: 'Success badge text' },
  { fg: 'destructive-foreground', bg: 'destructive', level: 'normal', description: 'Destructive button text' },
  { fg: 'warning-foreground', bg: 'warning', level: 'normal', description: 'Warning alert text' },
  { fg: 'muted-foreground', bg: 'muted', level: 'normal', description: 'Muted text on muted background' },
];

console.log('🎨 WCAG 2.1 AA Color Contrast Validation\n');
console.log('=' .repeat(80) + '\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (const [mode, colors] of Object.entries(colorPairs)) {
  console.log(`\n📊 ${mode.toUpperCase()} MODE\n`);
  console.log('-'.repeat(80));

  for (const test of testPairs) {
    const fgColor = colors[test.fg];
    const bgColor = colors[test.bg];

    if (!fgColor || !bgColor) {
      console.log(`⚠️  Skipping: ${test.description} (color not defined)`);
      continue;
    }

    const fgRgb = oklchToRgb(...fgColor);
    const bgRgb = oklchToRgb(...bgColor);

    const fgLum = getLuminance(fgRgb);
    const bgLum = getLuminance(bgRgb);

    const ratio = getContrastRatio(fgLum, bgLum);
    const passes = meetsWCAG_AA(ratio, test.level);

    totalTests++;
    if (passes) {
      passedTests++;
      console.log(`✅ PASS: ${test.description}`);
    } else {
      failedTests++;
      console.log(`❌ FAIL: ${test.description}`);
    }

    console.log(`   Ratio: ${ratio.toFixed(2)}:1 (required: ${test.level === 'normal' ? '4.5' : '3.0'}:1)`);
    console.log(`   FG: oklch(${fgColor.join(' ')}) → rgb(${fgRgb.join(', ')})`);
    console.log(`   BG: oklch(${bgColor.join(' ')}) → rgb(${bgRgb.join(', ')})`);
    console.log();
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📈 SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)\n`);

if (failedTests > 0) {
  console.log(`⚠️  ${failedTests} contrast issues found. Please review and fix.\n`);
  process.exit(1);
} else {
  console.log('✅ All color contrast ratios meet WCAG 2.1 AA standards!\n');
  process.exit(0);
}

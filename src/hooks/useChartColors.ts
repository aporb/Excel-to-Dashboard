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

/**
 * Custom hook to read chart colors from CSS variables at runtime.
 * This ensures charts use the design system colors and support theme switching.
 *
 * @returns Object containing all chart color values from CSS variables
 */
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
    const updateColors = () => {
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
    };

    // Initial read
    updateColors();

    // Update on theme change
    // Watch for class changes on html element (theme switching)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

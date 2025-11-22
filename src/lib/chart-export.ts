/**
 * Chart Export Utility
 * Handles PNG and PDF export of charts and dashboards
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  filename?: string;
  quality?: number; // 0-1, default 0.95
  scale?: number; // default 2 for high DPI
  backgroundColor?: string;
}

export interface PDFExportOptions extends ExportOptions {
  title?: string;
  author?: string;
  includeMetadata?: boolean;
}

/**
 * Export a single chart or element as PNG
 */
export async function exportElementAsPNG(
  elementId: string,
  filename: string = 'chart',
  options: ExportOptions = {}
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const {
      quality = 0.95,
      scale = 2,
      backgroundColor = '#ffffff',
    } = options;

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convert canvas to blob and download
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error('Failed to create blob');
        downloadBlob(blob, `${filename}.png`);
      },
      'image/png',
      quality
    );
  } catch (error) {
    console.error('PNG export error:', error);
    throw new Error(`Failed to export PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export dashboard as PNG (full page capture)
 */
export async function exportDashboardAsPNG(
  elementId: string,
  filename: string = 'dashboard',
  options: ExportOptions = {}
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const {
      quality = 0.95,
      scale = 2,
      backgroundColor = '#ffffff',
    } = options;

    // Capture the entire dashboard
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowHeight: element.scrollHeight,
      windowWidth: element.scrollWidth,
    });

    // Convert canvas to blob and download
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error('Failed to create blob');
        downloadBlob(blob, `${filename}.png`);
      },
      'image/png',
      quality
    );
  } catch (error) {
    console.error('Dashboard PNG export error:', error);
    throw new Error(`Failed to export dashboard PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export dashboard as PDF with charts and metadata
 */
export async function exportDashboardAsPDF(
  elementId: string,
  filename: string = 'dashboard',
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const {
      quality = 0.95,
      scale = 2,
      backgroundColor = '#ffffff',
      title = 'Dashboard Export',
      author = 'Excel-to-Dashboard',
      includeMetadata = true,
    } = options;

    // Capture the dashboard as canvas
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowHeight: element.scrollHeight,
      windowWidth: element.scrollWidth,
    });

    // Get canvas dimensions
    const imgData = canvas.toDataURL('image/png', quality);
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add metadata if requested
    if (includeMetadata) {
      pdf.setProperties({
        title,
        author,
        subject: 'Dashboard Export',
        keywords: 'dashboard, export, data visualization',
        creator: 'Excel-to-Dashboard',
      });
    }

    // Add header with title and date
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Title
    pdf.setFontSize(16);
    pdf.text(title, margin, margin + 5);

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 12);

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Add image to PDF
    const contentHeight = pageHeight - margin * 2 - 20; // Leave space for header
    const contentWidth = pageWidth - margin * 2;
    const scaledHeight = (canvas.height * contentWidth) / canvas.width;

    if (scaledHeight > contentHeight) {
      // Multi-page PDF
      let heightLeft = scaledHeight;
      let position = margin + 20;

      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, scaledHeight);
      heightLeft -= contentHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, scaledHeight);
        heightLeft -= contentHeight;
      }
    } else {
      // Single page PDF
      pdf.addImage(imgData, 'PNG', margin, margin + 20, contentWidth, scaledHeight);
    }

    // Download PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Export multiple charts as PDF (one per page)
 */
export async function exportChartsAsPDF(
  elementIds: string[],
  filename: string = 'charts',
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const {
      quality = 0.95,
      scale = 2,
      backgroundColor = '#ffffff',
      title = 'Charts Export',
      author = 'Excel-to-Dashboard',
      includeMetadata = true,
    } = options;

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add metadata if requested
    if (includeMetadata) {
      pdf.setProperties({
        title,
        author,
        subject: 'Charts Export',
        keywords: 'charts, export, data visualization',
        creator: 'Excel-to-Dashboard',
      });
    }

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Process each chart
    for (let i = 0; i < elementIds.length; i++) {
      const elementId = elementIds[i];
      const element = document.getElementById(elementId);

      if (!element) {
        console.warn(`Element with ID "${elementId}" not found, skipping`);
        continue;
      }

      // Add new page (except for first chart)
      if (i > 0) {
        pdf.addPage();
      }

      // Add title
      pdf.setFontSize(14);
      pdf.text(`Chart ${i + 1}`, margin, margin + 5);

      // Capture chart
      const canvas = await html2canvas(element, {
        scale,
        backgroundColor,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png', quality);
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2 - 15;
      const scaledHeight = (canvas.height * contentWidth) / canvas.width;

      const finalHeight = Math.min(scaledHeight, contentHeight);
      const finalWidth = (canvas.width * finalHeight) / canvas.height;

      // Center the chart
      const xOffset = (pageWidth - finalWidth) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, margin + 15, finalWidth, finalHeight);
    }

    // Download PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Multi-chart PDF export error:', error);
    throw new Error(`Failed to export charts PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Check if export is supported in current browser
 */
export function isExportSupported(): boolean {
  return typeof window !== 'undefined' && 'canvas' in document.createElement('canvas');
}

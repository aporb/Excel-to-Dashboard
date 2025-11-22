"use client";

import React, { useState } from 'react';
import { Download, FileText, Image, File, FileJson, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  exportElementAsPNG,
  exportDashboardAsPNG,
  exportDashboardAsPDF,
  isExportSupported,
} from '@/lib/chart-export';

interface ExportDialogProps {
  data: Record<string, any>[];
  columns: string[];
  filename?: string;
  dashboardElementId?: string;
}

export function ExportDialog({ data, columns, filename = 'export', dashboardElementId }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export data as CSV
   */
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      
      // Create CSV header
      const header = columns.map(col => `"${col.replace(/"/g, '""')}"`).join(',');
      
      // Create CSV rows
      const rows = data.map(row =>
        columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const strValue = String(value).replace(/"/g, '""');
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue}"`;
          }
          return strValue;
        }).join(',')
      );

      // Combine header and rows
      const csv = [header, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${data.length} rows to CSV`);
      setOpen(false);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export data as JSON
   */
  const handleExportJSON = async () => {
    try {
      setIsExporting(true);

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          rowCount: data.length,
          columnCount: columns.length,
          columns: columns,
        },
        data: data,
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${data.length} rows to JSON`);
      setOpen(false);
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('Failed to export JSON');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export data as TSV (Tab-Separated Values)
   */
  const handleExportTSV = async () => {
    try {
      setIsExporting(true);

      // Create TSV header
      const header = columns.join('\t');

      // Create TSV rows
      const rows = data.map(row =>
        columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return '';
          return String(value).replace(/\t/g, ' '); // Replace tabs with spaces
        }).join('\t')
      );

      // Combine header and rows
      const tsv = [header, ...rows].join('\n');

      // Create blob and download
      const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.tsv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${data.length} rows to TSV`);
      setOpen(false);
    } catch (error) {
      console.error('TSV export error:', error);
      toast.error('Failed to export TSV');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export dashboard as PNG
   */
  const handleExportDashboardPNG = async () => {
    if (!dashboardElementId) {
      toast.error('Dashboard element not found');
      return;
    }

    try {
      setIsExporting(true);
      toast.loading('Generating PNG...');
      await exportDashboardAsPNG(dashboardElementId, filename);
      toast.success('Dashboard exported as PNG');
      setOpen(false);
    } catch (error) {
      console.error('Dashboard PNG export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export dashboard as PNG');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export dashboard as PDF
   */
  const handleExportDashboardPDF = async () => {
    if (!dashboardElementId) {
      toast.error('Dashboard element not found');
      return;
    }

    try {
      setIsExporting(true);
      toast.loading('Generating PDF...');
      await exportDashboardAsPDF(dashboardElementId, filename, {
        title: `Dashboard Export - ${new Date().toLocaleDateString()}`,
        author: 'Excel-to-Dashboard',
        includeMetadata: true,
      });
      toast.success('Dashboard exported as PDF');
      setOpen(false);
    } catch (error) {
      console.error('Dashboard PDF export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export dashboard as PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background/50 backdrop-blur-sm h-8 px-4 py-2 text-xs shadow-sm transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Choose a format to export your data. {data.length} rows will be exported.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">CSV (Comma-Separated)</div>
              <div className="text-sm text-muted-foreground">
                Universal format, compatible with Excel and spreadsheet apps
              </div>
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <File className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">JSON (JavaScript Object)</div>
              <div className="text-sm text-muted-foreground">
                Structured format with metadata, ideal for APIs and databases
              </div>
            </div>
          </button>

          {/* TSV Export */}
          <button
            onClick={handleExportTSV}
            disabled={isExporting}
            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">TSV (Tab-Separated)</div>
              <div className="text-sm text-muted-foreground">
                Tab-separated format, useful for data analysis tools
              </div>
            </div>
          </button>

          {/* PNG Export */}
          {dashboardElementId && isExportSupported() && (
            <button
              onClick={handleExportDashboardPNG}
              disabled={isExporting}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">PNG (Image)</div>
                <div className="text-sm text-muted-foreground">
                  Capture dashboard as high-quality image
                </div>
              </div>
            </button>
          )}

          {/* PDF Export */}
          {dashboardElementId && isExportSupported() && (
            <button
              onClick={handleExportDashboardPDF}
              disabled={isExporting}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">PDF (Document)</div>
                <div className="text-sm text-muted-foreground">
                  Export dashboard with metadata and formatting
                </div>
              </div>
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from 'react';
import { Download, FileText, Image, File } from 'lucide-react';
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

interface ExportDialogProps {
  data: Record<string, any>[];
  columns: string[];
  filename?: string;
}

export function ExportDialog({ data, columns, filename = 'export' }: ExportDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
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

import { useState } from 'react';
import axios from 'axios';
import { rowsToObjects } from '@/lib/data-processor';
import { DataValidator } from '@/lib/data-schemas';
import { toast } from 'sonner';

export interface UseFileUploadReturn {
  uploadStatus: string;
  isUploading: boolean;
  isProcessingData: boolean;
  handleFileSelect: (file: File) => Promise<void>;
  handleSheetChange: (sheetName: string, rawData: Record<string, any[]> | null) => void;
  processSheet: (data: Record<string, any[]>, sheetName: string) => {
    processedData: Record<string, any>[];
    columns: string[];
    inferredMapping: Record<string, string>;
  } | null;
}

export function useFileUpload() {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingData, setIsProcessingData] = useState(false);

  const handleFileSelect = async (file: File): Promise<{
    success: boolean;
    data?: Record<string, any[]>;
    firstSheet?: string;
  }> => {
    setIsUploading(true);
    setUploadStatus('Uploading and parsing...');
    const loadingToast = toast.loading('Processing file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const sheets = Object.keys(res.data.data);
        const firstSheet = sheets.length > 0 ? sheets[0] : '';

        setUploadStatus('Upload successful!');
        toast.dismiss(loadingToast);
        toast.success('File uploaded successfully!');

        return {
          success: true,
          data: res.data.data,
          firstSheet,
        };
      } else {
        setUploadStatus('Upload failed: ' + res.data.error);
        toast.dismiss(loadingToast);
        toast.error('Upload failed: ' + res.data.error);
        return { success: false };
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setUploadStatus('Upload failed');
      toast.dismiss(loadingToast);
      toast.error(`Upload failed: ${errorMessage}. Please check the file and try again.`);
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  const processSheet = (data: Record<string, any[]>, sheetName: string): {
    processedData: Record<string, any>[];
    columns: string[];
    inferredMapping: Record<string, string>;
  } | null => {
    const rows = data[sheetName];
    if (!rows || rows.length === 0) return null;

    setIsProcessingData(true);

    try {
      // Validate workbook data
      const validation = DataValidator.validateWorkbookData(data);
      if (!validation.success) {
        console.error('Workbook validation failed:', validation.error);
        setUploadStatus('Data validation failed. Please check your file format.');
        toast.error('Invalid file format. Please upload a valid CSV or Excel file.');
        return null;
      }

      const objects = rowsToObjects(rows);

      // Validate and clean data using Zod
      const inferredMapping = DataValidator.inferColumnTypes(objects.slice(0, 10));
      const validationResult = DataValidator.validateAndCleanData(rows, inferredMapping);

      if (validationResult.warnings && validationResult.warnings.length > 0) {
        console.warn('Data validation warnings:', validationResult.warnings);
      }

      if (!validationResult.isValid) {
        console.error('Data validation errors:', validationResult.errors);
        setUploadStatus(`Data processing completed with ${validationResult.errors.length} errors. Check console for details.`);
        toast.warning(`Data has ${validationResult.errors.length} validation errors. Check the console for details.`);
      }

      const columns = rows[0] ? (rows[0] as string[]) : [];

      return {
        processedData: validationResult.cleanedData,
        columns,
        inferredMapping,
      };
    } finally {
      setIsProcessingData(false);
    }
  };

  return {
    uploadStatus,
    setUploadStatus,
    isUploading,
    isProcessingData,
    handleFileSelect,
    processSheet,
  };
}

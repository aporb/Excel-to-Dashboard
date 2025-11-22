import { z } from 'zod';

// Column type validation
export const ColumnTypeSchema = z.enum(['string', 'number', 'date']);

// Individual cell value validation (allows nulls and various types)
export const CellValueSchema = z.union([
  z.string(),
  z.number(),
  z.date(),
  z.null(),
  z.undefined()
]);

// Data row validation (flexible record of any values)
export const DataRowSchema = z.record(z.string(), CellValueSchema);

// Processed data array validation
export const ProcessedDataSchema = z.array(DataRowSchema);

// Column mapping validation
export const ColumnMappingSchema = z.record(z.string(), ColumnTypeSchema);

// Validation result schema
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.object({
    row: z.number(),
    column: z.string(),
    message: z.string(),
    originalValue: CellValueSchema.optional()
  })),
  cleanedData: ProcessedDataSchema,
  warnings: z.array(z.string()).optional()
});

// File upload validation
export const FileUploadSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'), // 10MB limit
  type: z.enum([
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ], 'Unsupported file type. Please upload CSV, XLS, or XLSX files.')
});

// Sheet data validation
export const SheetDataSchema = z.object({
  sheetName: z.string(),
  data: z.array(z.array(CellValueSchema))
});

// Workbook data validation
export const WorkbookDataSchema = z.record(z.string(), z.array(z.array(CellValueSchema)));

// Type inference helpers
export type ColumnType = z.infer<typeof ColumnTypeSchema>;
export type CellValue = z.infer<typeof CellValueSchema>;
export type DataRow = z.infer<typeof DataRowSchema>;
export type ProcessedData = z.infer<typeof ProcessedDataSchema>;
export type ColumnMapping = z.infer<typeof ColumnMappingSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type SheetData = z.infer<typeof SheetDataSchema>;
export type WorkbookData = z.infer<typeof WorkbookDataSchema>;

// Utility functions for data validation and cleaning
export class DataValidator {
  static validateFileUpload(file: File) {
    return FileUploadSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type
    });
  }

  static validateWorkbookData(data: Record<string, any[][]>) {
    return WorkbookDataSchema.safeParse(data);
  }

  static validateAndCleanData(
    rawData: any[][],
    columnMapping: ColumnMapping
  ): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: string[] = [];
    const cleanedData: DataRow[] = [];

    if (!rawData.length) {
      return {
        isValid: false,
        errors: [{ row: 0, column: '', message: 'No data provided' }],
        cleanedData: [],
        warnings: []
      };
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    // Validate headers
    const uniqueHeaders = new Set(headers);
    if (uniqueHeaders.size !== headers.length) {
      warnings.push('Duplicate column names detected - this may cause issues');
    }

    // Process each data row
    dataRows.forEach((row, rowIndex) => {
      const cleanedRow: DataRow = {};

      headers.forEach((header, colIndex) => {
        const rawValue = row[colIndex];
        const expectedType = columnMapping[header] || 'string';

        try {
          const cleanedValue = this.cleanValue(rawValue, expectedType);
          cleanedRow[header] = cleanedValue;
        } catch (error) {
          errors.push({
            row: rowIndex + 1, // +1 because we sliced off headers
            column: header,
            message: `Failed to convert value to ${expectedType}: ${error}`,
            originalValue: rawValue
          });
          // Use original value as fallback
          cleanedRow[header] = rawValue;
        }
      });

      cleanedData.push(cleanedRow);
    });

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private static cleanValue(value: any, targetType: ColumnType): CellValue {
    if (value === null || value === undefined || value === '') {
      return null; // Convert empty values to null
    }

    switch (targetType) {
      case 'number':
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[,$%]/g, ''));
          if (!isNaN(parsed)) return parsed;
        }
        throw new Error(`Cannot convert "${value}" to number`);

      case 'date':
        if (value instanceof Date) return value;
        if (typeof value === 'string') {
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) return parsed;
        }
        if (typeof value === 'number') {
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) return parsed;
        }
        throw new Error(`Cannot convert "${value}" to date`);

      case 'string':
      default:
        return String(value);
    }
  }

  static inferColumnTypes(sampleData: DataRow[]): ColumnMapping {
    const inferred: ColumnMapping = {};
    const sampleSize = Math.min(sampleData.length, 100); // Sample first 100 rows

    if (sampleSize === 0) return inferred;

    const headers = Object.keys(sampleData[0]);

    headers.forEach(header => {
      const values = sampleData.slice(0, sampleSize).map(row => row[header]).filter(val => val !== null && val !== undefined && val !== '');

      if (values.length === 0) {
        inferred[header] = 'string';
        return;
      }

      // Try to infer type based on sample values
      const numberCount = values.filter(val => typeof val === 'number' || (!isNaN(Number(val)) && String(val).trim() !== '')).length;
      const dateCount = values.filter(val => {
        if (val instanceof Date) return true;
        if (typeof val === 'string') {
          const parsed = new Date(val);
          return !isNaN(parsed.getTime());
        }
        return false;
      }).length;

      const numberRatio = numberCount / values.length;
      const dateRatio = dateCount / values.length;

      if (dateRatio > 0.8) {
        inferred[header] = 'date';
      } else if (numberRatio > 0.8) {
        inferred[header] = 'number';
      } else {
        inferred[header] = 'string';
      }
    });

    return inferred;
  }
}

import { FilterConfig, FilterExpression } from './dashboard-types';
import { FilterValues } from '@/components/dashboard/FilterBar';

/**
 * Apply global filters to dataset
 * Returns filtered data based on active filter values
 */
export function applyGlobalFilters(
  data: Record<string, any>[],
  filters: FilterConfig[],
  filterValues: FilterValues
): Record<string, any>[] {
  let filteredData = [...data];

  filters.forEach(filter => {
    const value = filterValues[filter.id];
    if (value === undefined || value === null) return;

    filteredData = filteredData.filter(row => {
      switch (filter.type) {
        case 'dateRange':
          return filterByDateRange(row, filter.field, value);

        case 'category':
          return filterByCategory(row, filter.field, value);

        case 'numericRange':
          return filterByNumericRange(row, filter.field, value);

        default:
          return true;
      }
    });
  });

  return filteredData;
}

/**
 * Filter by date range
 * value: [startDate, endDate] as ISO strings
 */
function filterByDateRange(
  row: Record<string, any>,
  field: string,
  value: [string, string]
): boolean {
  const [startDate, endDate] = value;
  const rowValue = row[field];

  if (!rowValue || !startDate || !endDate) return true;

  const rowDate = new Date(rowValue);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(rowDate.getTime())) return false;

  return rowDate >= start && rowDate <= end;
}

/**
 * Filter by category (multi-select)
 * value: string[] of selected categories
 */
function filterByCategory(
  row: Record<string, any>,
  field: string,
  value: string[]
): boolean {
  if (!Array.isArray(value) || value.length === 0) return true;

  const rowValue = String(row[field]);
  return value.includes(rowValue);
}

/**
 * Filter by numeric range
 * value: [min, max] as numbers
 */
function filterByNumericRange(
  row: Record<string, any>,
  field: string,
  value: [number | null, number | null]
): boolean {
  const [min, max] = value;
  const rowValue = Number(row[field]);

  if (isNaN(rowValue)) return false;

  if (min !== null && rowValue < min) return false;
  if (max !== null && rowValue > max) return false;

  return true;
}

/**
 * Generate filter configs from data analysis
 * Automatically detects which filters to create based on column types
 */
export function generateFiltersFromData(
  data: Record<string, any>[],
  columnMapping: Record<string, string>
): FilterConfig[] {
  const filters: FilterConfig[] = [];

  Object.entries(columnMapping).forEach(([fieldName, fieldType]) => {
    // Date fields -> Date range filter
    if (fieldType === 'date') {
      filters.push({
        id: `filter-date-${fieldName}`,
        type: 'dateRange',
        field: fieldName,
        label: fieldName,
        defaultValue: undefined,
      });
    }

    // String fields with ≤10 unique values -> Category filter
    if (fieldType === 'string') {
      const uniqueValues = new Set(
        data.map(row => row[fieldName]).filter(v => v != null)
      );

      if (uniqueValues.size <= 10 && uniqueValues.size > 1) {
        filters.push({
          id: `filter-category-${fieldName}`,
          type: 'category',
          field: fieldName,
          label: fieldName,
          options: Array.from(uniqueValues).map(String),
        });
      }
    }

    // Numeric fields -> Numeric range filter
    if (fieldType === 'number') {
      const numbers = data
        .map(row => row[fieldName])
        .filter(v => v != null && !isNaN(Number(v)))
        .map(Number);

      if (numbers.length > 0) {
        filters.push({
          id: `filter-numeric-${fieldName}`,
          type: 'numericRange',
          field: fieldName,
          label: fieldName,
          min: Math.min(...numbers),
          max: Math.max(...numbers),
        });
      }
    }
  });

  return filters;
}

/**
 * Count active filters
 */
export function countActiveFilters(filterValues: FilterValues): number {
  return Object.values(filterValues).filter(
    v => v !== undefined && v !== null && v !== ''
  ).length;
}

/**
 * Serialize filter values for storage/URL
 */
export function serializeFilterValues(filterValues: FilterValues): string {
  return JSON.stringify(filterValues);
}

/**
 * Deserialize filter values from storage/URL
 */
export function deserializeFilterValues(serialized: string): FilterValues {
  try {
    return JSON.parse(serialized);
  } catch {
    return {};
  }
}

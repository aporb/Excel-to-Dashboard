"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Filter, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterConfig } from '@/lib/dashboard-types';
import { Badge } from '@/components/ui/badge';

export interface FilterValues {
  [filterId: string]: any;
}

interface FilterBarProps {
  filters: FilterConfig[];
  data: Record<string, any>[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  isApplying?: boolean;
}

export function FilterBar({ filters, data, values, onChange, isApplying = false }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Count active filters
  useMemo(() => {
    const count = Object.values(values).filter(v => v !== undefined && v !== null && v !== '').length;
    setActiveFilterCount(count);
  }, [values]);

  const handleFilterChange = (filterId: string, value: any) => {
    onChange({
      ...values,
      [filterId]: value,
    });
  };

  const handleClearFilter = (filterId: string) => {
    const newValues = { ...values };
    delete newValues[filterId];
    onChange(newValues);
  };

  const handleClearAll = () => {
    onChange({});
  };

  if (filters.length === 0) return null;

  return (
    <Card variant="glass" className="mb-6 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isApplying ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Filter className="h-4 w-4 text-primary" />
            )}
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
            {isApplying && (
              <span className="text-xs text-muted-foreground">Applying filters...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
                disabled={isApplying}
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={isApplying}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <FilterItem
                key={filter.id}
                filter={filter}
                data={data}
                value={values[filter.id]}
                onChange={(value) => handleFilterChange(filter.id, value)}
                onClear={() => handleClearFilter(filter.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

interface FilterItemProps {
  filter: FilterConfig;
  data: Record<string, any>[];
  value: any;
  onChange: (value: any) => void;
  onClear: () => void;
}

function FilterItem({ filter, data, value, onChange, onClear }: FilterItemProps) {
  switch (filter.type) {
    case 'dateRange':
      return (
        <DateRangeFilter
          filter={filter}
          data={data}
          value={value}
          onChange={onChange}
          onClear={onClear}
        />
      );
    case 'category':
      return (
        <CategoryFilter
          filter={filter}
          data={data}
          value={value}
          onChange={onChange}
          onClear={onClear}
        />
      );
    case 'numericRange':
      return (
        <NumericRangeFilter
          filter={filter}
          data={data}
          value={value}
          onChange={onChange}
          onClear={onClear}
        />
      );
    default:
      return null;
  }
}

// ============================================================================
// DATE RANGE FILTER
// ============================================================================

function DateRangeFilter({ filter, data, value, onChange, onClear }: FilterItemProps) {
  const [startDate, endDate] = value || [null, null];

  // Extract date range from data
  const dateValues = useMemo(() => {
    const dates = data
      .map(row => row[filter.field])
      .filter(d => d != null)
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return { min: null, max: null };

    return {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }, [data, filter.field]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([e.target.value, endDate]);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange([startDate, e.target.value]);
  };

  const handlePresetChange = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let start: Date;
    let end: Date = today;

    switch (preset) {
      case 'last7days':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'last90days':
        start = new Date(today);
        start.setDate(today.getDate() - 90);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    onChange([
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
    ]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{filter.label}</Label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="h-8 text-xs glass-subtle">
          <SelectValue placeholder="Quick select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7days">Last 7 days</SelectItem>
          <SelectItem value="last30days">Last 30 days</SelectItem>
          <SelectItem value="last90days">Last 90 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="lastMonth">Last month</SelectItem>
          <SelectItem value="thisYear">This year</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="date"
            value={startDate || ''}
            onChange={handleStartDateChange}
            className="h-8 text-xs glass-subtle"
            placeholder="Start date"
            min={dateValues.min?.toISOString().split('T')[0]}
            max={dateValues.max?.toISOString().split('T')[0]}
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            value={endDate || ''}
            onChange={handleEndDateChange}
            className="h-8 text-xs glass-subtle"
            placeholder="End date"
            min={startDate || dateValues.min?.toISOString().split('T')[0]}
            max={dateValues.max?.toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY FILTER (Multi-select)
// ============================================================================

function CategoryFilter({ filter, data, value, onChange, onClear }: FilterItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique categories from data
  const categories = useMemo(() => {
    const uniqueValues = new Set<string>();
    data.forEach(row => {
      const val = row[filter.field];
      if (val != null && val !== '') {
        uniqueValues.add(String(val));
      }
    });
    return Array.from(uniqueValues).sort();
  }, [data, filter.field]);

  const selectedCategories: string[] = value || [];

  const handleToggleCategory = (category: string) => {
    const newSelected = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];

    onChange(newSelected.length > 0 ? newSelected : undefined);
  };

  const handleSelectAll = () => {
    onChange(categories);
  };

  const handleClearSelection = () => {
    onChange(undefined);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{filter.label}</Label>
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-8 text-xs glass-subtle"
        >
          <span className="truncate">
            {selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : 'Select categories...'}
          </span>
          <ChevronDown className="h-3 w-3 ml-2" />
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-50 w-full mt-1 glass-standard border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="sticky top-0 glass-standard border-b p-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex-1 h-7 text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="flex-1 h-7 text-xs"
                >
                  Clear
                </Button>
              </div>
              <div className="p-2 space-y-1">
                {categories.map(category => (
                  <label
                    key={category}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleToggleCategory(category)}
                      className="rounded border-border"
                    />
                    <span className="text-xs truncate">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCategories.slice(0, 3).map(cat => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
          {selectedCategories.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedCategories.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NUMERIC RANGE FILTER
// ============================================================================

function NumericRangeFilter({ filter, data, value, onChange, onClear }: FilterItemProps) {
  const [min, max] = value || [null, null];

  // Extract numeric range from data
  const dataRange = useMemo(() => {
    const numbers = data
      .map(row => row[filter.field])
      .filter(v => v != null && !isNaN(Number(v)))
      .map(Number);

    if (numbers.length === 0) return { min: 0, max: 100 };

    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
    };
  }, [data, filter.field]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = e.target.value ? Number(e.target.value) : null;
    onChange([newMin, max]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = e.target.value ? Number(e.target.value) : null;
    onChange([min, newMax]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{filter.label}</Label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Input
          type="number"
          value={min ?? ''}
          onChange={handleMinChange}
          placeholder={`Min (${dataRange.min})`}
          className="h-8 text-xs glass-subtle"
          min={dataRange.min}
          max={dataRange.max}
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="number"
          value={max ?? ''}
          onChange={handleMaxChange}
          placeholder={`Max (${dataRange.max})`}
          className="h-8 text-xs glass-subtle"
          min={min || dataRange.min}
          max={dataRange.max}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Range: {dataRange.min.toFixed(0)} - {dataRange.max.toFixed(0)}
      </div>
    </div>
  );
}

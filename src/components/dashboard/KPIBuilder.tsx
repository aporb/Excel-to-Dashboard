'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPIConfig, AggregationType } from '@/lib/dashboard-types';
import * as LucideIcons from 'lucide-react';

interface KPIBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: string[];
  onSave: (kpi: KPIConfig) => void;
}

const LUCIDE_ICONS = [
  'Activity', 'TrendingUp', 'TrendingDown', 'DollarSign', 'Users',
  'ShoppingCart', 'Database', 'BarChart3', 'PieChart', 'Target'
];

export default function KPIBuilder({ open, onOpenChange, columns, onSave }: KPIBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState(columns[0] || '');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [format, setFormat] = useState<'number' | 'currency' | 'percentage'>('number');
  const [icon, setIcon] = useState('Activity');

  const handleSave = () => {
    if (!title || !field) {
      return;
    }

    const kpi: KPIConfig = {
      id: crypto.randomUUID(),
      title,
      description,
      expression: {
        aggregation,
        field,
      },
      format,
      icon,
      span: 6, // Half width
    };

    onSave(kpi);

    // Reset form
    setTitle('');
    setDescription('');
    setField(columns[0] || '');
    setAggregation('sum');
    setFormat('number');
    setIcon('Activity');

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-standard">
        <DialogHeader>
          <DialogTitle>Create KPI</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Total Revenue"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Sum of all revenue values"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger id="field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columns.map(col => (
                  <SelectItem key={col} value={col}>{col}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aggregation">Aggregation</Label>
            <Select value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
              <SelectTrigger id="aggregation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="avg">Average</SelectItem>
                <SelectItem value="min">Minimum</SelectItem>
                <SelectItem value="max">Maximum</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="countDistinct">Count Distinct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency (USD)</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger id="icon">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LUCIDE_ICONS.map(iconName => {
                  const IconComponent = (LucideIcons as any)[iconName];
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span>{iconName}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !field}>
            Create KPI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

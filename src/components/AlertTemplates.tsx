"use client";

import React, { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertRule } from '@/lib/alert-engine';

interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultMetric: string;
  defaultCondition: '>' | '<' | '>=' | '<=' | '==';
  defaultThreshold: number;
}

interface AlertTemplatesProps {
  onSelectTemplate: (rule: AlertRule) => void;
}

const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: 'sales-drop',
    name: 'Sales Drop Alert',
    description: 'Alert when sales drop below threshold',
    icon: '📉',
    defaultMetric: 'Sales',
    defaultCondition: '<',
    defaultThreshold: 1000,
  },
  {
    id: 'inventory-low',
    name: 'Low Inventory',
    description: 'Alert when inventory falls below minimum',
    icon: '📦',
    defaultMetric: 'Inventory',
    defaultCondition: '<',
    defaultThreshold: 50,
  },
  {
    id: 'high-cost',
    name: 'High Cost Alert',
    description: 'Alert when costs exceed budget',
    icon: '💰',
    defaultMetric: 'Cost',
    defaultCondition: '>',
    defaultThreshold: 5000,
  },
  {
    id: 'performance-drop',
    name: 'Performance Drop',
    description: 'Alert when performance metrics decline',
    icon: '⚡',
    defaultMetric: 'Performance',
    defaultCondition: '<',
    defaultThreshold: 80,
  },
  {
    id: 'error-spike',
    name: 'Error Spike',
    description: 'Alert when error rate increases',
    icon: '⚠️',
    defaultMetric: 'Errors',
    defaultCondition: '>',
    defaultThreshold: 10,
  },
  {
    id: 'threshold-exceeded',
    name: 'Threshold Exceeded',
    description: 'Alert when value exceeds maximum',
    icon: '🚨',
    defaultMetric: 'Value',
    defaultCondition: '>',
    defaultThreshold: 100,
  },
];

export function AlertTemplates({ onSelectTemplate }: AlertTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<AlertTemplate | null>(null);

  const handleSelectTemplate = (template: AlertTemplate) => {
    const rule: AlertRule = {
      id: crypto.randomUUID(),
      metric: template.defaultMetric,
      condition: template.defaultCondition,
      threshold: template.defaultThreshold,
    };
    onSelectTemplate(rule);
    setSelectedTemplate(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Alert Templates
        </CardTitle>
        <CardDescription>
          Use pre-configured templates to quickly set up common alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALERT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-xl">{template.icon}</span>
                <span className="font-semibold text-sm flex-1">{template.name}</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">{template.description}</p>
              <div className="text-xs text-muted-foreground mt-1">
                <span className="font-mono bg-muted px-2 py-1 rounded">
                  {template.defaultMetric} {template.defaultCondition} {template.defaultThreshold}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

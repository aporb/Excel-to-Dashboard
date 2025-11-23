'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KPIConfig } from '@/lib/dashboard-types';
import * as LucideIcons from 'lucide-react';

interface KPICardDynamicProps {
  config: KPIConfig;
  value: number;
  formatted: string;
}

export default function KPICardDynamic({ config, value, formatted }: KPICardDynamicProps) {
  // Get icon component dynamically
  const IconComponent = config.icon && config.icon in LucideIcons
    ? (LucideIcons as any)[config.icon]
    : LucideIcons.Activity;

  return (
    <Card variant="glass" className="fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {config.title}
        </CardTitle>
        {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatted}</div>
        {config.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {config.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

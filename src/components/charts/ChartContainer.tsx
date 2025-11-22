"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartContainer({
  title,
  description,
  icon,
  children,
  className,
  actions
}: ChartContainerProps) {
  return (
    <Card variant="glass" hoverable className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="glass-subtle p-2.5 rounded-lg">
                {icon}
              </div>
            )}
            <div className="space-y-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Gradient divider */}
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
          <div className="pt-6">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

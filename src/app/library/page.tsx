"use client";

import { DashboardLibrary } from '@/components/dashboard/DashboardLibrary';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SettingsDialog } from '@/components/SettingsDialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <SettingsDialog />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <DashboardLibrary />
    </div>
  );
}

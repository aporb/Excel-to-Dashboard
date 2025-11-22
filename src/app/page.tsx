"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SettingsDialog } from '@/components/SettingsDialog';
import { BarChart3, FileSpreadsheet, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        !isScrolled && "bg-background/60 backdrop-blur-sm",
        isScrolled && "glass-standard border-b border-border-subtle shadow-lg"
      )}>
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 blur-lg opacity-0 transition-opacity duration-300",
                "bg-primary/40 group-hover:opacity-100"
              )} />
              <BarChart3 className="relative h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold">Excel-to-Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <SettingsDialog />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20 flex flex-col items-center text-center">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Transform Spreadsheets into
              <span className="text-primary"> AI-Powered Dashboards</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your data, let AI suggest the perfect visualizations, and create beautiful interactive dashboards in minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="text-lg">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="glass" hoverable>
            <CardContent className="pt-6 space-y-3">
              <div className="h-12 w-12 rounded-lg glass-subtle flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Format Support</h3>
              <p className="text-muted-foreground">
                Upload CSV or Excel files with multi-sheet support. Your data stays secure in your browser.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" hoverable>
            <CardContent className="pt-6 space-y-3">
              <div className="h-12 w-12 rounded-lg glass-subtle flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Mapping</h3>
              <p className="text-muted-foreground">
                Intelligent column type detection automatically maps your data fields for instant insights.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" hoverable>
            <CardContent className="pt-6 space-y-3">
              <div className="h-12 w-12 rounded-lg glass-subtle flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Charts</h3>
              <p className="text-muted-foreground">
                Get intelligent chart suggestions from OpenAI GPT-4 based on your data patterns.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" hoverable>
            <CardContent className="pt-6 space-y-3">
              <div className="h-12 w-12 rounded-lg glass-subtle flex items-center justify-center">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Custom Alerts</h3>
              <p className="text-muted-foreground">
                Set up threshold monitoring and get notified when your data crosses important boundaries.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground border-t">
        <p>Built with Next.js, OpenAI, and shadcn/ui</p>
      </footer>
    </main>
  );
}

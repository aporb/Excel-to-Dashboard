"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  Trash2,
  FolderOpen,
  Calendar,
  Download,
  Upload,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sessionManager, DashboardSession } from '@/lib/session-manager';
import { exportDashboardProject, importDashboardProject } from '@/lib/dashboard-export';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function DashboardLibrary() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DashboardSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<DashboardSession | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  // Load all sessions
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessionIds = await sessionManager.getAllSessionIds();
      const loadedSessions: DashboardSession[] = [];

      for (const id of sessionIds) {
        const session = await sessionManager.loadSession(id);
        if (session) {
          loadedSessions.push(session);
        }
      }

      // Sort by lastUpdated (most recent first)
      loadedSessions.sort(
        (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      setSessions(loadedSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sessions.forEach(session => {
      (session.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        (session.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (session.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTag =
        selectedTag === null || (session.tags || []).includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [sessions, searchQuery, selectedTag]);

  const handleOpenDashboard = (sessionId: string) => {
    router.push(`/dashboard?session=${sessionId}`);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      await sessionManager.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Dashboard deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete dashboard');
    }
  };

  const handleToggleFavorite = async (session: DashboardSession) => {
    try {
      const tags = session.tags || [];
      const isFavorite = tags.includes('favorite');

      const updatedSession: DashboardSession = {
        ...session,
        tags: isFavorite
          ? tags.filter(t => t !== 'favorite')
          : [...tags, 'favorite'],
      };

      await sessionManager.saveSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === session.id ? updatedSession : s))
      );
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleExportDashboard = async (session: DashboardSession) => {
    try {
      await exportDashboardProject(session);
      toast.success('Dashboard exported successfully');
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      toast.error('Failed to export dashboard');
    }
  };

  const handleImportDashboard = async (file: File) => {
    try {
      const session = await importDashboardProject(file);
      setSessions(prev => [session, ...prev]);
      toast.success('Dashboard imported successfully');
    } catch (error) {
      console.error('Failed to import dashboard:', error);
      toast.error('Failed to import dashboard: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditSession = (session: DashboardSession) => {
    setEditingSession(session);
    setNewName(session.name || '');
    setNewDescription(session.description || '');
    setNewTags((session.tags || []).join(', '));
    setShowNameDialog(true);
  };

  const handleSaveSessionMetadata = async () => {
    if (!editingSession) return;

    try {
      const updatedSession: DashboardSession = {
        ...editingSession,
        name: newName || undefined,
        description: newDescription || undefined,
        tags: newTags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
      };

      await sessionManager.saveSession(updatedSession);
      setSessions(prev =>
        prev.map(s => (s.id === editingSession.id ? updatedSession : s))
      );
      setShowNameDialog(false);
      setEditingSession(null);
      toast.success('Dashboard updated');
    } catch (error) {
      console.error('Failed to update session:', error);
      toast.error('Failed to update dashboard');
    }
  };

  const handleDuplicateDashboard = async (session: DashboardSession) => {
    try {
      const newSession: DashboardSession = {
        ...session,
        id: crypto.randomUUID(),
        name: `${session.name || 'Dashboard'} (Copy)`,
        lastUpdated: new Date().toISOString(),
      };

      await sessionManager.saveSession(newSession);
      setSessions(prev => [newSession, ...prev]);
      toast.success('Dashboard duplicated');
    } catch (error) {
      console.error('Failed to duplicate dashboard:', error);
      toast.error('Failed to duplicate dashboard');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            Dashboard Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your dashboards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-dashboard')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="import-dashboard"
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImportDashboard(file);
              }
            }}
          />
          <Button onClick={() => router.push('/dashboard')}>
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-subtle"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTag === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All ({sessions.length})
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading dashboards...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card variant="glass">
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mt-4">No dashboards found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || selectedTag
                ? 'Try adjusting your filters'
                : 'Create your first dashboard to get started'}
            </p>
            {!searchQuery && !selectedTag && (
              <Button className="mt-4" onClick={() => router.push('/dashboard')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map(session => (
            <DashboardCard
              key={session.id}
              session={session}
              onOpen={handleOpenDashboard}
              onDelete={handleDeleteSession}
              onToggleFavorite={handleToggleFavorite}
              onExport={handleExportDashboard}
              onEdit={handleEditSession}
              onDuplicate={handleDuplicateDashboard}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dashboard Details</DialogTitle>
            <DialogDescription>
              Update the name, description, and tags for this dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Dashboard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe your dashboard..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="sales, monthly, reports"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSessionMetadata}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// DASHBOARD CARD COMPONENT
// ============================================================================

interface DashboardCardProps {
  session: DashboardSession;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (session: DashboardSession) => void;
  onExport: (session: DashboardSession) => void;
  onEdit: (session: DashboardSession) => void;
  onDuplicate: (session: DashboardSession) => void;
}

function DashboardCard({
  session,
  onOpen,
  onDelete,
  onToggleFavorite,
  onExport,
  onEdit,
  onDuplicate,
}: DashboardCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isFavorite = (session.tags || []).includes('favorite');

  const chartCount = session.dashboardConfig?.charts.length || 0;
  const kpiCount = session.dashboardConfig?.kpis.length || 0;
  const alertCount = session.alertRules?.length || 0;

  return (
    <Card
      variant="glass"
      hoverable
      className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onOpen(session.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">
              {session.name || `Dashboard ${session.id.slice(0, 8)}`}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {session.description || 'No description'}
            </CardDescription>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(session);
              }}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <Star
                className={`h-4 w-4 ${
                  isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
                }`}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          {chartCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {chartCount} {chartCount === 1 ? 'chart' : 'charts'}
            </Badge>
          )}
          {kpiCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {kpiCount} {kpiCount === 1 ? 'KPI' : 'KPIs'}
            </Badge>
          )}
          {alertCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {alertCount} {alertCount === 1 ? 'alert' : 'alerts'}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {session.tags
              .filter(t => t !== 'favorite')
              .slice(0, 3)
              .map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            {session.tags.filter(t => t !== 'favorite').length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{session.tags.filter(t => t !== 'favorite').length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(session.lastUpdated).toLocaleDateString()}
        </div>
      </CardContent>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute top-16 right-4 z-50 glass-standard border rounded-lg shadow-lg min-w-[180px] overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(session);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(session);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport(session);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="border-t my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

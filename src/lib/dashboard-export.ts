import { DashboardSession } from './session-manager';
import { sessionManager } from './session-manager';
import { DashboardConfigSchema } from './dashboard-types';

/**
 * Dashboard Project Export/Import
 * Exports full dashboard including config, data, and metadata
 */

export interface DashboardProject {
  version: string;
  exportedAt: string;
  dashboard: {
    id: string;
    name?: string;
    description?: string;
    tags?: string[];
    config: any; // DashboardConfig
    alertRules: any[];
  };
  data: {
    uploadedData: Record<string, any[]>;
    processedData: Record<string, any>[];
    columnMapping: Record<string, string>;
    selectedSheet?: string;
  };
}

/**
 * Export dashboard as project file (.json)
 */
export function exportDashboardProject(session: DashboardSession): void {
  const project: DashboardProject = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    dashboard: {
      id: session.id,
      name: session.name,
      description: session.description,
      tags: session.tags,
      config: session.dashboardConfig,
      alertRules: session.alertRules,
    },
    data: {
      uploadedData: session.uploadedData,
      processedData: session.processedData,
      columnMapping: session.columnMapping,
      selectedSheet: session.selectedSheet,
    },
  };

  // Convert to JSON
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  const filename = session.name
    ? `${session.name.replace(/\s+/g, '-')}-dashboard.json`
    : `dashboard-${session.id.slice(0, 8)}.json`;

  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
}

/**
 * Import dashboard from project file
 */
export async function importDashboardProject(
  file: File
): Promise<DashboardSession> {
  // Read file
  const text = await file.text();

  // Parse JSON
  let project: DashboardProject;
  try {
    project = JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }

  // Validate version
  if (project.version !== '1.0') {
    throw new Error(`Unsupported project version: ${project.version}`);
  }

  // Validate required fields
  if (!project.dashboard || !project.data) {
    throw new Error('Invalid project structure');
  }

  // Validate dashboard config if present
  if (project.dashboard.config) {
    try {
      DashboardConfigSchema.parse(project.dashboard.config);
    } catch (error) {
      console.warn('Dashboard config validation failed:', error);
      // Continue anyway, config might be from older version
    }
  }

  // Create new session (new ID to avoid conflicts)
  const newSession: DashboardSession = {
    id: crypto.randomUUID(),
    name: project.dashboard.name
      ? `${project.dashboard.name} (Imported)`
      : 'Imported Dashboard',
    description: project.dashboard.description,
    tags: project.dashboard.tags || [],
    uploadedData: project.data.uploadedData,
    processedData: project.data.processedData,
    columnMapping: project.data.columnMapping,
    dashboardConfig: project.dashboard.config,
    alertRules: project.dashboard.alertRules || [],
    selectedSheet: project.data.selectedSheet,
    lastUpdated: new Date().toISOString(),
  };

  // Save to storage
  await sessionManager.saveSession(newSession);

  return newSession;
}

/**
 * Export session metadata only (no data)
 * Useful for sharing dashboard configurations
 */
export function exportDashboardConfig(session: DashboardSession): void {
  const configExport = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    name: session.name,
    description: session.description,
    tags: session.tags,
    config: session.dashboardConfig,
    alertRules: session.alertRules,
    columnMapping: session.columnMapping,
  };

  const json = JSON.stringify(configExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const filename = session.name
    ? `${session.name.replace(/\s+/g, '-')}-config.json`
    : `dashboard-config-${session.id.slice(0, 8)}.json`;

  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Validate dashboard project file
 */
export function validateDashboardProject(
  project: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check version
  if (!project.version) {
    errors.push('Missing version field');
  } else if (project.version !== '1.0') {
    errors.push(`Unsupported version: ${project.version}`);
  }

  // Check dashboard
  if (!project.dashboard) {
    errors.push('Missing dashboard field');
  } else {
    if (!project.dashboard.id) {
      errors.push('Missing dashboard.id');
    }
    if (!project.dashboard.config) {
      errors.push('Missing dashboard.config');
    }
  }

  // Check data
  if (!project.data) {
    errors.push('Missing data field');
  } else {
    if (!project.data.processedData || !Array.isArray(project.data.processedData)) {
      errors.push('Invalid data.processedData');
    }
    if (!project.data.columnMapping || typeof project.data.columnMapping !== 'object') {
      errors.push('Invalid data.columnMapping');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get project file size estimate
 */
export function estimateProjectSize(session: DashboardSession): {
  bytes: number;
  formatted: string;
} {
  const project: DashboardProject = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    dashboard: {
      id: session.id,
      name: session.name,
      description: session.description,
      tags: session.tags,
      config: session.dashboardConfig,
      alertRules: session.alertRules,
    },
    data: {
      uploadedData: session.uploadedData,
      processedData: session.processedData,
      columnMapping: session.columnMapping,
      selectedSheet: session.selectedSheet,
    },
  };

  const json = JSON.stringify(project);
  const bytes = new Blob([json]).size;

  let formatted: string;
  if (bytes < 1024) {
    formatted = `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    formatted = `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    formatted = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return { bytes, formatted };
}

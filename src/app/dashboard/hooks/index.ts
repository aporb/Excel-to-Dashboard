/**
 * Dashboard Custom Hooks
 *
 * These hooks extract complex logic from the dashboard page component
 * to improve maintainability and testability.
 */

export { useSessionManagement } from './useSessionManagement';
export type { UseSessionManagementReturn } from './useSessionManagement';

export { useFileUpload } from './useFileUpload';
export type { UseFileUploadReturn } from './useFileUpload';

export { useDashboardGeneration } from './useDashboardGeneration';
export type { UseDashboardGenerationReturn } from './useDashboardGeneration';

export { useChartManagement } from './useChartManagement';
export type { UseChartManagementReturn } from './useChartManagement';

export { useAlertManagement } from './useAlertManagement';
export type { UseAlertManagementReturn } from './useAlertManagement';

import apiClient from '../utils/api';

export interface DashboardStats {
  activeProjects: number;
  srRequestsThisMonth: number;
  pendingApprovals: number;
  completionRate: number;
  totalUsers: number;
  totalIssues: number;
  totalIncidents: number;
  totalAssets: number;
  activeProjectsTrend: number;
  srRequestsTrend: number;
  pendingApprovalsTrend: number;
  completionRateTrend: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

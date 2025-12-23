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

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  status: string;
  userName: string;
}

export interface RecentActivitiesPage {
  content: RecentActivity[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getRecentActivities = async (limit: number = 10): Promise<RecentActivity[]> => {
  const response = await apiClient.get<RecentActivity[]>('/dashboard/activities', {
    params: { limit }
  });
  return response.data;
};

export const getAllRecentActivities = async (
  page: number = 0,
  size: number = 20,
  type?: string
): Promise<RecentActivitiesPage> => {
  const response = await apiClient.get<RecentActivitiesPage>('/dashboard/activities/all', {
    params: { page, size, type }
  });
  return response.data;
};

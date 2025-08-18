import { useQuery, useQueries, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Dashboard-specific query hooks for various dashboard data
 */

// Types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalOrders: number;
  conversionRate: number;
  bounceRate: number;
  pageViews: number;
  sessionDuration: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }[];
}

export interface SalesData {
  total: number;
  growth: number;
  period: string;
  breakdown: {
    date: string;
    amount: number;
  }[];
}

export interface OrdersData {
  total: number;
  growth: number;
  period: string;
  statusBreakdown: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface ActiveUsersData {
  total: number;
  growth: number;
  period: string;
  breakdown: {
    date: string;
    count: number;
  }[];
}

export interface WeeklySalesData {
  weeks: number;
  data: {
    week: string;
    sales: number;
    growth: number;
  }[];
  totalSales: number;
  averageWeeklySales: number;
}

export interface BestSellingProduct {
  id: string | number;
  name: string;
  sales: number;
  revenue: number;
  imageUrl?: string;
  category: string;
}

export interface MarketShareData {
  segments: {
    name: string;
    percentage: number;
    value: number;
    color: string;
  }[];
  totalMarket: number;
  ourShare: number;
}

export interface RunningProject {
  id: string | number;
  name: string;
  progress: number;
  status: 'active' | 'paused' | 'completed' | 'delayed';
  startDate: string;
  endDate: string;
  team: {
    id: string | number;
    name: string;
    avatar?: string;
  }[];
  budget: number;
  spent: number;
}

export interface StorageStatus {
  used: number;
  total: number;
  percentage: number;
  breakdown: {
    type: string;
    size: number;
    percentage: number;
  }[];
}

export type DashboardType = 'default' | 'analytics' | 'crm' | 'ecommerce' | 'project-management' | 'saas' | 'support-desk';
export type TimeRange = '7d' | '30d' | '90d' | '1y';

// API functions for dashboard data
const fetchDashboardStats = async (dashboardType: DashboardType = 'default'): Promise<DashboardStats> => {
  const response = await fetch(`/api/dashboard/${dashboardType}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${dashboardType} dashboard stats`);
  }
  return response.json();
};

const fetchWeatherData = async (location: string = 'New York'): Promise<WeatherData> => {
  const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
};

const fetchTotalSales = async (timeRange: TimeRange = '30d'): Promise<SalesData> => {
  const response = await fetch(`/api/sales/total?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch total sales');
  }
  return response.json();
};

const fetchTotalOrders = async (timeRange: TimeRange = '30d'): Promise<OrdersData> => {
  const response = await fetch(`/api/orders/total?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch total orders');
  }
  return response.json();
};

const fetchActiveUsers = async (timeRange: TimeRange = '7d'): Promise<ActiveUsersData> => {
  const response = await fetch(`/api/users/active?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch active users');
  }
  return response.json();
};

const fetchWeeklySales = async (weeks: number = 12): Promise<WeeklySalesData> => {
  const response = await fetch(`/api/sales/weekly?weeks=${weeks}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weekly sales');
  }
  return response.json();
};

const fetchBestSellingProducts = async (limit: number = 10): Promise<BestSellingProduct[]> => {
  const response = await fetch(`/api/products/best-selling?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch best selling products');
  }
  return response.json();
};

const fetchMarketShare = async (): Promise<MarketShareData> => {
  const response = await fetch('/api/analytics/market-share');
  if (!response.ok) {
    throw new Error('Failed to fetch market share');
  }
  return response.json();
};

const fetchRunningProjects = async (): Promise<RunningProject[]> => {
  const response = await fetch('/api/projects/running');
  if (!response.ok) {
    throw new Error('Failed to fetch running projects');
  }
  return response.json();
};

const fetchStorageStatus = async (): Promise<StorageStatus> => {
  const response = await fetch('/api/storage/status');
  if (!response.ok) {
    throw new Error('Failed to fetch storage status');
  }
  return response.json();
};

// Dashboard-specific hooks
export const useDashboardStats = (
  dashboardType: DashboardType = 'default',
  options: Omit<UseQueryOptions<DashboardStats, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['dashboard', dashboardType, 'stats'],
    queryFn: () => fetchDashboardStats(dashboardType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useWeatherData = (
  location: string = 'New York',
  options: Omit<UseQueryOptions<WeatherData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['weather', location],
    queryFn: () => fetchWeatherData(location),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

export const useTotalSales = (
  timeRange: TimeRange = '30d',
  options: Omit<UseQueryOptions<SalesData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['sales', 'total', timeRange],
    queryFn: () => fetchTotalSales(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useTotalOrders = (
  timeRange: TimeRange = '30d',
  options: Omit<UseQueryOptions<OrdersData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['orders', 'total', timeRange],
    queryFn: () => fetchTotalOrders(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useActiveUsers = (
  timeRange: TimeRange = '7d',
  options: Omit<UseQueryOptions<ActiveUsersData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['users', 'active', timeRange],
    queryFn: () => fetchActiveUsers(timeRange),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useWeeklySales = (
  weeks: number = 12,
  options: Omit<UseQueryOptions<WeeklySalesData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['sales', 'weekly', weeks],
    queryFn: () => fetchWeeklySales(weeks),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

export const useBestSellingProducts = (
  limit: number = 10,
  options: Omit<UseQueryOptions<BestSellingProduct[], Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['products', 'best-selling', limit],
    queryFn: () => fetchBestSellingProducts(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

export const useMarketShare = (options: Omit<UseQueryOptions<MarketShareData, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['analytics', 'market-share'],
    queryFn: fetchMarketShare,
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

export const useRunningProjects = (options: Omit<UseQueryOptions<RunningProject[], Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['projects', 'running'],
    queryFn: fetchRunningProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useStorageStatus = (options: Omit<UseQueryOptions<StorageStatus, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['storage', 'status'],
    queryFn: fetchStorageStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Combined dashboard data hooks
export const useDefaultDashboard = (timeRange: TimeRange = '30d') => {
  return useQueries({
    queries: [
      {
        queryKey: ['sales', 'total', timeRange],
        queryFn: () => fetchTotalSales(timeRange),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['orders', 'total', timeRange],
        queryFn: () => fetchTotalOrders(timeRange),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['users', 'active', '7d'],
        queryFn: () => fetchActiveUsers('7d'),
        staleTime: 1000 * 60 * 10,
      },
      {
        queryKey: ['sales', 'weekly', 12],
        queryFn: () => fetchWeeklySales(12),
        staleTime: 1000 * 60 * 15,
      },
      {
        queryKey: ['products', 'best-selling', 5],
        queryFn: () => fetchBestSellingProducts(5),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: ['storage', 'status'],
        queryFn: fetchStorageStatus,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['weather', 'New York'],
        queryFn: () => fetchWeatherData('New York'),
        staleTime: 1000 * 60 * 15,
      },
    ],
  });
};

export const useAnalyticsDashboard = (timeRange: TimeRange = '30d') => {
  return useQueries({
    queries: [
      {
        queryKey: ['analytics', 'overview'],
        queryFn: () => fetchDashboardStats('analytics'),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['analytics', 'market-share'],
        queryFn: fetchMarketShare,
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: ['users', 'active', timeRange],
        queryFn: () => fetchActiveUsers(timeRange),
        staleTime: 1000 * 60 * 10,
      },
    ],
  });
};

export const useCrmDashboard = () => {
  return useQueries({
    queries: [
      {
        queryKey: ['dashboard', 'crm', 'stats'],
        queryFn: () => fetchDashboardStats('crm'),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['sales', 'total', '30d'],
        queryFn: () => fetchTotalSales('30d'),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['projects', 'running'],
        queryFn: fetchRunningProjects,
        staleTime: 1000 * 60 * 5,
      },
    ],
  });
};

export const useProjectManagementDashboard = () => {
  return useQueries({
    queries: [
      {
        queryKey: ['projects', 'running'],
        queryFn: fetchRunningProjects,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['users', 'active', '7d'],
        queryFn: () => fetchActiveUsers('7d'),
        staleTime: 1000 * 60 * 10,
      },
      {
        queryKey: ['dashboard', 'project-management', 'stats'],
        queryFn: () => fetchDashboardStats('project-management'),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });
};
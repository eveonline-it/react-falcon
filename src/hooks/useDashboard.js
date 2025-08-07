import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Dashboard-specific query hooks for various dashboard data
 */

// API functions for dashboard data
const fetchDashboardStats = async (dashboardType = 'default') => {
  const response = await fetch(`/api/dashboard/${dashboardType}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${dashboardType} dashboard stats`);
  }
  return response.json();
};

const fetchWeatherData = async (location = 'New York') => {
  const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
};

const fetchTotalSales = async (timeRange = '30d') => {
  const response = await fetch(`/api/sales/total?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch total sales');
  }
  return response.json();
};

const fetchTotalOrders = async (timeRange = '30d') => {
  const response = await fetch(`/api/orders/total?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch total orders');
  }
  return response.json();
};

const fetchActiveUsers = async (timeRange = '7d') => {
  const response = await fetch(`/api/users/active?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch active users');
  }
  return response.json();
};

const fetchWeeklySales = async (weeks = 12) => {
  const response = await fetch(`/api/sales/weekly?weeks=${weeks}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weekly sales');
  }
  return response.json();
};

const fetchBestSellingProducts = async (limit = 10) => {
  const response = await fetch(`/api/products/best-selling?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch best selling products');
  }
  return response.json();
};

const fetchMarketShare = async () => {
  const response = await fetch('/api/analytics/market-share');
  if (!response.ok) {
    throw new Error('Failed to fetch market share');
  }
  return response.json();
};

const fetchRunningProjects = async () => {
  const response = await fetch('/api/projects/running');
  if (!response.ok) {
    throw new Error('Failed to fetch running projects');
  }
  return response.json();
};

const fetchStorageStatus = async () => {
  const response = await fetch('/api/storage/status');
  if (!response.ok) {
    throw new Error('Failed to fetch storage status');
  }
  return response.json();
};

// Dashboard-specific hooks
export const useDashboardStats = (dashboardType = 'default', options = {}) => {
  return useQuery({
    queryKey: ['dashboard', dashboardType, 'stats'],
    queryFn: () => fetchDashboardStats(dashboardType),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useWeatherData = (location = 'New York', options = {}) => {
  return useQuery({
    queryKey: ['weather', location],
    queryFn: () => fetchWeatherData(location),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

export const useTotalSales = (timeRange = '30d', options = {}) => {
  return useQuery({
    queryKey: ['sales', 'total', timeRange],
    queryFn: () => fetchTotalSales(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useTotalOrders = (timeRange = '30d', options = {}) => {
  return useQuery({
    queryKey: ['orders', 'total', timeRange],
    queryFn: () => fetchTotalOrders(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useActiveUsers = (timeRange = '7d', options = {}) => {
  return useQuery({
    queryKey: ['users', 'active', timeRange],
    queryFn: () => fetchActiveUsers(timeRange),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

export const useWeeklySales = (weeks = 12, options = {}) => {
  return useQuery({
    queryKey: ['sales', 'weekly', weeks],
    queryFn: () => fetchWeeklySales(weeks),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

export const useBestSellingProducts = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['products', 'best-selling', limit],
    queryFn: () => fetchBestSellingProducts(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

export const useMarketShare = (options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'market-share'],
    queryFn: fetchMarketShare,
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

export const useRunningProjects = (options = {}) => {
  return useQuery({
    queryKey: ['projects', 'running'],
    queryFn: fetchRunningProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useStorageStatus = (options = {}) => {
  return useQuery({
    queryKey: ['storage', 'status'],
    queryFn: fetchStorageStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Combined dashboard data hooks
export const useDefaultDashboard = (timeRange = '30d') => {
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

export const useAnalyticsDashboard = (timeRange = '30d') => {
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
import { useQuery, useQueries } from '@tanstack/react-query';

// Example API functions for analytics data
const fetchAnalyticsOverview = async () => {
  // Simulate API call for dashboard analytics
  const response = await fetch('/api/analytics/overview');
  if (!response.ok) {
    throw new Error('Failed to fetch analytics overview');
  }
  return response.json();
};

const fetchRevenueData = async (timeRange = '30d') => {
  const response = await fetch(`/api/analytics/revenue?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  return response.json();
};

const fetchTrafficData = async (timeRange = '30d') => {
  const response = await fetch(`/api/analytics/traffic?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch traffic data');
  }
  return response.json();
};

const fetchTopProducts = async (limit = 10) => {
  const response = await fetch(`/api/analytics/top-products?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch top products');
  }
  return response.json();
};

// Hook for analytics overview
export const useAnalyticsOverview = (options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: fetchAnalyticsOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Hook for revenue data
export const useRevenueData = (timeRange = '30d', options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', timeRange],
    queryFn: () => fetchRevenueData(timeRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Hook for traffic data
export const useTrafficData = (timeRange = '30d', options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'traffic', timeRange],
    queryFn: () => fetchTrafficData(timeRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Hook for top products
export const useTopProducts = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: () => fetchTopProducts(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

// Hook for fetching multiple analytics data at once
export const useAnalyticsDashboard = (timeRange = '30d') => {
  return useQueries({
    queries: [
      {
        queryKey: ['analytics', 'overview'],
        queryFn: fetchAnalyticsOverview,
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ['analytics', 'revenue', timeRange],
        queryFn: () => fetchRevenueData(timeRange),
        staleTime: 1000 * 60 * 15,
      },
      {
        queryKey: ['analytics', 'traffic', timeRange],
        queryFn: () => fetchTrafficData(timeRange),
        staleTime: 1000 * 60 * 15,
      },
      {
        queryKey: ['analytics', 'top-products', 10],
        queryFn: () => fetchTopProducts(10),
        staleTime: 1000 * 60 * 30,
      },
    ],
  });
};
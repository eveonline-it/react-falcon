import { useQuery, useQueries, UseQueryOptions } from '@tanstack/react-query';

// Types
export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  period: string;
  lastUpdated: string;
}

export interface RevenueData {
  period: string;
  revenue: number;
  previousRevenue?: number;
  growth: number;
  breakdown: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface TrafficData {
  period: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: {
    page: string;
    views: number;
    uniqueViews: number;
  }[];
  trafficSources: {
    source: string;
    visitors: number;
    percentage: number;
  }[];
}

export interface Product {
  id: string | number;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
  imageUrl?: string;
  category?: string;
}

export interface TopProductsData {
  products: Product[];
  period: string;
  totalProducts: number;
}

export type TimeRange = '7d' | '30d' | '90d' | '1y';

// Example API functions for analytics data
const fetchAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  // Simulate API call for dashboard analytics
  const response = await fetch('/api/analytics/overview');
  if (!response.ok) {
    throw new Error('Failed to fetch analytics overview');
  }
  return response.json();
};

const fetchRevenueData = async (timeRange: TimeRange = '30d'): Promise<RevenueData> => {
  const response = await fetch(`/api/analytics/revenue?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  return response.json();
};

const fetchTrafficData = async (timeRange: TimeRange = '30d'): Promise<TrafficData> => {
  const response = await fetch(`/api/analytics/traffic?range=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch traffic data');
  }
  return response.json();
};

const fetchTopProducts = async (limit: number = 10): Promise<TopProductsData> => {
  const response = await fetch(`/api/analytics/top-products?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch top products');
  }
  return response.json();
};

// Hook for analytics overview
export const useAnalyticsOverview = (options: Omit<UseQueryOptions<AnalyticsOverview, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: fetchAnalyticsOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Hook for revenue data
export const useRevenueData = (
  timeRange: TimeRange = '30d',
  options: Omit<UseQueryOptions<RevenueData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', timeRange],
    queryFn: () => fetchRevenueData(timeRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Hook for traffic data
export const useTrafficData = (
  timeRange: TimeRange = '30d',
  options: Omit<UseQueryOptions<TrafficData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['analytics', 'traffic', timeRange],
    queryFn: () => fetchTrafficData(timeRange),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// Hook for top products
export const useTopProducts = (
  limit: number = 10,
  options: Omit<UseQueryOptions<TopProductsData, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: () => fetchTopProducts(limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

// Hook for fetching multiple analytics data at once
export const useAnalyticsDashboard = (timeRange: TimeRange = '30d') => {
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
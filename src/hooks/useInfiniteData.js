import { useInfiniteQuery } from '@tanstack/react-query';

// Example API function for paginated data
const fetchPaginatedData = async ({ pageParam = 1, queryKey }) => {
  const [, , endpoint, ...filters] = queryKey;
  const filterParams = filters.length > 0 ? `&${new URLSearchParams(filters[0]).toString()}` : '';
  
  const response = await fetch(
    `/api/${endpoint}?page=${pageParam}&limit=20${filterParams}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint} data`);
  }
  
  const data = await response.json();
  return {
    data: data.items,
    nextPage: data.hasMore ? pageParam + 1 : undefined,
    totalCount: data.totalCount,
  };
};

// Generic hook for infinite scrolling data
export const useInfiniteData = (endpoint, filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['infinite', 'data', endpoint, filters],
    queryFn: fetchPaginatedData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage, allPages) => {
      return allPages.length > 1 ? allPages.length - 1 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Specific hooks for common use cases
export const useInfiniteProducts = (filters = {}, options = {}) => {
  return useInfiniteData('products', filters, options);
};

export const useInfiniteOrders = (filters = {}, options = {}) => {
  return useInfiniteData('orders', filters, options);
};

export const useInfiniteCustomers = (filters = {}, options = {}) => {
  return useInfiniteData('customers', filters, options);
};

export const useInfiniteNotifications = (options = {}) => {
  return useInfiniteData('notifications', {}, options);
};

// Helper hook to flatten infinite query data
export const useFlattenedInfiniteData = (infiniteQuery) => {
  return {
    ...infiniteQuery,
    flatData: infiniteQuery.data?.pages?.flatMap(page => page.data) ?? [],
    totalCount: infiniteQuery.data?.pages?.[0]?.totalCount ?? 0,
  };
};
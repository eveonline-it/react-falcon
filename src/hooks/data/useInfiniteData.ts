import { useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData, QueryKey } from '@tanstack/react-query';

// Types
export interface PaginatedApiResponse<T> {
  items: T[];
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface InfiniteDataPage<T> {
  data: T[];
  nextPage?: number;
  totalCount: number;
}

export interface InfiniteQueryParams {
  pageParam?: number;
  queryKey: QueryKey;
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface Order {
  id: string | number;
  orderNumber: string;
  customerId: string | number;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  date: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string | number;
  productId: string | number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
}

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

// Example API function for paginated data
const fetchPaginatedData = async <T>({ pageParam = 1, queryKey }: InfiniteQueryParams): Promise<InfiniteDataPage<T>> => {
  const [, , endpoint, ...filters] = queryKey;
  const filterParams = filters.length > 0 ? `&${new URLSearchParams(filters[0] as Record<string, string>).toString()}` : '';
  
  const response = await fetch(
    `/api/${endpoint}?page=${pageParam}&limit=20${filterParams}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint} data`);
  }
  
  const data: PaginatedApiResponse<T> = await response.json();
  return {
    data: data.items,
    nextPage: data.hasMore ? pageParam + 1 : undefined,
    totalCount: data.totalCount,
  };
};

// Generic hook for infinite scrolling data
export const useInfiniteData = <T = any>(
  endpoint: string,
  filters: FilterParams = {},
  options: Omit<UseInfiniteQueryOptions<InfiniteDataPage<T>, Error, InfiniteData<InfiniteDataPage<T>>, InfiniteDataPage<T>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['infinite', 'data', endpoint, filters],
    queryFn: (params) => fetchPaginatedData<T>(params),
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
export const useInfiniteProducts = (
  filters: FilterParams = {},
  options: Omit<UseInfiniteQueryOptions<InfiniteDataPage<Product>, Error, InfiniteData<InfiniteDataPage<Product>>, InfiniteDataPage<Product>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'> = {}
) => {
  return useInfiniteData<Product>('products', filters, options);
};

export const useInfiniteOrders = (
  filters: FilterParams = {},
  options: Omit<UseInfiniteQueryOptions<InfiniteDataPage<Order>, Error, InfiniteData<InfiniteDataPage<Order>>, InfiniteDataPage<Order>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'> = {}
) => {
  return useInfiniteData<Order>('orders', filters, options);
};

export const useInfiniteCustomers = (
  filters: FilterParams = {},
  options: Omit<UseInfiniteQueryOptions<InfiniteDataPage<Customer>, Error, InfiniteData<InfiniteDataPage<Customer>>, InfiniteDataPage<Customer>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'> = {}
) => {
  return useInfiniteData<Customer>('customers', filters, options);
};

export const useInfiniteNotifications = (
  options: Omit<UseInfiniteQueryOptions<InfiniteDataPage<Notification>, Error, InfiniteData<InfiniteDataPage<Notification>>, InfiniteDataPage<Notification>, QueryKey, number>, 'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'> = {}
) => {
  return useInfiniteData<Notification>('notifications', {}, options);
};

// Helper hook to flatten infinite query data
export const useFlattenedInfiniteData = <T>(infiniteQuery: {
  data?: InfiniteData<InfiniteDataPage<T>>;
  [key: string]: any;
}) => {
  return {
    ...infiniteQuery,
    flatData: infiniteQuery.data?.pages?.flatMap(page => page.data) ?? [],
    totalCount: infiniteQuery.data?.pages?.[0]?.totalCount ?? 0,
  };
};
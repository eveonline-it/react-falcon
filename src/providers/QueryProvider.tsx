import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: ReactNode;
}

interface ErrorWithStatus {
  status?: number;
}

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds after data is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Time in milliseconds after which inactive queries will be removed from the cache
      gcTime: 1000 * 60 * 10, // 10 minutes (previously cacheTime)
      // Retry failed requests
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        const errorWithStatus = error as ErrorWithStatus;
        if (errorWithStatus?.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Refetch on window focus (useful for keeping data fresh)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations
      retry: 1,
    },
  },
});

const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;
export { queryClient };
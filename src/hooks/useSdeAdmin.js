import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Query Keys
const SDE_ADMIN_QUERY_KEYS = {
  status: () => ['sde', 'status'],
  memory: () => ['sde', 'memory'],
  stats: () => ['sde', 'stats'],
  verify: () => ['sde', 'verify'],
};

/**
 * Hook to get SDE admin module status
 */
export const useSdeAdminStatus = (options = {}) => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.status(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SDE admin status: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 60000, // 1 minute for module status
    ...options,
  });
};

/**
 * Hook to get SDE memory status and usage
 */
export const useSdeMemoryStatus = (options = {}) => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.memory(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/memory`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SDE memory status: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds for real-time memory monitoring
    refetchInterval: options.enablePolling ? 10000 : false, // Poll every 10 seconds when enabled
    ...options,
  });
};

/**
 * Hook to get detailed SDE statistics
 */
export const useSdeStats = (options = {}) => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SDE stats: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 60000, // 1 minute for statistics
    ...options,
  });
};


/**
 * Hook to verify SDE data integrity
 */
export const useSdeVerifyIntegrity = (options = {}) => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.verify(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify SDE integrity: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 300000, // 5 minutes for integrity checks
    enabled: options.enabled !== false, // Allow disabling by default
    ...options,
  });
};

/**
 * Hook to reload SDE data from files
 */
export const useReloadSdeData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dataTypes } = {}) => {
      const requestBody = {};
      
      if (dataTypes && dataTypes.length > 0) {
        requestBody.data_types = dataTypes;
      }

      const response = await fetch(`${BASE_URL}/sde/reload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.detail || `Failed to reload SDE data: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      const reloadedTypes = data.body?.reloaded_data_types || [];
      const message = reloadedTypes.length > 0 
        ? `Successfully reloaded ${reloadedTypes.length} data types`
        : 'SDE data reload completed';
      
      toast.success(message);
      
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sde'] });
    },
    onError: (error) => {
      toast.error(`Failed to reload SDE data: ${error.message}`);
    },
  });
};

/**
 * Combined hook for all SDE admin operations with real-time monitoring
 */
export const useSdeAdminManager = (enablePolling = true) => {
  const moduleStatus = useSdeAdminStatus();
  const memoryStatus = useSdeMemoryStatus({ enablePolling });
  const stats = useSdeStats();
  const integrity = useSdeVerifyIntegrity({ enabled: false }); // Manual trigger only
  const reloadMutation = useReloadSdeData();

  return {
    // Data
    moduleStatus: moduleStatus.data?.body,
    memoryStatus: memoryStatus.data?.body,
    stats: stats.data?.body,
    integrity: integrity.data?.body,
    
    // Loading states
    isLoadingModuleStatus: moduleStatus.isLoading,
    isLoadingMemoryStatus: memoryStatus.isLoading,
    isLoadingStats: stats.isLoading,
    isLoadingIntegrity: integrity.isLoading,
    isReloading: reloadMutation.isPending,
    
    // Error states
    moduleStatusError: moduleStatus.error,
    memoryStatusError: memoryStatus.error,
    statsError: stats.error,
    integrityError: integrity.error,
    reloadError: reloadMutation.error,
    
    // Actions
    reloadData: reloadMutation.mutate,
    verifyIntegrity: () => integrity.refetch(),
    refetchMemoryStatus: memoryStatus.refetch,
    refetchStats: stats.refetch,
    
    // Mutation objects for advanced usage
    reloadMutation,
    integrityQuery: integrity,
    
    // Computed values
    isHealthy: moduleStatus.data?.body?.status === 'healthy',
    totalDataTypes: memoryStatus.data?.body?.total_data_types || 0,
    loadedDataTypes: memoryStatus.data?.body?.loaded_data_types?.length || 0,
    memoryUsageMB: memoryStatus.data?.body?.memory_usage?.total_estimated_mb || 0,
    totalItems: stats.data?.body?.total_items || 0,
  };
};

// Legacy compatibility exports (deprecated - use useSdeAdminManager instead)
export const useSdeStatus = useSdeMemoryStatus;
export const useSdeManager = useSdeAdminManager;
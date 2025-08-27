import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Query Keys
const SDE_QUERY_KEYS = {
  status: () => ['sde', 'status'],
  stats: () => ['sde', 'stats'],
};

/**
 * Hook to get SDE import status and progress
 */
export const useSdeStatus = (options = {}) => {
  return useQuery({
    queryKey: SDE_QUERY_KEYS.status(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SDE status: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds for real-time updates
    refetchInterval: options.enablePolling ? 5000 : false, // Poll every 5 seconds when enabled
    ...options,
  });
};

/**
 * Hook to get SDE usage statistics and metrics
 */
export const useSdeStats = (options = {}) => {
  return useQuery({
    queryKey: SDE_QUERY_KEYS.stats(),
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
    staleTime: 60000, // 1 minute for stats
    ...options,
  });
};

/**
 * Hook to trigger SDE import
 */
export const useImportSde = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ batchSize, dataTypes, force } = {}) => {
      const requestBody = {};
      
      if (batchSize) requestBody.batch_size = batchSize;
      if (dataTypes && dataTypes.length > 0) requestBody.data_types = dataTypes;
      if (force !== undefined) requestBody.force = force;

      const response = await fetch(`${BASE_URL}/sde/import`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to start SDE import: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('SDE import started successfully');
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: SDE_QUERY_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SDE_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      toast.error(`Failed to start SDE import: ${error.message}`);
    },
  });
};

/**
 * Hook to clear existing SDE data
 */
export const useClearSde = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/clear`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to clear SDE data: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('SDE data cleared successfully');
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: SDE_QUERY_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: SDE_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      toast.error(`Failed to clear SDE data: ${error.message}`);
    },
  });
};

/**
 * Combined hook for all SDE operations with real-time updates
 */
export const useSdeManager = (enablePolling = true) => {
  const status = useSdeStatus({ enablePolling });
  const stats = useSdeStats();
  const importMutation = useImportSde();
  const clearMutation = useClearSde();

  return {
    // Data
    status: status.data,
    stats: stats.data,
    
    // Loading states
    isLoadingStatus: status.isLoading,
    isLoadingStats: stats.isLoading,
    isImporting: importMutation.isPending,
    isClearing: clearMutation.isPending,
    
    // Error states
    statusError: status.error,
    statsError: stats.error,
    importError: importMutation.error,
    clearError: clearMutation.error,
    
    // Actions
    startImport: importMutation.mutate,
    clearData: clearMutation.mutate,
    refetchStatus: status.refetch,
    refetchStats: stats.refetch,
    
    // Mutation objects for advanced usage
    importMutation,
    clearMutation,
  };
};
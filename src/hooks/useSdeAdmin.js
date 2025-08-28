import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Query Keys
const SDE_ADMIN_QUERY_KEYS = {
  status: () => ['sde', 'status'],
  memory: () => ['sde', 'memory'],
  stats: () => ['sde', 'stats'],
  verify: () => ['sde', 'verify'],
  checkUpdates: () => ['sde', 'check-updates'],
  backups: () => ['sde', 'backups'],
  sources: () => ['sde', 'sources'],
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
      const reloadedTypes = data.reloaded_data_types || [];
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
 * Hook to check for SDE updates
 */
export const useSdeCheckUpdates = () => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.checkUpdates(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/check-updates`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to check for SDE updates: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 300000, // 5 minutes for update checks
    enabled: false, // Manual trigger only
  });
};

/**
 * Hook to list SDE backups
 */
export const useSdeBackups = (options = {}) => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.backups(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/backups`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SDE backups: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 60000, // 1 minute for backups list
    ...options,
  });
};

/**
 * Hook to get SDE sources configuration
 */
export const useSdeSources = (options = {}) => {
  return useQuery({
    queryKey: SDE_ADMIN_QUERY_KEYS.sources(),
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/sde/sources`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch SDE sources: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 300000, // 5 minutes for sources config
    ...options,
  });
};

/**
 * Hook to update SDE data from external sources
 */
export const useUpdateSdeData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ source, convertToJson = true, backupCurrent = true, format, url } = {}) => {
      const requestBody = {
        source,
        convert_to_json: convertToJson,
        backup_current: backupCurrent,
      };
      
      if (format) requestBody.format = format;
      if (url) requestBody.url = url;

      const response = await fetch(`${BASE_URL}/sde/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.detail || `Failed to update SDE data: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      const message = data.backup_created 
        ? `SDE updated successfully. Backup created: ${data.backup_id}`
        : 'SDE updated successfully';
      
      toast.success(message);
      
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sde'] });
    },
    onError: (error) => {
      toast.error(`Failed to update SDE data: ${error.message}`);
    },
  });
};

/**
 * Hook to restore SDE from backup
 */
export const useRestoreSdeBackup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ backupId, deleteBackup = false } = {}) => {
      const requestBody = {
        backup_id: backupId,
        delete_backup: deleteBackup,
      };

      const response = await fetch(`${BASE_URL}/sde/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.detail || `Failed to restore SDE backup: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      const message = data.backup_deleted 
        ? `SDE restored successfully from backup ${data.backup_id}. Backup deleted.`
        : `SDE restored successfully from backup ${data.backup_id}`;
      
      toast.success(message);
      
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sde'] });
    },
    onError: (error) => {
      toast.error(`Failed to restore SDE backup: ${error.message}`);
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
  
  // New update functionality hooks
  const checkUpdates = useSdeCheckUpdates();
  const backups = useSdeBackups();
  const sources = useSdeSources();
  const updateMutation = useUpdateSdeData();
  const restoreMutation = useRestoreSdeBackup();

  return {
    // Data
    moduleStatus: moduleStatus.data,
    memoryStatus: memoryStatus.data,
    stats: stats.data,
    integrity: integrity.data,
    updateStatus: checkUpdates.data,
    backups: backups.data,
    sources: sources.data,
    
    // Loading states
    isLoadingModuleStatus: moduleStatus.isLoading,
    isLoadingMemoryStatus: memoryStatus.isLoading,
    isLoadingStats: stats.isLoading,
    isLoadingIntegrity: integrity.isLoading,
    isReloading: reloadMutation.isPending,
    isCheckingUpdates: checkUpdates.isLoading,
    isLoadingBackups: backups.isLoading,
    isLoadingSources: sources.isLoading,
    isUpdating: updateMutation.isPending,
    isRestoring: restoreMutation.isPending,
    
    // Error states
    moduleStatusError: moduleStatus.error,
    memoryStatusError: memoryStatus.error,
    statsError: stats.error,
    integrityError: integrity.error,
    reloadError: reloadMutation.error,
    updateCheckError: checkUpdates.error,
    backupsError: backups.error,
    sourcesError: sources.error,
    updateError: updateMutation.error,
    restoreError: restoreMutation.error,
    
    // Actions
    reloadData: reloadMutation.mutate,
    verifyIntegrity: () => integrity.refetch(),
    checkForUpdates: () => checkUpdates.refetch(),
    updateSdeData: updateMutation.mutate,
    restoreBackup: restoreMutation.mutate,
    refetchMemoryStatus: memoryStatus.refetch,
    refetchStats: stats.refetch,
    refetchBackups: backups.refetch,
    refetchSources: sources.refetch,
    
    // Mutation objects for advanced usage
    reloadMutation,
    integrityQuery: integrity,
    checkUpdatesQuery: checkUpdates,
    backupsQuery: backups,
    sourcesQuery: sources,
    updateMutation,
    restoreMutation,
    
    // Computed values
    isHealthy: moduleStatus.data?.status === 'healthy',
    totalDataTypes: memoryStatus.data?.total_data_types || 0,
    loadedDataTypes: memoryStatus.data?.loaded_data_types?.length || 0,
    memoryUsageMB: memoryStatus.data?.total_memory_usage ? (memoryStatus.data.total_memory_usage / (1024 * 1024)) : 0,
    totalItems: memoryStatus.data?.total_items || 0,
    updatesAvailable: checkUpdates.data?.updates_available || false,
    totalBackups: backups.data?.total_count || 0,
    totalBackupSizeMB: backups.data?.total_size_mb || 0,
  };
};

// Legacy compatibility exports (deprecated - use useSdeAdminManager instead)
export const useSdeStatus = useSdeMemoryStatus;
export const useSdeManager = useSdeAdminManager;
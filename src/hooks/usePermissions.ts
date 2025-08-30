import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Interfaces
interface Permission {
  id: string;
  name: string;
  description?: string;
  service: string;
  category: string;
  static: boolean;
  created_at: string;
  updated_at: string;
}

interface PermissionsResponse {
  permissions: Permission[];
  total: number;
  page: number;
  limit: number;
}

interface PermissionCheckRequest {
  permissionId: string;
  characterId?: string | null;
}

interface PermissionCheckResponse {
  granted: boolean;
  reason?: string;
  permission: Permission;
  character?: {
    id: string;
    name: string;
  };
}

interface PermissionsFilters {
  service?: string;
  category?: string;
  static?: boolean;
  page?: number;
  limit?: number;
}

interface PermissionsStats {
  total_permissions: number;
  services: string[];
  categories: string[];
  static_count: number;
  dynamic_count: number;
}

interface PermissionsHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
  timestamp: string;
}

interface ApiError extends Error {
  status?: number;
  response?: any;
}

const fetcher = async (url: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`) as ApiError;
    error.status = response.status;
    error.response = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

export const usePermissions = (filters: PermissionsFilters = {}) => {
  return useQuery<PermissionsResponse, ApiError>({
    queryKey: ['permissions', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.service) params.append('service', filters.service);
      if (filters.category) params.append('category', filters.category);
      if (filters.static !== undefined) params.append('static', String(filters.static));
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      
      return fetcher(`/permissions?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const usePermission = (id: string) => {
  return useQuery<Permission, ApiError>({
    queryKey: ['permissions', id],
    queryFn: () => fetcher(`/permissions/${id}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useCheckPermission = (permissionId: string, characterId: string | null = null) => {
  return useQuery<PermissionCheckResponse, ApiError>({
    queryKey: ['permissions', permissionId, 'check', characterId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (characterId) params.append('character_id', characterId);
      
      return fetcher(`/permissions/${permissionId}/check?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 2, // Shorter stale time for permission checks
    enabled: !!permissionId,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const usePermissionCheck = () => {
  const queryClient = useQueryClient();

  return useMutation<PermissionCheckResponse, ApiError, PermissionCheckRequest>({
    mutationFn: ({ permissionId, characterId }) => {
      const params = new URLSearchParams();
      if (characterId) params.append('character_id', characterId);
      
      return fetcher(`/permissions/${permissionId}/check?${params.toString()}`);
    },
    onSuccess: (data, variables) => {
      // Update the cache with the result
      queryClient.setQueryData(
        ['permissions', variables.permissionId, 'check', variables.characterId],
        data
      );
      
      if (data.granted) {
        toast.success('Permission granted!');
      } else {
        toast.info('Permission denied');
      }
      
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to check permission';
      toast.error(message);
      throw error;
    },
  });
};

export const usePermissionsStats = () => {
  return useQuery<PermissionsStats, ApiError>({
    queryKey: ['permissions', 'stats'],
    queryFn: () => fetcher('/permissions/stats'),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 2;
    },
  });
};

export const usePermissionsHealth = () => {
  return useQuery<PermissionsHealth, ApiError>({
    queryKey: ['permissions', 'health'],
    queryFn: () => fetcher('/permissions/health'),
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 2;
    },
  });
};
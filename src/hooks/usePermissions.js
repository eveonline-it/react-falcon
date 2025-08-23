import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

const fetcher = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.response = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

export const usePermissions = (filters = {}) => {
  return useQuery({
    queryKey: ['permissions', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.service) params.append('service', filters.service);
      if (filters.category) params.append('category', filters.category);
      if (filters.static !== undefined) params.append('static', filters.static);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      return fetcher(`/permissions?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const usePermission = (id) => {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => fetcher(`/permissions/${id}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

export const useCheckPermission = (permissionId, characterId = null) => {
  return useQuery({
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

  return useMutation({
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
  return useQuery({
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
  return useQuery({
    queryKey: ['permissions', 'health'],
    queryFn: () => fetcher('/permissions/health'),
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 2;
    },
  });
};
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

export const useSettings = (filters = {}) => {
  return useQuery({
    queryKey: ['settings', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.is_public !== undefined) params.append('is_public', filters.is_public);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      return fetcher(`/site-settings?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

export const usePublicSettings = (category) => {
  return useQuery({
    queryKey: ['settings', 'public', category],
    queryFn: () => {
      const params = category ? `?category=${category}` : '';
      return fetcher(`/site-settings/public${params}`);
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useSetting = (key) => {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => fetcher(`/site-settings/${key}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!key,
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return fetcher('/site-settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Setting created successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to create setting';
      toast.error(message);
      throw error;
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }) => {
      return fetcher(`/site-settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', key] });
      toast.success('Setting updated successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to update setting';
      toast.error(message);
      throw error;
    },
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key) => {
      return fetcher(`/site-settings/${key}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, key) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings', key] });
      toast.success('Setting deleted successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to delete setting';
      toast.error(message);
      throw error;
    },
  });
};

export const useSettingsHealth = () => {
  return useQuery({
    queryKey: ['settings', 'health'],
    queryFn: () => fetcher('/site-settings/health'),
    staleTime: 1000 * 60,
  });
};
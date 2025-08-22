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

// Get managed alliances
export const useManagedAlliances = (filters = {}) => {
  return useQuery({
    queryKey: ['managedAlliances', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      return fetcher(`/site-settings/alliances?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

// Get specific managed alliance
export const useManagedAlliance = (allianceId) => {
  return useQuery({
    queryKey: ['managedAlliances', allianceId],
    queryFn: () => fetcher(`/site-settings/alliances/${allianceId}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!allianceId,
  });
};

// Search alliances (EVE Online database)
export const useSearchAlliances = (query) => {
  return useQuery({
    queryKey: ['searchAlliances', query],
    queryFn: () => {
      if (!query || query.length < 3) {
        return { alliances: [] };
      }
      return fetcher(`/alliances/search?name=${encodeURIComponent(query)}`);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!query && query.length >= 3,
  });
};

// Get alliance info from EVE Online
export const useAllianceInfo = (allianceId) => {
  return useQuery({
    queryKey: ['allianceInfo', allianceId],
    queryFn: () => fetcher(`/alliances/${allianceId}`),
    staleTime: 1000 * 60 * 30, // Alliance info doesn't change often
    enabled: !!allianceId,
  });
};

// Add managed alliance
export const useAddManagedAlliance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      return fetcher('/site-settings/alliances', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['managedAlliances'] });
      toast.success('Alliance added successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to add alliance';
      toast.error(message);
      throw error;
    },
  });
};

// Update alliance status (enable/disable)
export const useUpdateAllianceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ allianceId, enabled }) => {
      return fetcher(`/site-settings/alliances/${allianceId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: (data, { allianceId }) => {
      queryClient.invalidateQueries({ queryKey: ['managedAlliances'] });
      queryClient.invalidateQueries({ queryKey: ['managedAlliances', allianceId] });
      toast.success(`Alliance ${data.enabled ? 'enabled' : 'disabled'} successfully`);
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to update alliance status';
      toast.error(message);
      throw error;
    },
  });
};

// Remove managed alliance
export const useRemoveManagedAlliance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (allianceId) => {
      return fetcher(`/site-settings/alliances/${allianceId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, allianceId) => {
      queryClient.invalidateQueries({ queryKey: ['managedAlliances'] });
      queryClient.removeQueries({ queryKey: ['managedAlliances', allianceId] });
      toast.success('Alliance removed successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to remove alliance';
      toast.error(message);
      throw error;
    },
  });
};

// Bulk update alliances (for drag and drop reordering)
export const useBulkUpdateAlliances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alliances) => {
      return fetcher('/site-settings/alliances', {
        method: 'PUT',
        body: JSON.stringify({ alliances }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['managedAlliances'] });
      toast.success('Alliances updated successfully');
      return data;
    },
    onError: (error) => {
      const message = error.response?.error || 'Failed to update alliances';
      toast.error(message);
      throw error;
    },
  });
};

// Alliance health check
export const useAllianceHealth = () => {
  return useQuery({
    queryKey: ['allianceHealth'],
    queryFn: () => fetcher('/alliances/health'),
    staleTime: 1000 * 60,
  });
};
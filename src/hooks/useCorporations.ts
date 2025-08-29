import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Types
export interface Corporation {
  corporation_id: number;
  name: string;
  ticker: string;
  member_count: number;
  description?: string;
  alliance_id?: number;
  ceo_id?: number;
  date_founded?: string;
  url?: string;
  faction_id?: number;
  home_station_id?: number;
  tax_rate?: number;
}

export interface ManagedCorporation {
  id: number;
  corporation_id: number;
  name: string;
  ticker: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CorporationFilters {
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface CustomError extends Error {
  status?: number;
  response?: any;
}

const fetcher = async (url: string, options: FetchOptions = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: CustomError = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.response = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

// Get managed corporations
export const useManagedCorporations = (filters: CorporationFilters = {}) => {
  return useQuery({
    queryKey: ['managedCorporations', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      return fetcher(`/site-settings/corporations?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount: number, error: any) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

// Get specific managed corporation
export const useManagedCorporation = (corpId: number | string) => {
  return useQuery({
    queryKey: ['managedCorporations', corpId],
    queryFn: () => fetcher(`/site-settings/corporations/${corpId}`),
    staleTime: 1000 * 60 * 5,
    enabled: !!corpId,
  });
};

// Search corporations (EVE Online database)
export const useSearchCorporations = (query: string) => {
  return useQuery({
    queryKey: ['searchCorporations', query],
    queryFn: () => {
      if (!query || query.length < 3) {
        return { corporations: [] };
      }
      return fetcher(`/corporations/search?name=${encodeURIComponent(query)}`);
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!query && query.length >= 3,
  });
};

// Get corporation info from EVE Online
export const useCorporationInfo = (corporationId: number | string | undefined) => {
  return useQuery({
    queryKey: ['corporationInfo', corporationId],
    queryFn: () => fetcher(`/corporations/${corporationId}`),
    staleTime: 1000 * 60 * 30, // Corporation info doesn't change often
    enabled: !!corporationId,
  });
};

// Add managed corporation
export const useAddManagedCorporation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      return fetcher('/site-settings/corporations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['managedCorporations'] });
      toast.success('Corporation added successfully');
      return data;
    },
    onError: (error: any) => {
      const message = error.response?.error || 'Failed to add corporation';
      toast.error(message);
      throw error;
    },
  });
};

// Update corporation status (enable/disable)
export const useUpdateCorporationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ corpId, enabled }: { corpId: number | string; enabled: boolean }) => {
      return fetcher(`/site-settings/corporations/${corpId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: (data, { corpId }) => {
      queryClient.invalidateQueries({ queryKey: ['managedCorporations'] });
      queryClient.invalidateQueries({ queryKey: ['managedCorporations', corpId] });
      toast.success(`Corporation ${data.enabled ? 'enabled' : 'disabled'} successfully`);
      return data;
    },
    onError: (error: any) => {
      const message = error.response?.error || 'Failed to update corporation status';
      toast.error(message);
      throw error;
    },
  });
};

// Remove managed corporation
export const useRemoveManagedCorporation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (corpId: number | string) => {
      return fetcher(`/site-settings/corporations/${corpId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data, corpId) => {
      queryClient.invalidateQueries({ queryKey: ['managedCorporations'] });
      queryClient.removeQueries({ queryKey: ['managedCorporations', corpId] });
      toast.success('Corporation removed successfully');
      return data;
    },
    onError: (error: any) => {
      const message = error.response?.error || 'Failed to remove corporation';
      toast.error(message);
      throw error;
    },
  });
};

// Bulk update corporations (for drag and drop reordering)
export const useBulkUpdateCorporations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (corporations: any[]) => {
      return fetcher('/site-settings/corporations', {
        method: 'PUT',
        body: JSON.stringify({ corporations }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['managedCorporations'] });
      toast.success('Corporations updated successfully');
      return data;
    },
    onError: (error: any) => {
      const message = error.response?.error || 'Failed to update corporations';
      toast.error(message);
      throw error;
    },
  });
};

// Corporation health check
export const useCorporationHealth = () => {
  return useQuery({
    queryKey: ['corporationHealth'],
    queryFn: () => fetcher('/corporations/health'),
    staleTime: 1000 * 60,
  });
};

// Get corporation member tracking
export const useCorporationMemberTracking = (
  corporationId: number | string | undefined, 
  ceoId: number | string | undefined, 
  allianceTicker?: string
) => {
  return useQuery({
    queryKey: ['corporationMemberTracking', corporationId, ceoId, allianceTicker],
    queryFn: () => {
      const params = new URLSearchParams();
      if (ceoId) params.append('ceo_id', ceoId.toString());
      if (allianceTicker) params.append('alliance_ticker', allianceTicker);
      return fetcher(`/corporations/${corporationId}/membertracking?${params.toString()}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    enabled: !!corporationId && !!ceoId,
  });
};
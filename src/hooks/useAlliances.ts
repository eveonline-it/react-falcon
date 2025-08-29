import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Type definitions
export interface Alliance {
  id: number;
  name: string;
  ticker: string;
  executor_corporation_id?: number;
  date_founded?: string;
  faction_id?: number;
  creator_id?: number;
  creator_corporation_id?: number;
}

export interface ManagedAlliance {
  alliance_id: number;
  alliance_name: string;
  alliance_ticker: string;
  enabled: boolean;
  added_at: string;
  added_by: string;
}

export interface Corporation {
  id: number;
  name: string;
  ticker: string;
  member_count?: number;
  tax_rate?: number;
  alliance_id?: number;
  ceo_id?: number;
  creator_id?: number;
  date_founded?: string;
  description?: string;
  faction_id?: number;
  home_station_id?: number;
  shares?: number;
  url?: string;
  war_eligible?: boolean;
}

export interface AllianceFilters {
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchAlliancesResponse {
  alliances: Alliance[];
}

export interface ManagedAlliancesResponse {
  alliances: ManagedAlliance[];
  total: number;
  page: number;
  limit: number;
}

export interface AllianceHealthResponse {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  last_check: string;
}

interface FetchError extends Error {
  status?: number;
  response?: any;
}

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

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
    const error = new Error(`HTTP error! status: ${response.status}`) as FetchError;
    error.status = response.status;
    error.response = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

// Get managed alliances
export const useManagedAlliances = (filters: AllianceFilters = {}) => {
  return useQuery({
    queryKey: ['managedAlliances', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.enabled !== undefined) params.append('enabled', filters.enabled);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      return fetcher(`/site-settings/alliances?${params.toString()}`) as Promise<ManagedAlliancesResponse>;
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount: number, error: FetchError) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 3;
    },
  });
};

// Get specific managed alliance
export const useManagedAlliance = (allianceId: number | string) => {
  return useQuery({
    queryKey: ['managedAlliances', allianceId],
    queryFn: () => fetcher(`/site-settings/alliances/${allianceId}`) as Promise<ManagedAlliance>,
    staleTime: 1000 * 60 * 5,
    enabled: !!allianceId,
  });
};

// Search alliances (EVE Online database)
export const useSearchAlliances = (query: string) => {
  return useQuery({
    queryKey: ['searchAlliances', query],
    queryFn: () => {
      if (!query || query.length < 3) {
        return { alliances: [] };
      }
      return fetcher(`/alliances/search?name=${encodeURIComponent(query)}`) as Promise<SearchAlliancesResponse>;
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!query && query.length >= 3,
  });
};

// Get alliance info from EVE Online
export const useAllianceInfo = (allianceId: number | string) => {
  return useQuery({
    queryKey: ['allianceInfo', allianceId],
    queryFn: () => fetcher(`/alliances/${allianceId}`) as Promise<Alliance>,
    staleTime: 1000 * 60 * 30, // Alliance info doesn't change often
    enabled: !!allianceId,
  });
};

// Get alliance corporations
export const useAllianceCorporations = (allianceId: number | string) => {
  return useQuery({
    queryKey: ['allianceCorporations', allianceId],
    queryFn: () => fetcher(`/alliances/${allianceId}/corporations`) as Promise<Corporation[]>,
    staleTime: 1000 * 60 * 15, // Corporation membership doesn't change very often
    enabled: !!allianceId,
  });
};

// Add managed alliance
export const useAddManagedAlliance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { alliance_id: number; alliance_name?: string; alliance_ticker?: string }) => {
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
    mutationFn: ({ allianceId, enabled }: { allianceId: number | string; enabled: boolean }) => {
      return fetcher(`/site-settings/alliances/${allianceId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: (data: any, { allianceId }: { allianceId: number | string; enabled: boolean }) => {
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
    mutationFn: (allianceId: number | string) => {
      return fetcher(`/site-settings/alliances/${allianceId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data: any, allianceId: number | string) => {
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
    mutationFn: (alliances: ManagedAlliance[]) => {
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
    queryFn: () => fetcher('/alliances/health') as Promise<AllianceHealthResponse>,
    staleTime: 1000 * 60,
  });
};
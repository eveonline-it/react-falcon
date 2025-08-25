import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

export interface SitemapRoute {
  id: string;
  route_id: string;
  path: string;
  component: string;
  name: string;
  title: string;
  icon: string | null;
  type: string;
  parent_id: string | null;
  nav_position: string;
  nav_order: number;
  show_in_nav: boolean;
  required_permissions: string[] | null;
  required_groups: string[] | null;
  description: string | null;
  keywords: string | null;
  group: string | null;
  feature_flags: string[] | null;
  is_enabled: boolean;
  props: any;
  lazy_load: boolean;
  exact: boolean;
  newtab: boolean;
  badge_type?: string | null;
  badge_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SitemapResponse {
  routes: SitemapRoute[];
  total: number;
  page: number;
  limit: number;
}

export interface SitemapStats {
  totalRoutes: number;
  enabledRoutes: number;
  disabledRoutes: number;
  routesByGroup: Record<string, number>;
}

export interface ReorderRequest {
  routes: Array<{
    id: string;
    order: number;
    parentId?: string;
  }>;
}

// Fetch all sitemap routes
export const useSitemapRoutes = (filters?: {
  group?: string;
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (filters?.group) queryParams.append('group', filters.group);
  if (filters?.enabled !== undefined) queryParams.append('enabled', String(filters.enabled));
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.page) queryParams.append('page', String(filters.page));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));

  return useQuery({
    queryKey: ['admin', 'sitemap', filters],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/admin/sitemap${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch sitemap routes');
      const data = await response.json() as SitemapResponse;
      return data;
    }
  });
};

// Get single route details
export const useSitemapRoute = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'sitemap', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/${id}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch route details');
      return response.json() as Promise<SitemapRoute>;
    },
    enabled: !!id
  });
};

// Create new route
export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (route: Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(route)
      });
      if (!response.ok) throw new Error('Failed to create route');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
      queryClient.invalidateQueries({ queryKey: ['sitemap-stats'] });
    }
  });
};

// Update existing route (full update)
export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (route: SitemapRoute) => {
      const { id, created_at, updated_at, ...updateData } = route;
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update route');
      return response.json();
    },
    onSuccess: (_data, route) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap', route.id] });
      queryClient.invalidateQueries({ queryKey: ['sitemap-stats'] });
    }
  });
};

// Partial update for specific fields
export const useUpdateRouteFields = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Partial<Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at'>> }) => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (!response.ok) throw new Error('Failed to update route');
      return response.json();
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap', id] });
      queryClient.invalidateQueries({ queryKey: ['sitemap-stats'] });
    }
  });
};

// Delete route
export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete route');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
      queryClient.invalidateQueries({ queryKey: ['sitemap-stats'] });
    }
  });
};

// Reorder routes
export const useReorderRoutes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reorderData: ReorderRequest) => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/reorder`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reorderData)
      });
      if (!response.ok) throw new Error('Failed to reorder routes');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
    }
  });
};

// Get sitemap statistics
export const useSitemapStats = () => {
  return useQuery({
    queryKey: ['sitemap-stats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/stats`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch sitemap stats');
      return response.json() as Promise<SitemapStats>;
    }
  });
};
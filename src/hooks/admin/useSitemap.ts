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
  is_folder: boolean;
  nav_position: string;
  nav_order: number;
  show_in_nav: boolean;
  required_permissions: string[] | null;
  required_groups: string[] | null;
  description: string | null;
  keywords: string[] | null;
  group: string | null;
  feature_flags: string[] | null;
  is_enabled: boolean;
  props: object;
  lazy_load: boolean;
  exact: boolean;
  newtab: boolean;
  is_expanded: boolean;
  badge_type: string | null;
  badge_text: string | null;
  depth: number;
  children_count: number;
  folder_path: string;
  created_at: string;
  updated_at: string;
}

export interface ParentOption {
  id: string;
  name: string;
  path?: string;
  is_folder: boolean;
  parent_id: string | null;
  depth: number;
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
  updates: Array<{
    route_id: string;
    nav_order: number;
  }>;
}

// Fetch all sitemap routes
export const useSitemapRoutes = (filters?: {
  group?: string;
  enabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const queryParams = new URLSearchParams();
  if (filters?.group) queryParams.append('group', filters.group);
  if (filters?.enabled !== undefined) queryParams.append('enabled', String(filters.enabled));
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.page) queryParams.append('page', String(filters.page));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));
  // Default to sorting by nav_order in ascending order
  queryParams.append('sort', filters?.sort || 'nav_order');
  queryParams.append('order', filters?.order || 'asc');

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
    mutationFn: async (route: Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at' | 'depth' | 'children_count' | 'folder_path' | 'is_expanded'>) => {
      const { route_id, is_folder, ...createData } = route;
      const response = await fetch(`${API_BASE_URL}/admin/sitemap`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData)
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
      const { 
        id, 
        created_at, 
        updated_at, 
        depth,
        folder_path,
        children_count,
        is_expanded,
        route_id,
        is_folder,
        ...updateData 
      } = route;
      
      
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
    mutationFn: async ({ id, fields }: { id: string; fields: Partial<Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at' | 'depth' | 'folder_path' | 'children_count' | 'is_expanded'>> }) => {
      const { route_id, is_folder, ...updateFields } = fields as any;
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields)
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

// Get sitemap statistics (simplified version to avoid hook issues)
export const useSitemapStats = () => {
  return useQuery<SitemapStats>({
    queryKey: ['sitemap-stats'],
    queryFn: () => {
      // Return basic stats for now to avoid API issues
      return Promise.resolve({
        totalRoutes: 0,
        enabledRoutes: 0,
        disabledRoutes: 0,
        routesByGroup: {}
      });
    },
    retry: false,
    staleTime: 30000
  });
};

// Get available parent options for route/folder selection
export const useParentOptions = () => {
  return useQuery<ParentOption[]>({
    queryKey: ['admin', 'sitemap', 'parent-options'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap?type=parent-options&sort=nav_order&order=asc`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch parent options');
      
      const data = await response.json();
      
      // Build hierarchical parent options with depth indicators
      const buildParentTree = (routes: SitemapRoute[], parentId: string | null = null, depth = 0): ParentOption[] => {
        return routes
          .filter(route => route.parent_id === parentId)
          .sort((a, b) => a.nav_order - b.nav_order)
          .flatMap(route => {
            const option: ParentOption = {
              id: route.id,
              name: route.name,
              path: route.path,
              is_folder: route.is_folder,
              parent_id: route.parent_id,
              depth
            };
            
            return [
              option,
              ...buildParentTree(routes, route.id, depth + 1)
            ];
          });
      };
      
      return buildParentTree(data.routes);
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// Create a new folder
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folderData: { name: string; parent_id?: string | null; icon?: string }) => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/folders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      });
      
      if (!response.ok) throw new Error('Failed to create folder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap', 'parent-options'] });
    }
  });
};

// Move an item to a new parent
export const useMoveItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ itemId, newParentId }: { itemId: string; newParentId: string | null }) => {
      const response = await fetch(`${API_BASE_URL}/admin/sitemap/move/${itemId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_parent_id: newParentId })
      });
      
      if (!response.ok) throw new Error('Failed to move item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sitemap', 'parent-options'] });
    }
  });
};

// Get folder children
export const useFolderChildren = (folderId: string | null, depth?: number) => {
  return useQuery({
    queryKey: ['admin', 'sitemap', 'folder-children', folderId, depth],
    queryFn: async () => {
      if (!folderId) return { children: [], total_count: 0, depth: 0 };
      
      const url = new URL(`${API_BASE_URL}/admin/sitemap/folders/${folderId}/children`);
      if (depth !== undefined) {
        url.searchParams.set('depth', depth.toString());
      }
      
      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch folder children');
      return response.json();
    },
    enabled: !!folderId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};
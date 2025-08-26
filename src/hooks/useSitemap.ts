import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

export interface UserSitemapRoute {
  id: string;
  path: string;
  component: string;
  name: string;
  title: string;
  permissions: string[];
  lazyLoad: boolean;
  accessible: boolean;
  meta: {
    title: string;
    icon?: string;
    group: string;
  };
}

export interface NavigationItem {
  routeId?: string;
  name: string;
  to?: string;
  icon?: string;
  isFolder?: boolean;
  hasChildren?: boolean;
  active?: boolean;
  children?: NavigationItem[];
}

export interface NavigationGroup {
  label: string;
  labelDisable?: boolean;
  children: NavigationItem[];
}

export interface UserSitemapResponse {
  routes: UserSitemapRoute[];
  navigation: NavigationGroup[];
  userPermissions: string[];
  userGroups: string[];
  features: Record<string, boolean>;
}

// User sitemap hook for authenticated users
export const useSitemap = (options?: {
  includeDisabled?: boolean;
  includeHidden?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (options?.includeDisabled) queryParams.append('include_disabled', 'true');
  if (options?.includeHidden) queryParams.append('include_hidden', 'true');

  return useQuery({
    queryKey: ['sitemap', options],
    queryFn: async (): Promise<UserSitemapResponse> => {
      const response = await fetch(
        `${API_BASE_URL}/sitemap${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user sitemap: ${response.status}`);
      }
      
      const data = await response.json();
      return data.body || data; // Handle both wrapped and unwrapped responses
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

// Public sitemap hook for unauthenticated users
export const usePublicSitemap = () => {
  return useQuery({
    queryKey: ['sitemap', 'public'],
    queryFn: async (): Promise<UserSitemapResponse> => {
      const response = await fetch(`${API_BASE_URL}/sitemap/public`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch public sitemap: ${response.status}`);
      }
      
      const data = await response.json();
      return data.body || data; // Handle both wrapped and unwrapped responses
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
};

// Check if user can access a specific route
export const useRouteAccess = (routeId: string) => {
  return useQuery({
    queryKey: ['sitemap', 'access', routeId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/sitemap/access/${routeId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check route access: ${response.status}`);
      }
      
      const data = await response.json();
      return data.body || data;
    },
    enabled: !!routeId,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};
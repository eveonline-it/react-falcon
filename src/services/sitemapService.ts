import { NavItem, RouteGroup } from '../routes/siteMaps';

export interface BackendRoute {
  id: string;
  path: string;
  component: string;
  name: string;
  title: string;
  icon?: string;
  meta: {
    title: string;
    group: string;
    icon?: string;
  };
  lazyLoad: boolean;
  accessible: boolean;
  optional?: {
    newtab?: boolean;
    badge?: {
      type: string;
      text: string;
    };
  };
}

export interface BackendSitemap {
  routes: BackendRoute[];
  navigation?: any[];
  userPermissions?: any;
  userGroups?: any[];
  features?: Record<string, boolean>;
}

const SITEMAP_URL = 'https://go.eveonline.it/sitemap';

class SitemapService {
  private cache: BackendSitemap | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private eventListeners: Set<() => void> = new Set();

  async fetchSitemap(): Promise<BackendSitemap> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
      return this.cache;
    }

    try {
      const response = await fetch(SITEMAP_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.status}`);
      }

      const sitemap: BackendSitemap = await response.json();
      
      // Update cache
      this.cache = sitemap;
      this.cacheTimestamp = now;
      
      return sitemap;
    } catch (error) {
      console.error('Error fetching sitemap:', error);
      
      // Return cached data if available, otherwise throw
      if (this.cache) {
        return this.cache;
      }
      throw error;
    }
  }

  private createNavItem(route: BackendRoute): NavItem {
    const navItem: NavItem = {
      name: route.name || 'Unnamed',
      to: route.path || '#',
      active: route.accessible !== false
    };

    // Add icon if available
    if (route.icon || route.meta?.icon) {
      navItem.icon = route.icon || route.meta.icon;
    }

    // Add optional properties
    if (route.optional) {
      if (route.optional.newtab) {
        navItem.newtab = route.optional.newtab;
      }
      if (route.optional.badge) {
        navItem.badge = {
          type: route.optional.badge.type || 'info',
          text: route.optional.badge.text || ''
        };
      }
    }

    return navItem;
  }

  private groupRoutesByCategory(routes: BackendRoute[]): Map<string, BackendRoute[]> {
    const groupedRoutes = new Map<string, BackendRoute[]>();

    routes.forEach(route => {
      // Use 'Utilities' as default group for routes without a group
      const group = route.meta.group || 'Utilities';
      if (!groupedRoutes.has(group)) {
        groupedRoutes.set(group, []);
      }
      groupedRoutes.get(group)!.push(route);
    });

    return groupedRoutes;
  }

  private createRouteGroup(groupName: string, routes: BackendRoute[]): RouteGroup {
    // Handle nested structure for certain groups
    const nestedGroups = this.createNestedStructure(routes);
    
    return {
      label: this.formatGroupLabel(groupName),
      children: nestedGroups
    };
  }

  private createNestedStructure(routes: BackendRoute[]): NavItem[] {
    // Group routes by their path structure to create nested navigation
    const pathGroups = new Map<string, BackendRoute[]>();
    const singleRoutes: BackendRoute[] = [];

    routes.forEach(route => {
      // Skip routes without paths
      if (!route.path) {
        singleRoutes.push(route);
        return;
      }
      
      const pathParts = route.path.split('/').filter(part => part.length > 0);
      
      if (pathParts.length > 2) {
        // Multi-level path - group by second level
        const groupKey = pathParts.slice(0, 2).join('/');
        if (!pathGroups.has(groupKey)) {
          pathGroups.set(groupKey, []);
        }
        pathGroups.get(groupKey)!.push(route);
      } else {
        // Single or simple path
        singleRoutes.push(route);
      }
    });

    const navItems: NavItem[] = [];

    // Add single routes first
    singleRoutes.forEach(route => {
      navItems.push(this.createNavItem(route));
    });

    // Add grouped routes
    pathGroups.forEach((groupRoutes) => {
      if (groupRoutes.length === 1) {
        // Single route in group - add directly
        navItems.push(this.createNavItem(groupRoutes[0]));
      } else {
        // Multiple routes in group - create parent item
        const parentName = this.getParentNameFromRoutes(groupRoutes);
        const parentIcon = this.getParentIconFromRoutes(groupRoutes);
        
        const parentNavItem: NavItem = {
          name: parentName,
          active: true,
          children: groupRoutes.map(route => this.createNavItem(route))
        };

        if (parentIcon) {
          parentNavItem.icon = parentIcon;
        }

        navItems.push(parentNavItem);
      }
    });

    return navItems;
  }

  private getParentNameFromRoutes(routes: BackendRoute[]): string {
    // Extract parent name from path or use common prefix
    if (!routes || routes.length === 0 || !routes[0].path) {
      return 'Group';
    }
    
    const pathParts = routes[0].path.split('/').filter(part => part.length > 0);
    if (pathParts.length > 1) {
      return this.formatName(pathParts[1]);
    }
    return 'Group';
  }

  private getParentIconFromRoutes(routes: BackendRoute[]): string | undefined {
    // Use icon from first route that has one
    for (const route of routes) {
      if (route.icon || route.meta.icon) {
        return route.icon || route.meta.icon;
      }
    }
    return undefined;
  }

  private formatGroupLabel(groupName: string): string {
    // Handle null/undefined group names
    if (!groupName) {
      return 'Utilities';
    }
    
    // Group names are now already properly formatted from the backend
    // Just return them as-is, with fallback formatting for unknown groups
    const knownGroups = [
      'Administration',
      'Alliance',
      'Corporation',
      'Documentation',
      'Economy',
      'Personal',
      'Utilities'
    ];

    return knownGroups.includes(groupName) ? groupName : this.formatName(groupName);
  }

  private formatName(name: string): string {
    // Handle null/undefined names
    if (!name) {
      return '';
    }
    
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async generateRouteGroups(): Promise<RouteGroup[]> {
    try {
      const sitemap = await this.fetchSitemap();
      const groupedRoutes = this.groupRoutesByCategory(sitemap.routes);
      
      const routeGroups: RouteGroup[] = [];
      
      // Define the order of groups
      const groupOrder = ['Administration', 'Alliance', 'Corporation', 'Documentation', 'Economy', 'Personal', 'Utilities'];
      
      groupOrder.forEach(groupName => {
        if (groupedRoutes.has(groupName)) {
          const routes = groupedRoutes.get(groupName)!;
          routeGroups.push(this.createRouteGroup(groupName, routes));
        }
      });

      // Add any remaining groups not in the predefined order
      groupedRoutes.forEach((routes, groupName) => {
        if (!groupOrder.includes(groupName)) {
          routeGroups.push(this.createRouteGroup(groupName, routes));
        }
      });

      return routeGroups;
    } catch (error) {
      console.error('Failed to generate route groups from backend sitemap:', error);
      throw error;
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    // Notify all listeners that the sitemap has been updated
    this.notifyListeners();
  }

  // Subscribe to sitemap changes
  subscribe(listener: () => void): () => void {
    this.eventListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.eventListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in sitemap service listener:', error);
      }
    });
  }
}

export const sitemapService = new SitemapService();
import { NavItem, RouteGroup } from '../routes/siteMaps';

// Updated interfaces to match new backend response
export interface BackendRoute {
  id: string;
  route_id?: string; // Added route_id field
  path: string;
  component: string;
  name: string;
  title: string;
  permissions?: string[];
  lazyLoad?: boolean;
  accessible?: boolean;
  meta?: {
    title?: string;
    icon?: string;
    group?: string;
  };
  // Fields from admin endpoint
  icon?: string;
  parent_id?: string | null;
  is_folder?: boolean;
  nav_order?: number;
  type?: string;
  nav_position?: string;
  show_in_nav?: boolean;
  required_permissions?: string[] | null;
  required_groups?: string[] | null;
  description?: string | null;
  keywords?: string | null;
  group?: string | null;
  feature_flags?: string[] | null;
  is_enabled?: boolean;
  props?: any;
  lazy_load?: boolean;
  exact?: boolean;
  newtab?: boolean;
  folder_path?: string;
  depth?: number;
  children_count?: number;
  created_at?: string;
  updated_at?: string;
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

// New backend sitemap response structure
export interface BackendSitemap {
  routes: BackendRoute[];
  navigation: NavigationGroup[];
  userPermissions: string[];
  userGroups: string[];
  features: Record<string, boolean>;
}

// Legacy interfaces for backwards compatibility
export interface FolderItem {
  id: string;
  route_id?: string; // Added route_id field
  name: string;
  parent_id: string | null;
  is_folder: boolean;
  icon?: string;
  children: (FolderItem | BackendRoute)[];
  depth: number;
  nav_order: number;
}

export interface FolderChildrenResponse {
  children: (FolderItem | BackendRoute)[];
  total_count: number;
  depth: number;
}

export interface HierarchicalNavItem extends NavItem {
  id: string;
  is_folder?: boolean;
  parent_id?: string | null;
  depth?: number;
  nav_order?: number;
}

const SITEMAP_URL = 'https://go.eveonline.it/sitemap';
const SITEMAP_ADMIN_URL = 'https://go.eveonline.it/admin/sitemap';

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

      const responseData = await response.json();
      
      // Handle both wrapped and unwrapped responses
      const sitemap: BackendSitemap = responseData.body || responseData;
      
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
      active: route.accessible !== false
    };

    // Add path only for non-folder routes
    if (!route.is_folder && route.path) {
      navItem.to = route.path;
    }

    // Add icon if available
    if (route.icon) {
      navItem.icon = route.icon;
    } else if (route.meta?.icon) {
      navItem.icon = route.meta.icon;
    }

    return navItem;
  }

  private groupRoutesByCategory(routes: BackendRoute[]): Map<string, BackendRoute[]> {
    const groupedRoutes = new Map<string, BackendRoute[]>();

    routes.forEach(route => {
      // Skip folder items - they don't belong in flat grouping
      if (route.is_folder) return;
      
      // Use group from route metadata, fallback to 'Utilities'
      const group = route.meta?.group || route.group || 'Utilities';
      if (!groupedRoutes.has(group)) {
        groupedRoutes.set(group, []);
      }
      groupedRoutes.get(group)!.push(route);
    });

    return groupedRoutes;
  }

  // Convert backend navigation structure to route groups
  private convertBackendNavigationToRouteGroups(navigation: NavigationGroup[]): RouteGroup[] {
    return navigation.map(navGroup => ({
      label: navGroup.label,
      labelDisable: navGroup.labelDisable,
      children: navGroup.children && Array.isArray(navGroup.children) 
        ? this.convertNavigationItems(navGroup.children) 
        : []
    }));
  }

  // Convert backend navigation items to nav items
  private convertNavigationItems(items: NavigationItem[]): NavItem[] {
    if (!items || !Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => {
      const navItem: NavItem = {
        name: item.name,
        active: item.active !== false
      };

      // Add path if not a folder
      if (item.to && !item.isFolder) {
        navItem.to = item.to;
      }

      // Add icon if available
      if (item.icon) {
        navItem.icon = item.icon;
      }

      // Add children if present
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        navItem.children = this.convertNavigationItems(item.children);
      }

      return navItem;
    });
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
      
      // Always prefer the navigation structure from the backend if available
      if (sitemap.navigation && sitemap.navigation.length > 0) {
        return this.convertBackendNavigationToRouteGroups(sitemap.navigation);
      }
      
      // If no navigation structure, check if we have hierarchical routes
      const hasHierarchicalStructure = sitemap.routes.some(route => 
        route.is_folder || route.parent_id !== null
      );
      
      if (hasHierarchicalStructure) {
        return await this.generateHierarchicalRouteGroups(sitemap.routes);
      }
      
      // Simple fallback - group routes by category
      const groupedRoutes = this.groupRoutesByCategory(sitemap.routes);
      const routeGroups: RouteGroup[] = [];
      
      const groupOrder = ['Administration', 'Personal', 'Alliance', 'Corporation', 'Documentation', 'Economy', 'Utilities'];
      
      groupOrder.forEach(groupName => {
        if (groupedRoutes.has(groupName)) {
          const routes = groupedRoutes.get(groupName)!;
          routeGroups.push({
            label: groupName,
            children: routes.map(route => this.createNavItem(route))
          });
        }
      });

      // Add any remaining groups
      groupedRoutes.forEach((routes, groupName) => {
        if (!groupOrder.includes(groupName)) {
          routeGroups.push({
            label: groupName,
            children: routes.map(route => this.createNavItem(route))
          });
        }
      });

      return routeGroups;
    } catch (error) {
      console.error('Failed to generate route groups from backend sitemap:', error);
      throw error;
    }
  }

  // Generate hierarchical route groups using parent-child relationships
  async generateHierarchicalRouteGroups(routes: BackendRoute[]): Promise<RouteGroup[]> {
    try {
      // Build hierarchical tree from parent-child relationships
      const hierarchicalTree = this.buildHierarchicalTree(routes);
      
      // For the new folder-based backend structure, use folders as primary groups
      // Check if we have folder containers at root level
      const rootFolders = hierarchicalTree.filter(item => item.is_folder && item.parent_id === null);
      
      if (rootFolders.length > 0) {
        // New folder-based structure: each root folder becomes a group
        const routeGroups: RouteGroup[] = [];
        
        // Map folder route_ids to display labels (folders have route_id like "folder-personal")
        const folderLabelMap: Record<string, string> = {
          'folder-administration': 'Administration',
          'folder-personal': 'Personal', 
          'folder-economy': 'Economy',
          'folder-utilities': 'Utilities',
          'folder-alliance': 'Alliance',
          'folder-corporation': 'Corporation',
          'folder-documentation': 'Documentation'
        };
        
        // Define the order of groups to match expected layout
        const groupOrder = ['Administration', 'Personal', 'Economy', 'Utilities', 'Alliance', 'Corporation', 'Documentation'];
        
        // Process folders in order - match by route_id 
        groupOrder.forEach(groupName => {
          const folderRouteId = Object.keys(folderLabelMap).find(key => folderLabelMap[key] === groupName);
          const folder = rootFolders.find(f => {
            // Find folder by route_id or name
            if ('route_id' in f && f.route_id === folderRouteId) return true;
            if (f.name === groupName) return true;
            return false;
          });
          
          if (folder) {
            // For root folders that represent groups, use their children as the group's navigation items
            // rather than showing the folder itself as a navigation item
            if (folder.children && folder.children.length > 0) {
              // Convert all children (both folders and routes) to nav items
              const folderChildren = folder.children.map(child => {
                if ('is_folder' in child && child.is_folder) {
                  return child as FolderItem;
                } else {
                  // Convert BackendRoute to FolderItem structure for consistency
                  const route = child as BackendRoute;
                  return {
                    id: route.id,
                    name: route.name,
                    parent_id: route.parent_id || null,
                    is_folder: false,
                    icon: route.icon || route.meta?.icon,
                    children: [],
                    depth: 1,
                    nav_order: route.nav_order || 0,
                    path: route.path,
                    accessible: route.accessible
                  } as FolderItem & { path: string, accessible: boolean };
                }
              });
              
              const navItems = this.convertTreeToNavItems(folderChildren);
              routeGroups.push({
                label: groupName,
                children: navItems
              });
            } else {
              // If folder has no children, create empty group
              routeGroups.push({
                label: groupName,
                children: []
              });
            }
          }
        });
        
        // Add any remaining folders not in the predefined order
        rootFolders.forEach(folder => {
          // Check if folder has route_id property and use it for mapping
          const routeId = 'route_id' in folder ? folder.route_id : null;
          const groupName = (routeId && folderLabelMap[routeId]) || folderLabelMap[folder.id] || this.formatName(folder.name);
          const alreadyAdded = routeGroups.some(group => group.label === groupName);
          
          if (!alreadyAdded) {
            if (folder.children && folder.children.length > 0) {
              // Convert all children (both folders and routes) to nav items
              const folderChildren = folder.children.map(child => {
                if ('is_folder' in child && child.is_folder) {
                  return child as FolderItem;
                } else {
                  // Convert BackendRoute to FolderItem structure for consistency
                  const route = child as BackendRoute;
                  return {
                    id: route.id,
                    name: route.name,
                    parent_id: route.parent_id || null,
                    is_folder: false,
                    icon: route.icon || route.meta?.icon,
                    children: [],
                    depth: 1,
                    nav_order: route.nav_order || 0,
                    path: route.path,
                    accessible: route.accessible
                  } as FolderItem & { path: string, accessible: boolean };
                }
              });
              
              const navItems = this.convertTreeToNavItems(folderChildren);
              routeGroups.push({
                label: groupName,
                children: navItems
              });
            } else {
              // If folder has no children, create empty group
              routeGroups.push({
                label: groupName,
                children: []
              });
            }
          }
        });
        
        // Add any root-level routes (not in folders) to a default group
        const rootRoutes = hierarchicalTree.filter(item => !item.is_folder && item.parent_id === null);
        if (rootRoutes.length > 0) {
          const navItems = this.convertTreeToNavItems(rootRoutes);
          routeGroups.push({
            label: 'Other',
            children: navItems
          });
        }
        
        return routeGroups;
      }
      
      // Fallback to legacy group-based structure for backward compatibility
      const groupedTree = new Map<string, FolderItem[]>();
      
      hierarchicalTree.forEach(item => {
        // Determine group from first non-folder child or use 'Utilities' as default
        const group = this.getItemGroup(item, routes) || 'Utilities';
        
        if (!groupedTree.has(group)) {
          groupedTree.set(group, []);
        }
        groupedTree.get(group)!.push(item);
      });
      
      const routeGroups: RouteGroup[] = [];
      
      // Define the order of groups
      const groupOrder = ['Administration', 'Alliance', 'Corporation', 'Documentation', 'Economy', 'Personal', 'Utilities'];
      
      groupOrder.forEach(groupName => {
        if (groupedTree.has(groupName)) {
          const treeItems = groupedTree.get(groupName)!;
          const navItems = this.convertTreeToNavItems(treeItems);
          
          routeGroups.push({
            label: groupName,
            children: navItems
          });
        }
      });

      // Add any remaining groups not in the predefined order
      groupedTree.forEach((treeItems, groupName) => {
        if (!groupOrder.includes(groupName)) {
          const navItems = this.convertTreeToNavItems(treeItems);
          
          routeGroups.push({
            label: groupName,
            children: navItems
          });
        }
      });

      return routeGroups;
    } catch (error) {
      console.error('Failed to generate hierarchical route groups:', error);
      throw error;
    }
  }

  // Get group for a tree item (folder or route)
  private getItemGroup(item: FolderItem, allRoutes: BackendRoute[]): string | null {
    // If this item corresponds to a route, use its group
    const route = allRoutes.find(r => r.id === item.id);
    if (route && route.meta?.group) {
      return route.meta.group;
    }
    
    // If it's a folder, try to get group from first child route
    if (item.is_folder && item.children.length > 0) {
      for (const child of item.children) {
        const childRoute = allRoutes.find(r => r.id === child.id);
        if (childRoute && childRoute.meta?.group) {
          return childRoute.meta.group;
        }
        
        // Recursively check children
        if ('children' in child && child.children.length > 0) {
          const childGroup = this.getItemGroup(child as FolderItem, allRoutes);
          if (childGroup) return childGroup;
        }
      }
    }
    
    return null;
  }

  // Clear cache manually if needed  
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('🗑️  Sitemap cache cleared, forcing fresh backend fetch');
    // Notify all listeners that the sitemap has been updated
    this.notifyListeners();
  }

  // Force immediate cache clear and navigation reload
  async forceReload(): Promise<RouteGroup[]> {
    this.clearCache();
    console.log('🔄 Force reloading sitemap with fresh data...');
    return await this.generateRouteGroups();
  }

  // Create a new folder
  async createFolder(name: string, parentId?: string): Promise<FolderItem> {
    try {
      const response = await fetch(`${SITEMAP_ADMIN_URL}/folders`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          parent_id: parentId || null
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.status}`);
      }

      const folder = await response.json() as FolderItem;
      
      // Clear cache and notify listeners
      this.clearCache();
      
      return folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  // Get children of a specific folder
  async getFolderChildren(folderId: string, depth?: number): Promise<FolderChildrenResponse> {
    try {
      const url = new URL(`${SITEMAP_ADMIN_URL}/folders/${folderId}/children`);
      if (depth !== undefined) {
        url.searchParams.set('depth', depth.toString());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch folder children: ${response.status}`);
      }

      return await response.json() as FolderChildrenResponse;
    } catch (error) {
      console.error('Error fetching folder children:', error);
      throw error;
    }
  }

  // Move an item to a new parent
  async moveItem(itemId: string, newParentId: string | null): Promise<void> {
    try {
      const response = await fetch(`${SITEMAP_ADMIN_URL}/move/${itemId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_parent_id: newParentId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to move item: ${response.status}`);
      }

      // Clear cache and notify listeners
      this.clearCache();
    } catch (error) {
      console.error('Error moving item:', error);
      throw error;
    }
  }

  // Build hierarchical tree from flat array of routes
  private buildHierarchicalTree(routes: BackendRoute[]): FolderItem[] {
    const itemMap = new Map<string, FolderItem | BackendRoute>();
    const rootItems: FolderItem[] = [];

    // First pass: Create all items
    routes.forEach(route => {
      if (route.is_folder) {
        const folderItem: FolderItem = {
          id: route.id,
          route_id: route.route_id,
          name: route.name,
          parent_id: route.parent_id || null,
          is_folder: true,
          icon: route.icon || route.meta?.icon,
          children: [],
          depth: 0,
          nav_order: route.nav_order || 0
        };
        itemMap.set(route.id, folderItem);
        if (route.route_id) {
          itemMap.set(route.route_id, folderItem);
        }
      } else {
        itemMap.set(route.id, route);
        if (route.route_id) {
          itemMap.set(route.route_id, route);
        }
      }
    });

    // Second pass: Build parent-child relationships
    routes.forEach(route => {
      const item = itemMap.get(route.id)!;
      
      if (route.parent_id) {
        // Find parent by parent_id or route_id
        const parent = itemMap.get(route.parent_id);
        
        if (parent && 'children' in parent) {
          parent.children.push(item);
        } else {
          // Parent not found, add to root
          console.warn(`Parent ${route.parent_id} not found for ${route.name}, adding to root`);
          this.addToRoot(rootItems, item, route);
        }
      } else {
        // Root level item
        this.addToRoot(rootItems, item, route);
      }
    });

    // Sort all items by nav_order
    this.sortTreeItems(rootItems);
    
    return rootItems;
  }

  private addToRoot(rootItems: FolderItem[], item: FolderItem | BackendRoute, route: BackendRoute): void {
    if (route.is_folder) {
      rootItems.push(item as FolderItem);
    } else {
      // Convert route to folder-like structure for consistency
      const routeFolder: FolderItem = {
        id: route.id,
        route_id: route.route_id,
        name: route.name,
        parent_id: null,
        is_folder: false,
        icon: route.icon || route.meta?.icon,
        children: [],
        depth: 0,
        nav_order: route.nav_order || 0
      };
      rootItems.push(routeFolder);
    }
  }

  private sortTreeItems(items: (FolderItem | BackendRoute)[]): void {
    items.sort((a, b) => {
      const orderA = 'nav_order' in a ? (a.nav_order || 0) : 0;
      const orderB = 'nav_order' in b ? (b.nav_order || 0) : 0;
      return orderA - orderB;
    });
    
    // Recursively sort children
    items.forEach(item => {
      if ('children' in item && item.children.length > 0) {
        this.sortTreeItems(item.children);
      }
    });
  }

  // Convert hierarchical tree to navigation items
  private convertTreeToNavItems(treeItems: FolderItem[]): HierarchicalNavItem[] {
    if (!treeItems || !Array.isArray(treeItems)) {
      return [];
    }
    
    const convertItem = (item: FolderItem | BackendRoute): HierarchicalNavItem => {
      const isFolder = 'is_folder' in item ? item.is_folder : false;
      
      const navItem: HierarchicalNavItem = {
        id: item.id,
        name: item.name || 'Unnamed',
        active: 'accessible' in item ? item.accessible !== false : true,
        is_folder: isFolder,
        parent_id: item.parent_id,
        nav_order: 'nav_order' in item ? item.nav_order : 0
      };

      // Add icon if available (check both direct icon and meta.icon)
      if (item.icon) {
        navItem.icon = item.icon;
      } else if ('meta' in item && item.meta?.icon) {
        navItem.icon = item.meta.icon;
      }

      // Add path for non-folder items only
      if (!isFolder && 'path' in item && item.path) {
        navItem.to = item.path;
      }

      // Add optional properties for routes (if they exist)
      if ('optional' in item && item.optional) {
        const optional = item.optional as any;
        if (optional.newtab) {
          navItem.newtab = optional.newtab;
        }
        if (optional.badge) {
          navItem.badge = {
            type: optional.badge.type || 'info',
            text: optional.badge.text || ''
          };
        }
      }

      // Add children if present
      if ('children' in item && item.children && item.children.length > 0) {
        navItem.children = item.children.map(convertItem);
      }

      return navItem;
    };

    return treeItems.map(convertItem);
  }

  // Get flat routes array for React Router configuration
  async getDynamicRoutes(): Promise<BackendRoute[]> {
    try {
      const sitemap = await this.fetchSitemap();
      return sitemap.routes || [];
    } catch (error) {
      console.error('Failed to get dynamic routes:', error);
      return [];
    }
  }

  // Get navigation structure for menu rendering
  async getNavigationStructure(): Promise<NavigationGroup[]> {
    try {
      const sitemap = await this.fetchSitemap();
      return sitemap.navigation || [];
    } catch (error) {
      console.error('Failed to get navigation structure:', error);
      return [];
    }
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

// Global utilities for debugging - accessible from browser console
(window as any).refreshNavigation = () => {
  console.log('🔄 Manually refreshing navigation structure...');
  sitemapService.clearCache();
  window.location.reload();
};

// Make sitemap service globally available for debugging
(window as any).sitemapService = sitemapService;
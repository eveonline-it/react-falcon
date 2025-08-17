# Frontend Dynamic Routing Implementation Plan

## Overview
This document outlines the frontend implementation for consuming backend-driven, role-based routing. The frontend will dynamically generate routes and navigation based on the user's permissions, fetched from the backend API.

## Architecture Changes

### Current State
- Static routes defined in `src/routes/index.js`
- Static navigation in `src/routes/siteMaps.js`
- Basic permission checks in `ProtectedRoute` component

### Target State
- Dynamic routes generated from backend API
- Permission-based navigation filtering
- Component registry for dynamic loading
- Seamless integration with existing auth system

## Implementation Components

### 1. Dynamic Route Hook (`src/hooks/useAuthRoutes.js`)

```jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from 'stores/authStore';

export const useAuthRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token, user } = useAuthStore();

  const fetchUserRoutes = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setRoutes([]);
      setNavigation([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_EVE_BACKEND_URL}/api/user/routes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setRoutes(data.routes || []);
      setNavigation(data.navigation || []);
      
      // Update user permissions in auth store
      if (data.userPermissions) {
        useAuthStore.getState().updatePermissions(data.userPermissions);
      }

    } catch (err) {
      console.error('Failed to fetch user routes:', err);
      setError(err.message);
      // Fallback to empty state
      setRoutes([]);
      setNavigation([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchUserRoutes();
  }, [fetchUserRoutes]);

  // Refresh routes when user changes or permissions update
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'falcon-auth-storage') {
        fetchUserRoutes();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserRoutes]);

  return { 
    routes, 
    navigation, 
    loading, 
    error,
    refetchRoutes: fetchUserRoutes 
  };
};

// Hook for getting specific route by ID
export const useRouteById = (routeId) => {
  const { routes } = useAuthRoutes();
  
  const findRoute = (routeList, id) => {
    for (const route of routeList) {
      if (route.id === id) return route;
      if (route.children) {
        const childRoute = findRoute(route.children, id);
        if (childRoute) return childRoute;
      }
    }
    return null;
  };

  return findRoute(routes, routeId);
};
```

### 2. Route Component Registry (`src/components/routing/RouteRegistry.js`)

```jsx
import { lazy } from 'react';

// Import static components that are always available
import Error404 from 'components/errors/Error404';
import Error500 from 'components/errors/Error500';
import FalconLoader from 'components/common/FalconLoader';

// Lazy load all route components for better performance
const routeComponents = {
  // Dashboard Components
  'AnalyticsDashboard': lazy(() => import('demos/dashboards/AnalyticsDashboard')),
  'CrmDashboard': lazy(() => import('demos/dashboards/CrmDashboard')),
  'SaasDashboard': lazy(() => import('demos/dashboards/SaasDashboard')),
  'ProjectManagementDashboard': lazy(() => import('demos/dashboards/ProjectManagementDashboard')),
  'SupportDeskDashboard': lazy(() => import('demos/dashboards/SupportDeskDashboard')),
  'DefaultDashboard': lazy(() => import('demos/dashboards/DefaultDashboard')),

  // Feature Applications
  'Chat': lazy(() => import('features/chat/Chat')),
  'Kanban': lazy(() => import('features/kanban/Kanban')),
  'Calendar': lazy(() => import('features/calendar/Calendar')),

  // Email Features
  'EmailInbox': lazy(() => import('features/email/inbox/Inbox')),
  'EmailCompose': lazy(() => import('features/email/compose/Compose')),
  'EmailDetail': lazy(() => import('features/email/email-detail/EmailDetail')),

  // Support Desk Features
  'TicketsTableView': lazy(() => import('features/support-desk/tickets-layout/TableView')),
  'TicketsCardView': lazy(() => import('features/support-desk/tickets-layout/CardView')),
  'Contacts': lazy(() => import('features/support-desk/contacts/Contacts')),
  'ContactDetails': lazy(() => import('features/support-desk/contact-details/ContactDetails')),
  'TicketsPreview': lazy(() => import('features/support-desk/tickets-preview/TicketsPreview')),
  'QuickLinks': lazy(() => import('features/support-desk/quick-links/QuickLinks')),
  'Reports': lazy(() => import('features/support-desk/reports/Reports')),

  // Social Features
  'Feed': lazy(() => import('features/social/feed/Feed')),
  'ActivityLog': lazy(() => import('features/social/activity-log/ActivityLog')),
  'Notifications': lazy(() => import('features/social/notifications/Notifications')),
  'Followers': lazy(() => import('features/social/followers/Followers')),

  // Events Features
  'CreateEvent': lazy(() => import('features/events/create-an-event/CreateEvent')),
  'EventList': lazy(() => import('features/events/event-list/EventList')),
  'EventDetail': lazy(() => import('features/events/event-detail/EventDetail')),

  // User Pages
  'UserProfile': lazy(() => import('pages/user/profile/Profile')),
  'UserSettings': lazy(() => import('pages/user/settings/Settings')),

  // Other Pages
  'Starter': lazy(() => import('pages/Starter')),
  'Landing': lazy(() => import('pages/landing/Landing')),

  // FAQ Pages
  'FaqBasic': lazy(() => import('pages/faq/faq-basic/FaqBasic')),
  'FaqAlt': lazy(() => import('pages/faq/faq-alt/FaqAlt')),
  'FaqAccordion': lazy(() => import('pages/faq/faq-accordion/FaqAccordion')),

  // Pricing Pages
  'PricingDefault': lazy(() => import('pages/pricing/pricing-default/PricingDefault')),
  'PricingAlt': lazy(() => import('pages/pricing/pricing-alt/PricingAlt')),

  // Documentation (if accessible)
  'GettingStarted': lazy(() => import('docs/documentation/GettingStarted')),
  'Configuration': lazy(() => import('docs/documentation/Configuration')),

  // Error Pages (always available)
  'Error404': () => Error404,
  'Error500': () => Error500,
  'NotFound': () => Error404
};

export const getRouteComponent = (componentName) => {
  const Component = routeComponents[componentName];
  
  if (!Component) {
    console.warn(`Component "${componentName}" not found in registry. Using Error404.`);
    return routeComponents['Error404'];
  }

  return Component;
};

export const isComponentRegistered = (componentName) => {
  return Object.hasOwnProperty.call(routeComponents, componentName);
};

// Function to get all registered component names (useful for debugging)
export const getRegisteredComponents = () => {
  return Object.keys(routeComponents);
};
```

### 3. Dynamic Router Generator (`src/components/routing/DynamicRouter.jsx`)

```jsx
import { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { getRouteComponent } from './RouteRegistry';
import ProtectedRoute from 'components/authentication/ProtectedRoute';
import MainLayout from 'layouts/MainLayout';
import ErrorLayout from 'layouts/ErrorLayout';
import FalconLoader from 'components/common/FalconLoader';
import Error404 from 'components/errors/Error404';
import Error500 from 'components/errors/Error500';
import Landing from 'pages/landing/Landing';
import CardEveLogin from 'components/authentication/card/EveLogin';

export const createDynamicRouter = (userRoutes, fallbackRoutes = []) => {
  
  const buildRouteConfig = (route, parentPath = '') => {
    const Component = getRouteComponent(route.component);
    
    const routeConfig = {
      path: route.path.startsWith('/') ? route.path.substring(1) : route.path, // Remove leading slash for nested routes
      element: (
        <ProtectedRoute 
          requiredPermissions={route.permissions || []}
          requireAuth={true}
        >
          <Suspense fallback={<FalconLoader />}>
            <Component />
          </Suspense>
        </ProtectedRoute>
      ),
      // Add route metadata for breadcrumbs, titles, etc.
      handle: {
        title: route.meta?.title,
        icon: route.meta?.icon,
        group: route.meta?.group,
        permissions: route.permissions
      }
    };

    // Handle child routes recursively
    if (route.children && route.children.length > 0) {
      routeConfig.children = route.children.map(child => 
        buildRouteConfig(child, route.path)
      );
    }

    return routeConfig;
  };

  // Build dynamic routes from user permissions
  const dynamicRoutes = userRoutes.map(route => buildRouteConfig(route));

  // Add any fallback routes (static routes that should always be available)
  const staticFallbackRoutes = fallbackRoutes.map(route => buildRouteConfig(route));

  // Determine default dashboard route
  const defaultDashboard = userRoutes.find(r => r.meta?.group === 'dashboard')?.path || '/dashboard/default';

  const routes = [
    // App root with all protected routes
    {
      path: '/',
      element: <App />, // Your main App component
      children: [
        // Landing page (public)
        {
          path: 'landing',
          element: <Landing />
        },
        
        // Error layouts (public)
        {
          path: 'errors',
          element: <ErrorLayout />,
          children: [
            {
              path: '404',
              element: <Error404 />
            },
            {
              path: '500', 
              element: <Error500 />
            }
          ]
        },

        // Login page (public)
        {
          path: 'login',
          element: <CardEveLogin />
        },

        // Main application (protected)
        {
          path: '',
          element: (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          ),
          children: [
            // Root redirect to default dashboard
            {
              index: true,
              element: <Navigate to={defaultDashboard.replace('/', '')} replace />
            },
            
            // Dynamic user routes
            ...dynamicRoutes,
            
            // Static fallback routes
            ...staticFallbackRoutes,
            
            // Catch-all for unmatched routes
            {
              path: '*',
              element: <Navigate to="/errors/404" replace />
            }
          ]
        }
      ]
    }
  ];

  return createBrowserRouter(routes, {
    basename: import.meta.env.VITE_PUBLIC_URL
  });
};

// Create fallback routes for emergency access
export const createFallbackRouter = () => {
  const fallbackRoutes = [
    {
      id: 'fallback-dashboard',
      path: '/dashboard/default', 
      component: 'DefaultDashboard',
      permissions: [],
      meta: { title: 'Dashboard', group: 'dashboard' }
    },
    {
      id: 'fallback-profile',
      path: '/user/profile',
      component: 'UserProfile', 
      permissions: [],
      meta: { title: 'Profile', group: 'user' }
    }
  ];

  return createDynamicRouter(fallbackRoutes);
};
```

### 4. Dynamic Navigation Hook (`src/hooks/useDynamicNavigation.js`)

```jsx
import { useMemo } from 'react';
import { useAuthStore } from 'stores/authStore';
import { useAuthRoutes } from './useAuthRoutes';

export const useDynamicNavigation = () => {
  const { navigation, routes } = useAuthRoutes();
  const { hasPermission, hasAnyPermission } = useAuthStore();

  const filteredNavigation = useMemo(() => {
    const filterNavigationItems = (navItems) => {
      return navItems.filter(item => {
        // Find the corresponding route
        const route = routes.find(r => r.id === item.routeId);
        if (!route) return false;

        // Check if user has required permissions
        if (route.permissions && route.permissions.length > 0) {
          return hasAnyPermission(route.permissions);
        }

        return true;
      }).map(item => {
        const route = routes.find(r => r.id === item.routeId);
        return {
          ...item,
          // Merge route metadata into navigation item
          to: route?.path,
          icon: item.icon || route?.meta?.icon,
          title: item.label || route?.meta?.title,
          meta: route?.meta,
          permissions: route?.permissions
        };
      });
    };

    return navigation.map(group => ({
      ...group,
      items: filterNavigationItems(group.items || [])
    })).filter(group => group.items.length > 0); // Remove empty groups

  }, [navigation, routes, hasAnyPermission]);

  // Helper function to check if a specific route is accessible
  const canAccessRoute = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return false;
    
    if (route.permissions && route.permissions.length > 0) {
      return hasAnyPermission(route.permissions);
    }
    
    return true;
  };

  // Get breadcrumb data for current route
  const getBreadcrumbs = (currentPath) => {
    const findRoutePath = (routeList, targetPath, breadcrumbs = []) => {
      for (const route of routeList) {
        const currentBreadcrumbs = [...breadcrumbs, {
          title: route.meta?.title || route.id,
          path: route.path,
          icon: route.meta?.icon
        }];

        if (route.path === targetPath) {
          return currentBreadcrumbs;
        }

        if (route.children) {
          const childResult = findRoutePath(route.children, targetPath, currentBreadcrumbs);
          if (childResult) return childResult;
        }
      }
      return null;
    };

    return findRoutePath(routes, currentPath) || [];
  };

  return {
    navigation: filteredNavigation,
    canAccessRoute,
    getBreadcrumbs,
    routes
  };
};
```

### 5. Updated App Component (`src/App.jsx`)

```jsx
import React from 'react';
import { RouterProvider } from 'react-router';
import { useAuthRoutes } from 'hooks/useAuthRoutes';
import { createDynamicRouter, createFallbackRouter } from 'components/routing/DynamicRouter';
import FalconLoader from 'components/common/FalconLoader';
import AuthProvider from 'providers/AuthProvider';
import QueryProvider from 'providers/QueryProvider';
import AppProvider from 'providers/AppProvider';

const AppWithRouter = () => {
  const { routes, loading, error } = useAuthRoutes();

  // Show loading state while fetching routes
  if (loading) {
    return <FalconLoader />;
  }

  // If there's an error or no routes, use fallback router
  if (error || !routes || routes.length === 0) {
    console.warn('Using fallback router due to:', error || 'No routes available');
    const fallbackRouter = createFallbackRouter();
    return <RouterProvider router={fallbackRouter} />;
  }

  // Create dynamic router with user's routes
  const router = createDynamicRouter(routes);
  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppProvider>
          <AppWithRouter />
        </AppProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
```

### 6. Navigation Component Updates (`src/components/navbar/vertical/NavbarVertical.jsx`)

```jsx
// Update existing navigation components to use dynamic navigation
import { useDynamicNavigation } from 'hooks/useDynamicNavigation';

const NavbarVertical = () => {
  const { navigation, canAccessRoute } = useDynamicNavigation();
  
  // Use navigation instead of static siteMaps
  return (
    <nav className="navbar navbar-vertical">
      {navigation.map((group, index) => (
        <NavbarVerticalMenu 
          key={group.label || index}
          routes={group.items}
          label={group.label}
        />
      ))}
    </nav>
  );
};
```

## Migration Strategy

### Phase 1: Infrastructure Setup
1. ✅ Create hooks and utilities for dynamic routing
2. ✅ Create route component registry
3. ✅ Create dynamic router generator
4. ✅ Update auth store to handle permissions

### Phase 2: Gradual Migration
1. **Start with high-security routes**: Support desk, admin areas
2. **Test with limited users**: Beta group or internal users
3. **Add fallback mechanisms**: Graceful degradation if backend unavailable
4. **Monitor performance**: Ensure route loading doesn't impact UX

### Phase 3: Navigation Updates
1. Update all navigation components to use dynamic navigation
2. Replace static siteMaps with dynamic equivalents
3. Add permission-based menu item filtering
4. Update breadcrumb generation

### Phase 4: Complete Migration
1. Remove static route definitions from `src/routes/index.js`
2. Clean up unused imports and components
3. Update documentation and examples
4. Performance optimization and caching

## Error Handling & Fallbacks

### Network Failures
```jsx
const RouteErrorBoundary = ({ children, fallback }) => {
  const { routes, error, refetchRoutes } = useAuthRoutes();
  
  if (error) {
    return (
      <div className="route-error">
        <h3>Unable to load navigation</h3>
        <p>{error}</p>
        <button onClick={refetchRoutes}>Retry</button>
        {fallback}
      </div>
    );
  }
  
  return children;
};
```

### Component Loading Failures
```jsx
// In RouteRegistry.js
export const withErrorBoundary = (Component, fallbackComponent = 'Error404') => {
  return (props) => (
    <ErrorBoundary fallback={getRouteComponent(fallbackComponent)}>
      <Component {...props} />
    </ErrorBoundary>
  );
};
```

## Performance Optimizations

### Route Caching
```jsx
// Cache routes in localStorage with TTL
const ROUTE_CACHE_KEY = 'user-routes-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedRoutes = () => {
  const cached = localStorage.getItem(ROUTE_CACHE_KEY);
  if (cached) {
    const { routes, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return routes;
    }
  }
  return null;
};

const setCachedRoutes = (routes) => {
  localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify({
    routes,
    timestamp: Date.now()
  }));
};
```

### Lazy Loading Optimization
```jsx
// Preload likely-to-be-accessed routes
const preloadRoutes = (routes) => {
  const highPriorityRoutes = routes.filter(r => 
    r.meta?.group === 'dashboard' || r.meta?.preload === true
  );
  
  highPriorityRoutes.forEach(route => {
    const Component = getRouteComponent(route.component);
    // Trigger lazy loading
    Component();
  });
};
```

## Testing Strategy

### Unit Tests
```jsx
// Test route resolution
describe('useAuthRoutes', () => {
  it('should fetch and parse routes correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuthRoutes(), {
      wrapper: AuthProvider
    });
    
    await waitForNextUpdate();
    
    expect(result.current.routes).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

### Integration Tests
```jsx
// Test navigation filtering
describe('useDynamicNavigation', () => {
  it('should filter navigation based on permissions', () => {
    const { result } = renderHook(() => useDynamicNavigation(), {
      wrapper: ({ children }) => (
        <AuthProvider>
          <TestAuthState permissions={['analytics.view']}>
            {children}
          </TestAuthState>
        </AuthProvider>
      )
    });
    
    expect(result.current.navigation).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({ routeId: 'dashboard-analytics' })
          ])
        })
      ])
    );
  });
});
```

## Real-time Updates

### WebSocket Integration
```jsx
// Listen for route updates
useEffect(() => {
  const socket = new WebSocket(WS_URL);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'ROUTES_UPDATED') {
      // Refresh routes
      refetchRoutes();
    }
  };
  
  return () => socket.close();
}, [refetchRoutes]);
```

This implementation provides a complete, production-ready dynamic routing system that seamlessly integrates with your existing React Falcon codebase while providing full backend control over user access patterns.
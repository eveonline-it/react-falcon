import React, { useState, useEffect } from 'react';
import NavbarDropdown from './NavbarDropdown';
import {
  dashboardRoutes,
  appRoutes,
  pagesRoutes,
  modulesRoutes,
  documentationRoutes,
  loadDynamicRouteGroups,
  RouteGroup
} from 'routes/siteMaps';
import { sitemapService } from '../../../services/sitemapService';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router';
import { flatRoutes } from 'helpers/utils';
import NavbarDropdownApp from './NavbarDropdownApp';
import NavbarDropdownPages from './NavbarDropdownPages';
import NavbarDropdownModules from './NavbarDropdownModules';
import { useAppContext } from 'providers/AppProvider';

const NavbarTopDropDownMenus = () => {
  const [routeGroups, setRouteGroups] = useState<RouteGroup[]>([
    dashboardRoutes,
    appRoutes,
    pagesRoutes,
    modulesRoutes,
    documentationRoutes
  ]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  const {
    config: { navbarCollapsed, showBurgerMenu },
    setConfig
  } = useAppContext();

  // Load dynamic routes from backend
  const loadRoutes = async (forceRefresh = false) => {
    if (isLoadingRoutes && !forceRefresh) return;
    
    setIsLoadingRoutes(true);
    try {
      const dynamicRoutes = await loadDynamicRouteGroups(forceRefresh);
      setRouteGroups(dynamicRoutes);
    } catch (error) {
      console.warn('Failed to load dynamic routes in NavbarTopDropDownMenus, using static fallback:', error);
      // Keep static routes as fallback
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  // Subscribe to sitemap changes to reload navigation
  useEffect(() => {
    const unsubscribe = sitemapService.subscribe(() => {
      console.log('🔄 Sitemap changed, reloading top navigation...');
      loadRoutes(true).then(() => {
        console.log('✅ Top navigation successfully reloaded with fresh data');
      }); // Force refresh to clear cache
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Helper function to get a route group by label
  const getRouteGroup = (label: string): RouteGroup | undefined => {
    return routeGroups.find(group => 
      group.label.toLowerCase() === label.toLowerCase()
    );
  };

  // Get individual route groups with fallbacks
  const currentDashboardRoutes = getRouteGroup('dashboard') || dashboardRoutes;
  const currentAppRoutes = getRouteGroup('app') || getRouteGroup('applications') || appRoutes;
  const currentPagesRoutes = getRouteGroup('pages') || pagesRoutes;
  const currentModulesRoutes = getRouteGroup('modules') || modulesRoutes;
  const currentDocumentationRoutes = getRouteGroup('documentation') || documentationRoutes;

  const handleDropdownItemClick = () => {
    if (navbarCollapsed) {
      setConfig('navbarCollapsed', !navbarCollapsed);
    }
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };
  return (
    <>
      <NavbarDropdown title="dashboard">
        {currentDashboardRoutes.children[0]?.children?.map(route => (
          <Dropdown.Item
            key={route.name}
            as={Link}
            className={route.active ? 'link-600' : 'text-500'}
            to={route.to}
            onClick={handleDropdownItemClick}
          >
            {route.name}
          </Dropdown.Item>
        ))}
      </NavbarDropdown>

      <NavbarDropdown title="app">
        <NavbarDropdownApp items={currentAppRoutes.children} />
      </NavbarDropdown>

      <NavbarDropdown title="pages">
        <NavbarDropdownPages items={currentPagesRoutes.children} />
      </NavbarDropdown>
      <NavbarDropdown title="modules">
        <NavbarDropdownModules items={currentModulesRoutes.children} />
      </NavbarDropdown>

      <NavbarDropdown title="documentation">
        {flatRoutes(currentDocumentationRoutes.children).map(route => (
          <Dropdown.Item
            key={route.name}
            as={Link}
            className={route.active ? 'link-600' : 'text-500'}
            to={route.to}
            onClick={handleDropdownItemClick}
          >
            {route.name}
          </Dropdown.Item>
        ))}
      </NavbarDropdown>
    </>
  );
};

export default NavbarTopDropDownMenus;

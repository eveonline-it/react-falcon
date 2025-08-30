import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Nav, Navbar, Row, Col, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { navbarBreakPoint, topNavbarBreakpoint } from 'config';
import Flex from 'components/common/Flex';
import Logo from 'components/common/Logo';
import NavbarVerticalMenu from './NavbarVerticalMenu';
import ToggleButton from './ToggleButton';
import staticRoutes, {
  loadDynamicRouteGroups,
  RouteGroup
} from 'routes/siteMaps';
import { sitemapService } from 'services/sitemapService';
import { capitalize } from 'helpers/utils';
import NavbarTopDropDownMenus from 'components/navbar/top/NavbarTopDropDownMenus';
import PurchaseCard from './PurchaseCard';
import bgNavbar from 'assets/img/generic/bg-navbar.png';
import { useAppContext } from 'providers/AppProvider';
import 'assets/css/hierarchical-navigation.css';

const NavbarVertical = () => {
  const [routes, setRoutes] = useState<RouteGroup[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  const {
    config: {
      navbarPosition,
      navbarStyle,
      isNavbarVerticalCollapsed,
      showBurgerMenu
    }
  } = useAppContext();

  const HTMLClassList = document.getElementsByTagName('html')[0].classList;

  useEffect(() => {
    if (isNavbarVerticalCollapsed) {
      HTMLClassList.add('navbar-vertical-collapsed');
    } else {
      HTMLClassList.remove('navbar-vertical-collapsed');
    }
    return () => {
      HTMLClassList.remove('navbar-vertical-collapsed-hover');
    };
  }, [isNavbarVerticalCollapsed, HTMLClassList]);

  // Load dynamic routes from backend
  const loadRoutes = async (forceRefresh = false) => {
    if (isLoadingRoutes && !forceRefresh) return;

    setIsLoadingRoutes(true);
    try {
      const dynamicRoutes = await loadDynamicRouteGroups(forceRefresh);

      if (dynamicRoutes.length > 0) {
        setRoutes(dynamicRoutes);
      } else {
        setRoutes(staticRoutes);
      }
    } catch (error) {
      console.warn(
        'Failed to load dynamic routes in NavbarVertical, using static fallback:',
        error
      );
      setRoutes(staticRoutes);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []); // Only run once on mount

  // Subscribe to sitemap changes to reload navigation
  useEffect(() => {
    const unsubscribe = sitemapService.subscribe(() => {
      loadRoutes(true); // Force refresh to clear cache
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  //Control mouseEnter event
  let time: NodeJS.Timeout | null = null;
  const handleMouseEnter = () => {
    if (isNavbarVerticalCollapsed) {
      time = setTimeout(() => {
        HTMLClassList.add('navbar-vertical-collapsed-hover');
      }, 100);
    }
  };
  const handleMouseLeave = () => {
    if (time) {
      clearTimeout(time);
    }
    HTMLClassList.remove('navbar-vertical-collapsed-hover');
  };

  // Collapsible group component for route groups with labels
  const CollapsibleRouteGroup = ({ route }: { route: RouteGroup }) => {
    // Use localStorage to persist collapse state
    const storageKey = `navbar-group-collapsed-${route.label}`;
    const [isCollapsed, setIsCollapsed] = useState(() => {
      const stored = localStorage.getItem(storageKey);
      return stored === 'true';
    });

    const handleToggle = () => {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem(storageKey, String(newState));
    };

    return (
      <>
        <Nav.Item as="li" className="navbar-vertical-group-wrapper">
          <div
            onClick={handleToggle}
            className="navbar-vertical-group-toggle cursor-pointer"
            aria-expanded={!isCollapsed}
            role="button"
          >
            <span className="navbar-vertical-group-indicator">
              <FontAwesomeIcon
                icon={`chevron-${isCollapsed ? 'right' : 'down'}`}
                className="fs--2"
              />
            </span>
            <span className="navbar-vertical-group-label">
              {capitalize(route.label)}
            </span>
            <div className="navbar-vertical-group-divider"></div>
          </div>
        </Nav.Item>
        <Collapse in={!isCollapsed}>
          <Nav className="flex-column" as="ul">
            <NavbarVerticalMenu routes={route.children} />
          </Nav>
        </Collapse>
      </>
    );
  };

  const NavbarLabel = ({ label }: { label: string }) => (
    <Nav.Item as="li">
      <Row className="mt-3 mb-2 navbar-vertical-label-wrapper">
        <Col xs="auto" className="navbar-vertical-label navbar-vertical-label">
          {label}
        </Col>
        <Col className="ps-0">
          <hr className="mb-0 navbar-vertical-divider"></hr>
        </Col>
      </Row>
    </Nav.Item>
  );

  return (
    <Navbar
      expand={navbarBreakPoint}
      className={classNames('navbar-vertical', {
        [`navbar-${navbarStyle}`]: navbarStyle !== 'transparent'
      })}
      variant="light"
    >
      <Flex alignItems="center">
        <ToggleButton />
        <Logo at="navbar-vertical" textClass="text-primary" width={40} />
      </Flex>
      <Navbar.Collapse
        in={showBurgerMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundImage:
            navbarStyle === 'vibrant'
              ? `linear-gradient(-45deg, rgba(0, 160, 255, 0.86), #0048a2),url(${bgNavbar})`
              : 'none'
        }}
      >
        <div className="navbar-vertical-content scrollbar">
          <Nav className="flex-column" as="ul">
            {isLoadingRoutes ? (
              <Nav.Item as="li" className="text-center p-3">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                Loading navigation...
              </Nav.Item>
            ) : routes.length > 0 ? (
              routes.map(route => {
                // If the group has a label and it's not disabled, make it collapsible
                if (!route.labelDisable && route.label) {
                  return (
                    <CollapsibleRouteGroup key={route.label} route={route} />
                  );
                }
                // Otherwise, just render the children directly
                return (
                  <NavbarVerticalMenu
                    key={route.label}
                    routes={route.children}
                  />
                );
              })
            ) : (
              <Nav.Item as="li" className="text-center p-3 text-muted">
                <small>No navigation available</small>
              </Nav.Item>
            )}
          </Nav>

          <>
            {navbarPosition === 'combo' && (
              <div className={`d-${topNavbarBreakpoint}-none`}>
                <div className="navbar-vertical-divider">
                  <hr className="navbar-vertical-hr my-2" />
                </div>
                <Nav navbar>
                  <NavbarTopDropDownMenus />
                </Nav>
              </div>
            )}
            <PurchaseCard />
          </>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavbarVertical;

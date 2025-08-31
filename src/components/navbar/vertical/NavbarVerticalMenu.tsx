// React 19 JSX Transform - no explicit React import needed
import { useState } from 'react';
import classNames from 'classnames';
import { Collapse, Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router';
import NavbarVerticalMenuItem from './NavbarVerticalMenuItem';
import { useAppContext } from 'providers/AppProvider';

const CollapseItems = ({ route }) => {
  const { pathname } = useLocation();
  const isFolder =
    route.is_folder ||
    (!route.to && route.children && route.children.length > 0);

  const openCollapse = childrens => {
    const checkLink = children => {
      // Folders don't have direct paths, so check children
      if (!isFolder && children.to === pathname) {
        return true;
      }
      return (
        Object.prototype.hasOwnProperty.call(children, 'children') &&
        children.children.some(checkLink)
      );
    };
    return childrens.some(checkLink);
  };

  const [open, setOpen] = useState(openCollapse(route.children));

  return (
    <Nav.Item as="li">
      <Nav.Link
        onClick={() => {
          setOpen(!open);
        }}
        className={classNames('dropdown-indicator cursor-pointer', {
          'text-500': !route.active,
          'nav-folder-header': isFolder,
          'nav-parent-item': !isFolder
        })}
        aria-expanded={open}
        title={isFolder ? `Folder: ${route.name}` : `Section: ${route.name}`}
      >
        <NavbarVerticalMenuItem route={route} />
      </Nav.Link>
      <Collapse in={open}>
        <Nav className="flex-column nav" as="ul">
          <NavbarVerticalMenu routes={route.children} />
        </Nav>
      </Collapse>
    </Nav.Item>
  );
};

const NavbarVerticalMenu = ({ routes }) => {
  const {
    config: { showBurgerMenu },
    setConfig
  } = useAppContext();

  const handleNavItemClick = () => {
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };
  return routes.map(route => {
    const isFolder =
      route.is_folder ||
      (!route.to && route.children && route.children.length > 0);
    const isEmptyFolder =
      isFolder && (!route.children || route.children.length === 0);

    // Handle folders without children (empty folders)
    if (isEmptyFolder) {
      return (
        <Nav.Item as="li" key={route.name}>
          <Nav.Link
            className="nav-folder-item cursor-default"
            title={`Empty folder: ${route.name}`}
          >
            <NavbarVerticalMenuItem route={route} />
          </Nav.Link>
        </Nav.Item>
      );
    }

    // Handle routes without children (leaf nodes)
    if (!route.children) {
      // Don't render folder items without children as navigable links
      if (isFolder) {
        return (
          <Nav.Item as="li" key={route.name}>
            <Nav.Link
              className="nav-folder-item cursor-default"
              title={`Folder: ${route.name}`}
            >
              <NavbarVerticalMenuItem route={route} />
            </Nav.Link>
          </Nav.Item>
        );
      }

      // Regular navigable route
      return (
        <Nav.Item as="li" key={route.name} onClick={handleNavItemClick}>
          <NavLink
            end={route.exact}
            to={route.to}
            target={route?.newtab && '_blank'}
            onClick={() =>
              route.name === 'Modal'
                ? setConfig('openAuthModal', true)
                : undefined
            }
            className={({ isActive }) =>
              isActive && route.to !== '#!' ? 'active nav-link' : 'nav-link'
            }
          >
            <NavbarVerticalMenuItem route={route} />
          </NavLink>
        </Nav.Item>
      );
    }

    // Handle items with children (collapsible items)
    return <CollapseItems route={route} key={route.name} />;
  });
};

export default NavbarVerticalMenu;

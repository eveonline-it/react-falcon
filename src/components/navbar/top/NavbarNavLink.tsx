import React from 'react';
import { Nav } from 'react-bootstrap';
import classNames from 'classnames';
import { Link } from 'react-router';
import { useAppContext } from 'providers/AppProvider';

const NavbarNavLink = ({ title, route }) => {
  const {
    config: { navbarCollapsed, showBurgerMenu },
    setConfig
  } = useAppContext();

  const handleClick = () => {
    if (route.name === 'Modal') {
      setConfig('openAuthModal', true);
    }
    if (navbarCollapsed) {
      setConfig('navbarCollapsed', !navbarCollapsed);
    }
    if (showBurgerMenu) {
      setConfig('showBurgerMenu', !showBurgerMenu);
    }
  };
  return (
    <Nav.Link
      as={title ? 'p' : Link}
      className={classNames('fw-medium', {
        'text-500': !route?.active,
        'text-700 mb-0 fw-bold': title,
        'py-1': !title,
        'link-600': !title && route?.active
      })}
      to={route?.to}
      onClick={handleClick}
      target={route?.newtab && '_blank'}
    >
      {title ? title : route.name}
    </Nav.Link>
  );
};

export default NavbarNavLink;

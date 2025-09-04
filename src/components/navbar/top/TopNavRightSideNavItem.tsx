// React 19 JSX Transform - no explicit React import needed
import NotificationDropdown from 'components/navbar/top/NotificationDropdown';
import ProfileDropdown from 'components/navbar/top/ProfileDropdown';
import { Nav } from 'react-bootstrap';
import NineDotMenu from './NineDotMenu';
import ThemeControlDropdown from './ThemeControlDropdown';
import WebSocketStatusIndicator from './WebSocketStatusIndicator';

const TopNavRightSideNavItem = () => {
  return (
    <Nav
      navbar
      className="navbar-nav-icons ms-auto flex-row align-items-center"
      as="ul"
    >
      <WebSocketStatusIndicator />
      <ThemeControlDropdown />
      <NotificationDropdown />
      <NineDotMenu />
      <ProfileDropdown />
    </Nav>
  );
};

export default TopNavRightSideNavItem;

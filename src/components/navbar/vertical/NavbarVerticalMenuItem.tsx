import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';

// Map string icon names to their icon objects for brand icons
const brandIconMap: { [key: string]: any } = {
  'discord': faDiscord,
  'fab fa-discord': faDiscord,
  'fa-brands fa-discord': faDiscord
};

interface NavbarVerticalMenuItemProps {
  route: {
    name: string;
    icon?: string | string[];
    is_folder?: boolean;
    badge?: {
      type: string;
      text: string;
    };
    children?: any[];
  };
}

const NavbarVerticalMenuItem: React.FC<NavbarVerticalMenuItemProps> = ({ route }) => {
  const isFolder = route.is_folder || (route.children && route.children.length > 0);
  const routeIcon = isFolder ? (route.icon || 'folder') : route.icon;
  
  // Map brand icons to their proper icon objects
  const folderIcon = routeIcon && typeof routeIcon === 'string' && brandIconMap[routeIcon] 
    ? brandIconMap[routeIcon] 
    : routeIcon;
  
  return (
    <Flex alignItems="center" className={isFolder ? 'nav-folder-item' : 'nav-route-item'}>
      {folderIcon && (
        <span className={`nav-link-icon ${isFolder ? 'text-primary' : ''}`}>
          <FontAwesomeIcon icon={folderIcon} />
        </span>
      )}
      <span className={`nav-link-text ps-1 ${isFolder ? 'fw-semibold text-primary' : ''}`}>
        {route.name}
      </span>
      {isFolder && route.children && (
        <SubtleBadge pill bg="info" className="ms-2">
          {route.children.length}
        </SubtleBadge>
      )}
      {route.badge && !isFolder && (
        <SubtleBadge pill bg={route.badge.type} className="ms-2">
          {route.badge.text}
        </SubtleBadge>
      )}
    </Flex>
  );
};

export default React.memo(NavbarVerticalMenuItem);

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from 'components/common/Flex';
import SubtleBadge from 'components/common/SubtleBadge';

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
  const folderIcon = isFolder ? (route.icon || 'folder') : route.icon;
  
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

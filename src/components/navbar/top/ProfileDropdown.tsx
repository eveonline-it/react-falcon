import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router';
import { Dropdown } from 'react-bootstrap';
import team3 from 'assets/img/team/3.jpg';
import Avatar from 'components/common/Avatar';
import paths from 'routes/paths';
import { logout } from 'utils/auth';
import { useAuth } from 'contexts/AuthContext';

const ProfileDropdown = () => {
  const { user, charId } = useAuth();
  return (
    <Dropdown navbar={true} as="li">
      <Dropdown.Toggle
        bsPrefix="toggle"
        as={Link}
        to="#!"
        className="pe-0 ps-2 nav-link"
      >
        <Avatar 
          characterId={charId} 
          src={charId ? null : (user?.avatar || team3)} 
        />
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-caret dropdown-menu-card  dropdown-menu-end">
        <div className="bg-white rounded-2 py-2 dark__bg-1000">
          {user?.name && (
            <>
              <div className="px-3 py-2">
                <h6 className="mb-0">{user.name}</h6>
                {user.corporation && (
                  <small className="text-muted">{user.corporation}</small>
                )}
              </div>
              <Dropdown.Divider />
            </>
          )}
          {/* <Dropdown.Item className="fw-bold text-warning" href="#!">
            <FontAwesomeIcon icon="crown" className="me-1" />
            <span>Go Pro</span>
          </Dropdown.Item> */}
          <Dropdown.Divider />
          <Dropdown.Item href="#!">Characters</Dropdown.Item>
          <Dropdown.Item href="/login">Add Character</Dropdown.Item>
          <Dropdown.Item as={Link} to={paths.userProfile}>
            Profile &amp; account
          </Dropdown.Item>
          <Dropdown.Item href="#!">Feedback</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as={Link} to={paths.userSettings}>
            Settings
          </Dropdown.Item>
          <Dropdown.Item onClick={logout}>
            Logout
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;

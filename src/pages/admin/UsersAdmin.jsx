import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip,
  Tabs, Tab, ButtonGroup, Dropdown, ProgressBar, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faSearch, faFilter, faEye, faSync, faUserEdit,
  faCheck, faTimes, faExclamationTriangle, faUserCheck, faUserTimes,
  faCheckCircle, faTimesCircle, faInfoCircle, faUser,
  faUserSlash, faBan, faShieldAlt, faGlobe, faCalendarAlt,
  faEdit, faSave, faPlus, faTrash, faCopy, faFileExport,
  faCheckSquare, faSquare, faStickyNote, faBuilding
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import {
  useUsers,
  useUserStats,
  useUserProfile,
  useUpdateUserStatus,
  useUpdateUser,
  useRefreshUserData,
  useBulkUpdateUsers,
  useUsersStatus
} from 'hooks/useUsers';

const CharacterPortrait = ({ characterId, characterName, size = 32 }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (imageError || !characterId) {
    return (
      <div 
        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`
        }}
      >
        <FontAwesomeIcon 
          icon={faUser} 
          className="text-white" 
          size={size > 64 ? '2x' : 'sm'} 
        />
      </div>
    );
  }
  
  return (
    <img
      src={`https://images.evetech.net/characters/${characterId}/portrait?size=${size > 32 ? 256 : 64}`}
      alt={characterName}
      className="rounded-circle"
      width={size}
      height={size}
      style={{ objectFit: 'cover' }}
      onError={handleImageError}
    />
  );
};

const UsersAdmin = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    search: '',
    enabled: '',
    banned: '',
    invalid: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ user: null, status: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [userPosition, setUserPosition] = useState('');

  const { data: usersData, isLoading, error, refetch } = useUsers(filters);
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(selectedUser?.user_id || selectedUser?.id);
  const { data: usersStatus } = useUsersStatus();
  const updateStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  const refreshDataMutation = useRefreshUserData();
  const bulkUpdateMutation = useBulkUpdateUsers();

  const users = usersData?.users || [];
  const totalPages = usersData?.total_pages || 1;
  const totalUsers = usersData?.total || 0;
  
  // React 19 compiler will optimize this automatically
  const filteredUsers = users.filter(user => {
    if (searchTerm && !(
      user.character_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.corporation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.alliance_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    return true;
  });
  
  const selectedCount = selectedUsers.size;

  const userStatuses = [
    { value: 'enabled', label: 'Enabled', color: 'success', icon: faCheckCircle },
    { value: 'disabled', label: 'Disabled', color: 'secondary', icon: faTimesCircle },
    { value: 'banned', label: 'Banned', color: 'danger', icon: faBan },
    { value: 'invalid', label: 'Invalid', color: 'warning', icon: faExclamationTriangle }
  ];

  const getStatusInfo = (status) => {
    return userStatuses.find(s => s.value === status) || userStatuses[0];
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleOpenUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleStatusChange = (user, newStatus) => {
    setStatusUpdate({ user, status: newStatus });
    setShowStatusConfirm(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusUpdate.user || !statusUpdate.status) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        userId: statusUpdate.user.id,
        status: statusUpdate.status
      });
      setShowStatusConfirm(false);
      setStatusUpdate({ user: null, status: '' });
      refetch();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const handleRefreshUserData = async (userId) => {
    try {
      await refreshDataMutation.mutateAsync(userId);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };
  
  const handleSelectUser = (userId, isSelected) => {
    const newSelected = new Set(selectedUsers);
    if (isSelected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };
  
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUsers(new Set(filteredUsers.map(user => user.user_id || user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };
  
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setUserNotes(user.notes || '');
    setUserPosition(user.position?.toString() || '');
    setShowEditModal(true);
  };
  
  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const updateData = {
        notes: userNotes,
        position: userPosition ? parseInt(userPosition, 10) : null
      };
      
      await updateUserMutation.mutateAsync({
        userId: editingUser.user_id || editingUser.id,
        data: updateData
      });
      
      setShowEditModal(false);
      setEditingUser(null);
      setUserNotes('');
      setUserPosition('');
      refetch();
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };
  
  const handleBulkAction = async () => {
    if (selectedUsers.size === 0 || !bulkAction) return;
    
    try {
      const userIds = Array.from(selectedUsers);
      let updateData = {};
      
      switch (bulkAction) {
        case 'enable':
          updateData = { enabled: true, banned: false, invalid: false };
          break;
        case 'disable':
          updateData = { enabled: false, banned: false, invalid: false };
          break;
        case 'ban':
          updateData = { enabled: false, banned: true, invalid: false };
          break;
        case 'unban':
          updateData = { enabled: true, banned: false, invalid: false };
          break;
        default:
          return;
      }
      
      await bulkUpdateMutation.mutateAsync({ userIds, data: updateData });
      setSelectedUsers(new Set());
      setShowBulkModal(false);
      setBulkAction('');
      refetch();
    } catch (err) {
      console.error('Failed to perform bulk action:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };
  
  const getUserStatus = (user) => {
    if (user.banned) return { value: 'banned', label: 'Banned', color: 'danger', icon: faBan };
    if (user.invalid) return { value: 'invalid', label: 'Invalid', color: 'warning', icon: faExclamationTriangle };
    if (!user.enabled) return { value: 'disabled', label: 'Disabled', color: 'secondary', icon: faTimesCircle };
    return { value: 'enabled', label: 'Enabled', color: 'success', icon: faCheckCircle };
  };
  
  const exportUsers = () => {
    const csvContent = [
      ['Character Name', 'Email', 'Status', 'Corporation', 'Alliance', 'Joined', 'Last Login', 'Notes'].join(','),
      ...filteredUsers.map(user => {
        const status = getUserStatus(user);
        return [
          user.character_name || '',
          user.email || '',
          status.label,
          user.corporation_name || '',
          user.alliance_name || '',
          formatDate(user.created_at),
          formatDate(user.last_login),
          user.notes || ''
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Users exported successfully!');
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load users: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Users Management
              {usersStatus && (
                <Badge bg={usersStatus.status === 'healthy' ? 'success' : 'warning'} className="ms-2">
                  {usersStatus.status}
                </Badge>
              )}
            </h1>
            <div>
              {selectedCount > 0 && (
                <>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => setShowBulkModal(true)}
                  >
                    <FontAwesomeIcon icon={faUsers} className="me-1" />
                    Bulk Actions ({selectedCount})
                  </Button>
                </>
              )}
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                onClick={exportUsers}
              >
                <FontAwesomeIcon icon={faFileExport} className="me-1" />
                Export
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters Row */}
      <Row className="mb-4">
        <Col lg={5}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search users by name, email, corporation, alliance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline-secondary" onClick={handleSearch}>
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputGroup>
        </Col>
        <Col lg={7} className="text-end">
          <Form.Check
            inline
            type="checkbox"
            id="enabled-filter"
            label="Enabled"
            checked={filters.enabled === 'true'}
            onChange={(e) => setFilters({...filters, enabled: e.target.checked ? 'true' : '', page: 1})}
            className="me-3"
          />
          <Form.Check
            inline
            type="checkbox"
            id="banned-filter"
            label="Banned"
            checked={filters.banned === 'true'}
            onChange={(e) => setFilters({...filters, banned: e.target.checked ? 'true' : '', page: 1})}
            className="me-3"
          />
          <Form.Check
            inline
            type="checkbox"
            id="invalid-filter"
            label="Invalid"
            checked={filters.invalid === 'true'}
            onChange={(e) => setFilters({...filters, invalid: e.target.checked ? 'true' : '', page: 1})}
            className="me-3"
          />
          <Button variant="outline-primary" size="sm" onClick={refetch} className="ms-2">
            <FontAwesomeIcon icon={faSync} className="me-1" />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      {statsData && (
        <Row className="mb-4">
          <Col md={3}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary me-3" />
                  <div>
                    <h6 className="mb-0">Total Users</h6>
                    <h4 className="mb-0">{statsData.total_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUserCheck} size="2x" className="text-success me-3" />
                  <div>
                    <h6 className="mb-0">Enabled</h6>
                    <h4 className="mb-0">{statsData.enabled_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUserTimes} size="2x" className="text-secondary me-3" />
                  <div>
                    <h6 className="mb-0">Disabled</h6>
                    <h4 className="mb-0">{statsData.disabled_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBan} size="2x" className="text-danger me-3" />
                  <div>
                    <h6 className="mb-0">Banned</h6>
                    <h4 className="mb-0">{statsData.banned_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Users Table */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : filteredUsers.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No users found
                </Alert>
              ) : (
                <Table hover responsive size="sm" className="small">
                  <thead>
                    <tr>
                      <th className="py-2 align-middle" style={{ width: '40px' }}>
                        <Form.Check
                          type="checkbox"
                          checked={filteredUsers.length > 0 && filteredUsers.every(user => selectedUsers.has(user.user_id || user.id))}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="py-2 align-middle">Character</th>
                      <th className="py-2 align-middle">Email</th>
                      <th className="py-2 align-middle">Status</th>
                      <th className="py-2 align-middle">Corporation</th>
                      <th className="py-2 align-middle">Alliance</th>
                      <th className="py-2 align-middle">Joined</th>
                      <th className="py-2 align-middle">Last Login</th>
                      <th className="py-2 align-middle">Notes</th>
                      <th className="py-2 align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const statusInfo = getUserStatus(user);
                      const userId = user.user_id || user.id;
                      // Create a truly unique key by combining available identifiers
                      const uniqueKey = `${userId || 'no-id'}-${user.character_id || 'no-char'}-${index}`;
                      return (
                        <tr key={uniqueKey}>
                          <td className="py-2 align-middle">
                            <Form.Check
                              type="checkbox"
                              checked={selectedUsers.has(userId)}
                              onChange={(e) => handleSelectUser(userId, e.target.checked)}
                            />
                          </td>
                          <td className="py-2 align-middle">
                            <div className="d-flex align-items-center">
                              <div className="me-2" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                                {user.character_id ? (
                                  <CharacterPortrait 
                                    characterId={user.character_id}
                                    characterName={user.character_name}
                                    size={32}
                                  />
                                ) : (
                                  <div 
                                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                    style={{ 
                                      width: '32px', 
                                      height: '32px'
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faUser} className="text-white" size="sm" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="fw-bold">{user.character_name || user.email}</div>
                                <small className="text-muted">ID: {user.character_id || 'N/A'}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 align-middle">
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                              {user.email || '-'}
                            </span>
                          </td>
                          <td className="py-2 align-middle">
                            <Badge bg={statusInfo.color} className="small">
                              <FontAwesomeIcon icon={statusInfo.icon} className="me-1" size="xs" />
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-2 align-middle">
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {user.corporation_name || '-'}
                            </span>
                          </td>
                          <td className="py-2 align-middle">
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {user.alliance_name || '-'}
                            </span>
                          </td>
                          <td className="py-2 align-middle">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="py-2 align-middle">
                            {formatDate(user.last_login)}
                          </td>
                          <td className="py-2 align-middle">
                            <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                              {user.notes ? (
                                <OverlayTrigger placement="top" overlay={<Tooltip>{user.notes}</Tooltip>}>
                                  <span>
                                    <FontAwesomeIcon icon={faStickyNote} className="me-1 text-primary" />
                                    {user.notes}
                                  </span>
                                </OverlayTrigger>
                              ) : (
                                '-'
                              )}
                            </span>
                          </td>
                          <td className="py-2 align-middle">
                            <ButtonGroup size="sm">
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>View Details</Tooltip>}
                              >
                                <Button
                                  variant="outline-info"
                                  onClick={() => handleOpenUserModal(user)}
                                >
                                  <FontAwesomeIcon icon={faEye} size="xs" />
                                </Button>
                              </OverlayTrigger>

                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Edit User</Tooltip>}
                              >
                                <Button
                                  variant="outline-warning"
                                  onClick={() => handleOpenEditModal(user)}
                                >
                                  <FontAwesomeIcon icon={faEdit} size="xs" />
                                </Button>
                              </OverlayTrigger>

                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Refresh Data</Tooltip>}
                              >
                                <Button
                                  variant="outline-secondary"
                                  onClick={() => handleRefreshUserData(userId)}
                                  disabled={refreshDataMutation.isPending}
                                >
                                  <FontAwesomeIcon icon={faSync} size="xs" />
                                </Button>
                              </OverlayTrigger>

                              <Dropdown>
                                <Dropdown.Toggle variant="outline-primary" size="sm">
                                  <FontAwesomeIcon icon={faUserEdit} size="xs" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {userStatuses.map(status => (
                                    <Dropdown.Item
                                      key={status.value}
                                      onClick={() => handleStatusChange(user, status.value)}
                                      className={user.status === status.value ? 'active' : ''}
                                    >
                                      <FontAwesomeIcon icon={status.icon} className="me-2" />
                                      {status.label}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            </ButtonGroup>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                    className="me-2"
                  >
                    Previous
                  </Button>
                  <span className="align-self-center mx-3">
                    Page {filters.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                    className="ms-2"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Details Modal */}
      <Modal show={showUserModal} onHide={handleCloseUserModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            User Details - {selectedUser?.character_name || selectedUser?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading user details...</span>
              </Spinner>
            </div>
          ) : selectedUser ? (
            <>
              {/* Character Portrait Section */}
              {selectedUser.character_id && (
                <div className="text-center mb-4">
                  <div style={{ border: '3px solid #dee2e6', borderRadius: '50%', display: 'inline-block' }}>
                    <CharacterPortrait 
                      characterId={selectedUser.character_id}
                      characterName={selectedUser.character_name}
                      size={128}
                    />
                  </div>
                  <div className="mt-2">
                    <h5 className="mb-1">{selectedUser.character_name}</h5>
                    <small className="text-muted">{selectedUser.corporation_name}</small>
                  </div>
                </div>
              )}
              
              <Row>
                <Col md={6}>
                  <h5>Character Information</h5>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>Character Name:</strong></td>
                      <td>{selectedUser.character_name || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Character ID:</strong></td>
                      <td>{selectedUser.character_id || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Corporation:</strong></td>
                      <td>{selectedUser.corporation_name || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Alliance:</strong></td>
                      <td>{selectedUser.alliance_name || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Security Status:</strong></td>
                      <td>{selectedUser.security_status ? selectedUser.security_status.toFixed(2) : (userProfile?.security_status ? userProfile.security_status.toFixed(2) : '-')}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h5>Account Information</h5>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td><strong>User ID:</strong></td>
                      <td>{selectedUser.user_id || selectedUser.id || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Email:</strong></td>
                      <td>{selectedUser.email || '-'}</td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <Badge bg={getUserStatus(selectedUser).color}>
                          {getUserStatus(selectedUser).label}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Enabled:</strong></td>
                      <td>
                        <Badge bg={selectedUser.enabled ? 'success' : 'secondary'}>
                          {selectedUser.enabled ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Banned:</strong></td>
                      <td>
                        <Badge bg={selectedUser.banned ? 'danger' : 'success'}>
                          {selectedUser.banned ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Invalid:</strong></td>
                      <td>
                        <Badge bg={selectedUser.invalid ? 'warning' : 'success'}>
                          {selectedUser.invalid ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Joined:</strong></td>
                      <td>{formatDateTime(selectedUser.created_at)}</td>
                    </tr>
                    <tr>
                      <td><strong>Last Login:</strong></td>
                      <td>{formatDateTime(selectedUser.last_login)}</td>
                    </tr>
                    <tr>
                      <td><strong>Last Updated:</strong></td>
                      <td>{formatDateTime(selectedUser.updated_at)}</td>
                    </tr>
                    {selectedUser.notes ? (
                      <tr>
                        <td><strong>Admin Notes:</strong></td>
                        <td className="text-break">{selectedUser.notes}</td>
                      </tr>
                    ) : null}
                    {selectedUser.position ? (
                      <tr>
                        <td><strong>Position:</strong></td>
                        <td>{selectedUser.position}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </Table>
              </Col>
            </Row>
            </>
          ) : (
            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              No user selected.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseUserModal}>
            Close
          </Button>
          {selectedUser && (
            <Button 
              variant="outline-primary"
              onClick={() => handleRefreshUserData(selectedUser.id)}
              disabled={refreshDataMutation.isPending}
            >
              {refreshDataMutation.isPending ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSync} className="me-2" />
                  Refresh Data
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Status Change Confirmation Modal */}
      <Modal show={showStatusConfirm} onHide={() => setShowStatusConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Are you sure you want to change the status of user <strong>{statusUpdate.user?.character_name || statusUpdate.user?.email}</strong> to <strong>{getStatusInfo(statusUpdate.status).label}</strong>?
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusConfirm(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmStatusChange}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Confirm
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faEdit} className="me-2" />
            Edit User - {editingUser?.character_name || editingUser?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Enter notes about this user..."
              />
              <Form.Text className="text-muted">
                Internal notes visible only to administrators
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="number"
                value={userPosition}
                onChange={(e) => setUserPosition(e.target.value)}
                placeholder="Enter position/rank..."
              />
              <Form.Text className="text-muted">
                Numerical position or rank for sorting purposes
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveUser}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Bulk Actions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            This action will affect <strong>{selectedCount}</strong> selected users.
          </Alert>
          
          <Form.Group>
            <Form.Label>Select Action</Form.Label>
            <Form.Select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">Choose an action...</option>
              <option value="enable">Enable Users</option>
              <option value="disable">Disable Users</option>
              <option value="ban">Ban Users</option>
              <option value="unban">Unban Users</option>
            </Form.Select>
          </Form.Group>
          
          {bulkAction && (
            <Alert variant="warning" className="mt-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Are you sure you want to <strong>{bulkAction}</strong> {selectedCount} users? This action cannot be undone.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={bulkAction === 'ban' ? 'danger' : 'primary'} 
            onClick={handleBulkAction}
            disabled={!bulkAction || bulkUpdateMutation.isPending}
          >
            {bulkUpdateMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Apply Action
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersAdmin;
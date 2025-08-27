import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip,
  Tabs, Tab, ButtonGroup, Dropdown, ProgressBar, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faSearch, faFilter, faEye, faSync, faUserEdit,
  faCheck, faTimes, faExclamationTriangle,
  faCheckCircle, faTimesCircle, faInfoCircle, faUser,
  faUserSlash, faBan, faShieldAlt, faGlobe, faCalendarAlt,
  faEdit, faSave, faPlus, faTrash, faCopy, faFileExport,
  faCheckSquare, faSquare, faStickyNote, faBuilding, faUsersCog
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { CharacterPortrait, CorporationLogo, AllianceLogo, GroupsBadges } from 'components/common';

import {
  useUsers,
  useUserStats,
  useUserProfile,
  useUpdateUserStatus,
  useUpdateUser,
  useRefreshUserData,
  useBulkUpdateUsers,
  useUsersStatus,
  useDeleteUser,
  useEnrichedUser,
  useUserGroups
} from 'hooks/useUsers';


const UsersAdmin = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    search: '',
    banned: '',
    valid: ''
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { data: usersData, isLoading, error, refetch } = useUsers(filters);
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(selectedUser?.character_id);
  const { data: enrichedUser, isLoading: enrichedLoading } = useEnrichedUser(selectedUser);
  const { data: usersStatus } = useUsersStatus();
  const updateStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  const refreshDataMutation = useRefreshUserData();
  const bulkUpdateMutation = useBulkUpdateUsers();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.users || [];
  const totalPages = usersData?.total_pages || 1;
  const totalUsers = usersData?.total || 0;
  
  // React 19 compiler will optimize this automatically
  const filteredUsers = users.filter(user => {
    if (searchTerm && !(
      user.character_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.corporation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.alliance_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )) {
      return false;
    }
    return true;
  });
  
  const selectedCount = selectedUsers.size;

  const userStatuses = [
    { value: 'valid', label: 'Valid', color: 'success', icon: faCheckCircle },
    { value: 'banned', label: 'Banned', color: 'danger', icon: faBan }
  ];

  const getStatusInfo = (status) => {
    return userStatuses.find(s => s.value === status) || userStatuses[0];
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  // Debounced auto-search functionality
  const debouncedSearch = useCallback(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-trigger search when searchTerm changes
  useEffect(() => {
    const cleanup = debouncedSearch();
    return cleanup;
  }, [debouncedSearch]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(refreshInterval);
  }, [refetch]);

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
      // Failed to update user status
    }
  };

  const handleRefreshUserData = async (userId) => {
    try {
      await refreshDataMutation.mutateAsync(userId);
    } catch (err) {
      // Failed to refresh user data
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
        position: userPosition ? parseInt(userPosition, 10) : null,
        // Include current status fields to maintain user's current state
        banned: editingUser.banned || false,
        valid: editingUser.valid !== false // Default to true if undefined
      };
      
      const characterId = editingUser.character_id;
      if (!characterId) {
        throw new Error('Character ID is required for user updates');
      }
      
      
      await updateUserMutation.mutateAsync({
        userId: characterId, // API expects character_id, but we call it userId in the hook
        data: updateData
      });
      
      setShowEditModal(false);
      setEditingUser(null);
      setUserNotes('');
      setUserPosition('');
      refetch();
    } catch (err) {
      toast.error(`Failed to update user: ${err.message}`);
    }
  };
  
  const handleBulkAction = async () => {
    if (selectedUsers.size === 0 || !bulkAction) return;
    
    try {
      const userIds = Array.from(selectedUsers);
      let updateData = {};
      
      switch (bulkAction) {
        case 'ban':
          updateData = { banned: true, valid: false };
          break;
        case 'unban':
          updateData = { banned: false, valid: true };
          break;
        case 'validate':
          updateData = { banned: false, valid: true };
          break;
        case 'invalidate':
          updateData = { banned: false, valid: false };
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
      // Failed to perform bulk action
    }
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUserMutation.mutateAsync(userToDelete.character_id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      refetch();
    } catch (err) {
      // Failed to delete user
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
    if (user.valid === false) return { value: 'invalid', label: 'Invalid', color: 'warning', icon: faExclamationTriangle };
    return { value: 'valid', label: 'Valid', color: 'success', icon: faCheckCircle };
  };
  
  const exportUsers = () => {
    const csvContent = [
      ['Character Name', 'Status', 'Corporation', 'Alliance', 'Joined', 'Last Login', 'Notes'].join(','),
      ...filteredUsers.map(user => {
        const status = getUserStatus(user);
        return [
          user.character_name || '',
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
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} className="text-muted" aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users by character name, corporation, alliance... (auto-search)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search users by character name, corporation, or alliance"
              aria-describedby="search-help"
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
                title="Clear search"
                aria-label="Clear search input"
              >
                <FontAwesomeIcon icon={faTimes} aria-hidden="true" />
              </Button>
            )}
          </InputGroup>
          <Form.Text id="search-help" className="sr-only">
            Search automatically starts as you type. Results are filtered by character name, corporation, or alliance.
          </Form.Text>
        </Col>
        <Col lg={7} className="text-end">
          <Form.Check
            inline
            type="checkbox"
            id="banned-filter"
            label="Banned"
            checked={filters.banned === true}
            onChange={(e) => setFilters({...filters, banned: e.target.checked ? true : '', page: 1})}
            className="me-3"
          />
          <Form.Check
            inline
            type="checkbox"
            id="invalid-filter"
            label="Invalid"
            checked={filters.valid === false}
            onChange={(e) => setFilters({...filters, valid: e.target.checked ? false : '', page: 1})}
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
                  <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success me-3" />
                  <div>
                    <h6 className="mb-0">Valid</h6>
                    <h4 className="mb-0">{statsData.valid_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-warning me-3" />
                  <div>
                    <h6 className="mb-0">Invalid</h6>
                    <h4 className="mb-0">{statsData.invalid_users || 0}</h4>
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
                <Table 
                  hover 
                  responsive 
                  size="sm" 
                  className="small"
                  aria-label="Users management table"
                  role="table"
                >
                  <caption className="sr-only">
                    Table showing EVE Online users with their character information, status, corporation, alliance, groups, join dates, and available actions. Use checkboxes to select multiple users for bulk operations.
                  </caption>
                  <thead>
                    <tr role="row">
                      <th 
                        className="py-2 align-middle d-none d-sm-table-cell" 
                        style={{ width: '40px' }}
                        scope="col"
                      >
                        <Form.Check
                          type="checkbox"
                          checked={filteredUsers.length > 0 && filteredUsers.every(user => selectedUsers.has(user.user_id || user.id))}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          aria-label="Select all users"
                        />
                      </th>
                      <th className="py-2 align-middle" scope="col">Character</th>
                      <th className="py-2 align-middle" scope="col">Status</th>
                      <th className="py-2 align-middle d-none d-md-table-cell" scope="col">Corporation</th>
                      <th className="py-2 align-middle d-none d-lg-table-cell" scope="col">Alliance</th>
                      <th className="py-2 align-middle d-none d-xl-table-cell" scope="col">Groups</th>
                      <th className="py-2 align-middle d-none d-lg-table-cell" scope="col">Joined</th>
                      <th className="py-2 align-middle d-none d-xl-table-cell" scope="col">Last Login</th>
                      <th className="py-2 align-middle d-none d-lg-table-cell" scope="col">Notes</th>
                      <th className="py-2 align-middle" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => {
                      const statusInfo = getUserStatus(user);
                      const userId = user.user_id || user.id;
                      // Create a truly unique key by combining available identifiers
                      const uniqueKey = `${userId || 'no-id'}-${user.character_id || 'no-char'}-${index}`;
                      return (
                        <tr key={uniqueKey} role="row">
                          <td className="py-2 align-middle d-none d-sm-table-cell" role="cell">
                            <Form.Check
                              type="checkbox"
                              checked={selectedUsers.has(userId)}
                              onChange={(e) => handleSelectUser(userId, e.target.checked)}
                              aria-label={`Select user ${user.character_name || 'Unknown'}`}
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
                              <div className="flex-grow-1">
                                <div className="fw-bold">{user.character_name}</div>
                                <div className="d-flex flex-wrap gap-1 align-items-center mt-1">
                                  <small className="text-muted">ID: {user.character_id || 'N/A'}</small>
                                  <Badge bg={statusInfo.color} className="d-sm-none" style={{fontSize: '0.65rem'}}>
                                    <FontAwesomeIcon icon={statusInfo.icon} className="me-1" size="xs" />
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="d-md-none mt-1">
                                  <small className="text-muted">
                                    {user.corporation_name && (
                                      <><FontAwesomeIcon icon={faBuilding} className="me-1" />{user.corporation_name}</>
                                    )}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 align-middle d-none d-sm-table-cell">
                            <Badge bg={statusInfo.color} className="small">
                              <FontAwesomeIcon icon={statusInfo.icon} className="me-1" size="xs" />
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="py-2 align-middle d-none d-md-table-cell">
                            <div className="d-flex align-items-center">
                              {user.corporation_id && (
                                <div className="me-2" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                  <CorporationLogo 
                                    corporationId={user.corporation_id}
                                    corporationName={user.corporation_name}
                                    size={24}
                                  />
                                </div>
                              )}
                              <div className="d-flex flex-column text-truncate" style={{ maxWidth: '130px' }}>
                                <span>{user.corporation_name || '-'}</span>
                                {user.corporation_ticker && (
                                  <small className="text-muted">[{user.corporation_ticker}]</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 align-middle d-none d-lg-table-cell">
                            <div className="d-flex align-items-center">
                              {user.alliance_id && (
                                <div className="me-2" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                  <AllianceLogo 
                                    allianceId={user.alliance_id}
                                    allianceName={user.alliance_name}
                                    size={24}
                                  />
                                </div>
                              )}
                              <div className="d-flex flex-column text-truncate" style={{ maxWidth: '130px' }}>
                                <span>{user.alliance_name || '-'}</span>
                                {user.alliance_ticker && (
                                  <small className="text-muted">[{user.alliance_ticker}]</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 align-middle d-none d-xl-table-cell">
                            <GroupsBadges userId={user.user_id || user.id} compact={true} />
                          </td>
                          <td className="py-2 align-middle d-none d-lg-table-cell">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="py-2 align-middle d-none d-xl-table-cell">
                            {formatDate(user.last_login)}
                          </td>
                          <td className="py-2 align-middle d-none d-lg-table-cell">
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
                            {/* Desktop Actions */}
                            <div className="d-none d-md-flex">
                              <ButtonGroup size="sm">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>View Details</Tooltip>}
                                >
                                  <Button
                                    variant="outline-info"
                                    onClick={() => handleOpenUserModal(user)}
                                    aria-label={`View details for ${user.character_name || 'Unknown'}`}
                                  >
                                    <FontAwesomeIcon icon={faEye} size="xs" aria-hidden="true" />
                                  </Button>
                                </OverlayTrigger>

                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Edit User</Tooltip>}
                                >
                                  <Button
                                    variant="outline-warning"
                                    onClick={() => handleOpenEditModal(user)}
                                    aria-label={`Edit user ${user.character_name || 'Unknown'}`}
                                  >
                                    <FontAwesomeIcon icon={faEdit} size="xs" aria-hidden="true" />
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
                                    aria-label={`Refresh data for ${user.character_name || 'Unknown'}`}
                                  >
                                    <FontAwesomeIcon icon={faSync} size="xs" aria-hidden="true" />
                                  </Button>
                                </OverlayTrigger>

                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip>Delete User</Tooltip>}
                                >
                                  <Button
                                    variant="outline-danger"
                                    onClick={() => handleOpenDeleteModal(user)}
                                    disabled={deleteUserMutation.isPending}
                                    aria-label={`Delete user ${user.character_name || 'Unknown'}`}
                                  >
                                    <FontAwesomeIcon icon={faTrash} size="xs" aria-hidden="true" />
                                  </Button>
                                </OverlayTrigger>

                                <Dropdown>
                                  <Dropdown.Toggle 
                                    variant="outline-primary" 
                                    size="sm"
                                    aria-label={`Change status for ${user.character_name || 'Unknown'}`}
                                  >
                                    <FontAwesomeIcon icon={faUserEdit} size="xs" aria-hidden="true" />
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
                            </div>

                            {/* Mobile Actions */}
                            <div className="d-md-none">
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-primary" size="sm">
                                  <FontAwesomeIcon icon={faUserEdit} size="xs" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => handleOpenUserModal(user)}>
                                    <FontAwesomeIcon icon={faEye} className="me-2" />
                                    View Details
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleOpenEditModal(user)}>
                                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                                    Edit User
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Header>Change Status</Dropdown.Header>
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
                                  <Dropdown.Divider />
                                  <Dropdown.Item 
                                    onClick={() => handleRefreshUserData(userId)}
                                    disabled={refreshDataMutation.isPending}
                                  >
                                    <FontAwesomeIcon icon={faSync} className="me-2" />
                                    Refresh Data
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleOpenDeleteModal(user)}
                                    disabled={deleteUserMutation.isPending}
                                    className="text-danger"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                                    Delete User
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
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
            User Details - {selectedUser?.character_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(profileLoading || enrichedLoading) ? (
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
                    {(enrichedUser?.corporation_name || selectedUser.corporation_name) && (
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        {(enrichedUser?.corporation_id || selectedUser.corporation_id) && (
                          <CorporationLogo 
                            corporationId={enrichedUser?.corporation_id || selectedUser.corporation_id}
                            corporationName={enrichedUser?.corporation_name || selectedUser.corporation_name}
                            size={20}
                          />
                        )}
                        <small className="text-muted ms-2">{enrichedUser?.corporation_name || selectedUser.corporation_name}</small>
                      </div>
                    )}
                    {(enrichedUser?.alliance_name || selectedUser.alliance_name) && (
                      <div className="d-flex align-items-center justify-content-center">
                        {(enrichedUser?.alliance_id || selectedUser.alliance_id) && (
                          <AllianceLogo 
                            allianceId={enrichedUser?.alliance_id || selectedUser.alliance_id}
                            allianceName={enrichedUser?.alliance_name || selectedUser.alliance_name}
                            size={18}
                          />
                        )}
                        <small className="text-muted ms-2">{enrichedUser?.alliance_name || selectedUser.alliance_name}</small>
                      </div>
                    )}
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
                        <td>{selectedUser.character_name || 'Not available'}</td>
                      </tr>
                      <tr>
                        <td><strong>Character ID:</strong></td>
                        <td>{selectedUser.character_id || 'Not available'}</td>
                      </tr>
                      <tr>
                        <td><strong>Corporation ID:</strong></td>
                        <td>
                          <div className="d-flex align-items-center">
                            {(enrichedUser?.corporation_id || selectedUser.corporation_id) && (
                              <div className="me-2">
                                <CorporationLogo 
                                  corporationId={enrichedUser?.corporation_id || selectedUser.corporation_id}
                                  corporationName={enrichedUser?.corporation_name || selectedUser.corporation_name}
                                  size={16}
                                />
                              </div>
                            )}
                            <span>{enrichedUser?.corporation_id || selectedUser.corporation_id || 'Not available'}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Corporation Name:</strong></td>
                        <td>
                          <div className="d-flex align-items-center">
                            {(enrichedUser?.corporation_id || selectedUser.corporation_id) && (
                              <div className="me-2">
                                <CorporationLogo 
                                  corporationId={enrichedUser?.corporation_id || selectedUser.corporation_id}
                                  corporationName={enrichedUser?.corporation_name || selectedUser.corporation_name}
                                  size={20}
                                />
                              </div>
                            )}
                            <div className="d-flex flex-column">
                              <span>{enrichedUser?.corporation_name || selectedUser.corporation_name || 'Not available'}</span>
                              {(enrichedUser?.corporation_ticker || selectedUser.corporation_ticker) && (
                                <small className="text-muted">[{enrichedUser?.corporation_ticker || selectedUser.corporation_ticker}]</small>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                      {(enrichedUser?.corporation_member_count || selectedUser.corporation_member_count) && (
                        <tr>
                          <td><strong>Corporation Members:</strong></td>
                          <td>{(enrichedUser?.corporation_member_count || selectedUser.corporation_member_count).toLocaleString()}</td>
                        </tr>
                      )}
                      {(enrichedUser?.corporation_tax_rate !== undefined || selectedUser.corporation_tax_rate !== undefined) && (
                        <tr>
                          <td><strong>Corporation Tax Rate:</strong></td>
                          <td>{((enrichedUser?.corporation_tax_rate ?? selectedUser.corporation_tax_rate) * 100).toFixed(1)}%</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>Alliance ID:</strong></td>
                        <td>
                          <div className="d-flex align-items-center">
                            {(enrichedUser?.alliance_id || selectedUser.alliance_id) && (
                              <div className="me-2">
                                <AllianceLogo 
                                  allianceId={enrichedUser?.alliance_id || selectedUser.alliance_id}
                                  allianceName={enrichedUser?.alliance_name || selectedUser.alliance_name}
                                  size={16}
                                />
                              </div>
                            )}
                            <span>{enrichedUser?.alliance_id || selectedUser.alliance_id || 'Not available'}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Alliance Name:</strong></td>
                        <td>
                          <div className="d-flex align-items-center">
                            {(enrichedUser?.alliance_id || selectedUser.alliance_id) && (
                              <div className="me-2">
                                <AllianceLogo 
                                  allianceId={enrichedUser?.alliance_id || selectedUser.alliance_id}
                                  allianceName={enrichedUser?.alliance_name || selectedUser.alliance_name}
                                  size={20}
                                />
                              </div>
                            )}
                            <div className="d-flex flex-column">
                              <span>{enrichedUser?.alliance_name || selectedUser.alliance_name || 'Not available'}</span>
                              {(enrichedUser?.alliance_ticker || selectedUser.alliance_ticker) && (
                                <small className="text-muted">[{enrichedUser?.alliance_ticker || selectedUser.alliance_ticker}]</small>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Security Status:</strong></td>
                        <td>
                          {(enrichedUser?.security_status !== undefined && enrichedUser?.security_status !== null) || (selectedUser.security_status !== undefined && selectedUser.security_status !== null)
                            ? (enrichedUser?.security_status ?? selectedUser.security_status).toFixed(2) 
                            : 'Not available'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Birthday:</strong></td>
                        <td>{(enrichedUser?.birthday || selectedUser.birthday) ? formatDate(enrichedUser?.birthday || selectedUser.birthday) : 'Not available'}</td>
                      </tr>
                      {(enrichedUser?.gender || selectedUser.gender) && (
                        <tr>
                          <td><strong>Gender:</strong></td>
                          <td>{enrichedUser?.gender || selectedUser.gender}</td>
                        </tr>
                      )}
                      {(enrichedUser?.description || selectedUser.description) && (
                        <tr>
                          <td><strong>Description:</strong></td>
                          <td>
                            <div style={{ maxWidth: '300px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                              {enrichedUser?.description || selectedUser.description}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5>Account Information</h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>User ID:</strong></td>
                        <td>{selectedUser.user_id || selectedUser.id || 'Not available'}</td>
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
                        <td><strong>Banned:</strong></td>
                        <td>
                          <Badge bg={selectedUser.banned ? 'danger' : 'success'}>
                            {selectedUser.banned !== undefined ? (selectedUser.banned ? 'Yes' : 'No') : 'Not available'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Valid Profile:</strong></td>
                        <td>
                          <Badge bg={selectedUser.valid ? 'success' : 'warning'}>
                            {selectedUser.valid !== undefined ? (selectedUser.valid ? 'Yes' : 'No') : 'Not available'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Scopes:</strong></td>
                        <td>
                          {selectedUser.scopes ? (
                            <small className="text-muted">
                              {Array.isArray(selectedUser.scopes) 
                                ? selectedUser.scopes.join(', ') 
                                : selectedUser.scopes}
                            </small>
                          ) : 'Not available'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Joined:</strong></td>
                        <td>{formatDateTime(selectedUser.created_at) || 'Not available'}</td>
                      </tr>
                      <tr>
                        <td><strong>Last Login:</strong></td>
                        <td>{formatDateTime(selectedUser.last_login) || 'Not available'}</td>
                      </tr>
                      <tr>
                        <td><strong>Profile Updated:</strong></td>
                        <td>{formatDateTime(selectedUser.profile_updated) || 'Not available'}</td>
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
              
              {/* Groups Section */}
              <Row className="mt-4">
                <Col>
                  <h5>
                    <FontAwesomeIcon icon={faUsersCog} className="me-2" />
                    Group Membership
                  </h5>
                  <Card>
                    <Card.Body>
                      <GroupsBadges userId={selectedUser.user_id || selectedUser.id} compact={false} />
                    </Card.Body>
                  </Card>
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
            Are you sure you want to change the status of user <strong>{statusUpdate.user?.character_name}</strong> to <strong>{getStatusInfo(statusUpdate.status).label}</strong>?
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
            Edit User - {editingUser?.character_name}
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
              <option value="validate">Validate Users</option>
              <option value="invalidate">Invalidate Users</option>
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

      {/* Delete User Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
            Delete User Character
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <Alert variant="danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>Warning!</strong> This action cannot be undone.
              </Alert>
              <p>
                Are you sure you want to delete the user character <strong>{userToDelete.character_name}</strong>?
              </p>
              <p className="text-muted">
                This will permanently remove the user account and all associated data.
                Super administrators cannot be deleted.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete User
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersAdmin;
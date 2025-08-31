import React, { useState, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip,
  Tabs, Tab, Placeholder 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faUsers, faSearch, faFilter,
  faCheck, faTimes, faKey, faGlobe, faLock, faExclamationTriangle,
  faCheckCircle, faTimesCircle, faInfoCircle, faUserPlus, faUserMinus
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import {
  useGroups,
  useGroup,
  useGroupMembers,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useGroupsHealth,
  useCharacterSearch,
  useGroupMemberCounts
} from 'hooks/useGroups';

import GroupPermissions from 'components/admin/GroupPermissions.jsx';

const GroupsAdmin = () => {
  const [filters, setFilters] = useState({
    type: '',
    page: 1,
    limit: 20
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [characterSearchTerm, setCharacterSearchTerm] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showAddMemberConfirm, setShowAddMemberConfirm] = useState(false);
  const [characterToAdd, setCharacterToAdd] = useState(null);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsGroup, setPermissionsGroup] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom',
    is_active: true
  });

  const { data: groupsData, isLoading, error, refetch } = useGroups(filters);
  const { data: healthData, isLoading: healthLoading } = useGroupsHealth();
  const { data: selectedGroupMembers, isLoading: membersLoading } = useGroupMembers(selectedGroup?.id);
  const { data: characterSearchResults, isLoading: charactersLoading } = useCharacterSearch(characterSearchTerm);
  
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();
  const addMemberMutation = useAddGroupMember();
  const removeMemberMutation = useRemoveGroupMember();

  const groups = groupsData?.groups || [];
  const totalPages = groupsData?.total_pages || 1;

  const groupTypes = [
    { value: 'system', label: 'System', color: 'danger' },
    { value: 'corporation', label: 'Corporation', color: 'primary' },
    { value: 'alliance', label: 'Alliance', color: 'success' },
    { value: 'custom', label: 'Custom', color: 'info' }
  ];

  const getTypeColor = (type) => {
    const typeInfo = groupTypes.find(t => t.value === type);
    return typeInfo?.color || 'secondary';
  };

  const displayedGroups = useMemo(() => {
    if (!searchTerm) return groups;
    
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  // Get member counts for all displayed groups
  const displayedGroupIds = useMemo(() => {
    return displayedGroups.map(group => group.id);
  }, [displayedGroups]);
  const { data: memberCounts, isLoading: memberCountsLoading } = useGroupMemberCounts(displayedGroupIds);

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
        type: group.type,
        is_active: group.is_active
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        type: 'custom',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      type: 'custom',
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.name.length < 3 || formData.name.length > 100) {
      toast.error('Group name must be between 3 and 100 characters');
      return;
    }

    try {
      if (editingGroup) {
        await updateMutation.mutateAsync({ 
          id: editingGroup.id, 
          data: formData 
        });
      } else {
        // For creating groups, only send fields that backend expects
        const createData = {
          name: formData.name,
          description: formData.description,
          type: formData.type
        };
        await createMutation.mutateAsync(createData);
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      // Failed to save group
    }
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(groupToDelete.id);
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
      refetch();
    } catch (err) {
      toast.error(`Delete failed: ${err.response?.error || err.message || 'Unknown error'}`);
    }
  };

  const handleOpenMembersModal = (group) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const handleCloseMembersModal = () => {
    setShowMembersModal(false);
    setSelectedGroup(null);
    setCharacterSearchTerm('');
    setSelectedCharacter(null);
    setShowAddMemberConfirm(false);
    setCharacterToAdd(null);
    setShowRemoveMemberConfirm(false);
    setMemberToRemove(null);
    setShowPermissionsModal(false);
    setPermissionsGroup(null);
  };

  const handleConfirmAddMember = async () => {
    if (!characterToAdd || !selectedGroup) return;

    try {
      await addMemberMutation.mutateAsync({
        groupId: selectedGroup.id,
        characterId: characterToAdd.character_id
      });
      setShowAddMemberConfirm(false);
      setCharacterToAdd(null);
      setCharacterSearchTerm('');
      toast.success(`${characterToAdd.name} added to group successfully!`);
    } catch (err) {
      setShowAddMemberConfirm(false);
      setCharacterToAdd(null);
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove || !selectedGroup) return;

    try {
      await removeMemberMutation.mutateAsync({
        groupId: selectedGroup.id,
        characterId: memberToRemove.character_id
      });
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);
      toast.success(`${memberToRemove.character_name || memberToRemove.name} removed from group successfully!`);
    } catch (err) {
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);
    }
  };

  const handleOpenPermissionsModal = (group) => {
    setPermissionsGroup(group);
    setShowPermissionsModal(true);
  };

  const handleClosePermissionsModal = () => {
    setShowPermissionsModal(false);
    setPermissionsGroup(null);
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load groups: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Groups Management</h1>
              <p className="text-muted mb-0">
                Manage user groups, permissions, and member assignments
              </p>
            </div>
            {healthData && (
              <div className="text-end">
                <Badge 
                  bg={healthData.status === 'healthy' ? 'success' : 'warning'} 
                  className="mb-1"
                >
                  System: {healthData.status}
                </Badge>
                {healthData.last_check && (
                  <div className="small text-muted">
                    Last check: {new Date(healthData.last_check).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-3">
        <Col lg={4}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
            {searchTerm && (
              <Button 
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col lg={3}>
          <Form.Select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            {groupTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col lg={3}>
          <div className="text-500 small align-self-center">
            Showing {displayedGroups.length} of {groupsData?.total || 0} groups
          </div>
        </Col>
        <Col lg={2} className="text-end">
          <Button
            variant="primary"
            onClick={() => handleOpenModal()}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Group
          </Button>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="g-3 mb-3">
        <Col md={3}>
          <Card className="h-md-100">
            <Card.Body>
              {isLoading ? (
                <div className="d-flex align-items-center">
                  <Placeholder style={{ width: '48px', height: '48px' }} />
                  <div className="ms-3">
                    <Placeholder as="h6" className="mb-1" style={{ width: '80px' }} />
                    <Placeholder as="h4" className="mb-0" style={{ width: '40px' }} />
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary me-3" />
                  <div>
                    <h6 className="mb-0 text-500">Total Groups</h6>
                    <h2 className="fw-normal text-700 mb-0">{groupsData?.total || 0}</h2>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        {groupTypes.map(type => (
          <Col md={2} key={type.value}>
            <Card className="h-md-100">
              <Card.Body>
                {isLoading ? (
                  <div className="d-flex align-items-center">
                    <Placeholder style={{ width: '32px', height: '32px' }} />
                    <div className="ms-2">
                      <Placeholder as="h6" className="mb-0" style={{ width: '60px' }} />
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <Badge bg={type.color} className="fs-6 me-2">
                      {groups.filter(g => g.type === type.value).length}
                    </Badge>
                    <div>
                      <h6 className="mb-0 text-700">{type.label}</h6>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Groups Table */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Groups Directory</h6>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div>
                  {/* Table Header Skeleton */}
                  <div className="px-3 py-2 bg-light border-bottom">
                    <Row>
                      <Col md={2}><Placeholder style={{ width: '60px' }} /></Col>
                      <Col md={3}><Placeholder style={{ width: '80px' }} /></Col>
                      <Col md={1}><Placeholder style={{ width: '40px' }} /></Col>
                      <Col md={2}><Placeholder style={{ width: '50px' }} /></Col>
                      <Col md={1}><Placeholder style={{ width: '60px' }} /></Col>
                      <Col md={1}><Placeholder style={{ width: '70px' }} /></Col>
                      <Col md={2}><Placeholder style={{ width: '80px' }} /></Col>
                    </Row>
                  </div>
                  {/* Table Body Skeleton */}
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="px-3 py-3 border-bottom">
                      <Row className="align-items-center">
                        <Col md={2}>
                          <div className="d-flex align-items-center">
                            <Placeholder className="bg-secondary me-2" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            <Placeholder style={{ width: '120px' }} />
                          </div>
                        </Col>
                        <Col md={3}><Placeholder style={{ width: '180px' }} /></Col>
                        <Col md={1}><Placeholder className="bg-primary" style={{ width: '60px', height: '24px', borderRadius: '12px' }} /></Col>
                        <Col md={2}><Placeholder className="bg-success" style={{ width: '70px', height: '24px', borderRadius: '12px' }} /></Col>
                        <Col md={1}><Placeholder className="bg-info" style={{ width: '30px', height: '20px' }} /></Col>
                        <Col md={1}><Placeholder style={{ width: '80px' }} /></Col>
                        <Col md={2}>
                          <div className="d-flex gap-1">
                            <Placeholder className="bg-light" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                            <Placeholder className="bg-light" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                            <Placeholder className="bg-light" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              ) : displayedGroups.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  {searchTerm ? `No groups match your search for "${searchTerm}"` : 'No groups found'}
                </Alert>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Members</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedGroups.map((group) => (
                      <tr key={group.id}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faUsers} className="text-300 me-2" size="sm" />
                            <div>
                              <div className="fw-semi-bold">{group.name}</div>
                              <div className="fs-11 text-500">ID: {group.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {group.description || <span className="text-400">No description</span>}
                          </div>
                        </td>
                        <td className="align-middle">
                          <Badge bg={getTypeColor(group.type)}>
                            {group.type}
                          </Badge>
                        </td>
                        <td className="align-middle">
                          {group.is_active ? (
                            <Badge bg="success">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge bg="secondary">
                              <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faUsers} className="text-300 me-1" size="xs" />
                            <span className="fw-semi-bold">
                              {memberCountsLoading ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                memberCounts?.[group.id] ?? 0
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="align-middle">
                          <span className="text-500">
                            {group.created_at ? new Date(group.created_at).toLocaleDateString() : '-'}
                          </span>
                        </td>
                        <td className="align-middle">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>View Members</Tooltip>}
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleOpenMembersModal(group)}
                            >
                              <FontAwesomeIcon icon={faUsers} size="xs" />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Manage Permissions</Tooltip>}
                          >
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="me-1"
                              onClick={() => handleOpenPermissionsModal(group)}
                            >
                              <FontAwesomeIcon icon={faKey} size="xs" />
                            </Button>
                          </OverlayTrigger>
                          {group.type === 'custom' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Edit Group</Tooltip>}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleOpenModal(group)}
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </Button>
                            </OverlayTrigger>
                          )}
                          {group.type !== 'system' && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete Group</Tooltip>}
                            >
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setGroupToDelete(group);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} size="xs" />
                              </Button>
                            </OverlayTrigger>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
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
          </Card>
        </Col>
      </Row>

      {/* Create/Edit Group Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                minLength={3}
                maxLength={100}
                placeholder="Enter group name"
              />
              <Form.Text className="text-muted">
                Group name (3-100 characters)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter group description"
              />
            </Form.Group>

            {editingGroup && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="is-active-switch"
                  label={formData.is_active ? "Active" : "Inactive"}
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <Form.Text className="text-muted">
                  {formData.is_active ? 
                    "Group is currently active and visible to users" : 
                    "Group is inactive and hidden from users"
                  }
                </Form.Text>
              </Form.Group>
            )}

            {!editingGroup && (
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="custom">Custom</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Only custom groups can be created manually
                </Form.Text>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  {editingGroup ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Are you sure you want to delete the group <strong>{groupToDelete?.name}</strong>?
            This action cannot be undone.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Group Members Modal */}
      <Modal show={showMembersModal} onHide={handleCloseMembersModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Group Members - {selectedGroup?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Add Member Form */}
          <div className="mb-4">
            <Row>
              <Col md={12}>
                <Form.Control
                  type="text"
                  placeholder="Search character name (min 3 characters) - click to add to group"
                  value={characterSearchTerm}
                  onChange={(e) => {
                    setCharacterSearchTerm(e.target.value);
                  }}
                />
                {characterSearchTerm.length >= 3 && (
                  <div className="mt-2">
                    {charactersLoading ? (
                      <div className="text-center py-2">
                        <Spinner size="sm" animation="border" />
                        <span className="ms-2">Searching...</span>
                      </div>
                    ) : characterSearchResults?.characters?.length > 0 ? (
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '0.375rem' }}>
                        {characterSearchResults.characters.map((character) => (
                          <div
                            key={character.character_id}
                            className="p-2 border-bottom cursor-pointer hover-bg-light"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setCharacterToAdd(character);
                              setShowAddMemberConfirm(true);
                            }}
                          >
                            <div className="fw-bold">{character.name}</div>
                            <div className="small text-muted">ID: {character.character_id} - Click to add to group</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert variant="info" className="py-2">
                        No characters found matching "{characterSearchTerm}"
                      </Alert>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* Members List */}
          {membersLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading members...</span>
              </Spinner>
            </div>
          ) : selectedGroupMembers?.members?.length === 0 ? (
            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              No members in this group
            </Alert>
          ) : (
            <Table hover responsive size="sm">
              <thead>
                <tr>
                  <th>Character Name</th>
                  <th>Character ID</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroupMembers?.members?.map((member) => (
                  <tr key={member.character_id}>
                    <td>{member.character_name || '-'}</td>
                    <td>{member.character_id}</td>
                    <td>{member.added_at ? new Date(member.added_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setMemberToRemove(member);
                          setShowRemoveMemberConfirm(true);
                        }}
                        disabled={removeMemberMutation.isPending}
                      >
                        <FontAwesomeIcon icon={faUserMinus} size="xs" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMembersModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Member Confirmation Modal */}
      <Modal show={showAddMemberConfirm} onHide={() => setShowAddMemberConfirm(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Confirm Add Member
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FontAwesomeIcon icon={faUsers} size="3x" className="text-primary mb-3" />
            <h5>Add Character to Group?</h5>
            {characterToAdd && selectedGroup && (
              <>
                <p className="mb-2">
                  <strong>Character:</strong> {characterToAdd.name}
                  <br />
                  <small className="text-muted">ID: {characterToAdd.character_id}</small>
                </p>
                <p className="mb-3">
                  <strong>Group:</strong> {selectedGroup.name}
                </p>
              </>
            )}
            <p className="small text-muted">
              This character will be added to the group with full member privileges.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="secondary" 
            onClick={() => setShowAddMemberConfirm(false)}
            disabled={addMemberMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmAddMember}
            disabled={addMemberMutation.isPending}
          >
            {addMemberMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Adding...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                Add Member
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal show={showRemoveMemberConfirm} onHide={() => setShowRemoveMemberConfirm(false)} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserMinus} className="me-2 text-danger" />
            Confirm Remove Member
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-warning mb-3" />
            <h5>Remove Character from Group?</h5>
            {memberToRemove && selectedGroup && (
              <>
                <p className="mb-2">
                  <strong>Character:</strong> {memberToRemove.character_name || memberToRemove.name}
                  <br />
                  <small className="text-muted">ID: {memberToRemove.character_id}</small>
                </p>
                <p className="mb-3">
                  <strong>Group:</strong> {selectedGroup.name}
                </p>
              </>
            )}
            <p className="small text-muted">
              This character will be removed from the group and will lose all associated privileges.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button 
            variant="secondary" 
            onClick={() => setShowRemoveMemberConfirm(false)}
            disabled={removeMemberMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmRemoveMember}
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Removing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserMinus} className="me-2" />
                Remove Member
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Group Permissions Modal */}
      <Modal show={showPermissionsModal} onHide={handleClosePermissionsModal} size="xl">
        <Modal.Body className="p-0">
          {permissionsGroup && (
            <GroupPermissions 
              group={permissionsGroup} 
              onClose={handleClosePermissionsModal}
            />
          )}
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default GroupsAdmin;
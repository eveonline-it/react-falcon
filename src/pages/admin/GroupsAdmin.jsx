import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip,
  Tabs, Tab 
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
  useGroupsHealth
} from 'hooks/useGroups';

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
  const [newMemberCharacterId, setNewMemberCharacterId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom'
  });

  const { data: groupsData, isLoading, error, refetch } = useGroups(filters);
  const { data: healthData, isLoading: healthLoading } = useGroupsHealth();
  const { data: selectedGroupMembers, isLoading: membersLoading } = useGroupMembers(selectedGroup?.id);
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

  const handleSearch = () => {
    const filtered = groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  };

  const displayedGroups = searchTerm ? handleSearch() : groups;

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
        type: group.type
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        type: 'custom'
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
      type: 'custom'
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
        await createMutation.mutateAsync(formData);
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      console.error('Failed to save group:', err);
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
      console.error('Failed to delete group:', err);
    }
  };

  const handleOpenMembersModal = (group) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const handleCloseMembersModal = () => {
    setShowMembersModal(false);
    setSelectedGroup(null);
    setNewMemberCharacterId('');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberCharacterId || !selectedGroup) return;

    try {
      await addMemberMutation.mutateAsync({
        groupId: selectedGroup.id,
        characterId: parseInt(newMemberCharacterId)
      });
      setNewMemberCharacterId('');
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleRemoveMember = async (characterId) => {
    if (!selectedGroup) return;

    try {
      await removeMemberMutation.mutateAsync({
        groupId: selectedGroup.id,
        characterId
      });
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
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
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Groups Management</h1>
            <Button 
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Group
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters Row */}
      <Row className="mb-4">
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
          </InputGroup>
        </Col>
        <Col lg={8} className="text-end">
          <Form.Select 
            size="sm" 
            className="d-inline-block w-auto me-2"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            {groupTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary me-3" />
                <div>
                  <h6 className="mb-0">Total Groups</h6>
                  <h4 className="mb-0">{groupsData?.total || 0}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        {groupTypes.map(type => (
          <Col md={2} key={type.value}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <Badge bg={type.color} className="me-2 fs-6">
                    {groups.filter(g => g.type === type.value).length}
                  </Badge>
                  <div>
                    <h6 className="mb-0">{type.label}</h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Groups Table */}
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
              ) : displayedGroups.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No groups found
                </Alert>
              ) : (
                <Table hover responsive size="sm" className="small">
                  <thead>
                    <tr>
                      <th className="py-2 align-middle">Name</th>
                      <th className="py-2 align-middle">Description</th>
                      <th className="py-2 align-middle">Type</th>
                      <th className="py-2 align-middle">Status</th>
                      <th className="py-2 align-middle">Created</th>
                      <th className="py-2 align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedGroups.map((group) => (
                      <tr key={group.id}>
                        <td className="py-2 align-middle">
                          <div className="fw-bold">
                            <FontAwesomeIcon icon={faUsers} className="me-1 text-muted" size="xs" />
                            {group.name}
                          </div>
                        </td>
                        <td className="py-2 align-middle">
                          <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                            {group.description || '-'}
                          </span>
                        </td>
                        <td className="py-2 align-middle">
                          <Badge bg={getTypeColor(group.type)} className="small">
                            {group.type}
                          </Badge>
                        </td>
                        <td className="py-2 align-middle">
                          {group.active ? (
                            <Badge bg="success" className="small">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" size="xs" />
                              Active
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="small">
                              <FontAwesomeIcon icon={faTimesCircle} className="me-1" size="xs" />
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 align-middle">
                          {group.created_at ? new Date(group.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 align-middle">
                          <Button
                            variant="outline-info"
                            className="me-1 btn-xs"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleOpenMembersModal(group)}
                          >
                            <FontAwesomeIcon icon={faUsers} size="xs" />
                          </Button>
                          {group.type === 'custom' && (
                            <>
                              <Button
                                variant="outline-primary"
                                className="me-1 btn-xs"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => handleOpenModal(group)}
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </Button>
                              <Button
                                variant="outline-danger"
                                className="btn-xs"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                onClick={() => {
                                  setGroupToDelete(group);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} size="xs" />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
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
          <Form onSubmit={handleAddMember} className="mb-4">
            <Row>
              <Col md={8}>
                <Form.Control
                  type="number"
                  placeholder="Enter Character ID"
                  value={newMemberCharacterId}
                  onChange={(e) => setNewMemberCharacterId(e.target.value)}
                  required
                />
              </Col>
              <Col md={4}>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={addMemberMutation.isPending}
                  className="w-100"
                >
                  {addMemberMutation.isPending ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                      Add Member
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Form>

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
                  <th>Character ID</th>
                  <th>Character Name</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroupMembers?.members?.map((member) => (
                  <tr key={member.character_id}>
                    <td>{member.character_id}</td>
                    <td>{member.character_name || '-'}</td>
                    <td>{member.added_at ? new Date(member.added_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveMember(member.character_id)}
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
    </Container>
  );
};

export default GroupsAdmin;
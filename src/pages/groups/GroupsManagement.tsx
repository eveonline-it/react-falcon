import React, { useState } from 'react';
import { Card, Col, Row, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faUsers, faKey } from '@fortawesome/free-solid-svg-icons';
import { useGroups, usePermissions, useCreatePermissionAssignment, useDeletePermissionAssignment } from 'hooks/auth/useGroups';

// Type definitions for Groups Management
interface Group {
  id?: string;
  subjectID?: string;
  name?: string;
  subjectName?: string;
  memberCount?: number;
}

interface PermissionAssignment {
  id?: string;
  assignmentID?: string;
  subjectType?: string;
  subjectId?: string;
  subjectID?: string;
  subjectName?: string;
  permission?: string;
  service?: string;
  resource?: string;
  resourceID?: string;
  reason?: string;
  grantedAt?: string;
  createdAt?: string;
  expiresAt?: string;
}

interface GroupsResponse {
  subjects?: Group[];
  data?: Group[];
  count?: number;
  total?: number;
}

interface PermissionsResponse {
  assignments?: PermissionAssignment[];
  data?: PermissionAssignment[];
}

type SubjectType = 'group' | 'user';
type PermissionAction = 'read' | 'write' | 'delete' | 'admin';

interface PermissionFormData {
  subjectType: SubjectType;
  subjectId: string;
  permission: PermissionAction | '';
  service: string;
  resource: string;
  reason: string;
  expiresAt: string;
}

const GroupsManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<PermissionAssignment | null>(null);
  const [formData, setFormData] = useState<PermissionFormData>({
    subjectType: 'group' as SubjectType,
    subjectId: '',
    permission: '' as PermissionAction | '',
    service: 'default',
    resource: '',
    reason: '',
    expiresAt: ''
  });

  const { data: groupsData, isLoading: groupsLoading } = useGroups();
  // Handle different possible response structures from the API
  const groups: Group[] = (groupsData as GroupsResponse)?.subjects || 
                          (groupsData as GroupsResponse)?.data || 
                          (groupsData as Group[]) || [];
  const groupsCount: number = (groupsData as GroupsResponse)?.count || 
                              (groupsData as GroupsResponse)?.total || 
                              groups.length;
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();
  // Handle different possible response structures for permissions
  const permissions: PermissionAssignment[] = Array.isArray(permissionsData) 
    ? permissionsData as PermissionAssignment[]
    : ((permissionsData as PermissionsResponse)?.assignments || 
       (permissionsData as PermissionsResponse)?.data || []);
  const createMutation = useCreatePermissionAssignment();
  const deleteMutation = useDeletePermissionAssignment();

  const handleCreateAssignment = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowCreateModal(false);
        setFormData({
          subjectType: 'group' as SubjectType,
          subjectId: '',
          permission: '' as PermissionAction | '',
          service: 'default',
          resource: '',
          reason: '',
          expiresAt: ''
        });
      }
    });
  };

  const handleDeleteAssignment = () => {
    if (selectedAssignment) {
      const assignmentId: string = selectedAssignment.assignmentID || selectedAssignment.id || '';
      deleteMutation.mutate(assignmentId, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setSelectedAssignment(null);
        }
      });
    }
  };

  const openDeleteModal = (assignment: PermissionAssignment) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  return (
    <>
      <Row className="g-3 mb-3">
        <Col>
          <h2 className="mb-2">Groups Management</h2>
          <p className="text-muted mb-0">Manage group permissions and assignments</p>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            disabled={groupsLoading}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Permission
          </Button>
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={4}>
          <Card>
            <Card.Header className="bg-body-tertiary">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Available Groups
              </h5>
            </Card.Header>
            <Card.Body>
              {groupsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : groups.length > 0 ? (
                <div className="d-grid gap-2">
                  <div className="text-muted small mb-2">
                    Total Groups: {groupsCount}
                  </div>
                  {groups.map((group: Group) => (
                    <div
                      key={group.subjectID || group.id}
                      className="p-3 border rounded d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{group.subjectName || group.name}</h6>
                        <p className="text-muted mb-0 fs-10">
                          ID: {group.subjectID || group.id}
                        </p>
                      </div>
                      <Badge bg="secondary">Group</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mb-0">
                  No groups available. Contact your administrator to create groups.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faKey} className="me-2" />
                Permission Assignments
              </h5>
            </Card.Header>
            <Card.Body>
              {permissionsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Permission</th>
                      <th>Resource</th>
                      <th>Granted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.length > 0 ? (
                      permissions.map((assignment: PermissionAssignment) => (
                        <tr key={assignment.assignmentID || assignment.id}>
                          <td>
                            <Badge bg="primary" className="me-2">
                              {assignment.subjectType || 'Unknown'}
                            </Badge>
                            {assignment.subjectName || assignment.subjectID || assignment.subjectId || 'N/A'}
                          </td>
                          <td>
                            <code>{assignment.permission || 'N/A'}</code>
                          </td>
                          <td>
                            {assignment.resource ? (
                              <span>
                                {assignment.resource}
                                {assignment.resourceID && (
                                  <small className="text-muted d-block">
                                    ID: {assignment.resourceID}
                                  </small>
                                )}
                              </span>
                            ) : (
                              <span className="text-muted">All Resources</span>
                            )}
                          </td>
                          <td>
                            {assignment.grantedAt ? 
                              new Date(assignment.grantedAt).toLocaleDateString() : 
                              assignment.createdAt ?
                              new Date(assignment.createdAt).toLocaleDateString() :
                              'Unknown'
                            }
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(assignment)}
                              disabled={deleteMutation.isPending}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-3">
                          <Alert variant="info" className="mb-0">
                            No permission assignments found. Add permissions using the button above.
                          </Alert>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Permission Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Permission Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Type</Form.Label>
                  <Form.Select
                    value={formData.subjectType}
                    onChange={(e) => setFormData({ ...formData, subjectType: e.target.value as SubjectType })}
                  >
                    <option value="group">Group</option>
                    <option value="user">User</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {formData.subjectType === 'group' ? 'Select Group' : 'Subject ID'}
                  </Form.Label>
                  {formData.subjectType === 'group' && groups.length > 0 ? (
                    <Form.Select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    >
                      <option value="">Select a group...</option>
                      {groups.map((group: Group) => (
                        <option key={group.subjectID} value={group.subjectID || group.id}>
                          {group.subjectName || group.name} ({group.subjectID || group.id})
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Form.Control
                      type="text"
                      value={formData.subjectId}
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      placeholder={formData.subjectType === 'group' ? "No groups available" : "Enter user ID"}
                      disabled={formData.subjectType === 'group' && groups.length === 0}
                    />
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Service</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    placeholder="e.g., falcon, auth, admin"
                  />
                  <Form.Text className="text-muted">
                    Service name (required)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Action</Form.Label>
                  <Form.Select
                    value={formData.permission}
                    onChange={(e) => setFormData({ ...formData, permission: e.target.value as PermissionAction })}
                  >
                    <option value="">Select action...</option>
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                    <option value="delete">Delete</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Resource</Form.Label>
              <Form.Control
                type="text"
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                placeholder="e.g., dashboard, user, report"
              />
              <Form.Text className="text-muted">
                Resource type (required)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for granting this permission"
              />
              <Form.Text className="text-muted">
                Explanation for this permission assignment (required)
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Expires At (Optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <Form.Text className="text-muted">
                Leave empty for permanent permission
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateAssignment}
            disabled={createMutation.isPending || !formData.subjectId || !formData.permission || !formData.service || !formData.resource || !formData.reason}
          >
            {createMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Creating...
              </>
            ) : (
              'Create Assignment'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this permission assignment? This action cannot be undone.
          {selectedAssignment && (
            <div className="mt-3 p-3 bg-light rounded">
              <strong>Subject:</strong> {selectedAssignment.subjectName || selectedAssignment.subjectID || selectedAssignment.subjectId || 'N/A'}<br />
              <strong>Permission:</strong> {selectedAssignment.permission || 'N/A'}<br />
              <strong>Resource:</strong> {selectedAssignment.resource || 'All Resources'}
              {selectedAssignment.resourceID && (
                <><br /><strong>Resource ID:</strong> {selectedAssignment.resourceID}</>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAssignment}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GroupsManagement;
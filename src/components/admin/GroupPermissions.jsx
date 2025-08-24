import React, { useState } from 'react';
import { 
  Card, Button, Badge, Table, Alert, Spinner, Modal,
  Row, Col, Form, InputGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faKey, faPlus, faTrash, faSearch, faExclamationTriangle,
  faCheckCircle, faTimesCircle, faShield, faLock, faUnlock,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { 
  useGroupPermissions, 
  useGrantPermissionToGroup, 
  useRevokePermissionFromGroup 
} from 'hooks/useGroups';
import { usePermissions } from 'hooks/usePermissions';

const GroupPermissions = ({ group, onClose }) => {
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [permissionToRevoke, setPermissionToRevoke] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Hooks for group permissions
  const { data: groupPermissions, isLoading: permissionsLoading, error: permissionsError } = useGroupPermissions(group?.id);
  const grantMutation = useGrantPermissionToGroup();
  const revokeMutation = useRevokePermissionFromGroup();

  // Hooks for available permissions (for granting)
  const { data: availablePermissions, isLoading: availableLoading } = usePermissions({
    page: 1,
    limit: 1000 // Get all permissions for selection
  });

  const permissions = groupPermissions?.permissions || [];
  const availablePerms = availablePermissions?.permissions || [];

  // Debug logging to help identify data structure issues
  React.useEffect(() => {
    if (groupPermissions && availablePermissions) {
      console.log('Group permissions data:', {
        groupPermissions,
        firstPermission: permissions[0],
        availablePermissions,
        firstAvailable: availablePerms[0]
      });
    }
  }, [groupPermissions, availablePermissions]);

  // Get permissions not already granted to this group
  const unassignedPermissions = availablePerms.filter(
    perm => !permissions.find(gp => gp.permission_id === perm.id || gp.permission?.id === perm.id)
  );

  // Filter available permissions for the grant modal
  const filteredAvailable = unassignedPermissions.filter(perm => {
    const matchesSearch = !searchTerm || 
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.action?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = !serviceFilter || perm.service === serviceFilter;
    
    return matchesSearch && matchesService;
  });

  // Get unique services for filtering
  const availableServices = [...new Set(unassignedPermissions.map(p => p.service).filter(Boolean))];

  const getServiceColor = (service) => {
    const colors = {
      'auth': 'primary',
      'users': 'success', 
      'groups': 'info',
      'corporations': 'warning',
      'alliances': 'secondary',
      'scheduler': 'danger',
      'permissions': 'dark'
    };
    return colors[service] || 'light';
  };

  const handleGrantPermission = async () => {
    if (!selectedPermission || !group) return;

    try {
      await grantMutation.mutateAsync({
        groupId: group.id,
        permissionId: selectedPermission.id
      });
      setShowGrantModal(false);
      setSelectedPermission(null);
      setSearchTerm('');
      setServiceFilter('');
    } catch (err) {
      console.error('Failed to grant permission:', err);
    }
  };

  const handleRevokePermission = async () => {
    if (!permissionToRevoke || !group) return;

    try {
      await revokeMutation.mutateAsync({
        groupId: group.id,
        permissionId: permissionToRevoke.permission_id || permissionToRevoke.permission?.id || permissionToRevoke.id
      });
      setShowRevokeConfirm(false);
      setPermissionToRevoke(null);
    } catch (err) {
      console.error('Failed to revoke permission:', err);
    }
  };

  if (permissionsError) {
    return (
      <Alert variant="danger">
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        Failed to load group permissions: {permissionsError.message}
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faKey} className="me-2" />
              Group Permissions - {group?.name}
            </h5>
            <div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowGrantModal(true)}
                disabled={unassignedPermissions.length === 0}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Grant Permission
              </Button>
              {onClose && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="ms-2"
                  onClick={onClose}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {permissionsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading permissions...</span>
              </Spinner>
            </div>
          ) : permissions.length === 0 ? (
            <Alert variant="info">
              <FontAwesomeIcon icon={faLock} className="me-2" />
              This group has no permissions assigned.
            </Alert>
          ) : (
            <Table hover responsive size="sm">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Service</th>
                  <th>Resource</th>
                  <th>Action</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((groupPermission) => {
                  const permission = groupPermission.permission || groupPermission;
                  return (
                    <tr key={groupPermission.id}>
                      <td>
                        <div>
                          <div className="fw-bold">{permission.name}</div>
                          {permission.description && (
                            <small className="text-muted">{permission.description}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getServiceColor(permission.service)} className="small">
                          {permission.service}
                        </Badge>
                      </td>
                      <td>
                        <code className="small">{permission.resource || '-'}</code>
                      </td>
                      <td>
                        <code className="small">{permission.action || '-'}</code>
                      </td>
                      <td>
                        <Badge 
                          bg={permission.is_static ? 'secondary' : 'success'} 
                          className="small"
                        >
                          {permission.is_static ? 'Static' : 'Dynamic'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setPermissionToRevoke(groupPermission);
                            setShowRevokeConfirm(true);
                          }}
                          disabled={revokeMutation.isPending}
                        >
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Grant Permission Modal */}
      <Modal show={showGrantModal} onHide={() => setShowGrantModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Grant Permission to {group?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Search and Filter Controls */}
          <Row className="mb-3">
            <Col md={8}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search permissions by name, description, resource, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <FontAwesomeIcon icon={faSearch} />
                </Button>
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
              >
                <option value="">All Services</option>
                {availableServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {availableLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading available permissions...</span>
              </Spinner>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <Alert variant="info">
              {unassignedPermissions.length === 0 ? 
                "All available permissions have already been granted to this group." :
                "No permissions match your search criteria."
              }
            </Alert>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Table hover size="sm" className="cursor-pointer">
                <thead className="sticky-top bg-light">
                  <tr>
                    <th>Permission</th>
                    <th>Service</th>
                    <th>Resource</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvailable.map((permission) => (
                    <tr 
                      key={permission.id}
                      onClick={() => setSelectedPermission(permission)}
                      className={selectedPermission?.id === permission.id ? 'table-active' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div>
                          <div className="fw-bold">{permission.name}</div>
                          {permission.description && (
                            <small className="text-muted">{permission.description}</small>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getServiceColor(permission.service)} className="small">
                          {permission.service}
                        </Badge>
                      </td>
                      <td>
                        <code className="small">{permission.resource || '-'}</code>
                      </td>
                      <td>
                        <code className="small">{permission.action || '-'}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {selectedPermission && (
            <Alert variant="primary" className="mt-3">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Selected: <strong>{selectedPermission.name}</strong>
              {selectedPermission.description && (
                <div className="small mt-1">{selectedPermission.description}</div>
              )}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGrantModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGrantPermission}
            disabled={!selectedPermission || grantMutation.isPending}
          >
            {grantMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Granting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUnlock} className="me-2" />
                Grant Permission
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Revoke Permission Confirmation Modal */}
      <Modal show={showRevokeConfirm} onHide={() => setShowRevokeConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
            Revoke Permission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Are you sure you want to revoke the permission <strong>{permissionToRevoke?.permission?.name || permissionToRevoke?.name}</strong> from group <strong>{group?.name}</strong>?
            <div className="mt-2 small">
              This will remove the permission from all members of this group.
            </div>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRevokeConfirm(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRevokePermission}
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Revoking...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faLock} className="me-2" />
                Revoke Permission
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GroupPermissions;
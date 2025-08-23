import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip,
  Tabs, Tab 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, faSearch, faFilter, faCheck, faTimes, faKey, 
  faLock, faCheckCircle, faTimesCircle, faInfoCircle, faExclamationTriangle,
  faCode, faServer, faUser, faEye, faUserCheck
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import {
  usePermissions,
  usePermission,
  useCheckPermission,
  usePermissionCheck,
  usePermissionsHealth
} from 'hooks/usePermissions';

const PermissionsAdmin = () => {
  const [filters, setFilters] = useState({
    service: '',
    category: '',
    static: '',
    page: 1,
    limit: 20
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [checkCharacterId, setCheckCharacterId] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: permissionsData, isLoading, error, refetch } = usePermissions(filters);
  const { data: healthData, isLoading: healthLoading } = usePermissionsHealth();
  const checkPermissionMutation = usePermissionCheck();

  const permissions = permissionsData?.permissions || [];
  const totalPages = permissionsData?.total_pages || 1;

  // Get unique services and categories for filter dropdowns
  const uniqueServices = [...new Set(permissions.map(p => p.service).filter(Boolean))];
  const uniqueCategories = [...new Set(permissions.map(p => p.category).filter(Boolean))];

  const handleSearch = () => {
    const filtered = permissions.filter(permission => 
      permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  };

  const displayedPermissions = searchTerm ? handleSearch() : permissions;

  const handleOpenCheckModal = (permission) => {
    setSelectedPermission(permission);
    setCheckCharacterId('');
    setShowCheckModal(true);
  };

  const handleCloseCheckModal = () => {
    setShowCheckModal(false);
    setSelectedPermission(null);
    setCheckCharacterId('');
  };

  const handleOpenDetailModal = (permission) => {
    setSelectedPermission(permission);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPermission(null);
  };

  const handleCheckPermission = async () => {
    if (!selectedPermission) return;

    try {
      await checkPermissionMutation.mutateAsync({
        permissionId: selectedPermission.id,
        characterId: checkCharacterId || undefined
      });
    } catch (err) {
      console.error('Failed to check permission:', err);
    }
  };

  const getPermissionTypeColor = (isStatic) => {
    return isStatic ? 'warning' : 'info';
  };

  const getServiceColor = (service) => {
    const colors = {
      'auth': 'primary',
      'users': 'success',
      'groups': 'info',
      'scheduler': 'warning',
      'permissions': 'danger',
      'settings': 'secondary'
    };
    return colors[service] || 'secondary';
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load permissions: {error.message}
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
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
              Permissions Management
            </h1>
            <div>
              {healthData && (
                <Badge bg={healthData.status === 'healthy' ? 'success' : 'warning'} className="me-2">
                  {healthData.status === 'healthy' ? 'System Healthy' : 'System Issues'}
                </Badge>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters Row */}
      <Row className="mb-4">
        <Col lg={4}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary">
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </InputGroup>
        </Col>
        <Col lg={8} className="d-flex gap-2 justify-content-end">
          <Form.Select 
            size="sm" 
            className="w-auto"
            value={filters.service}
            onChange={(e) => setFilters({...filters, service: e.target.value, page: 1})}
          >
            <option value="">All Services</option>
            {uniqueServices.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </Form.Select>
          
          <Form.Select 
            size="sm" 
            className="w-auto"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>

          <Form.Select 
            size="sm" 
            className="w-auto"
            value={filters.static}
            onChange={(e) => setFilters({...filters, static: e.target.value, page: 1})}
          >
            <option value="">All Types</option>
            <option value="true">Static</option>
            <option value="false">Dynamic</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faShieldAlt} size="2x" className="text-primary me-3" />
                <div>
                  <h6 className="mb-0">Total Permissions</h6>
                  <h4 className="mb-0">{permissionsData?.total || 0}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faLock} size="2x" className="text-warning me-3" />
                <div>
                  <h6 className="mb-0">Static Permissions</h6>
                  <h4 className="mb-0">{permissions.filter(p => p.is_static).length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCode} size="2x" className="text-info me-3" />
                <div>
                  <h6 className="mb-0">Dynamic Permissions</h6>
                  <h4 className="mb-0">{permissions.filter(p => !p.is_static).length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faServer} size="2x" className="text-success me-3" />
                <div>
                  <h6 className="mb-0">Services</h6>
                  <h4 className="mb-0">{uniqueServices.length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Permissions Table */}
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
              ) : displayedPermissions.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No permissions found
                </Alert>
              ) : (
                <Table hover responsive size="sm" className="small">
                  <thead>
                    <tr>
                      <th className="py-2 align-middle">Name</th>
                      <th className="py-2 align-middle">Service</th>
                      <th className="py-2 align-middle">Resource/Action</th>
                      <th className="py-2 align-middle">Category</th>
                      <th className="py-2 align-middle">Type</th>
                      <th className="py-2 align-middle">Created</th>
                      <th className="py-2 align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedPermissions.map((permission) => (
                      <tr key={permission.id}>
                        <td className="py-2 align-middle">
                          <div className="fw-bold">
                            <FontAwesomeIcon icon={faKey} className="me-1 text-muted" size="xs" />
                            {permission.name}
                          </div>
                          {permission.description && (
                            <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                              {permission.description}
                            </div>
                          )}
                        </td>
                        <td className="py-2 align-middle">
                          {permission.service && (
                            <Badge bg={getServiceColor(permission.service)} className="small">
                              {permission.service}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 align-middle">
                          <div className="small">
                            {permission.resource && (
                              <div><strong>Resource:</strong> {permission.resource}</div>
                            )}
                            {permission.action && (
                              <div><strong>Action:</strong> {permission.action}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 align-middle">
                          {permission.category && (
                            <Badge bg="secondary" className="small">
                              {permission.category}
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 align-middle">
                          <Badge bg={getPermissionTypeColor(permission.is_static)} className="small">
                            <FontAwesomeIcon 
                              icon={permission.is_static ? faLock : faCode} 
                              className="me-1" 
                              size="xs" 
                            />
                            {permission.is_static ? 'Static' : 'Dynamic'}
                          </Badge>
                        </td>
                        <td className="py-2 align-middle">
                          {permission.created_at ? new Date(permission.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 align-middle">
                          <Button
                            variant="outline-info"
                            className="me-1 btn-xs"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleOpenDetailModal(permission)}
                          >
                            <FontAwesomeIcon icon={faEye} size="xs" />
                          </Button>
                          <Button
                            variant="outline-primary"
                            className="btn-xs"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleOpenCheckModal(permission)}
                          >
                            <FontAwesomeIcon icon={faUserCheck} size="xs" />
                          </Button>
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

      {/* Permission Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
            Permission Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPermission && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>ID:</strong> {selectedPermission.id}
                </Col>
                <Col md={6}>
                  <strong>Type:</strong>{' '}
                  <Badge bg={getPermissionTypeColor(selectedPermission.is_static)}>
                    <FontAwesomeIcon 
                      icon={selectedPermission.is_static ? faLock : faCode} 
                      className="me-1" 
                    />
                    {selectedPermission.is_static ? 'Static' : 'Dynamic'}
                  </Badge>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Name:</strong> {selectedPermission.name}
                </Col>
                <Col md={6}>
                  <strong>Service:</strong>{' '}
                  {selectedPermission.service && (
                    <Badge bg={getServiceColor(selectedPermission.service)}>
                      {selectedPermission.service}
                    </Badge>
                  )}
                </Col>
              </Row>

              {selectedPermission.description && (
                <Row className="mb-3">
                  <Col md={12}>
                    <strong>Description:</strong> {selectedPermission.description}
                  </Col>
                </Row>
              )}

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Resource:</strong> {selectedPermission.resource || '-'}
                </Col>
                <Col md={6}>
                  <strong>Action:</strong> {selectedPermission.action || '-'}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Category:</strong>{' '}
                  {selectedPermission.category ? (
                    <Badge bg="secondary">{selectedPermission.category}</Badge>
                  ) : '-'}
                </Col>
                <Col md={6}>
                  <strong>Created:</strong>{' '}
                  {selectedPermission.created_at ? 
                    new Date(selectedPermission.created_at).toLocaleString() : 
                    '-'
                  }
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permission Check Modal */}
      <Modal show={showCheckModal} onHide={handleCloseCheckModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserCheck} className="me-2" />
            Check Permission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPermission && (
            <div>
              <Alert variant="info" className="mb-3">
                <strong>Permission:</strong> {selectedPermission.name}
                <br />
                <small>Leave character ID empty to check your own permission</small>
              </Alert>
              
              <Form.Group className="mb-3">
                <Form.Label>Character ID (Optional)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter character ID or leave empty for current user"
                  value={checkCharacterId}
                  onChange={(e) => setCheckCharacterId(e.target.value)}
                />
                <Form.Text className="text-muted">
                  If left empty, will check permission for your current character
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCheckModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCheckPermission}
            disabled={checkPermissionMutation.isPending}
          >
            {checkPermissionMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Checking...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Check Permission
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PermissionsAdmin;
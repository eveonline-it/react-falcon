import React, { useState } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faCog, faSearch, faFilter,
  faCheck, faTimes, faKey, faGlobe, faLock, faExclamationTriangle,
  faCheckCircle, faTimesCircle, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import {
  useSettings,
  useCreateSetting,
  useUpdateSetting,
  useDeleteSetting,
  useSettingsHealth
} from 'hooks/useSettings';

const SettingsAdmin = () => {
  const [filters, setFilters] = useState({
    category: '',
    is_public: undefined,
    is_active: undefined,
    page: 1,
    limit: 20
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'string',
    category: '',
    description: '',
    is_public: false
  });

  const { data: settingsData, isLoading, error, refetch } = useSettings(filters);
  const { data: healthData, isLoading: healthLoading } = useSettingsHealth();
  const createMutation = useCreateSetting();
  const updateMutation = useUpdateSetting();
  const deleteMutation = useDeleteSetting();

  const settings = settingsData?.settings || [];
  const totalPages = settingsData?.total_pages || 1;

  const categories = [...new Set(settings.map(s => s.category).filter(Boolean))];

  const handleSearch = () => {
    const filtered = settings.filter(setting => 
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  };

  const displayedSettings = searchTerm ? handleSearch() : settings;

  const handleOpenModal = (setting = null) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        key: setting.key,
        value: typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : String(setting.value),
        type: setting.type,
        category: setting.category || '',
        description: setting.description || '',
        is_public: setting.is_public
      });
    } else {
      setEditingSetting(null);
      setFormData({
        key: '',
        value: '',
        type: 'string',
        category: '',
        description: '',
        is_public: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSetting(null);
    setFormData({
      key: '',
      value: '',
      type: 'string',
      category: '',
      description: '',
      is_public: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let parsedValue = formData.value;
    
    try {
      if (formData.type === 'number') {
        parsedValue = Number(formData.value);
        if (isNaN(parsedValue)) {
          toast.error('Value must be a valid number');
          return;
        }
      } else if (formData.type === 'boolean') {
        parsedValue = formData.value === 'true' || formData.value === true;
      } else if (formData.type === 'object') {
        parsedValue = JSON.parse(formData.value);
      }
    } catch (err) {
      toast.error('Invalid JSON format for object type');
      return;
    }

    const data = {
      ...formData,
      value: parsedValue
    };

    try {
      if (editingSetting) {
        const updateData = {
          value: parsedValue,
          type: formData.type,
          category: formData.category || null,
          description: formData.description || null,
          is_public: formData.is_public,
          is_active: editingSetting.is_active
        };
        await updateMutation.mutateAsync({ key: editingSetting.key, data: updateData });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      console.error('Failed to save setting:', err);
    }
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(settingToDelete.key);
      setShowDeleteConfirm(false);
      setSettingToDelete(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete setting:', err);
    }
  };

  const toggleActive = async (setting) => {
    try {
      await updateMutation.mutateAsync({
        key: setting.key,
        data: {
          value: setting.value,
          is_active: !setting.is_active
        }
      });
      refetch();
    } catch (err) {
      console.error('Failed to toggle setting:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'string': return 'primary';
      case 'number': return 'success';
      case 'boolean': return 'info';
      case 'object': return 'warning';
      default: return 'secondary';
    }
  };

  const formatValue = (value, type) => {
    if (type === 'object' && typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (type === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  };

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load settings: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Site Settings Management</h1>
            <Button 
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Add Setting
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
              placeholder="Search settings..."
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
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Form.Select>
          
          <Form.Select 
            size="sm" 
            className="d-inline-block w-auto me-2"
            value={filters.is_public === undefined ? '' : filters.is_public.toString()}
            onChange={(e) => setFilters({...filters, is_public: e.target.value === '' ? undefined : e.target.value === 'true'})}
          >
            <option value="">All Visibility</option>
            <option value="true">Public</option>
            <option value="false">Private</option>
          </Form.Select>
          
          <Form.Select 
            size="sm" 
            className="d-inline-block w-auto me-2"
            value={filters.is_active === undefined ? '' : filters.is_active.toString()}
            onChange={(e) => setFilters({...filters, is_active: e.target.value === '' ? undefined : e.target.value === 'true'})}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCog} size="2x" className="text-primary me-3" />
                <div>
                  <h6 className="mb-0">Total Settings</h6>
                  <h4 className="mb-0">{settingsData?.total || 0}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCheck} size="2x" className="text-success me-3" />
                <div>
                  <h6 className="mb-0">Active</h6>
                  <h4 className="mb-0">{settings.filter(s => s.is_active).length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faGlobe} size="2x" className="text-info me-3" />
                <div>
                  <h6 className="mb-0">Public</h6>
                  <h4 className="mb-0">{settings.filter(s => s.is_public).length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faInfoCircle} size="2x" className="text-warning me-3" />
                <div>
                  <h6 className="mb-0">Categories</h6>
                  <h4 className="mb-0">{categories.length}</h4>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Settings Table */}
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
              ) : displayedSettings.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No settings found
                </Alert>
              ) : (
                <Table hover responsive size="sm" className="small">
                  <thead>
                    <tr>
                      <th className="py-2 align-middle">Key</th>
                      <th className="py-2 align-middle">Value</th>
                      <th className="py-2 align-middle">Type</th>
                      <th className="py-2 align-middle">Category</th>
                      <th className="py-2 align-middle">Visibility</th>
                      <th className="py-2 align-middle">Status</th>
                      <th className="py-2 align-middle">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSettings.map((setting) => (
                      <tr key={setting.key}>
                        <td className="py-2 align-middle">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {setting.description || 'No description'}
                              </Tooltip>
                            }
                          >
                            <span className="fw-bold">
                              <FontAwesomeIcon icon={faKey} className="me-1 text-muted" size="xs" />
                              {setting.key}
                            </span>
                          </OverlayTrigger>
                        </td>
                        <td className="py-2 align-middle">
                          <code className="text-truncate d-inline-block small" style={{ maxWidth: '180px' }}>
                            {formatValue(setting.value, setting.type)}
                          </code>
                        </td>
                        <td className="py-2 align-middle">
                          <Badge bg={getTypeColor(setting.type)} className="small">
                            {setting.type}
                          </Badge>
                        </td>
                        <td className="py-2 align-middle">{setting.category || '-'}</td>
                        <td className="py-2 align-middle">
                          {setting.is_public ? (
                            <Badge bg="success" className="small">
                              <FontAwesomeIcon icon={faGlobe} className="me-1" size="xs" />
                              Public
                            </Badge>
                          ) : (
                            <Badge bg="secondary" className="small">
                              <FontAwesomeIcon icon={faLock} className="me-1" size="xs" />
                              Private
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 align-middle text-center">
                          <Form.Check
                            type="switch"
                            size="sm"
                            checked={setting.is_active}
                            onChange={() => toggleActive(setting)}
                            className="small d-inline-flex"
                            style={{ minHeight: 'auto' }}
                          />
                          <div className="small text-muted mt-1">
                            {setting.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="py-2 align-middle">
                          <Button
                            variant="outline-primary"
                            className="me-1 btn-xs"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleOpenModal(setting)}
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            className="btn-xs"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSettingToDelete(setting);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingSetting ? 'Edit Setting' : 'Create New Setting'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Key</Form.Label>
              <Form.Control
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({...formData, key: e.target.value})}
                disabled={!!editingSetting}
                required
                maxLength={100}
                placeholder="e.g., app.name, feature.enabled"
              />
              <Form.Text className="text-muted">
                Unique identifier for the setting (1-100 characters)
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object (JSON)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    maxLength={50}
                    placeholder="e.g., general, features, api"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Value</Form.Label>
              {formData.type === 'boolean' ? (
                <Form.Select
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </Form.Select>
              ) : formData.type === 'object' ? (
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                  placeholder='{"key": "value"}'
                  style={{ fontFamily: 'monospace' }}
                />
              ) : (
                <Form.Control
                  type={formData.type === 'number' ? 'number' : 'text'}
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  required
                />
              )}
              {formData.type === 'object' && (
                <Form.Text className="text-muted">
                  Enter valid JSON format
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                maxLength={500}
                placeholder="Brief description of what this setting controls"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Public (accessible without authentication)"
                checked={formData.is_public}
                onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
              />
            </Form.Group>
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
                  {editingSetting ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Are you sure you want to delete the setting <strong>{settingToDelete?.key}</strong>?
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
    </Container>
  );
};

export default SettingsAdmin;
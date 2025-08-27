import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Badge,
  ButtonGroup,
  Spinner
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SitemapRoute } from '../../hooks/admin/useSitemap';

interface ParentOption {
  id: string;
  name: string;
  path?: string;
  is_folder: boolean;
  parent_id: string | null;
  depth: number;
}

const ROUTE_GROUPS = [
  'Administration',
  'Alliance', 
  'Corporation',
  'Documentation',
  'Economy',
  'Personal',
  'Utilities'
];

const ROUTE_TYPES = [
  'public',
  'auth', 
  'protected',
  'admin',
  'folder'
];

const NAV_POSITIONS = [
  'main',
  'user',
  'admin', 
  'footer',
  'hidden'
];

const BADGE_TYPES = [
  'success',
  'warning', 
  'danger',
  'info',
  'primary',
  'secondary'
];

const ICON_OPTIONS = [
  'chart-pie', 'user', 'users', 'cog', 'shield-alt', 'clock',
  'chart-line', 'file-alt', 'table', 'globe', 'flag', 'lock',
  'tags', 'question-circle', 'exclamation-triangle', 'thumbtack',
  'columns', 'shapes', 'map', 'puzzle-piece', 'fire', 'rocket',
  'wrench', 'palette', 'code-branch', 'sign-out-alt', 'vial',
  'folder', 'folder-open', 'archive', 'layer-group', 'sitemap'
];

interface RouteFormData extends Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at' | 'depth' | 'children_count' | 'folder_path' | 'is_expanded'> {}

interface RouteEditModalProps {
  show: boolean;
  onHide: () => void;
  route?: SitemapRoute | null;
  onSave: (data: RouteFormData) => void;
  preselectedParentId?: string | null;
  parentOptions?: ParentOption[];
  parentOptionsLoading?: boolean;
}

const RouteEditModal: React.FC<RouteEditModalProps> = ({ 
  show, 
  onHide, 
  route, 
  onSave,
  preselectedParentId = null,
  parentOptions = [],
  parentOptionsLoading = false
}) => {
  const [formData, setFormData] = useState<RouteFormData>({
    route_id: '',
    path: '',
    component: '',
    name: '',
    title: '',
    icon: null,
    type: 'auth',
    parent_id: preselectedParentId,
    is_folder: false,
    nav_position: 'main',
    nav_order: 0,
    show_in_nav: true,
    required_permissions: null,
    required_groups: null,
    description: null,
    keywords: null,
    group: 'Utilities',
    feature_flags: null,
    is_enabled: true,
    props: {},
    lazy_load: true,
    exact: false,
    newtab: false,
    badge_text: '',
    badge_type: null
  });

  const [itemType, setItemType] = useState<'route' | 'folder'>('route');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation function following OpenAPI schema
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!formData.route_id.trim()) {
      errors.route_id = 'Route ID is required';
    } else if (formData.route_id.length > 100) {
      errors.route_id = 'Route ID must be 100 characters or less';
    }

    if (!formData.name.trim()) {
      errors.name = 'Display name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Display name must be 100 characters or less';
    }

    // Route-specific validations
    if (itemType === 'route') {
      if (!formData.path.trim()) {
        errors.path = 'Path is required for routes';
      } else if (formData.path.length > 200) {
        errors.path = 'Path must be 200 characters or less';
      }

      if (!formData.component.trim()) {
        errors.component = 'Component is required for routes';
      } else if (formData.component.length > 100) {
        errors.component = 'Component must be 100 characters or less';
      }

      if (formData.title && formData.title.length > 100) {
        errors.title = 'Title must be 100 characters or less';
      }
    }

    // Type validation
    if (!ROUTE_TYPES.includes(formData.type)) {
      errors.type = `Type must be one of: ${ROUTE_TYPES.join(', ')}`;
    }

    // Nav position validation
    if (!NAV_POSITIONS.includes(formData.nav_position)) {
      errors.nav_position = `Navigation position must be one of: ${NAV_POSITIONS.join(', ')}`;
    }

    // Nav order validation (0-999)
    if (formData.nav_order < 0 || formData.nav_order > 999) {
      errors.nav_order = 'Navigation order must be between 0 and 999';
    }

    // Group validation
    if (formData.group && !ROUTE_GROUPS.includes(formData.group)) {
      errors.group = `Group must be one of: ${ROUTE_GROUPS.join(', ')}`;
    }

    // Badge type validation - only validate if badge_text is provided
    if (formData.badge_text && formData.badge_type && !BADGE_TYPES.includes(formData.badge_type)) {
      errors.badge_type = `Badge type must be one of: ${BADGE_TYPES.join(', ')}`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear specific validation error when field changes
  const clearValidationError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Get form control props with validation
  const getControlProps = (fieldName: string) => ({
    isInvalid: !!validationErrors[fieldName]
  });

  useEffect(() => {
    if (route) {
      const { created_at, updated_at, ...editableRoute } = route;
      // Ensure all form fields are properly initialized with correct null values
      setFormData({
        ...editableRoute,
        // Handle optional fields that might be undefined
        badge_text: editableRoute.badge_text ?? '',
        badge_type: editableRoute.badge_type ?? null,
        icon: editableRoute.icon ?? null,
        required_permissions: editableRoute.required_permissions ?? null,
        required_groups: editableRoute.required_groups ?? null,
        description: editableRoute.description ?? null,
        keywords: editableRoute.keywords ?? null,
        group: editableRoute.group ?? null,
        feature_flags: editableRoute.feature_flags ?? null,
        props: editableRoute.props ?? {}
      });
      setItemType(route.is_folder ? 'folder' : 'route');
    } else {
      setFormData({
        route_id: '',
        path: '',
        component: '',
        name: '',
        title: '',
        icon: null,
        type: 'auth',
        parent_id: preselectedParentId,
        is_folder: false,
        nav_position: 'main',
        nav_order: 0,
        show_in_nav: true,
        required_permissions: null,
        required_groups: null,
        description: null,
        keywords: null,
        group: 'Utilities',
        feature_flags: null,
        is_enabled: true,
        props: {},
        lazy_load: true,
        exact: false,
        newtab: false,
        badge_text: '',
        badge_type: null
      });
      setItemType('route');
    }
    // Clear validation errors when form resets
    setValidationErrors({});
  }, [route, show, preselectedParentId]);

  // Update is_folder when item type changes
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      is_folder: itemType === 'folder',
      // Clear route-specific fields for folders
      ...(itemType === 'folder' ? {
        path: '',
        component: '',
        lazy_load: false,
        exact: false
      } : {})
    }));
  }, [itemType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data against OpenAPI schema
    if (!validateForm()) {
      return;
    }
    
    // Build payload based on item type and operation
    const commonFields = {
      name: formData.name,
      icon: formData.icon,
      type: formData.type,
      parent_id: formData.parent_id,
      nav_order: formData.nav_order,
      show_in_nav: formData.show_in_nav,
      required_permissions: formData.required_permissions,
      required_groups: formData.required_groups,
      description: formData.description,
      keywords: formData.keywords,
      group: formData.group,
      feature_flags: formData.feature_flags,
      is_enabled: formData.is_enabled,
      props: formData.props,
      badge_text: formData.badge_text,
      badge_type: formData.badge_type
    };

    const routeSpecificFields = {
      title: formData.title,
      path: formData.path,
      component: formData.component,
      nav_position: formData.nav_position,
      lazy_load: formData.lazy_load,
      exact: formData.exact,
      newtab: formData.newtab
    };

    let payload: any;
    if (route) {
      // Updating existing item - include route_id and is_folder as hooks will filter them
      const basePayload = {
        ...commonFields,
        route_id: formData.route_id,
        is_folder: formData.is_folder
      };
      
      payload = itemType === 'folder' ? basePayload : { ...basePayload, ...routeSpecificFields };
    } else {
      // Creating new item - include route_id and is_folder as hooks will filter them
      payload = {
        ...commonFields,
        route_id: formData.route_id,
        is_folder: itemType === 'folder'
      };
      
      // Only include route-specific fields for routes
      if (itemType === 'route') {
        Object.assign(payload, routeSpecificFields);
      }
    }
    
    onSave(payload);
  };

  const getParentBreadcrumb = (parentId: string | null): string => {
    if (!parentId || !parentOptions) return 'Root Level';
    
    const buildPath = (id: string, path: string[] = []): string[] => {
      const parent = parentOptions.find(p => p.id === id);
      if (!parent) return path;
      
      path.unshift(parent.name);
      return parent.parent_id ? buildPath(parent.parent_id, path) : path;
    };
    
    return buildPath(parentId).join(' / ');
  };

  const renderParentSelector = () => {
    if (parentOptionsLoading) {
      return (
        <div className="d-flex align-items-center">
          <Spinner size="sm" className="me-2" />
          Loading parent options...
        </div>
      );
    }

    const filteredOptions = parentOptions?.filter(option => {
      // Don't allow selecting self as parent when editing
      if (route && option.id === route.id) return false;
      // Don't allow selecting children as parents to prevent circular references
      // This would need more complex logic to check the full tree
      return true;
    }) || [];

    return (
      <>
        <Form.Select
          value={formData.parent_id || ''}
          onChange={e => setFormData({ 
            ...formData, 
            parent_id: e.target.value || null 
          })}
        >
          <option value="">Root Level</option>
          {filteredOptions.map(option => (
            <option key={option.id} value={option.id}>
              {'  '.repeat(option.depth)}
              {option.is_folder ? '📁' : '📄'} {option.name}
              {option.path && ` (${option.path})`}
            </option>
          ))}
        </Form.Select>
        
        {formData.parent_id && (
          <Form.Text className="text-muted">
            <FontAwesomeIcon icon="sitemap" className="me-2" />
            Path: {getParentBreadcrumb(formData.parent_id)}
          </Form.Text>
        )}
      </>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon 
            icon={route ? 'edit' : 'plus'} 
            className="me-2"
          />
          {route ? 'Edit' : 'Create New'} {itemType === 'folder' ? 'Folder' : 'Route'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Item Type Selection (only for new items) */}
          {!route && (
            <Alert variant="info" className="mb-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <strong>What would you like to create?</strong>
                  <div className="mt-2">
                    <small className="text-muted">
                      {itemType === 'folder' 
                        ? '📁 Folders organize navigation items and don\'t have their own pages'
                        : '📄 Routes are navigable pages with their own URLs and components'
                      }
                    </small>
                  </div>
                </Col>
                <Col md={4}>
                  <ButtonGroup className="w-100">
                    <Button
                      variant={itemType === 'route' ? 'primary' : 'outline-primary'}
                      onClick={() => setItemType('route')}
                      size="sm"
                    >
                      <FontAwesomeIcon icon="file-alt" className="me-2" />
                      Route
                    </Button>
                    <Button
                      variant={itemType === 'folder' ? 'primary' : 'outline-primary'}
                      onClick={() => setItemType('folder')}
                      size="sm"
                    >
                      <FontAwesomeIcon icon="folder" className="me-2" />
                      Folder
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </Alert>
          )}

          {/* Basic Information */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  {itemType === 'folder' ? 'Folder' : 'Route'} ID*
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.route_id}
                  onChange={e => {
                    setFormData({ ...formData, route_id: e.target.value });
                    clearValidationError('route_id');
                  }}
                  required
                  disabled={!!route}
                  placeholder={itemType === 'folder' ? 'user-management' : 'dashboard-main'}
                  maxLength={100}
                  {...getControlProps('route_id')}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.route_id}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Unique identifier (e.g., {itemType === 'folder' ? 'user-management' : 'dashboard-main'}) - Max 100 characters
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Display Name*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={e => {
                    setFormData({ ...formData, name: e.target.value });
                    clearValidationError('name');
                  }}
                  required
                  placeholder={itemType === 'folder' ? 'User Management' : 'Dashboard'}
                  maxLength={100}
                  {...getControlProps('name')}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.name}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Display name shown in navigation - Max 100 characters
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Parent Selection */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FontAwesomeIcon icon="sitemap" className="me-2" />
                  Parent {itemType === 'folder' ? 'Folder' : 'Location'}
                </Form.Label>
                {renderParentSelector()}
              </Form.Group>
            </Col>
          </Row>

          {/* Route-specific fields */}
          {itemType === 'route' && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Path*</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.path}
                      onChange={e => {
                        setFormData({ ...formData, path: e.target.value });
                        clearValidationError('path');
                      }}
                      required
                      placeholder="/dashboard"
                      maxLength={200}
                      {...getControlProps('path')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.path}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      URL path for this route - Max 200 characters
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Component*</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.component}
                      onChange={e => {
                        setFormData({ ...formData, component: e.target.value });
                        clearValidationError('component');
                      }}
                      required
                      placeholder="Dashboard"
                      maxLength={100}
                      {...getControlProps('component')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.component}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      React component name - Max 100 characters
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Page Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.title}
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        clearValidationError('title');
                      }}
                      placeholder="Dashboard Page"
                      maxLength={100}
                      {...getControlProps('title')}
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.title}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      HTML title and breadcrumb text - Max 100 characters
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}

          {/* Common fields */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type*</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={e => {
                    setFormData({ ...formData, type: e.target.value });
                    clearValidationError('type');
                  }}
                  required
                  {...getControlProps('type')}
                >
                  {ROUTE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.type}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Access level required for this {itemType}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Group*</Form.Label>
                <Form.Select
                  value={formData.group || ''}
                  onChange={e => {
                    setFormData({ ...formData, group: e.target.value });
                    clearValidationError('group');
                  }}
                  required
                  {...getControlProps('group')}
                >
                  {ROUTE_GROUPS.map(group => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.group}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {itemType === 'route' && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Navigation Position*</Form.Label>
                  <Form.Select
                    value={formData.nav_position}
                    onChange={e => {
                      setFormData({ ...formData, nav_position: e.target.value });
                      clearValidationError('nav_position');
                    }}
                    required
                    {...getControlProps('nav_position')}
                  >
                    {NAV_POSITIONS.map(position => (
                      <option key={position} value={position}>
                        {position.charAt(0).toUpperCase() + position.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.nav_position}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Where to display this route in navigation
                  </Form.Text>
                </Form.Group>
              </Col>
            )}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Icon</Form.Label>
                <Form.Select
                  value={formData.icon || ''}
                  onChange={e => setFormData({ ...formData, icon: e.target.value || null })}
                >
                  <option value="">None</option>
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Form.Select>
                {formData.icon && (
                  <Form.Text className="text-muted">
                    Preview: <FontAwesomeIcon icon={formData.icon as any} className="me-2" />
                    {formData.icon}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Settings */}
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="enabled"
                  label="Enabled"
                  checked={formData.is_enabled}
                  onChange={e => setFormData({ ...formData, is_enabled: e.target.checked })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="show_in_nav"
                  label="Show in Navigation"
                  checked={formData.show_in_nav}
                  onChange={e => setFormData({ ...formData, show_in_nav: e.target.checked })}
                />
              </Form.Group>
            </Col>
            {itemType === 'route' && (
              <>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="lazy_load"
                      label="Lazy Load"
                      checked={formData.lazy_load}
                      onChange={e => setFormData({ ...formData, lazy_load: e.target.checked })}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="newtab"
                      label="Open in New Tab"
                      checked={formData.newtab}
                      onChange={e => setFormData({ ...formData, newtab: e.target.checked })}
                    />
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>

          {/* Advanced settings */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.nav_order || 0}
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, nav_order: value });
                    clearValidationError('nav_order');
                  }}
                  placeholder="0"
                  min={0}
                  max={999}
                  {...getControlProps('nav_order')}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.nav_order}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Lower numbers appear first (0-999)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Badge Text (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.badge_text || ''}
                  onChange={e => setFormData({
                    ...formData,
                    badge_text: e.target.value,
                    badge_type: e.target.value ? formData.badge_type || 'success' : null
                  })}
                  placeholder="New"
                />
                {formData.badge_text && (
                  <>
                    <Form.Select
                      className="mt-2"
                      value={formData.badge_type || 'success'}
                      onChange={e => {
                        setFormData({ ...formData, badge_type: e.target.value });
                        clearValidationError('badge_type');
                      }}
                      {...getControlProps('badge_type')}
                    >
                      {BADGE_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.badge_type}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      Preview: <Badge bg={formData.badge_type || 'success'}>{formData.badge_text}</Badge>
                    </Form.Text>
                  </>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            <FontAwesomeIcon icon="times" className="me-2" />
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <FontAwesomeIcon icon={route ? 'save' : 'plus'} className="me-2" />
            {route ? 'Update' : 'Create'} {itemType === 'folder' ? 'Folder' : 'Route'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RouteEditModal;
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
import { SitemapRoute, useParentOptions } from '../../hooks/admin/useSitemap';

const ROUTE_GROUPS = [
  'Administration',
  'Alliance', 
  'Corporation',
  'Documentation',
  'Economy',
  'Personal',
  'Utilities'
];

const ICON_OPTIONS = [
  'chart-pie', 'user', 'users', 'cog', 'shield-alt', 'clock',
  'chart-line', 'file-alt', 'table', 'globe', 'flag', 'lock',
  'tags', 'question-circle', 'exclamation-triangle', 'thumbtack',
  'columns', 'shapes', 'map', 'puzzle-piece', 'fire', 'rocket',
  'wrench', 'palette', 'code-branch', 'sign-out-alt', 'vial',
  'folder', 'folder-open', 'archive', 'layer-group', 'sitemap'
];

interface RouteFormData extends Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at'> {}

interface RouteEditModalProps {
  show: boolean;
  onHide: () => void;
  route?: SitemapRoute | null;
  onSave: (data: RouteFormData) => void;
  preselectedParentId?: string | null;
}

const RouteEditModal: React.FC<RouteEditModalProps> = ({ 
  show, 
  onHide, 
  route, 
  onSave,
  preselectedParentId = null 
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
    props: null,
    lazy_load: true,
    exact: false,
    newtab: false
  });

  const [itemType, setItemType] = useState<'route' | 'folder'>('route');
  const { data: parentOptions, isLoading: parentOptionsLoading } = useParentOptions();

  useEffect(() => {
    if (route) {
      const { created_at, updated_at, ...editableRoute } = route;
      setFormData(editableRoute);
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
        props: null,
        lazy_load: true,
        exact: false,
        newtab: false
      });
      setItemType('route');
    }
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
    
    // Validate required fields based on item type
    if (itemType === 'route') {
      if (!formData.path || !formData.component) {
        alert('Path and Component are required for routes');
        return;
      }
    }
    
    onSave({
      ...formData,
      is_folder: itemType === 'folder'
    });
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
                  onChange={e => setFormData({ ...formData, route_id: e.target.value })}
                  required
                  placeholder={itemType === 'folder' ? 'user-management' : 'dashboard-main'}
                />
                <Form.Text className="text-muted">
                  Unique identifier (e.g., {itemType === 'folder' ? 'user-management' : 'dashboard-main'})
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Display Name*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder={itemType === 'folder' ? 'User Management' : 'Dashboard'}
                />
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
                      onChange={e => setFormData({ ...formData, path: e.target.value })}
                      required
                      placeholder="/dashboard"
                    />
                    <Form.Text className="text-muted">
                      URL path for this route
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Component*</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.component}
                      onChange={e => setFormData({ ...formData, component: e.target.value })}
                      required
                      placeholder="Dashboard"
                    />
                    <Form.Text className="text-muted">
                      React component name
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
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Dashboard Page"
                    />
                    <Form.Text className="text-muted">
                      HTML title and breadcrumb text
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
                <Form.Label>Group*</Form.Label>
                <Form.Select
                  value={formData.group || ''}
                  onChange={e => setFormData({ ...formData, group: e.target.value })}
                  required
                >
                  {ROUTE_GROUPS.map(group => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
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
                  onChange={e => setFormData({ ...formData, nav_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <Form.Text className="text-muted">
                  Lower numbers appear first
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
                    badge_type: e.target.value ? 'success' : null
                  })}
                  placeholder="New"
                />
                {formData.badge_text && (
                  <Form.Text className="text-muted">
                    Preview: <Badge bg={formData.badge_type || 'secondary'}>{formData.badge_text}</Badge>
                  </Form.Text>
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
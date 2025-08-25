import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Badge,
  Form,
  Modal,
  Row,
  Col,
  ButtonGroup,
  Alert,
  Spinner,
  Table,
  Pagination
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import {
  useSitemapRoutes,
  useCreateRoute,
  useUpdateRoute,
  useUpdateRouteFields,
  useDeleteRoute,
  useReorderRoutes,
  useSitemapStats,
  useCreateFolder,
  SitemapRoute
} from '../../hooks/admin/useSitemap';
import { FolderCreateModal, FolderFormData } from '../../components/admin';
import { sitemapService } from '../../services/sitemapService';
import Flex from 'components/common/Flex';
import '../../assets/css/sitemap-admin.css';

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
  'wrench', 'palette', 'code-branch', 'sign-out-alt', 'vial'
];

interface RouteFormData extends Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at'> {}

const RouteEditModal: React.FC<{
  show: boolean;
  onHide: () => void;
  route?: SitemapRoute | null;
  onSave: (data: RouteFormData) => void;
}> = ({ show, onHide, route, onSave }) => {
  const [formData, setFormData] = useState<RouteFormData>({
    route_id: '',
    path: '',
    component: '',
    name: '',
    title: '',
    icon: null,
    type: 'auth',
    parent_id: null,
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

  useEffect(() => {
    if (route) {
      const { created_at, updated_at, ...editableRoute } = route;
      setFormData(editableRoute);
    } else {
      setFormData({
        route_id: '',
        path: '',
        component: '',
        name: '',
        title: '',
        icon: null,
        type: 'auth',
        parent_id: null,
        nav_position: 'main',
        nav_order: 0,
        show_in_nav: true,
        required_permissions: null,
        required_groups: null,
        description: null,
        keywords: null,
        group: 'general',
        feature_flags: null,
        is_enabled: true,
        props: null,
        lazy_load: true,
        exact: false,
        newtab: false
      });
    }
  }, [route]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{route ? 'Edit Route' : 'Create New Route'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Route ID*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.route_id}
                  onChange={e => setFormData({ ...formData, route_id: e.target.value })}
                  required
                  placeholder="dashboard-main"
                />
                <Form.Text className="text-muted">
                  Unique identifier for the route (e.g., dashboard-main)
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Dashboard"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title*</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Dashboard Page"
                />
              </Form.Group>
            </Col>
          </Row>

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
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Group*</Form.Label>
                <Form.Select
                  value={formData.group || ''}
                  onChange={e => setFormData({
                    ...formData,
                    group: e.target.value
                  })}
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
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                >
                  <option value="">None</option>
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
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
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="show_in_nav"
                  label="Show in Nav"
                  checked={formData.show_in_nav}
                  onChange={e => setFormData({ ...formData, show_in_nav: e.target.checked })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
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
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Order</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.nav_order || 0}
                  onChange={e => setFormData({ ...formData, nav_order: parseInt(e.target.value) })}
                  placeholder="0"
                />
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
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {route ? 'Update' : 'Create'} Route
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const SitemapAdmin: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<SitemapRoute | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Administration', 'Personal']));
  const [currentPage, setCurrentPage] = useState(1);

  const { data: sitemapResponse, isLoading, error } = useSitemapRoutes({
    group: selectedGroup || undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: 50, // Show 50 routes per page
    sort: 'nav_order',
    order: 'asc'
  });
  
  const routes = sitemapResponse?.routes || [];

  const { data: stats } = useSitemapStats();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const updateRouteFields = useUpdateRouteFields();
  const deleteRoute = useDeleteRoute();
  const reorderRoutes = useReorderRoutes();
  const createFolder = useCreateFolder();

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedGroup, searchTerm]);

  // Group routes by their group and sort by nav_order
  const groupedRoutes = routes.reduce((acc, route) => {
    const group = route.group || 'Utilities';
    if (!acc[group]) acc[group] = [];
    acc[group].push(route);
    return acc;
  }, {} as Record<string, SitemapRoute[]>);

  // Sort each group by nav_order in ascending order
  Object.keys(groupedRoutes).forEach(group => {
    groupedRoutes[group].sort((a, b) => {
      const orderA = a.nav_order || 0;
      const orderB = b.nav_order || 0;
      return orderA - orderB;
    });
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceGroup = result.source.droppableId;
    const destGroup = result.destination.droppableId;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceGroup === destGroup && sourceIndex === destIndex) return;

    const sourceRoutes = [...(groupedRoutes[sourceGroup] || [])];
    const [movedRoute] = sourceRoutes.splice(sourceIndex, 1);

    if (sourceGroup === destGroup) {
      sourceRoutes.splice(destIndex, 0, movedRoute);
      
      // Update order for all affected routes using increments of 10
      const reorderData = sourceRoutes.map((route, index) => ({
        route_id: route.route_id,
        nav_order: (index + 1) * 10  // Use increments of 10: 10, 20, 30, etc.
      }));

      reorderRoutes.mutate({ updates: reorderData }, {
        onSuccess: () => {
          toast.success('Routes reordered successfully');
          // Clear sitemap cache to refresh navigation
          sitemapService.clearCache();
        },
        onError: () => {
          toast.error('Failed to reorder routes');
        }
      });
    } else {
      // Moving to different group - update only the group field
      updateRouteFields.mutate(
        {
          id: movedRoute.id,
          fields: { group: destGroup }
        },
        {
          onSuccess: () => {
            toast.success('Route moved to new group');
            // Clear sitemap cache to refresh navigation
            sitemapService.clearCache();
          },
          onError: () => {
            toast.error('Failed to move route');
          }
        }
      );
    }
  };

  const handleSaveRoute = (data: RouteFormData) => {
    if (editingRoute) {
      updateRoute.mutate({ ...data, id: editingRoute.id, created_at: editingRoute.created_at, updated_at: editingRoute.updated_at }, {
        onSuccess: () => {
          toast.success('Route updated successfully');
          setShowModal(false);
          setEditingRoute(null);
          // Clear sitemap cache to refresh navigation
          sitemapService.clearCache();
        },
        onError: () => {
          toast.error('Failed to update route');
        }
      });
    } else {
      createRoute.mutate(data, {
        onSuccess: () => {
          toast.success('Route created successfully');
          setShowModal(false);
          // Clear sitemap cache to refresh navigation
          sitemapService.clearCache();
        },
        onError: () => {
          toast.error('Failed to create route');
        }
      });
    }
  };

  const handleDeleteRoute = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the route "${name}"? This will also delete all child routes.`)) {
      deleteRoute.mutate(id, {
        onSuccess: () => {
          toast.success('Route deleted successfully');
          // Clear sitemap cache to refresh navigation
          sitemapService.clearCache();
        },
        onError: () => {
          toast.error('Failed to delete route');
        }
      });
    }
  };

  const handleToggleEnabled = (route: SitemapRoute) => {
    const newEnabledState = !route.is_enabled;
    
    updateRouteFields.mutate(
      { 
        id: route.id, 
        fields: { is_enabled: newEnabledState } 
      }, 
      {
        onSuccess: () => {
          toast.success(`Route ${newEnabledState ? 'enabled' : 'disabled'} successfully`);
          // Clear sitemap cache to refresh navigation
          sitemapService.clearCache();
        },
        onError: (error) => {
          console.error('Toggle enabled error:', error);
          toast.error('Failed to update route status');
        }
      }
    );
  };

  const toggleGroupExpansion = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSaveFolder = async (folderData: FolderFormData) => {
    try {
      await createFolder.mutateAsync({
        name: folderData.name,
        parent_id: folderData.parent_id,
        icon: folderData.icon
      });
      toast.success('Folder created successfully');
      setShowFolderModal(false);
      sitemapService.clearCache();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <h5>Failed to load sitemap routes</h5>
        <p className="mb-0">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
        <hr />
        <small>
          Make sure you have the necessary permissions to access the admin sitemap.
        </small>
      </Alert>
    );
  }

  return (
    <>
      <Card className="mb-3">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Sitemap Management</h5>
              {stats && (
                <div className="mt-2">
                  <Badge bg="primary" className="me-2">
                    {stats.totalRoutes} Total Routes
                  </Badge>
                  <Badge bg="success" className="me-2">
                    {stats.enabledRoutes} Enabled
                  </Badge>
                  <Badge bg="secondary">
                    {stats.disabledRoutes} Disabled
                  </Badge>
                </div>
              )}
            </Col>
            <Col xs="auto">
              <ButtonGroup size="sm">
                <Button
                  variant="success"
                  onClick={() => setShowFolderModal(true)}
                >
                  <FontAwesomeIcon icon="folder-plus" className="me-1" />
                  New Folder
                </Button>
                <Button
                  variant="falcon-primary"
                  onClick={() => {
                    setEditingRoute(null);
                    setShowModal(true);
                  }}
                >
                  <FontAwesomeIcon icon="plus" className="me-1" />
                  Add Route
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                <option value="">All Groups</option>
                {ROUTE_GROUPS.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <small className="text-muted">
                Drag and drop routes to reorder or move between groups
              </small>
            </Col>
          </Row>

          <DragDropContext onDragEnd={handleDragEnd}>
            {Object.entries(groupedRoutes).map(([group, groupRoutes]) => (
              <Card key={group} className="mb-3">
                <Card.Header
                  className="cursor-pointer"
                  onClick={() => toggleGroupExpansion(group)}
                >
                  <Flex alignItems="center" justifyContent="between">
                    <div>
                      <FontAwesomeIcon
                        icon={expandedGroups.has(group) ? 'chevron-down' : 'chevron-right'}
                        className="me-2"
                      />
                      <strong className="text-capitalize">{group}</strong>
                      <Badge bg="secondary" className="ms-2">
                        {groupRoutes.length}
                      </Badge>
                    </div>
                  </Flex>
                </Card.Header>
                {expandedGroups.has(group) && (
                  <Card.Body className="p-0">
                    <Droppable droppableId={group}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`route-list ${snapshot.isDraggingOver ? 'bg-light' : ''}`}
                          style={{ minHeight: '50px' }}
                        >
                          <Table responsive hover className="mb-0">
                            <thead>
                              <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Name</th>
                                <th>Path</th>
                                <th>Component</th>
                                <th>Status</th>
                                <th style={{ width: '150px' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupRoutes.map((route, index) => (
                                <Draggable
                                  key={route.id}
                                  draggableId={route.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <tr
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={snapshot.isDragging ? 'bg-light' : ''}
                                    >
                                      <td {...provided.dragHandleProps}>
                                        <FontAwesomeIcon
                                          icon="bars"
                                          className="text-muted cursor-move"
                                        />
                                      </td>
                                      <td>
                                        <Flex alignItems="center">
                                          {route.icon && (
                                            <FontAwesomeIcon
                                              icon={route.icon as any}
                                              className="me-2"
                                            />
                                          )}
                                          <span>{route.name}</span>
                                          {route.badge_text && (
                                            <Badge
                                              bg={route.badge_type || 'info'}
                                              className="ms-2"
                                            >
                                              {route.badge_text}
                                            </Badge>
                                          )}
                                        </Flex>
                                      </td>
                                      <td>
                                        <code>{route.path}</code>
                                      </td>
                                      <td>{route.component}</td>
                                      <td>
                                        <Form.Check
                                          type="switch"
                                          id={`enabled-${route.id}`}
                                          checked={route.is_enabled}
                                          onChange={() => handleToggleEnabled(route)}
                                          label={route.is_enabled ? 'Enabled' : 'Disabled'}
                                        />
                                      </td>
                                      <td>
                                        <ButtonGroup size="sm">
                                          <Button
                                            variant="outline-primary"
                                            onClick={() => {
                                              setEditingRoute(route);
                                              setShowModal(true);
                                            }}
                                          >
                                            <FontAwesomeIcon icon="edit" />
                                          </Button>
                                          <Button
                                            variant="outline-danger"
                                            onClick={() => handleDeleteRoute(route.id, route.name)}
                                          >
                                            <FontAwesomeIcon icon="trash" />
                                          </Button>
                                        </ButtonGroup>
                                      </td>
                                    </tr>
                                  )}
                                </Draggable>
                              ))}
                            </tbody>
                          </Table>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Card.Body>
                )}
              </Card>
            ))}
          </DragDropContext>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {sitemapResponse && sitemapResponse.total > sitemapResponse.limit && (
        <Card>
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <small className="text-muted">
                  Showing {((currentPage - 1) * sitemapResponse.limit) + 1} to{' '}
                  {Math.min(currentPage * sitemapResponse.limit, sitemapResponse.total)} of{' '}
                  {sitemapResponse.total} routes
                </small>
              </Col>
              <Col xs="auto">
                <Pagination className="mb-0">
                  <Pagination.First 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  />
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  
                  {/* Show page numbers */}
                  {Array.from({ length: Math.ceil(sitemapResponse.total / sitemapResponse.limit) }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === Math.ceil(sitemapResponse.total / sitemapResponse.limit) ||
                      Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, filteredPages) => (
                      <React.Fragment key={page}>
                        {index > 0 && filteredPages[index - 1] < page - 1 && (
                          <Pagination.Ellipsis key={`ellipsis-${page}`} />
                        )}
                        <Pagination.Item
                          active={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Pagination.Item>
                      </React.Fragment>
                    ))
                  }
                  
                  <Pagination.Next
                    disabled={currentPage === Math.ceil(sitemapResponse.total / sitemapResponse.limit)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                  <Pagination.Last
                    disabled={currentPage === Math.ceil(sitemapResponse.total / sitemapResponse.limit)}
                    onClick={() => setCurrentPage(Math.ceil(sitemapResponse.total / sitemapResponse.limit))}
                  />
                </Pagination>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <RouteEditModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingRoute(null);
        }}
        route={editingRoute}
        onSave={handleSaveRoute}
      />

      <FolderCreateModal
        show={showFolderModal}
        onHide={() => setShowFolderModal(false)}
        onSave={handleSaveFolder}
        isLoading={createFolder.isPending}
      />
    </>
  );
};

export default SitemapAdmin;
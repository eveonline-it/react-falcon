import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Form,
  ButtonGroup,
  Alert,
  Spinner,
  Badge,
  InputGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';

// Components
import { 
  SitemapTreeView, 
  FolderCreateModal, 
  RouteEditModal,
  FolderFormData 
} from '../../components/admin';

// Hooks
import {
  useSitemapRoutes,
  useCreateRoute,
  useUpdateRoute,
  useDeleteRoute,
  useCreateFolder,
  useMoveItem,
  useReorderRoutes,
  useParentOptions,
  SitemapRoute
} from '../../hooks/admin/useSitemap';

// Services & Utils
import { sitemapService, HierarchicalNavItem } from '../../services/sitemapService';
import { 
  HierarchicalDragDropHandler, 
  createHierarchicalDragDropHandler,
  DragDropContext as HierarchicalDragDropContext
} from '../../utils/hierarchicalDragDrop';

// Styles
import '../../assets/css/sitemap-tree.css';
import '../../assets/css/sitemap-admin.css';

interface RouteFormData extends Omit<SitemapRoute, 'id' | 'created_at' | 'updated_at'> {}

const HierarchicalSitemapAdmin: React.FC = () => {
  // State management
  const [treeData, setTreeData] = useState<HierarchicalNavItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  
  // Modal states
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingItem, setEditingItem] = useState<HierarchicalNavItem | null>(null);
  const [preselectedParentId, setPreselectedParentId] = useState<string | null>(null);
  const [parentForFolder, setParentForFolder] = useState<string | null>(null);

  // API hooks
  const { data: routes, isLoading, error, refetch } = useSitemapRoutes({
    sort: 'nav_order',
    order: 'asc'
  });
  const { data: parentOptions } = useParentOptions();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();
  const createFolder = useCreateFolder();
  const moveItem = useMoveItem();
  const reorderRoutes = useReorderRoutes();

  // Drag drop handler
  const [dragDropHandler, setDragDropHandler] = useState<HierarchicalDragDropHandler | null>(null);

  // Initialize drag drop handler
  useEffect(() => {
    const context: HierarchicalDragDropContext = {
      treeData,
      onItemMove: async (itemId: string, newParentId: string | null, newOrder: number) => {
        await moveItem.mutateAsync({ itemId, newParentId });
        toast.success('Item moved successfully');
      },
      onReorder: async (items) => {
        // Transform items to match API format
        const updates = items.map(item => {
          // Find the corresponding route to get route_id
          const route = routes.routes.find(r => r.id === item.id);
          return {
            route_id: route?.route_id || item.id, // fallback to id if route_id not found
            nav_order: item.nav_order
          };
        });
        await reorderRoutes.mutateAsync({ updates });
        toast.success('Items reordered successfully');
      }
    };

    setDragDropHandler(createHierarchicalDragDropHandler(context));
  }, [treeData, moveItem, reorderRoutes]);

  // Convert routes to hierarchical structure
  useEffect(() => {
    const convertToHierarchical = async () => {
      if (!routes?.routes) return;

      try {
        // Check if routes have hierarchical data
        const hasHierarchy = routes.routes.some(route => 
          route.parent_id !== undefined || route.is_folder !== undefined
        );

        if (hasHierarchy) {
          // Use the service to generate hierarchical route groups
          const routeGroups = await sitemapService.generateHierarchicalRouteGroups(routes.routes);
          
          // Convert to flat array of hierarchical nav items with proper sorting
          const hierarchicalItems: HierarchicalNavItem[] = [];
          
          // Process each group and maintain hierarchical order
          routeGroups.forEach(group => {
            group.children.forEach(child => {
              hierarchicalItems.push(child as HierarchicalNavItem);
            });
          });
          
          // Sort the items by nav_order to ensure proper ordering
          hierarchicalItems.sort((a, b) => {
            const orderA = a.nav_order || 0;
            const orderB = b.nav_order || 0;
            return orderA - orderB;
          });
          
          setTreeData(hierarchicalItems);
        } else {
          // Fallback to flat structure
          const flatItems: HierarchicalNavItem[] = routes.routes
            .map(route => ({
              id: route.id,
              name: route.name,
              to: route.path,
              icon: route.icon || undefined,
              active: route.is_enabled,
              is_folder: route.is_folder || false,
              parent_id: route.parent_id,
              nav_order: route.nav_order
            }))
            .sort((a, b) => {
              const orderA = a.nav_order || 0;
              const orderB = b.nav_order || 0;
              return orderA - orderB;
            });
          
          setTreeData(flatItems);
        }
      } catch (error) {
        console.error('Error converting routes to hierarchical:', error);
        // Fallback to flat structure on error
        if (routes?.routes) {
          const flatItems: HierarchicalNavItem[] = routes.routes
            .map(route => ({
              id: route.id,
              name: route.name,
              to: route.path,
              icon: route.icon || undefined,
              active: route.is_enabled,
              is_folder: route.is_folder || false,
              parent_id: route.parent_id,
              nav_order: route.nav_order
            }))
            .sort((a, b) => {
              const orderA = a.nav_order || 0;
              const orderB = b.nav_order || 0;
              return orderA - orderB;
            });
          
          setTreeData(flatItems);
        }
      }
    };

    convertToHierarchical();
  }, [routes]);

  // Filter tree data based on search and group
  const filteredTreeData = treeData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.to && item.to.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Group filtering would need to be implemented based on route data
    const matchesGroup = selectedGroup === '' || true; // TODO: Implement group filtering
    
    return matchesSearch && matchesGroup;
  });

  // Event handlers
  const handleToggleExpand = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
      return newExpanded;
    });
  }, []);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!dragDropHandler) return;

    try {
      const reorderResult = await dragDropHandler.handleDragEnd(result);
      if (reorderResult) {
        setTreeData(reorderResult.updatedTree);
        // Refresh data from server
        refetch();
        sitemapService.clearCache();
      }
    } catch (error) {
      console.error('Drag drop error:', error);
      toast.error('Failed to reorder items');
    }
  }, [dragDropHandler, refetch]);

  const handleEditItem = useCallback((item: HierarchicalNavItem) => {
    setEditingItem(item);
    setShowRouteModal(true);
  }, []);

  const handleDeleteItem = useCallback(async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will also delete all children.`)) {
      try {
        await deleteRoute.mutateAsync(id);
        toast.success('Item deleted successfully');
        sitemapService.clearCache();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  }, [deleteRoute]);

  const handleToggleEnabled = useCallback(async (item: HierarchicalNavItem) => {
    // This would need to be implemented with a toggle endpoint
    toast.info('Toggle functionality needs backend implementation');
  }, []);

  const handleCreateFolder = useCallback((parentId?: string) => {
    setParentForFolder(parentId || null);
    setShowFolderModal(true);
  }, []);

  const handleSaveFolder = useCallback(async (folderData: FolderFormData) => {
    try {
      await createFolder.mutateAsync({
        name: folderData.name,
        parent_id: folderData.parent_id,
        icon: folderData.icon
      });
      toast.success('Folder created successfully');
      setShowFolderModal(false);
      setParentForFolder(null);
      sitemapService.clearCache();
    } catch (error) {
      toast.error('Failed to create folder');
    }
  }, [createFolder]);

  const handleSaveRoute = useCallback(async (routeData: RouteFormData) => {
    try {
      if (editingItem) {
        // Find the original route data for update
        const originalRoute = routes?.routes.find(r => r.id === editingItem.id);
        if (originalRoute) {
          await updateRoute.mutateAsync({
            ...routeData,
            id: originalRoute.id,
            created_at: originalRoute.created_at,
            updated_at: originalRoute.updated_at
          });
          toast.success('Route updated successfully');
        }
      } else {
        await createRoute.mutateAsync(routeData);
        toast.success('Route created successfully');
      }
      
      setShowRouteModal(false);
      setEditingItem(null);
      setPreselectedParentId(null);
      sitemapService.clearCache();
    } catch (error) {
      toast.error(editingItem ? 'Failed to update route' : 'Failed to create route');
    }
  }, [editingItem, routes, updateRoute, createRoute]);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collectIds = (items: HierarchicalNavItem[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedItems(allIds);
  }, [treeData]);

  const handleCollapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  const getParentName = (parentId: string | null): string => {
    if (!parentId || !parentOptions) return '';
    const parent = parentOptions.find(p => p.id === parentId);
    return parent?.name || '';
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading hierarchical sitemap...</p>
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
        <Button variant="outline-danger" onClick={() => refetch()} className="mt-2">
          <FontAwesomeIcon icon="refresh" className="me-2" />
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="hierarchical-sitemap-admin">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">
            <FontAwesomeIcon icon="sitemap" className="me-3 text-primary" />
            Hierarchical Sitemap Management
          </h1>
          <p className="text-muted mt-2">
            Manage your application's navigation structure with drag-and-drop folders and routes.
          </p>
        </Col>
      </Row>

      {/* Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon="search" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search routes and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col lg={3} md={6}>
              <Form.Select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">All Groups</option>
                <option value="Administration">Administration</option>
                <option value="Alliance">Alliance</option>
                <option value="Corporation">Corporation</option>
                <option value="Documentation">Documentation</option>
                <option value="Economy">Economy</option>
                <option value="Personal">Personal</option>
                <option value="Utilities">Utilities</option>
              </Form.Select>
            </Col>

            <Col lg={5} className="text-end">
              <ButtonGroup className="me-2">
                <Button
                  variant={viewMode === 'tree' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                >
                  <FontAwesomeIcon icon="sitemap" className="me-2" />
                  Tree View
                </Button>
                <Button
                  variant={viewMode === 'flat' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('flat')}
                >
                  <FontAwesomeIcon icon="list" className="me-2" />
                  Flat View
                </Button>
              </ButtonGroup>

              <ButtonGroup className="me-2">
                <Button variant="outline-secondary" size="sm" onClick={handleExpandAll}>
                  <FontAwesomeIcon icon="expand-arrows-alt" className="me-2" />
                  Expand All
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleCollapseAll}>
                  <FontAwesomeIcon icon="compress-arrows-alt" className="me-2" />
                  Collapse All
                </Button>
              </ButtonGroup>

              <ButtonGroup>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleCreateFolder()}
                >
                  <FontAwesomeIcon icon="folder-plus" className="me-2" />
                  New Folder
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setPreselectedParentId(null);
                    setEditingItem(null);
                    setShowRouteModal(true);
                  }}
                >
                  <FontAwesomeIcon icon="plus" className="me-2" />
                  New Route
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="text-center">
              <h3>{treeData.length}</h3>
              <small>Total Items</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 bg-info text-white">
            <Card.Body className="text-center">
              <h3>{treeData.filter(item => item.is_folder).length}</h3>
              <small>Folders</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 bg-success text-white">
            <Card.Body className="text-center">
              <h3>{treeData.filter(item => !item.is_folder && item.active).length}</h3>
              <small>Active Routes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 bg-secondary text-white">
            <Card.Body className="text-center">
              <h3>{treeData.filter(item => !item.is_folder && !item.active).length}</h3>
              <small>Disabled Routes</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Card.Header>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0">
              <FontAwesomeIcon icon="sitemap" className="me-2" />
              Navigation Structure
            </h5>
            {filteredTreeData.length > 0 && (
              <Badge bg="info">
                {filteredTreeData.length} item{filteredTreeData.length !== 1 ? 's' : ''}
                {searchTerm && ' (filtered)'}
              </Badge>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <SitemapTreeView
            treeData={filteredTreeData}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onToggleEnabled={handleToggleEnabled}
            onCreateFolder={handleCreateFolder}
            onDragEnd={handleDragEnd}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
        </Card.Body>
      </Card>

      {/* Modals */}
      <FolderCreateModal
        show={showFolderModal}
        onHide={() => {
          setShowFolderModal(false);
          setParentForFolder(null);
        }}
        onSave={handleSaveFolder}
        parentId={parentForFolder}
        parentName={getParentName(parentForFolder)}
        isLoading={createFolder.isPending}
      />

      <RouteEditModal
        show={showRouteModal}
        onHide={() => {
          setShowRouteModal(false);
          setEditingItem(null);
          setPreselectedParentId(null);
        }}
        route={editingItem ? routes?.routes.find(r => r.id === editingItem.id) || null : null}
        onSave={handleSaveRoute}
        preselectedParentId={preselectedParentId}
      />
    </div>
  );
};

export default HierarchicalSitemapAdmin;
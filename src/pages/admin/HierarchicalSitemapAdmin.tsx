import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { useSitemap } from '../../hooks/useSitemap';
import {
  useSitemapRoutes,
  useCreateRoute,
  useUpdateRoute,
  useDeleteRoute,
  useCreateFolder,
  useMoveItem,
  useReorderRoutes,
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

  // API hooks - use user sitemap hook to get navigation structure
  const { data: sitemap, isLoading, error, refetch } = useSitemap();
  // Also get admin routes for CRUD operations
  const { data: adminRoutes } = useSitemapRoutes({ sort: 'nav_order', order: 'asc' });
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();
  const createFolder = useCreateFolder();
  const moveItem = useMoveItem();
  const reorderRoutes = useReorderRoutes();

  // Memoized drag drop callbacks
  const handleItemMove = useCallback(async (itemId: string, newParentId: string | null, newOrder: number) => {
    await moveItem.mutateAsync({ itemId, newParentId });
    toast.success('Item moved successfully');
  }, [moveItem]);

  const handleReorder = useCallback(async (items) => {
    // Transform items to match API format
    const updates = items.map(item => {
      // Find the corresponding route to get route_id
      const route = adminRoutes?.routes?.find(r => r.id === item.id);
      return {
        route_id: route?.route_id || item.id, // fallback to id if route_id not found
        nav_order: item.nav_order
      };
    });
    await reorderRoutes.mutateAsync({ updates });
    toast.success('Items reordered successfully');
  }, [adminRoutes, reorderRoutes]);

  // Drag drop handler
  const [dragDropHandler, setDragDropHandler] = useState<HierarchicalDragDropHandler | null>(null);

  // Convert navigation structure to tree data using useMemo for stability
  const treeData = useMemo(() => {
    if (!sitemap?.navigation) return [];

    const hierarchicalItems: HierarchicalNavItem[] = [];
    
    // Process each navigation group
    sitemap.navigation.forEach((navGroup, groupIndex) => {
      // Process each navigation item in the group
      const processNavItem = (item: any, depth: number = 0, parentIndex: string = ''): HierarchicalNavItem => {
        const itemIndex = `${groupIndex}-${parentIndex}-${item.routeId || item.name}`;
        const children = item.children ? 
          item.children.map((child: any, childIndex: number) => 
            processNavItem(child, depth + 1, `${itemIndex}-${childIndex}`)
          ) : undefined;
        
        const navItem: HierarchicalNavItem = {
          id: item.routeId || `navitem-${itemIndex}`, // Use stable ID based on position
          name: item.name || '',
          to: item.to || undefined,
          icon: item.icon || undefined,
          active: item.active !== false,
          is_folder: item.isFolder || false,
          parent_id: null, // Will be set if needed
          nav_order: depth,
          children: children as any // Type override since HierarchicalNavItem extends NavItem but we need different children type
        };
        
        return navItem;
      };
      
      // Add all items from this navigation group
      navGroup.children.forEach((item: any, itemIndex: number) => {
        hierarchicalItems.push(processNavItem(item, 0, String(itemIndex)));
      });
    });
    
    return hierarchicalItems;
  }, [JSON.stringify(sitemap?.navigation)]);

  // Initialize drag drop handler - temporarily disabled to prevent infinite loops
  // TODO: Re-enable drag drop functionality after fixing memoization issues
  // useEffect(() => {
  //   const context: HierarchicalDragDropContext = {
  //     treeData,
  //     onItemMove: handleItemMove,
  //     onReorder: handleReorder
  //   };

  //   setDragDropHandler(createHierarchicalDragDropHandler(context));
  // }, [treeData, handleItemMove, handleReorder]);

  // Filter tree data based on search and group
  const filteredTreeData = treeData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.to && item.to.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Group filtering would need to be implemented based on route data
    const matchesGroup = selectedGroup === ''; // TODO: Implement group filtering
    
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
    // Drag drop temporarily disabled to prevent infinite re-renders
    console.log('Drag drop temporarily disabled');
    return;
    
    // TODO: Re-enable when memoization is fixed
    // if (!dragDropHandler) return;
    // try {
    //   const reorderResult = await dragDropHandler.handleDragEnd(result);
    //   if (reorderResult) {
    //     refetch();
    //     sitemapService.clearCache();
    //   }
    // } catch (error) {
    //   console.error('Drag drop error:', error);
    //   toast.error('Failed to reorder items');
    // }
  }, []);

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
        const originalRoute = adminRoutes?.routes?.find(r => r.id === editingItem.id);
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
  }, [editingItem, adminRoutes, updateRoute, createRoute]);

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

  const getParentName = useCallback((parentId: string | null): string => {
    if (!parentId) return '';
    // Find parent in navigation structure
    const findParentInNavigation = (items: any[], id: string): string => {
      for (const group of items) {
        for (const item of group.children || []) {
          if (item.routeId === id) return item.name;
          if (item.children) {
            const found = findParentInNavigation([{ children: item.children }], id);
            if (found) return found;
          }
        }
      }
      return '';
    };
    return sitemap?.navigation ? findParentInNavigation(sitemap.navigation, parentId) : '';
  }, [sitemap?.navigation]);

  // Generate parent options from navigation structure
  const parentOptions = useMemo(() => {
    if (!sitemap?.navigation) return [];

    const options: Array<{
      id: string;
      name: string;
      path?: string;
      is_folder: boolean;
      parent_id: string | null;
      depth: number;
    }> = [];

    const processNavItem = (item: any, depth: number = 0, parentId: string | null = null) => {
      if (item.routeId) {
        options.push({
          id: item.routeId,
          name: item.name,
          path: item.to,
          is_folder: item.isFolder || false,
          parent_id: parentId,
          depth
        });

        // Process children
        if (item.children) {
          item.children.forEach((child: any) => 
            processNavItem(child, depth + 1, item.routeId)
          );
        }
      }
    };

    sitemap.navigation.forEach(navGroup => {
      navGroup.children.forEach((item: any) => processNavItem(item));
    });

    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, [sitemap?.navigation]);

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
        route={editingItem ? adminRoutes?.routes?.find(r => r.id === editingItem.id) || null : null}
        onSave={handleSaveRoute}
        preselectedParentId={preselectedParentId}
        parentOptions={parentOptions}
        parentOptionsLoading={isLoading}
      />
    </div>
  );
};

export default HierarchicalSitemapAdmin;
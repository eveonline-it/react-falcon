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
  useUpdateRouteFields,
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

  // API hooks - refetch function for refreshing data after changes
  const { refetch } = useSitemap();
  // Get admin routes for CRUD operations and tree structure
  const { data: adminRoutes, isLoading, error } = useSitemapRoutes();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const updateRouteFields = useUpdateRouteFields();
  const deleteRoute = useDeleteRoute();
  const createFolder = useCreateFolder();
  const moveItem = useMoveItem();
  const reorderRoutes = useReorderRoutes();

  // Memoized drag drop callbacks with stable dependencies
  const handleItemMove = useCallback(async (itemId: string, newParentId: string | null) => {
    try {
      await moveItem.mutateAsync({ itemId, newParentId });
      toast.success('Item moved successfully');
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Failed to move item');
    }
  }, [moveItem.mutateAsync]);

  const handleReorder = useCallback(async (items: Array<{ id: string; nav_order: number }>) => {
    try {
      // Transform items to match API format
      const updates = items.map((item: { id: string; nav_order: number }) => {
        // Find the corresponding route to get route_id
        const route = adminRoutes?.routes?.find(r => r.id === item.id);
        return {
          route_id: route?.route_id || item.id, // fallback to id if route_id not found
          nav_order: item.nav_order
        };
      });
      await reorderRoutes.mutateAsync({ updates });
      toast.success('Items reordered successfully');
    } catch (error) {
      console.error('Error reordering items:', error);
      toast.error('Failed to reorder items');
    }
  }, [adminRoutes?.routes, reorderRoutes.mutateAsync]);

  // Drag drop handler
  const [dragDropHandler, setDragDropHandler] = useState<HierarchicalDragDropHandler | null>(null);

  // Convert admin routes to tree data using direct folder-child matching
  const treeData = useMemo(() => {
    if (!adminRoutes?.routes) return [];

    // Create items map for quick lookup
    const itemMap = new Map<string, HierarchicalNavItem>();
    
    // First pass: Create all hierarchical items
    adminRoutes.routes.forEach((route) => {
      const hierarchicalItem: HierarchicalNavItem = {
        id: route.id,
        name: route.name || 'Unnamed',
        to: route.is_folder ? undefined : route.path,
        icon: route.icon || undefined,
        active: route.is_enabled !== false && route.show_in_nav !== false,
        is_folder: route.is_folder || false,
        parent_id: route.parent_id,
        nav_order: route.nav_order || 0,
        children: []
      };
      
      itemMap.set(route.id, hierarchicalItem);
    });

    // Second pass: Build hierarchy using folder route_id matching
    const rootItems: HierarchicalNavItem[] = [];
    const orphanedItems: HierarchicalNavItem[] = [];

    // Find all folders first
    const folders = adminRoutes.routes.filter(r => r.is_folder || r.type === 'folder');
    
    // For each folder, find its children by matching parent_id to folder's route_id
    folders.forEach(folder => {
      const folderItem = itemMap.get(folder.id)!;
      const children = adminRoutes.routes.filter(r => r.parent_id === folder.route_id);
      
      // Add children to folder
      children.forEach(child => {
        const childItem = itemMap.get(child.id);
        if (childItem) {
          if (!folderItem.children) {
            folderItem.children = [];
          }
          folderItem.children.push(childItem);
        }
      });

      // Add folder to root if it has no parent
      if (!folder.parent_id) {
        rootItems.push(folderItem);
      }
    });

    // Add non-folder root items and orphaned items
    adminRoutes.routes.forEach(route => {
      if (!route.is_folder && route.type !== 'folder') {
        const item = itemMap.get(route.id)!;
        
        if (!route.parent_id) {
          // Root level non-folder item
          rootItems.push(item);
        } else {
          // Check if parent exists among folders
          const parentFolder = folders.find(f => f.route_id === route.parent_id || f.id === route.parent_id);
          if (!parentFolder) {
            // Orphaned item - parent not found
            orphanedItems.push(item);
          }
        }
      }
    });

    // Add orphaned items to root
    rootItems.push(...orphanedItems);

    // Recursive sort by nav_order
    const sortItems = (items: HierarchicalNavItem[]) => {
      items.sort((a, b) => (a.nav_order || 0) - (b.nav_order || 0));
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortItems(item.children as HierarchicalNavItem[]);
        }
      });
    };

    sortItems(rootItems);

    return rootItems;
  }, [adminRoutes?.routes]);

  // Initialize drag drop handler with stable dependencies
  useEffect(() => {
    const context: HierarchicalDragDropContext = {
      treeData,
      onItemMove: handleItemMove,
      onReorder: handleReorder
    };

    setDragDropHandler(createHierarchicalDragDropHandler(context));
  }, [treeData, handleItemMove, handleReorder]);

  // Recursive function to check if item or any descendant matches search
  const itemMatchesSearch = useCallback((item: HierarchicalNavItem, term: string): boolean => {
    if (term === '') return true;
    
    const termLower = term.toLowerCase();
    const nameMatches = item.name.toLowerCase().includes(termLower);
    const pathMatches = item.to && item.to.toLowerCase().includes(termLower);
    
    if (nameMatches || pathMatches) return true;
    
    // Check if any child matches
    if (item.children && item.children.length > 0) {
      return (item.children as HierarchicalNavItem[]).some(child => itemMatchesSearch(child, term));
    }
    
    return false;
  }, []);

  // Recursive function to filter tree data while preserving hierarchy
  const filterTreeData = useCallback((items: HierarchicalNavItem[]): HierarchicalNavItem[] => {
    return items
      .filter(item => itemMatchesSearch(item, searchTerm))
      .map(item => ({
        ...item,
        children: item.children ? filterTreeData(item.children as HierarchicalNavItem[]) : []
      }));
  }, [searchTerm, itemMatchesSearch]);

  // Apply hierarchical filtering
  const filteredTreeData = useMemo(() => {
    return filterTreeData(treeData);
  }, [treeData, filterTreeData]);

  // Recursive functions to count all items in hierarchy
  const countAllItems = useCallback((items: HierarchicalNavItem[]): number => {
    return items.reduce((count, item) => {
      const childCount = item.children ? countAllItems(item.children as HierarchicalNavItem[]) : 0;
      return count + 1 + childCount;
    }, 0);
  }, []);

  const countItemsByCondition = useCallback((items: HierarchicalNavItem[], condition: (item: HierarchicalNavItem) => boolean): number => {
    return items.reduce((count, item) => {
      const thisCount = condition(item) ? 1 : 0;
      const childCount = item.children ? countItemsByCondition(item.children as HierarchicalNavItem[], condition) : 0;
      return count + thisCount + childCount;
    }, 0);
  }, []);

  // Calculate comprehensive stats
  const hierarchicalStats = useMemo(() => {
    const totalItems = countAllItems(treeData);
    const totalFolders = countItemsByCondition(treeData, item => Boolean(item.is_folder));
    const activeRoutes = countItemsByCondition(treeData, item => !item.is_folder && Boolean(item.active));
    const disabledRoutes = countItemsByCondition(treeData, item => !item.is_folder && !Boolean(item.active));
    
    return { totalItems, totalFolders, activeRoutes, disabledRoutes };
  }, [treeData, countAllItems, countItemsByCondition]);

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
        // Refresh the data to show the updated order
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
    try {
      const originalRoute = adminRoutes?.routes?.find(r => r.id === item.id);
      if (originalRoute) {
        await updateRouteFields.mutateAsync({
          id: originalRoute.id,
          fields: {
            is_enabled: !originalRoute.is_enabled
          }
        });
        toast.success(`${originalRoute.is_folder ? 'Folder' : 'Route'} ${originalRoute.is_enabled ? 'disabled' : 'enabled'} successfully`);
        // Clear cache and refresh navigation
        sitemapService.clearCache();
        refetch();
      }
    } catch (error) {
      toast.error('Failed to toggle item status');
    }
  }, [adminRoutes, updateRouteFields, refetch]);

  const handleCreateFolder = useCallback((parentId?: string) => {
    setParentForFolder(parentId || null);
    setShowFolderModal(true);
  }, []);

  const handleSaveFolder = useCallback(async (folderData: FolderFormData) => {
    try {
      if (editingItem) {
        // Update existing folder using the same endpoint as routes
        const originalRoute = adminRoutes?.routes?.find(r => r.id === editingItem.id);
        if (originalRoute) {
          // Filter out computed/read-only fields
          const { 
            route_id, 
            is_folder, 
            ...editableFields 
          } = originalRoute;
          
          await updateRoute.mutateAsync({
            ...editableFields,
            ...folderData,
            id: originalRoute.id,
            route_id: originalRoute.route_id,
            is_folder: originalRoute.is_folder
          });
          toast.success('Folder updated successfully');
        }
      } else {
        // Create new folder
        await createFolder.mutateAsync({
          name: folderData.name,
          parent_id: folderData.parent_id,
          icon: folderData.icon
        });
        toast.success('Folder created successfully');
      }
      
      setShowFolderModal(false);
      setParentForFolder(null);
      setEditingItem(null);
      sitemapService.clearCache();
    } catch (error) {
      toast.error(editingItem ? 'Failed to update folder' : 'Failed to create folder');
    }
  }, [editingItem, adminRoutes, createFolder, updateRoute]);

  const handleSaveRoute = useCallback(async (routeData: RouteFormData) => {
    try {
      if (editingItem) {
        // Find the original route data for update
        const originalRoute = adminRoutes?.routes?.find(r => r.id === editingItem.id);
        if (originalRoute) {
          // Filter out computed/read-only fields
          const { 
            route_id, 
            is_folder, 
            ...editableFields 
          } = originalRoute;
          
          await updateRoute.mutateAsync({
            ...editableFields,
            ...routeData,
            id: originalRoute.id,
            route_id: originalRoute.route_id,
            is_folder: originalRoute.is_folder
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
          collectIds(item.children as HierarchicalNavItem[]);
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
    if (!parentId || !adminRoutes?.routes) return '';
    // Find parent in admin routes
    const parent = adminRoutes.routes.find(route => 
      route.id === parentId || route.route_id === parentId
    );
    return parent?.name || '';
  }, [adminRoutes?.routes]);

  // Generate parent options from admin routes
  const parentOptions = useMemo(() => {
    if (!adminRoutes?.routes) return [];

    // Only include folders and root routes as potential parents
    const potentialParents = adminRoutes.routes.filter(route => 
      route.is_folder || route.parent_id === null
    );

    const options = potentialParents.map(route => ({
      id: route.id,
      name: route.name || 'Unnamed',
      path: route.path,
      is_folder: route.is_folder || false,
      parent_id: route.parent_id,
      depth: 0 // Calculate depth if needed, or use 0 as default
    }));

    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, [adminRoutes?.routes]);

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
        <Button variant="outline-danger" onClick={() => window.location.reload()} className="mt-2">
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
              <h3>{hierarchicalStats.totalItems}</h3>
              <small>Total Items</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 bg-info text-white">
            <Card.Body className="text-center">
              <h3>{hierarchicalStats.totalFolders}</h3>
              <small>Folders</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 bg-success text-white">
            <Card.Body className="text-center">
              <h3>{hierarchicalStats.activeRoutes}</h3>
              <small>Active Routes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 bg-secondary text-white">
            <Card.Body className="text-center">
              <h3>{hierarchicalStats.disabledRoutes}</h3>
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
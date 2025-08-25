import React, { useState } from 'react';
import { Card, Badge, Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FolderItem, HierarchicalNavItem } from '../../services/sitemapService';
import { SitemapRoute } from '../../hooks/admin/useSitemap';

interface SitemapTreeViewProps {
  treeData: HierarchicalNavItem[];
  onEdit: (item: HierarchicalNavItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleEnabled: (item: HierarchicalNavItem) => void;
  onCreateFolder: (parentId?: string) => void;
  onDragEnd: (result: DropResult) => void;
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}

interface TreeItemProps {
  item: HierarchicalNavItem;
  index: number;
  depth: number;
  onEdit: (item: HierarchicalNavItem) => void;
  onDelete: (id: string, name: string) => void;
  onToggleEnabled: (item: HierarchicalNavItem) => void;
  onCreateFolder: (parentId?: string) => void;
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  index,
  depth,
  onEdit,
  onDelete,
  onToggleEnabled,
  onCreateFolder,
  expandedItems,
  onToggleExpand
}) => {
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.is_folder;

  const getItemIcon = () => {
    if (isFolder) {
      return hasChildren && isExpanded ? 'folder-open' : 'folder';
    }
    return item.icon || 'file-alt';
  };

  const getStatusBadge = () => {
    if (isFolder) {
      return (
        <Badge bg="info" className="ms-2">
          Folder
        </Badge>
      );
    }
    
    if (item.active === false) {
      return (
        <Badge bg="secondary" className="ms-2">
          Disabled
        </Badge>
      );
    }
    
    return (
      <Badge bg="success" className="ms-2">
        Active
      </Badge>
    );
  };

  return (
    <>
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`sitemap-tree-item ${snapshot.isDragging ? 'dragging' : ''}`}
            style={{
              ...provided.draggableProps.style,
              marginLeft: `${depth * 24}px`,
            }}
          >
            <Card className={`mb-2 ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}`}>
              <Card.Body className="py-2 px-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center flex-grow-1">
                    {/* Drag handle */}
                    <div
                      {...provided.dragHandleProps}
                      className="drag-handle me-2 text-muted"
                      title="Drag to reorder"
                    >
                      <FontAwesomeIcon icon="grip-vertical" />
                    </div>

                    {/* Expand/collapse button for items with children */}
                    {hasChildren ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 me-2 text-muted"
                        onClick={() => onToggleExpand(item.id)}
                      >
                        <FontAwesomeIcon 
                          icon={isExpanded ? 'chevron-down' : 'chevron-right'} 
                          size="sm"
                        />
                      </Button>
                    ) : (
                      <div className="me-2" style={{ width: '16px' }} />
                    )}

                    {/* Item icon */}
                    <FontAwesomeIcon 
                      icon={getItemIcon()} 
                      className={`me-2 ${isFolder ? 'text-primary' : 'text-info'}`}
                    />

                    {/* Item name and path */}
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center">
                        <strong className="me-2">{item.name}</strong>
                        {getStatusBadge()}
                        {item.badge && (
                          <Badge 
                            bg={item.badge.type === 'success' ? 'success' : 'warning'} 
                            className="ms-2"
                          >
                            {item.badge.text}
                          </Badge>
                        )}
                      </div>
                      {!isFolder && item.to && (
                        <small className="text-muted">{item.to}</small>
                      )}
                      {hasChildren && (
                        <small className="text-muted">
                          {item.children!.length} item{item.children!.length !== 1 ? 's' : ''}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <ButtonGroup size="sm">
                    {isFolder && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onCreateFolder(item.id)}
                        title="Add subfolder"
                      >
                        <FontAwesomeIcon icon="folder-plus" />
                      </Button>
                    )}
                    
                    {!isFolder && (
                      <Button
                        variant={item.active ? "outline-secondary" : "outline-success"}
                        size="sm"
                        onClick={() => onToggleEnabled(item)}
                        title={item.active ? "Disable" : "Enable"}
                      >
                        <FontAwesomeIcon icon={item.active ? "eye-slash" : "eye"} />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon="edit" />
                    </Button>
                    
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${item.id}`}>
                        <FontAwesomeIcon icon="ellipsis-v" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {isFolder && (
                          <>
                            <Dropdown.Item onClick={() => onCreateFolder(item.id)}>
                              <FontAwesomeIcon icon="folder-plus" className="me-2" />
                              Add Subfolder
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {/* TODO: Add route to folder */}}>
                              <FontAwesomeIcon icon="plus" className="me-2" />
                              Add Route
                            </Dropdown.Item>
                            <Dropdown.Divider />
                          </>
                        )}
                        <Dropdown.Item onClick={() => onEdit(item)}>
                          <FontAwesomeIcon icon="edit" className="me-2" />
                          Edit {isFolder ? 'Folder' : 'Route'}
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          className="text-danger"
                          onClick={() => onDelete(item.id, item.name)}
                        >
                          <FontAwesomeIcon icon="trash" className="me-2" />
                          Delete {isFolder ? 'Folder' : 'Route'}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </ButtonGroup>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </Draggable>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <Droppable droppableId={`children-${item.id}`} type="TREE_ITEM">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {item.children!.map((child, childIndex) => (
                <TreeItem
                  key={child.id}
                  item={child}
                  index={childIndex}
                  depth={depth + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleEnabled={onToggleEnabled}
                  onCreateFolder={onCreateFolder}
                  expandedItems={expandedItems}
                  onToggleExpand={onToggleExpand}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </>
  );
};

const SitemapTreeView: React.FC<SitemapTreeViewProps> = ({
  treeData,
  onEdit,
  onDelete,
  onToggleEnabled,
  onCreateFolder,
  onDragEnd,
  expandedItems,
  onToggleExpand
}) => {
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    setDraggedOverId(null);
    onDragEnd(result);
  };

  const handleDragOver = (draggedOverId: string | null) => {
    setDraggedOverId(draggedOverId);
  };

  if (!treeData || treeData.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <FontAwesomeIcon icon="folder-open" size="3x" className="text-muted mb-3" />
          <h5 className="text-muted">No routes or folders found</h5>
          <p className="text-muted mb-4">
            Create your first folder or route to get started with hierarchical navigation.
          </p>
          <Button variant="primary" onClick={() => onCreateFolder()}>
            <FontAwesomeIcon icon="folder-plus" className="me-2" />
            Create Root Folder
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="sitemap-tree-view">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="root" type="TREE_ITEM">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className={`tree-container ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            >
              {treeData.map((item, index) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  index={index}
                  depth={0}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleEnabled={onToggleEnabled}
                  onCreateFolder={onCreateFolder}
                  expandedItems={expandedItems}
                  onToggleExpand={onToggleExpand}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SitemapTreeView;
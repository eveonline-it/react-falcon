import { DropResult } from '@hello-pangea/dnd';
import { HierarchicalNavItem } from 'services/sitemapService';

export interface ReorderResult {
  updatedTree: HierarchicalNavItem[];
  movedItem: HierarchicalNavItem;
  newParentId: string | null;
  newOrder: number;
  needsApiUpdate: boolean;
}

export interface DragDropContext {
  treeData: HierarchicalNavItem[];
  onItemMove: (itemId: string, newParentId: string | null, newOrder: number) => Promise<void>;
  onReorder: (items: Array<{ id: string; nav_order: number; parent_id: string | null }>) => Promise<void>;
}

/**
 * Handles drag and drop reordering in hierarchical tree structures
 */
export class HierarchicalDragDropHandler {
  private context: DragDropContext;

  constructor(context: DragDropContext) {
    this.context = context;
  }

  /**
   * Main handler for drag drop events
   */
  async handleDragEnd(result: DropResult): Promise<ReorderResult | null> {
    const { destination, source, draggableId } = result;

    // No destination means the item was dropped outside any droppable area
    if (!destination) {
      return null;
    }

    // No change in position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return null;
    }

    try {
      const reorderResult = this.calculateReorder(result);
      
      if (reorderResult.needsApiUpdate) {
        // Handle different types of moves
        if (this.isParentChange(result)) {
          await this.context.onItemMove(
            draggableId,
            reorderResult.newParentId,
            reorderResult.newOrder
          );
        } else {
          await this.handleReorder(reorderResult);
        }
      }

      return reorderResult;
    } catch (error) {
      console.error('Error handling drag drop:', error);
      throw error;
    }
  }

  /**
   * Calculates the new tree structure after a drag drop operation
   */
  private calculateReorder(result: DropResult): ReorderResult {
    const { destination, source, draggableId } = result;
    const { treeData } = this.context;

    // Find the moved item
    const movedItem = this.findItemById(treeData, draggableId);
    if (!movedItem) {
      throw new Error(`Item ${draggableId} not found in tree`);
    }

    // Determine new parent ID from droppable ID
    const newParentId = this.getParentIdFromDroppableId(destination!.droppableId);
    const sourceParentId = this.getParentIdFromDroppableId(source.droppableId);

    // Validate the move before proceeding
    if (!this.isValidMove(treeData, draggableId, newParentId)) {
      throw new Error(`Invalid move: cannot move item ${draggableId} to parent ${newParentId}`);
    }

    // Create updated tree
    const updatedTree = this.moveItemInTree(
      treeData,
      draggableId,
      sourceParentId,
      newParentId,
      destination!.index
    );

    // Calculate new order based on position
    const newOrder = this.calculateNewOrder(
      updatedTree,
      newParentId,
      destination!.index
    );

    return {
      updatedTree,
      movedItem,
      newParentId,
      newOrder,
      needsApiUpdate: true
    };
  }

  /**
   * Moves an item within the tree structure
   */
  private moveItemInTree(
    tree: HierarchicalNavItem[],
    itemId: string,
    sourceParentId: string | null,
    targetParentId: string | null,
    targetIndex: number
  ): HierarchicalNavItem[] {
    // Deep clone the tree
    const updatedTree = this.deepCloneTree(tree);
    
    // Remove item from its current location
    const itemToMove = this.removeItemFromTree(updatedTree, itemId);
    if (!itemToMove) {
      throw new Error(`Failed to remove item ${itemId} from tree`);
    }

    // Update item's parent_id
    itemToMove.parent_id = targetParentId;

    // Insert item at new location
    this.insertItemInTree(updatedTree, itemToMove, targetParentId, targetIndex);

    // Recalculate nav_order for affected siblings
    this.updateSiblingOrders(updatedTree, targetParentId);
    if (sourceParentId !== targetParentId && sourceParentId) {
      this.updateSiblingOrders(updatedTree, sourceParentId);
    }

    return updatedTree;
  }

  /**
   * Removes an item from the tree and returns it
   */
  private removeItemFromTree(
    tree: HierarchicalNavItem[],
    itemId: string
  ): HierarchicalNavItem | null {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === itemId) {
        return tree.splice(i, 1)[0];
      }
      if (tree[i].children) {
        const found = this.removeItemFromTree(tree[i].children!, itemId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Inserts an item at the specified location in the tree
   */
  private insertItemInTree(
    tree: HierarchicalNavItem[],
    item: HierarchicalNavItem,
    parentId: string | null,
    index: number
  ): void {
    if (parentId === null) {
      // Insert at root level
      tree.splice(index, 0, item);
    } else {
      // Find parent and insert as child
      const parent = this.findItemById(tree, parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.splice(index, 0, item);
      }
    }
  }

  /**
   * Updates nav_order for all siblings of a given parent
   */
  private updateSiblingOrders(
    tree: HierarchicalNavItem[],
    parentId: string | null
  ): void {
    const siblings = parentId === null 
      ? tree 
      : this.findItemById(tree, parentId)?.children || [];

    siblings.forEach((item, index) => {
      item.nav_order = index * 10; // Use increments of 10 for easy reordering
    });
  }

  /**
   * Calculates the new nav_order for an item based on its position
   */
  private calculateNewOrder(
    tree: HierarchicalNavItem[],
    parentId: string | null,
    index: number
  ): number {
    const siblings = parentId === null 
      ? tree 
      : this.findItemById(tree, parentId)?.children || [];

    if (siblings.length === 0) return 0;
    if (index === 0) return Math.max(0, (siblings[0]?.nav_order || 0) - 10);
    if (index >= siblings.length) return (siblings[siblings.length - 1]?.nav_order || 0) + 10;

    // Insert between two items
    const prevOrder = siblings[index - 1]?.nav_order || 0;
    const nextOrder = siblings[index]?.nav_order || 0;
    return Math.floor((prevOrder + nextOrder) / 2);
  }

  /**
   * Checks if the drop operation involves changing parents
   */
  private isParentChange(result: DropResult): boolean {
    const sourceParentId = this.getParentIdFromDroppableId(result.source.droppableId);
    const targetParentId = this.getParentIdFromDroppableId(result.destination!.droppableId);
    return sourceParentId !== targetParentId;
  }

  /**
   * Extracts parent ID from droppable ID
   */
  private getParentIdFromDroppableId(droppableId: string): string | null {
    if (droppableId === 'root') return null;
    if (droppableId.startsWith('children-')) {
      return droppableId.replace('children-', '');
    }
    return null;
  }

  /**
   * Finds an item by ID in the tree structure
   */
  private findItemById(
    tree: HierarchicalNavItem[],
    id: string
  ): HierarchicalNavItem | null {
    for (const item of tree) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Deep clones the tree structure
   */
  private deepCloneTree(tree: HierarchicalNavItem[]): HierarchicalNavItem[] {
    return JSON.parse(JSON.stringify(tree));
  }

  /**
   * Handles reordering within the same parent
   */
  private async handleReorder(reorderResult: ReorderResult): Promise<void> {
    const { newParentId, updatedTree } = reorderResult;
    
    // Get all siblings that need order updates
    const siblings = newParentId === null 
      ? updatedTree 
      : this.findItemById(updatedTree, newParentId)?.children || [];

    const reorderItems = siblings.map(item => ({
      id: item.id,
      nav_order: item.nav_order || 0,
      parent_id: item.parent_id
    }));

    await this.context.onReorder(reorderItems);
  }

  /**
   * Validates if a move is allowed (prevents circular references)
   */
  public isValidMove(
    tree: HierarchicalNavItem[],
    itemId: string,
    targetParentId: string | null
  ): boolean {
    if (targetParentId === null) return true; // Moving to root is always valid
    if (itemId === targetParentId) return false; // Can't be parent of itself

    // Check if target parent is a descendant of the item being moved
    const item = this.findItemById(tree, itemId);
    if (!item) return false;

    return !this.isDescendant(item, targetParentId);
  }

  /**
   * Checks if a given ID is a descendant of an item
   */
  private isDescendant(item: HierarchicalNavItem, targetId: string): boolean {
    if (!item.children) return false;

    for (const child of item.children) {
      if (child.id === targetId) return true;
      if (this.isDescendant(child, targetId)) return true;
    }

    return false;
  }
}

/**
 * Utility function to create a drag drop handler
 */
export const createHierarchicalDragDropHandler = (
  context: DragDropContext
): HierarchicalDragDropHandler => {
  return new HierarchicalDragDropHandler(context);
};
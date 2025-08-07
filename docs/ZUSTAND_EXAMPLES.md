# Zustand Implementation Examples

## Overview
This document provides examples of how Zustand has been integrated into React Falcon for performance-critical state management, following the dependency injection pattern with Context.

**📋 DevTools Guide:** `docs/ZUSTAND_DEVTOOLS_GUIDE.md` - Complete debugging and development workflow

## Kanban Feature - Zustand Store Implementation

### Store Definition (`src/stores/kanbanStore.js`)

```javascript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useKanbanStore = create(
  devtools(
    (set, get) => ({
      // State
      kanbanItems: [...],
      kanbanModal: { show: false, modalContent: {} },
      cardHeight: 0,
      
      // Actions - optimized for performance
      addTaskCard: (targetListId, newCard) =>
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.map((kanbanItem) =>
              kanbanItem.id === targetListId
                ? { ...kanbanItem, items: [...kanbanItem.items, newCard] }
                : kanbanItem
            )
          }),
          false,
          'addTaskCard' // Action name for devtools
        ),
        
      // Drag & drop optimizations
      updateDualColumn: (sourceColumn, destColumn, sourceItems, destItems) =>
        set(
          (state) => ({
            kanbanItems: state.kanbanItems.map((kanbanItem) => {
              if (kanbanItem.id === sourceColumn.id) {
                return { ...kanbanItem, items: sourceItems };
              } else if (kanbanItem.id === destColumn.id) {
                return { ...kanbanItem, items: destItems };
              }
              return kanbanItem;
            })
          }),
          false,
          'updateDualColumn'
        ),
    }),
    {
      name: 'kanban-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);
```

### Context Provider Integration (`src/providers/KanbanProvider.jsx`)

Following the dependency injection pattern:

```javascript
import React, { createContext, use, useState } from 'react';
import { useKanbanStore } from 'stores/kanbanStore';

export const KanbanContext = createContext(null);

const KanbanProvider = ({ children, initialData = null }) => {
  // Provide access to the Zustand store through Context
  const [store] = useState(() => useKanbanStore);

  return (
    <KanbanContext.Provider value={store}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanbanContext = () => {
  const store = use(KanbanContext);
  if (!store) {
    throw new Error('useKanbanContext must be used within KanbanProvider');
  }
  return store();
};

// Alternative hook for direct store access
export const useKanban = () => useKanbanStore();

export default KanbanProvider;
```

### Component Usage Examples

#### Selective State Subscription (Performance Optimized)

```javascript
// TaskCard.jsx - Only subscribe to needed state slices
const TaskCard = ({ task }) => {
  // Only re-renders when these specific values change
  const openKanbanModal = useKanbanContext(state => state.openKanbanModal);
  const currentUser = useKanbanContext(state => state.currentUser);
  const removeTaskCard = useKanbanContext(state => state.removeTaskCard);
  
  const handleModalOpen = () => {
    openKanbanModal(image);
  };
  
  const handleRemove = () => {
    removeTaskCard(task.id);
  };
  
  return (
    <Card onClick={handleModalOpen}>
      {/* Component content */}
    </Card>
  );
};
```

#### Drag & Drop Performance Optimization

```javascript
// KanbanContainer.jsx - Optimized drag operations
const KanbanContainer = () => {
  const kanbanItems = useKanbanContext(state => state.kanbanItems);
  const updateDualColumn = useKanbanContext(state => state.updateDualColumn);
  const updateSingleColumn = useKanbanContext(state => state.updateSingleColumn);
  
  const handleDragEnd = ({ active, over }) => {
    // Direct action calls - no reducer dispatch overhead
    if (activeColumnId === overColumnId) {
      updateSingleColumn(column, reorderedItems);
    } else {
      updateDualColumn(sourceColumn, destColumn, sourceItems, destItems);
    }
  };
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Drag and drop components */}
    </DndContext>
  );
};
```

## Key Benefits Achieved

### 1. Performance Improvements
- **Selective subscriptions**: Components only re-render when their specific state slices change
- **Optimized updates**: Direct state mutations without reducer overhead
- **DevTools integration**: Full debugging support in development

### 2. Better Developer Experience
- **Type safety**: Full TypeScript support (when using TypeScript)
- **Action creators**: Exported actions for easier testing
- **Clear separation**: Context for dependency injection, Zustand for state management

### 3. Maintained Compatibility
- **Existing patterns**: Context wrapper maintains existing component API
- **Migration path**: Easy to migrate other complex features
- **Coexistence**: Works alongside existing Context providers

## Migration Checklist

When migrating complex Context providers to Zustand:

1. ✅ **Identify performance bottlenecks**
   - Complex state updates
   - Frequent re-renders
   - Heavy computational logic

2. ✅ **Create Zustand store**
   - Define state shape
   - Implement actions
   - Add devtools integration

3. ✅ **Update Context provider**
   - Keep Context for dependency injection
   - Provide Zustand store through Context
   - Maintain existing hook API

4. ✅ **Update components gradually**
   - Replace useContext with selective subscriptions
   - Replace dispatch calls with direct action calls
   - Test performance improvements

5. ✅ **Add documentation and examples**
   - Usage patterns
   - Migration guide
   - Performance best practices

## When to Use Zustand vs Context

### Use Zustand when:
- ✅ Complex state logic with frequent updates
- ✅ Performance-critical operations (drag & drop, real-time updates)
- ✅ Large state objects with many subscribers
- ✅ Need for advanced debugging and devtools

### Keep Context when:
- ✅ Simple configuration state
- ✅ Authentication/authorization state
- ✅ Theme and layout settings
- ✅ Dependency injection for services/utilities

## Testing Zustand Stores

```javascript
// Example test for Kanban store
import { renderHook, act } from '@testing-library/react';
import { useKanbanStore } from 'stores/kanbanStore';

test('should add task card to correct column', () => {
  const { result } = renderHook(() => useKanbanStore());
  
  act(() => {
    result.current.addTaskCard(1, { id: 123, title: 'New Task' });
  });
  
  const column = result.current.kanbanItems.find(col => col.id === 1);
  expect(column.items).toHaveLength(1);
  expect(column.items[0].title).toBe('New Task');
});
```

This approach provides the performance benefits of Zustand while maintaining the architectural patterns and developer experience of the existing Context-based system.
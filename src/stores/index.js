/**
 * Zustand Stores Index
 * Central export point for all stores and development helpers
 */

import { useKanbanStore, kanbanActions } from './kanbanStore';

// Export all stores
export { useKanbanStore, kanbanActions };

// Development helpers (only available in development)
if (process.env.NODE_ENV === 'development') {
  // Make stores available in browser console for debugging
  window.__stores = {
    kanban: useKanbanStore,
  };

  // Make actions available in console
  window.__actions = {
    kanban: kanbanActions,
  };

  // Helper functions for debugging
  window.__storeHelpers = {
    // Get current state of all stores
    getAllState: () => ({
      kanban: useKanbanStore.getState(),
    }),

    // Subscribe to all store changes
    subscribeToAll: (callback) => {
      const unsubscribes = [];
      
      unsubscribes.push(
        useKanbanStore.subscribe((state) => 
          callback('kanban', state)
        )
      );

      // Return cleanup function
      return () => unsubscribes.forEach(fn => fn());
    },

    // Reset all stores to initial state
    resetAllStores: () => {
      useKanbanStore.getState().resetKanbanState();
      console.log('All stores reset to initial state');
    },

    // Log current state of all stores
    logAllStates: () => {
      console.group('📊 Current Store States');
      console.log('Kanban Store:', useKanbanStore.getState());
      console.groupEnd();
    },
  };

  console.log('🔧 Zustand DevTools loaded. Available helpers:');
  console.log('- window.__stores (direct store access)');
  console.log('- window.__actions (action creators)');
  console.log('- window.__storeHelpers (debugging utilities)');
}
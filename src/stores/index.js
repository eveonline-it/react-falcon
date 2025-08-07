/**
 * Zustand Stores Index
 * Central export point for all stores and development helpers
 */

import { useKanbanStore, kanbanActions } from './kanbanStore';
import { useAuthStore, authActions } from './authStore';

// Export all stores
export { 
  useKanbanStore, 
  kanbanActions,
  useAuthStore,
  authActions
};

// Development helpers (only available in development)
if (process.env.NODE_ENV === 'development') {
  // Initialize store immediately to ensure DevTools detection
  const initializeStores = () => {
    useKanbanStore.getState();
    useAuthStore.getState();
  };
  initializeStores();

  // Make stores available in browser console for debugging
  window.__stores = {
    kanban: useKanbanStore,
    auth: useAuthStore,
  };

  // Make actions available in console
  window.__actions = {
    kanban: kanbanActions,
    auth: authActions,
  };

  // Helper functions for debugging
  window.__storeHelpers = {
    // Get current state of all stores
    getAllState: () => ({
      kanban: useKanbanStore.getState(),
      auth: useAuthStore.getState(),
    }),

    // Subscribe to all store changes
    subscribeToAll: (callback) => {
      const unsubscribes = [];
      
      unsubscribes.push(
        useKanbanStore.subscribe((state) => 
          callback('kanban', state)
        ),
        useAuthStore.subscribe((state) => 
          callback('auth', state)
        )
      );

      // Return cleanup function
      return () => unsubscribes.forEach(fn => fn());
    },

    // Reset all stores to initial state
    resetAllStores: () => {
      useKanbanStore.getState().resetKanbanState();
      useAuthStore.getState().resetAuthState();
      console.log('All stores reset to initial state');
    },

    // Log current state of all stores
    logAllStates: () => {
      console.group('📊 Current Store States');
      console.log('Kanban Store:', useKanbanStore.getState());
      console.log('Auth Store:', useAuthStore.getState());
      console.groupEnd();
    },
  };

  // Test authentication function
  window.__testEveAuth = (authResponse) => {
    console.log('🧪 Testing EVE authentication with provided data...');
    
    if (!authResponse) {
      console.error('❌ No auth response provided. Use: window.__testEveAuth(yourAuthData)');
      return;
    }
    
    import('../utils/authUtils').then(({ processEveAuthResponse }) => {
      processEveAuthResponse(authResponse).then(success => {
        if (success) {
          console.log('✅ Authentication test successful!');
          console.log('Current auth state:', useAuthStore.getState());
        } else {
          console.log('❌ Authentication test failed');
        }
      });
    });
  };

  // Direct login test function (bypasses utility)
  window.__directAuthTest = (authResponse) => {
    console.log('🔧 Direct auth store test...');
    
    if (!authResponse) {
      console.error('❌ No auth response provided');
      return;
    }

    const { authenticated, character_name, permissions, user_id, characters } = authResponse;
    
    if (!authenticated) {
      console.error('❌ Not authenticated');
      return;
    }

    const userData = {
      id: user_id,
      characterName: character_name,
      displayName: character_name,
      name: character_name
    };

    console.log('📦 Calling store.login directly...');
    useAuthStore.getState().login(userData, null, null, 'eve-online');
    
    console.log('🔑 Setting permissions...');
    useAuthStore.getState().updatePermissions(permissions || []);
    
    const state = useAuthStore.getState();
    console.log('🏪 Final state:', {
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      permissions: state.permissions
    });
  };

  console.log('🔧 Zustand DevTools loaded. Available helpers:');
  console.log('- window.__stores (direct store access)');
  console.log('- window.__actions (action creators)');
  console.log('- window.__storeHelpers (debugging utilities)');
  console.log('- window.__testEveAuth(authData) (test EVE authentication)');
  console.log('- window.__directAuthTest(authData) (direct store test)');
  console.log('📦 Available stores: kanban, auth');
}
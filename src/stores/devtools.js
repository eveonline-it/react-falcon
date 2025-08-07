/**
 * Zustand DevTools Configuration
 * Enhanced development experience for state debugging
 */

// Check if Redux DevTools Extension is available
export const isDevToolsAvailable = () => {
  return (
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION__
  );
};

// Enhanced devtools configuration
export const createDevToolsConfig = (storeName) => ({
  name: storeName,
  enabled: process.env.NODE_ENV === 'development' && isDevToolsAvailable(),
  
  // Serialization options for complex objects
  serialize: {
    options: {
      undefined: true,
      function: true,
      symbol: true,
    },
    // Custom serializer for large objects
    replacer: (key, value) => {
      // Don't serialize large arrays in devtools (performance)
      if (Array.isArray(value) && value.length > 100) {
        return `[Array(${value.length})]`;
      }
      // Don't serialize functions in devtools
      if (typeof value === 'function') {
        return '[Function]';
      }
      return value;
    },
  },
  
  // Action sanitizer - clean up action names for better debugging
  actionSanitizer: (action) => ({
    ...action,
    type: action.type || 'zustand-action',
  }),
  
  // State sanitizer - clean up state for better debugging
  stateSanitizer: (state) => {
    // Create a clean copy for devtools
    const cleanState = { ...state };
    
    // Remove functions from state display
    Object.keys(cleanState).forEach(key => {
      if (typeof cleanState[key] === 'function') {
        delete cleanState[key];
      }
    });
    
    return cleanState;
  },
});

// Development helper to log store actions
export const createActionLogger = (storeName) => {
  if (process.env.NODE_ENV !== 'development') {
    return () => {};
  }
  
  return (actionName, prevState, nextState) => {
    const timestamp = new Date().toLocaleTimeString();
    const stateChanged = JSON.stringify(prevState) !== JSON.stringify(nextState);
    
    if (stateChanged) {
      console.group(`🔄 ${storeName} - ${actionName} @ ${timestamp}`);
      console.log('Previous State:', prevState);
      console.log('Next State:', nextState);
      console.groupEnd();
    }
  };
};

// Helper to track store performance
export const createPerformanceTracker = (storeName) => {
  if (process.env.NODE_ENV !== 'development') {
    return {
      start: () => {},
      end: () => {},
    };
  }
  
  let startTime;
  
  return {
    start: (actionName) => {
      startTime = performance.now();
    },
    end: (actionName) => {
      const duration = performance.now() - startTime;
      if (duration > 10) { // Log slow actions (>10ms)
        console.warn(`⚡ Slow ${storeName} action: ${actionName} took ${duration.toFixed(2)}ms`);
      }
    },
  };
};
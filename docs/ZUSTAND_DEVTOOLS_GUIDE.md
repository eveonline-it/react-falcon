# Zustand DevTools Guide

## Overview
React Falcon includes comprehensive Zustand DevTools integration for enhanced debugging and development experience.

## Setup

### Prerequisites
1. **Install Redux DevTools Extension** in your browser:
   - [Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
   - [Edge Extension](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei)

2. **Development Mode**: DevTools are automatically enabled in development mode (`NODE_ENV === 'development'`)

### Enhanced Configuration
React Falcon includes enhanced devtools configuration in `src/stores/devtools.js`:

```javascript
import { createDevToolsConfig } from 'stores/devtools';

export const useKanbanStore = create(
  devtools(
    (set, get) => ({ /* store implementation */ }),
    createDevToolsConfig('kanban-store')
  )
);
```

## Features

### 1. **Action Tracking**
All Zustand actions are tracked with meaningful names:

```javascript
// Actions appear in devtools with clear names
openKanbanModal(image)     // → "openKanbanModal"
updateDualColumn(...)      // → "updateDualColumn"
addTaskCard(...)          // → "addTaskCard"
```

### 2. **Performance Monitoring**
Automatic performance tracking for slow actions:

```javascript
// Console warnings for actions taking >10ms
⚡ Slow Kanban Store action: updateDualColumn took 15.23ms
```

### 3. **Action Logging**
Development console logging for state changes:

```javascript
🔄 Kanban Store - updateSingleColumn @ 10:30:45 AM
  Previous State: { kanbanItems: [...] }
  Next State: { kanbanItems: [...] }
```

### 4. **State Sanitization**
Clean state display in devtools:
- Functions are hidden from state view
- Large arrays are summarized as `[Array(100)]`
- Complex objects are serialized appropriately

## Using DevTools

### 1. **Open DevTools**
1. Open your browser's developer tools (F12)
2. Navigate to the **Redux** tab
3. Select the store (e.g., "kanban-store")

### 2. **Action Inspector**
- **Left Panel**: List of all dispatched actions
- **Right Panel**: Action details, state diff, and full state
- **Time Travel**: Click any action to jump to that state

### 3. **State Diff**
View exactly what changed in each action:
```javascript
// Example diff view
@@UPDATE_DUAL_COLUMN
- kanbanItems[0].items: [task1, task2, task3]
+ kanbanItems[0].items: [task1, task3]
+ kanbanItems[1].items: [task2, task4]
```

### 4. **Time Travel Debugging**
- Click any action in the left panel to jump to that state
- Use the slider at the bottom to scrub through actions
- Skip actions using the "Skip" button

## Development Workflow

### 1. **Debugging Drag & Drop**
```javascript
// Track drag operations in devtools
1. Drag a card
2. Watch "updateDualColumn" action in devtools
3. Inspect state changes
4. Verify performance (check console for slow action warnings)
```

### 2. **Performance Analysis**
```javascript
// Check performance in console
1. Perform actions (especially drag & drop)
2. Look for performance warnings
3. Use browser performance tab for detailed analysis
```

### 3. **State Inspection**
```javascript
// Inspect current state
console.log(useKanbanStore.getState());

// Subscribe to specific state changes
useKanbanStore.subscribe(
  (state) => state.kanbanItems,
  (kanbanItems) => console.log('Kanban items changed:', kanbanItems)
);
```

## Console Helpers

### 1. **Direct Store Access**
```javascript
// Access store in browser console
window.__kanbanStore = useKanbanStore;

// Then in console:
__kanbanStore.getState()                    // Get current state
__kanbanStore.getState().addTaskCard(...)   // Call actions
```

### 2. **Performance Monitoring**
```javascript
// Monitor store performance
const unsubscribe = useKanbanStore.subscribe(
  (state) => console.log('Store updated:', performance.now())
);
```

## Troubleshooting

### DevTools Not Appearing
1. **Check Extension**: Ensure Redux DevTools extension is installed
2. **Development Mode**: Verify `NODE_ENV === 'development'`
3. **Console Errors**: Check for any JavaScript errors
4. **Browser Support**: Try in Chrome/Firefox/Edge

### Performance Issues
1. **Slow Actions**: Check console for performance warnings
2. **Large State**: Use state sanitization for large objects
3. **Frequent Updates**: Consider action batching

### Action Names Not Clear
1. **Named Actions**: Ensure all actions have descriptive names
2. **Action Sanitizer**: Check devtools configuration
3. **Custom Names**: Use the third parameter in `set()` calls

## Best Practices

### 1. **Meaningful Action Names**
```javascript
// ✅ Good - descriptive action names
set(newState, false, 'moveTaskBetweenColumns');
set(newState, false, 'updateTaskTitle');

// ❌ Bad - generic names
set(newState, false, 'update');
set(newState, false, 'action');
```

### 2. **State Structure**
```javascript
// ✅ Good - flat, serializable state
{
  kanbanItems: [...],
  selectedTask: { id: 123 },
  isLoading: false
}

// ❌ Bad - nested functions and circular references
{
  kanbanItems: [...],
  utils: { helper: () => {} },
  circular: reference
}
```

### 3. **Development vs Production**
```javascript
// Automatically disabled in production
const devConfig = createDevToolsConfig('store-name');
// devConfig.enabled === false in production
```

## Integration with Other Tools

### 1. **React DevTools**
- Use React DevTools for component debugging
- Use Zustand DevTools for state debugging
- Cross-reference component props with store state

### 2. **Browser Performance Tools**
- Use Performance tab for detailed performance analysis
- Zustand performance warnings complement browser tools
- Profile drag & drop operations

### 3. **Testing**
```javascript
// Mock store for testing
const mockStore = create(() => ({
  // test state
}));

// Test with devtools disabled
const store = create(
  devtools(storeConfig, { enabled: false })
);
```

## Advanced Features

### 1. **Custom Serializers**
Modify `src/stores/devtools.js` to customize how state is displayed:

```javascript
serialize: {
  replacer: (key, value) => {
    // Custom serialization logic
    if (key === 'largeArray' && Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    return value;
  }
}
```

### 2. **Action Filtering**
```javascript
// Filter actions in devtools
actionSanitizer: (action) => {
  // Hide sensitive actions
  if (action.type.includes('secret')) {
    return { ...action, type: '[HIDDEN]' };
  }
  return action;
}
```

This comprehensive DevTools integration provides powerful debugging capabilities while maintaining excellent performance in development.
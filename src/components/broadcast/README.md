# Broadcast System Usage Guide

## Quick Start

### 1. Basic Usage (Integrated with Authentication)
```jsx
import { BroadcastStatusMonitor } from '../components/broadcast';

// Basic usage - automatically connects when user is authenticated
<BroadcastStatusMonitor />
```

### 2. With Custom Display Options
```jsx
// Control what UI elements are shown
<BroadcastStatusMonitor 
  showConnectionStatus={true}
  showNotifications={true}
/>
```

### 4. Using Individual Components
```jsx
import { 
  ConnectionStatus,
  SystemMetrics, 
  ServicesGrid, 
  AlertsSection,
  NotificationList 
} from '../components/broadcast';

// Use individual components
<div>
  <ConnectionStatus />
  <SystemMetrics />
  <ServicesGrid />
  <AlertsSection />
  <NotificationList />
</div>
```

## WebSocket Integration

### Automatic Connection Management
The broadcast system is fully integrated with the existing WebSocketManager. Connection is automatically managed based on authentication status:

```jsx
import { useBroadcast } from '../hooks/websocket/useBroadcast';
import { useWebSocketStatus } from '../hooks/websocket/useWebSocketStatus';

const MyComponent = () => {
  // Initialize broadcast subscriptions (automatically subscribes to broadcast message types)
  useBroadcast();
  
  // Get connection status from existing WebSocket system
  const { isConnected, connectionState, isReconnecting } = useWebSocketStatus();

  return (
    <div>
      <p>Connection Status: {connectionState}</p>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      {isReconnecting && <p>Reconnecting...</p>}
    </div>
  );
};
```

## Store Access

### Using Individual Selectors (Recommended)
```jsx
import {
  useBroadcastOverallStatus,
  useBroadcastSystemMetrics,
  useBroadcastServices,
  useBroadcastAlerts,
  useBroadcastNotifications,
  useBroadcastError
} from '../stores/broadcastStore';

const MyComponent = () => {
  const overallStatus = useBroadcastOverallStatus();
  const systemMetrics = useBroadcastSystemMetrics();
  const services = useBroadcastServices();
  const notifications = useBroadcastNotifications();
  
  return (
    <div>
      <p>Status: {overallStatus}</p>
      <p>Services: {Object.keys(services).length}</p>
      <p>Notifications: {notifications.length}</p>
    </div>
  );
};
```

### Direct Store Actions
```jsx
import { broadcastActions } from '../stores/broadcastStore';

// Programmatically add notifications
broadcastActions.addNotification('info', 'Custom message');

// Simulate backend status update
broadcastActions.handleBackendStatus({
  type: 'backend_status',
  overall_status: 'healthy',
  system_metrics: { /* ... */ },
  services: { /* ... */ },
  alerts: []
});
```

## Configuration

### Environment Variables
```bash
# .env file - WebSocketProvider uses this automatically
VITE_WS_URL=wss://go.eveonline.it/websocket/connect
```

### Connection Requirements
- **Authentication Required**: WebSocket only connects when user is authenticated
- **Single Connection**: Uses existing WebSocketManager singleton - no duplicate connections
- **Automatic Management**: Connection/disconnection handled by WebSocketProvider

## Message Types

### Backend Status Message
```typescript
{
  type: 'backend_status',
  overall_status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
  system_metrics: {
    memory_usage: number,
    cpu_usage: number,
    active_connections: number,
    uptime_formatted: string
  },
  services: {
    [serviceName: string]: {
      module: string,
      status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
      response_time: string,
      message?: string,
      last_checked: string
    }
  },
  alerts: string[]
}
```

### Critical Alert Message
```typescript
{
  type: 'critical_alert',
  message: string
}
```

### Service Recovery Message
```typescript
{
  type: 'service_recovery',
  service: string
}
```

## Best Practices

1. **Use existing WebSocket infrastructure** - Always use `useBroadcast()` instead of creating separate connections
2. **Use individual selectors** - Avoid unnecessary re-renders with specific broadcast selectors
3. **Handle connection state properly** - Use `useWebSocketStatus()` for connection monitoring
4. **Authentication-aware** - Remember that broadcast only works when user is authenticated
5. **Test with the test page** - Use `/pages/broadcast-test` for development and debugging

## Integration Notes

- **No duplicate connections**: The broadcast system reuses the existing WebSocketManager singleton
- **Authentication-based**: Connection automatically managed based on auth state
- **Message type filtering**: Automatically subscribes only to broadcast message types (`backend_status`, `critical_alert`, `service_recovery`)
- **Existing infrastructure**: Leverages all existing WebSocket features (reconnection, error handling, etc.)
# WebSocket Frontend Implementation

## Overview

The WebSocket frontend implementation provides real-time bidirectional communication between the React Falcon dashboard and the go-falcon backend WebSocket server. It features automatic room management, authentication integration, and seamless TanStack Query cache updates.

**Status**: Production Ready - Fully Integrated with go-falcon Backend  
**Authentication**: Cookie-based JWT with automatic connection management  
**State Management**: Direct TanStack Query cache integration

## Architecture

### Core Components

```
src/services/websocket/
├── WebSocketManager.ts      # Singleton connection manager
└── CLAUDE.md               # This documentation

src/providers/
└── WebSocketProvider.tsx   # React Context provider

src/hooks/websocket/
├── index.ts                # Hook exports
├── useWebSocket.ts         # Core connection hook
├── useRoom.ts              # Room subscription management
├── usePersonalRoom.ts      # User personal room
├── useWebSocketStatus.ts   # Connection monitoring
└── usePresence.ts          # User presence tracking

src/examples/websocket/
├── WebSocketDemo.tsx       # Complete demo component
├── WebSocketStatus.tsx     # Connection status widget
├── RealTimeChat.tsx        # Chat room implementation
├── PresenceIndicator.tsx   # User presence display
├── README.md               # Usage documentation
├── BACKEND_COMPATIBILITY.md # Backend integration guide
└── index.ts                # Component exports
```

### Integration Points

- **Authentication**: Automatic connection/disconnection based on auth state
- **Room Management**: Backend-controlled automatic room assignment
- **Query Cache**: Real-time updates to TanStack Query cache
- **Error Handling**: Auto-reconnection with exponential backoff
- **Message Queuing**: Offline message queuing during disconnection

## Key Implementation Details

### 1. WebSocket Manager (Singleton Pattern)

```typescript
// Core connection manager with lifecycle management
const wsManager = WebSocketManager.getInstance({
  url: 'wss://go.eveonline.it/websocket/connect',
  reconnectInterval: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000
});
```

**Key Features:**
- Single connection per application instance
- Auto-reconnection with exponential backoff
- Message queuing during disconnection
- Room subscription tracking
- Heartbeat/ping-pong health monitoring

### 2. React Context Provider

```typescript
// Integrated with authentication system
<WebSocketProvider>
  <App />
</WebSocketProvider>
```

**Responsibilities:**
- Manage WebSocket connection lifecycle
- Handle authentication-based connect/disconnect
- Distribute messages to subscribers
- Update TanStack Query cache in real-time
- Provide hooks with connection state

### 3. Backend Integration

**Connection Flow:**
1. User authenticates → secure HttpOnly `falcon_auth_token` cookie set
2. WebSocket connects to `/websocket/connect` (browser sends cookie automatically)
3. Backend validates JWT from cookie and auto-assigns rooms:
   - Personal: `user:{user_id}`
   - Groups: `group:{group_id}` for each membership
4. Frontend receives messages and updates cache

**Message Types:**
```typescript
interface WSMessage {
  type: 'user_profile_update' | 'group_membership_change' | 
        'system_notification' | 'heartbeat' | 'room_joined' | 
        'room_left' | 'custom_event' | 'message' | 'presence';
  room?: string;      // Target room (optional)
  from?: string;      // Sender connection ID  
  to?: string;        // Direct message target
  data: any;          // Message payload
  timestamp?: number;
  id?: string;
}
```

## Usage Patterns

### 1. Basic Connection Monitoring

```typescript
import { useWebSocketStatus } from 'hooks/websocket';

const StatusWidget = () => {
  const { isConnected, connectionState, connectionTime } = useWebSocketStatus();
  
  return (
    <div>
      Status: {connectionState}
      {connectionTime && <span>Connected since: {connectionTime.toLocaleTimeString()}</span>}
    </div>
  );
};
```

### 2. Personal Room Subscriptions

```typescript
import { usePersonalRoom } from 'hooks/websocket';
import { useAuth } from 'contexts/AuthContext';

const PersonalNotifications = () => {
  const { user } = useAuth();
  
  usePersonalRoom(user?.toString(), {
    onMessage: (message) => {
      if (message.type === 'user_profile_update') {
        toast.success('Profile updated!');
      }
    }
  });
  
  return null; // Background component
};
```

### 3. Group Room Communication

```typescript
import { useRoom } from 'hooks/websocket';

const GroupChat = ({ groupId }: { groupId: string }) => {
  const { isJoined, sendToRoom, messages } = useRoom(`group:${groupId}`, {
    autoJoin: true,
    onMessage: (msg) => console.log('Group message:', msg)
  });
  
  const sendMessage = () => {
    sendToRoom({
      type: 'message',
      data: { text: 'Hello group!', sender: 'CurrentUser' }
    });
  };
};
```

### 4. Custom Message Handling

```typescript
import { useWebSocket } from 'hooks/websocket';

const CustomEventHandler = () => {
  useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'custom_event':
          handleCustomEvent(message.data);
          break;
        case 'system_notification':
          showSystemNotification(message.data);
          break;
      }
    }
  });
};
```

## TanStack Query Integration

### Automatic Cache Updates

The WebSocketProvider automatically updates TanStack Query cache based on message types:

```typescript
// In WebSocketProvider.tsx
const handleQueryCacheUpdate = useCallback((message: WSMessage) => {
  switch (message.type) {
    case 'user_profile_update':
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'current-user'] });
      break;
      
    case 'group_membership_change':
      // Update group and user queries
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      break;
      
    case 'message':
      // Update chat message cache for thread rooms
      if (message.room?.startsWith('thread:')) {
        const threadId = message.room.replace('thread:', '');
        // Update infinite query cache...
      }
      break;
  }
}, [queryClient]);
```

### Custom Query Updates

For application-specific cache updates:

```typescript
// Custom hook for handling specific data updates
const useCustomWebSocketUpdates = () => {
  const queryClient = useQueryClient();
  
  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'custom_event' && message.data.type === 'data_update') {
        queryClient.setQueryData(
          ['custom-data', message.data.id], 
          message.data.payload
        );
      }
    }
  });
};
```

## Room Management

### Automatic Room Assignment (Backend-Controlled)

The go-falcon backend automatically assigns users to rooms based on authentication and permissions:

- **Personal Room**: `user:{user_id}` - Always assigned
- **Group Rooms**: `group:{group_id}` - Based on current group memberships
- **Dynamic Updates**: Room assignments change when group memberships change

### Frontend Room Handling

```typescript
// Personal room (always available when authenticated)
const personalRoom = usePersonalRoom(userId, {
  onNotification: (notification) => {
    toast.info(notification.message);
  },
  onPresence: (presence) => {
    console.log('Presence update:', presence);
  }
});

// Group room (available based on membership)
const groupRoom = useRoom('group:60f1e2a8c8e4f5001234567', {
  autoJoin: true,    // Will join if user has permission
  autoLeave: true,   // Will leave on component unmount
  onMessage: (msg) => {
    // Handle group-specific messages
  }
});
```

## Error Handling & Recovery

### Connection Recovery

```typescript
// Automatic reconnection with exponential backoff
const wsManager = WebSocketManager.getInstance({
  reconnectInterval: 1000,      // Start with 1 second
  maxReconnectDelay: 30000,     // Max 30 seconds between attempts
  messageTimeout: 10000         // 10 second message timeout
});
```

### Error Monitoring

```typescript
const ErrorHandler = () => {
  const { lastError } = useWebSocketStatus();
  
  useEffect(() => {
    if (lastError) {
      console.error('WebSocket error:', lastError);
      // Optional: Report to error tracking service
    }
  }, [lastError]);
};
```

### Message Queue Recovery

Messages sent during disconnection are automatically queued and sent when connection is restored.

## Configuration

### Environment Variables

```bash
# WebSocket server URL (secure WSS for HTTPS compatibility)  
VITE_WS_URL=wss://go.eveonline.it/websocket/connect
```

### Provider Configuration

```typescript
// In src/index.tsx
<WebSocketProvider 
  url={import.meta.env.VITE_WS_URL}
  autoConnect={true}
>
  <App />
</WebSocketProvider>
```

## Security Considerations

### Authentication
- **Secure Cookie**: Uses HttpOnly `falcon_auth_token` cookie (cannot be accessed by JavaScript)
- **Automatic Cookie Sending**: Browser automatically includes cookies in WebSocket requests
- **Backend Validation**: Backend validates JWT from cookie on WebSocket upgrade
- **No Token Management**: Frontend doesn't handle tokens directly for security
- **Automatic Disconnection**: Disconnects on logout

### Message Security
- All messages validated by backend
- Room isolation enforced by backend
- No sensitive data in frontend message handling

### Connection Security
- **WSS Required**: Must use WSS (secure WebSocket) when page is served over HTTPS
- **Mixed Content Protection**: Browsers block WS connections from HTTPS pages
- **CORS handling**: Configured by backend
- **Rate limiting**: Handled by backend

## Performance Optimization

### Connection Efficiency
- Single connection per user session
- Automatic connection pooling
- Message batching during high-volume periods

### Memory Management
- Event listener cleanup on unmount
- Message history limited (last 100 per room)
- Automatic room cleanup when unused

### React Optimization
- Minimal re-renders via context optimization
- Message handler memoization
- Subscription cleanup patterns

## Development Guidelines

### Adding New Message Types

1. **Update Interface**: Add type to `WSMessage` interface
2. **Add Handler**: Update `handleQueryCacheUpdate` in provider
3. **Create Hook**: Add specific hook if needed
4. **Document**: Update this file and README

### Custom Room Types

```typescript
// For application-specific rooms
const customRoom = useRoom('task:urgent-alerts', {
  autoJoin: true,
  onMessage: (msg) => {
    if (msg.type === 'task_update') {
      // Handle task-specific updates
    }
  }
});
```

### Testing WebSocket Features

```typescript
// Mock WebSocket for testing
const mockWS = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Test connection handling
const { result } = renderHook(() => useWebSocketStatus(), {
  wrapper: ({ children }) => (
    <WebSocketProvider url="ws://test">
      {children}
    </WebSocketProvider>
  )
});
```

## Troubleshooting

### Common Issues

#### Connection Not Establishing
1. **Check Protocol**: Use `wss://` for HTTPS sites, `ws://` for HTTP sites only
2. **Mixed Content Error**: If page is HTTPS, WebSocket must also be secure (WSS)
3. **Check Authentication**: Verify user is logged in and has valid JWT cookie
4. **Check URL**: Ensure WebSocket URL matches backend (`/websocket/connect`)
5. **Check Backend**: Verify go-falcon WebSocket module is running
6. **Check Network**: Firewall or proxy blocking WebSocket connections

#### Messages Not Received
1. **Check Room Assignment**: User may not have permission for room
2. **Check Message Type**: Ensure message type is handled in frontend
3. **Check Backend Logs**: Verify messages are being sent by backend
4. **Check Connection Status**: Connection may be inactive

#### Cache Not Updating
1. **Check Query Keys**: Ensure query keys match between hooks and WebSocket handler
2. **Check Message Structure**: Verify message data format matches expectations
3. **Check Handler Logic**: Debug `handleQueryCacheUpdate` function

### Debug Logging

```typescript
// Enable WebSocket debug logging
const wsManager = WebSocketManager.getInstance({
  url: 'wss://go.eveonline.it/websocket/connect',
  debug: true  // Add this for detailed logging
});
```

## Future Enhancements

### Planned Features
- **Message Persistence**: Offline message storage and replay
- **Advanced Presence**: Rich presence with custom status
- **File Sharing**: Secure file sharing through WebSocket
- **Voice Integration**: WebRTC integration for voice channels
- **Mobile Support**: React Native WebSocket implementation

### Performance Improvements
- **Message Compression**: Protocol-level compression
- **Connection Pooling**: Multiple connections for high-load scenarios  
- **Smart Batching**: Intelligent message batching and throttling
- **Advanced Caching**: More sophisticated cache update strategies

## Dependencies

### Internal Dependencies
- `contexts/AuthContext` - Authentication state management
- `@tanstack/react-query` - Server state management and caching
- `react` - Core React hooks and components

### External Dependencies
- `events` - Node.js EventEmitter for message handling
- Browser WebSocket API - Native WebSocket implementation

## Contributing

### Code Standards
1. **Follow Patterns**: Use established hook patterns and naming
2. **Add Types**: Full TypeScript coverage for all interfaces
3. **Handle Errors**: Comprehensive error handling and recovery
4. **Update Docs**: Keep this file updated with changes
5. **Add Tests**: Unit tests for new functionality

### Performance Testing
- Test with multiple concurrent connections
- Monitor memory usage during long sessions
- Verify reconnection behavior under network issues
- Test cache update performance with high message volume

---

This WebSocket implementation provides a robust, scalable foundation for real-time features in the React Falcon dashboard, with full integration to the go-falcon backend WebSocket server.
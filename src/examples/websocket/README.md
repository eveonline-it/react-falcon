# WebSocket Implementation

This WebSocket implementation provides real-time communication features integrated with the go-falcon backend WebSocket server.

## Architecture

### Core Components
- **WebSocketManager** (`src/services/websocket/WebSocketManager.ts`): Singleton connection manager
- **WebSocketProvider** (`src/providers/WebSocketProvider.tsx`): React context provider
- **Hooks** (`src/hooks/websocket/`): React hooks for component integration

### Features
- ✅ **Auto-reconnection** with exponential backoff
- ✅ **Automatic room assignment** by backend based on permissions
- ✅ **Personal room auto-subscription** (`user:{user_id}`)
- ✅ **Group room auto-subscription** (`group:{group_id}`)
- ✅ **TanStack Query integration** for real-time cache updates
- ✅ **Cookie-based authentication** with JWT token support
- ✅ **Backend message types** support
- ✅ **Message queuing** during disconnection
- ✅ **Heartbeat/ping-pong** for connection monitoring

## Usage

### 1. Basic Connection Status
```tsx
import { useWebSocketStatus } from 'hooks/websocket';

const MyComponent = () => {
  const { isConnected, connectionState } = useWebSocketStatus();
  return <div>Status: {connectionState}</div>;
};
```

### 2. Room Subscription
```tsx
import { useRoom } from 'hooks/websocket';

const ChatRoom = ({ roomId }) => {
  const { isJoined, sendToRoom, messages } = useRoom(roomId, {
    onMessage: (message) => console.log('New message:', message)
  });
  
  const sendMessage = () => {
    sendToRoom({
      type: 'message',
      data: { text: 'Hello!', sender: 'User' }
    });
  };
};
```

### 3. Personal Room
```tsx
import { usePersonalRoom } from 'hooks/websocket';
import { useAuth } from 'contexts/AuthContext';

const PersonalNotifications = () => {
  const { user } = useAuth();
  const personalRoom = usePersonalRoom(user?.toString(), {
    onNotification: (notification) => {
      toast.info(notification.message);
    }
  });
};
```

### 4. User Presence
```tsx
import { usePresence } from 'hooks/websocket';

const PresenceManager = () => {
  const { updatePresence, presence, myStatus } = usePresence({
    userId: user?.toString()
  });
  
  const setOnline = () => updatePresence('online');
  const setAway = () => updatePresence('away');
};
```

## Configuration

The WebSocket connection is configured via environment variables:

```env
VITE_WS_URL=wss://go.eveonline.it/websocket/connect
```

**Default**: `wss://go.eveonline.it/websocket/connect` (secure WebSocket for HTTPS compatibility)

## Integration with Existing Chat System

The WebSocket implementation automatically integrates with the existing TanStack Query-based chat hooks:

- Real-time message updates in `useChatMessages`
- Thread updates in `useChatThreads` 
- Contact presence in `useChatContacts`

## Message Protocol

```typescript
interface WSMessage {
  type: 'message' | 'presence' | 'notification' | 'system' | 'room_update' | 'error' | 
        'user_profile_update' | 'group_membership_change' | 'system_notification' | 
        'custom_event' | 'heartbeat' | 'room_joined' | 'room_left';
  room?: string;      // Target room ID (optional)
  from?: string;      // Sender connection ID
  to?: string;        // Target connection ID (for direct messages)
  data: any;          // Message payload
  timestamp?: number;
  id?: string;
}
```

### Backend Message Examples

#### User Profile Update
```json
{
  "type": "user_profile_update",
  "data": {
    "user_id": "uuid-string",
    "character_id": 123456789,
    "profile": {
      "character_name": "Updated Name",
      "last_login": "2024-01-01T12:00:00Z"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Group Membership Change
```json
{
  "type": "group_membership_change",
  "data": {
    "user_id": "uuid-string", 
    "group_id": "group-object-id",
    "group_name": "Fleet Commanders",
    "joined": true
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Room Types

- **Personal Rooms**: `user:{userId}` - Auto-assigned by backend for authenticated users
- **Group Rooms**: `group:{groupId}` - Auto-assigned based on user's group memberships
- **Chat Threads**: `thread:{threadId}` - For chat conversations
- **Custom Rooms**: Application-specific rooms

## Authentication Flow

1. User logs in → WebSocket connects automatically with cookie-based auth
2. Backend auto-assigns rooms:
   - Personal room: `user:{user_id}` 
   - Group rooms: `group:{group_id}` for each group membership
3. Real-time room updates when group memberships change
4. User logs out → WebSocket disconnects and cleans up

## Testing

Run the demo page to test WebSocket functionality:

```typescript
import { WebSocketDemo } from 'examples/websocket';

// Add to your route or component
<WebSocketDemo />
```

## Backend Integration (go-falcon)

The frontend integrates with the go-falcon WebSocket server which provides:

✅ **JWT Authentication**: Bearer token or `falcon_auth_token` cookie support  
✅ **Automatic Room Assignment**: Personal and group rooms based on user permissions  
✅ **Redis Pub/Sub**: Multi-instance message broadcasting  
✅ **Real-time Updates**: User profile and group membership change notifications  
✅ **Health Monitoring**: Connection tracking and automatic cleanup  

### Backend Endpoints
- **WebSocket**: `GET /websocket/connect` (with auth)
- **Admin API**: `/websocket/connections`, `/websocket/rooms`, `/websocket/broadcast`
- **Status**: `GET /websocket/status` (public health check)

### Supported Message Types
- `user_profile_update` - Real-time profile changes
- `group_membership_change` - Group assignment updates  
- `system_notification` - Server-wide announcements
- `heartbeat` - Connection health monitoring
- `custom_event` - Application-specific events
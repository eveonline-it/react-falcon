# WebSocket Backend Compatibility

This document outlines the frontend WebSocket implementation's compatibility with the go-falcon backend WebSocket server.

## ✅ **Backend Compatibility Status: COMPLETE**

The frontend WebSocket implementation has been updated to fully integrate with the go-falcon backend WebSocket server located at `/home/tore/go-falcon/internal/websocket/`.

## **Key Integration Points**

### 🔗 **Connection**
- **Endpoint**: `wss://go.eveonline.it/websocket/connect` (secure WebSocket)
- **Authentication**: Secure HttpOnly cookie (`falcon_auth_token`) ✅
- **Protocol**: WebSocket upgrade with automatic room assignment ✅
- **Security**: WSS protocol for HTTPS compatibility ✅

### 🏠 **Room Management**  
- **Personal Rooms**: `user:{user_id}` - Auto-assigned by backend ✅
- **Group Rooms**: `group:{group_id}` - Based on user's group memberships ✅
- **No Manual Joining**: Backend handles all room assignment automatically ✅

### 📨 **Message Types**
```typescript
// Backend-compatible message types
'user_profile_update'        // Real-time profile changes
'group_membership_change'    // Group membership updates  
'system_notification'        // Server announcements
'heartbeat'                  // Connection health
'custom_event'              // App-specific events
'room_joined' | 'room_left' // Room status updates
```

### 🔄 **Real-time Integration**
- **User Updates**: Profile changes trigger TanStack Query cache invalidation
- **Group Changes**: Membership changes update group and user queries
- **Chat Integration**: Thread messages update chat message cache
- **System Notifications**: Logged to console (extend as needed)

## **Updated Files**

### Core Changes
1. **`WebSocketProvider.tsx`**: Updated URL, auth integration, message handlers
2. **`WebSocketManager.ts`**: Updated message types, removed manual room joining  
3. **`README.md`**: Updated documentation for backend compatibility

### Authentication Flow
```
1. User logs in → Cookie `falcon_auth_token` set
2. WebSocket connects → Backend validates JWT from cookie  
3. Backend auto-assigns rooms:
   - Personal: user:{user_id}
   - Groups: group:{group_id} for each membership
4. Frontend receives room assignments and messages
```

## **Environment Configuration**

```env
# Frontend WebSocket URL (secure WSS for HTTPS compatibility) 
VITE_WS_URL=wss://go.eveonline.it/websocket/connect
```

## **Backend Features Integrated**

### ✅ **Implemented**
- JWT cookie authentication
- Automatic room assignment  
- Real-time message broadcasting
- TanStack Query cache updates
- Connection health monitoring
- Backend message type support

### 🔄 **Auto-handled by Backend**
- Room membership management
- Multi-instance Redis pub/sub  
- Connection lifecycle tracking
- Group membership synchronization

## **Usage Example**

```tsx
import { useWebSocketStatus, useRoom, usePersonalRoom } from 'hooks/websocket';
import { useAuth } from 'contexts/AuthContext';

const MyComponent = () => {
  const { isConnected } = useWebSocketStatus();
  const { user } = useAuth();
  
  // Personal room (auto-assigned by backend)
  const personalRoom = usePersonalRoom(user?.toString(), {
    onMessage: (msg) => {
      if (msg.type === 'user_profile_update') {
        console.log('Profile updated:', msg.data);
      }
    }
  });
  
  // Group room (auto-assigned by backend) 
  const groupRoom = useRoom('group:60f1e2a8c8e4f5001234567', {
    onMessage: (msg) => {
      if (msg.type === 'group_membership_change') {
        console.log('Group membership changed:', msg.data);
      }
    }
  });
  
  return (
    <div>
      <p>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Personal Room: {personalRoom?.isJoined ? 'Joined' : 'Not joined'}</p>
      <p>Group Room: {groupRoom.isJoined ? 'Joined' : 'Not joined'}</p>
    </div>
  );
};
```

## **Testing Integration**

1. **Start go-falcon backend** with WebSocket module enabled
2. **Start React frontend** (WebSocket provider auto-initializes)  
3. **Login** → WebSocket connects with cookie auth
4. **Check browser console** for connection logs and room assignments
5. **Test real-time updates** by triggering backend events

## **Performance & Security**

### ✅ **Security Features**
- JWT token validation by backend
- Room isolation (users only access permitted rooms)
- Cookie-based authentication (secure)
- Input validation on all messages

### ✅ **Performance Features**  
- Auto-reconnection with exponential backoff
- Message queuing during disconnection
- TanStack Query integration for minimal re-renders
- Connection health monitoring

## **Next Steps**

The WebSocket implementation is now fully compatible with the go-falcon backend. To extend functionality:

1. **Add custom message handlers** for application-specific events
2. **Extend TanStack Query integration** for other data types
3. **Add UI components** for real-time notifications
4. **Implement message persistence** if needed

**Status**: ✅ **Ready for Production Use**
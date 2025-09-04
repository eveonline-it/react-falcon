import React, { createContext, useCallback, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import WebSocketManager, { WSMessage, ConnectionState } from '../services/websocket/WebSocketManager';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

interface WebSocketContextValue {
  connectionState: ConnectionState;
  isConnected: boolean;
  sendMessage: (message: WSMessage) => Promise<any>;
  joinRoom: (room: string) => Promise<void>;
  leaveRoom: (room: string) => Promise<void>;
  subscribe: (room: string, handler: (message: WSMessage) => void) => () => void;
  subscribeToType: (type: WSMessage['type'], handler: (message: WSMessage) => void) => () => void;
  rooms: string[];
  wsManager: WebSocketManager | null;
}

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = import.meta.env.VITE_WS_URL || 'wss://go.eveonline.it/websocket/connect',
  autoConnect = true
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [rooms, setRooms] = useState<string[]>([]);
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const queryClient = useQueryClient();
  const handlersRef = useRef<Map<string, Set<(message: WSMessage) => void>>>(new Map());
  const typeHandlersRef = useRef<Map<WSMessage['type'], Set<(message: WSMessage) => void>>>(new Map());
  
  // Get authentication state
  const { isAuthenticated, user, characterName, isLoading } = useAuth();

  // Initialize WebSocket manager
  useEffect(() => {
    if (!wsManagerRef.current) {
      try {
        wsManagerRef.current = WebSocketManager.getInstance({
          url,
          reconnectInterval: 1000,
          maxReconnectDelay: 30000,
          heartbeatInterval: 30000,
          messageTimeout: 10000
        });

        // Set up event listeners
        const wsManager = wsManagerRef.current;

        wsManager.on('stateChange', (state: ConnectionState) => {
          setConnectionState(state);
        });

        wsManager.on('roomJoined', (room: string) => {
          setRooms(wsManager.getRooms());
        });

        wsManager.on('roomLeft', (room: string) => {
          setRooms(wsManager.getRooms());
        });

        wsManager.on('message', (message: WSMessage) => {
          // Handle room-specific messages
          if (message.room) {
            const roomHandlers = handlersRef.current.get(`room:${message.room}`);
            roomHandlers?.forEach(handler => handler(message));
          }

          // Handle type-specific messages
          const typeHandlers = typeHandlersRef.current.get(message.type);
          typeHandlers?.forEach(handler => handler(message));

          // Update TanStack Query cache based on message type and data
          handleQueryCacheUpdate(message);
        });

      } catch (error) {
        console.error('[WebSocketProvider] Failed to initialize WebSocket manager:', error);
      }
    }

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [url]);

  // Handle authentication-based connection
  useEffect(() => {
    if (!wsManagerRef.current || isLoading) return;

    if (isAuthenticated && user && autoConnect) {
      console.log('[WebSocketProvider] Authenticated, connecting WebSocket...', { user, characterName });
      console.log('[WebSocketProvider] Using cookie-based authentication - browser will send falcon_auth_token automatically');
      
      // Backend automatically assigns user to personal room (user:{user_id}) and group rooms
      // Authentication via secure HttpOnly cookie (falcon_auth_token)
      wsManagerRef.current.connect(user.toString()).catch(error => {
        console.error('[WebSocketProvider] Failed to connect:', error);
      });
    } else if (!isAuthenticated && connectionState !== ConnectionState.DISCONNECTED) {
      console.log('[WebSocketProvider] Not authenticated, disconnecting WebSocket...');
      wsManagerRef.current.disconnect();
    }
  }, [isAuthenticated, user, characterName, isLoading, autoConnect, connectionState]);

  // Handle query cache updates based on WebSocket messages
  const handleQueryCacheUpdate = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'message':
        // Update chat messages cache for thread rooms
        if (message.room && message.room.startsWith('thread:')) {
          const threadId = message.room.replace('thread:', '');
          
          // Update messages in the infinite query cache
          queryClient.setQueryData(['chat', 'messages', threadId], (oldData: any) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0) {
                  // Add new message to first page
                  return {
                    ...page,
                    messages: [message.data, ...page.messages]
                  };
                }
                return page;
              })
            };
          });

          // Update thread's last message
          queryClient.setQueryData(['chat', 'threads'], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              threads: oldData.threads.map((thread: any) => 
                thread.id === threadId
                  ? { ...thread, lastMessage: message.data, updatedAt: new Date().toISOString() }
                  : thread
              )
            };
          });
        }
        break;

      case 'user_profile_update':
        // Handle user profile updates
        if (message.data?.user_id) {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          queryClient.invalidateQueries({ queryKey: ['auth', 'current-user'] });
        }
        break;

      case 'group_membership_change':
        // Handle group membership changes
        if (message.data?.user_id) {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
        break;

      case 'system_notification':
        // Handle system notifications
        console.log('System notification:', message.data);
        break;

      case 'presence':
        // Update user presence in contacts
        if (message.data?.userId) {
          queryClient.setQueryData(['chat', 'contacts'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((contact: any) => 
              contact.id === message.data.userId
                ? { ...contact, status: message.data.status }
                : contact
            );
          });
        }
        break;

      case 'notification':
        // Invalidate relevant queries based on notification type
        if (message.data?.type === 'new_message') {
          queryClient.invalidateQueries({ queryKey: ['chat', 'threads'] });
        } else if (message.data?.type === 'task_update') {
          queryClient.invalidateQueries({ queryKey: ['scheduler'] });
        }
        break;

      case 'room_update':
        // Handle room updates (participants added/removed, etc.)
        if (message.room) {
          queryClient.invalidateQueries({ queryKey: ['chat', 'threads', message.room] });
        }
        break;
    }
  }, [queryClient]);

  // Send message through WebSocket
  const sendMessage = useCallback(async (message: WSMessage): Promise<any> => {
    if (!wsManagerRef.current) {
      throw new Error('WebSocket not initialized');
    }
    return wsManagerRef.current.sendMessage(message);
  }, []);

  // Join a room
  const joinRoom = useCallback(async (room: string): Promise<void> => {
    if (!wsManagerRef.current) {
      throw new Error('WebSocket not initialized');
    }
    return wsManagerRef.current.joinRoom(room);
  }, []);

  // Leave a room
  const leaveRoom = useCallback(async (room: string): Promise<void> => {
    if (!wsManagerRef.current) {
      throw new Error('WebSocket not initialized');
    }
    return wsManagerRef.current.leaveRoom(room);
  }, []);

  // Subscribe to room messages
  const subscribe = useCallback((room: string, handler: (message: WSMessage) => void): (() => void) => {
    const key = `room:${room}`;
    
    if (!handlersRef.current.has(key)) {
      handlersRef.current.set(key, new Set());
    }
    
    handlersRef.current.get(key)!.add(handler);
    
    // Also subscribe to room events on the WebSocket manager
    if (wsManagerRef.current) {
      wsManagerRef.current.on(key, handler);
    }

    // Return unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(key);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          handlersRef.current.delete(key);
        }
      }
      
      if (wsManagerRef.current) {
        wsManagerRef.current.off(key, handler);
      }
    };
  }, []);

  // Subscribe to specific message types
  const subscribeToType = useCallback((type: WSMessage['type'], handler: (message: WSMessage) => void): (() => void) => {
    if (!typeHandlersRef.current.has(type)) {
      typeHandlersRef.current.set(type, new Set());
    }
    
    typeHandlersRef.current.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = typeHandlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          typeHandlersRef.current.delete(type);
        }
      }
    };
  }, []);

  const value: WebSocketContextValue = {
    connectionState,
    isConnected: connectionState === ConnectionState.CONNECTED,
    sendMessage,
    joinRoom,
    leaveRoom,
    subscribe,
    subscribeToType,
    rooms,
    wsManager: wsManagerRef.current
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;
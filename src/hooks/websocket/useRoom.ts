import { useEffect, useCallback, useState, useRef } from 'react';
import { useWebSocketContext } from '../../providers/WebSocketProvider';
import { WSMessage } from '../../services/websocket/WebSocketManager';

interface UseRoomOptions {
  autoJoin?: boolean;
  autoLeave?: boolean;
  onMessage?: (message: WSMessage) => void;
  onJoin?: () => void;
  onLeave?: () => void;
  onError?: (error: any) => void;
}

export interface UseRoomReturn {
  isJoined: boolean;
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
  sendToRoom: (message: Omit<WSMessage, 'room'>) => Promise<any>;
  messages: WSMessage[];
}

/**
 * Hook for managing room subscriptions and room-specific messaging
 */
export const useRoom = (roomId: string, options: UseRoomOptions = {}): UseRoomReturn => {
  const {
    autoJoin = true,
    autoLeave = true,
    onMessage,
    onJoin,
    onLeave,
    onError
  } = options;

  const { joinRoom, leaveRoom, sendMessage, subscribe, rooms, isConnected } = useWebSocketContext();
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const optionsRef = useRef(options);
  const isJoinedRef = useRef(false);
  
  optionsRef.current = options;

  const isJoined = rooms.includes(roomId);

  // Update joined status
  useEffect(() => {
    if (isJoined && !isJoinedRef.current) {
      isJoinedRef.current = true;
      optionsRef.current.onJoin?.();
    } else if (!isJoined && isJoinedRef.current) {
      isJoinedRef.current = false;
      optionsRef.current.onLeave?.();
    }
  }, [isJoined]);

  // Auto-join room when connected
  useEffect(() => {
    if (autoJoin && isConnected && !isJoined && roomId) {
      joinRoom(roomId).catch(error => {
        console.error(`Failed to join room ${roomId}:`, error);
        optionsRef.current.onError?.(error);
      });
    }
  }, [autoJoin, isConnected, isJoined, roomId, joinRoom]);

  // Auto-leave room on unmount
  useEffect(() => {
    return () => {
      if (autoLeave && isJoined && roomId) {
        leaveRoom(roomId).catch(error => {
          console.error(`Failed to leave room ${roomId}:`, error);
        });
      }
    };
  }, [autoLeave, roomId, leaveRoom, isJoined]);

  // Subscribe to room messages
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribe(roomId, (message: WSMessage) => {
      // Add to local messages list
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [message, ...prev].slice(0, 100); // Keep last 100 messages
      });

      // Call message handler
      optionsRef.current.onMessage?.(message);
    });

    return unsubscribe;
  }, [roomId, subscribe]);

  // Clear messages when room changes
  useEffect(() => {
    setMessages([]);
  }, [roomId]);

  const handleJoinRoom = useCallback(async (): Promise<void> => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    try {
      await joinRoom(roomId);
    } catch (error) {
      optionsRef.current.onError?.(error);
      throw error;
    }
  }, [roomId, joinRoom]);

  const handleLeaveRoom = useCallback(async (): Promise<void> => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    try {
      await leaveRoom(roomId);
    } catch (error) {
      optionsRef.current.onError?.(error);
      throw error;
    }
  }, [roomId, leaveRoom]);

  const sendToRoom = useCallback(async (message: Omit<WSMessage, 'room'>): Promise<any> => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }
    return sendMessage({
      ...message,
      room: roomId
    });
  }, [roomId, sendMessage]);

  return {
    isJoined,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    sendToRoom,
    messages
  };
};

export default useRoom;
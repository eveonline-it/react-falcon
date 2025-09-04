import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useWebSocketContext } from '../../providers/WebSocketProvider';
import { WSMessage, ConnectionState } from '../../services/websocket/WebSocketManager';

interface UseWebSocketOptions {
  onMessage?: (message: WSMessage) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  onError?: (error: any) => void;
}

export interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  sendMessage: (message: WSMessage) => Promise<any>;
  rooms: string[];
}

/**
 * Core WebSocket hook providing connection status and message sending
 */
export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { connectionState, isConnected, sendMessage, rooms, subscribeToType } = useWebSocketContext();
  const { onMessage, onConnectionChange, onError } = options;
  
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Subscribe to general messages if handler provided
  useEffect(() => {
    if (!onMessage) return;

    const unsubscribe = subscribeToType('message', (message: WSMessage) => {
      optionsRef.current.onMessage?.(message);
    });

    return unsubscribe;
  }, [onMessage, subscribeToType]);

  // Handle connection state changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connectionState);
    }
  }, [connectionState, onConnectionChange]);

  // Subscribe to errors
  useEffect(() => {
    if (!onError) return;

    const unsubscribe = subscribeToType('error', (message: WSMessage) => {
      optionsRef.current.onError?.(message.data);
    });

    return unsubscribe;
  }, [onError, subscribeToType]);

  return {
    connectionState,
    isConnected,
    sendMessage,
    rooms
  };
};

export default useWebSocket;
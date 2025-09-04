import { useState, useEffect } from 'react';
import { useWebSocketContext } from '../../providers/WebSocketProvider';
import { ConnectionState } from '../../services/websocket/WebSocketManager';

interface UseWebSocketStatusReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isDisconnected: boolean;
  hasError: boolean;
  connectionTime: Date | null;
  lastError: any;
}

/**
 * Hook for monitoring WebSocket connection status and history
 */
export const useWebSocketStatus = (): UseWebSocketStatusReturn => {
  const { connectionState, isConnected } = useWebSocketContext();
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<any>(null);

  // Track connection time
  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
      setConnectionTime(new Date());
    } else if (connectionState === ConnectionState.DISCONNECTED) {
      setConnectionTime(null);
    }
  }, [connectionState]);

  // Track errors
  useEffect(() => {
    if (connectionState === ConnectionState.ERROR) {
      setLastError({ timestamp: new Date(), state: connectionState });
    }
  }, [connectionState]);

  return {
    connectionState,
    isConnected,
    isConnecting: connectionState === ConnectionState.CONNECTING,
    isReconnecting: connectionState === ConnectionState.RECONNECTING,
    isDisconnected: connectionState === ConnectionState.DISCONNECTED,
    hasError: connectionState === ConnectionState.ERROR,
    connectionTime,
    lastError
  };
};

export default useWebSocketStatus;
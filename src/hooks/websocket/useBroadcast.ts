import { useEffect } from 'react';
import { useWebSocketContext } from '../../providers/WebSocketProvider';
import { useBroadcastStore, BroadcastMessage } from '../../stores/broadcastStore';
import { WSMessage } from '../../services/websocket/WebSocketManager';

/**
 * Hook that integrates the broadcast system with the existing WebSocketManager
 * This hook automatically subscribes to broadcast message types and updates the broadcast store
 */
export const useBroadcast = () => {
  const { subscribeToType, isConnected, connectionState } = useWebSocketContext();
  const { 
    handleBackendStatus,
    handleCriticalAlert,
    handleServiceRecovery,
    setConnected,
    setError,
    clearError
  } = useBroadcastStore();

  // Sync connection status with broadcast store
  useEffect(() => {
    setConnected(isConnected);
    if (isConnected) {
      clearError();
    }
  }, [isConnected, setConnected, clearError]);

  // Subscribe to backend_status messages
  useEffect(() => {
    const unsubscribe = subscribeToType('backend_status', (message: WSMessage) => {
      try {
        // Transform WSMessage to BroadcastMessage format
        const broadcastMessage: BroadcastMessage = {
          type: 'backend_status' as const,
          overall_status: message.data.overall_status,
          system_metrics: message.data.system_metrics,
          services: message.data.services,
          alerts: message.data.alerts
        };
        
        console.log('📊 Received backend status message:', broadcastMessage);
        handleBackendStatus(broadcastMessage);
      } catch (error) {
        console.error('❌ Failed to handle backend_status message:', error);
        setError('Failed to process backend status update');
      }
    });

    return unsubscribe;
  }, [subscribeToType, handleBackendStatus, setError]);

  // Subscribe to critical_alert messages  
  useEffect(() => {
    const unsubscribe = subscribeToType('critical_alert', (message: WSMessage) => {
      try {
        const broadcastMessage: BroadcastMessage = {
          type: 'critical_alert' as const,
          message: message.data.message
        };
        
        console.log('🚨 Received critical alert:', broadcastMessage);
        handleCriticalAlert(broadcastMessage);
      } catch (error) {
        console.error('❌ Failed to handle critical_alert message:', error);
        setError('Failed to process critical alert');
      }
    });

    return unsubscribe;
  }, [subscribeToType, handleCriticalAlert, setError]);

  // Subscribe to service_recovery messages
  useEffect(() => {
    const unsubscribe = subscribeToType('service_recovery', (message: WSMessage) => {
      try {
        const broadcastMessage: BroadcastMessage = {
          type: 'service_recovery' as const,
          service: message.data.service
        };
        
        console.log('✅ Received service recovery:', broadcastMessage);
        handleServiceRecovery(broadcastMessage);
      } catch (error) {
        console.error('❌ Failed to handle service_recovery message:', error);
        setError('Failed to process service recovery');
      }
    });

    return unsubscribe;
  }, [subscribeToType, handleServiceRecovery, setError]);

  // Handle connection errors
  useEffect(() => {
    const unsubscribe = subscribeToType('error', (message: WSMessage) => {
      setError(`WebSocket error: ${message.data}`);
    });

    return unsubscribe;
  }, [subscribeToType, setError]);

  return {
    // Connection information from existing WebSocket system
    isConnected,
    connectionState,
    
    // No manual connect/disconnect functions - managed by WebSocketProvider
    // based on authentication status
  };
};

export default useBroadcast;
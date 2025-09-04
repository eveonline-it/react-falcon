import { useEffect, useCallback, useState } from 'react';
import { useWebSocketContext } from '../../providers/WebSocketProvider';
import { WSMessage } from '../../services/websocket/WebSocketManager';

interface PresenceData {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: string;
  metadata?: Record<string, any>;
}

interface UsePresenceOptions {
  userId?: string;
  onPresenceChange?: (presence: PresenceData) => void;
}

interface UsePresenceReturn {
  updatePresence: (status: PresenceData['status'], metadata?: Record<string, any>) => Promise<void>;
  subscribeToUser: (userId: string) => () => void;
  presence: Map<string, PresenceData>;
  myStatus: PresenceData['status'] | null;
}

/**
 * Hook for managing user presence status and subscriptions
 */
export const usePresence = (options: UsePresenceOptions = {}): UsePresenceReturn => {
  const { userId, onPresenceChange } = options;
  const { sendMessage, subscribeToType, isConnected } = useWebSocketContext();
  const [presence, setPresence] = useState<Map<string, PresenceData>>(new Map());
  const [myStatus, setMyStatus] = useState<PresenceData['status'] | null>(null);

  // Subscribe to presence updates
  useEffect(() => {
    const unsubscribe = subscribeToType('presence', (message: WSMessage) => {
      const presenceData: PresenceData = message.data;
      
      setPresence(prev => {
        const updated = new Map(prev);
        updated.set(presenceData.userId, presenceData);
        return updated;
      });

      // Track own status
      if (userId && presenceData.userId === userId) {
        setMyStatus(presenceData.status);
      }

      onPresenceChange?.(presenceData);
    });

    return unsubscribe;
  }, [subscribeToType, userId, onPresenceChange]);

  // Update presence status
  const updatePresence = useCallback(async (
    status: PresenceData['status'], 
    metadata?: Record<string, any>
  ): Promise<void> => {
    if (!userId) {
      throw new Error('User ID is required to update presence');
    }

    await sendMessage({
      type: 'presence',
      data: {
        userId,
        status,
        metadata,
        timestamp: new Date().toISOString()
      }
    });

    setMyStatus(status);
  }, [userId, sendMessage]);

  // Subscribe to specific user's presence
  const subscribeToUser = useCallback((targetUserId: string): (() => void) => {
    // Send subscription request
    if (isConnected) {
      sendMessage({
        type: 'system',
        data: {
          action: 'subscribe_presence',
          userId: targetUserId
        }
      }).catch(error => {
        console.error('Failed to subscribe to user presence:', error);
      });
    }

    // Return unsubscribe function
    return () => {
      if (isConnected) {
        sendMessage({
          type: 'system',
          data: {
            action: 'unsubscribe_presence',
            userId: targetUserId
          }
        }).catch(error => {
          console.error('Failed to unsubscribe from user presence:', error);
        });
      }
    };
  }, [sendMessage, isConnected]);

  // Auto-update presence based on page visibility
  useEffect(() => {
    if (!userId || !isConnected) return;

    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'online';
      updatePresence(status).catch(error => {
        console.error('Failed to update presence on visibility change:', error);
      });
    };

    const handleBeforeUnload = () => {
      // Set offline status when leaving
      navigator.sendBeacon('/api/presence/offline', JSON.stringify({ userId }));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set initial online status
    updatePresence('online').catch(error => {
      console.error('Failed to set initial presence:', error);
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, isConnected, updatePresence]);

  return {
    updatePresence,
    subscribeToUser,
    presence,
    myStatus
  };
};

export default usePresence;
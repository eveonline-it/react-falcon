import { useEffect } from 'react';
import { useRoom, UseRoomReturn } from './useRoom';
import { WSMessage } from '../../services/websocket/WebSocketManager';

interface UsePersonalRoomOptions {
  onMessage?: (message: WSMessage) => void;
  onNotification?: (notification: any) => void;
  onPresence?: (presence: any) => void;
}

/**
 * Hook for managing user's personal room subscription
 * Personal rooms are automatically joined when authenticated
 */
export const usePersonalRoom = (userId: string | null, options: UsePersonalRoomOptions = {}): UseRoomReturn | null => {
  const { onMessage, onNotification, onPresence } = options;
  
  const roomResult = useRoom(
    userId ? `user:${userId}` : '',
    {
      autoJoin: !!userId,
      autoLeave: true,
      onMessage: (message: WSMessage) => {
        // Handle different types of personal messages
        switch (message.type) {
          case 'notification':
            onNotification?.(message.data);
            break;
          case 'presence':
            onPresence?.(message.data);
            break;
          default:
            onMessage?.(message);
        }
      }
    }
  );

  // Don't return room result if no user ID
  if (!userId) {
    return null;
  }

  return roomResult;
};

export default usePersonalRoom;
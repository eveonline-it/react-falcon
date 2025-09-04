// WebSocket hooks for real-time functionality
export { useWebSocket, type UseWebSocketReturn } from './useWebSocket';
export { useRoom, type UseRoomReturn } from './useRoom';
export { usePersonalRoom } from './usePersonalRoom';
export { useWebSocketStatus } from './useWebSocketStatus';
export { usePresence } from './usePresence';
export { useBroadcast } from './useBroadcast';

// Re-export types from WebSocketManager for convenience
export type { WSMessage, ConnectionState } from '../../services/websocket/WebSocketManager';
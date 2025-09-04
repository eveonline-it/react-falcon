/**
 * WebSocket configuration utilities for broadcast system
 * Note: Connection is managed by WebSocketProvider - these are just for display/info
 */

export const getWebSocketUrl = (): string => {
  return import.meta.env.VITE_WS_URL || 'wss://go.eveonline.it/websocket/connect';
};

export const isWebSocketSecure = (): boolean => {
  return getWebSocketUrl().startsWith('wss://');
};

export const getWebSocketHost = (): string => {
  const url = getWebSocketUrl();
  try {
    const wsUrl = new URL(url);
    return wsUrl.host;
  } catch {
    return 'go.eveonline.it';
  }
};
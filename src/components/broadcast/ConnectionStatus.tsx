import React from 'react';
import { Badge } from 'react-bootstrap';
import { useWebSocketStatus } from '../../hooks/websocket/useWebSocketStatus';
import { ConnectionState } from '../../services/websocket/WebSocketManager';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { isConnected, connectionState, connectionTime } = useWebSocketStatus();

  const getBadgeVariant = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED: return 'success';
      case ConnectionState.CONNECTING: return 'info';
      case ConnectionState.RECONNECTING: return 'warning';
      case ConnectionState.ERROR: return 'danger';
      case ConnectionState.DISCONNECTED: return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED: return 'Connected';
      case ConnectionState.CONNECTING: return 'Connecting...';
      case ConnectionState.RECONNECTING: return 'Reconnecting...';
      case ConnectionState.ERROR: return 'Connection Error';
      case ConnectionState.DISCONNECTED: return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED: return '✅';
      case ConnectionState.CONNECTING: return '🔗';
      case ConnectionState.RECONNECTING: return '🔄';
      case ConnectionState.ERROR: return '❌';
      case ConnectionState.DISCONNECTED: return '⚫';
      default: return '❓';
    }
  };

  return (
    <div className={`position-fixed top-0 end-0 m-3 ${className}`} style={{ zIndex: 1050 }}>
      <Badge 
        bg={getBadgeVariant()} 
        className="d-flex align-items-center gap-1 p-2"
        style={{ fontSize: '0.8rem' }}
      >
        <span>{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </Badge>
      
      {isConnected && connectionTime && (
        <div className="text-muted" style={{ fontSize: '0.7rem', textAlign: 'center', marginTop: '2px' }}>
          Connected at {connectionTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
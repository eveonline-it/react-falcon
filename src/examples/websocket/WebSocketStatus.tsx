import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import { useWebSocketStatus } from '../../hooks/websocket';
import { ConnectionState } from '../../services/websocket/WebSocketManager';

const WebSocketStatus: React.FC = () => {
  const { 
    connectionState, 
    isConnected, 
    isConnecting, 
    isReconnecting, 
    connectionTime, 
    lastError 
  } = useWebSocketStatus();

  const getStatusBadge = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return <Badge bg="success">Connected</Badge>;
      case ConnectionState.CONNECTING:
        return <Badge bg="warning">Connecting...</Badge>;
      case ConnectionState.RECONNECTING:
        return <Badge bg="info">Reconnecting...</Badge>;
      case ConnectionState.DISCONNECTED:
        return <Badge bg="secondary">Disconnected</Badge>;
      case ConnectionState.ERROR:
        return <Badge bg="danger">Error</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0">WebSocket Status</h6>
          {getStatusBadge()}
        </div>
      </Card.Header>
      <Card.Body>
        <div className="row g-2">
          <div className="col-md-6">
            <small className="text-muted">Connection State:</small>
            <div>{connectionState}</div>
          </div>
          <div className="col-md-6">
            <small className="text-muted">Status:</small>
            <div>{isConnected ? 'Online' : 'Offline'}</div>
          </div>
          {connectionTime && (
            <div className="col-md-6">
              <small className="text-muted">Connected Since:</small>
              <div>{connectionTime.toLocaleTimeString()}</div>
            </div>
          )}
          {lastError && (
            <div className="col-12">
              <small className="text-danger">Last Error:</small>
              <div className="small text-danger">
                {lastError.timestamp?.toLocaleTimeString()} - {lastError.state}
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WebSocketStatus;
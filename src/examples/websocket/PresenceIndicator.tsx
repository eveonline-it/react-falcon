import React, { useEffect, useState } from 'react';
import { Card, Badge, ListGroup, Button, ButtonGroup } from 'react-bootstrap';
import { usePresence } from '../../hooks/websocket';
import { useAuth } from '../../contexts/AuthContext';

const PresenceIndicator: React.FC = () => {
  const { user, characterName } = useAuth();
  const { updatePresence, presence, myStatus } = usePresence({ 
    userId: user?.toString(),
    onPresenceChange: (presenceData) => {
      console.log('Presence updated:', presenceData);
    }
  });

  const [watchedUsers] = useState<string[]>(['1001', '1002', '1003']); // Example user IDs

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'offline':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'away':
        return '🟡';
      case 'offline':
        return '⚪';
      default:
        return '❓';
    }
  };

  const handleStatusChange = async (newStatus: 'online' | 'away' | 'offline') => {
    try {
      await updatePresence(newStatus);
    } catch (error) {
      console.error('Failed to update presence:', error);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <h6 className="mb-0">User Presence</h6>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <strong>{characterName || 'You'}</strong>
              <div className="small text-muted">Your Status</div>
            </div>
            <Badge bg={getStatusColor(myStatus || 'offline')} className="d-flex align-items-center gap-1">
              {getStatusIcon(myStatus || 'offline')} {myStatus || 'offline'}
            </Badge>
          </div>
          
          <ButtonGroup size="sm" className="w-100">
            <Button 
              variant={myStatus === 'online' ? 'success' : 'outline-success'}
              onClick={() => handleStatusChange('online')}
            >
              🟢 Online
            </Button>
            <Button 
              variant={myStatus === 'away' ? 'warning' : 'outline-warning'}
              onClick={() => handleStatusChange('away')}
            >
              🟡 Away
            </Button>
            <Button 
              variant={myStatus === 'offline' ? 'secondary' : 'outline-secondary'}
              onClick={() => handleStatusChange('offline')}
            >
              ⚪ Offline
            </Button>
          </ButtonGroup>
        </div>

        <div>
          <div className="small text-muted mb-2">Other Users</div>
          {presence.size === 0 ? (
            <div className="text-center text-muted py-3">
              <small>No other users online</small>
            </div>
          ) : (
            <ListGroup variant="flush">
              {Array.from(presence.entries()).map(([userId, presenceData]) => (
                <ListGroup.Item key={userId} className="px-0 py-2 border-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-medium">User {userId}</div>
                      {presenceData.lastSeen && (
                        <small className="text-muted">
                          Last seen: {new Date(presenceData.lastSeen).toLocaleString()}
                        </small>
                      )}
                    </div>
                    <Badge 
                      bg={getStatusColor(presenceData.status)} 
                      className="d-flex align-items-center gap-1"
                    >
                      {getStatusIcon(presenceData.status)} {presenceData.status}
                    </Badge>
                  </div>
                  {presenceData.metadata && Object.keys(presenceData.metadata).length > 0 && (
                    <div className="mt-1">
                      <small className="text-muted">
                        {JSON.stringify(presenceData.metadata)}
                      </small>
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PresenceIndicator;
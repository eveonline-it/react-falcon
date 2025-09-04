import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import WebSocketStatus from './WebSocketStatus';
import RealTimeChat from './RealTimeChat';
import PresenceIndicator from './PresenceIndicator';

const WebSocketDemo: React.FC = () => {
  const { isAuthenticated, characterName } = useAuth();

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>You must be logged in to use WebSocket features. Please log in to continue.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>WebSocket Demo</h2>
          <p className="text-muted">
            Real-time communication features for {characterName}
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={4}>
          <WebSocketStatus />
          <PresenceIndicator />
        </Col>
        
        <Col lg={8}>
          <Row className="g-4">
            <Col md={6}>
              <RealTimeChat 
                roomId="general" 
                roomName="General Chat"
              />
            </Col>
            <Col md={6}>
              <RealTimeChat 
                roomId="dev-team" 
                roomName="Dev Team"
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Alert variant="info">
            <Alert.Heading>WebSocket Features</Alert.Heading>
            <ul className="mb-0">
              <li><strong>Connection Status:</strong> Real-time connection monitoring with auto-reconnection</li>
              <li><strong>Room-based Chat:</strong> Join/leave rooms automatically with message history</li>
              <li><strong>User Presence:</strong> Track online/away/offline status with automatic updates</li>
              <li><strong>Personal Rooms:</strong> Automatic subscription to user-specific rooms</li>
              <li><strong>TanStack Query Integration:</strong> Real-time cache updates from WebSocket messages</li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default WebSocketDemo;
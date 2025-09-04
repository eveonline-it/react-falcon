import React from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { 
  broadcastActions, 
  useBroadcastOverallStatus,
  useBroadcastSystemMetrics,
  useBroadcastServices,
  useBroadcastAlerts,
  useBroadcastNotifications, 
  useBroadcastError 
} from '../stores/broadcastStore';
import BroadcastStatusMonitor from '../components/broadcast/BroadcastStatusMonitor';
import BroadcastTest from '../components/broadcast/BroadcastTest';
import { useWebSocketStatus } from '../hooks/websocket/useWebSocketStatus';
import { useBroadcast } from '../hooks/websocket/useBroadcast';
import { useAuth } from '../contexts/AuthContext';
import { getWebSocketUrl } from '../utils/websocketConfig';

const BroadcastTestPage: React.FC = () => {
  const overallStatus = useBroadcastOverallStatus();
  const systemMetrics = useBroadcastSystemMetrics();
  const services = useBroadcastServices();
  const alerts = useBroadcastAlerts();
  const notifications = useBroadcastNotifications();
  const error = useBroadcastError();

  // Use existing WebSocket system
  const { isConnected, connectionState, isReconnecting } = useWebSocketStatus();
  const { isAuthenticated } = useAuth();
  
  // Initialize broadcast subscriptions
  useBroadcast();

  // Test data generators
  const generateTestBackendStatus = () => {
    const testData = {
      type: 'backend_status' as const,
      overall_status: ['healthy', 'degraded', 'unhealthy'][Math.floor(Math.random() * 3)] as 'healthy' | 'degraded' | 'unhealthy',
      system_metrics: {
        memory_usage: Math.random() * 2000 + 100,
        cpu_usage: Math.floor(Math.random() * 100),
        active_connections: Math.floor(Math.random() * 1000),
        uptime_formatted: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`
      },
      services: {
        'database': {
          module: 'PostgreSQL Database',
          status: ['healthy', 'degraded', 'unhealthy'][Math.floor(Math.random() * 3)] as 'healthy' | 'degraded' | 'unhealthy',
          response_time: `${Math.floor(Math.random() * 100 + 5)}ms`,
          message: Math.random() > 0.7 ? 'Connection pool at capacity' : undefined,
          last_checked: new Date().toISOString()
        },
        'redis': {
          module: 'Redis Cache',
          status: ['healthy', 'degraded'][Math.floor(Math.random() * 2)] as 'healthy' | 'degraded',
          response_time: `${Math.floor(Math.random() * 20 + 1)}ms`,
          last_checked: new Date().toISOString()
        },
        'api': {
          module: 'REST API Server',
          status: 'healthy' as const,
          response_time: `${Math.floor(Math.random() * 50 + 10)}ms`,
          last_checked: new Date().toISOString()
        },
        'websocket': {
          module: 'WebSocket Server',
          status: 'healthy' as const,
          response_time: `${Math.floor(Math.random() * 30 + 5)}ms`,
          last_checked: new Date().toISOString()
        }
      },
      alerts: Math.random() > 0.6 ? [
        'High memory usage detected',
        'Slow database queries detected'
      ].slice(0, Math.floor(Math.random() * 2) + 1) : []
    };
    
    broadcastActions.handleBackendStatus(testData);
  };

  const generateTestCriticalAlert = () => {
    const alerts = [
      'Database connection pool exhausted!',
      'High CPU usage detected - server may be overloaded',
      'Redis cache is down - falling back to database',
      'Multiple service timeouts detected',
      'Disk space critically low on server'
    ];
    
    const testData = {
      type: 'critical_alert' as const,
      message: alerts[Math.floor(Math.random() * alerts.length)]
    };
    
    broadcastActions.handleCriticalAlert(testData);
  };

  const generateTestServiceRecovery = () => {
    const services = ['Database', 'Redis Cache', 'API Server', 'WebSocket Server', 'File Storage'];
    
    const testData = {
      type: 'service_recovery' as const,
      service: services[Math.floor(Math.random() * services.length)]
    };
    
    broadcastActions.handleServiceRecovery(testData);
  };

  const clearAllData = () => {
    broadcastActions.resetBroadcastState();
  };

  return (
    <Container fluid className="py-4">
      {/* Store Test */}
      <Row className="mb-4">
        <Col>
          <BroadcastTest />
        </Col>
      </Row>

      {/* Test Controls */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">
                <i className="fas fa-vial me-2"></i>
                Broadcast System Test Controls
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">WebSocket Status</h5>
                  <div className="mb-3">
                    <div className="mb-2">
                      <strong>WebSocket URL:</strong> 
                      <code className="ms-2">{getWebSocketUrl()}</code>
                    </div>
                    <div className="text-muted small">
                      <i className="fas fa-info-circle me-1"></i>
                      Configured via <code>VITE_WS_URL</code> environment variable
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="mb-2">
                      <strong>Connection Status:</strong>
                      <span className={`ms-2 badge ${
                        isConnected ? 'bg-success' : 
                        isReconnecting ? 'bg-warning' : 
                        'bg-secondary'
                      }`}>
                        {connectionState}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Authentication Status:</strong>
                      <span className={`ms-2 badge ${isAuthenticated ? 'bg-success' : 'bg-danger'}`}>
                        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                    <div className="text-muted small">
                      <i className="fas fa-shield-alt me-1"></i>
                      Connection automatically managed by authentication status
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <h5 className="mb-3">Test Data Generation</h5>
                  <div className="d-flex flex-column gap-2">
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={generateTestBackendStatus}
                    >
                      <i className="fas fa-server me-1"></i>
                      Generate Backend Status
                    </Button>
                    <Button 
                      variant="warning" 
                      size="sm"
                      onClick={generateTestCriticalAlert}
                    >
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Generate Critical Alert
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={generateTestServiceRecovery}
                    >
                      <i className="fas fa-check-circle me-1"></i>
                      Generate Service Recovery
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={clearAllData}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Clear All Data
                    </Button>
                  </div>
                </Col>
              </Row>
              
              {error && (
                <Alert variant="danger" className="mt-3">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <strong>Error:</strong> {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Current State Display */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Current Broadcast Store State
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Connection State</h6>
                  <ul className="list-unstyled">
                    <li><strong>WebSocket:</strong> {connectionState}</li>
                    <li><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</li>
                    <li><strong>Overall Status:</strong> 
                      <span className={`ms-1 badge bg-${overallStatus === 'healthy' ? 'success' : overallStatus === 'degraded' ? 'warning' : overallStatus === 'unhealthy' ? 'danger' : 'secondary'}`}>
                        {overallStatus}
                      </span>
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Data State</h6>
                  <ul className="list-unstyled">
                    <li><strong>System Metrics:</strong> {systemMetrics ? 'Available' : 'None'}</li>
                    <li><strong>Services Count:</strong> {Object.keys(services).length}</li>
                    <li><strong>Active Alerts:</strong> {alerts.length}</li>
                    <li><strong>Notifications:</strong> {notifications.length}</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Instructions */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <Alert.Heading>
              <i className="fas fa-lightbulb me-2"></i>
              How to Test
            </Alert.Heading>
            <p className="mb-2">This page demonstrates the integrated broadcast system:</p>
            <ol className="mb-0">
              <li><strong>Authentication-Based Connection:</strong> WebSocket automatically connects when you're authenticated and disconnects when you log out</li>
              <li><strong>Real-Time Messages:</strong> When connected, the system receives live broadcast messages from the backend</li>
              <li><strong>Simulated Data:</strong> Use the "Generate" buttons to simulate incoming broadcast messages and see how the UI responds</li>
              <li><strong>State Inspection:</strong> Monitor the "Current Broadcast Store State" section to see how Zustand state updates</li>
              <li><strong>UI Testing:</strong> Scroll down to see the full broadcast status monitor interface in action</li>
              <li><strong>Existing Integration:</strong> Uses the same WebSocketManager as the rest of the application - no duplicate connections</li>
            </ol>
          </Alert>
        </Col>
      </Row>

      {/* Main Broadcast Monitor */}
      <BroadcastStatusMonitor 
        showConnectionStatus={true}
        showNotifications={true}
      />
    </Container>
  );
};

export default BroadcastTestPage;
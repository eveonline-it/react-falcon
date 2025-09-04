import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useWebSocketStatus } from '../hooks/websocket/useWebSocketStatus';
import { useWebSocketContext } from '../providers/WebSocketProvider';
import { useAuth } from '../contexts/AuthContext';
import { getWebSocketUrl } from '../utils/websocketConfig';

interface BackendStatusData {
  overall_status?: 'healthy' | 'degraded' | 'unhealthy';
  system_metrics?: {
    cpu_usage: number;
    memory_usage: number;
    active_connections: number;
    uptime_seconds: number;
    uptime_formatted: string;
  };
  services?: Record<
    string,
    {
      module: string;
      status: 'healthy' | 'degraded' | 'unhealthy';
      response_time: string;
      message?: string;
      last_checked: string;
      stats?: any;
    }
  >;
  alerts?: string[];
}

const BroadcastTestPage: React.FC = () => {
  const [backendData, setBackendData] = useState<BackendStatusData | null>(
    null
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use existing WebSocket system
  const { isConnected, connectionState, isReconnecting } = useWebSocketStatus();
  const { subscribeToType } = useWebSocketContext();
  const { isAuthenticated } = useAuth();

  // Subscribe to system_notification messages directly
  useEffect(() => {
    const unsubscribe = subscribeToType('system_notification', message => {
      try {
        console.log('🔌 Received system_notification:', message);

        // Extract backend status data from nested structure
        const nestedData = message.data?.data;

        setBackendData({
          overall_status: nestedData.overall_status,
          system_metrics: nestedData.system_metrics,
          services: nestedData.services,
          alerts: nestedData.alerts
        });
        setLastUpdate(new Date());
        setError(null);
        console.log('✅ Backend data updated:', nestedData);
      } catch (err) {
        console.error('❌ Failed to process system_notification:', err);
        setError('Failed to process WebSocket message');
      }
    });

    return unsubscribe;
  }, [subscribeToType]);

  return (
    <Container fluid className="py-4">
      {/* WebSocket Status */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">
                <i className="fas fa-wifi me-2"></i>
                WebSocket Status
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="mb-2">
                      <strong>WebSocket URL:</strong>
                      <code className="ms-2">{getWebSocketUrl()}</code>
                    </div>
                    <div className="mb-2">
                      <strong>Connection Status:</strong>
                      <span
                        className={`ms-2 badge ${
                          isConnected
                            ? 'bg-success'
                            : isReconnecting
                              ? 'bg-warning'
                              : 'bg-secondary'
                        }`}
                      >
                        {connectionState}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Authentication Status:</strong>
                      <span
                        className={`ms-2 badge ${isAuthenticated ? 'bg-success' : 'bg-danger'}`}
                      >
                        {isAuthenticated
                          ? 'Authenticated'
                          : 'Not Authenticated'}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="mb-2">
                      <strong>Overall Backend Status:</strong>
                      <span
                        className={`ms-2 badge bg-${
                          backendData?.overall_status === 'healthy'
                            ? 'success'
                            : backendData?.overall_status === 'degraded'
                              ? 'warning'
                              : backendData?.overall_status === 'unhealthy'
                                ? 'danger'
                                : 'secondary'
                        }`}
                      >
                        {backendData?.overall_status || 'Unknown'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Services:</strong>{' '}
                      {backendData?.services
                        ? Object.keys(backendData.services).length
                        : 0}
                    </div>
                    <div className="mb-2">
                      <strong>Active Alerts:</strong>{' '}
                      {backendData?.alerts?.length || 0}
                    </div>
                    <div className="mb-2">
                      <strong>Last Update:</strong>{' '}
                      {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                    </div>
                  </div>
                </Col>
              </Row>

              {error && (
                <Alert variant="danger" className="mt-3">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  <strong>WebSocket Error:</strong> {error}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Metrics */}
      {backendData?.system_metrics && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <Card.Title className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  System Metrics
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="card-title">CPU Usage</h5>
                        <h3 className="text-primary">
                          {backendData.system_metrics.cpu_usage}%
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="card-title">Memory Usage</h5>
                        <h3 className="text-warning">
                          {backendData.system_metrics.memory_usage.toFixed(1)}MB
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="card-title">Active Connections</h5>
                        <h3 className="text-info">
                          {backendData.system_metrics.active_connections}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <h5 className="card-title">Uptime</h5>
                        <h3 className="text-success">
                          {backendData.system_metrics.uptime_formatted}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Services Status */}
      {backendData?.services && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <Card.Title className="mb-0">
                  <i className="fas fa-cogs me-2"></i>
                  Services Status
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(backendData.services).map(
                    ([serviceName, service]) => (
                      <Col md={4} key={serviceName} className="mb-3">
                        <Card className="h-100">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{service.module}</span>
                            <span
                              className={`badge bg-${
                                service.status === 'healthy'
                                  ? 'success'
                                  : service.status === 'degraded'
                                    ? 'warning'
                                    : 'danger'
                              }`}
                            >
                              {service.status}
                            </span>
                          </Card.Header>
                          <Card.Body>
                            <div className="small">
                              <div className="mb-1">
                                <strong>Response Time:</strong>{' '}
                                {service.response_time}
                              </div>
                              {service.message && (
                                <div className="mb-1">
                                  <strong>Message:</strong> {service.message}
                                </div>
                              )}
                              {service.stats && (
                                <div className="mb-1">
                                  <strong>Stats:</strong>
                                  <pre className="mt-1 p-1 bg-light small">
                                    {JSON.stringify(service.stats, null, 2)}
                                  </pre>
                                </div>
                              )}
                              <div className="text-muted">
                                Last checked:{' '}
                                {new Date(
                                  service.last_checked
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Alerts */}
      {backendData?.alerts && backendData.alerts.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <Card.Title className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Active Alerts ({backendData.alerts.length})
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {backendData.alerts.map((alert, index) => (
                  <Alert key={index} variant="warning" className="mb-2">
                    <i className="fas fa-warning me-2"></i>
                    {alert}
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Raw Data Debug */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">
                <i className="fas fa-bug me-2"></i>
                Raw WebSocket Data
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <pre className="bg-light p-2 small">
                {backendData
                  ? JSON.stringify(backendData, null, 2)
                  : 'No backend data received yet'}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Connection Debug */}
      {!isConnected && isAuthenticated && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Debug Info:</strong> You are authenticated but WebSocket
              is not connected. Backend may not be running or WebSocket URL may
              be incorrect.
            </Alert>
          </Col>
        </Row>
      )}

      {!isAuthenticated && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Note:</strong> WebSocket only connects when authenticated.
              Please log in to receive backend data.
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default BroadcastTestPage;

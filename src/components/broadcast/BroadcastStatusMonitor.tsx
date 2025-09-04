import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useBroadcastOverallStatus } from '../../stores/broadcastStore';
import { useBroadcast } from '../../hooks/websocket/useBroadcast';

import ConnectionStatus from './ConnectionStatus';
import SystemMetrics from './SystemMetrics';
import ServicesGrid from './ServicesGrid';
import AlertsSection from './AlertsSection';
import NotificationList from './NotificationList';

interface BroadcastStatusMonitorProps {
  showConnectionStatus?: boolean;
  showNotifications?: boolean;
}

const BroadcastStatusMonitor: React.FC<BroadcastStatusMonitorProps> = ({
  showConnectionStatus = true,
  showNotifications = true
}) => {
  const overallStatus = useBroadcastOverallStatus();
  
  // Initialize broadcast message subscriptions
  useBroadcast();

  const getOverallStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'danger';
      default: return 'secondary';
    }
  };

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'degraded': return '#FF9800';
      case 'unhealthy': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <>
      {showConnectionStatus && <ConnectionStatus />}
      {showNotifications && <NotificationList />}
      
      <Container fluid className="broadcast-status-monitor">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body className="py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div 
                      className="status-indicator me-3"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: getOverallStatusColor(overallStatus)
                      }}
                    ></div>
                    <div>
                      <h3 className="mb-1">Backend Status Monitor</h3>
                      <div className="d-flex align-items-center gap-3">
                        <Badge bg={getOverallStatusVariant(overallStatus)} className="d-flex align-items-center gap-1">
                          {getOverallStatusIcon(overallStatus)} Overall Status: {overallStatus}
                        </Badge>
                        <small className="text-muted">
                          Real-time system monitoring and alerts
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <div className="text-muted small">
                      <i className="fas fa-info-circle me-1"></i>
                      Connection managed by authentication
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* System Metrics */}
        <Row className="mb-4">
          <Col>
            <SystemMetrics />
          </Col>
        </Row>

        {/* Alerts Section */}
        <Row className="mb-4">
          <Col>
            <AlertsSection />
          </Col>
        </Row>

        {/* Services Grid */}
        <Row>
          <Col>
            <ServicesGrid />
          </Col>
        </Row>

        {/* Footer */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 bg-light">
              <Card.Body className="py-2">
                <div className="text-center text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  This page displays real-time system status information via WebSocket connection.
                  Data updates automatically as the backend status changes.
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BroadcastStatusMonitor;
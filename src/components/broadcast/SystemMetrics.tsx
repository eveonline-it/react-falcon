import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { useBroadcastSystemMetrics } from '../../stores/broadcastStore';

const SystemMetrics: React.FC = () => {
  const systemMetrics = useBroadcastSystemMetrics();

  if (!systemMetrics) {
    return (
      <Card className="mb-3">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="fas fa-server me-2"></i>
            System Metrics
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted py-3">
            <i className="fas fa-spinner fa-spin me-2"></i>
            Waiting for system metrics data...
          </div>
        </Card.Body>
      </Card>
    );
  }

  const getMemoryColor = (usage: number) => {
    if (usage < 500) return 'success';
    if (usage < 1000) return 'warning';
    return 'danger';
  };

  const getCpuColor = (usage: number) => {
    if (usage < 50) return 'success';
    if (usage < 80) return 'warning';
    return 'danger';
  };

  const getConnectionsColor = (connections: number) => {
    if (connections < 100) return 'success';
    if (connections < 500) return 'warning';
    return 'danger';
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">
          <i className="fas fa-server me-2"></i>
          System Metrics
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} lg={3} className="mb-3">
            <div className="metric-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="metric-label">
                  <i className="fas fa-memory me-1"></i>
                  Memory Usage
                </span>
                <span className="fw-bold">{systemMetrics.memory_usage.toFixed(1)} MB</span>
              </div>
              <ProgressBar 
                variant={getMemoryColor(systemMetrics.memory_usage)}
                now={(systemMetrics.memory_usage / 2000) * 100} // Assuming 2GB max
                style={{ height: '6px' }}
              />
            </div>
          </Col>
          
          <Col md={6} lg={3} className="mb-3">
            <div className="metric-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="metric-label">
                  <i className="fas fa-microchip me-1"></i>
                  CPU Usage
                </span>
                <span className="fw-bold">{systemMetrics.cpu_usage}%</span>
              </div>
              <ProgressBar 
                variant={getCpuColor(systemMetrics.cpu_usage)}
                now={systemMetrics.cpu_usage}
                style={{ height: '6px' }}
              />
            </div>
          </Col>
          
          <Col md={6} lg={3} className="mb-3">
            <div className="metric-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="metric-label">
                  <i className="fas fa-network-wired me-1"></i>
                  Active Connections
                </span>
                <span className="fw-bold">{systemMetrics.active_connections}</span>
              </div>
              <ProgressBar 
                variant={getConnectionsColor(systemMetrics.active_connections)}
                now={(systemMetrics.active_connections / 1000) * 100} // Assuming 1000 max connections
                style={{ height: '6px' }}
              />
            </div>
          </Col>
          
          <Col md={6} lg={3} className="mb-3">
            <div className="metric-item">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="metric-label">
                  <i className="fas fa-clock me-1"></i>
                  Uptime
                </span>
                <span className="fw-bold">{systemMetrics.uptime_formatted}</span>
              </div>
              <div className="text-success" style={{ height: '6px', fontSize: '0.8rem' }}>
                System running normally
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="mt-3 pt-2 border-top">
          <div className="text-muted small">
            <i className="fas fa-info-circle me-1"></i>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SystemMetrics;
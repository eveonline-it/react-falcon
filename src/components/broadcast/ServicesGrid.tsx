import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { useBroadcastServices } from '../../stores/broadcastStore';

const ServicesGrid: React.FC = () => {
  const services = useBroadcastServices();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'unhealthy': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'degraded': return '#FF9800';
      case 'unhealthy': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const serviceEntries = Object.entries(services);

  if (serviceEntries.length === 0) {
    return (
      <Card className="mb-3">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="fas fa-cogs me-2"></i>
            Services Status
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="text-center text-muted py-3">
            <i className="fas fa-spinner fa-spin me-2"></i>
            Loading services data...
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">
          <i className="fas fa-cogs me-2"></i>
          Services Status
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Row>
          {serviceEntries.map(([serviceName, service]) => (
            <Col key={serviceName} md={6} lg={4} className="mb-3">
              <Card className="h-100" style={{ borderLeft: `4px solid ${getStatusColor(service.status)}` }}>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      <span 
                        className="status-indicator me-2"
                        style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(service.status)
                        }}
                      ></span>
                      <span className="fw-bold">{service.module}</span>
                    </div>
                    <Badge bg={getStatusVariant(service.status)}>
                      {getStatusIcon(service.status)} {service.status}
                    </Badge>
                  </div>
                  
                  <div className="service-details">
                    <div className="mb-1">
                      <small className="text-muted">Response Time:</small>
                      <span className="ms-1">{service.response_time}</span>
                    </div>
                    
                    {service.message && (
                      <div className="mb-1">
                        <small className="text-muted">Message:</small>
                        <div className="ms-1 small text-break">{service.message}</div>
                      </div>
                    )}
                    
                    <div className="mb-1">
                      <small className="text-muted">Last Checked:</small>
                      <div className="ms-1 small">
                        {new Date(service.last_checked).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        <div className="mt-3 pt-2 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              <i className="fas fa-info-circle me-1"></i>
              Total Services: {serviceEntries.length}
            </div>
            <div className="d-flex gap-3">
              <Badge bg="success" className="d-flex align-items-center gap-1">
                <span style={{ fontSize: '10px' }}>●</span>
                Healthy: {serviceEntries.filter(([, s]) => s.status === 'healthy').length}
              </Badge>
              <Badge bg="warning" className="d-flex align-items-center gap-1">
                <span style={{ fontSize: '10px' }}>●</span>
                Degraded: {serviceEntries.filter(([, s]) => s.status === 'degraded').length}
              </Badge>
              <Badge bg="danger" className="d-flex align-items-center gap-1">
                <span style={{ fontSize: '10px' }}>●</span>
                Unhealthy: {serviceEntries.filter(([, s]) => s.status === 'unhealthy').length}
              </Badge>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServicesGrid;
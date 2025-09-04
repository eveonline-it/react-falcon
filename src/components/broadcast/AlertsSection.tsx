import React from 'react';
import { Alert, Card } from 'react-bootstrap';
import { useBroadcastAlerts } from '../../stores/broadcastStore';

const AlertsSection: React.FC = () => {
  const alerts = useBroadcastAlerts();

  if (!alerts || alerts.length === 0) {
    return null; // Don't render if no alerts
  }

  return (
    <Card className="mb-3">
      <Card.Header className="bg-warning text-dark">
        <Card.Title className="mb-0">
          <i className="fas fa-exclamation-triangle me-2"></i>
          System Alerts
          <span className="badge bg-dark ms-2">{alerts.length}</span>
        </Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        {alerts.map((alert, index) => (
          <Alert key={index} variant="warning" className="m-2 mb-2">
            <div className="d-flex align-items-start">
              <i className="fas fa-exclamation-triangle me-2 mt-1" style={{ fontSize: '14px' }}></i>
              <div className="flex-grow-1">
                <div className="alert-content">{alert}</div>
                <div className="text-muted small mt-1">
                  Alert #{index + 1} • {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </Card.Body>
    </Card>
  );
};

export default AlertsSection;
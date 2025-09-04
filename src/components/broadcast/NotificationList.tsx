import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useBroadcastNotifications, useBroadcastStore } from '../../stores/broadcastStore';

const NotificationList: React.FC = () => {
  const notifications = useBroadcastNotifications();
  const { removeNotification } = useBroadcastStore();

  const getToastVariant = (type: string) => {
    switch (type) {
      case 'critical': return 'danger';
      case 'recovery': return 'success';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'recovery': return '✅';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getToastTitle = (type: string) => {
    switch (type) {
      case 'critical': return 'Critical Alert';
      case 'recovery': return 'Service Recovery';
      case 'warning': return 'System Warning';
      default: return 'System Notification';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <ToastContainer 
      position="top-end" 
      className="p-3"
      style={{ zIndex: 1055, position: 'fixed', top: '60px' }}
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          bg={getToastVariant(notification.type)}
          onClose={() => removeNotification(notification.id)}
          delay={10000}
          autohide
          className="mb-2"
        >
          <Toast.Header>
            <span className="me-2">{getToastIcon(notification.type)}</span>
            <strong className="me-auto">{getToastTitle(notification.type)}</strong>
            <small className="text-muted">
              {notification.timestamp.toLocaleTimeString()}
            </small>
          </Toast.Header>
          <Toast.Body 
            className={notification.type === 'critical' || notification.type === 'recovery' ? 'text-white' : ''}
          >
            <div className="notification-message">
              {notification.message}
            </div>
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default NotificationList;
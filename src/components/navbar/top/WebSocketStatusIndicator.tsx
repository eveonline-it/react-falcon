// React 19 JSX Transform - no explicit React import needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import useWebSocketStatus from 'hooks/websocket/useWebSocketStatus';

const WebSocketStatusIndicator = () => {
  const { isConnected, isConnecting, isReconnecting, hasError } = useWebSocketStatus();

  // Determine icon color and indicator class based on connection state
  const getStatusClasses = () => {
    if (isConnected) {
      return {
        indicatorClass: 'notification-indicator notification-indicator-success',
        iconClass: 'text-success'
      };
    }
    if (isConnecting || isReconnecting) {
      return {
        indicatorClass: 'notification-indicator notification-indicator-warning',
        iconClass: 'text-warning'
      };
    }
    if (hasError) {
      return {
        indicatorClass: 'notification-indicator notification-indicator-danger',
        iconClass: 'text-danger'
      };
    }
    // Disconnected
    return {
      indicatorClass: 'notification-indicator notification-indicator-danger',
      iconClass: 'text-danger'
    };
  };

  const getTooltipText = () => {
    if (isConnected) return 'WebSocket Connected';
    if (isConnecting) return 'WebSocket Connecting...';
    if (isReconnecting) return 'WebSocket Reconnecting...';
    if (hasError) return 'WebSocket Error';
    return 'WebSocket Disconnected';
  };

  const { indicatorClass, iconClass } = getStatusClasses();

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip>{getTooltipText()}</Tooltip>}
    >
      <li className="nav-item">
        <span
          className={classNames('px-0 nav-link', indicatorClass)}
          style={{ cursor: 'default' }}
        >
          <FontAwesomeIcon 
            icon="network-wired" 
            transform="shrink-6" 
            className={classNames('fs-5', iconClass)} 
          />
        </span>
      </li>
    </OverlayTrigger>
  );
};

export default WebSocketStatusIndicator;
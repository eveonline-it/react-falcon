// React 19 JSX Transform - no explicit React import needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import useWebSocketStatus from 'hooks/websocket/useWebSocketStatus';

const WebSocketStatusIndicator = () => {
  const { isConnected, isConnecting, isReconnecting, hasError } = useWebSocketStatus();

  // Determine indicator class based on connection state
  const getIndicatorClass = () => {
    if (isConnected) {
      return 'notification-indicator notification-indicator-success';
    }
    if (isConnecting || isReconnecting) {
      return 'notification-indicator notification-indicator-warning';
    }
    // Disconnected or Error
    return 'notification-indicator notification-indicator-danger';
  };

  const getTooltipText = () => {
    if (isConnected) return 'WebSocket Connected';
    if (isConnecting) return 'WebSocket Connecting...';
    if (isReconnecting) return 'WebSocket Reconnecting...';
    if (hasError) return 'WebSocket Error';
    return 'WebSocket Disconnected';
  };

  const indicatorClass = getIndicatorClass();

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
            className="fs-5" 
          />
        </span>
      </li>
    </OverlayTrigger>
  );
};

export default WebSocketStatusIndicator;
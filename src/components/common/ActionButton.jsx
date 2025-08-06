import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const ActionButton = ({ placement = 'top', title, icon, ...rest }) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={<Tooltip style={{ position: 'fixed' }}>{title}</Tooltip>}
    >
      <Button {...rest}>
        <FontAwesomeIcon icon={icon} />
      </Button>
    </OverlayTrigger>
  );
};

export default ActionButton;

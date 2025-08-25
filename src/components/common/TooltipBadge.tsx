import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Placement } from 'react-bootstrap/esm/types';

interface TooltipBadgeProps {
  placement?: Placement;
  tooltip: React.ReactNode;
  icon: IconProp;
  color?: string;
}

const TooltipBadge: React.FC<TooltipBadgeProps> = ({
  placement = 'top',
  tooltip,
  icon,
  color = 'primary'
}) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={<Tooltip style={{ position: 'fixed' }}>{tooltip}</Tooltip>}
    >
      <span>
        <FontAwesomeIcon
          icon={icon}
          transform="shrink-2"
          className={`text-${color} ms-1`}
        />
      </span>
    </OverlayTrigger>
  );
};

export default TooltipBadge;

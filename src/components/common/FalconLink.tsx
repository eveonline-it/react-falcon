import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface FalconLinkProps {
  to?: string;
  icon?: IconProp;
  title: React.ReactNode;
  className?: string;
}

const FalconLink: React.FC<FalconLinkProps> = ({
  to = '#!',
  icon = 'chevron-right',
  title,
  className
}) => {
  return (
    <Button variant="link" size="sm" as={Link as any} to={to} className={className}>
      {title}
      <FontAwesomeIcon icon={icon} className="ms-1 fs-11" />
    </Button>
  );
};

export default FalconLink;

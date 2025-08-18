import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FalconLink = ({
  to = '#!',
  icon = 'chevron-right',
  title,
  className
}) => {
  return (
    <Button variant="link" size="sm" as={Link} to={to} className={className}>
      {title}
      <FontAwesomeIcon icon={icon} className="ms-1 fs-11" />
    </Button>
  );
};

export default FalconLink;

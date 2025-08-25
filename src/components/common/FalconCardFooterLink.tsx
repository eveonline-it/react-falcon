import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

interface FalconCardFooterLinkProps {
  title: React.ReactNode;
  bg?: string;
  borderTop?: boolean;
  to?: string;
  className?: string;
  [key: string]: any;
}

const FalconCardFooterLink: React.FC<FalconCardFooterLinkProps> = ({
  title,
  bg = 'body-tertiary',
  borderTop,
  to = '#!',
  className,
  ...rest
}) => (
  <Card.Footer
    className={classNames(className, `bg-${bg} p-0`, {
      'border-top': borderTop
    })}
  >
    <Button
      as={Link as any}
      variant="link"
      size="lg"
      to={to}
      className="w-100 py-2"
      {...rest}
    >
      {title}
      <FontAwesomeIcon icon="chevron-right" className="ms-1 fs-11" />
    </Button>
  </Card.Footer>
);

export default FalconCardFooterLink;

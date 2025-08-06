import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, CloseButton } from 'react-bootstrap';
import classNames from 'classnames';

const IconAlert = ({
  variant,
  dismissible,
  children,
  className,
  onClose,
  ...rest
}) => {
  const icon = {
    success: 'check-circle',
    info: 'info-circle',
    warning: 'exclamation-circle',
    danger: 'times-circle'
  };
  return (
    <Alert
      variant={variant}
      className={classNames(className, 'd-flex align-items-center')}
      {...rest}
    >
      <div
        className={`bg-${variant} d-flex flex-center me-3 rounded-circle shadow-sm border-0`}
        style={{ height: '2.5rem', width: '2.5rem' }}
      >
        <FontAwesomeIcon icon={icon[variant]} className="text-white fs-6" />
      </div>
      <div className="flex-1">{children}</div>
      {dismissible && <CloseButton onClick={onClose} />}
    </Alert>
  );
};

export default IconAlert;

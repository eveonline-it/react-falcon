import React from 'react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconButton = (
  { icon, iconAlign = 'left', iconClassName, transform, children, ref, ...rest }
) => (
  <Button {...rest} ref={ref}>
    {iconAlign === 'right' && children}
    <FontAwesomeIcon
      icon={icon}
      className={classNames(iconClassName, {
        'me-1': children && iconAlign === 'left',
        'ms-1': children && iconAlign === 'right'
      })}
      transform={transform}
    />
    {iconAlign === 'left' || iconAlign === 'middle' ? children : false}
  </Button>
);

export default IconButton;

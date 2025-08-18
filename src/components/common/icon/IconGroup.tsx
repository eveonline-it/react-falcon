import React from 'react';
import classNames from 'classnames';
import IconItem from './IconItem';

const IconGroup = ({ icons, className, ...rest }) => (
  <div className={classNames('icon-group', className)} {...rest}>
    {icons.map((icon, index) => (
      <IconItem {...icon} key={index} />
    ))}
  </div>
);

export default IconGroup;

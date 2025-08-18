import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const IconItem = ({
  tag: Tag = 'a',
  icon,
  bg,
  size,
  color,
  className,
  transform,
  iconClass,
  onClick,
  ...rest
}) => (
  <Tag
    className={classNames(className, 'icon-item', {
      [`icon-item-${size}`]: size,
      [`bg-${bg}`]: bg,
      [`text-${color}`]: color
    })}
    {...rest}
    onClick={onClick}
  >
    <FontAwesomeIcon icon={icon} transform={transform} className={iconClass} />
  </Tag>
);

export default IconItem;

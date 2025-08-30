import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface IconItemProps extends React.HTMLAttributes<HTMLElement> {
  tag?: React.ElementType;
  icon: IconProp;
  bg?: string;
  size?: string | number;
  color?: string;
  transform?: any;
  iconClass?: string;
}

const IconItem: React.FC<IconItemProps> = ({
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
}) => {
  return React.createElement(
    Tag,
    {
      className: classNames(className, 'icon-item', {
        [`icon-item-${size}`]: size,
        [`bg-${bg}`]: bg,
        [`text-${color}`]: color
      }),
      onClick,
      ...rest
    },
    React.createElement(FontAwesomeIcon, { icon, transform, className: iconClass })
  );
};

export default IconItem;

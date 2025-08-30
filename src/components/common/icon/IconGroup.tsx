import React from 'react';
import classNames from 'classnames';
import IconItem from './IconItem';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface IconData {
  icon: IconProp;
  bg?: string;
  size?: string | number;
  color?: string;
  transform?: any;
  iconClass?: string;
  tag?: React.ElementType;
  [key: string]: any;
}

interface IconGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  icons: IconData[];
  className?: string;
}

const IconGroup: React.FC<IconGroupProps> = ({ icons, className, ...rest }) => (
  <div className={classNames('icon-group', className)} {...rest}>
    {icons.map((iconData, index) => (
      <IconItem {...iconData} key={index} />
    ))}
  </div>
);

export default IconGroup;

import React from 'react';
import classNames from 'classnames';
import IconItem from './IconItem';

interface IconData {
  [key: string]: any; // IconItem props - would need IconItem interface to be more specific
}

interface IconGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  icons: IconData[];
  className?: string;
}

const IconGroup: React.FC<IconGroupProps> = ({ icons, className, ...rest }) => (
  <div className={classNames('icon-group', className)} {...rest}>
    {icons.map((icon, index) => (
      <IconItem {...icon} key={index} />
    ))}
  </div>
);

export default IconGroup;

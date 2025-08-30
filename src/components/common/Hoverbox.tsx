import React from 'react';
import classNames from 'classnames';

interface HoverboxProps {
  children?: React.ReactNode;
  className?: string;
}

interface HoverboxContentProps {
  children?: React.ReactNode;
  className?: string;
}

export const HoverboxContent: React.FC<HoverboxContentProps> = ({ children, className }) => {
  return (
    <div className={classNames('hoverbox-content', className)}>
      {children}
    </div>
  );
};

interface HoverboxComponent extends React.FC<HoverboxProps> {
  Content: React.FC<HoverboxContentProps>;
}

const Hoverbox = (({ children, className }: HoverboxProps) => {
  return (
    <div className={classNames('hoverbox', className)}>
      {children}
    </div>
  );
}) as HoverboxComponent;

Hoverbox.Content = HoverboxContent;

export default Hoverbox;

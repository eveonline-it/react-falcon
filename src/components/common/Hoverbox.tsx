import React from 'react';
import classNames from 'classnames';

interface HoverboxProps {
  children?: React.ReactNode;
  className?: string;
}

const Hoverbox: React.FC<HoverboxProps> = ({ children, className }) => {
  return (
    <div className={classNames('hoverbox', { [className as string]: className })}>
      {children}
    </div>
  );
};

interface HoverboxContentProps {
  children?: React.ReactNode;
  className?: string;
}

export const HoverboxContent: React.FC<HoverboxContentProps> = ({ children, className }) => {
  return (
    <div className={classNames('hoverbox-content', { [className as string]: className })}>
      {children}
    </div>
  );
};

Hoverbox.Content = HoverboxContent;

export default Hoverbox;

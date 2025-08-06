import React from 'react';
import classNames from 'classnames';

const Hoverbox = ({ children, className }) => {
  return (
    <div className={classNames('hoverbox', { [className]: className })}>
      {children}
    </div>
  );
};

export const HoverboxContent = ({ children, className }) => {
  return (
    <div className={classNames('hoverbox-content', { [className]: className })}>
      {children}
    </div>
  );
};

Hoverbox.Content = HoverboxContent;

export default Hoverbox;

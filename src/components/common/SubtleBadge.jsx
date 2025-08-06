import React from 'react';
import classNames from 'classnames';

const SubtleBadge = ({ bg = 'primary', pill, children, className }) => {
  return (
    <div
      className={classNames(className, `badge badge-subtle-${bg}`, {
        'rounded-pill': pill
      })}
    >
      {children}
    </div>
  );
};


export default SubtleBadge;

import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';
import logo from 'assets/img/illustrations/falcon.png';

const Logo = ({ at = 'auth', width = 58, className, textClass, ...rest }) => {
  return (
    <Link
      to="/"
      className={classNames(
        'text-decoration-none',
        { 'navbar-brand text-left': at === 'navbar-vertical' },
        { 'navbar-brand text-left': at === 'navbar-top' }
      )}
      {...rest}
    >
      <div
        className={classNames(
          'd-flex',
          {
            'align-items-center py-3': at === 'navbar-vertical',
            'align-items-center': at === 'navbar-top',
            'flex-center fw-bolder fs-4 mb-4': at === 'auth'
          },
          className
        )}
      >
        <img className="me-2" src={logo} alt="Logo" width={width} />
        <span className={classNames('font-sans-serif', textClass)}>falcon</span>
      </div>
    </Link>
  );
};

export default Logo;

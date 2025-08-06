import classNames from 'classnames';

const Divider = ({ className, children }) => (
  <div className={classNames('w-100 position-relative text-center', className)}>
    <hr className="text-300" />
    <div className="divider-content-center">{children}</div>
  </div>
);

export default Divider;

import { useAppContext } from 'providers/AppProvider';
import classNames from 'classnames';
import { CloseButton } from 'react-bootstrap';

const FalconCloseButton = ({
  size,
  onClick,
  noOutline,
  variant,
  className,
  ...rest
}) => {
  const {
    config: { isDark }
  } = useAppContext();
  return (
    <CloseButton
      variant={variant ? variant : isDark ? 'white' : undefined}
      className={classNames('btn', {
        [`btn-${size}`]: size,
        'outline-none': noOutline,
        [className]: className
      })}
      onClick={onClick && onClick}
      {...rest}
    />
  );
};

export default FalconCloseButton;

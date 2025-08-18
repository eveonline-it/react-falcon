import React from 'react';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';

interface IndeterminateCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({ 
  indeterminate, 
  className, 
  ref, 
  ...rest 
}) => {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    if (resolvedRef && 'current' in resolvedRef && resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate || false;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <Form.Check
      type="checkbox"
      className={classNames(
        'form-check mb-0 d-flex align-items-center',
        className
      )}
    >
      <Form.Check.Input
        type="checkbox"
        className="mt-0"
        ref={resolvedRef}
        {...rest}
      />
    </Form.Check>
  );
};

export default IndeterminateCheckbox;

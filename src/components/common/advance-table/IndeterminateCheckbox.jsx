import React from 'react';
import classNames from 'classnames';
import { Form } from 'react-bootstrap';

const IndeterminateCheckbox = ({ indeterminate, className, ref, ...rest }) => {
    const defaultRef = React.useRef();

    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
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

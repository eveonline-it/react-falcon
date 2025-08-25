import React from 'react';
import { Form } from 'react-bootstrap';

interface CustomDateInputProps {
  value: string;
  onClick: () => void;
  isInvalid?: boolean;
  isValid?: boolean;
  formControlProps?: any;
  errorMessage?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({
  value,
  onClick,
  isInvalid,
  isValid,
  formControlProps,
  errorMessage,
  ref
}) => {
  return (
    <>
      <Form.Control
        ref={ref}
        isInvalid={isInvalid}
        isValid={isValid}
        value={value}
        onClick={onClick}
        {...formControlProps}
      />
      <Form.Control.Feedback type="invalid">
        {errorMessage}
      </Form.Control.Feedback>
    </>
  );
};

export default CustomDateInput;

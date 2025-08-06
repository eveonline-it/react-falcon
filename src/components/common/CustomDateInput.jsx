import { Form } from 'react-bootstrap';

const CustomDateInput = (
  { value, onClick, isInvalid, isValid, formControlProps, errorMessage, ref }
) => {
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

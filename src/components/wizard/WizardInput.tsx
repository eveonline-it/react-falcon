import React, { forwardRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { UseFormSetValue } from 'react-hook-form';

interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  isInvalid?: boolean;
  isValid?: boolean;
  formControlProps?: Record<string, any>;
  errorMessage?: string;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomDateInputProps>(
  ({ value, onClick, isInvalid, isValid, formControlProps, errorMessage }, ref) => {
    return (
      <>
        <Form.Control
          ref={ref}
          isInvalid={isInvalid}
          isValid={isValid}
          value={value || ''}
          onClick={onClick}
          {...formControlProps}
        />
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      </>
    );
  }
);

CustomDateInput.displayName = 'CustomDateInput';

interface WizardInputProps {
  label?: React.ReactNode;
  name: string;
  errors: Record<string, { message?: string } | undefined>;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'select' | 'textarea' | 'checkbox' | 'switch' | 'radio';
  options?: string[];
  placeholder?: string;
  formControlProps?: Record<string, any>;
  formGroupProps?: Record<string, any>;
  setValue?: UseFormSetValue<any>;
  datepickerProps?: Record<string, any>;
}

const WizardInput: React.FC<WizardInputProps> = ({
  label,
  name,
  errors,
  type = 'text',
  options = [],
  placeholder,
  formControlProps,
  formGroupProps,
  setValue,
  datepickerProps
}) => {
  const [date, setDate] = useState<Date | null>(null);

  if (type === 'date') {
    return (
      <Form.Group {...formGroupProps}>
        {!!label && <Form.Label>{label}</Form.Label>}

        <DatePicker
          selected={date}
          onChange={(selectedDate: Date | null) => {
            setDate(selectedDate);
            setValue?.(name, selectedDate);
          }}
          customInput={
            <CustomDateInput
              formControlProps={formControlProps}
              errorMessage={errors[name]?.message}
              isInvalid={errors[name]}
              isValid={Object.keys(errors).length > 0 && !errors[name]}
            />
          }
          {...datepickerProps}
        />
      </Form.Group>
    );
  }

  if (type === 'checkbox' || type === 'switch' || type === 'radio') {
    return (
      <Form.Check type={type} id={name + Math.floor(Math.random() * 100)}>
        <Form.Check.Input
          type={type}
          {...formControlProps}
          isInvalid={errors[name]}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
        />
        <Form.Check.Label className="ms-2">{label}</Form.Check.Label>
        <Form.Control.Feedback type="invalid" className="mt-0">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Check>
    );
  }
  if (type === 'select') {
    return (
      <Form.Group {...formGroupProps}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          type={type}
          {...formControlProps}
          isInvalid={errors[name]}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
        >
          <option value="">{placeholder}</option>
          {options.map((option: string) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }
  if (type === 'textarea') {
    return (
      <Form.Group {...formGroupProps}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          as="textarea"
          placeholder={placeholder}
          {...formControlProps}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
          isInvalid={errors[name]}
          rows={4}
        />
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }
  return (
    <Form.Group {...formGroupProps}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        {...formControlProps}
        isInvalid={errors[name]}
        isValid={Object.keys(errors).length > 0 && !errors[name]}
      />
      <Form.Control.Feedback type="invalid">
        {errors[name]?.message}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default WizardInput;

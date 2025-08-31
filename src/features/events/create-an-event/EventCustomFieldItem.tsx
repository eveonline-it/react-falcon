import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import CustomDateInput from 'components/common/CustomDateInput';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// TypeScript interfaces
interface CustomButtonProps {
  handleRemove: (id: string) => void;
  id: string;
}

type FieldType = 'number' | 'password' | 'email' | 'checkboxes' | 'radio' | 'select' | 'textarea' | 'file' | 'time' | 'date' | 'text';

interface EventCustomFieldItemProps {
  name: string;
  type: FieldType;
  options?: string[];
  index: number;
  register: any; // react-hook-form register function
  setValue: any; // react-hook-form setValue function
  id: string;
  handleRemove: (id: string) => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ handleRemove, id }) => {
  return (
    <div id={id} className="position-absolute end-0 top-0 z-1 hover-actions">
      <Button
        size="sm"
        variant="link"
        className="p-0"
        onClick={() => handleRemove(id)}
      >
        <FontAwesomeIcon className="text-danger" icon="times-circle" />
      </Button>
    </div>
  );
};

const EventCustomFieldItem: React.FC<EventCustomFieldItemProps> = ({
  name,
  type,
  options = [],
  index,
  register,
  setValue,
  id,
  handleRemove
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  {
    switch (type) {
      case 'number':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <Form.Label>{name}</Form.Label>
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Control
              type="number"
              name={`customField${index}`}
              placeholder={`Enter ${name} ...`}
              {...register(`customField${index}`)}
            />
          </Form.Group>
        );
      case 'password':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <Form.Control
              type="password"
              name={`customField${index}`}
              placeholder={`Enter ${name} ...`}
              {...register(`customField${index}`)}
            />
          </Form.Group>
        );

      case 'email':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <Form.Control
              type="email"
              name={`customField${index}`}
              placeholder={`Enter ${name} ...`}
              {...register(`customField${index}`)}
            />
          </Form.Group>
        );

      case 'checkboxes':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>

            {options.map((option: string, key: number) => (
              <Form.Check id={`customCheckbox${key}`} key={key}>
                <Form.Check.Input
                  value={option}
                  {...register(`customField${index}`)}
                  type="checkbox"
                />
                <Form.Check.Label className="mb-0">{option}</Form.Check.Label>
              </Form.Check>
            ))}
          </Form.Group>
        );
      case 'radio':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>

            {options.map((option: string, key: number) => (
              <Form.Check id={`customCheckbox${key}`} key={key}>
                <Form.Check.Input
                  value={option}
                  {...register(`customField${index}`)}
                  type="radio"
                />
                <Form.Check.Label className="mb-0">{option}</Form.Check.Label>
              </Form.Check>
            ))}
          </Form.Group>
        );

      case 'select':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <Form.Select
              aria-label="Default select example"
              {...register(`CustomField${index}`)}
            >
              {options.map((option: string, key: number) => (
                <option key={key} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        );

      case 'textarea':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
            controlId="ControlTextarea"
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={`Enter ${name} ...`}
              {...register(`CustomField${index}`)}
            />
          </Form.Group>
        );

      case 'file':
        return (
          <Form.Group
            controlId="formFileSm"
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <Form.Control type="file" {...register(`CustomField${index}`)} />
          </Form.Group>
        );

      case 'time':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
            controlId="startDate"
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <DatePicker
              selected={time}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm"
              onChange={(newDate: Date | null) => {
                setTime(newDate);
                setValue(`customField${index}`, newDate);
              }}
              customInput={
                <CustomDateInput
                  formControlProps={{
                    placeholder: 'H:i',
                    ...register(`customField${index}`)
                  }}
                />
              }
            />
          </Form.Group>
        );
      case 'date':
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
            controlId="startDate"
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <DatePicker
              selected={date}
              onChange={(newDate: Date | null) => {
                setDate(newDate);
                setValue(`customField${index}`, newDate);
              }}
              customInput={
                <CustomDateInput
                  formControlProps={{
                    placeholder: 'd/m/y',
                    ...register(`customField${index}`)
                  }}
                />
              }
            />
          </Form.Group>
        );

      default:
        return (
          <Form.Group
            className={classNames('position-relative hover-actions-trigger', {
              'mt-3': index !== 0
            })}
          >
            <CustomButton handleRemove={handleRemove} id={id} />
            <Form.Label>{name}</Form.Label>
            <Form.Control
              type="text"
              name={`name${index}`}
              placeholder={`Enter ${name} ...`}
              {...register('customField' + index)}
            />
          </Form.Group>
        );
    }
  }
};

export default EventCustomFieldItem;

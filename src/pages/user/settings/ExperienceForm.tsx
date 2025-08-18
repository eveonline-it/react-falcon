import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from 'components/common/Flex';
import React, { useState } from 'react';
import { Button, Col, Collapse, Form, Row } from 'react-bootstrap';
import InputField from '../InputField';

// Types for Experience Form
interface ExperienceFormData {
  company: string;
  position: string;
  city: string;
  description: string;
  currentlyWork: boolean;
  from: string;
  to: string;
}

interface ExperienceFormProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ collapsed, setCollapsed }) => {
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    city: '',
    description: '',
    currentlyWork: false,
    from: '',
    to: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <Flex
        alignItems="center"
        className="mb-4 text-primary cursor-pointer fs-9"
        onClick={() => {
          setCollapsed(!collapsed);
        }}
      >
        <span className="circle-dashed">
          <FontAwesomeIcon icon="plus" />
        </span>
        <span className="ms-3">Add new experience</span>
      </Flex>
      <Collapse in={!collapsed}>
        <div>
          {/* <ExperienceForm /> */}
          <Form onSubmit={handleSubmit}>
            <InputField
              value={formData.company}
              label="Company"
              name="company"
              handleChange={handleChange}
            />
            <InputField
              value={formData.position}
              label="Position"
              name="position"
              handleChange={handleChange}
            />
            <InputField
              value={formData.position}
              label="City"
              name="city"
              handleChange={handleChange}
            />
            <InputField
              value={formData.description}
              label="Description"
              name="description"
              handleChange={handleChange}
              as="textarea"
              rows={3}
            />

            <Form.Group as={Row} className="mb-3" controlId="currentlyWork">
              <Col sm={{ offset: 3 }}>
                <Form.Check
                  type="checkbox"
                  label="I currently work here"
                  checked={formData.currentlyWork}
                  onChange={({ target }) =>
                    setFormData({ ...formData, currentlyWork: target.checked })
                  }
                />
              </Col>
            </Form.Group>

            <InputField
              type="date"
              value={formData.from}
              label="From"
              name="from"
              onChange={(value: string) => {
                setFormData({ ...formData, from: value });
              }}
            />

            <InputField
              type="date"
              value={formData.to}
              label="To"
              name="to"
              onChange={(value: string) => {
                setFormData({ ...formData, to: value });
              }}
            />

            <Form.Group as={Row} className="mb-3">
              <Col sm={{ offset: 3 }}>
                <Button type="submit">Save</Button>
              </Col>
            </Form.Group>
          </Form>

          <div className="border-dashed border-bottom my-3" />
        </div>
      </Collapse>
    </div>
  );
};

export default ExperienceForm;

import ExperienceForm from 'pages/user/settings/ExperienceForm';
import CreatePost from 'features/social/feed/CreatePost';
import Compose from 'features/email/compose/Compose';
import EventUpload from 'features/events/create-an-event/EventUpload';
import React, { useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import WidgetSectionTitle from './WidgetSectionTitle';
import PersonalForm from 'components/wizard/PersonalForm';
import { useForm } from 'react-hook-form';

const Forms = () => {
  const [experienceFormCollapsed, setExperienceFormCollapsed] = useState(false);

  const {
    register,
    formState: { errors },
    setValue
  } = useForm();

  return (
    <>
      <WidgetSectionTitle
        icon="file-alt"
        title="Forms"
        subtitle="Get different types of data from the user by using Falcon's customizable form."
        transform="shrink-2"
        className="mb-4 mt-6"
      />

      <Row className="g-0">
        <Col lg={6} className="pe-lg-2">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Experiences</h5>
            </Card.Header>
            <Card.Body className="bg-body-tertiary pb-0">
              <ExperienceForm
                collapsed={experienceFormCollapsed}
                setCollapsed={setExperienceFormCollapsed}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="ps-lg-2">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Profile</h5>
            </Card.Header>
            <Card.Body className="bg-body-tertiary pb-0">
              <PersonalForm
                register={register}
                errors={errors}
                setValue={setValue}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={12}>
          <CreatePost />
        </Col>
      </Row>
      <div className="mb-3">
        <Compose />
      </div>

      <EventUpload />
    </>
  );
};

export default Forms;

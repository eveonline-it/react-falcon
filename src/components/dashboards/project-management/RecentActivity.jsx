import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import FalconCardHeader from 'components/common/FalconCardHeader';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SimpleBar from 'simplebar-react';

const Activity = ({
  activity: { title, text, icon, time, status },
  isLast
}) => {
  return (
    <Row
      className={classNames(
        'g-3 recent-activity-timeline recent-activity-timeline-primary',
        {
          'pb-x1': !isLast,
          'recent-activity-timeline-past': status === 'completed',
          'recent-activity-timeline-current': status === 'current'
        }
      )}
    >
      <Col xs="auto" className="ps-4 ms-2">
        <div className="ps-2">
          <div className="icon-item icon-item-sm rounded-circle bg-200 shadow-none">
            <FontAwesomeIcon icon={icon} className="text-primary" />
          </div>
        </div>
      </Col>
      <Col>
        <Row className={classNames('g-3', { 'border-bottom pb-x1': !isLast })}>
          <Col>
            <h6 className="text-800 mb-1">{title}</h6>
            <p className="fs-10 text-600 mb-0">{text}</p>
          </Col>
          <Col xs="auto">
            <p className="fs-11 text-500 mb-0">{time}</p>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const RecentActivity = ({ data }) => {
  return (
    <Card className="h-100 recent-activity-card">
      <FalconCardHeader title="Recent Activity" titleTag="h6" />
      <SimpleBar style={{ height: '26rem' }}>
        <Card.Body className="ps-2 recent-activity-body-height">
          {data.map((activity, index) => (
            <Activity
              key={activity.id}
              activity={activity}
              isLast={index === data.length - 1}
            />
          ))}
        </Card.Body>
      </SimpleBar>
    </Card>
  );
};

export default RecentActivity;

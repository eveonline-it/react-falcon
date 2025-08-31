// React 19 JSX Transform - no explicit React import needed
import { Card, Row, Col, Image } from 'react-bootstrap';
import FalconCardHeader from 'components/common/FalconCardHeader';
import CardDropdown from 'components/common/CardDropdown';
import SimpleBar from 'simplebar-react';
import FalconLink from 'components/common/FalconLink';
import Avatar from 'components/common/Avatar';
import SubtleBadge from 'components/common/SubtleBadge';

const Activity = ({ activity: { name, avatar, activity } }) => {
  return (
    <Row className="g-2 mb-4">
      <Col xs={12} className="d-flex align-items-center">
        <Avatar size="xl" rounded="circle" src={avatar} />
        <h6 className="mb-0 ps-2">{name}</h6>
      </Col>
      {activity.map(item => (
        <Col key={item.id} xs={4} className="position-relative">
          <Image src={item.img} alt={name} className="w-100" />
          <SubtleBadge
            bg={item.color}
            pill
            className="position-absolute top-100 start-50 translate-middle"
          >
            {item.amount}
          </SubtleBadge>
        </Col>
      ))}
    </Row>
  );
};

const MembersActivity = ({ data }) => {
  return (
    <Card className="h-100 members-activity">
      <FalconCardHeader
        className="py-2"
        light
        title="Members Activity"
        titleTag="h6"
        endEl={<CardDropdown />}
      />
      <SimpleBar>
        <Card.Body>
          {data.map(activity => (
            <Activity key={activity.id} activity={activity} />
          ))}
        </Card.Body>
      </SimpleBar>
      <Card.Footer className="bg-body-tertiary p-0">
        <FalconLink title="See all projects" className="d-block py-2" />
      </Card.Footer>
    </Card>
  );
};

export default MembersActivity;

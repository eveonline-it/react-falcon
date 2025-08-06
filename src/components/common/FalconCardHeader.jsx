import { Col, Card, Row } from 'react-bootstrap';
import classNames from 'classnames';

const Title = ({
  titleTag: TitleTag = 'h5',
  className,
  breakPoint,
  children
}) => (
  <TitleTag
    className={classNames(
      {
        'mb-0': !breakPoint,
        [`mb-${breakPoint}-0`]: !!breakPoint
      },
      className
    )}
  >
    {children}
  </TitleTag>
);

const FalconCardHeader = ({
  title,
  light,
  titleTag,
  titleClass,
  className,
  breakPoint,
  endEl,
  children
}) => (
  <Card.Header className={classNames(className, { 'bg-body-tertiary': light })}>
    {endEl ? (
      <Row className="align-items-center g-2">
        <Col>
          <Title
            breakPoint={breakPoint}
            titleTag={titleTag}
            className={titleClass}
          >
            {title}
          </Title>
          {children}
        </Col>
        <Col
          {...{ [breakPoint ? breakPoint : 'xs']: 'auto' }}
          className={`text${breakPoint ? `-${breakPoint}` : ''}-right`}
        >
          {endEl}
        </Col>
      </Row>
    ) : (
      <Title breakPoint={breakPoint} titleTag={titleTag} className={titleClass}>
        {title}
      </Title>
    )}
  </Card.Header>
);

export default FalconCardHeader;

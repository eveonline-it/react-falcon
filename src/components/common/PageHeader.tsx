import React from 'react';
import classNames from 'classnames';
import { Card, Col, Row, CardProps } from 'react-bootstrap';
import Background from './Background';
import corner4 from 'assets/img/illustrations/corner-4.png';
import createMarkup from 'helpers/createMarkup';

interface PageHeaderProps extends Omit<CardProps, 'children'> {
  title: string;
  preTitle?: string;
  titleTag?: React.ElementType;
  description?: string;
  image?: string;
  col?: Record<string, any>;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  preTitle,
  titleTag: TitleTag = 'h3',
  description,
  image = corner4,
  col = { lg: 8 },
  children,
  ...rest
}) => (
  <Card {...rest}>
    <Background
      image={image}
      className="bg-card d-none d-sm-block"
      style={{
        borderTopRightRadius: '0.375rem',
        borderBottomRightRadius: '0.375rem'
      }}
    />
    <Card.Body className="position-relative">
      <Row>
        <Col {...col}>
          {preTitle && <h6 className="text-600">{preTitle}</h6>}
          {React.createElement(TitleTag, { className: "mb-0" }, title)}
          {description && (
            <p
              className={classNames('mt-2', { 'mb-0': !children })}
              dangerouslySetInnerHTML={createMarkup(description)}
            />
          )}
          {children}
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default PageHeader;

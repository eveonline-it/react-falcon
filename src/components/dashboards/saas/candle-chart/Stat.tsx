import React from 'react';
import Flex from 'components/common/Flex';
import { Col } from 'react-bootstrap';
import SubtleBadge from 'components/common/SubtleBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const Stat = ({ statInfo: { title, grow, amount }, isLast }) => {
  return (
    <Col xs={12} sm="auto">
      <div
        className={classNames('mb-3', {
          'pe-4 border-sm-end border-200': !isLast,
          'pe-0': isLast
        })}
      >
        <h6 className="fs-11 text-600 mb-1">{title}</h6>
        <Flex alignItems="center">
          <h5 className="fs-9 text-900 mb-0 me-2">{amount}</h5>
          <SubtleBadge bg={grow.color} pill rounded>
            <FontAwesomeIcon
              icon={classNames({
                'caret-up': grow.isGrow,
                'caret-down': !grow.isGrow
              })}
            />{' '}
            {grow.growAmount}%
          </SubtleBadge>
        </Flex>
      </div>
    </Col>
  );
};

export default Stat;

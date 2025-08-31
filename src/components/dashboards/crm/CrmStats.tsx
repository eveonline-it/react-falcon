import React, { useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import Flex from 'components/common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPhone, faUser, faBolt, faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import CardDropdown from 'components/common/CardDropdown';
import { statsData } from '../../../data/dashboard/crm.js';
import classNames from 'classnames';
import IconItem from 'components/common/icon/IconItem';
import StatsChart from './StatsChart';
import { useAppContext } from 'providers/AppProvider';

// Icon mapping
const iconMap: { [key: string]: IconProp } = {
  'phone': faPhone,
  'user': faUser,
  'bolt': faBolt,
  'caret-up': faCaretUp,
  'caret-down': faCaretDown
};

// TypeScript interfaces
type BootstrapColor = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'secondary';

interface CrmStatData {
  id: number;
  title: string;
  amount: number;
  target: string;
  icon: string;
  caret: string;
  color: BootstrapColor;
  caretColor: BootstrapColor;
  data: number[];
}

interface StatsItemProps {
  stat: CrmStatData;
}

const StatsItem: React.FC<StatsItemProps> = ({ stat }) => {
  const { icon, color, title, amount, caret, caretColor, target, data } = stat;
  const { getThemeColor } = useAppContext();
  return (
    <>
      <Flex
        justifyContent="center"
        alignItems="center"
        className="mb-3 position-static"
      >
        <IconItem
          tag="div"
          icon={iconMap[icon] || faPhone}
          bg={`${color}-subtle`}
          color={color}
          size="sm"
          iconClass="fs-11"
          className="me-2 shadow-none"
        />
        <h6 className="mb-0 flex-1">{title}</h6>
        <div>
          <CardDropdown />
        </div>
      </Flex>
      <Flex>
        <p className="font-sans-serif lh-1 mb-1 fs-5 pe-2">{amount}%</p>
        <div className="d-flex flex-column">
          <FontAwesomeIcon
            icon={iconMap[caret] || faCaretUp}
            className={`me-1 mb-0 text-${caretColor}`}
          />
          <p className="fs-11 mb-0 mt-0 text-nowrap">{target}</p>
        </div>
        <div className="w-100 ms-2">
          <StatsChart color={getThemeColor(color)} data={data} />
        </div>
      </Flex>
    </>
  );
};

const CrmStats: React.FC = () => {
  // Type assertion to ensure compatibility with imported JS data
  const [stats] = useState<CrmStatData[]>(statsData as CrmStatData[]);
  return (
    <Card>
      <Card.Body>
        <Row>
          {stats.map((stat, index) => (
            <Col
              lg={4}
              key={stat.id}
              className={classNames({
                'border-bottom border-lg-0 border-lg-end':
                  index !== stats.length - 1,
                'pb-3 pb-lg-0': index === 0,
                'py-3 py-lg-0': index === 1,
                'pt-3 pt-lg-0': index === 2
              })}
            >
              <StatsItem stat={stat} />
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CrmStats;

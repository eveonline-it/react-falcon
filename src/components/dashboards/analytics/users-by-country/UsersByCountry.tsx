import React, { useRef } from 'react';
import CardDropdown from 'components/common/CardDropdown';
import FalconCardHeader from 'components/common/FalconCardHeader';
import FalconLink from 'components/common/FalconLink';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import UsersByCountryChart from './UsersByCountryChart';
import WorldMap from './WorldMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import Flex from 'components/common/Flex';
import { CountryData } from 'components/dashboards/types';

// Import the interface from WorldMap
interface MapDataItem {
  name: string;
  value: number;
}

// TypeScript interfaces
interface UsersByCountryProps {
  chartData: CountryData[];
  mapData: { [countryCode: string]: number };
}

const UsersByCountry: React.FC<UsersByCountryProps> = ({ chartData, mapData }) => {
  const chartRef = useRef<any>(null);
  
  // Transform mapData to the format expected by WorldMap
  const worldMapData: MapDataItem[] = Object.entries(mapData).map(([name, value]) => ({
    name,
    value
  }));

  const handleMapReset = () => {
    if (chartRef.current) {
      chartRef.current.getEchartsInstance().dispatchAction({
        type: 'restore'
      });
    }
  };
  return (
    <Card className="h-100">
      <FalconCardHeader
        title="Users By Country"
        titleTag="h6"
        className="py-2"
        light
        endEl={
          <Flex>
            <div className="btn-reveal-trigger">
              <Button
                variant="link"
                size="sm"
                className="btn-reveal"
                type="button"
                onClick={handleMapReset}
              >
                <FontAwesomeIcon icon={faSync} />
              </Button>
            </div>
            <CardDropdown />
          </Flex>
        }
      />
      <Card.Body>
        <WorldMap data={worldMapData} ref={chartRef} style={{ height: '12.5rem' }} />
        <UsersByCountryChart data={chartData} />
      </Card.Body>

      <Card.Footer className="bg-body-tertiary py-2">
        <Row className="g-0 flex-between-center">
          <Col xs="auto">
            <Form.Select size="sm" className="me-2">
              <option>Last 7 days</option>
              <option>Last Month</option>
              <option>Last Year</option>
            </Form.Select>
          </Col>
          <Col xs="auto">
            <FalconLink title="Browser Overview" className="px-0 fw-medium" />
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
};

export default UsersByCountry;

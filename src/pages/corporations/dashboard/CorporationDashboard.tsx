import React from 'react';
import { useParams, useLocation } from 'react-router';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faUsers,
  faShieldAlt,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import CorporationLogo from 'components/common/eve/CorporationLogo';
import { useCorporationInfo } from 'hooks/useCorporations';
import FalconLoader from 'components/common/FalconLoader';

interface CorporationDashboardProps {
  corporationId?: number;
  corporationName?: string;
  ticker?: string;
  isDynamic?: boolean;
}

const CorporationDashboard: React.FC<CorporationDashboardProps> = ({
  corporationId: propCorporationId,
  corporationName,
  ticker,
  isDynamic = true
}) => {
  const params = useParams();
  const location = useLocation();
  
  // Debug: Log all available params and location
  console.log('URL Params:', params);
  console.log('All keys:', Object.keys(params));
  console.log('Current pathname:', location.pathname);
  
  // Try multiple possible parameter names
  let urlCorporationId = 
    params.corporationId || 
    params.corporation_id || 
    params.id;

  // Handle catch-all parameter format
  if (!urlCorporationId && params['*']) {
    // Extract corporation ID from catch-all like "corporations/98701142/dashboard"
    const catchAllMatch = params['*'].match(/corporations\/(\d+)/);
    urlCorporationId = catchAllMatch ? catchAllMatch[1] : undefined;
  }
  
  // If still no URL param found, try to extract from full pathname
  if (!urlCorporationId) {
    // Extract corporation ID from path like "/corporations/98701142/dashboard"
    const pathMatch = location.pathname.match(/\/corporations\/(\d+)/);
    urlCorporationId = pathMatch ? pathMatch[1] : undefined;
  }
  
  // Get corporation ID from URL params/path, with fallback to prop
  const corporationId = urlCorporationId 
    ? parseInt(urlCorporationId, 10) 
    : propCorporationId;
  
  const {
    data: corporationData,
    isLoading,
    error
  } = useCorporationInfo(corporationId);

  // Show error if no corporation ID is available
  if (!corporationId || isNaN(corporationId)) {
    return (
      <Row className="g-3">
        <Col>
          <Card className="border-danger">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBuilding} className="me-2 text-danger" />
                <div>
                  <h6 className="mb-1 text-danger">Invalid Corporation ID</h6>
                  <small className="text-body-secondary">
                    Unable to load corporation dashboard. Please check the URL.
                    <br />
                    Debug: URL params = {JSON.stringify(params)}
                    <br />
                    Extracted ID: {urlCorporationId} (from prop: {propCorporationId})
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  if (isLoading) return <FalconLoader />;

  const corp = corporationData || {
    name: corporationName || `Corporation ${corporationId}`,
    ticker: ticker || 'CORP',
    member_count: 0,
    alliance_id: null,
    ceo_id: null,
    date_founded: null,
    description: 'Loading corporation information...',
    url: null,
    faction_id: null,
    home_station_id: null,
    tax_rate: 0
  };

  return (
    <>
      <Row className="g-3 mb-3">
        <Col>
          <Card className="h-100">
            <Card.Header className="bg-body-tertiary">
              <Row className="align-items-center">
                <Col>
                  <h6 className="mb-0 d-flex align-items-center">
                    <FontAwesomeIcon icon={faBuilding} className="me-2" />
                    Corporation Dashboard
                  </h6>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="align-items-center">
                <Col xs="auto">
                  <CorporationLogo
                    corporationId={corporationId}
                    corporationName={corp.name}
                    size={64}
                    className="me-3"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="me-2 text-primary"
                    />
                    Members
                  </h6>
                  <h3 className="text-body-emphasis mb-0">
                    {corp.member_count?.toLocaleString() || '0'}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faCrown}
                      className="me-2 text-warning"
                    />
                    Tax Rate
                  </h6>
                  <h3 className="text-body-emphasis mb-0">
                    {corp.tax_rate
                      ? `${(corp.tax_rate * 100).toFixed(1)}%`
                      : '0.0%'}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="me-2 text-success"
                    />
                    Alliance
                  </h6>
                  <h3 className="text-body-emphasis mb-0">
                    {corp.alliance_id ? 'Yes' : 'Independent'}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="me-2 text-info"
                    />
                    Founded
                  </h6>
                  <h3 className="text-body-emphasis mb-0 fs-6">
                    {corp.date_founded
                      ? new Date(corp.date_founded).getFullYear()
                      : 'Unknown'}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="bg-body-tertiary">
              <h6 className="mb-0">Corporation Overview</h6>
            </Card.Header>
            <Card.Body>
              <div className="row g-3">
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Corporation Name</h6>
                  <p className="text-body-emphasis mb-0">{corp.name}</p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Ticker</h6>
                  <p className="text-body-emphasis mb-0">[{corp.ticker}]</p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Member Count</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.member_count?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Tax Rate</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.tax_rate
                      ? `${(corp.tax_rate * 100).toFixed(1)}%`
                      : '0.0%'}
                  </p>
                </div>
                {corp.url && (
                  <div className="col-12">
                    <h6 className="text-body-secondary mb-2">Website</h6>
                    <a
                      href={corp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-none"
                    >
                      {corp.url}
                    </a>
                  </div>
                )}
                {corp.description && (
                  <div className="col-12">
                    <h6 className="text-body-secondary mb-2">Description</h6>
                    <p className="text-body-emphasis mb-0">
                      {corp.description}
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-body-tertiary">
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <button className="btn btn-falcon-primary btn-sm">
                  View Members
                </button>
                <button className="btn btn-falcon-secondary btn-sm">
                  Corporation History
                </button>
                <button className="btn btn-falcon-info btn-sm">
                  Structures
                </button>
                {corp.alliance_id && (
                  <button className="btn btn-falcon-success btn-sm">
                    Alliance Info
                  </button>
                )}
                <hr />
                <small className="text-body-tertiary">
                  Dynamic Dashboard: {isDynamic ? 'Yes' : 'No'}
                  <br />
                  Data Source: {corporationData ? 'Live API' : 'Fallback'}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="g-3">
          <Col>
            <Card className="border-warning">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="me-2 text-warning"
                  />
                  <div>
                    <h6 className="mb-1 text-warning">Data Loading Notice</h6>
                    <small className="text-body-secondary">
                      Unable to load live corporation data for ID {corporationId}. Using fallback information.
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default CorporationDashboard;

import React from 'react';
import { useParams, useLocation } from 'react-router';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faUsers,
  faShieldAlt,
  faCrown,
  faUserTie,
  faExclamationTriangle,
  faCalendarAlt,
  faHome
} from '@fortawesome/free-solid-svg-icons';
import CorporationLogo from 'components/common/eve/CorporationLogo';
import CharacterPortrait from 'components/common/eve/CharacterPortrait';
import AllianceLogo from 'components/common/eve/AllianceLogo';
import { useCorporationInfo, useCorporationMemberTracking } from 'hooks/useCorporations';
// @ts-ignore - useAlliances is a JS file
import { useAllianceInfo } from 'hooks/useAlliances';
import FalconLoader from 'components/common/FalconLoader';
import { calculateTimeDuration } from 'helpers/dateHelpers';

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

  // Try multiple possible parameter names
  let urlCorporationId =
    params.corporationId || params.corporation_id || params.id;

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
  // Default to C.O.M.M.A.N.D.O corporation if no ID provided
  const corporationId = urlCorporationId
    ? parseInt(urlCorporationId, 10)
    : propCorporationId || 98701142;

  const {
    data: corporationData,
    isLoading,
    error
  } = useCorporationInfo(corporationId);

  // Fetch alliance info if corporation is in an alliance
  const { data: allianceData } = useAllianceInfo(corporationData?.alliance_id);

  // Member tracking requires CEO authorization and CEO ID, so it may fail
  const { data: memberTrackingData, error: memberTrackingError } = useCorporationMemberTracking(
    corporationId, 
    corporationData?.ceo_id || 2120246986, // Fallback to C.O.M.M.A.N.D.O CEO ID
    allianceData?.ticker || undefined // Alliance ticker from alliance data
  );

  // Calculate online members only if we have valid data
  const onlineMembers = !memberTrackingError && memberTrackingData?.members?.filter((member: any) => {
    if (!member.logon_date || !member.logoff_date) return false;
    const logonDate = new Date(member.logon_date);
    const logoffDate = new Date(member.logoff_date);
    return logonDate > logoffDate;
  }).length || 0;

  // Show error if no corporation ID is available
  if (!corporationId || isNaN(corporationId)) {
    return (
      <Row className="g-3">
        <Col>
          <Card className="border-danger">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="me-2 text-danger"
                />
                <div>
                  <h6 className="mb-1 text-danger">Invalid Corporation ID</h6>
                  <small className="text-body-secondary">
                    Unable to load corporation dashboard. Please check the URL.
                    <br />
                    Debug: URL params = {JSON.stringify(params)}
                    <br />
                    Extracted ID: {urlCorporationId} (from prop:{' '}
                    {propCorporationId})
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
    name: corporationName || 'C.O.M.M.A.N.D.O',
    ticker: ticker || 'N.D.O',
    member_count: 3,
    alliance_id: 99013561,
    ceo_id: 2120246986,
    ceo: { character_id: 2120246986, name: 'MrGrep' },
    date_founded: '2024-10-10T07:40:39Z',
    description: '',
    url: 'http://',
    faction_id: 0,
    home_station_id: 60015187,
    tax_rate: 0.009999999776482582,
    war_eligible: false,
    shares: 1000
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
                    size={128}
                    className="me-3"
                  />
                </Col>
                <Col>
                  <h3 className="mb-1">{corp.name}</h3>
                  <p className="mb-0 text-body-secondary">
                    <span className="badge bg-primary me-2">
                      [{corp.ticker}]
                    </span>
                    Corporation ID: {corporationId}
                  </p>
                </Col>
                {corp.alliance_id && (
                  <Col xs="auto">
                    <AllianceLogo
                      allianceId={corp.alliance_id}
                      allianceName="Alliance"
                      size={128}
                      className="me-2"
                    />
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6} lg={3}>
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
                  {memberTrackingData && !memberTrackingError && (
                    <small className="d-flex align-items-center text-success">
                      <span className="bg-success rounded-circle d-inline-block me-1" 
                            style={{ width: '8px', height: '8px' }}></span>
                      {onlineMembers} online now
                    </small>
                  )}
                  {memberTrackingError && (
                    <small className="text-muted">
                      Online status requires CEO authorization
                    </small>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
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

        <Col md={6} lg={3}>
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
                  <h3 className="text-body-emphasis mb-0 fs-6">
                    {corp.alliance_id
                      ? `Alliance ID: ${corp.alliance_id}`
                      : 'Independent'}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="me-2 text-danger"
                    />
                    War Eligible
                  </h6>
                  <h3 className="text-body-emphasis mb-0">
                    {corp.war_eligible ? 'Yes' : 'No'}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faUserTie}
                      className="me-2 text-info"
                    />
                    CEO
                  </h6>
                  <div className="d-flex align-items-center mt-2">
                    {corp.ceo_id && (
                      <CharacterPortrait
                        characterId={corp.ceo_id}
                        characterName={corp.ceo?.name || 'CEO'}
                        size={32}
                        className="me-2"
                      />
                    )}
                    <div>
                      <p className="mb-0 fw-semibold">
                        {corp.ceo?.name || 'Unknown'}
                      </p>
                      <small className="text-body-secondary">
                        ID: {corp.ceo_id || 'N/A'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="me-2 text-primary"
                    />
                    Founded
                  </h6>
                  <p className="mb-0 fw-semibold">
                    {corp.date_founded
                      ? new Date(corp.date_founded).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }
                        )
                      : 'Unknown'}
                  </p>
                  <small className="text-body-secondary">
                    {corp.date_founded
                      ? calculateTimeDuration(corp.date_founded)
                      : ''}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faHome}
                      className="me-2 text-success"
                    />
                    Home Station
                  </h6>
                  <p className="mb-0 fw-semibold">
                    Station #{corp.home_station_id || 'N/A'}
                  </p>
                  <small className="text-body-secondary">
                    {corp.home_station
                      ? `Security: ${corp.home_station.security}`
                      : ''}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="flex-1">
                  <h6 className="mb-1">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="me-2 text-warning"
                    />
                    Shares
                  </h6>
                  <h3 className="text-body-emphasis mb-0">
                    {corp.shares?.toLocaleString() || '0'}
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
                  <h6 className="text-body-secondary mb-2">Corporation ID</h6>
                  <p className="text-body-emphasis mb-0">{corporationId}</p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Alliance ID</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.alliance_id || 'None'}
                  </p>
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
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">CEO</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.ceo?.name || 'Unknown'}
                  </p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">War Eligible</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.war_eligible ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Founded Date</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.date_founded
                      ? new Date(corp.date_founded).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }
                        )
                      : 'Unknown'}
                  </p>
                </div>
                <div className="col-sm-6">
                  <h6 className="text-body-secondary mb-2">Home Station</h6>
                  <p className="text-body-emphasis mb-0">
                    {corp.home_station_id || 'None'}
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
                      Unable to load live corporation data for ID{' '}
                      {corporationId}. Using fallback information.
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

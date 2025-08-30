import React from 'react';
import { useParams, useLocation } from 'react-router';
import { Card, Col, Row, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faCalendarAlt,
  faCrown,
  faGlobe,
  faShield
} from '@fortawesome/free-solid-svg-icons';

import { useAllianceInfo, useAllianceCorporations } from 'hooks/useAlliances';
import AllianceLogo from 'components/common/eve/AllianceLogo';
import CorporationLogo from 'components/common/eve/CorporationLogo';
import { formatNumber, formatDate } from 'utils/formatting';

const AllianceDashboard: React.FC = () => {
  const { allianceId: urlAllianceId } = useParams<{ allianceId: string }>();
  const location = useLocation();

  // Extract alliance ID from various possible URL formats
  const getAllianceId = (): string => {
    if (urlAllianceId) return urlAllianceId;

    // Check for alliance_id in URL path or search params
    const pathMatch = location.pathname.match(/\/alliances\/(\d+)/);
    if (pathMatch) return pathMatch[1];

    const searchParams = new URLSearchParams(location.search);
    const allianceParam =
      searchParams.get('alliance_id') || searchParams.get('id');

    return allianceParam || '';
  };

  const allianceId = getAllianceId();

  const {
    data: allianceData,
    isLoading: allianceLoading,
    error: allianceError
  } = useAllianceInfo(allianceId);

  const {
    data: corporationsData,
    isLoading: corporationsLoading,
    error: corporationsError
  } = useAllianceCorporations(allianceId);

  if (allianceLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading alliance data...</p>
      </div>
    );
  }

  if (allianceError) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Alliance</Alert.Heading>
        <p>Failed to load alliance data: {allianceError.message}</p>
      </Alert>
    );
  }

  if (!allianceData) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Alliance Not Found</Alert.Heading>
        <p>The alliance you're looking for could not be found.</p>
      </Alert>
    );
  }

  const alliance = allianceData;
  console.log('alliance :', alliance);
  const executor = allianceData.executor_corporation_id;

  return (
    <div className="alliance-dashboard">
      {/* Alliance Header */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs="auto">
              <AllianceLogo
                allianceId={allianceId}
                size={128}
                className="me-3"
              />
            </Col>
            <Col>
              <h2 className="mb-1">
                {alliance.name}
                <small className="text-muted ms-2">[{alliance.ticker}]</small>
              </h2>
              <p className="text-muted mb-0">Alliance ID: {allianceId}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Alliance Stats */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faBuilding}
                size="2x"
                className="text-primary mb-2"
              />
              <h5 className="mb-1">
                {formatNumber(corporationsData?.length || 0)}
              </h5>
              <small className="text-muted">Member Corporations</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faUsers}
                size="2x"
                className="text-success mb-2"
              />
              <h5 className="mb-1">
                {formatNumber(
                  corporationsData?.reduce((total: number, corp: any) => total + (corp.member_count || 0), 0) || 0
                )}
              </h5>
              <small className="text-muted">Total Members</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                size="2x"
                className="text-info mb-2"
              />
              <h5 className="mb-1">
                {alliance.date_founded
                  ? formatDate(alliance.date_founded)
                  : 'Unknown'}
              </h5>
              <small className="text-muted">Founded</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FontAwesomeIcon
                icon={faShield}
                size="2x"
                className="text-warning mb-2"
              />
              <h5 className="mb-1">Active</h5>
              <small className="text-muted">Status</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Alliance Details */}
        <Col lg={8} className="mb-4">
          {/* Executor Corporation */}
          {executor && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faCrown} className="me-2" />
                  Executor Corporation
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <CorporationLogo
                      corporationId={executor}
                      size={64}
                    />
                  </Col>
                  <Col>
                    <h6 className="mb-1">
                      Executor Corporation
                      <small className="text-muted ms-2">
                        ID: {executor}
                      </small>
                    </h6>
                    <p className="text-muted mb-0">
                      Member details loading...
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Member Corporations */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faBuilding} className="me-2" />
                Member Corporations
              </h5>
              {corporationsLoading && <Spinner animation="border" size="sm" />}
            </Card.Header>
            <Card.Body>
              {corporationsError ? (
                <Alert variant="warning" className="mb-0">
                  Unable to load member corporations:{' '}
                  {corporationsError.message}
                </Alert>
              ) : corporationsData && corporationsData.length > 0 ? (
                <Row>
                  {corporationsData.map((corp: any) => (
                    <Col
                      md={6}
                      lg={4}
                      key={corp.corporation_id}
                      className="mb-3"
                    >
                      <Card className="h-100 border-0 bg-light">
                        <Card.Body className="p-3">
                          <Row className="align-items-center">
                            <Col xs="auto">
                              <CorporationLogo
                                corporationId={corp.corporation_id}
                                size={48}
                              />
                            </Col>
                            <Col className="ps-2">
                              <h6 className="mb-1 small">{corp.name}</h6>
                              <p className="text-muted mb-1 small">
                                [{corp.ticker}]
                              </p>
                              <small className="text-muted">
                                {formatNumber(corp.member_count || 0)} members
                              </small>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-muted mb-0">No corporation data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Alliance Overview */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faGlobe} className="me-2" />
                Alliance Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">No description available</p>

              <hr />

              <Row className="g-2">
                <Col xs={6}>
                  <small className="text-muted">Alliance ID:</small>
                  <p className="mb-2">{alliance.id}</p>
                </Col>
                <Col xs={6}>
                  <small className="text-muted">Ticker:</small>
                  <p className="mb-2">[{alliance.ticker}]</p>
                </Col>
                <Col xs={6}>
                  <small className="text-muted">Founded:</small>
                  <p className="mb-2">
                    {alliance.date_founded
                      ? formatDate(alliance.date_founded)
                      : 'Unknown'}
                  </p>
                </Col>
                <Col xs={6}>
                  <small className="text-muted">Members:</small>
                  <p className="mb-2">
                    {formatNumber(
                      corporationsData?.reduce((total: number, corp: any) => total + (corp.member_count || 0), 0) || 0
                    )}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AllianceDashboard;

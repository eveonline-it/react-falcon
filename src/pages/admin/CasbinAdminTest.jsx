import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { 
  useUsers, 
  useRoles, 
  usePolicies, 
  useAuthStatus,
  UserDTO,
  RoleDTO,
  PolicyDTO,
  AuthStatusDTO
} from 'hooks/useCasbin';

const CasbinAdminTest = () => {
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({ page_size: 5 });
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRoles();
  const { data: policiesData, isLoading: policiesLoading, error: policiesError } = usePolicies();
  const { data: authData, isLoading: authLoading, error: authError } = useAuthStatus();

  const TestCard = ({ title, data, loading, error, useDisplayFormat = false }) => {
    const hasData = data && Object.keys(data).length > 0;
    const testStatus = loading ? 'loading' : error ? 'error' : hasData ? 'success' : 'warning';
    
    const getStatusIcon = () => {
      switch (testStatus) {
        case 'loading': return <FontAwesomeIcon icon={faSpinner} spin className="text-primary" />;
        case 'success': return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
        case 'error': return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
        case 'warning': return <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />;
        default: return null;
      }
    };

    const getStatusText = () => {
      switch (testStatus) {
        case 'loading': return 'Loading...';
        case 'success': return 'API Connected Successfully';
        case 'error': return `Error: ${error?.message || 'Unknown error'}`;
        case 'warning': return 'No data returned (API may be empty)';
        default: return 'Unknown status';
      }
    };

    const displayData = data && useDisplayFormat && typeof data.toDisplayFormat === 'function' 
      ? data.toDisplayFormat() 
      : data;

    return (
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{title}</h6>
          {getStatusIcon()}
        </Card.Header>
        <Card.Body>
          <div className="mb-2">
            <strong>Status:</strong> {getStatusText()}
          </div>
          
          {error && (
            <Alert variant="danger" className="mb-2">
              <strong>Error Details:</strong><br />
              Status: {error.status}<br />
              Message: {error.message}
            </Alert>
          )}
          
          {displayData && (
            <div>
              <strong>{useDisplayFormat ? 'DTO Display Format:' : 'Sample Data:'}</strong>
              <pre className="small mt-2 bg-light p-2 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(displayData, null, 2)}
              </pre>
            </div>
          )}
          
          {data && !useDisplayFormat && (
            <div>
              <strong>Raw API Response:</strong>
              <pre className="small mt-2 bg-light p-2 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const overallStatus = () => {
    if (usersLoading || rolesLoading || policiesLoading || authLoading) return 'loading';
    if (usersError || rolesError || policiesError || authError) return 'error';
    if (usersData || rolesData || policiesData || authData) return 'success';
    return 'warning';
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Casbin API Integration Test</h1>
            <div>
              {overallStatus() === 'loading' && (
                <Button variant="primary" disabled>
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Testing APIs...
                </Button>
              )}
              {overallStatus() === 'success' && (
                <Button variant="success" disabled>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  All APIs Working
                </Button>
              )}
              {overallStatus() === 'error' && (
                <Button variant="danger" disabled>
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  API Errors Detected
                </Button>
              )}
              {overallStatus() === 'warning' && (
                <Button variant="warning" disabled>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  APIs Empty
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Alert variant="info" className="mb-4">
        <h5>Test Results Summary</h5>
        <p>This page tests the Casbin API integration by calling each endpoint and displaying the results.</p>
        <ul className="mb-0">
          <li><strong>Green checkmark:</strong> API is working and returning data</li>
          <li><strong>Yellow warning:</strong> API is working but no data is available</li>
          <li><strong>Red X:</strong> API is failing (check error details)</li>
          <li><strong>Blue spinner:</strong> API call is in progress</li>
        </ul>
      </Alert>

      <Row>
        <Col md={6}>
          <TestCard
            title="Authentication Status API"
            data={authData}
            loading={authLoading}
            error={authError}
          />
          
          <TestCard
            title="Users API"
            data={usersData?.users?.[0]}
            loading={usersLoading}
            error={usersError}
            useDisplayFormat={true}
          />
        </Col>
        
        <Col md={6}>
          <TestCard
            title="Roles API"
            data={rolesData?.roles?.[0]}
            loading={rolesLoading}
            error={rolesError}
            transform={transformRoleData}
          />
          
          <TestCard
            title="Policies API"
            data={policiesData?.policies?.[0]}
            loading={policiesLoading}
            error={policiesError}
            transform={transformPolicyData}
          />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>API Endpoints Configuration</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Backend URL:</strong> {import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it'}
              </div>
              <div className="mb-3">
                <strong>Authentication:</strong> Cookie-based (credentials: 'include')
              </div>
              <div>
                <strong>Endpoints being tested:</strong>
                <ul className="mt-2">
                  <li><code>GET /auth/status</code> - Authentication status</li>
                  <li><code>GET /users/users</code> - User list</li>
                  <li><code>GET /admin/roles</code> - Role list</li>
                  <li><code>GET /admin/policies</code> - Policy list</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CasbinAdminTest;
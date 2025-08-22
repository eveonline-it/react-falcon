import React, { useState } from 'react';
import { Row, Col, Card, Badge, ProgressBar, Nav, Tab, Table, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, faCheck, faTimes, faChartLine, faSpinner, 
  faExclamationTriangle, faTasks, faServer, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

import { useGlobalExecutionStatistics, useSystemPerformanceTrends } from 'hooks/useTaskStatistics';

const TaskPerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const { statistics: globalStats, isLoading: globalLoading, error: globalError } = useGlobalExecutionStatistics();
  const { data: trendsData, isLoading: trendsLoading, error: trendsError } = useSystemPerformanceTrends(timeRange);

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
    } else {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
  };

  const renderOverviewStats = () => (
    <Row className="g-4">
      {/* Execution Summary */}
      <Col xl={3} md={6}>
        <Card className="h-100">
          <Card.Body>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faTasks} size="2x" className="text-primary me-3" />
              <div>
                <h6 className="mb-0">Total Executions</h6>
                <h4 className="mb-0">{globalStats.totalExecutions.toLocaleString()}</h4>
                <small className="text-muted">
                  {globalStats.executionsToday} today, {globalStats.executionsThisWeek} this week
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Success Rate */}
      <Col xl={3} md={6}>
        <Card className="h-100">
          <Card.Body>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faCheck} size="2x" className="text-success me-3" />
              <div className="flex-grow-1">
                <h6 className="mb-0">Success Rate</h6>
                <h4 className="mb-1">{globalStats.successRate.toFixed(1)}%</h4>
                <ProgressBar
                  now={globalStats.successRate}
                  variant={globalStats.successRate >= 90 ? 'success' : globalStats.successRate >= 70 ? 'warning' : 'danger'}
                  style={{ height: '4px' }}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Average Duration */}
      <Col xl={3} md={6}>
        <Card className="h-100">
          <Card.Body>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faClock} size="2x" className="text-info me-3" />
              <div>
                <h6 className="mb-0">Avg Duration</h6>
                <h4 className="mb-0">{formatDuration(globalStats.averageDuration)}</h4>
                <small className="text-muted">
                  Median: {formatDuration(globalStats.medianDuration)}
                </small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Performance Trend */}
      <Col xl={3} md={6}>
        <Card className="h-100">
          <Card.Body>
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={faChartLine} 
                size="2x" 
                className={`me-3 ${
                  globalStats.performanceTrend === 'improving' ? 'text-success' :
                  globalStats.performanceTrend === 'degrading' ? 'text-danger' : 'text-muted'
                }`}
                style={globalStats.performanceTrend === 'degrading' ? { transform: 'rotate(180deg)' } : {}}
              />
              <div>
                <h6 className="mb-0">Performance</h6>
                <Badge 
                  bg={
                    globalStats.performanceTrend === 'improving' ? 'success' :
                    globalStats.performanceTrend === 'degrading' ? 'danger' : 'secondary'
                  }
                >
                  {globalStats.performanceTrend}
                </Badge>
                <div className="small text-muted mt-1">
                  Last 10 vs previous 10
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Execution Status Breakdown */}
      <Col xl={6}>
        <Card className="h-100">
          <Card.Header>
            <h6 className="mb-0">Execution Status Breakdown</h6>
          </Card.Header>
          <Card.Body>
            <Row className="text-center">
              <Col>
                <div className="text-success">
                  <FontAwesomeIcon icon={faCheck} size="2x" />
                  <div className="mt-2">
                    <h5 className="mb-0">{globalStats.successCount}</h5>
                    <small>Success</small>
                  </div>
                </div>
              </Col>
              <Col>
                <div className="text-danger">
                  <FontAwesomeIcon icon={faTimes} size="2x" />
                  <div className="mt-2">
                    <h5 className="mb-0">{globalStats.failureCount}</h5>
                    <small>Failed</small>
                  </div>
                </div>
              </Col>
              <Col>
                <div className="text-primary">
                  <FontAwesomeIcon icon={faSpinner} size="2x" />
                  <div className="mt-2">
                    <h5 className="mb-0">{globalStats.runningCount}</h5>
                    <small>Running</small>
                  </div>
                </div>
              </Col>
              <Col>
                <div className="text-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
                  <div className="mt-2">
                    <h5 className="mb-0">{globalStats.timeoutCount}</h5>
                    <small>Timeout</small>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      {/* Duration Statistics */}
      <Col xl={6}>
        <Card className="h-100">
          <Card.Header>
            <h6 className="mb-0">Duration Statistics</h6>
          </Card.Header>
          <Card.Body>
            <Table size="sm" className="mb-0">
              <tbody>
                <tr>
                  <td>Average Duration</td>
                  <td className="text-end fw-bold">{formatDuration(globalStats.averageDuration)}</td>
                </tr>
                <tr>
                  <td>Median Duration</td>
                  <td className="text-end fw-bold">{formatDuration(globalStats.medianDuration)}</td>
                </tr>
                <tr>
                  <td>Min Duration</td>
                  <td className="text-end fw-bold">{formatDuration(globalStats.minDuration)}</td>
                </tr>
                <tr>
                  <td>Max Duration</td>
                  <td className="text-end fw-bold">{formatDuration(globalStats.maxDuration)}</td>
                </tr>
                <tr>
                  <td>Total Duration</td>
                  <td className="text-end fw-bold">{formatDuration(globalStats.totalDuration)}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderExecutionTrends = () => (
    <Row className="g-4">
      <Col>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Execution Trends</h6>
            <Nav variant="pills" size="sm">
              <Nav.Item>
                <Nav.Link 
                  active={timeRange === '1d'} 
                  onClick={() => setTimeRange('1d')}
                >
                  1D
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={timeRange === '7d'} 
                  onClick={() => setTimeRange('7d')}
                >
                  7D
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={timeRange === '30d'} 
                  onClick={() => setTimeRange('30d')}
                >
                  30D
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            {trendsLoading ? (
              <div className="text-center py-4">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <div className="mt-2">Loading trends...</div>
              </div>
            ) : trendsError ? (
              <Alert variant="warning">
                Failed to load trend data: {trendsError.message}
              </Alert>
            ) : trendsData?.trends?.length > 0 ? (
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Executions</th>
                      <th>Success Rate</th>
                      <th>Avg Duration</th>
                      <th>Failures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendsData.trends.slice(-10).map(trend => (
                      <tr key={trend.date}>
                        <td>{new Date(trend.date).toLocaleDateString()}</td>
                        <td>{trend.totalExecutions}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="me-2">{trend.successRate.toFixed(1)}%</span>
                            <ProgressBar
                              now={trend.successRate}
                              variant={trend.successRate >= 90 ? 'success' : trend.successRate >= 70 ? 'warning' : 'danger'}
                              style={{ height: '4px', width: '60px' }}
                            />
                          </div>
                        </td>
                        <td>{formatDuration(trend.averageDuration)}</td>
                        <td>
                          {trend.failureCount > 0 && (
                            <Badge bg="danger">{trend.failureCount}</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                No trend data available for the selected time range
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderRecentErrors = () => (
    <Row className="g-4">
      <Col>
        <Card>
          <Card.Header>
            <h6 className="mb-0">Recent Errors</h6>
          </Card.Header>
          <Card.Body>
            {globalStats.recentErrorMessages.length > 0 ? (
              <div className="table-responsive">
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Execution ID</th>
                      <th>Timestamp</th>
                      <th>Error Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalStats.recentErrorMessages.map(error => (
                      <tr key={error.id}>
                        <td>
                          <code>{error.id.substring(0, 8)}...</code>
                        </td>
                        <td>{new Date(error.timestamp).toLocaleString()}</td>
                        <td className="text-danger">
                          {error.message.length > 100 
                            ? `${error.message.substring(0, 100)}...`
                            : error.message
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted py-4">
                No recent errors found
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (globalLoading) {
    return (
      <div className="text-center py-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <div className="mt-3">Loading performance dashboard...</div>
      </div>
    );
  }

  if (globalError) {
    return (
      <Alert variant="danger">
        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
        Failed to load performance data: {globalError.message}
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Task Performance Dashboard</h4>
        <Badge bg="info">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="overview">Overview</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="trends">Trends</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="errors">Recent Errors</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="overview">
            {renderOverviewStats()}
          </Tab.Pane>
          <Tab.Pane eventKey="trends">
            {renderExecutionTrends()}
          </Tab.Pane>
          <Tab.Pane eventKey="errors">
            {renderRecentErrors()}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default TaskPerformanceDashboard;
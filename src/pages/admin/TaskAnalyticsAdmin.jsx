import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Nav, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faDownload, faRefresh, faSpinner, 
  faExclamationTriangle, faCalendarAlt, faClock
} from '@fortawesome/free-solid-svg-icons';

import { useSchedulerTasks, useSchedulerExecutions } from 'hooks/useScheduler.ts';
import { useGlobalExecutionStatistics, useSystemPerformanceTrends, calculateTaskStatistics } from 'hooks/useTaskStatistics';
import { TaskPerformanceCard, TaskPerformanceDashboard } from 'components/scheduler';

const TaskAnalyticsAdmin = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTaskType, setSelectedTaskType] = useState('');

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useSchedulerTasks({ limit: 100 });
  const { data: executionsData, isLoading: executionsLoading } = useSchedulerExecutions({ limit: 500 });
  const { statistics: globalStats, isLoading: globalLoading } = useGlobalExecutionStatistics();
  const { data: trendsData, isLoading: trendsLoading } = useSystemPerformanceTrends(timeRange);

  // Process task performance data
  const taskPerformanceData = useMemo(() => {
    if (!tasksData?.tasks || !executionsData?.executions) return [];

    return tasksData.tasks.map(task => {
      const taskExecutions = executionsData.executions.filter(exec => exec.task_id === task.id);
      const stats = calculateTaskStatistics(taskExecutions);
      
      return {
        task,
        executions: taskExecutions,
        statistics: stats
      };
    }).sort((a, b) => b.statistics.totalExecutions - a.statistics.totalExecutions);
  }, [tasksData, executionsData]);

  // Filter tasks by type
  const filteredTaskData = useMemo(() => {
    if (!selectedTaskType) return taskPerformanceData;
    return taskPerformanceData.filter(item => item.task.type === selectedTaskType);
  }, [taskPerformanceData, selectedTaskType]);

  // Get unique task types
  const taskTypes = useMemo(() => {
    if (!tasksData?.tasks) return [];
    return [...new Set(tasksData.tasks.map(task => task.type))];
  }, [tasksData]);

  const exportAnalyticsData = () => {
    if (!taskPerformanceData.length) return;

    const headers = [
      'Task Name', 'Task Type', 'Total Executions', 'Success Rate', 
      'Average Duration', 'Failed Count', 'Performance Trend'
    ];
    
    const csvData = [
      headers,
      ...taskPerformanceData.map(item => [
        item.task.name,
        item.task.type,
        item.statistics.totalExecutions,
        `${item.statistics.successRate.toFixed(1)}%`,
        item.statistics.averageDuration ? `${item.statistics.averageDuration.toFixed(1)}s` : '',
        item.statistics.failureCount,
        item.statistics.performanceTrend
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderSystemOverview = () => (
    <Row className="g-4">
      <Col>
        <TaskPerformanceDashboard />
      </Col>
    </Row>
  );

  const renderTaskAnalytics = () => (
    <Row className="g-4">
      {/* Filters */}
      <Col xs={12}>
        <Card>
          <Card.Body>
            <Row className="align-items-center">
              <Col md={3}>
                <Form.Label>Task Type Filter</Form.Label>
                <Form.Select
                  value={selectedTaskType}
                  onChange={(e) => setSelectedTaskType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {taskTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Time Range</Form.Label>
                <Form.Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </Form.Select>
              </Col>
              <Col md={6} className="d-flex align-items-end gap-2">
                <Button 
                  variant="outline-secondary"
                  onClick={() => window.location.reload()}
                >
                  <FontAwesomeIcon icon={faRefresh} className="me-2" />
                  Refresh Data
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={exportAnalyticsData}
                  disabled={!taskPerformanceData.length}
                >
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Export CSV
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      {/* Task Performance Cards */}
      {tasksLoading || executionsLoading ? (
        <Col xs={12}>
          <div className="text-center py-5">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <div className="mt-3">Loading task analytics...</div>
          </div>
        </Col>
      ) : filteredTaskData.length > 0 ? (
        filteredTaskData.map(({ task, executions, statistics }) => (
          <Col xl={4} lg={6} key={task.id}>
            <TaskPerformanceCard 
              task={task} 
              executions={executions}
            />
          </Col>
        ))
      ) : (
        <Col xs={12}>
          <Card>
            <Card.Body className="text-center py-5">
              <div className="text-muted">
                <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-3" />
                <div>No task data available for the selected filters</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      )}
    </Row>
  );

  const renderPerformanceTrends = () => (
    <Row className="g-4">
      <Col>
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Performance Trends Analysis</h6>
            <div className="d-flex gap-2">
              <Form.Select
                size="sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="1d">1D</option>
                <option value="7d">7D</option>
                <option value="30d">30D</option>
              </Form.Select>
            </div>
          </Card.Header>
          <Card.Body>
            {trendsLoading ? (
              <div className="text-center py-4">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <div className="mt-2">Loading trend analysis...</div>
              </div>
            ) : trendsData?.trends?.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Executions</th>
                      <th>Success Rate</th>
                      <th>Avg Duration</th>
                      <th>Failures</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendsData.trends.slice(-14).map((trend, index) => {
                      const previousTrend = index > 0 ? trendsData.trends[trendsData.trends.length - 14 + index - 1] : null;
                      const durationChange = previousTrend 
                        ? ((trend.averageDuration - previousTrend.averageDuration) / previousTrend.averageDuration) * 100
                        : 0;
                      
                      return (
                        <tr key={trend.date}>
                          <td>{new Date(trend.date).toLocaleDateString()}</td>
                          <td>{trend.totalExecutions}</td>
                          <td>
                            <span className={`text-${trend.successRate >= 90 ? 'success' : trend.successRate >= 70 ? 'warning' : 'danger'}`}>
                              {trend.successRate.toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">
                                {trend.averageDuration ? `${trend.averageDuration.toFixed(1)}s` : '-'}
                              </span>
                              {Math.abs(durationChange) > 5 && (
                                <FontAwesomeIcon 
                                  icon={faChartLine}
                                  className={`small ${durationChange > 0 ? 'text-danger' : 'text-success'}`}
                                  style={durationChange > 0 ? { transform: 'rotate(180deg)' } : {}}
                                />
                              )}
                            </div>
                          </td>
                          <td>
                            {trend.failureCount > 0 && (
                              <span className="badge bg-danger">{trend.failureCount}</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge bg-${trend.performanceTrend === 'improving' ? 'success' : trend.performanceTrend === 'degrading' ? 'danger' : 'secondary'}`}>
                              {trend.performanceTrend}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

  // Handle errors
  if (tasksError) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Task Analytics</h1>
          </Col>
        </Row>
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load task data: {tasksError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Task Analytics Dashboard</h1>
            <div className="d-flex align-items-center gap-3">
              <div className="small text-muted">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="system">System Overview</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tasks">Task Performance</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="trends">Performance Trends</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="system">
            {renderSystemOverview()}
          </Tab.Pane>
          <Tab.Pane eventKey="tasks">
            {renderTaskAnalytics()}
          </Tab.Pane>
          <Tab.Pane eventKey="trends">
            {renderPerformanceTrends()}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default TaskAnalyticsAdmin;
// React 19 JSX Transform - no explicit React import needed
import { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faPause, faStop, faTrash, faEdit, faPlus, faDownload, 
  faUpload, faCog, faHistory, faCheck, faTimes, faSpinner,
  faServer, faChartLine, faTasks, faExclamationTriangle, faSquare,
  faClock, faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import {
  useSchedulerStatus,
  useSchedulerStats,
  useSchedulerTasks,
  useTaskControl,
  useDeleteTask,
  useCreateTask,
  useUpdateTask,
  useBulkTaskOperation,
  useImportTasks
} from 'hooks/useScheduler';
import { useGlobalExecutionStatistics } from 'hooks/useTaskStatistics';

const SchedulerAdmin = () => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  });

  // Hooks
  const { data: status, isLoading: statusLoading } = useSchedulerStatus();
  const { data: stats, isLoading: statsLoading } = useSchedulerStats();
  const { data: tasksData, isLoading: tasksLoading } = useSchedulerTasks(taskFilters);
  const { data: globalStats } = useGlobalExecutionStatistics();

  const tasks = tasksData?.tasks || [];

  if (statusLoading || statsLoading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading scheduler data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-1">Scheduler Admin</h1>
              <p className="text-muted mb-0">
                Manage scheduled tasks and monitor system performance
              </p>
            </div>
            {status && (
              <div className="text-end">
                <Badge 
                  bg={status.status === 'running' ? 'success' : 'danger'} 
                  className="mb-1"
                >
                  Status: {status.status}
                </Badge>
                {status.uptime && (
                  <div className="small text-muted">
                    Uptime: {Math.floor(status.uptime / 3600)}h {Math.floor((status.uptime % 3600) / 60)}m
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faTasks} size="2x" className="text-primary me-3" />
                <div>
                  <h6 className="mb-0 text-500">Total Tasks</h6>
                  <h2 className="fw-normal text-700 mb-0">{stats?.total_tasks || 0}</h2>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faPlay} size="2x" className="text-success me-3" />
                <div>
                  <h6 className="mb-0 text-500">Running</h6>
                  <h2 className="fw-normal text-700 mb-0">{stats?.running_tasks || 0}</h2>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCheck} size="2x" className="text-info me-3" />
                <div>
                  <h6 className="mb-0 text-500">Completed Today</h6>
                  <h2 className="fw-normal text-700 mb-0">{stats?.completed_today || 0}</h2>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faTimes} size="2x" className="text-danger me-3" />
                <div>
                  <h6 className="mb-0 text-500">Failed Today</h6>
                  <h2 className="fw-normal text-700 mb-0">{stats?.failed_today || 0}</h2>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tasks List */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Scheduled Tasks</h6>
            </Card.Header>
            <Card.Body>
              {tasksLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  No tasks found
                </Alert>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Schedule</th>
                        <th>Last Run</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id}>
                          <td>
                            <div className="fw-semi-bold">{task.name}</div>
                            <div className="fs-11 text-500">ID: {task.id}</div>
                          </td>
                          <td>
                            <Badge bg="secondary">{task.type}</Badge>
                          </td>
                          <td>
                            <Badge bg={
                              task.status === 'running' ? 'success' :
                              task.status === 'paused' ? 'warning' :
                              task.status === 'failed' ? 'danger' : 'secondary'
                            }>
                              {task.status}
                            </Badge>
                          </td>
                          <td className="small text-500">{task.schedule}</td>
                          <td className="small text-500">
                            {task.last_run ? new Date(task.last_run).toLocaleString() : 'Never'}
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-1">
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              <FontAwesomeIcon icon={faTrash} size="xs" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SchedulerAdmin;
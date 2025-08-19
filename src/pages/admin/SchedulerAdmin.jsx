import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Dropdown, Alert, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faPause, faStop, faTrash, faEdit, faPlus, faDownload, 
  faUpload, faCog, faHistory, faCheck, faTimes, faSpinner,
  faServer, faChartLine, faTasks, faExclamationTriangle
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
} from 'hooks/useScheduler.ts';
import TaskModal from 'components/scheduler/TaskModal';
import TaskHistoryModal from 'components/scheduler/TaskHistoryModal';

const SchedulerAdmin = () => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [taskFilters, setTaskFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState(null);

  // Query hooks
  const { data: status, isLoading: statusLoading, error: statusError } = useSchedulerStatus();
  const { data: stats, isLoading: statsLoading } = useSchedulerStats();
  const { data: tasks, isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useSchedulerTasks(taskFilters);

  // Mutation hooks
  const taskControlMutation = useTaskControl();
  const deleteTaskMutation = useDeleteTask();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const bulkOperationMutation = useBulkTaskOperation();
  const importTasksMutation = useImportTasks();

  const handleTaskControl = async (action, taskId) => {
    try {
      await taskControlMutation.mutateAsync({ action, taskId });
      toast.success(`Task ${action} successful`);
    } catch (error) {
      toast.error(`Failed to ${action} task: ${error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  };

  const handleBulkOperation = async (operation) => {
    if (selectedTasks.length === 0) {
      toast.warning('Please select tasks first');
      return;
    }

    try {
      await bulkOperationMutation.mutateAsync({
        operation,
        task_ids: selectedTasks
      });
      toast.success(`Bulk ${operation} successful`);
      setSelectedTasks([]);
    } catch (error) {
      toast.error(`Bulk operation failed: ${error.message}`);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    if (!tasks?.tasks) return;
    if (selectedTasks.length === tasks.tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.tasks.map(task => task.id));
    }
  };

  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ 
        taskId: editingTask.id, 
        taskData 
      });
    } else {
      await createTaskMutation.mutateAsync(taskData);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'running': 'success',
      'paused': 'warning',
      'disabled': 'secondary',
      'failed': 'danger',
      'completed': 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check for permission errors
  const hasPermissionError = statusError?.status === 403 || tasksError?.status === 403;
  const hasOtherError = (statusError && statusError?.status !== 403) || (tasksError && tasksError?.status !== 403);
  
  if (hasPermissionError) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Scheduler Administration</h1>
          </Col>
        </Row>
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Access Denied</strong>
          <div className="mt-2">
            You need <code>admin</code> or <code>super_admin</code> role to access the scheduler administration panel.
          </div>
          <div className="mt-2 small text-muted">
            Please contact your administrator to request the necessary permissions.
          </div>
        </Alert>
      </Container>
    );
  }
  
  if (hasOtherError) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Scheduler Administration</h1>
          </Col>
        </Row>
        <Alert variant="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Connection Error</strong>
          <div className="mt-2">
            Unable to connect to scheduler service: {statusError?.message || tasksError?.message}
          </div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Scheduler Administration</h1>
            <div>
              <Button 
                variant="primary" 
                className="me-2"
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                New Task
              </Button>
              <Button variant="outline-secondary" onClick={() => refetchTasks()}>
                <FontAwesomeIcon icon={faCog} className="me-2" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Status Overview */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faServer} size="2x" className="text-primary me-3" />
                <div>
                  <h6 className="mb-0">Scheduler Status</h6>
                  {statusLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : status ? (
                    <div>
                      <span className={`text-${(status.engine || status.status === 'running') ? 'success' : 'danger'} fw-bold`}>
                        {(status.engine || status.status === 'running') ? 'Running' : 'Stopped'}
                      </span>
                      {status.version && (
                        <div className="text-muted small">v{status.version}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted">Unknown</span>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faTasks} size="2x" className="text-success me-3" />
                <div>
                  <h6 className="mb-0">Active Tasks</h6>
                  {statsLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <h4 className="mb-0">{stats?.active_tasks || 0}</h4>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faChartLine} size="2x" className="text-info me-3" />
                <div>
                  <h6 className="mb-0">Total Executions</h6>
                  {statsLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <h4 className="mb-0">{stats?.total_executions || 0}</h4>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-warning me-3" />
                <div>
                  <h6 className="mb-0">Failed Tasks</h6>
                  {statsLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <h4 className="mb-0">{stats?.failed_tasks || 0}</h4>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Task Management */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Tasks</h5>
                <div className="d-flex gap-2">
                  {selectedTasks.length > 0 && (
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-primary" size="sm">
                        Bulk Actions ({selectedTasks.length})
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleBulkOperation('enable')}>
                          <FontAwesomeIcon icon={faPlay} className="me-2" />
                          Enable Selected
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleBulkOperation('disable')}>
                          <FontAwesomeIcon icon={faStop} className="me-2" />
                          Disable Selected
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleBulkOperation('pause')}>
                          <FontAwesomeIcon icon={faPause} className="me-2" />
                          Pause Selected
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          onClick={() => handleBulkOperation('delete')}
                          className="text-danger"
                        >
                          <FontAwesomeIcon icon={faTrash} className="me-2" />
                          Delete Selected
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                  <Form.Control
                    type="text"
                    placeholder="Search tasks..."
                    value={taskFilters.search}
                    onChange={(e) => setTaskFilters(prev => ({ ...prev, search: e.target.value }))}
                    style={{ width: '200px' }}
                  />
                  <Form.Select
                    value={taskFilters.status}
                    onChange={(e) => setTaskFilters(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '150px' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="running">Running</option>
                    <option value="paused">Paused</option>
                    <option value="disabled">Disabled</option>
                    <option value="failed">Failed</option>
                  </Form.Select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {tasksLoading ? (
                <div className="text-center py-4">
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                  <div className="mt-2">Loading tasks...</div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectedTasks.length === tasks?.tasks?.length && tasks?.tasks?.length > 0}
                            onChange={selectAllTasks}
                          />
                        </th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Schedule</th>
                        <th>Last Run</th>
                        <th>Next Run</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks?.tasks?.map(task => (
                        <tr key={task.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => toggleTaskSelection(task.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <strong>{task.name}</strong>
                              {task.description && (
                                <div className="text-muted small">{task.description}</div>
                              )}
                            </div>
                          </td>
                          <td><Badge bg="info">{task.type}</Badge></td>
                          <td>{getStatusBadge(task.status)}</td>
                          <td>
                            <code className="small">{task.schedule}</code>
                          </td>
                          <td>
                            {task.last_run ? (
                              <div className="small">
                                {formatDate(task.last_run)}
                                {task.last_execution_status && (
                                  <div className={`text-${task.last_execution_status === 'success' ? 'success' : 'danger'}`}>
                                    <FontAwesomeIcon icon={task.last_execution_status === 'success' ? faCheck : faTimes} className="me-1" />
                                    {task.last_execution_status}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">Never</span>
                            )}
                          </td>
                          <td>
                            {task.next_run ? (
                              <div className="small">{formatDate(task.next_run)}</div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {task.status === 'running' ? (
                                <Button
                                  size="sm"
                                  variant="outline-warning"
                                  onClick={() => handleTaskControl('pause', task.id)}
                                  disabled={taskControlMutation.isPending}
                                >
                                  <FontAwesomeIcon icon={faPause} />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleTaskControl(task.status === 'paused' ? 'resume' : 'enable', task.id)}
                                  disabled={taskControlMutation.isPending}
                                >
                                  <FontAwesomeIcon icon={faPlay} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleTaskControl('execute', task.id)}
                                disabled={taskControlMutation.isPending}
                              >
                                <FontAwesomeIcon icon={faPlay} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => {
                                  setSelectedTaskForHistory(task.id);
                                  setShowHistoryModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faHistory} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowTaskModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={deleteTaskMutation.isPending}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
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

      {/* Modals */}
      <TaskModal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        task={editingTask}
        onSave={handleSaveTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <TaskHistoryModal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        taskId={selectedTaskForHistory}
        taskName={tasks?.tasks?.find(t => t.id === selectedTaskForHistory)?.name || ''}
      />
    </Container>
  );
};

export default SchedulerAdmin;
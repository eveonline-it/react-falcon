import React, { useState } from 'react';
import { Modal, Table, Badge, Button, Form, Alert, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, faCheck, faTimes, faExclamationTriangle, 
  faEye, faDownload, faRefresh
} from '@fortawesome/free-solid-svg-icons';

import { useTaskHistory } from 'hooks/useScheduler.ts';

const TaskHistoryModal = ({ 
  show, 
  onHide, 
  taskId,
  taskName 
}) => {
  const [historyParams, setHistoryParams] = useState({
    page: 1,
    limit: 20,
    status: '',
    start_date: '',
    end_date: ''
  });

  const { data: history, isLoading, error, refetch } = useTaskHistory(taskId, historyParams);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FontAwesomeIcon icon={faCheck} className="text-success" />;
      case 'failed':
        return <FontAwesomeIcon icon={faTimes} className="text-danger" />;
      case 'running':
        return <FontAwesomeIcon icon={faSpinner} spin className="text-primary" />;
      case 'timeout':
        return <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'success': 'success',
      'failed': 'danger',
      'running': 'primary',
      'timeout': 'warning',
      'cancelled': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
  };

  const handleFilterChange = (field, value) => {
    setHistoryParams(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setHistoryParams(prev => ({
      ...prev,
      page
    }));
  };

  const exportHistory = () => {
    // Create CSV data
    const headers = ['Execution ID', 'Status', 'Started', 'Duration', 'Error Message'];
    const csvData = [
      headers,
      ...(history?.executions || []).map(execution => [
        execution.id,
        execution.status,
        execution.started_at,
        execution.duration ? formatDuration(execution.duration) : '',
        execution.error_message || ''
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-${taskId}-history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderPagination = () => {
    if (!history?.pagination) return null;

    const { page, total_pages, total_count } = history.pagination;
    
    return (
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted">
          Showing {(page - 1) * historyParams.limit + 1} to{' '}
          {Math.min(page * historyParams.limit, total_count)} of {total_count} executions
        </div>
        <Pagination>
          <Pagination.Prev 
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          />
          {[...Array(total_pages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 || 
              pageNum === total_pages || 
              (pageNum >= page - 2 && pageNum <= page + 2)
            ) {
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === page}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            } else if (pageNum === page - 3 || pageNum === page + 3) {
              return <Pagination.Ellipsis key={pageNum} />;
            }
            return null;
          })}
          <Pagination.Next 
            disabled={page >= total_pages}
            onClick={() => handlePageChange(page + 1)}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          Task Execution History: {taskName}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Filters */}
        <div className="mb-3 p-3 bg-light rounded">
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={historyParams.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
                <option value="timeout">Timeout</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </div>
            
            <div className="col-md-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={historyParams.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={historyParams.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <Form.Label>&nbsp;</Form.Label>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => refetch()}>
                  <FontAwesomeIcon icon={faRefresh} />
                </Button>
                <Button 
                  variant="outline-primary"
                  onClick={exportHistory}
                  disabled={!history?.executions?.length}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Failed to load execution history: {error.message}
          </Alert>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center py-4">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <div className="mt-2">Loading execution history...</div>
          </div>
        ) : (
          <>
            {/* History table */}
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Execution ID</th>
                    <th>Status</th>
                    <th>Started At</th>
                    <th>Duration</th>
                    <th>Result</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history?.executions?.length > 0 ? (
                    history.executions.map(execution => (
                      <tr key={execution.id}>
                        <td>
                          <code>{execution.id.substring(0, 8)}...</code>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getStatusIcon(execution.status)}
                            <span className="ms-2">{getStatusBadge(execution.status)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            {formatDate(execution.started_at)}
                          </div>
                        </td>
                        <td>
                          {execution.duration ? (
                            <Badge bg="info">{formatDuration(execution.duration)}</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {execution.status === 'failed' && execution.error_message ? (
                            <div className="text-danger small" title={execution.error_message}>
                              {execution.error_message.length > 50 
                                ? `${execution.error_message.substring(0, 50)}...`
                                : execution.error_message
                              }
                            </div>
                          ) : execution.result ? (
                            <div className="text-success small">
                              <FontAwesomeIcon icon={faCheck} className="me-1" />
                              Completed
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-info"
                            onClick={() => {
                              // Show execution details in a modal or expand row
                              console.log('View execution details:', execution);
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No execution history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {history?.executions?.length > 0 && (
              <div className="mt-3">
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskHistoryModal;
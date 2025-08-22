import React from 'react';
import { Card, Badge, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, faCheck, faTimes, faChartLine, 
  faSpinner, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

const TaskPerformanceCard = ({ task, executions = [] }) => {
  const calculateMetrics = () => {
    if (!executions.length) {
      return {
        averageDuration: null,
        successRate: 0,
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        runningCount: 0,
        timeoutCount: 0,
        lastExecutionDuration: null,
        performanceTrend: 'stable'
      };
    }

    const successCount = executions.filter(e => e.status === 'success').length;
    const failureCount = executions.filter(e => e.status === 'failed').length;
    const runningCount = executions.filter(e => e.status === 'running').length;
    const timeoutCount = executions.filter(e => e.status === 'timeout').length;
    
    const completedExecutions = executions.filter(e => e.duration && e.status !== 'running');
    const averageDuration = completedExecutions.length > 0 
      ? completedExecutions.reduce((sum, e) => sum + e.duration, 0) / completedExecutions.length
      : null;

    const successRate = executions.length > 0 ? (successCount / executions.length) * 100 : 0;
    
    const lastExecution = executions[0];
    const lastExecutionDuration = lastExecution?.duration || null;

    // Calculate performance trend (comparing recent vs older executions)
    let performanceTrend = 'stable';
    if (completedExecutions.length >= 4) {
      const recent = completedExecutions.slice(0, 2);
      const older = completedExecutions.slice(-2);
      const recentAvg = recent.reduce((sum, e) => sum + e.duration, 0) / recent.length;
      const olderAvg = older.reduce((sum, e) => sum + e.duration, 0) / older.length;
      
      if (recentAvg < olderAvg * 0.9) performanceTrend = 'improving';
      else if (recentAvg > olderAvg * 1.1) performanceTrend = 'degrading';
    }

    return {
      averageDuration,
      successRate,
      totalExecutions: executions.length,
      successCount,
      failureCount,
      runningCount,
      timeoutCount,
      lastExecutionDuration,
      performanceTrend
    };
  };

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

  const getPerformanceTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <FontAwesomeIcon icon={faChartLine} className="text-success" />;
      case 'degrading':
        return <FontAwesomeIcon icon={faChartLine} className="text-danger" style={{ transform: 'rotate(180deg)' }} />;
      default:
        return <FontAwesomeIcon icon={faChartLine} className="text-muted" />;
    }
  };

  const getPerformanceTrendText = (trend) => {
    switch (trend) {
      case 'improving':
        return 'Performance improving';
      case 'degrading':
        return 'Performance degrading';
      default:
        return 'Performance stable';
    }
  };

  const metrics = calculateMetrics();

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="mb-1">{task.name}</h6>
            <Badge bg={task.type === 'system' ? 'warning' : 'info'} className="me-2">
              {task.type}
            </Badge>
            <Badge bg={task.status === 'running' ? 'success' : task.status === 'failed' ? 'danger' : 'secondary'}>
              {task.status}
            </Badge>
          </div>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{getPerformanceTrendText(metrics.performanceTrend)}</Tooltip>}
          >
            <div>
              {getPerformanceTrendIcon(metrics.performanceTrend)}
            </div>
          </OverlayTrigger>
        </div>

        {/* Duration Metrics */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <FontAwesomeIcon icon={faClock} className="text-primary me-2" />
              <span className="small text-muted">Avg Duration</span>
            </div>
            <span className="fw-bold">{formatDuration(metrics.averageDuration)}</span>
          </div>
          
          {metrics.lastExecutionDuration && (
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Last Execution</span>
              <span className="small">{formatDuration(metrics.lastExecutionDuration)}</span>
            </div>
          )}
        </div>

        {/* Success Rate */}
        {metrics.totalExecutions > 0 && (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted">Success Rate</span>
              <span className="fw-bold">{metrics.successRate.toFixed(1)}%</span>
            </div>
            <ProgressBar
              now={metrics.successRate}
              variant={metrics.successRate >= 90 ? 'success' : metrics.successRate >= 70 ? 'warning' : 'danger'}
              className="mb-2"
              style={{ height: '6px' }}
            />
          </div>
        )}

        {/* Execution Counts */}
        <div className="row g-2 text-center">
          <div className="col-3">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Successful executions</Tooltip>}
            >
              <div>
                <FontAwesomeIcon icon={faCheck} className="text-success mb-1" />
                <div className="small fw-bold">{metrics.successCount}</div>
              </div>
            </OverlayTrigger>
          </div>
          <div className="col-3">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Failed executions</Tooltip>}
            >
              <div>
                <FontAwesomeIcon icon={faTimes} className="text-danger mb-1" />
                <div className="small fw-bold">{metrics.failureCount}</div>
              </div>
            </OverlayTrigger>
          </div>
          <div className="col-3">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Running executions</Tooltip>}
            >
              <div>
                <FontAwesomeIcon icon={faSpinner} className="text-primary mb-1" />
                <div className="small fw-bold">{metrics.runningCount}</div>
              </div>
            </OverlayTrigger>
          </div>
          <div className="col-3">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Timeout executions</Tooltip>}
            >
              <div>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning mb-1" />
                <div className="small fw-bold">{metrics.timeoutCount}</div>
              </div>
            </OverlayTrigger>
          </div>
        </div>

        {metrics.totalExecutions === 0 && (
          <div className="text-center text-muted py-3">
            <div>No execution history</div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TaskPerformanceCard;
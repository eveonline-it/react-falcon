import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, Spinner,
  ProgressBar, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDatabase, faSync, faTrash,
  faCheckCircle, faExclamationTriangle, faInfoCircle,
  faClock, faServer, faPlay, faFileImport,
  faLayerGroup, faCubes, faGlobe, faUsers, faBuilding, faShip,
  faSpinner, faChartPie, faHistory
} from '@fortawesome/free-solid-svg-icons';

import { useSdeManager } from 'hooks/useSde';

const SdeAdmin = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [importConfig, setImportConfig] = useState({
    batchSize: 1000,
    dataTypes: [],
    force: false
  });

  // Enable real-time polling for status updates
  const {
    status,
    stats,
    isLoadingStatus,
    isLoadingStats,
    isImporting,
    isClearing,
    statusError,
    startImport,
    clearData,
    refetchStatus,
    refetchStats,
  } = useSdeManager(true);

  // Icon mapping for SDE data types
  const dataTypeIcons = {
    'characters': faUsers,
    'corporations': faBuilding,
    'alliances': faGlobe,
    'systems': faGlobe,
    'solar_systems': faGlobe,
    'types': faCubes,
    'item_types': faCubes,
    'ships': faShip,
    'stations': faBuilding,
    'regions': faLayerGroup,
    'categories': faLayerGroup,
    'groups': faLayerGroup,
    'market_groups': faLayerGroup,
    'blueprints': faFileImport,
    'dogma_attributes': faCubes,
    'dogma_effects': faCubes,
    'map_regions': faGlobe,
    'map_constellations': faGlobe,
    'map_solar_systems': faGlobe
  };

  // Label mapping for better display names
  const dataTypeLabels = {
    'characters': 'Characters',
    'corporations': 'Corporations', 
    'alliances': 'Alliances',
    'systems': 'Solar Systems',
    'solar_systems': 'Solar Systems',
    'types': 'Item Types',
    'item_types': 'Item Types',
    'ships': 'Ships',
    'stations': 'Stations',
    'regions': 'Regions',
    'categories': 'Categories',
    'groups': 'Groups',
    'market_groups': 'Market Groups',
    'blueprints': 'Blueprints',
    'dogma_attributes': 'Dogma Attributes',
    'dogma_effects': 'Dogma Effects',
    'map_regions': 'Map Regions',
    'map_constellations': 'Constellations',
    'map_solar_systems': 'Solar Systems'
  };

  // Get available data types from backend stats, fallback to common types if stats not loaded
  const availableDataTypes = useMemo(() => {
    if (stats?.data_types && Object.keys(stats.data_types).length > 0) {
      // Use actual data types from backend
      return Object.keys(stats.data_types).map(type => ({
        value: type,
        label: dataTypeLabels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: dataTypeIcons[type] || faCubes
      }));
    }
    
    // Fallback to common types when stats aren't loaded yet
    return [
      { value: 'characters', label: 'Characters', icon: faUsers },
      { value: 'corporations', label: 'Corporations', icon: faBuilding },
      { value: 'alliances', label: 'Alliances', icon: faGlobe },
      { value: 'systems', label: 'Solar Systems', icon: faGlobe },
      { value: 'types', label: 'Item Types', icon: faCubes },
      { value: 'ships', label: 'Ships', icon: faShip },
      { value: 'stations', label: 'Stations', icon: faBuilding },
      { value: 'regions', label: 'Regions', icon: faLayerGroup }
    ];
  }, [stats?.data_types]);

  // Calculate import progress if available
  const importProgress = useMemo(() => {
    if (!status?.import_status) return null;
    
    const { current_step, total_steps, processed, total_items } = status.import_status;
    
    if (total_steps && current_step !== undefined) {
      return {
        stepProgress: Math.round((current_step / total_steps) * 100),
        itemProgress: total_items ? Math.round((processed / total_items) * 100) : 0,
        currentStep: current_step,
        totalSteps: total_steps,
        processed: processed || 0,
        totalItems: total_items || 0
      };
    }
    
    return null;
  }, [status]);

  // Handle import configuration
  const handleDataTypeToggle = (dataType) => {
    setImportConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter(type => type !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  };

  const handleStartImport = () => {
    startImport({
      batchSize: importConfig.batchSize,
      dataTypes: importConfig.dataTypes.length > 0 ? importConfig.dataTypes : undefined,
      force: importConfig.force
    });
    setShowImportModal(false);
  };

  const handleClearData = () => {
    clearData();
    setShowClearModal(false);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'importing': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'idle': return 'secondary';
      default: return 'secondary';
    }
  };

  // Auto-refresh every 30 seconds when not importing
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isImporting) {
        refetchStatus();
        refetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isImporting, refetchStatus, refetchStats]);

  if (statusError?.status === 403) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>
              <FontAwesomeIcon icon={faDatabase} className="me-2" />
              SDE Import Management
            </h1>
          </Col>
        </Row>
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Access Denied</strong>
          <div className="mt-2">
            You need administrator privileges to access the SDE import management panel.
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>
              <FontAwesomeIcon icon={faDatabase} className="me-2" />
              SDE Import Management
              {status?.status && (
                <Badge 
                  bg={getStatusColor(status.status)} 
                  className={`ms-2 ${status.status === 'importing' ? 'status-pulse' : ''}`}
                >
                  {status.status}
                </Badge>
              )}
            </h1>
            <div>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => setShowImportModal(true)}
                disabled={isImporting || isClearing}
              >
                <FontAwesomeIcon icon={faFileImport} className="me-2" />
                Start Import
              </Button>
              <Button
                variant="outline-danger"
                className="me-2"
                onClick={() => setShowClearModal(true)}
                disabled={isImporting || isClearing}
              >
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Clear Data
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  refetchStatus();
                  refetchStats();
                }}
                disabled={isImporting || isClearing}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Status Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faDatabase} size="2x" className="text-primary me-3" />
                <div>
                  <h6 className="mb-0">Import Status</h6>
                  {isLoadingStatus ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <h5 className={`mb-0 text-${getStatusColor(status?.status)}`}>
                      {status?.status || 'Unknown'}
                    </h5>
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
                <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success me-3" />
                <div>
                  <h6 className="mb-0">Records Imported</h6>
                  {isLoadingStats ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <h4 className="mb-0">{stats?.total_keys || 0}</h4>
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
                <FontAwesomeIcon icon={faClock} size="2x" className="text-info me-3" />
                <div>
                  <h6 className="mb-0">Last Import</h6>
                  {isLoadingStats ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <div className="small">{formatDateTime(stats?.last_import)}</div>
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
                <FontAwesomeIcon icon={faServer} size="2x" className="text-warning me-3" />
                <div>
                  <h6 className="mb-0">Data Size</h6>
                  {isLoadingStats ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <h5 className="mb-0">{stats?.redis_memory_used || '0 MB'}</h5>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Import Progress */}
      {(isImporting || importProgress) && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Import Progress
                </h5>
              </Card.Header>
              <Card.Body>
                {importProgress && (
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Overall Progress</span>
                      <span>{importProgress.stepProgress}%</span>
                    </div>
                    <ProgressBar 
                      now={importProgress.stepProgress} 
                      variant="primary" 
                      className="mb-3"
                      style={{ height: '10px' }}
                    />
                    
                    <div className="d-flex justify-content-between mb-2">
                      <span>Current Batch</span>
                      <span>{importProgress.itemProgress}%</span>
                    </div>
                    <ProgressBar 
                      now={importProgress.itemProgress} 
                      variant="info" 
                      className="mb-3"
                      style={{ height: '8px' }}
                    />
                    
                    <Row>
                      <Col md={6}>
                        <small className="text-muted">
                          Step {importProgress.currentStep} of {importProgress.totalSteps}
                        </small>
                      </Col>
                      <Col md={6} className="text-end">
                        <small className="text-muted">
                          {importProgress.processed.toLocaleString()} / {importProgress.totalItems.toLocaleString()} records
                        </small>
                      </Col>
                    </Row>
                  </div>
                )}
                {isImporting && !importProgress && (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Import in progress...
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Statistics and Data Breakdown */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faChartPie} className="me-2" />
                Data Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              {isLoadingStats ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                </div>
              ) : stats?.data_types ? (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Data Type</th>
                      <th>Records</th>
                      <th>Last Updated</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.data_types).map(([type, data]) => {
                      const typeInfo = availableDataTypes.find(dt => dt.value === type);
                      return (
                        <tr key={type}>
                          <td>
                            <FontAwesomeIcon 
                              icon={typeInfo?.icon || faCubes} 
                              className="me-2 text-primary" 
                            />
                            {typeInfo?.label || type}
                          </td>
                          <td>
                            <strong>{data.count?.toLocaleString() || 0}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDateTime(data.last_updated)}
                            </small>
                          </td>
                          <td>
                            <Badge bg={data.count > 0 ? 'success' : 'secondary'}>
                              {data.count > 0 ? 'Complete' : 'Empty'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No data statistics available. Start an import to populate the database.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Recent Activity
              </h5>
            </Card.Header>
            <Card.Body>
              {stats?.recent_imports ? (
                <ListGroup variant="flush">
                  {stats.recent_imports.slice(0, 5).map((import_, index) => (
                    <ListGroup.Item key={index} className="px-0">
                      <div className="d-flex justify-content-between">
                        <div>
                          <Badge bg={import_.status === 'completed' ? 'success' : 'danger'} className="mb-1">
                            {import_.status}
                          </Badge>
                          <div className="small text-muted">
                            {import_.data_types?.join(', ') || 'All types'}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="small">{formatDateTime(import_.started_at)}</div>
                          {import_.duration && (
                            <div className="small text-muted">
                              {formatDuration(import_.duration)}
                            </div>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info" className="small">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No recent import activity.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Import Configuration Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faFileImport} className="me-2" />
            Configure SDE Import
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Batch Size</Form.Label>
              <Form.Control
                type="number"
                value={importConfig.batchSize}
                onChange={(e) => setImportConfig(prev => ({
                  ...prev,
                  batchSize: parseInt(e.target.value) || 1000
                }))}
                min="100"
                max="10000"
                step="100"
              />
              <Form.Text className="text-muted">
                Number of records to process in each batch (100-10,000)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data Types to Import</Form.Label>
              <div className="small text-muted mb-2">
                Leave empty to import all available data types
              </div>
              <Row>
                {availableDataTypes.map((dataType) => (
                  <Col md={6} key={dataType.value} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`datatype-${dataType.value}`}
                      label={
                        <span>
                          <FontAwesomeIcon icon={dataType.icon} className="me-2" />
                          {dataType.label}
                        </span>
                      }
                      checked={importConfig.dataTypes.includes(dataType.value)}
                      onChange={() => handleDataTypeToggle(dataType.value)}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="force-import"
                label="Force Import"
                checked={importConfig.force}
                onChange={(e) => setImportConfig(prev => ({
                  ...prev,
                  force: e.target.checked
                }))}
              />
              <Form.Text className="text-muted">
                Force import even if recent data exists. This will overwrite existing records.
              </Form.Text>
            </Form.Group>

            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong>Note:</strong> Large imports may take several minutes to complete. 
              You can monitor progress in real-time on this dashboard.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStartImport}
            disabled={isImporting}
          >
            <FontAwesomeIcon icon={faPlay} className="me-2" />
            Start Import
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Clear Data Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
            Clear SDE Data
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Warning!</strong> This action cannot be undone.
          </Alert>
          <p>
            Are you sure you want to clear all SDE data? This will permanently delete 
            all imported records from the database.
          </p>
          {stats?.total_keys && (
            <p className="text-muted">
              This will remove <strong>{stats.total_keys.toLocaleString()}</strong> records 
              totaling <strong>{stats.redis_memory_used}</strong> of data.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleClearData}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Clearing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Clear Data
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Add pulse animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes statusPulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
    100% { opacity: 1; transform: scale(1); }
  }
  .status-pulse {
    animation: statusPulse 2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

export default SdeAdmin;
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, Spinner,
  ProgressBar, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDatabase, faSync, faCheckCircle, faExclamationTriangle, faInfoCircle,
  faServer, faFileImport, faDownload, faUpload, faArchive, faUndo,
  faLayerGroup, faCubes, faGlobe, faUsers, faBuilding, faShip,
  faChartPie, faHistory, faCloudDownloadAlt, faBackward, faFolderOpen
} from '@fortawesome/free-solid-svg-icons';

import { useSdeAdminManager } from 'hooks/useSdeAdmin';

const SdeAdmin = () => {
  const [showReloadModal, setShowReloadModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showBackupsModal, setShowBackupsModal] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [reloadConfig, setReloadConfig] = useState({
    dataTypes: []
  });
  const [updateConfig, setUpdateConfig] = useState({
    source: 'ccp-official',
    convertToJson: true,
    backupCurrent: true
  });
  const [selectedBackup, setSelectedBackup] = useState(null);

  // Enable real-time polling for status updates
  const {
    moduleStatus,
    memoryStatus,
    stats,
    integrity,
    updateStatus,
    backups,
    sources,
    isLoadingMemoryStatus,
    isLoadingStats,
    isReloading,
    isCheckingUpdates,
    isLoadingBackups,
    isLoadingSources,
    isUpdating,
    isRestoring,
    memoryStatusError,
    updateCheckError,
    backupsError,
    sourcesError,
    reloadData,
    verifyIntegrity,
    checkForUpdates,
    updateSdeData,
    restoreBackup,
    refetchMemoryStatus,
    refetchStats,
    refetchBackups,
    refetchSources,
    totalDataTypes,
    loadedDataTypes,
    memoryUsageMB,
    totalItems,
    updatesAvailable,
    totalBackups,
    totalBackupSizeMB
  } = useSdeAdminManager(true);

  // Icon mapping for SDE data types (in-memory architecture)
  const dataTypeIcons = {
    'agents': faUsers,
    'categories': faLayerGroup,
    'blueprints': faFileImport,
    'marketGroups': faLayerGroup,
    'metaGroups': faLayerGroup,
    'npcCorporations': faBuilding,
    'typeIDs': faCubes,
    'types': faCubes,
    'typeMaterials': faCubes,
    'races': faUsers,
    'factions': faGlobe,
    'bloodlines': faUsers,
    'groups': faLayerGroup,
    'dogmaAttributes': faCubes,
    'ancestries': faUsers,
    'certificates': faCheckCircle,
    'characterAttributes': faUsers,
    'skins': faShip,
    'staStations': faBuilding,
    'dogmaEffects': faCubes,
    'iconIDs': faInfoCircle,
    'graphicIDs': faInfoCircle,
    'typeDogma': faCubes,
    'invFlags': faCubes,
    'stationServices': faBuilding,
    'stationOperations': faBuilding,
    'researchAgents': faUsers,
    'agentsInSpace': faUsers,
    'contrabandTypes': faExclamationTriangle,
    'corporationActivities': faBuilding,
    'invItems': faCubes,
    'npcCorporationDivisions': faBuilding,
    'controlTowerResources': faServer,
    'dogmaAttributeCategories': faCubes,
    'invNames': faInfoCircle,
    'invPositions': faInfoCircle,
    'invUniqueNames': faInfoCircle,
    'planetResources': faGlobe,
    'planetSchematics': faGlobe,
    'skinLicenses': faShip,
    'skinMaterials': faShip,
    'sovereigntyUpgrades': faGlobe,
    'translationLanguages': faInfoCircle
  };

  // Label mapping for better display names (in-memory SDE data types)
  const dataTypeLabels = {
    'agents': 'Mission Agents',
    'categories': 'Item Categories',
    'blueprints': 'Blueprints',
    'marketGroups': 'Market Groups',
    'metaGroups': 'Meta Groups',
    'npcCorporations': 'NPC Corporations',
    'typeIDs': 'Type IDs',
    'types': 'Item Types',
    'typeMaterials': 'Type Materials',
    'races': 'Character Races',
    'factions': 'Factions',
    'bloodlines': 'Character Bloodlines',
    'groups': 'Item Groups',
    'dogmaAttributes': 'Dogma Attributes',
    'ancestries': 'Character Ancestries',
    'certificates': 'Skill Certificates',
    'characterAttributes': 'Character Attributes',
    'skins': 'Ship Skins',
    'staStations': 'Stations',
    'dogmaEffects': 'Dogma Effects',
    'iconIDs': 'Icon IDs',
    'graphicIDs': 'Graphic IDs',
    'typeDogma': 'Type Dogma',
    'invFlags': 'Inventory Flags',
    'stationServices': 'Station Services',
    'stationOperations': 'Station Operations',
    'researchAgents': 'Research Agents',
    'agentsInSpace': 'Agents in Space',
    'contrabandTypes': 'Contraband Types',
    'corporationActivities': 'Corporation Activities',
    'invItems': 'Inventory Items',
    'npcCorporationDivisions': 'NPC Corporation Divisions',
    'controlTowerResources': 'Control Tower Resources',
    'dogmaAttributeCategories': 'Dogma Attribute Categories',
    'invNames': 'Inventory Names',
    'invPositions': 'Inventory Positions',
    'invUniqueNames': 'Unique Inventory Names',
    'planetResources': 'Planet Resources',
    'planetSchematics': 'Planet Schematics',
    'skinLicenses': 'Skin Licenses',
    'skinMaterials': 'Skin Materials',
    'sovereigntyUpgrades': 'Sovereignty Upgrades',
    'translationLanguages': 'Translation Languages'
  };

  // Get available data types from memory status
  const availableDataTypes = useMemo(() => {
    // Use loaded data types from memory status
    if (memoryStatus?.loaded_data_types && memoryStatus.loaded_data_types.length > 0) {
      return memoryStatus.loaded_data_types.map(type => ({
        value: type,
        label: dataTypeLabels[type] || type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        icon: dataTypeIcons[type] || faCubes
      }));
    }
    
    // Fallback to data type statuses if available
    if (memoryStatus?.data_type_statuses && Object.keys(memoryStatus.data_type_statuses).length > 0) {
      return Object.keys(memoryStatus.data_type_statuses).map(type => ({
        value: type,
        label: dataTypeLabels[type] || type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        icon: dataTypeIcons[type] || faCubes
      }));
    }
    
    // Fallback to common SDE types when nothing is loaded yet
    return [
      { value: 'agents', label: 'Mission Agents', icon: faUsers },
      { value: 'types', label: 'Item Types', icon: faCubes },
      { value: 'categories', label: 'Item Categories', icon: faLayerGroup },
      { value: 'blueprints', label: 'Blueprints', icon: faFileImport },
      { value: 'npcCorporations', label: 'NPC Corporations', icon: faBuilding },
      { value: 'races', label: 'Character Races', icon: faUsers },
      { value: 'factions', label: 'Factions', icon: faGlobe },
      { value: 'dogmaAttributes', label: 'Dogma Attributes', icon: faCubes }
    ];
  }, [memoryStatus?.loaded_data_types, memoryStatus?.data_type_statuses]);

  // Memory usage as a simple indicator (no system memory available)
  const memoryUsagePercent = useMemo(() => {
    // Since we don't have system memory info, show data completeness instead
    if (!totalDataTypes || totalDataTypes === 0) return 0;
    return Math.round((loadedDataTypes / totalDataTypes) * 100);
  }, [loadedDataTypes, totalDataTypes]);
  
  // Data completeness percentage
  const dataCompletenessPercent = useMemo(() => {
    if (!totalDataTypes || totalDataTypes === 0) return 0;
    return Math.round((loadedDataTypes / totalDataTypes) * 100);
  }, [loadedDataTypes, totalDataTypes]);

  // Handle reload configuration
  const handleDataTypeToggle = (dataType) => {
    setReloadConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(dataType)
        ? prev.dataTypes.filter(type => type !== dataType)
        : [...prev.dataTypes, dataType]
    }));
  };

  const handleStartReload = () => {
    reloadData({
      dataTypes: reloadConfig.dataTypes.length > 0 ? reloadConfig.dataTypes : undefined
    });
    setShowReloadModal(false);
  };

  const handleVerifyIntegrity = () => {
    verifyIntegrity();
  };

  const handleCheckUpdates = () => {
    checkForUpdates();
  };

  const handleStartUpdate = () => {
    updateSdeData(updateConfig);
    setShowUpdateModal(false);
  };

  const handleRestoreBackup = () => {
    if (selectedBackup) {
      restoreBackup({ 
        backupId: selectedBackup.id,
        deleteBackup: false 
      });
      setShowBackupsModal(false);
      setSelectedBackup(null);
    }
  };

  const handleOpenBackupsModal = () => {
    setShowBackupsModal(true);
    refetchBackups();
  };

  const handleOpenSourcesModal = () => {
    setShowSourcesModal(true);
    refetchSources();
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
      case 'healthy': return 'success';
      case 'loading': return 'primary';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };

  // Auto-refresh every 30 seconds when not reloading
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isReloading) {
        refetchMemoryStatus();
        refetchStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isReloading, refetchMemoryStatus, refetchStats]);

  if (memoryStatusError?.status === 403) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>
              <FontAwesomeIcon icon={faDatabase} className="me-2" />
              SDE Memory Administration
            </h1>
          </Col>
        </Row>
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Access Denied</strong>
          <div className="mt-2">
            You need Super Administrator privileges to access the SDE memory management panel.
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
              SDE Memory Administration
              {moduleStatus?.status && (
                <Badge 
                  bg={getStatusColor(moduleStatus.status)} 
                  className={`ms-2 ${isReloading ? 'status-pulse' : ''}`}
                >
                  {moduleStatus.status}
                </Badge>
              )}
            </h1>
            <div>
              <Button
                variant={updatesAvailable ? 'success' : 'outline-primary'}
                className="me-2"
                onClick={() => setShowUpdateModal(true)}
                disabled={isUpdating || isReloading}
              >
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                {updatesAvailable ? 'Update Available!' : 'Check Updates'}
              </Button>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => setShowReloadModal(true)}
                disabled={isReloading || isUpdating}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Reload Data
              </Button>
              <Button
                variant="outline-warning"
                className="me-2"
                onClick={handleOpenBackupsModal}
                disabled={isReloading || isUpdating}
              >
                <FontAwesomeIcon icon={faArchive} className="me-2" />
                Backups ({totalBackups})
              </Button>
              <Button
                variant="outline-info"
                className="me-2"
                onClick={handleVerifyIntegrity}
                disabled={isReloading || isUpdating}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                Verify Integrity
              </Button>
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={handleOpenSourcesModal}
                disabled={isReloading || isUpdating}
              >
                <FontAwesomeIcon icon={faFolderOpen} className="me-2" />
                Sources
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  refetchMemoryStatus();
                  refetchStats();
                  handleCheckUpdates();
                }}
                disabled={isReloading || isUpdating}
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
                  <h6 className="mb-0">Memory Status</h6>
                  {isLoadingMemoryStatus ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <h5 className={`mb-0 text-${getStatusColor(moduleStatus?.status)}`}>
                      {moduleStatus?.status || 'Unknown'}
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
                <FontAwesomeIcon icon={faLayerGroup} size="2x" className="text-success me-3" />
                <div>
                  <h6 className="mb-0">Data Types Loaded</h6>
                  {isLoadingMemoryStatus ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <h4 className="mb-0">{loadedDataTypes}/{totalDataTypes}</h4>
                  )}
                  <div className="small text-muted">{dataCompletenessPercent}% complete</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-info me-3" />
                <div>
                  <h6 className="mb-0">Status</h6>
                  {isLoadingMemoryStatus ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <Badge bg={memoryStatus?.is_loaded ? 'success' : 'secondary'}>
                      {memoryStatus?.is_loaded ? 'Loaded' : 'Not Loaded'}
                    </Badge>
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
                  <h6 className="mb-0">Memory Usage</h6>
                  {isLoadingMemoryStatus ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <h5 className="mb-0">{memoryUsageMB?.toFixed(1) || '0'} MB</h5>
                  )}
                  <div className="small text-muted">{totalItems?.toLocaleString() || '0'} items</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Memory Analytics */}
      <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faChartPie} className="me-2" />
                  Memory Analytics
                </h5>
              </Card.Header>
              <Card.Body>
                {isLoadingMemoryStatus ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>SDE Memory Usage</span>
                      <span>{memoryUsageMB?.toFixed(1) || '0'} MB</span>
                    </div>
                    <ProgressBar 
                      now={memoryUsagePercent} 
                      variant={memoryUsagePercent > 80 ? 'danger' : memoryUsagePercent > 60 ? 'warning' : 'success'} 
                      className="mb-3"
                      style={{ height: '10px' }}
                    />
                    
                    <div className="d-flex justify-content-between mb-2">
                      <span>Data Completeness</span>
                      <span>{dataCompletenessPercent}%</span>
                    </div>
                    <ProgressBar 
                      now={dataCompletenessPercent} 
                      variant="info" 
                      className="mb-3"
                      style={{ height: '8px' }}
                    />
                    
                    <Row>
                      <Col md={6}>
                        <small className="text-muted">
                          {loadedDataTypes}/{totalDataTypes} data types
                        </small>
                      </Col>
                      <Col md={6} className="text-end">
                        <small className="text-muted">
                          {totalItems?.toLocaleString() || '0'} total items
                        </small>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

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
              ) : memoryStatus?.data_type_statuses ? (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Data Type</th>
                      <th>Items</th>
                      <th>Memory</th>
                      <th>File Path</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(memoryStatus.data_type_statuses).map(([type, data]) => {
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
                              {data.memory_bytes ? (data.memory_bytes / (1024 * 1024)).toFixed(2) : '0'} MB
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {data.file_path || 'N/A'}
                            </small>
                          </td>
                          <td>
                            <Badge bg={data.loaded ? 'success' : 'secondary'}>
                              {data.loaded ? 'Loaded' : 'Not Loaded'}
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
                  No data available. Data types will appear here once loaded in memory.
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

      {/* Reload Configuration Modal */}
      <Modal show={showReloadModal} onHide={() => setShowReloadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faSync} className="me-2" />
            Reload SDE Data
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Data Types to Reload</Form.Label>
              <div className="small text-muted mb-2">
                Leave empty to reload all data types from files
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
                      checked={reloadConfig.dataTypes.includes(dataType.value)}
                      onChange={() => handleDataTypeToggle(dataType.value)}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong>Note:</strong> Data reload from files is instant. This will update 
              the in-memory data structures with the latest file contents.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReloadModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleStartReload}
            disabled={isReloading}
          >
            <FontAwesomeIcon icon={faSync} className="me-2" />
            Reload Data
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SDE Details Modal */}
      <Modal show={showSystemModal} onHide={() => setShowSystemModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faDatabase} className="me-2" />
            SDE Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Memory Status</h6>
                </Card.Header>
                <Card.Body>
                  <Table size="sm" className="mb-0">
                    <tbody>
                      <tr>
                        <td>Total Data Types:</td>
                        <td><strong>{totalDataTypes}</strong></td>
                      </tr>
                      <tr>
                        <td>Loaded Types:</td>
                        <td><strong>{loadedDataTypes}</strong></td>
                      </tr>
                      <tr>
                        <td>Memory Usage:</td>
                        <td><strong>{memoryUsageMB?.toFixed(2) || '0'} MB</strong></td>
                      </tr>
                      <tr>
                        <td>Total Items:</td>
                        <td><strong>{totalItems?.toLocaleString() || '0'}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Module Status</h6>
                </Card.Header>
                <Card.Body>
                  <Table size="sm" className="mb-0">
                    <tbody>
                      <tr>
                        <td>Module:</td>
                        <td><code>{moduleStatus?.module || 'sde_admin'}</code></td>
                      </tr>
                      <tr>
                        <td>Status:</td>
                        <td>
                          <Badge bg={getStatusColor(moduleStatus?.status)}>
                            {moduleStatus?.status || 'Unknown'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Message:</td>
                        <td><small>{moduleStatus?.message || 'N/A'}</small></td>
                      </tr>
                      <tr>
                        <td>Data Loaded:</td>
                        <td>
                          <Badge bg={memoryStatus?.is_loaded ? 'success' : 'secondary'}>
                            {memoryStatus?.is_loaded ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12}>
              {integrity && (
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Data Integrity</h6>
                  </Card.Header>
                  <Card.Body>
                    <Table size="sm" className="mb-0">
                      <tbody>
                        <tr>
                          <td>Overall Status:</td>
                          <td>
                            <Badge bg={integrity.valid ? 'success' : 'danger'}>
                              {integrity.valid ? 'Valid' : 'Issues Found'}
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td>Data Completeness:</td>
                          <td>
                            <Badge bg={integrity.checks?.data_completeness?.valid ? 'success' : 'warning'}>
                              {integrity.checks?.data_completeness?.valid ? 'Valid' : 'Warning'}
                            </Badge>
                            <small className="ms-2 text-muted">
                              ({integrity.checks?.data_completeness?.loaded_types || 0}/{integrity.checks?.data_completeness?.expected_types || 0} types)
                            </small>
                          </td>
                        </tr>
                        <tr>
                          <td>Data Consistency:</td>
                          <td>
                            <Badge bg={integrity.checks?.data_consistency?.valid ? 'success' : 'danger'}>
                              {integrity.checks?.data_consistency?.valid ? 'Valid' : 'Error'}
                            </Badge>
                            <small className="ms-2 text-muted">
                              ({integrity.checks?.data_consistency?.total_items?.toLocaleString() || 0} items)
                            </small>
                          </td>
                        </tr>
                        <tr>
                          <td>Memory Integrity:</td>
                          <td>
                            <Badge bg={integrity.checks?.memory_integrity?.valid ? 'success' : 'warning'}>
                              {integrity.checks?.memory_integrity?.valid ? 'Valid' : 'Warning'}
                            </Badge>
                            <small className="ms-2 text-muted">
                              ({integrity.checks?.memory_integrity?.estimated_memory_mb?.toFixed(2) || 0} MB)
                            </small>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <div className="text-end mt-2">
                      <small className="text-muted">
                        Last verified: {formatDateTime(integrity.verification_time)}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-info" onClick={verifyIntegrity} disabled={isReloading}>
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            Verify Integrity
          </Button>
          <Button variant="secondary" onClick={() => setShowSystemModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SDE Update Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Update SDE Data
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {updateStatus && (
              <Alert variant={updatesAvailable ? 'success' : 'info'} className="mb-3">
                <FontAwesomeIcon icon={updatesAvailable ? faCheckCircle : faInfoCircle} className="me-2" />
                {updatesAvailable ? (
                  <div>
                    <strong>Updates Available!</strong>
                    <div>Current: {updateStatus.current_version}</div>
                    <div>Latest: {updateStatus.latest_version}</div>
                  </div>
                ) : (
                  <strong>No updates available. Your SDE data is up to date.</strong>
                )}
                <div className="small mt-1">Last checked: {formatDateTime(updateStatus.checked_at)}</div>
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Update Source</Form.Label>
              <Form.Select
                value={updateConfig.source}
                onChange={(e) => setUpdateConfig(prev => ({ ...prev, source: e.target.value }))}
              >
                <option value="ccp-official">CCP (Official)</option>
              </Form.Select>
              <div className="small text-muted mt-1">
                Official CCP source is recommended for production use
              </div>
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="convert-to-json"
              label="Convert YAML to JSON"
              checked={updateConfig.convertToJson}
              onChange={(e) => setUpdateConfig(prev => ({ ...prev, convertToJson: e.target.checked }))}
              className="mb-2"
            />
            
            <Form.Check
              type="checkbox"
              id="backup-current"
              label="Create backup before update"
              checked={updateConfig.backupCurrent}
              onChange={(e) => setUpdateConfig(prev => ({ ...prev, backupCurrent: e.target.checked }))}
              className="mb-3"
            />

            <Alert variant="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Warning:</strong> This will download and extract the latest SDE data, 
              replacing the current version. The process may take several minutes.
              {updateConfig.backupCurrent && ' A backup will be created automatically.'}
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-primary" 
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates || isUpdating}
          >
            <FontAwesomeIcon icon={faSync} className="me-2" />
            {isCheckingUpdates ? 'Checking...' : 'Check for Updates'}
          </Button>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleStartUpdate}
            disabled={isUpdating || isCheckingUpdates}
          >
            <FontAwesomeIcon icon={isUpdating ? faSync : faDownload} className="me-2" />
            {isUpdating ? 'Updating...' : 'Start Update'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Backups Management Modal */}
      <Modal show={showBackupsModal} onHide={() => setShowBackupsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faArchive} className="me-2" />
            SDE Backups
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingBackups ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading backups...</div>
            </div>
          ) : backupsError ? (
            <Alert variant="danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Failed to load backups: {backupsError.message}
            </Alert>
          ) : backups?.backups && backups.backups.length > 0 ? (
            <div>
              <div className="d-flex justify-content-between mb-3">
                <div>
                  <strong>{totalBackups}</strong> backups available
                </div>
                <div>
                  Total size: <strong>{totalBackupSizeMB.toFixed(1)} MB</strong>
                </div>
              </div>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th></th>
                    <th>Backup ID</th>
                    <th>Created</th>
                    <th>Size</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.backups.map((backup) => (
                    <tr 
                      key={backup.id} 
                      className={selectedBackup?.id === backup.id ? 'table-active' : ''}
                    >
                      <td>
                        <Form.Check
                          type="radio"
                          name="selectedBackup"
                          checked={selectedBackup?.id === backup.id}
                          onChange={() => setSelectedBackup(backup)}
                        />
                      </td>
                      <td><code>{backup.id}</code></td>
                      <td>{formatDateTime(backup.created_at)}</td>
                      <td>{backup.size_mb?.toFixed(1)} MB</td>
                      <td>{backup.version || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              No backups available
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackupsModal(false)}>
            Close
          </Button>
          <Button 
            variant="warning" 
            onClick={handleRestoreBackup}
            disabled={!selectedBackup || isRestoring}
          >
            <FontAwesomeIcon icon={isRestoring ? faSync : faUndo} className="me-2" />
            {isRestoring ? 'Restoring...' : 'Restore Selected'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sources Configuration Modal */}
      <Modal show={showSourcesModal} onHide={() => setShowSourcesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faFolderOpen} className="me-2" />
            SDE Sources Configuration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingSources ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2">Loading sources...</div>
            </div>
          ) : sourcesError ? (
            <Alert variant="danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Failed to load sources: {sourcesError.message}
            </Alert>
          ) : sources?.sources && sources.sources.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>URL</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sources.sources.map((source, index) => (
                  <tr key={index}>
                    <td><strong>{source.name}</strong></td>
                    <td>
                      <Badge bg="primary">{source.type}</Badge>
                    </td>
                    <td>
                      <small className="text-muted">{source.url}</small>
                    </td>
                    <td>
                      <Badge bg={source.enabled ? 'success' : 'secondary'}>
                        {source.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              No sources configured
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSourcesModal(false)}>
            Close
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
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Form, 
  Alert, Modal, Table, InputGroup, Spinner, OverlayTrigger, Tooltip,
  Tabs, Tab, Placeholder, ButtonGroup, Dropdown, ProgressBar, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faEye, faSync, faEdit,
  faCheck, faTimes, faExclamationTriangle, faPlus, faTrash,
  faCheckCircle, faTimesCircle, faInfoCircle, faServer,
  faUsers, faCogs, faLink, faUnlink, faBolt, faShieldAlt,
  faCloudUploadAlt, faCloudDownloadAlt, faCopy, faFileExport,
  faStickyNote, faBuilding, faUsersCog, faRobot, faCrown,
  faGlobe, faCalendarAlt, faSave, faUserPlus, faUserMinus
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { toast } from 'react-toastify';

// Custom Discord hooks
import {
  useDiscordStatus,
  useDiscordGuilds,
  useDiscordGuild,
  useDiscordGuildRoles,
  useCreateDiscordGuild,
  useUpdateDiscordGuild,
  useDeleteDiscordGuild,
  useDiscordRoleMappings,
  useCreateDiscordRoleMapping,
  useUpdateDiscordRoleMapping,
  useDeleteDiscordRoleMapping,
  useDiscordSyncStatus,
  useSyncDiscordUser,
  useManualDiscordSync,
  useDiscordUsers,
  useDiscordGuildStats,
  useDiscordAuthStatus,
  useDiscordAuthUrl
} from 'hooks/useDiscord';

// Import existing hooks for groups
import { useGroups } from 'hooks/useGroups';
import { useCurrentUser } from 'hooks/auth/useAuth';

const DiscordAdmin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    enabled: '',
    guild_id: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuildModal, setShowGuildModal] = useState(false);
  const [editingGuild, setEditingGuild] = useState(null);
  const [showDeleteGuildConfirm, setShowDeleteGuildConfirm] = useState(false);
  const [guildToDelete, setGuildToDelete] = useState(null);
  const [showRoleMappingModal, setShowRoleMappingModal] = useState(false);
  const [editingRoleMapping, setEditingRoleMapping] = useState(null);
  const [showDeleteRoleMappingConfirm, setShowDeleteRoleMappingConfirm] = useState(false);
  const [roleMappingToDelete, setRoleMappingToDelete] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedSyncAction, setSelectedSyncAction] = useState('');
  const [selectedGuildId, setSelectedGuildId] = useState('');
  
  const [guildFormData, setGuildFormData] = useState({
    guild_id: '',
    guild_name: '',
    bot_token: ''
  });

  const [roleMappingFormData, setRoleMappingFormData] = useState({
    guild_id: '',
    discord_role_id: '',
    discord_role_name: '',
    group_id: '',
    is_active: true
  });

  // Data hooks
  const { data: discordStatus, isLoading: statusLoading, error: statusError } = useDiscordStatus();
  const { data: guildsData, isLoading: guildsLoading, error: guildsError, refetch: refetchGuilds } = useDiscordGuilds(filters);
  const { data: roleMappingsData, isLoading: mappingsLoading, refetch: refetchMappings } = useDiscordRoleMappings(filters);
  const { data: syncStatus, isLoading: syncLoading, refetch: refetchSync } = useDiscordSyncStatus();
  const { data: discordUsers, isLoading: usersLoading, refetch: refetchUsers } = useDiscordUsers(filters);
  const { data: discordStats, isLoading: statsLoading } = useDiscordGuildStats();
  const { data: groupsData } = useGroups({ limit: 100 }); // Get all groups for role mapping
  const { data: guildRolesData, isLoading: rolesLoading } = useDiscordGuildRoles(roleMappingFormData.guild_id);
  
  // Debug Discord auth status
  const { data: authStatus, isLoading: authLoading, error: authError } = useDiscordAuthStatus();
  const { data: authUrl, isLoading: authUrlLoading } = useDiscordAuthUrl();
  
  // Get current user authentication status
  const { user: currentUser, isAuthenticated, isLoading: userLoading } = useCurrentUser();

  // Mutation hooks
  const createGuildMutation = useCreateDiscordGuild();
  const updateGuildMutation = useUpdateDiscordGuild();
  const deleteGuildMutation = useDeleteDiscordGuild();
  const createRoleMappingMutation = useCreateDiscordRoleMapping();
  const updateRoleMappingMutation = useUpdateDiscordRoleMapping();
  const deleteRoleMappingMutation = useDeleteDiscordRoleMapping();
  const manualSyncMutation = useManualDiscordSync();
  const syncUserMutation = useSyncDiscordUser();

  const guilds = guildsData?.guilds || [];
  const roleMappings = roleMappingsData?.role_mappings || roleMappingsData?.mappings || [];
  const users = discordUsers?.users || [];
  const groups = groupsData?.groups || [];
  const guildRoles = guildRolesData?.roles || [];

  // Auto-refresh sync status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSync();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetchSync]);

  // Filter functions
  const filteredGuilds = useMemo(() => {
    if (!searchTerm) return guilds;
    return guilds.filter(guild => 
      guild.guild_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guild.guild_id?.includes(searchTerm)
    );
  }, [guilds, searchTerm]);

  const filteredRoleMappings = useMemo(() => {
    if (!searchTerm) return roleMappings;
    return roleMappings.filter(mapping => 
      mapping.discord_role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roleMappings, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.global_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.go_falcon_user_id?.includes(searchTerm) ||
      user.discord_id?.includes(searchTerm) ||
      user.user_id?.includes(searchTerm)
    );
  }, [users, searchTerm]);

  // Modal handlers
  const handleOpenGuildModal = useCallback((guild = null) => {
    if (guild) {
      setEditingGuild(guild);
      setGuildFormData({
        guild_id: guild.guild_id,
        guild_name: guild.guild_name,
        bot_token: guild.bot_token || ''
      });
    } else {
      setEditingGuild(null);
      setGuildFormData({
        guild_id: '',
        guild_name: '',
        bot_token: ''
      });
    }
    setShowGuildModal(true);
  }, []);

  const handleOpenRoleMappingModal = useCallback((mapping = null) => {
    if (mapping) {
      setEditingRoleMapping(mapping);
      setRoleMappingFormData({
        guild_id: mapping.guild_id,
        discord_role_id: mapping.discord_role_id,
        discord_role_name: mapping.discord_role_name,
        group_id: mapping.group_id,
        is_active: mapping.is_active !== undefined ? mapping.is_active : mapping.enabled !== undefined ? mapping.enabled : true
      });
    } else {
      setEditingRoleMapping(null);
      setRoleMappingFormData({
        guild_id: '',
        discord_role_id: '',
        discord_role_name: '',
        group_id: '',
        is_active: true
      });
    }
    setShowRoleMappingModal(true);
  }, []);

  // Form handlers
  const handleSaveGuild = async (e) => {
    e.preventDefault();
    
    try {
      // Only send the fields the server expects
      const guildData = {
        guild_id: guildFormData.guild_id,
        guild_name: guildFormData.guild_name,
        bot_token: guildFormData.bot_token
      };

      if (editingGuild) {
        await updateGuildMutation.mutateAsync({ 
          guildId: editingGuild.guild_id, 
          data: guildData 
        });
      } else {
        await createGuildMutation.mutateAsync(guildData);
      }
      
      setShowGuildModal(false);
      setEditingGuild(null);
      refetchGuilds();
    } catch (err) {
      // Error already handled in mutation
    }
  };

  const handleSaveRoleMapping = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRoleMapping) {
        await updateRoleMappingMutation.mutateAsync({ 
          mappingId: editingRoleMapping.id, 
          data: roleMappingFormData 
        });
      } else {
        await createRoleMappingMutation.mutateAsync(roleMappingFormData);
      }
      
      setShowRoleMappingModal(false);
      setEditingRoleMapping(null);
      refetchMappings();
    } catch (err) {
      // Error already handled in mutation
    }
  };

  const handleDeleteGuild = async () => {
    if (!guildToDelete) return;
    
    try {
      await deleteGuildMutation.mutateAsync(guildToDelete.guild_id);
      setShowDeleteGuildConfirm(false);
      setGuildToDelete(null);
      refetchGuilds();
    } catch (err) {
      // Error already handled in mutation
    }
  };

  const handleDeleteRoleMapping = async () => {
    if (!roleMappingToDelete) return;
    
    try {
      await deleteRoleMappingMutation.mutateAsync(roleMappingToDelete.id);
      setShowDeleteRoleMappingConfirm(false);
      setRoleMappingToDelete(null);
      refetchMappings();
    } catch (err) {
      // Error already handled in mutation
    }
  };

  const handleSyncAction = async () => {
    if (!selectedSyncAction) return;

    try {
      switch (selectedSyncAction) {
        case 'manual_sync':
          await manualSyncMutation.mutateAsync({ 
            sync_type: 'full',
            guild_ids: selectedGuildId ? [selectedGuildId] : undefined
          });
          break;
        case 'sync_guild':
          if (selectedGuildId) {
            await manualSyncMutation.mutateAsync({ 
              sync_type: 'guild',
              guild_ids: [selectedGuildId]
            });
          }
          break;
        default:
          break;
      }
      
      setShowSyncModal(false);
      setSelectedSyncAction('');
      setSelectedGuildId('');
      refetchSync();
    } catch (err) {
      // Error already handled in mutation
    }
  };

  const handleDiscordLogin = () => {
    if (authUrl?.auth_url) {
      window.location.href = authUrl.auth_url;
    } else {
      toast.error('Discord login URL not available');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'completed':
      case 'active':
        return 'success';
      case 'running':
      case 'pending':
        return 'primary';
      case 'warning':
        return 'warning';
      case 'unhealthy':
      case 'failed':
      case 'error':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (statusError) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load Discord module status: {statusError.message}
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
            <div>
              <h1 className="mb-1">
                <FontAwesomeIcon icon={faDiscord} className="me-3 text-primary" />
                Discord Management
                {discordStatus && (
                  <Badge bg={getStatusColor(discordStatus.status)} className="ms-2">
                    {discordStatus.status}
                  </Badge>
                )}
              </h1>
              <p className="text-muted mb-0">
                Manage Discord guild configurations, role mappings, and synchronization
              </p>
            </div>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => {
                  refetchGuilds();
                  refetchMappings();
                  refetchSync();
                  refetchUsers();
                }}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Refresh All
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Overview */}
      {!statsLoading && discordStats && (
        <Row className="mb-4">
          <Col md={2}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faServer} size="2x" className="text-primary me-3" />
                  <div>
                    <h6 className="mb-0">Discord Guilds</h6>
                    <h4 className="mb-0">{discordStats.total_guilds || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-success me-3" />
                  <div>
                    <h6 className="mb-0">Active Guilds</h6>
                    <h4 className="mb-0">{discordStats.active_guilds || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCrown} size="2x" className="text-info me-3" />
                  <div>
                    <h6 className="mb-0">Role Mappings</h6>
                    <h4 className="mb-0">{discordStats.total_role_mappings || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faLink} size="2x" className="text-warning me-3" />
                  <div>
                    <h6 className="mb-0">Active Mappings</h6>
                    <h4 className="mb-0">{discordStats.active_role_mappings || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} size="2x" className="text-secondary me-3" />
                  <div>
                    <h6 className="mb-0">Discord Users</h6>
                    <h4 className="mb-0">{discordStats.total_discord_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsersCog} size="2x" className="text-success me-3" />
                  <div>
                    <h6 className="mb-0">Linked Users</h6>
                    <h4 className="mb-0">{discordStats.linked_users || 0}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="overview" title={
          <><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Overview</>
        }>
          {/* Overview Content */}
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faDiscord} className="me-2" />
                    Discord Module Status
                  </h5>
                </Card.Header>
                <Card.Body>
                  {statusLoading ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : discordStatus ? (
                    <div>
                      <Row>
                        <Col md={6}>
                          <Table borderless size="sm">
                            <tbody>
                              <tr>
                                <td><strong>Module Status:</strong></td>
                                <td>
                                  <Badge bg={getStatusColor(discordStatus.status)}>
                                    {discordStatus.status || 'Unknown'}
                                  </Badge>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Last Check:</strong></td>
                                <td>{formatDateTime(discordStatus.last_check)}</td>
                              </tr>
                              <tr>
                                <td><strong>Version:</strong></td>
                                <td>{discordStatus.version || 'N/A'}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Col>
                        <Col md={6}>
                          {discordStatus.message && (
                            <Alert variant={getStatusColor(discordStatus.status)} className="mb-0">
                              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                              {discordStatus.message}
                            </Alert>
                          )}
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    <Alert variant="warning">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                      Discord status information not available
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faLink} className="me-2" />
                    Discord Auth Debug
                  </h5>
                </Card.Header>
                <Card.Body>
                  {authLoading ? (
                    <div className="text-center py-2">
                      <Spinner animation="border" size="sm" />
                    </div>
                  ) : authError ? (
                    <Alert variant="danger" className="mb-0">
                      <strong>Auth Error:</strong><br/>
                      Status: {authError.status}<br/>
                      {authError.message}
                    </Alert>
                  ) : authStatus ? (
                    <div>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td><strong>Authenticated:</strong></td>
                            <td>
                              <Badge bg={authStatus.authenticated ? 'success' : 'danger'}>
                                {authStatus.authenticated ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Discord Linked:</strong></td>
                            <td>
                              <Badge bg={authStatus.is_linked ? 'success' : 'warning'}>
                                {authStatus.is_linked ? 'Yes' : 'No'}
                              </Badge>
                            </td>
                          </tr>
                          {authStatus.discord_user && (
                            <tr>
                              <td><strong>Discord User:</strong></td>
                              <td className="small">
                                {authStatus.discord_user.username}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                      
                      
                      {!isAuthenticated ? (
                        <Alert variant="warning" className="mb-2">
                          <small>
                            <strong>Authentication Required:</strong><br/>
                            You must be logged in with EVE Online before linking Discord.
                          </small>
                        </Alert>
                      ) : !authStatus.is_linked ? (
                        <div>
                          <Alert variant="info" className="mb-2">
                            <small>
                              <strong>Action Available:</strong><br/>
                              Link your Discord account to enable role synchronization.
                            </small>
                          </Alert>
                          <div className="d-grid">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleDiscordLogin}
                              disabled={authUrlLoading || !authUrl?.auth_url || !isAuthenticated}
                            >
                              <FontAwesomeIcon icon={faDiscord} className="me-2" />
                              {authUrlLoading ? 'Loading...' : 'Link Discord Account'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Alert variant="success" className="mb-2">
                          <small>
                            <strong>Discord Linked:</strong><br/>
                            Your Discord account is successfully linked!
                          </small>
                        </Alert>
                      )}
                      
                    </div>
                  ) : (
                    <Alert variant="warning" className="mb-0">
                      No auth status data
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="guilds" title={
          <><FontAwesomeIcon icon={faServer} className="me-2" />Discord Guilds ({filteredGuilds.length})</>
        }>
          {/* Controls */}
          <Row className="mb-3">
            <Col lg={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search guilds by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col lg={3}>
              <Form.Select
                value={filters.enabled}
                onChange={(e) => setFilters({...filters, enabled: e.target.value})}
              >
                <option value="">All Guilds</option>
                <option value="true">Enabled Only</option>
                <option value="false">Disabled Only</option>
              </Form.Select>
            </Col>
            <Col lg={3} className="text-end">
              <Button
                variant="primary"
                onClick={() => handleOpenGuildModal()}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Discord Guild
              </Button>
            </Col>
          </Row>

          {/* Guilds Table */}
          <Card>
            <Card.Body>
              {guildsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : filteredGuilds.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No Discord guilds configured
                </Alert>
              ) : (
                <Table hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Guild</th>
                      <th>Status</th>
                      <th>Settings</th>
                      <th>Health</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuilds.map((guild) => (
                      <tr key={guild.guild_id}>
                        <td className="align-middle">
                          <div>
                            <div className="fw-bold">{guild.guild_name}</div>
                            <small className="text-muted">ID: {guild.guild_id}</small>
                          </div>
                        </td>
                        <td className="align-middle">
                          <Badge bg={guild.enabled !== false ? 'success' : 'secondary'}>
                            <FontAwesomeIcon icon={guild.enabled !== false ? faCheckCircle : faTimesCircle} className="me-1" />
                            {guild.enabled !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="align-middle">
                          <div className="small">
                            {guild.settings?.auto_sync && (
                              <Badge bg="info" className="me-1">Auto Sync</Badge>
                            )}
                            {guild.settings?.sync_on_join && (
                              <Badge bg="primary" className="me-1">Sync on Join</Badge>
                            )}
                            {!guild.settings && (
                              <small className="text-muted">Default</small>
                            )}
                          </div>
                        </td>
                        <td className="align-middle">
                          <Badge bg={getStatusColor(guild.health_status)}>
                            {guild.health_status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="align-middle">
                          {formatDateTime(guild.created_at)}
                        </td>
                        <td className="align-middle">
                          <ButtonGroup size="sm">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Edit Guild</Tooltip>}>
                              <Button
                                variant="outline-primary"
                                onClick={() => handleOpenGuildModal(guild)}
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Sync Guild</Tooltip>}>
                              <Button
                                variant="outline-success"
                                onClick={() => manualSyncMutation.mutate({ 
                                  sync_type: 'guild',
                                  guild_ids: [guild.guild_id]
                                })}
                                disabled={manualSyncMutation.isPending}
                              >
                                <FontAwesomeIcon icon={faSync} size="xs" />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Delete Guild</Tooltip>}>
                              <Button
                                variant="outline-danger"
                                onClick={() => {
                                  setGuildToDelete(guild);
                                  setShowDeleteGuildConfirm(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} size="xs" />
                              </Button>
                            </OverlayTrigger>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="role-mappings" title={
          <><FontAwesomeIcon icon={faCrown} className="me-2" />Role Mappings ({filteredRoleMappings.length})</>
        }>
          {/* Controls */}
          <Row className="mb-3">
            <Col lg={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search role mappings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col lg={3}>
              <Form.Select
                value={filters.guild_id}
                onChange={(e) => setFilters({...filters, guild_id: e.target.value})}
              >
                <option value="">Select a guild</option>
                {guilds.map(guild => (
                  <option key={guild.guild_id} value={guild.guild_id}>
                    {guild.guild_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={3} className="text-end">
              <Button
                variant="primary"
                onClick={() => handleOpenRoleMappingModal()}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Add Role Mapping
              </Button>
            </Col>
          </Row>

          {/* Role Mappings Table */}
          <Card>
            <Card.Body>
              {mappingsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : filteredRoleMappings.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No role mappings configured
                </Alert>
              ) : (
                <Table hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Discord Role</th>
                      <th>Go Falcon Group</th>
                      <th>Guild</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoleMappings.map((mapping) => (
                      <tr key={mapping.id}>
                        <td className="align-middle">
                          <div>
                            <div className="fw-bold">{mapping.discord_role_name}</div>
                            <small className="text-muted">ID: {mapping.discord_role_id}</small>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div>
                            <div className="fw-bold">{mapping.group_name}</div>
                            <small className="text-muted">ID: {mapping.group_id}</small>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div>
                            <div className="fw-bold">
                              {guilds.find(g => g.guild_id === mapping.guild_id)?.guild_name || 'Unknown Guild'}
                            </div>
                            <small className="text-muted">{mapping.guild_id}</small>
                          </div>
                        </td>
                        <td className="align-middle">
                          <Badge bg={(mapping.is_active || mapping.enabled) ? 'success' : 'secondary'}>
                            <FontAwesomeIcon icon={(mapping.is_active || mapping.enabled) ? faCheckCircle : faTimesCircle} className="me-1" />
                            {(mapping.is_active || mapping.enabled) ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="align-middle">
                          <ButtonGroup size="sm">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Edit Mapping</Tooltip>}>
                              <Button
                                variant="outline-primary"
                                onClick={() => handleOpenRoleMappingModal(mapping)}
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Delete Mapping</Tooltip>}>
                              <Button
                                variant="outline-danger"
                                onClick={() => {
                                  setRoleMappingToDelete(mapping);
                                  setShowDeleteRoleMappingConfirm(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} size="xs" />
                              </Button>
                            </OverlayTrigger>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="sync" title={
          <><FontAwesomeIcon icon={faSync} className="me-2" />Synchronization</>
        }>
          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FontAwesomeIcon icon={faBolt} className="me-2" />
                      Synchronization Status
                    </h5>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSyncModal(true)}
                    >
                      <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" />
                      Manual Sync
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {syncLoading ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : syncStatus ? (
                    <div>
                      <Row className="mb-3">
                        <Col md={6}>
                          <strong>Last Full Sync:</strong><br />
                          <span className="text-muted">{formatDateTime(syncStatus.last_full_sync)}</span>
                        </Col>
                        <Col md={6}>
                          <strong>Sync in Progress:</strong><br />
                          <Badge bg={syncStatus.sync_in_progress ? 'warning' : 'success'}>
                            {syncStatus.sync_in_progress ? 'Yes' : 'No'}
                          </Badge>
                        </Col>
                      </Row>
                      
                      {syncStatus.sync_in_progress && (
                        <Alert variant="info" className="mb-3">
                          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                          Synchronization is currently in progress. This may take several minutes.
                        </Alert>
                      )}

                      <Row className="mb-3">
                        <Col md={3}>
                          <Card className="text-center">
                            <Card.Body>
                              <h4 className="text-primary">{syncStatus.total_users || 0}</h4>
                              <small>Total Users</small>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="text-center">
                            <Card.Body>
                              <h4 className="text-success">{syncStatus.synced_users || 0}</h4>
                              <small>Synced Users</small>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="text-center">
                            <Card.Body>
                              <h4 className="text-danger">{syncStatus.failed_users || 0}</h4>
                              <small>Failed Users</small>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="text-center">
                            <Card.Body>
                              <h4 className="text-info">{syncStatus.total_guilds || 0}</h4>
                              <small>Active Guilds</small>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {syncStatus.recent_errors && syncStatus.recent_errors.length > 0 && (
                        <div>
                          <h6>Recent Errors:</h6>
                          <ListGroup>
                            {syncStatus.recent_errors.slice(0, 5).map((error, index) => (
                              <ListGroup.Item key={index} variant="danger">
                                <div className="d-flex justify-content-between">
                                  <span>
                                    <strong>User:</strong> {error.user_id} | 
                                    <strong>Guild:</strong> {error.guild_id} | 
                                    <strong>Error:</strong> {error.error}
                                  </span>
                                  <small>{formatDateTime(error.occurred_at)}</small>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert variant="warning">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                      Synchronization status not available
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setSelectedSyncAction('manual_sync');
                        setShowSyncModal(true);
                      }}
                      disabled={manualSyncMutation.isPending}
                    >
                      <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" />
                      {manualSyncMutation.isPending ? 'Syncing...' : 'Full Sync All Guilds'}
                    </Button>
                    
                    <Button
                      variant="outline-info"
                      onClick={refetchSync}
                    >
                      <FontAwesomeIcon icon={faSync} className="me-2" />
                      Refresh Status
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="users" title={
          <><FontAwesomeIcon icon={faUsers} className="me-2" />Discord Users ({filteredUsers.length})</>
        }>
          {/* Controls */}
          <Row className="mb-3">
            <Col lg={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search Discord users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col lg={4} className="text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={refetchUsers}
              >
                <FontAwesomeIcon icon={faSync} className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Discord Users Table */}
          <Card>
            <Card.Body>
              {usersLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : filteredUsers.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No Discord users found
                </Alert>
              ) : (
                <Table hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Discord User</th>
                      <th>Go Falcon User</th>
                      <th>Status</th>
                      <th>Last Sync</th>
                      <th>Guilds</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.discord_id || user.discord_user_id}>
                        <td className="align-middle">
                          <div className="d-flex align-items-center">
                            <img 
                              src={user.avatar 
                                ? `https://cdn.discordapp.com/avatars/${user.discord_id || user.discord_user_id}/${user.avatar}.webp?size=32`
                                : `https://cdn.discordapp.com/embed/avatars/${(parseInt(user.discord_id || user.discord_user_id) >> 22) % 6}.png`
                              }
                              alt={user.global_name || user.username}
                              className="rounded-circle me-2"
                              width="24"
                              height="24"
                              onError={(e) => {
                                e.target.src = `https://cdn.discordapp.com/embed/avatars/0.png`;
                              }}
                            />
                            <div>
                              <div className="fw-bold">{user.global_name || user.username}</div>
                              <small className="text-muted">@{user.username}</small>
                            </div>
                          </div>
                        </td>
                        <td className="align-middle">
                          <span>{user.user_id || user.go_falcon_user_id}</span>
                        </td>
                        <td className="align-middle">
                          <Badge bg={user.is_active ? 'success' : 'secondary'}>
                            <FontAwesomeIcon icon={user.is_active ? faCheckCircle : faTimesCircle} className="me-1" />
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="align-middle">
                          <small>{formatDateTime(user.updated_at || user.last_sync)}</small>
                        </td>
                        <td className="align-middle">
                          <Badge bg="info">{user.guilds?.length || 0}</Badge>
                        </td>
                        <td className="align-middle">
                          <OverlayTrigger placement="top" overlay={<Tooltip>Sync User</Tooltip>}>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => syncUserMutation.mutate(user.user_id || user.go_falcon_user_id)}
                              disabled={syncUserMutation.isPending}
                            >
                              <FontAwesomeIcon icon={faSync} size="xs" />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Guild Configuration Modal */}
      <Modal show={showGuildModal} onHide={() => setShowGuildModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faServer} className="me-2" />
            {editingGuild ? 'Edit Discord Guild' : 'Add Discord Guild'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveGuild}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Guild ID <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={guildFormData.guild_id}
                onChange={(e) => setGuildFormData({...guildFormData, guild_id: e.target.value})}
                required
                disabled={editingGuild}
                placeholder="Discord guild ID (18-19 digits)"
              />
              <Form.Text className="text-muted">
                The Discord server ID (enable Developer Mode in Discord to copy)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Guild Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                value={guildFormData.guild_name}
                onChange={(e) => setGuildFormData({...guildFormData, guild_name: e.target.value})}
                required
                placeholder="Discord server name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bot Token <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="password"
                value={guildFormData.bot_token}
                onChange={(e) => setGuildFormData({...guildFormData, bot_token: e.target.value})}
                required
                placeholder="Discord bot token"
              />
              <Form.Text className="text-muted">
                Bot token from Discord Developer Portal. Keep this secure!
              </Form.Text>
            </Form.Group>

            {editingGuild && (
              <div className="p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Note:</strong> Advanced guild settings (auto-sync, channels, etc.) are managed through the server configuration and cannot be modified through this interface.
                </small>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowGuildModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={createGuildMutation.isPending || updateGuildMutation.isPending}
            >
              {createGuildMutation.isPending || updateGuildMutation.isPending ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {editingGuild ? 'Update Guild' : 'Create Guild'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Role Mapping Modal */}
      <Modal show={showRoleMappingModal} onHide={() => setShowRoleMappingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faCrown} className="me-2" />
            {editingRoleMapping ? 'Edit Role Mapping' : 'Add Role Mapping'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveRoleMapping}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Discord Guild <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={roleMappingFormData.guild_id}
                    onChange={(e) => setRoleMappingFormData({
                      ...roleMappingFormData, 
                      guild_id: e.target.value,
                      discord_role_id: '',
                      discord_role_name: ''
                    })}
                    required
                  >
                    <option value="">Select a guild...</option>
                    {guilds.map(guild => (
                      <option key={guild.guild_id} value={guild.guild_id}>
                        {guild.guild_name} {!guild.is_enabled && '(Disabled)'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Discord Role <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={roleMappingFormData.discord_role_id}
                    onChange={(e) => {
                      const selectedRole = guildRoles.find(role => role.id === e.target.value);
                      setRoleMappingFormData({
                        ...roleMappingFormData,
                        discord_role_id: e.target.value,
                        discord_role_name: selectedRole?.name || ''
                      });
                    }}
                    required
                    disabled={!roleMappingFormData.guild_id || rolesLoading}
                  >
                    <option value="">
                      {!roleMappingFormData.guild_id ? 'Select a guild first...' : 
                       rolesLoading ? 'Loading roles...' : 
                       'Select a role...'}
                    </option>
                    {guildRoles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Form.Select>
                  {roleMappingFormData.discord_role_id && (
                    <Form.Text className="text-muted">
                      Role ID: {roleMappingFormData.discord_role_id}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Go Falcon Group <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={roleMappingFormData.group_id}
                    onChange={(e) => {
                      setRoleMappingFormData({
                        ...roleMappingFormData, 
                        group_id: e.target.value
                      });
                    }}
                    required
                  >
                    <option value="">Select a group...</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.type})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="is_active"
                    label="Active Mapping"
                    checked={roleMappingFormData.is_active}
                    onChange={(e) => {
                      setRoleMappingFormData({
                        ...roleMappingFormData, 
                        is_active: e.target.checked
                      });
                    }}
                  />
                  <Form.Text className="text-muted">
                    When enabled, this mapping will actively sync Discord roles with Go Falcon groups
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoleMappingModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={createRoleMappingMutation.isPending || updateRoleMappingMutation.isPending}
            >
              {createRoleMappingMutation.isPending || updateRoleMappingMutation.isPending ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {editingRoleMapping ? 'Update Mapping' : 'Create Mapping'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Sync Action Modal */}
      <Modal show={showSyncModal} onHide={() => setShowSyncModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faCloudUploadAlt} className="me-2" />
            Manual Synchronization
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            This will synchronize Discord roles with Go Falcon group memberships for all configured guilds.
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Sync Type</Form.Label>
            <Form.Select
              value={selectedSyncAction}
              onChange={(e) => setSelectedSyncAction(e.target.value)}
            >
              <option value="">Select sync type...</option>
              <option value="manual_sync">Full Sync (All Guilds)</option>
              <option value="sync_guild">Guild-Specific Sync</option>
            </Form.Select>
          </Form.Group>

          {selectedSyncAction === 'sync_guild' && (
            <Form.Group className="mb-3">
              <Form.Label>Select Guild</Form.Label>
              <Form.Select
                value={selectedGuildId}
                onChange={(e) => setSelectedGuildId(e.target.value)}
              >
                <option value="">Select guild to sync...</option>
                {guilds.filter(g => g.enabled).map(guild => (
                  <option key={guild.guild_id} value={guild.guild_id}>
                    {guild.guild_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Important:</strong> Synchronization may take several minutes to complete. 
            You can monitor the progress in the Synchronization tab.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSyncModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSyncAction}
            disabled={!selectedSyncAction || manualSyncMutation.isPending}
          >
            {manualSyncMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Starting Sync...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faBolt} className="me-2" />
                Start Synchronization
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Guild Confirmation Modal */}
      <Modal show={showDeleteGuildConfirm} onHide={() => setShowDeleteGuildConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
            Delete Discord Guild
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Warning!</strong> This action cannot be undone.
          </Alert>
          {guildToDelete && (
            <p>
              Are you sure you want to remove the Discord guild <strong>{guildToDelete.guild_name}</strong>?
              This will also delete all associated role mappings.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteGuildConfirm(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteGuild}
            disabled={deleteGuildMutation.isPending}
          >
            {deleteGuildMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete Guild
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Role Mapping Confirmation Modal */}
      <Modal show={showDeleteRoleMappingConfirm} onHide={() => setShowDeleteRoleMappingConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" />
            Delete Role Mapping
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Are you sure you want to delete this role mapping? This action cannot be undone.
          </Alert>
          {roleMappingToDelete && (
            <p>
              <strong>Discord Role:</strong> {roleMappingToDelete.discord_role_name}<br/>
              <strong>Go Falcon Group:</strong> {roleMappingToDelete.group_name}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteRoleMappingConfirm(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteRoleMapping}
            disabled={deleteRoleMappingMutation.isPending}
          >
            {deleteRoleMappingMutation.isPending ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Delete Mapping
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default DiscordAdmin;
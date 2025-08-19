import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Dropdown, Alert, Modal, Form, Tab, Tabs, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserShield, faUsers, faKey, faPlus, faEdit, faTrash, faSave, 
  faSearch, faFilter, faSync, faUserPlus, faExclamationTriangle,
  faShieldAlt, faRoute, faLock, faUnlock, faSpinner, faCheck, faTimes,
  faVial
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { 
  useUsers, 
  useRoles, 
  usePolicies, 
  useUserRoles,
  useRolePolicies,
  useAssignRole, 
  useRemoveRole, 
  useBulkAssignRoles,
  useAssignPolicy,
  useRemovePolicy,
  useUpdateUser,
  useAuthStatus,
  usePermissionCheck,
  UserDTO,
  RoleDTO,
  PolicyDTO,
  CasbinDTOFactory,
  createRoleAssignment,
  createPolicy,
  COMMON_ROLES,
  CASBIN_DOMAINS,
  COMMON_RESOURCES,
  COMMON_ACTIONS
} from 'hooks/useCasbin';

// Component to display user roles using the new API endpoint
const UserRolesCell = ({ user, availableRoles, onRoleToggle }) => {
  const { data: userRolesData, isLoading: rolesLoading, error: rolesError } = useUserRoles(user.id);
  
  if (rolesLoading) {
    return <FontAwesomeIcon icon={faSpinner} spin className="text-muted" />;
  }
  
  if (rolesError) {
    return <span className="text-danger small">Error loading roles</span>;
  }
  
  const userRoles = userRolesData?.roles?.map(roleDTO => roleDTO.name) || [];
  
  return (
    <div className="d-flex flex-wrap gap-1">
      {userRoles.map(role => (
        <Badge 
          key={role}
          bg={role === 'admin' ? 'danger' : role === 'moderator' ? 'warning' : 'primary'}
          className="me-1 mb-1"
        >
          {role}
        </Badge>
      ))}
      <Dropdown>
        <Dropdown.Toggle variant="outline-primary" size="sm">
          <FontAwesomeIcon icon={faPlus} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {availableRoles.map(role => (
            <Dropdown.Item
              key={role}
              onClick={() => onRoleToggle(user.id, user.characterId, role, userRoles.includes(role))}
              className={userRoles.includes(role) ? 'text-danger' : ''}
            >
              <FontAwesomeIcon 
                icon={userRoles.includes(role) ? faTrash : faPlus} 
                className="me-2" 
              />
              {userRoles.includes(role) ? 'Remove' : 'Add'} {role}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

// Component for permission testing
const PermissionChecker = () => {
  const [permissionForm, setPermissionForm] = useState({
    character_id: '',
    resource: '',
    action: '',
    domain: 'default'
  });
  const [permissionResult, setPermissionResult] = useState(null);
  
  const permissionCheckMutation = usePermissionCheck();
  
  const handlePermissionCheck = async () => {
    if (!permissionForm.character_id || !permissionForm.resource || !permissionForm.action) {
      toast.warning('Please fill in all required fields');
      return;
    }
    
    try {
      const result = await permissionCheckMutation.mutateAsync({
        character_id: parseInt(permissionForm.character_id),
        resource: permissionForm.resource,
        action: permissionForm.action,
        domain: permissionForm.domain
      });
      setPermissionResult(result);
    } catch (error) {
      setPermissionResult({ allowed: false, error: error.message });
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>
        <h6 className="mb-0">
          <FontAwesomeIcon icon={faVial} className="me-2" />
          Permission Checker
        </h6>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Character ID</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 12345678"
                  value={permissionForm.character_id}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, character_id: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Resource</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., admin_panel, users"
                  value={permissionForm.resource}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, resource: e.target.value }))}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Action</Form.Label>
                <Form.Select
                  value={permissionForm.action}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, action: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option value="read">read</option>
                  <option value="write">write</option>
                  <option value="delete">delete</option>
                  <option value="admin">admin</option>
                  <option value="*">* (all)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Domain</Form.Label>
                <Form.Select
                  value={permissionForm.domain}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, domain: e.target.value }))}
                >
                  <option value="default">default</option>
                  <option value="global">global</option>
                  <option value="admin">admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>&nbsp;</Form.Label>
                <div>
                  <Button 
                    variant="primary" 
                    onClick={handlePermissionCheck}
                    disabled={permissionCheckMutation.isPending}
                    className="w-100"
                  >
                    {permissionCheckMutation.isPending ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faVial} />
                    )}
                    {permissionCheckMutation.isPending ? ' Checking...' : ' Check'}
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
        
        {permissionResult && (
          <Alert 
            variant={permissionResult.allowed ? 'success' : 'danger'}
            className="mb-0"
          >
            <div className="d-flex align-items-center">
              <FontAwesomeIcon 
                icon={permissionResult.allowed ? faCheck : faTimes} 
                className="me-2" 
                size="lg"
              />
              <div>
                <strong>
                  {permissionResult.allowed ? 'Permission Granted' : 'Permission Denied'}
                </strong>
                <div className="small mt-1">
                  Character {permissionForm.character_id} 
                  {permissionResult.allowed ? ' has ' : ' does not have '}
                  permission to {permissionForm.action} on {permissionForm.resource}
                  {permissionForm.domain !== 'default' && ` in domain ${permissionForm.domain}`}
                </div>
                {permissionResult.error && (
                  <div className="small text-danger mt-1">
                    Error: {permissionResult.error}
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

// Component to display role policies using the new API endpoint
const RolePoliciesDisplay = ({ roleName }) => {
  const { data: rolePoliciesData, isLoading: policiesLoading, error: policiesError } = useRolePolicies(roleName);
  
  if (policiesLoading) {
    return (
      <div className="d-flex align-items-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-muted me-2" />
        <small className="text-muted">Loading policies...</small>
      </div>
    );
  }
  
  if (policiesError) {
    return <small className="text-danger">Error loading policies</small>;
  }
  
  const rolePolicies = rolePoliciesData?.policies || [];
  const policyDisplays = rolePolicies.map(policyDTO => {
    const policy = policyDTO.toDisplayFormat();
    return `${policy.resource}:${policy.action}`;
  });
  
  return (
    <div>
      <small className="text-muted d-block mb-1">
        Policies ({rolePolicies.length}):
      </small>
      {policyDisplays.length > 0 ? (
        <>
          {policyDisplays.slice(0, 5).map((perm, index) => (
            <Badge key={index} bg="secondary" className="me-1 mb-1 small">
              {perm}
            </Badge>
          ))}
          {policyDisplays.length > 5 && (
            <Badge bg="light" text="dark" className="small">
              +{policyDisplays.length - 5} more
            </Badge>
          )}
        </>
      ) : (
        <Badge bg="light" text="muted" className="small">
          No policies assigned
        </Badge>
      )}
    </div>
  );
};

const CasbinAdmin = () => {
  // API Query Hooks - Using proper OpenAPI query parameters
  const [userFilters, setUserFilters] = useState({
    query: '', // Changed from 'search' to 'query' per OpenAPI spec
    page: 1,
    page_size: 20
    // Other filters are added dynamically when user selects them
  });

  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers(userFilters);
  const { data: rolesData, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles();
  const { data: policiesData, isLoading: policiesLoading, error: policiesError, refetch: refetchPolicies } = usePolicies();
  
  // Also fetch auth status to ensure we have current permissions
  const { data: authStatusData, isLoading: authStatusLoading, error: authStatusError } = useAuthStatus();

  // Mutation hooks
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();
  const bulkAssignRolesMutation = useBulkAssignRoles();
  const assignPolicyMutation = useAssignPolicy();
  const removePolicyMutation = useRemovePolicy();
  const updateUserMutation = useUpdateUser();

  // Transform API data
  const users = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.map(user => user.toDisplayFormat());
  }, [usersData]);

  // Extract available roles from /admin/roles endpoint
  const availableRoles = useMemo(() => {
    if (!rolesData?.roles) return Object.values(COMMON_ROLES); // Fallback to hardcoded roles
    // Extract unique role names from the API response
    const uniqueRoles = [...new Set(rolesData.roles.map(roleDTO => roleDTO.name))];
    return uniqueRoles.length > 0 ? uniqueRoles : Object.values(COMMON_ROLES);
  }, [rolesData]);

  const roles = useMemo(() => {
    if (!rolesData?.roles) return [];
    const roleMap = {};
    rolesData.roles.forEach(roleDTO => {
      const roleDisplay = roleDTO.toDisplayFormat();
      if (!roleMap[roleDisplay.name]) {
        roleMap[roleDisplay.name] = {
          name: roleDisplay.name,
          domain: roleDisplay.domain,
          users: 1,
          permissions: [] // Will be populated from policies
        };
      } else {
        roleMap[roleDisplay.name].users++;
      }
    });
    return Object.values(roleMap);
  }, [rolesData]);

  const policies = useMemo(() => {
    if (!policiesData?.policies) return [];
    return policiesData.policies.map(policy => policy.toDisplayFormat());
  }, [policiesData]);

  // Extract routes from policies
  const routes = useMemo(() => {
    const routeMap = {};
    policies.forEach(policy => {
      if (policy.resource.startsWith('route:')) {
        const [, path, method] = policy.resource.split(':');
        const routeKey = `${path}:${method}`;
        
        if (!routeMap[routeKey]) {
          routeMap[routeKey] = {
            path,
            method,
            roles: [],
            protected: true
          };
        }
        
        if (policy.subject === '*') {
          routeMap[routeKey].protected = false;
          routeMap[routeKey].roles = ['*'];
        } else {
          routeMap[routeKey].roles.push(policy.subject);
        }
      }
    });
    return Object.values(routeMap);
  }, [policies]);

  // Loading and error states
  const isLoading = usersLoading || rolesLoading || policiesLoading;
  const hasError = usersError || rolesError || policiesError;

  // Component state
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showPermissionTester, setShowPermissionTester] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);

  // Form states
  const [userForm, setUserForm] = useState({ characterName: '', characterId: '', roles: [] });
  const [roleForm, setRoleForm] = useState({ name: '', permissions: [] });
  const [routeForm, setRouteForm] = useState({ path: '', method: 'GET', roles: [], protected: true });
  const [bulkRoleForm, setBulkRoleForm] = useState({ role: '', domain: 'global', action: 'assign' });

  // Filter functions (must be before early returns due to React hooks rules)
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.characterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.characterId.toString().includes(searchTerm);
      const matchesRole = !filterRole || (u.roles && u.roles.includes(filterRole));
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // Legacy function - kept for backward compatibility with user modal
  const getUserRoles = (characterId) => {
    // This function is now primarily used in the user editing modal
    // The main table uses UserRolesCell component with useUserRoles hook
    if (!rolesData?.roles) return [];
    return rolesData.roles
      .filter(roleDTO => roleDTO.characterId === characterId)
      .map(roleDTO => roleDTO.name);
  };

  // Get user policies/permissions from API data
  const getUserPolicies = (characterId) => {
    if (!policiesData?.policies) return [];
    return policiesData.policies
      .filter(policyDTO => policyDTO.appliesToUser(characterId))
      .map(policyDTO => policyDTO.toDisplayFormat());
  };

  const availablePermissions = [
    `${COMMON_RESOURCES.ADMIN_PANEL}:${COMMON_ACTIONS.ALL}`,
    `${COMMON_RESOURCES.USERS}:${COMMON_ACTIONS.READ}`,
    `${COMMON_RESOURCES.USERS}:${COMMON_ACTIONS.WRITE}`,
    `${COMMON_RESOURCES.USERS}:${COMMON_ACTIONS.DELETE}`,
    `${COMMON_RESOURCES.ROLES}:${COMMON_ACTIONS.READ}`,
    `${COMMON_RESOURCES.ROLES}:${COMMON_ACTIONS.WRITE}`,
    `${COMMON_RESOURCES.ROLES}:${COMMON_ACTIONS.DELETE}`,
    `${COMMON_RESOURCES.POLICIES}:${COMMON_ACTIONS.READ}`,
    `${COMMON_RESOURCES.POLICIES}:${COMMON_ACTIONS.WRITE}`,
    `${COMMON_RESOURCES.POLICIES}:${COMMON_ACTIONS.DELETE}`,
    `${COMMON_RESOURCES.DASHBOARD}:${COMMON_ACTIONS.READ}`,
    'moderate:chat',
    'moderate:forum'
  ];

  // Check for permission errors (following scheduler pattern)
  const hasPermissionError = usersError?.status === 403 || rolesError?.status === 403 || policiesError?.status === 403;
  const hasOtherError = (usersError && usersError?.status !== 403) || (rolesError && rolesError?.status !== 403) || (policiesError && policiesError?.status !== 403);
  
  if (hasPermissionError) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Casbin Administration</h1>
          </Col>
        </Row>
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Access Denied</strong>
          <div className="mt-2">
            You need <code>admin</code> or <code>super_admin</code> role to access the Casbin administration panel.
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
            <h1>Casbin Administration</h1>
          </Col>
        </Row>
        <Alert variant="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Connection Error</strong>
          <div className="mt-2">
            Unable to connect to backend service: {usersError?.message || rolesError?.message || policiesError?.message}
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

  // Updated role assignment handler for new API structure
  const handleRoleToggle = async (userId, characterId, roleName, isRemoving) => {
    try {
      if (isRemoving) {
        await removeRoleMutation.mutateAsync({
          user_id: userId,
          role: roleName,
          domain: 'global'
        });
      } else {
        const roleAssignment = CasbinDTOFactory.createRoleAssignmentRequest(
          userId, 
          roleName, 
          'global', 
          characterId
        );
        await assignRoleMutation.mutateAsync(roleAssignment);
      }
    } catch (error) {
      // Error is handled by the mutation hook
      console.error(`Failed to ${isRemoving ? 'remove' : 'assign'} role:`, error);
    }
  };

  // Bulk operations handlers
  const handleUserSelection = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkRoleAssignment = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }
    
    if (!bulkRoleForm.role) {
      toast.warning('Please select a role');
      return;
    }

    try {
      const bulkRequest = {
        user_ids: selectedUsers,
        role: bulkRoleForm.role,
        domain: bulkRoleForm.domain
      };

      const result = await bulkAssignRolesMutation.mutateAsync(bulkRequest);
      setSelectedUsers([]);
      setShowBulkRoleModal(false);
      setBulkRoleForm({ role: '', domain: 'global', action: 'assign' });
      // Toast is already handled by the mutation hook
    } catch (error) {
      console.error('Bulk role assignment failed:', error);
      // Error toast is already handled by the mutation hook
    }
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        await updateUserMutation.mutateAsync({
          characterId: editingUser.characterId,
          userData: {
            character_name: userForm.characterName,
            enabled: true,
            notes: userForm.notes || ''
          }
        });
        
        // Handle role assignments separately
        const currentRoles = getUserRoles(editingUser.characterId);
        const newRoles = userForm.roles;
        
        // Remove roles that are no longer assigned
        const rolesToRemove = currentRoles.filter(role => !newRoles.includes(role));
        const rolesToAdd = newRoles.filter(role => !currentRoles.includes(role));
        
        for (const role of rolesToRemove) {
          await removeRoleMutation.mutateAsync({
            user_id: editingUser.id, // Use user_id instead of character_id
            role,
            domain: CASBIN_DOMAINS.DEFAULT
          });
        }
        
        for (const role of rolesToAdd) {
          await assignRoleMutation.mutateAsync(
            createRoleAssignment(editingUser.id, role, CASBIN_DOMAINS.DEFAULT, editingUser.characterId)
          );
        }
        
      } catch (error) {
        console.error('Failed to save user:', error);
        return; // Don't close modal on error
      }
    } else {
      toast.error('Creating new users is not supported. Users must be authenticated through EVE Online SSO first.');
      return;
    }
    
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ characterName: '', characterId: '', roles: [], notes: '' });
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        // Update role by managing its policies
        const currentPolicies = policies.filter(p => p.subject === editingRole.name);
        const newPolicies = roleForm.permissions.map(permission => {
          const [resource, action] = permission.split(':');
          return createPolicy(editingRole.name, resource || permission, action || '*');
        });
        
        // Remove old policies for this role
        for (const policy of currentPolicies) {
          await removePolicyMutation.mutateAsync({
            subject: policy.subject,
            resource: policy.resource,
            action: policy.action,
            domain: policy.domain
          });
        }
        
        // Add new policies for this role
        for (const policy of newPolicies) {
          await assignPolicyMutation.mutateAsync(policy);
        }
        
      } else {
        // Create new role by assigning policies
        for (const permission of roleForm.permissions) {
          const [resource, action] = permission.split(':');
          const policy = createPolicy(roleForm.name, resource || permission, action || '*');
          await assignPolicyMutation.mutateAsync(policy);
        }
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      return; // Don't close modal on error
    }
    
    setShowRoleModal(false);
    setEditingRole(null);
    setRoleForm({ name: '', permissions: [] });
  };

  const handleSaveRoute = async () => {
    // Note: Route management through Casbin policies
    // Routes are managed as policies where the resource is the route path
    try {
      const routeResource = `route:${routeForm.path}:${routeForm.method}`;
      
      if (editingRoute) {
        // Remove existing route policies
        const existingRoutePolicies = policies.filter(p => 
          p.resource === `route:${editingRoute.path}:${editingRoute.method}`
        );
        
        for (const policy of existingRoutePolicies) {
          await removePolicyMutation.mutateAsync({
            subject: policy.subject,
            resource: policy.resource,
            action: policy.action,
            domain: policy.domain
          });
        }
      }
      
      // Add new route policies for each role
      if (routeForm.protected) {
        for (const role of routeForm.roles) {
          const policy = createPolicy(role, routeResource, 'access');
          await assignPolicyMutation.mutateAsync(policy);
        }
      } else {
        // Public route - allow all
        const policy = createPolicy('*', routeResource, 'access');
        await assignPolicyMutation.mutateAsync(policy);
      }
      
    } catch (error) {
      console.error('Failed to save route:', error);
      return;
    }
    
    setShowRouteModal(false);
    setEditingRoute(null);
    setRouteForm({ path: '', method: 'GET', roles: [], protected: true });
  };

  const handleDeleteUser = async (characterId) => {
    if (window.confirm('Are you sure you want to disable this user? Users cannot be deleted, only disabled.')) {
      try {
        await updateUserMutation.mutateAsync({
          characterId: characterId,
          userData: {
            enabled: false,
            notes: 'User disabled by admin'
          }
        });
      } catch (error) {
        console.error('Failed to disable user:', error);
      }
    }
  };

  const handleDeleteRole = async (roleName) => {
    if (['admin', 'user'].includes(roleName)) {
      toast.error('Cannot delete system roles (admin, user)');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this role? This will remove the role from all users.')) {
      try {
        // Remove all role assignments - need to find user_id for each character_id
        const roleAssignments = rolesData?.roles?.filter(r => r.role === roleName) || [];
        for (const assignment of roleAssignments) {
          // Find the user_id for this character_id
          const user = users.find(u => u.characterId === assignment.character_id);
          if (user) {
            await removeRoleMutation.mutateAsync({
              user_id: user.id, // Use user_id as required by the API
              role: roleName,
              domain: assignment.domain || CASBIN_DOMAINS.DEFAULT
            });
          }
        }
        
        // Remove all policies for this role
        const rolePolicies = policies.filter(p => p.subject === roleName);
        for (const policy of rolePolicies) {
          await removePolicyMutation.mutateAsync({
            subject: policy.subject,
            resource: policy.resource,
            action: policy.action,
            domain: policy.domain
          });
        }
        
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    }
  };

  const handleDeleteRoute = async (path, method) => {
    if (window.confirm('Are you sure you want to delete this route access control?')) {
      try {
        const routeResource = `route:${path}:${method}`;
        const routePolicies = policies.filter(p => p.resource === routeResource);
        
        for (const policy of routePolicies) {
          await removePolicyMutation.mutateAsync({
            subject: policy.subject,
            resource: policy.resource,
            action: policy.action,
            domain: policy.domain
          });
        }
        
      } catch (error) {
        console.error('Failed to delete route:', error);
      }
    }
  };

  const openUserModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      const userRoles = getUserRoles(user.characterId);
      setUserForm({
        characterName: user.characterName,
        characterId: user.characterId,
        roles: userRoles,
        notes: user.notes || ''
      });
    } else {
      setUserForm({ characterName: '', characterId: '', roles: [], notes: '' });
    }
    setShowUserModal(true);
  };

  const openRoleModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      // Get permissions for this role from policies
      const rolePermissions = policies
        .filter(p => p.subject === role.name)
        .map(p => `${p.resource}:${p.action}`);
      
      setRoleForm({
        name: role.name,
        permissions: rolePermissions
      });
    } else {
      setRoleForm({ name: '', permissions: [] });
    }
    setShowRoleModal(true);
  };

  const openRouteModal = (route = null) => {
    setEditingRoute(route);
    if (route) {
      // Extract route data from policies
      const routeResource = `route:${route.path}:${route.method}`;
      const routePolicies = policies.filter(p => p.resource === routeResource);
      const roles = routePolicies.map(p => p.subject);
      const isProtected = !roles.includes('*');
      
      setRouteForm({
        path: route.path,
        method: route.method,
        roles: roles.filter(r => r !== '*'),
        protected: isProtected
      });
    } else {
      setRouteForm({ path: '', method: 'GET', roles: [], protected: true });
    }
    setShowRouteModal(true);
  };

  // Handle search term changes with API integration
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setUserFilters(prev => ({
      ...prev,
      query: newSearchTerm, // Updated to use 'query' parameter
      page: 1 // Reset to first page when searching
    }));
  };

  const handleRefresh = () => {
    refetchUsers();
    refetchRoles(); 
    refetchPolicies();
  };


  // Show error if API calls fail
  if (hasError) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Casbin Administration</h1>
          </Col>
        </Row>
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>API Error</strong>
          <div className="mt-2">
            Failed to load data from the server. Please check your connection and try again.
          </div>
          <div className="mt-2">
            <Button variant="outline-danger" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSync} className="me-2" />
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1>Casbin Administration</h1>
          </Col>
        </Row>
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary" />
          <div className="mt-3">Loading Casbin data...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
              Casbin Administration
            </h1>
            <div>
              <Button 
                variant="info" 
                className="me-2"
                onClick={() => setShowPermissionTester(!showPermissionTester)}
              >
                <FontAwesomeIcon icon={faVial} className="me-2" />
                {showPermissionTester ? 'Hide' : 'Show'} Permission Tester
              </Button>
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={isLoading ? faSpinner : faSync} className="me-2" spin={isLoading} />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Permission Tester - Toggle visibility */}
      {showPermissionTester && (
        <PermissionChecker />
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="users" title={
          <span>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Users ({users.length})
          </span>
        }>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  User Management
                  {selectedUsers.length > 0 && (
                    <Badge bg="primary" className="ms-2">
                      {selectedUsers.length} selected
                    </Badge>
                  )}
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  {selectedUsers.length > 0 && (
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={() => setShowBulkRoleModal(true)}
                    >
                      <FontAwesomeIcon icon={faUserShield} className="me-2" />
                      Bulk Assign Role
                    </Button>
                  )}
                  <Form.Control
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{ width: '200px' }}
                  />
                  <Form.Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{ width: '120px' }}
                  >
                    <option value="">All Roles</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </Form.Select>
                  <Form.Select
                    value={userFilters.hasOwnProperty('enabled') && userFilters.enabled !== undefined ? userFilters.enabled.toString() : ''}
                    onChange={(e) => {
                      const newFilters = { ...userFilters, page: 1 };
                      if (e.target.value === '') {
                        // Remove the enabled filter entirely
                        delete newFilters.enabled;
                      } else {
                        // Set to proper boolean value
                        newFilters.enabled = e.target.value === 'true';
                      }
                      setUserFilters(newFilters);
                    }}
                    style={{ width: '100px' }}
                  >
                    <option value="">All Status</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </Form.Select>
                  <Form.Select
                    value={userFilters.hasOwnProperty('banned') && userFilters.banned !== undefined ? userFilters.banned.toString() : ''}
                    onChange={(e) => {
                      const newFilters = { ...userFilters, page: 1 };
                      if (e.target.value === '') {
                        // Remove the banned filter entirely
                        delete newFilters.banned;
                      } else {
                        // Set to proper boolean value
                        newFilters.banned = e.target.value === 'true';
                      }
                      setUserFilters(newFilters);
                    }}
                    style={{ width: '100px' }}
                  >
                    <option value="">All Banned</option>
                    <option value="false">Not Banned</option>
                    <option value="true">Banned</option>
                  </Form.Select>
                  <Form.Select
                    value={userFilters.sort_by || ''}
                    onChange={(e) => {
                      const newFilters = { ...userFilters };
                      if (e.target.value) {
                        newFilters.sort_by = e.target.value;
                        newFilters.sort_order = 'asc';
                      } else {
                        delete newFilters.sort_by;
                        delete newFilters.sort_order;
                      }
                      setUserFilters(newFilters);
                    }}
                    style={{ width: '120px' }}
                  >
                    <option value="">Sort By</option>
                    <option value="character_name">Name</option>
                    <option value="created_at">Created</option>
                    <option value="last_login">Last Login</option>
                    <option value="position">Position</option>
                  </Form.Select>
                  {userFilters.sort_by && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setUserFilters(prev => ({
                          ...prev,
                          sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc'
                        }));
                      }}
                      style={{ width: '60px' }}
                    >
                      {userFilters.sort_order === 'desc' ? '↓' : '↑'}
                    </Button>
                  )}
                  <Button variant="primary" onClick={() => openUserModal()}>
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAllUsers}
                      />
                    </th>
                    <th>Character</th>
                    <th>Character ID</th>
                    <th>Roles</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        />
                      </td>
                      <td>
                        <strong>{user.characterName}</strong>
                      </td>
                      <td>
                        <code>{user.characterId}</code>
                      </td>
                      <td>
                        <UserRolesCell 
                          user={user}
                          availableRoles={availableRoles}
                          onRoleToggle={handleRoleToggle}
                        />
                      </td>
                      <td>
                        {(() => {
                          const userPolicies = getUserPolicies(user.characterId);
                          return (
                            <div className="small text-muted">
                              {userPolicies.slice(0, 3).map((policy, index) => (
                                <div key={index}>• {policy.resource}:{policy.action}</div>
                              ))}
                              {userPolicies.length > 3 && (
                                <div>... +{userPolicies.length - 3} more</div>
                              )}
                              {userPolicies.length === 0 && (
                                <div className="text-muted">No direct permissions</div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => openUserModal(user)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteUser(user.characterId)}
                            disabled={false} // Disabled logic removed since we removed auth store access
                            title="Disable user"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
            {usersData && usersData.totalPages > 1 && (
              <Card.Footer>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    Showing {((usersData.page - 1) * usersData.pageSize) + 1} to{' '}
                    {Math.min(usersData.page * usersData.pageSize, usersData.total)} of{' '}
                    {usersData.total} users
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={usersData.page <= 1}
                      onClick={() => setUserFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    />
                    {Array.from({ length: Math.min(5, usersData.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, usersData.page - 2) + i;
                      if (pageNum > usersData.totalPages) return null;
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === usersData.page}
                          onClick={() => setUserFilters(prev => ({ ...prev, page: pageNum }))}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    <Pagination.Next
                      disabled={usersData.page >= usersData.totalPages}
                      onClick={() => setUserFilters(prev => ({ ...prev, page: Math.min(usersData.totalPages, prev.page + 1) }))}
                    />
                  </Pagination>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Tab>

        <Tab eventKey="roles" title={
          <span>
            <FontAwesomeIcon icon={faUserShield} className="me-2" />
            Roles ({roles.length})
          </span>
        }>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Role Management</h5>
                <Button variant="primary" onClick={() => openRoleModal()}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Create Role
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                {roles.map(role => (
                  <Col md={6} lg={4} key={role.name} className="mb-3">
                    <Card className="h-100">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <Badge 
                          bg={role.name === 'admin' ? 'danger' : role.name === 'moderator' ? 'warning' : 'primary'}
                          className="fs-6"
                        >
                          {role.name}
                        </Badge>
                        <div>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-1"
                            onClick={() => openRoleModal(role)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteRole(role.name)}
                            disabled={role.name === 'admin' || role.name === 'user'}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-2">
                          <small className="text-muted">Users: {role.users}</small>
                        </div>
                        <RolePoliciesDisplay roleName={role.name} />
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="routes" title={
          <span>
            <FontAwesomeIcon icon={faRoute} className="me-2" />
            Routes ({routes.length})
          </span>
        }>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Route Access Control</h5>
                <Button variant="primary" onClick={() => openRouteModal()}>
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Add Route
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Allowed Roles</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={`${route.path}-${route.method}`}>
                      <td>
                        <code>{route.path}</code>
                      </td>
                      <td>
                        <Badge bg={
                          route.method === 'GET' ? 'success' :
                          route.method === 'POST' ? 'primary' :
                          route.method === 'PUT' ? 'warning' :
                          route.method === 'DELETE' ? 'danger' : 'secondary'
                        }>
                          {route.method}
                        </Badge>
                      </td>
                      <td>
                        <FontAwesomeIcon 
                          icon={route.protected ? faLock : faUnlock} 
                          className={route.protected ? 'text-danger' : 'text-success'}
                        />
                        <span className="ms-1">
                          {route.protected ? 'Protected' : 'Public'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {route.roles.map(role => (
                            <Badge 
                              key={role}
                              bg={role === '*' ? 'success' : 
                                  role === 'admin' ? 'danger' : 
                                  role === 'moderator' ? 'warning' : 'primary'}
                              className="small"
                            >
                              {role === '*' ? 'Public' : role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => openRouteModal(route)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteRoute(route.path, route.method)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editingUser && (
            <Alert variant="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Note:</strong> Users cannot be created manually. Users must authenticate through EVE Online SSO first.
            </Alert>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Character Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={userForm.characterName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, characterName: e.target.value }))}
                    placeholder="Enter character name"
                    disabled={!editingUser}
                  />
                  {!editingUser && (
                    <Form.Text className="text-muted">
                      Character names are automatically populated when users log in via EVE SSO.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Character ID</Form.Label>
                  <Form.Control
                    type="number"
                    value={userForm.characterId}
                    onChange={(e) => setUserForm(prev => ({ ...prev, characterId: e.target.value }))}
                    placeholder="Enter character ID"
                    disabled={true}
                  />
                  <Form.Text className="text-muted">
                    Character ID cannot be changed.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={userForm.notes || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this user..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Roles</Form.Label>
              <div className="border rounded p-3">
                {availableRoles.map(role => (
                  <Form.Check
                    key={role}
                    type="checkbox"
                    id={`role-${role}`}
                    label={role}
                    checked={userForm.roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUserForm(prev => ({ ...prev, roles: [...prev.roles, role] }));
                      } else {
                        setUserForm(prev => ({ ...prev, roles: prev.roles.filter(r => r !== role) }));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveUser}
            disabled={!editingUser || updateUserMutation.isPending}
          >
            <FontAwesomeIcon 
              icon={updateUserMutation.isPending ? faSpinner : faSave} 
              className="me-2" 
              spin={updateUserMutation.isPending}
            />
            {updateUserMutation.isPending ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
          </Button>
          {!editingUser && (
            <div className="w-100">
              <small className="text-muted">
                Users are automatically created when they log in through EVE Online SSO. Only existing users can be edited.
              </small>
            </div>
          )}
        </Modal.Footer>
      </Modal>

      {/* Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                value={roleForm.name}
                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
                disabled={!!editingRole}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Permissions</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {availablePermissions.map(permission => (
                  <Form.Check
                    key={permission}
                    type="checkbox"
                    id={`perm-${permission}`}
                    label={permission}
                    checked={roleForm.permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRoleForm(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
                      } else {
                        setRoleForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveRole}
            disabled={assignPolicyMutation.isPending || removePolicyMutation.isPending}
          >
            <FontAwesomeIcon 
              icon={(assignPolicyMutation.isPending || removePolicyMutation.isPending) ? faSpinner : faSave} 
              className="me-2" 
              spin={assignPolicyMutation.isPending || removePolicyMutation.isPending}
            />
            {(assignPolicyMutation.isPending || removePolicyMutation.isPending) ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Route Modal */}
      <Modal show={showRouteModal} onHide={() => setShowRouteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRoute ? 'Edit Route' : 'Add New Route'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Path</Form.Label>
                  <Form.Control
                    type="text"
                    value={routeForm.path}
                    onChange={(e) => setRouteForm(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="/api/example or /admin/*"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Method</Form.Label>
                  <Form.Select
                    value={routeForm.method}
                    onChange={(e) => setRouteForm(prev => ({ ...prev, method: e.target.value }))}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Protected Route"
                checked={routeForm.protected}
                onChange={(e) => setRouteForm(prev => ({ ...prev, protected: e.target.checked }))}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Allowed Roles</Form.Label>
              <div className="border rounded p-3">
                <Form.Check
                  type="checkbox"
                  id="role-public"
                  label="Public (no authentication required)"
                  checked={routeForm.roles.includes('*')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRouteForm(prev => ({ ...prev, roles: ['*'] }));
                    } else {
                      setRouteForm(prev => ({ ...prev, roles: prev.roles.filter(r => r !== '*') }));
                    }
                  }}
                />
                <hr />
                {availableRoles.map(role => (
                  <Form.Check
                    key={role}
                    type="checkbox"
                    id={`route-role-${role}`}
                    label={role}
                    checked={routeForm.roles.includes(role)}
                    disabled={routeForm.roles.includes('*')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRouteForm(prev => ({ 
                          ...prev, 
                          roles: [...prev.roles.filter(r => r !== '*'), role] 
                        }));
                      } else {
                        setRouteForm(prev => ({ 
                          ...prev, 
                          roles: prev.roles.filter(r => r !== role) 
                        }));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRouteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveRoute}>
            <FontAwesomeIcon icon={faSave} className="me-2" />
            {editingRoute ? 'Update' : 'Add'} Route
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Role Assignment Modal */}
      <Modal show={showBulkRoleModal} onHide={() => setShowBulkRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bulk Role Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Selected Users: {selectedUsers.length}</strong>
            <div className="text-muted small">
              This will assign the selected role to all {selectedUsers.length} selected users.
            </div>
          </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role to Assign</Form.Label>
              <Form.Select
                value={bulkRoleForm.role}
                onChange={(e) => setBulkRoleForm(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="">Select a role...</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Domain</Form.Label>
              <Form.Select
                value={bulkRoleForm.domain}
                onChange={(e) => setBulkRoleForm(prev => ({ ...prev, domain: e.target.value }))}
              >
                <option value="global">Global</option>
                <option value="default">Default</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Most roles should use 'Global' domain
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowBulkRoleModal(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBulkRoleAssignment}
            disabled={!bulkRoleForm.role || bulkAssignRolesMutation.isPending}
          >
            <FontAwesomeIcon 
              icon={bulkAssignRolesMutation.isPending ? faSpinner : faUserShield} 
              className="me-2" 
              spin={bulkAssignRolesMutation.isPending}
            />
            {bulkAssignRolesMutation.isPending ? 'Assigning...' : `Assign to ${selectedUsers.length} Users`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CasbinAdmin;
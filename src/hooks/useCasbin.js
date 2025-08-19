import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  CasbinDTOFactory, 
  UserDTO, 
  RoleDTO, 
  PolicyDTO, 
  AuthStatusDTO,
  isUserResponse,
  isRoleInfo, 
  isPolicyInfo,
  isAuthStatusResponse 
} from 'types/casbin.dto';

// Base API configuration following the OpenAPI spec
const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Helper function for making authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // Cookie-based authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
};

// User Management Hooks
export const useUsers = (filters = {}) => {
  // Build query parameters manually to ensure proper handling
  const queryParts = [];
  
  // Only add parameters that have actual values to avoid validation errors
  if (filters.search || filters.query) {
    queryParts.push(`query=${encodeURIComponent(filters.search || filters.query)}`);
  }
  if (typeof filters.enabled === 'boolean') {
    queryParts.push(`enabled=${filters.enabled}`);
  }
  if (typeof filters.banned === 'boolean') {
    queryParts.push(`banned=${filters.banned}`);
  }
  if (typeof filters.invalid === 'boolean') {
    queryParts.push(`invalid=${filters.invalid}`);
  }
  if (filters.position !== undefined && filters.position !== null && filters.position !== '') {
    queryParts.push(`position=${encodeURIComponent(filters.position)}`);
  }
  if (filters.page && filters.page > 0) {
    queryParts.push(`page=${filters.page}`);
  }
  if (filters.page_size && filters.page_size > 0) {
    queryParts.push(`page_size=${filters.page_size}`);
  }
  if (filters.sort_by) {
    queryParts.push(`sort_by=${encodeURIComponent(filters.sort_by)}`);
  }
  if (filters.sort_order) {
    queryParts.push(`sort_order=${encodeURIComponent(filters.sort_order)}`);
  }
  
  const queryString = queryParts.join('&');
  const endpoint = `/users/users${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const response = await apiCall(endpoint);
      return CasbinDTOFactory.createUsers(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export const useUser = (characterId) => {
  return useQuery({
    queryKey: ['users', characterId],
    queryFn: async () => {
      const response = await apiCall(`/users/users/${characterId}`);
      return CasbinDTOFactory.createUser(response);
    },
    enabled: !!characterId,
    staleTime: 5 * 60 * 1000
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ characterId, userData }) => {
      console.log(`Making PUT request to: /users/${characterId}`);
      console.log('Request body:', JSON.stringify(userData, null, 2));
      return apiCall(`/users/${characterId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },
    onSuccess: (data, { characterId }) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', characterId], data);
      toast.success(data?.message || 'User updated successfully');
    },
    onError: (error) => {
      console.error('User update error:', error);
      console.error('Error status:', error.status);
      console.error('Error data:', error.data);
      toast.error(error?.data?.message || `Failed to update user: ${error.message}`);
    }
  });
};

// Role Management Hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiCall('/admin/roles');
      return CasbinDTOFactory.createRoles(response);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - roles don't change often
    refetchOnWindowFocus: false
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roleAssignment) => 
      apiCall('/admin/roles/assign', {
        method: 'POST',
        body: JSON.stringify(roleAssignment)
      }),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success(data?.message || 'Role assigned successfully');
    },
    onError: (error) => {
      toast.error(error?.data?.message || `Failed to assign role: ${error.message}`);
    }
  });
};

export const useBulkAssignRoles = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bulkAssignment) => 
      apiCall('/admin/roles/bulk-assign', {
        method: 'POST',
        body: JSON.stringify(bulkAssignment)
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      
      // Show overall success message or fallback
      const successCount = data?.successful_assignments || 0;
      const totalRequested = (data?.results?.length || 0);
      const successMessage = data?.message || `Bulk role assignment completed: ${successCount}/${totalRequested} successful`;
      toast.success(successMessage);
      
      // Show warning for failed assignments
      if (data?.failed_assignments && data.failed_assignments.length > 0) {
        const failedCount = data.failed_assignments.length;
        toast.warn(`${failedCount} assignment${failedCount !== 1 ? 's' : ''} failed`);
      }
    },
    onError: (error) => {
      toast.error(error?.data?.message || `Bulk role assignment failed: ${error.message}`);
    }
  });
};

export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (roleRemoval) => 
      apiCall('/admin/roles/remove', {
        method: 'DELETE',
        body: JSON.stringify(roleRemoval)
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success(data?.message || 'Role removed successfully');
    },
    onError: (error) => {
      toast.error(error?.data?.message || `Failed to remove role: ${error.message}`);
    }
  });
};

// Policy Management Hooks
export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const response = await apiCall('/admin/policies');
      return CasbinDTOFactory.createPolicies(response);
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};

export const useAssignPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policyAssignment) => 
      apiCall('/admin/policies/assign', {
        method: 'POST',
        body: JSON.stringify(policyAssignment)
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['role-policies'] });
      toast.success(data?.message || 'Policy assigned successfully');
    },
    onError: (error) => {
      toast.error(error?.data?.message || `Failed to assign policy: ${error.message}`);
    }
  });
};

export const useRemovePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (policyRemoval) => 
      apiCall('/admin/policies/remove', {
        method: 'DELETE',
        body: JSON.stringify(policyRemoval)
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['role-policies'] });
      toast.success(data?.message || 'Policy removed successfully');
    },
    onError: (error) => {
      toast.error(error?.data?.message || `Failed to remove policy: ${error.message}`);
    }
  });
};

// Permission Check Hook
export const usePermissionCheck = () => {
  return useMutation({
    mutationFn: (permissionCheck) => 
      apiCall('/permissions/check', {
        method: 'POST',
        body: JSON.stringify(permissionCheck)
      }),
    onError: (error) => {
      toast.error(error?.data?.message || `Permission check failed: ${error.message}`);
    }
  });
};

// Authentication Status Hook
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const response = await apiCall('/auth/status');
      return CasbinDTOFactory.createAuthStatus(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refetch on window focus for auth status
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error.status === 401 || error.status === 403) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

// New API Hooks for Updated Endpoints

// Get roles for a specific user
export const useUserRoles = (userId) => {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      const response = await apiCall(`/users/${userId}/roles`);
      return CasbinDTOFactory.createUserRoles(response);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

// Get policies for a specific role
export const useRolePolicies = (role) => {
  return useQuery({
    queryKey: ['role-policies', role],
    queryFn: async () => {
      const response = await apiCall(`/roles/${encodeURIComponent(role)}/policies`);
      return CasbinDTOFactory.createRolePolicies(response);
    },
    enabled: !!role,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// DTO Exports for convenience
export { 
  UserDTO, 
  RoleDTO, 
  PolicyDTO, 
  AuthStatusDTO, 
  CasbinDTOFactory 
};

// Constants for role/policy management
export const CASBIN_DOMAINS = {
  DEFAULT: 'default',
  ADMIN: 'admin',
  USER: 'user'
};

export const POLICY_EFFECTS = {
  ALLOW: 'allow',
  DENY: 'deny'
};

export const COMMON_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  USER: 'user',
  GUEST: 'guest'
};

export const COMMON_RESOURCES = {
  USERS: 'users',
  ROLES: 'roles',
  POLICIES: 'policies',
  DASHBOARD: 'dashboard',
  ADMIN_PANEL: 'admin_panel'
};

export const COMMON_ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  ALL: '*'
};

// Helper function to create policy objects
export const createPolicy = (subject, resource, action, domain = CASBIN_DOMAINS.DEFAULT, effect = POLICY_EFFECTS.ALLOW) => {
  return CasbinDTOFactory.createPolicyAssignmentRequest(subject, resource, action, domain, effect);
};

// Helper function to create role assignment objects
export const createRoleAssignment = (userId, role, domain = CASBIN_DOMAINS.DEFAULT, characterId) => {
  // Ensure role has 'role:' prefix
  const roleWithPrefix = role.startsWith('role:') ? role : `role:${role}`;
  return CasbinDTOFactory.createRoleAssignmentRequest(userId, roleWithPrefix, domain, characterId);
};
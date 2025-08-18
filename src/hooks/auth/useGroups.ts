import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'http://localhost:8080';

// Types
export interface Group {
  id: string | number;
  name: string;
  description?: string;
  memberCount: number;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string | number;
  service: string;
  resource: string;
  action: string;
  subject_type: 'user' | 'group';
  subject_id: string | number;
  reason: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface PermissionAssignmentData {
  service?: string;
  resource: string;
  permission?: string;
  action?: string;
  subjectType: 'user' | 'group';
  subjectId: string | number;
  subjectID?: string | number;
  reason?: string;
  expires_at?: string;
  expiresAt?: string;
}

export interface BulkPermissionAssignmentData {
  assignments?: PermissionAssignmentData[];
}

export interface PermissionFilters {
  subjectType?: 'user' | 'group';
  subjectId?: string | number;
  subjectID?: string | number;
  permission?: string;
  resource?: string;
  resourceId?: string | number;
  resourceID?: string | number;
}

export interface ValidationSubjectData {
  subjectType?: 'user' | 'group';
  subjectId?: string | number;
  subjectID?: string | number;
  subjectIds?: string;
  subjectIDs?: string;
}

export interface PermissionCheckData {
  service: string;
  resource: string;
  action: string;
  subject_type: 'user' | 'group';
  subject_id: string | number;
}

export interface PermissionAuditFilters {
  service?: string;
  resource?: string;
  action?: string;
  subject_type?: 'user' | 'group';
  subject_id?: string | number;
  start_date?: string;
  end_date?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  // For now, keep using cookies as per CLAUDE.md instructions
  // The backend should handle the authentication method internally
  return {
    'Content-Type': 'application/json',
  };
};

// API functions following the OpenAPI specification
const fetchGroups = async (): Promise<Group[] | ApiResponse<Group[]>> => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/subjects/groups`, {
    method: 'GET',
    credentials: 'include', // Keep cookie auth as per CLAUDE.md
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch groups' }));
    throw new Error(error.message || 'Failed to fetch groups');
  }

  const data = await response.json();
  // Handle different possible response structures
  return data;
};

const fetchPermissionAssignments = async (filters: PermissionFilters = {}): Promise<Permission[] | PaginatedResponse<Permission> | ApiResponse<Permission[]>> => {
  const queryParams = new URLSearchParams();
  
  // Add filters if provided - map to OpenAPI spec parameters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      // Map frontend filter names to API parameter names
      const paramMap: Record<string, string> = {
        subjectType: 'subjectType',
        subjectId: 'subjectID',
        permission: 'permission',
        resource: 'resource',
        resourceId: 'resourceID'
      };
      const apiKey = paramMap[key] || key;
      queryParams.append(apiKey, String(value));
    }
  });

  const url = `${API_BASE_URL}/admin/permissions/assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch permission assignments' }));
    throw new Error(error.message || 'Failed to fetch permission assignments');
  }

  const data = await response.json();
  // Handle different possible response structures
  return data;
};

const createPermissionAssignment = async (assignmentData: PermissionAssignmentData): Promise<Permission | ApiResponse<Permission>> => {
  // Map frontend field names to OpenAPI spec field names
  const apiData: Record<string, any> = {
    service: assignmentData.service || 'default', // Required field
    resource: assignmentData.resource || '', // Required field  
    action: assignmentData.permission || assignmentData.action, // 'permission' maps to 'action'
    subject_type: assignmentData.subjectType, // Snake case in API
    subject_id: assignmentData.subjectId || assignmentData.subjectID, // Snake case in API
    reason: assignmentData.reason || 'Permission granted via admin interface', // Required field
  };

  // Add optional fields
  if (assignmentData.expires_at || assignmentData.expiresAt) {
    apiData.expires_at = assignmentData.expires_at || assignmentData.expiresAt;
  }
  
  const response = await fetch(`${API_BASE_URL}/admin/permissions/assignments`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create permission assignment' }));
    throw new Error(error.message || 'Failed to create permission assignment');
  }

  const data = await response.json();
  return data;
};

const createBulkPermissionAssignments = async (assignmentsData: PermissionAssignmentData[] | BulkPermissionAssignmentData): Promise<Permission[] | ApiResponse<Permission[]>> => {
  // Transform each assignment to match OpenAPI spec
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.assignments || [];
  
  const transformedAssignments = assignments.map(assignment => ({
    service: assignment.service || 'default',
    resource: assignment.resource || '',
    action: assignment.permission || assignment.action,
    subject_type: assignment.subjectType,
    subject_id: assignment.subjectId || assignment.subjectID,
    reason: assignment.reason || 'Bulk permission granted via admin interface',
    ...(assignment.expires_at || assignment.expiresAt ? { expires_at: assignment.expires_at || assignment.expiresAt } : {})
  }));

  const bulkData = {
    assignments: transformedAssignments
  };

  const response = await fetch(`${API_BASE_URL}/admin/permissions/assignments/bulk`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(bulkData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create bulk permission assignments' }));
    throw new Error(error.message || 'Failed to create bulk permission assignments');
  }

  const data = await response.json();
  return data;
};

const deletePermissionAssignment = async (assignmentId: string | number): Promise<{ success: boolean } | ApiResponse<{ success: boolean }>> => {
  // Use assignmentID parameter as per OpenAPI spec
  const response = await fetch(`${API_BASE_URL}/admin/permissions/assignments/${assignmentId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete permission assignment' }));
    throw new Error(error.message || 'Failed to delete permission assignment');
  }

  // Return success indicator
  return { success: true };
};

const validatePermissionSubjects = async (subjectData: ValidationSubjectData): Promise<any> => {
  const queryParams = new URLSearchParams();
  
  // Map to OpenAPI spec parameters
  Object.entries(subjectData).forEach(([key, value]) => {
    if (value) {
      const paramMap: Record<string, string> = {
        subjectType: 'subjectType',
        subjectId: 'subjectID',
        subjectIds: 'subjectIDs'
      };
      const apiKey = paramMap[key] || key;
      queryParams.append(apiKey, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/admin/permissions/subjects/validate?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to validate permission subjects' }));
    throw new Error(error.message || 'Failed to validate permission subjects');
  }

  const data = await response.json();
  return data;
};

// New API functions for additional endpoints from OpenAPI spec
const fetchPermissionServices = async (): Promise<string[] | ApiResponse<string[]>> => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/services`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch permission services' }));
    throw new Error(error.message || 'Failed to fetch permission services');
  }

  return response.json();
};

const checkPermissions = async (checkData: PermissionCheckData): Promise<{ allowed: boolean } | ApiResponse<{ allowed: boolean }>> => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/check`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(checkData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to check permissions' }));
    throw new Error(error.message || 'Failed to check permissions');
  }

  return response.json();
};

const fetchUserPermissions = async (characterID: string | number): Promise<Permission[] | ApiResponse<Permission[]>> => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/check/user/${characterID}`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch user permissions' }));
    throw new Error(error.message || 'Failed to fetch user permissions');
  }

  return response.json();
};

const fetchServicePermissions = async (serviceName: string): Promise<Permission[] | ApiResponse<Permission[]>> => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/check/service/${serviceName}`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch service permissions' }));
    throw new Error(error.message || 'Failed to fetch service permissions');
  }

  return response.json();
};

// Audit endpoint
const fetchPermissionAudit = async (filters: PermissionAuditFilters = {}): Promise<any[] | ApiResponse<any[]>> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, String(value));
  });

  const url = `${API_BASE_URL}/admin/permissions/audit${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch permission audit' }));
    throw new Error(error.message || 'Failed to fetch permission audit');
  }

  return response.json();
};

// React Query hooks
export const useGroups = (options: Omit<UseQueryOptions<Group[] | ApiResponse<Group[]>, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount: number, error: Error) => {
      // Don't retry on 4xx errors
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const usePermissions = (
  filters: PermissionFilters = {},
  options: Omit<UseQueryOptions<Permission[] | PaginatedResponse<Permission> | ApiResponse<Permission[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['permissions', 'assignments', filters],
    queryFn: () => fetchPermissionAssignments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount: number, error: Error) => {
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useCreatePermissionAssignment = (
  options: Omit<UseMutationOptions<Permission | ApiResponse<Permission>, Error, PermissionAssignmentData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermissionAssignment,
    onSuccess: () => {
      // Invalidate and refetch permission assignments
      queryClient.invalidateQueries({ queryKey: ['permissions', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create permission assignment:', error);
    },
    ...options,
  });
};

export const useCreateBulkPermissionAssignments = (
  options: Omit<UseMutationOptions<Permission[] | ApiResponse<Permission[]>, Error, PermissionAssignmentData[] | BulkPermissionAssignmentData>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBulkPermissionAssignments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create bulk permission assignments:', error);
    },
    ...options,
  });
};

export const useDeletePermissionAssignment = (
  options: Omit<UseMutationOptions<{ success: boolean } | ApiResponse<{ success: boolean }>, Error, string | number>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete permission assignment:', error);
    },
    ...options,
  });
};

export const useValidatePermissionSubjects = (
  options: Omit<UseMutationOptions<any, Error, ValidationSubjectData>, 'mutationFn'> = {}
) => {
  return useMutation({
    mutationFn: validatePermissionSubjects,
    onError: (error: Error) => {
      console.error('Failed to validate permission subjects:', error);
    },
    ...options,
  });
};

// New React Query hooks for additional endpoints
export const usePermissionServices = (
  options: Omit<UseQueryOptions<string[] | ApiResponse<string[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['permissions', 'services'],
    queryFn: fetchPermissionServices,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount: number, error: Error) => {
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useCheckPermissions = (
  options: Omit<UseMutationOptions<{ allowed: boolean } | ApiResponse<{ allowed: boolean }>, Error, PermissionCheckData>, 'mutationFn'> = {}
) => {
  return useMutation({
    mutationFn: checkPermissions,
    onError: (error: Error) => {
      console.error('Failed to check permissions:', error);
    },
    ...options,
  });
};

export const useUserPermissionsSummary = (
  characterID: string | number | undefined,
  options: Omit<UseQueryOptions<Permission[] | ApiResponse<Permission[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['permissions', 'user', characterID],
    queryFn: () => fetchUserPermissions(characterID!),
    enabled: !!characterID,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount: number, error: Error) => {
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

export const useServicePermissions = (
  serviceName: string | undefined,
  options: Omit<UseQueryOptions<Permission[] | ApiResponse<Permission[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['permissions', 'service', serviceName],
    queryFn: () => fetchServicePermissions(serviceName!),
    enabled: !!serviceName,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount: number, error: Error) => {
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Audit hook
export const usePermissionAudit = (
  filters: PermissionAuditFilters = {},
  options: Omit<UseQueryOptions<any[] | ApiResponse<any[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['permissions', 'audit', filters],
    queryFn: () => fetchPermissionAudit(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount: number, error: Error) => {
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
    ...options,
  });
};

// Filtered permission hooks for convenience (updated to use new naming)
export const useGroupPermissions = (
  groupId: string | number | undefined,
  options: Omit<UseQueryOptions<Permission[] | PaginatedResponse<Permission> | ApiResponse<Permission[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return usePermissions({ subjectType: 'group', subjectId: groupId }, options);
};

export const useUserPermissions = (
  userId: string | number | undefined,
  options: Omit<UseQueryOptions<Permission[] | PaginatedResponse<Permission> | ApiResponse<Permission[]>, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return usePermissions({ subjectType: 'user', subjectId: userId }, options);
};
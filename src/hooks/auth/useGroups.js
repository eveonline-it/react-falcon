import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'http://localhost:8080';

// API functions following the OpenAPI specification
const fetchGroups = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/subjects/groups`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch groups' }));
    throw new Error(error.message || 'Failed to fetch groups');
  }

  return response.json();
};

const fetchPermissionAssignments = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters if provided
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const url = `${API_BASE_URL}/admin/permissions/assignments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch permission assignments' }));
    throw new Error(error.message || 'Failed to fetch permission assignments');
  }

  return response.json();
};

const createPermissionAssignment = async (assignmentData) => {
  // Map frontend field names to API field names
  const apiData = {
    subjectType: assignmentData.subjectType,
    subjectID: assignmentData.subjectId || assignmentData.subjectID,
    permission: assignmentData.permission,
    resource: assignmentData.resource || undefined,
    resourceID: assignmentData.resourceId || assignmentData.resourceID || undefined,
  };
  
  // Remove undefined fields
  Object.keys(apiData).forEach(key => 
    apiData[key] === undefined && delete apiData[key]
  );
  
  const response = await fetch(`${API_BASE_URL}/admin/permissions/assignments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create permission assignment' }));
    throw new Error(error.message || 'Failed to create permission assignment');
  }

  return response.json();
};

const createBulkPermissionAssignments = async (assignmentsData) => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/assignments/bulk`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignmentsData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create bulk permission assignments' }));
    throw new Error(error.message || 'Failed to create bulk permission assignments');
  }

  return response.json();
};

const deletePermissionAssignment = async (assignmentId) => {
  const response = await fetch(`${API_BASE_URL}/admin/permissions/assignments/${assignmentId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete permission assignment' }));
    throw new Error(error.message || 'Failed to delete permission assignment');
  }

  return response.ok;
};

const validatePermissionSubjects = async (subjectData) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(subjectData).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/admin/permissions/subjects/validate?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to validate permission subjects' }));
    throw new Error(error.message || 'Failed to validate permission subjects');
  }

  return response.json();
};

// React Query hooks
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
  });
};

export const usePermissions = (filters = {}) => {
  return useQuery({
    queryKey: ['permissions', 'assignments', filters],
    queryFn: () => fetchPermissionAssignments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('40')) return false;
      return failureCount < 3;
    },
  });
};

export const useCreatePermissionAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermissionAssignment,
    onSuccess: () => {
      // Invalidate and refetch permission assignments
      queryClient.invalidateQueries({ queryKey: ['permissions', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Failed to create permission assignment:', error);
    },
  });
};

export const useCreateBulkPermissionAssignments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBulkPermissionAssignments,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Failed to create bulk permission assignments:', error);
    },
  });
};

export const useDeletePermissionAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePermissionAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', 'assignments'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Failed to delete permission assignment:', error);
    },
  });
};

export const useValidatePermissionSubjects = () => {
  return useMutation({
    mutationFn: validatePermissionSubjects,
    onError: (error) => {
      console.error('Failed to validate permission subjects:', error);
    },
  });
};

// Filtered permission hooks for convenience
export const useGroupPermissions = (groupId) => {
  return usePermissions({ subjectType: 'group', subjectId: groupId });
};

export const useUserPermissions = (userId) => {
  return usePermissions({ subjectType: 'user', subjectId: userId });
};
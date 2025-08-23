import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

const fetchUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value != null) {
      params.append(key, value.toString());
    }
  });
  
  const response = await fetch(`${BASE_URL}/users?${params}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch users: ${response.status}`);
  }

  return response.json();
};

const fetchUserStats = async () => {
  const response = await fetch(`${BASE_URL}/users/stats`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch user stats: ${response.status}`);
  }

  return response.json();
};

const fetchUserProfile = async (userId) => {
  // Try to get public profile using character_id if available
  // Since individual user profiles by user_id aren't available in the API,
  // we'll fall back to using the data already available from the users list
  try {
    const response = await fetch(`${BASE_URL}/auth/profile/public?character_id=${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return response.json();
    }
    
    // If public profile fails, return null to indicate we should use existing user data
    return null;
  } catch (error) {
    console.warn('User profile fetch failed, will use existing user data:', error);
    return null;
  }
};

const updateUser = async ({ userId, data }) => {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update user: ${response.status}`);
  }

  return response.json();
};

const refreshUserData = async (userId) => {
  // The refresh endpoint is for the current authenticated user only
  // For admin refresh operations, we'll need to use a different approach
  const response = await fetch(`${BASE_URL}/auth/profile/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      force_refresh: true
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to refresh user data: ${response.status}`);
  }

  return response.json();
};

const bulkUpdateUsers = async ({ userIds, data }) => {
  const results = [];
  const errors = [];
  
  for (const userId of userIds) {
    try {
      const result = await updateUser({ userId, data });
      results.push({ userId, result, success: true });
    } catch (error) {
      errors.push({ userId, error: error.message, success: false });
    }
  }
  
  return { results, errors, total: userIds.length };
};

const fetchUsersStatus = async () => {
  const response = await fetch(`${BASE_URL}/users/status`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch users status: ${response.status}`);
  }

  return response.json();
};

export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true,
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: true,
  });
};

export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries(['users']);
      
      const previousUsers = queryClient.getQueryData(['users']);
      
      queryClient.setQueryData(['users'], (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.map((user) =>
            user.user_id === userId ? { ...user, ...data } : user
          ),
        };
      });
      
      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.error(`Failed to update user: ${err.message}`);
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
      queryClient.invalidateQueries(['user', 'profile', userId]);
      toast.success('User updated successfully!');
    },
  });
};

// Backward compatibility - wrapper for status updates
export const useUpdateUserStatus = () => {
  const updateUserMutation = useUpdateUser();
  
  return {
    ...updateUserMutation,
    mutateAsync: async ({ userId, status }) => {
      const statusMap = {
        'enabled': { enabled: true, banned: false, invalid: false },
        'disabled': { enabled: false, banned: false, invalid: false },
        'banned': { enabled: false, banned: true, invalid: false },
        'invalid': { enabled: false, banned: false, invalid: true }
      };
      
      return updateUserMutation.mutateAsync({
        userId,
        data: statusMap[status] || statusMap['disabled']
      });
    }
  };
};

export const useRefreshUserData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      // Since individual user refresh isn't available, just refresh the users list
      queryClient.invalidateQueries(['users']);
      return { success: true, message: 'Users list refreshed' };
    },
    onSuccess: (data, userId) => {
      toast.success('Users list refreshed successfully!');
    },
    onError: (err) => {
      toast.error(`Failed to refresh user data: ${err.message}`);
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateUsers,
    onSuccess: (result) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
      
      const { results, errors, total } = result;
      const successCount = results.filter(r => r.success).length;
      const errorCount = errors.length;
      
      if (errorCount > 0) {
        toast.warning(`Bulk update completed: ${successCount} successful, ${errorCount} failed`);
      } else {
        toast.success(`Bulk update completed: ${successCount} users updated successfully`);
      }
    },
    onError: (err) => {
      toast.error(`Bulk update failed: ${err.message}`);
    },
  });
};

export const useUsersStatus = () => {
  return useQuery({
    queryKey: ['users', 'status'],
    queryFn: fetchUsersStatus,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: true,
  });
};
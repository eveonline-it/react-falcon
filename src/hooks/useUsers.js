import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// ESI API helper functions for missing corporation/alliance data
const fetchESIData = async (url) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('ESI API call failed:', error);
  }
  return null;
};

const enrichUserWithESIData = async (user) => {
  if (!user.character_id) return user;
  
  const enrichedUser = { ...user };
  
  try {
    // Collect all API calls we need to make
    const apiCalls = [];
    
    // Add corporation call if needed
    if (!user.corporation_name && user.corporation_id) {
      apiCalls.push({
        type: 'corporation',
        id: user.corporation_id,
        url: `https://esi.evetech.net/latest/corporations/${user.corporation_id}/`
      });
    }
    
    // Add alliance call if needed
    if (!user.alliance_name && user.alliance_id) {
      apiCalls.push({
        type: 'alliance',
        id: user.alliance_id,
        url: `https://esi.evetech.net/latest/alliances/${user.alliance_id}/`
      });
    }
    
    // Add character call if we need IDs
    if (!user.corporation_id || !user.alliance_id) {
      apiCalls.push({
        type: 'character',
        id: user.character_id,
        url: `https://esi.evetech.net/latest/characters/${user.character_id}/`
      });
    }
    
    // Execute all calls in parallel
    if (apiCalls.length > 0) {
      const results = await Promise.allSettled(
        apiCalls.map(async call => ({
          type: call.type,
          id: call.id,
          data: await fetchESIData(call.url)
        }))
      );
      
      // Process successful results
      let characterData = null;
      const additionalCalls = [];
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.data) {
          const { type, data } = result.value;
          
          if (type === 'corporation') {
            enrichedUser.corporation_name = data.name;
          } else if (type === 'alliance') {
            enrichedUser.alliance_name = data.name;
          } else if (type === 'character') {
            characterData = data;
            
            // Update IDs from character data
            if (!enrichedUser.corporation_id && data.corporation_id) {
              enrichedUser.corporation_id = data.corporation_id;
              additionalCalls.push({
                type: 'corporation',
                url: `https://esi.evetech.net/latest/corporations/${data.corporation_id}/`
              });
            }
            
            if (!enrichedUser.alliance_id && data.alliance_id) {
              enrichedUser.alliance_id = data.alliance_id;
              additionalCalls.push({
                type: 'alliance',
                url: `https://esi.evetech.net/latest/alliances/${data.alliance_id}/`
              });
            }
            
            // Add character-specific data
            if (data.security_status !== undefined) {
              enrichedUser.security_status = data.security_status;
            }
            if (data.birthday) {
              enrichedUser.birthday = data.birthday;
            }
          }
        }
      }
      
      // Execute additional calls for missing corp/alliance names in parallel
      if (additionalCalls.length > 0) {
        const additionalResults = await Promise.allSettled(
          additionalCalls.map(async call => ({
            type: call.type,
            data: await fetchESIData(call.url)
          }))
        );
        
        for (const result of additionalResults) {
          if (result.status === 'fulfilled' && result.value.data) {
            const { type, data } = result.value;
            if (type === 'corporation') {
              enrichedUser.corporation_name = data.name;
            } else if (type === 'alliance') {
              enrichedUser.alliance_name = data.name;
            }
          }
        }
      }
    }
    
    return enrichedUser;
  } catch (error) {
    console.error('Error enriching user data:', error);
    return user; // Return original user data on error
  }
};

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

  const data = await response.json();
  console.log('Users API response:', data); // Debug log to see what we get
  
  // Note: ESI enrichment has been moved to background queries for better performance
  
  return data;
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
  console.log(`Making PUT request to ${BASE_URL}/users/mgt/${userId} with data:`, data);
  
  const response = await fetch(`${BASE_URL}/users/mgt/${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Update user failed:', response.status, errorData);
    throw new Error(errorData.error || errorData.message || `Failed to update user: ${response.status}`);
  }

  const result = await response.json();
  console.log('Update user success:', result);
  return result;
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

const deleteUser = async (characterId) => {
  console.log(`Making DELETE request to ${BASE_URL}/users/mgt/${characterId}`);
  
  const response = await fetch(`${BASE_URL}/users/mgt/${characterId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Delete user failed:', response.status, errorData);
    throw new Error(errorData.error || errorData.message || `Failed to delete user: ${response.status}`);
  }

  const result = await response.json();
  console.log('Delete user success:', result);
  return result;
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

const fetchUserGroups = async (userId) => {
  const response = await fetch(`${BASE_URL}/users/${userId}/groups`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch user groups: ${response.status}`);
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
            user.character_id === userId ? { ...user, ...data } : user
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

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onMutate: async (characterId) => {
      await queryClient.cancelQueries(['users']);
      
      const previousUsers = queryClient.getQueryData(['users']);
      
      // Optimistically remove user from cache
      queryClient.setQueryData(['users'], (old) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.filter((user) => user.character_id !== characterId),
          total: (old.total || 0) - 1,
        };
      });
      
      return { previousUsers };
    },
    onError: (err, characterId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      toast.error(`Failed to delete user: ${err.message}`);
    },
    onSuccess: (data, characterId) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
      queryClient.invalidateQueries(['user', 'profile', characterId]);
      toast.success('User deleted successfully!');
    },
  });
};

export const useEnrichedUser = (user) => {
  return useQuery({
    queryKey: ['user', 'enriched', user?.character_id],
    queryFn: () => enrichUserWithESIData(user),
    staleTime: 1000 * 60 * 10, // 10 minutes - ESI data doesn't change often
    enabled: !!user?.character_id,
  });
};

export const useUserGroups = (userId) => {
  return useQuery({
    queryKey: ['user', 'groups', userId],
    queryFn: () => fetchUserGroups(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  });
};
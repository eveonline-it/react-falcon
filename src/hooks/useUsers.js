import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';

// Character data enrichment helper functions

const enrichUserWithCharacterData = async (user) => {
  if (!user.character_id) {
    return user;
  }
  
  const enrichedUser = { ...user };
  
  try {
    // Fetch character details from backend
    const characterResponse = await fetch(`${BASE_URL}/character/${user.character_id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!characterResponse.ok) {
      return user;
    }

    const characterData = await characterResponse.json();
    
    // Update all character fields from API response
    if (characterData.corporation_id) {
      enrichedUser.corporation_id = characterData.corporation_id;
    }
    if (characterData.alliance_id) {
      enrichedUser.alliance_id = characterData.alliance_id;
    }
    if (characterData.security_status !== undefined) {
      enrichedUser.security_status = characterData.security_status;
    }
    if (characterData.birthday) {
      enrichedUser.birthday = characterData.birthday;
    }
    if (characterData.gender) {
      enrichedUser.gender = characterData.gender;
    }
    if (characterData.race_id) {
      enrichedUser.race_id = characterData.race_id;
    }
    if (characterData.bloodline_id) {
      enrichedUser.bloodline_id = characterData.bloodline_id;
    }
    if (characterData.ancestry_id) {
      enrichedUser.ancestry_id = characterData.ancestry_id;
    }
    if (characterData.faction_id) {
      enrichedUser.faction_id = characterData.faction_id;
    }
    if (characterData.description) {
      enrichedUser.description = characterData.description;
    }
    
    // Prepare parallel API calls for corporation and alliance names
    const apiCalls = [];
    
    if (enrichedUser.corporation_id && !user.corporation_name) {
      apiCalls.push({
        type: 'corporation',
        id: enrichedUser.corporation_id,
        promise: fetch(`${BASE_URL}/corporations/${enrichedUser.corporation_id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      });
    }
    
    if (enrichedUser.alliance_id && !user.alliance_name) {
      apiCalls.push({
        type: 'alliance',
        id: enrichedUser.alliance_id,
        promise: fetch(`${BASE_URL}/alliances/${enrichedUser.alliance_id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      });
    }
    
    // Execute all calls in parallel
    if (apiCalls.length > 0) {
      const results = await Promise.allSettled(
        apiCalls.map(async call => ({
          type: call.type,
          id: call.id,
          response: await call.promise
        }))
      );
      
      // Process successful results
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.response.ok) {
          const { type, response } = result.value;
          try {
            const data = await response.json();
            if (type === 'corporation' && data.name) {
              enrichedUser.corporation_name = data.name;
              if (data.ticker) enrichedUser.corporation_ticker = data.ticker;
              if (data.ceo_id) enrichedUser.corporation_ceo_id = data.ceo_id;
              if (data.member_count) enrichedUser.corporation_member_count = data.member_count;
              if (data.tax_rate !== undefined) enrichedUser.corporation_tax_rate = data.tax_rate;
              if (data.date_founded) enrichedUser.corporation_date_founded = data.date_founded;
            } else if (type === 'alliance' && data.name) {
              enrichedUser.alliance_name = data.name;
              if (data.ticker) enrichedUser.alliance_ticker = data.ticker;
              if (data.creator_id) enrichedUser.alliance_creator_id = data.creator_id;
              if (data.creator_corporation_id) enrichedUser.alliance_creator_corporation_id = data.creator_corporation_id;
              if (data.date_founded) enrichedUser.alliance_date_founded = data.date_founded;
              if (data.executor_corporation_id) enrichedUser.alliance_executor_corporation_id = data.executor_corporation_id;
            }
          } catch (jsonError) {
            // Failed to parse response
          }
        } else if (result.status === 'fulfilled') {
          // API call failed
        } else {
          // API call rejected
        }
      }
    }
    
    return enrichedUser;
  } catch (error) {
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
  
  // Handle different response structures
  let usersArray;
  let originalStructure = data;
  
  if (Array.isArray(data)) {
    // Response is directly an array of users
    usersArray = data;
  } else if (data && data.users && Array.isArray(data.users)) {
    // Response has users nested in an object
    usersArray = data.users;
  } else {
    // No users found or unexpected structure
    return data;
  }
  
  // Check if we have users with character_id for enrichment
  if (usersArray.length > 0) {
    const enrichedUsers = await Promise.all(
      usersArray.map((user) => {
        return enrichUserWithCharacterData(user);
      })
    );
    
    // Return in the same structure as received
    if (Array.isArray(data)) {
      return enrichedUsers;
    } else {
      return {
        ...originalStructure,
        users: enrichedUsers
      };
    }
  } else {
    return data;
  }
  
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
    return null;
  }
};

const updateUser = async ({ userId, data }) => {
  
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
    throw new Error(errorData.error || errorData.message || `Failed to update user: ${response.status}`);
  }

  const result = await response.json();
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
  
  const response = await fetch(`${BASE_URL}/users/mgt/${characterId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Failed to delete user: ${response.status}`);
  }

  const result = await response.json();
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
    queryFn: () => enrichUserWithCharacterData(user),
    staleTime: 1000 * 60 * 10, // 10 minutes - character data doesn't change often
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
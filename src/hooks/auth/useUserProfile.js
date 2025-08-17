import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Example API functions (replace with your actual API calls)
const fetchUserProfile = async (userId) => {
  // Simulate API call
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};

const updateUserProfile = async ({ userId, userData }) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }
  return response.json();
};

// Hook for fetching user profile
export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId, // Only run query if userId exists
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    ...options,
  });
};

// Hook for updating user profile
export const useUpdateUserProfile = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser) => {
      // Update the cache with the new user data
      queryClient.setQueryData(['user', 'profile', updatedUser.id], updatedUser);
      
      // Invalidate and refetch any queries that start with 'user'
      queryClient.invalidateQueries({ 
        queryKey: ['user'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error);
    },
    ...options,
  });
};
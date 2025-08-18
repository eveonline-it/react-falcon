import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

// Types
export interface UserProfile {
  id: string | number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateJoined: string;
  lastLogin?: string;
  isActive: boolean;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface UpdateUserProfileData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  preferences?: UserProfile['preferences'];
}

export interface UpdateUserProfileParams {
  userId: string | number;
  userData: UpdateUserProfileData;
}

// Example API functions (replace with your actual API calls)
const fetchUserProfile = async (userId: string | number): Promise<UserProfile> => {
  // Simulate API call
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};

const updateUserProfile = async ({ userId, userData }: UpdateUserProfileParams): Promise<UserProfile> => {
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
export const useUserProfile = (
  userId: string | number | undefined,
  options: Omit<UseQueryOptions<UserProfile, Error>, 'queryKey' | 'queryFn'> = {}
) => {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId, // Only run query if userId exists
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    ...options,
  });
};

// Hook for updating user profile
export const useUpdateUserProfile = (
  options: Omit<UseMutationOptions<UserProfile, Error, UpdateUserProfileParams>, 'mutationFn'> = {}
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser: UserProfile) => {
      // Update the cache with the new user data
      queryClient.setQueryData(['user', 'profile', updatedUser.id], updatedUser);
      
      // Invalidate and refetch any queries that start with 'user'
      queryClient.invalidateQueries({ 
        queryKey: ['user'],
        refetchType: 'active',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to update user profile:', error);
    },
    ...options,
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Authentication-related query hooks using TanStack Query
 * These hooks manage the auth status checking and logout functionality
 */

// API functions
const checkAuthStatus = async () => {
  try {
    const backendUrl = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';
    const response = await fetch(`${backendUrl}/auth/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        authenticated: data.authenticated === true,
        user_id: data.user_id || null,
        character_id: data.character_id || null,
        character_name: data.character_name || null,
        characters: data.characters || [],
        _source: 'auth_status_success'
      };
    }
    
    // Auth status endpoint responded but user not authenticated
    return { 
      authenticated: false, 
      user_id: null, 
      character_id: null, 
      character_name: null, 
      characters: [],
      _source: 'auth_status_unauthenticated'
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    // This is a network/server error, not an auth failure
    const authError = new Error('Auth status endpoint failed');
    authError.isAuthStatusFailure = true;
    authError.originalError = error;
    throw authError;
  }
};

const logoutUser = async () => {
  const backendUrl = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';
  const response = await fetch(`${backendUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  
  return response.json();
};

// Query hooks
export const useAuthStatus = (options = {}) => {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: checkAuthStatus,
    staleTime: 1000 * 30, // 30 seconds - auth status should be fresh
    gcTime: 1000 * 60 * 2, // 2 minutes cache time
    refetchOnWindowFocus: true, // Check auth when window gains focus
    refetchOnReconnect: true, // Check auth when reconnecting
    retry: (failureCount, error) => {
      // Don't retry on auth failures
      return failureCount < 2;
    },
    ...options,
  });
};

export const useLogout = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      
      // Update auth status immediately
      queryClient.setQueryData(['auth', 'status'], {
        authenticated: false,
        user_id: null,
        character_id: null,
        character_name: null,
        characters: []
      });
      
      // Redirect to login
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still redirect even if logout request fails
      window.location.href = '/login';
    },
    ...options,
  });
};

// Helper hook to get current user data from auth status
export const useCurrentUser = (options = {}) => {
  const authQuery = useAuthStatus(options);
  
  return {
    ...authQuery,
    user: authQuery.data || null,
    isAuthenticated: authQuery.data?.authenticated || false,
    isLoading: authQuery.isLoading,
    error: authQuery.error,
  };
};
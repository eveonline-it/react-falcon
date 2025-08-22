import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * Authentication-related query hooks using TanStack Query
 * These hooks manage the auth status checking and logout functionality
 */

// Types
export interface Character {
  character_id: number;
  character_name: string;
  corporation_id?: number;
  corporation_name?: string;
  alliance_id?: number;
  alliance_name?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user_id: number | null;
  character_id: number | null;
  character_name: string | null;
  characters: Character[];
  _source: 'auth_status_success' | 'auth_status_unauthenticated';
}

export interface AuthError extends Error {
  isAuthStatusFailure?: boolean;
  originalError?: unknown;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export interface CurrentUser {
  user: AuthStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

// API functions
const checkAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const backendUrl = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';
    const response = await fetch(`${backendUrl}/auth/auth-status`, {
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
    
    // Handle non-200 responses (like 401 Unauthorized when no valid cookie)
    if (response.status === 401 || response.status === 403) {
      // User not authenticated - this is expected, not an error
      console.log('🔐 No valid session cookie found (401/403 response)');
      return { 
        authenticated: false, 
        user_id: null, 
        character_id: null, 
        character_name: null, 
        characters: [],
        _source: 'auth_status_unauthenticated'
      };
    }
    
    // Handle server errors as connectivity/server problems, not auth failures
    if (response.status === 502 || response.status === 503 || response.status === 504) {
      const statusMessages = {
        502: 'Bad Gateway',
        503: 'Service Unavailable', 
        504: 'Gateway Timeout'
      };
      console.warn(`🔗 Backend server connectivity issue (${response.status} ${statusMessages[response.status as keyof typeof statusMessages]})`);
      const connectivityError = new Error('Backend server connectivity issue') as AuthError;
      connectivityError.isAuthStatusFailure = true;
      connectivityError.originalError = { status: response.status, statusText: statusMessages[response.status as keyof typeof statusMessages] };
      throw connectivityError;
    }
    
    // Other non-200 responses are actual errors
    throw new Error(`Auth status check failed with status ${response.status}`);
  } catch (error) {
    // Re-throw HTTP status errors (these are handled above)
    if (error instanceof Error && error.message.includes('Auth status check failed with status')) {
      throw error;
    }
    
    console.error('Auth status network/server error:', error);
    // This is a network/server error, not an auth failure
    const authError = new Error('Auth status endpoint failed') as AuthError;
    authError.isAuthStatusFailure = true;
    authError.originalError = error;
    throw authError;
  }
};

const logoutUser = async (): Promise<LogoutResponse> => {
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
export const useAuthStatus = (options: Omit<UseQueryOptions<AuthStatus, Error>, 'queryKey' | 'queryFn'> = {}) => {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: checkAuthStatus,
    staleTime: 1000 * 30, // 30 seconds - auth status should be fresh
    gcTime: 1000 * 60 * 2, // 2 minutes cache time
    refetchOnWindowFocus: true, // Check auth when window gains focus
    refetchOnReconnect: true, // Check auth when reconnecting
    retry: (failureCount: number, error: Error) => {
      // Don't retry on auth failures
      return failureCount < 2;
    },
    // Add network timeout
    networkMode: 'online',
    ...options,
  });
};

export const useLogout = (options: Omit<UseMutationOptions<LogoutResponse, Error, void>, 'mutationFn'> = {}) => {
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
        characters: [],
        _source: 'auth_status_unauthenticated' as const
      });
      
      console.log('✅ Logout successful');
      toast.success('Logged out successfully', {
        toastId: 'logout-success',
        autoClose: 3000,
      });
      
      // Only redirect if explicitly needed by the caller
      // Allow the application to handle navigation
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.', {
        toastId: 'logout-error',
        autoClose: 5000,
      });
    },
    ...options,
  });
};

// Helper hook to get current user data from auth status
export const useCurrentUser = (options: Omit<UseQueryOptions<AuthStatus, Error>, 'queryKey' | 'queryFn'> = {}): CurrentUser => {
  const authQuery = useAuthStatus(options);
  
  return {
    ...authQuery,
    user: authQuery.data || null,
    isAuthenticated: authQuery.data?.authenticated || false,
    isLoading: authQuery.isLoading,
    error: authQuery.error,
  };
};
import React, { createContext, useContext, useEffect, ReactNode, useRef } from 'react';
import { toast } from 'react-toastify';
import { useCurrentUser } from 'hooks/auth/useAuth';
import { useAuthStore } from 'stores/authStore';
import { processEveAuthResponse } from 'utils/authUtils';

// Auth Context Types
interface AuthContextValue {
  isAuthenticated: boolean;
  user: number | null;
  charId: number | null;
  characterName: string | null;
  characters: any[];
  isLoading: boolean;
  verifyAuth: () => void;
  error: Error | null;
  authStore: ReturnType<typeof useAuthStore>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  const hasShownErrorToast = useRef(false);
  
  // Use TanStack Query for auth status management
  const currentUserQuery = useCurrentUser({
    refetchInterval: 1000 * 30, // Check every 30 seconds
    refetchIntervalInBackground: false, // Only when tab is active
    refetchOnWindowFocus: true, // Check when window gains focus
  });
  
  const {
    user: authData,
    isAuthenticated: cookieAuth,
    isLoading,
    error,
  } = currentUserQuery;
  
  // Get refetch function from the underlying query hook
  const verifyAuth = () => {
    // Since CurrentUser doesn't expose refetch, we'll use a placeholder
    console.log('Auth verification requested');
  };

  // Reset error toast flag when authentication succeeds
  useEffect(() => {
    if (cookieAuth && authData) {
      hasShownErrorToast.current = false;
    }
  }, [cookieAuth, authData]);

  // Sync cookie auth with Zustand store
  useEffect(() => {
    if (!isLoading && cookieAuth && authData) {
      console.log('🍪 Cookie auth detected, syncing with store...');
      
      // Only sync if store is not already authenticated or has different user
      if (!authStore.isAuthenticated || authStore.user?.characterId !== authData.character_id) {
        console.log('🔄 Syncing auth data from cookie to store');
        processEveAuthResponse({
          authenticated: true,
          character_id: authData.character_id,
          character_name: authData.character_name,
          characters: authData.characters || [],
          permissions: (authData as any).permissions || [],
          user_id: authData.user_id
        });
      }
    }
  }, [isLoading, cookieAuth, authData, authStore.isAuthenticated, authStore.user?.characterId]);

  // Handle authentication failures without redirects
  useEffect(() => {
    if (!isLoading && !cookieAuth && !error) {
      console.log('❌ Cookie authentication expired or not authenticated');
      // Clear store if cookie auth is gone
      if (authStore.isAuthenticated) {
        console.log('🧹 Clearing store auth state');
        authStore.logout();
      }
      
      // Show toast only once per session
      if (!hasShownErrorToast.current && window.location.pathname !== '/login') {
        toast.warning('Authentication required. Please log in to continue.', {
          toastId: 'auth-required',
          autoClose: 5000,
        });
        hasShownErrorToast.current = true;
      }
    }
  }, [isLoading, cookieAuth, error, authStore.isAuthenticated]);

  // Handle auth verification errors without redirects
  useEffect(() => {
    if (error && window.location.pathname !== '/login' && window.location.pathname !== '/') {
      console.error('❌ Auth verification failed:', error);
      authStore.logout();
      
      // Show toast only once per session for auth errors
      if (!hasShownErrorToast.current) {
        if ((error as any)?.isAuthStatusFailure) {
          console.log('🔗 Auth status endpoint failed');
          toast.error('Unable to verify authentication status. Please check your connection.', {
            toastId: 'auth-status-failed',
            autoClose: 5000,
          });
        } else {
          console.log('⚠️ Authentication error occurred');
          toast.warning('Authentication issue detected. Please log in again if needed.', {
            toastId: 'auth-error',
            autoClose: 5000,
          });
        }
        hasShownErrorToast.current = true;
      }
    }
  }, [error]);

  const value: AuthContextValue = {
    isAuthenticated: cookieAuth || authStore.isAuthenticated,
    user: authData?.user_id || null,
    charId: authData?.character_id || null,
    characterName: authData?.character_name || null,
    characters: authData?.characters || [],
    isLoading,
    verifyAuth,
    error,
    authStore, // Provide access to Zustand store
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';
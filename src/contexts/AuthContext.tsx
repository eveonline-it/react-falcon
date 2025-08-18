import React, { createContext, useContext, useEffect, ReactNode } from 'react';
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
  }, [isLoading, cookieAuth, authData, authStore.isAuthenticated, authStore.user]);

  // Handle authentication failures and redirects
  useEffect(() => {
    if (!isLoading && !cookieAuth && !error) {
      console.log('❌ Cookie authentication expired');
      // Clear store if cookie auth is gone
      if (authStore.isAuthenticated) {
        console.log('🧹 Clearing store auth state');
        authStore.logout();
      }
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        console.log('➡️ User not authenticated, redirecting to login...');
        window.location.href = '/login';
      }
    }
  }, [isLoading, cookieAuth, error, authStore]);

  // Handle auth verification errors with different redirect logic
  useEffect(() => {
    if (error && window.location.pathname !== '/login' && window.location.pathname !== '/') {
      console.error('❌ Auth verification failed:', error);
      authStore.logout();
      
      // Check if this is specifically an /auth/status endpoint failure
      if ((error as any)?.isAuthStatusFailure) {
        console.log('🔗 Auth status endpoint failed, redirecting to login...');
        window.location.href = '/login';
      } else {
        console.log('🏠 Other auth error, redirecting to homepage...');
        window.location.href = '/';
      }
    }
  }, [error, authStore]);

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
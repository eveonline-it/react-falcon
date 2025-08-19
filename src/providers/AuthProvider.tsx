import React, { createContext, use, useEffect, ReactNode } from 'react';
import { useAuthStore } from 'stores/authStore';
import { useAuthStatus } from 'hooks/auth/useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

type AuthStoreType = ReturnType<typeof useAuthStore>;

export const AuthContext = createContext<AuthStoreType | null>(null);

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();
  
  // Use cookie-based backend session validation
  const { data: authStatus, isLoading, error } = useAuthStatus({
    retry: (failureCount, error: any) => {
      // Don't retry on auth failures, but retry on network errors
      if (error?.isAuthStatusFailure) {
        return failureCount < 2;
      }
      return false;
    }
  });

  // Sync backend auth status with frontend auth store
  useEffect(() => {
    if (isLoading) {
      authStore.setLoading(true);
      return;
    }

    authStore.setLoading(false);

    // Handle auth status errors (network/server errors)
    if (error) {
      const authError = error as any;
      if (authError.isAuthStatusFailure) {
        console.warn('🔐 Auth status check failed:', authError.originalError);
        authStore.setError('Unable to verify authentication status');
        return;
      }
      // Other errors should not occur with current retry policy
      return;
    }

    // Sync successful auth status response with store
    if (authStatus) {
      if (authStatus.authenticated && !authStore.isAuthenticated) {
        // User has valid session but frontend state isn't initialized
        console.log('🔐 Found valid backend session, initializing frontend auth state');
        
        const userData = {
          userId: authStatus.user_id || undefined,
          characterId: authStatus.character_id || undefined,
          characterName: authStatus.character_name || undefined,
          displayName: authStatus.character_name || undefined,
          permissions: [] // Permissions should be fetched separately if needed
        };

        authStore.login(userData, undefined, undefined, 'eve-online');
        authStore.clearError(); // Clear any previous auth errors
        
      } else if (!authStatus.authenticated && authStore.isAuthenticated) {
        // Backend session is invalid but frontend thinks user is authenticated
        console.log('🔐 Backend session invalid, logging out user');
        authStore.logout();
      }
    }
  }, [authStatus, isLoading, error, authStore]);

  // Log auth state changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const unsubscribe = useAuthStore.subscribe((state) => {
        console.log('🔐 Auth State Changed:', {
          isAuthenticated: state.isAuthenticated,
          user: state.user?.displayName || state.user?.characterName || 'Unknown',
          loginMethod: state.loginMethod
        });
      });

      return unsubscribe;
    }
  }, []);

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context (provides direct access to the store)
export const useAuthContext = (): AuthStoreType => {
  const store = use(AuthContext);
  if (!store) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return store;
};

// Convenience hooks for common auth operations
export const useAuthUser = () => {
  const store = useAuthContext();
  return store.user;
};

export const useIsAuthenticated = (): boolean => {
  const store = useAuthContext();
  return store.isAuthenticated;
};

export const useAuthActions = () => {
  const store = useAuthContext();
  return {
    login: store.login,
    logout: store.logout,
    updateUser: store.updateUser,
    updatePreferences: store.updatePreferences
  };
};

export default AuthProvider;
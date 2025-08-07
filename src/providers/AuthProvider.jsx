import React, { createContext, use, useEffect } from 'react';
import { useAuthStore } from 'stores/authStore';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const authStore = useAuthStore();

  // Check for auth data on app initialization
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check if session is still valid
      if (authStore.isAuthenticated) {
        const isValid = authStore.checkSessionExpiry();
        if (!isValid) {
          console.log('🔐 Session expired, logging out user');
        }
      }

      // Look for auth tokens in localStorage (if using token-based auth)
      const token = localStorage.getItem('auth-token');
      const refreshToken = localStorage.getItem('refresh-token');
      
      if (token && !authStore.isAuthenticated) {
        // Attempt to restore session with stored token
        authStore.updateTokens(token, refreshToken);
        // In a real app, you'd validate the token with your backend
        console.log('🔐 Found stored auth tokens, attempting to restore session');
      }
    };

    checkAuthStatus();

    // Set up periodic session checks (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (authStore.isAuthenticated) {
        authStore.checkSessionExpiry();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [authStore]);

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
export const useAuthContext = () => {
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

export const useIsAuthenticated = () => {
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
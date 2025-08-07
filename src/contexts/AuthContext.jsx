import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStatus, useCurrentUser } from 'hooks/useAuth';

const AuthContext = createContext();
AuthContext.displayName = 'AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Use TanStack Query for auth status management
  const {
    user: authData,
    isAuthenticated,
    isLoading,
    error,
    refetch: verifyAuth,
  } = useCurrentUser({
    refetchInterval: 1000 * 10, // Check every 10 seconds
    refetchIntervalInBackground: false, // Only when tab is active
    refetchOnWindowFocus: true, // Check when window gains focus
  });

  // Handle authentication failures and redirects
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      console.log('Authentication expired');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login...');
        window.location.href = '/login';
      }
    }
  }, [isLoading, isAuthenticated, error]);

  // Handle auth verification errors
  useEffect(() => {
    if (error && window.location.pathname !== '/login') {
      console.error('Auth verification failed:', error);
      window.location.href = '/login';
    }
  }, [error]);

  const value = {
    isAuthenticated,
    user: authData?.user_id || null,
    charId: authData?.character_id || null,
    characterName: authData?.character_name || null,
    characters: authData?.characters || [],
    isLoading,
    verifyAuth,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';
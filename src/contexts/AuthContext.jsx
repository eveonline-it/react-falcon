import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStatus, useCurrentUser } from 'hooks/useAuth';
import { useAuthStore } from 'stores/authStore';
import { processEveAuthResponse } from 'utils/authUtils';

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
  const authStore = useAuthStore();
  
  // Use TanStack Query for auth status management
  const {
    user: authData,
    isAuthenticated: cookieAuth,
    isLoading,
    error,
    refetch: verifyAuth,
  } = useCurrentUser({
    refetchInterval: 1000 * 30, // Check every 30 seconds
    refetchIntervalInBackground: false, // Only when tab is active
    refetchOnWindowFocus: true, // Check when window gains focus
  });

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
          permissions: authData.permissions || [],
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
        console.log('➡️ Redirecting to login...');
        window.location.href = '/login';
      }
    }
  }, [isLoading, cookieAuth, error, authStore]);

  // Handle auth verification errors
  useEffect(() => {
    if (error && window.location.pathname !== '/login') {
      console.error('❌ Auth verification failed:', error);
      authStore.logout();
      window.location.href = '/login';
    }
  }, [error, authStore]);

  const value = {
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
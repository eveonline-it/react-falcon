import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkAuthStatus } from 'utils/auth';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [charId, setCharId] = useState(null)
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(Date.now());

  const verifyAuth = async () => {
    try {
      const {
        authenticated,
        user_id,
        character_id,
        character_name,
        characters,
      } = await checkAuthStatus();
      setIsAuthenticated(authenticated);
      setUser(user_id);
      setCharId(character_id);
      setLastCheck(Date.now());
      
      if (!authenticated) {
        console.log('Authentication expired');
        setUser(null);
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          console.log('Redirecting to login...');
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    // Initial auth check
    const initialCheck = async () => {
      await verifyAuth();
      setIsLoading(false);
    };
    
    initialCheck();

    // Set up periodic auth check every 10 seconds
    const interval = setInterval(() => {
      if (!document.hidden) { // Only check if tab is active
        verifyAuth();
      }
    }, 10000); // 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Check auth when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && Date.now() - lastCheck > 5000) {
        // Check auth if tab becomes visible and last check was > 5 seconds ago
        verifyAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastCheck]);

  const value = {
    isAuthenticated,
    user,
    charId,
    isLoading,
    verifyAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';
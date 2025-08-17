// Authentication utility functions
export const checkAuthStatus = async () => {
  try {
    const backendUrl = import.meta.env.VITE_EVE_BACKEND_URL;
    const response = await fetch(`${backendUrl}/auth/status`, {
      method: 'GET',
      credentials: 'include', // Include HttpOnly cookies
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
    // For utility function, we'll return failure state but also throw for error handling
    const authError = new Error('Auth status endpoint failed');
    authError.isAuthStatusFailure = true;
    authError.originalError = error;
    throw authError;
  }
};

export const isAuthenticated = () => {
  // For secure HttpOnly cookies, we need to check with backend
  // This is a sync version that should be used with React state
  // The actual check should be done async with checkAuthStatus()
  return true; // Temporarily return true, will be managed by React state
};

export const logout = async () => {
  try {
    const backendUrl = import.meta.env.VITE_EVE_BACKEND_URL;
    await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout request failed:', error);
  }

  // Redirect to login regardless of backend response
  window.location.href = '/login';
};

export const getAuthenticatedUser = () => {
  // This would typically decode a JWT or fetch user info from a cookie
  // For now, return a basic user object if authenticated
  if (isAuthenticated()) {
    return {
      isLoggedIn: true,
      // Add more user properties as needed from cookies/tokens
    };
  }
  return null;
};

// Temporary function to set auth cookie for testing
export const setTestAuthCookie = () => {
  document.cookie = 'falcon_auth_token=test_token_123; path=/; max-age=86400';
  console.log('Test auth cookie set');
};
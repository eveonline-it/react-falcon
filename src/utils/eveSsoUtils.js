/**
 * Simplified EVE Online SSO utility for React app
 * Backend handles all OAuth flow, state management, and token exchange
 */

/**
 * Get authorization URL from backend and redirect user
 * @param {string} backendUrl - Backend API URL
 * @returns {Promise<void>} Redirects to EVE Online SSO
 */
export const initiateEveLogin = async (backendUrl = import.meta.env.VITE_EVE_BACKEND_URL) => {
  const response = await fetch(`${backendUrl}/auth/eve/login`, {
    method: 'GET',
    credentials: 'include', // Include cookies for session management
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to get authorization URL from backend');
  }

  const data = await response.json();
  
  if (!data.auth_url) {
    throw new Error('No authorization URL received from backend');
  }

  // Redirect to EVE Online SSO
  window.location.href = data.auth_url;
};
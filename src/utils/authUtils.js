/**
 * Authentication utilities for EVE Online SSO integration
 */

import { useAuthStore } from 'stores/authStore';

/**
 * Process EVE Online authentication response and login user
 * @param {Object} authResponse - The authentication response from EVE backend
 * @returns {Promise<boolean>} - Success status
 */
export const processEveAuthResponse = async (authResponse) => {
  console.log('🔄 Processing EVE auth response:', authResponse);
  
  try {
    const {
      authenticated,
      character_id,
      character_name,
      characters,
      permissions,
      user_id
    } = authResponse;

    console.log('📋 Auth response data:', {
      authenticated,
      character_id,
      character_name,
      charactersCount: characters?.length,
      permissionsCount: permissions?.length,
      user_id
    });

    if (!authenticated) {
      console.error('❌ Authentication failed: User not authenticated');
      return false;
    }

    if (!characters || characters.length === 0) {
      console.error('❌ Authentication failed: No characters found');
      return false;
    }

    // Find the primary character (first in array or by character_id)
    const primaryCharacter = characters.find(char => char.character_id === character_id) || characters[0];
    
    if (!primaryCharacter) {
      console.error('❌ Authentication failed: No valid character found');
      return false;
    }

    console.log('👤 Primary character:', primaryCharacter.character_name);

    // Create user object with EVE Online character data
    const userData = {
      id: user_id,
      characterId: character_id,
      characterName: character_name,
      displayName: character_name,
      name: character_name,
      
      // Character details
      primaryCharacter: {
        character_id: primaryCharacter.character_id,
        character_name: primaryCharacter.character_name,
        scopes: primaryCharacter.scopes,
        created_at: primaryCharacter.created_at,
        updated_at: primaryCharacter.updated_at,
        valid: primaryCharacter.valid
      },
      
      // All characters associated with this account
      characters: characters.map(char => ({
        character_id: char.character_id,
        character_name: char.character_name,
        scopes: char.scopes,
        created_at: char.created_at,
        updated_at: char.updated_at,
        valid: char.valid
      })),
      
      // Additional metadata
      loginTime: new Date().toISOString(),
      characterCount: characters.length,
      validCharacters: characters.filter(char => char.valid).length
    };

    console.log('📦 Created user data:', userData);

    // Get the auth store and check initial state
    const authStore = useAuthStore.getState();
    console.log('🏪 Auth store before login:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      permissions: authStore.permissions?.length || 0
    });

    // Login user with the auth store
    console.log('🔐 Calling login function...');
    authStore.login(
      userData,
      null, // No token needed for this implementation
      null, // No refresh token needed
      'eve-online' // Login method
    );

    // Update permissions
    console.log('🔑 Updating permissions:', permissions?.length || 0, 'permissions');
    authStore.updatePermissions(permissions || []);

    // Check final state
    const finalState = useAuthStore.getState();
    console.log('🏪 Auth store after login:', {
      isAuthenticated: finalState.isAuthenticated,
      user: finalState.user?.characterName || 'No user',
      permissions: finalState.permissions?.length || 0
    });

    console.log('✅ EVE Online authentication successful:', {
      character: character_name,
      permissions: permissions?.length || 0,
      characters: characters.length
    });

    return finalState.isAuthenticated;
  } catch (error) {
    console.error('❌ Error processing EVE authentication:', error);
    const authStore = useAuthStore.getState();
    authStore.setError('Failed to process authentication response');
    return false;
  }
};

/**
 * Check if user has admin permissions
 * @returns {boolean}
 */
export const isAdmin = () => {
  const { permissions, hasPermission, hasAnyPermission } = useAuthStore.getState();
  
  return hasAnyPermission([
    'admin:*',
    '*:*',
    '*:admin'
  ]) || hasPermission('admin:admin');
};

/**
 * Check if user has specific EVE Online permissions
 * @param {string} scope - EVE ESI scope to check
 * @returns {boolean}
 */
export const hasEveScope = (scope) => {
  const { user } = useAuthStore.getState();
  
  if (!user?.primaryCharacter?.scopes) return false;
  
  return user.primaryCharacter.scopes.includes(scope);
};

/**
 * Get user's EVE Online characters
 * @returns {Array} Array of characters
 */
export const getUserCharacters = () => {
  const { user } = useAuthStore.getState();
  return user?.characters || [];
};

/**
 * Get user's primary character
 * @returns {Object|null} Primary character object
 */
export const getPrimaryCharacter = () => {
  const { user } = useAuthStore.getState();
  return user?.primaryCharacter || null;
};

/**
 * Check if any character is valid
 * @returns {boolean}
 */
export const hasValidCharacter = () => {
  const characters = getUserCharacters();
  return characters.some(char => char.valid);
};

/**
 * Format permissions for display
 * @returns {Object} Categorized permissions
 */
export const getFormattedPermissions = () => {
  const { permissions } = useAuthStore.getState();
  
  const categorized = {
    admin: [],
    public: [],
    alliance: [],
    corporation: [],
    user: [],
    system: [],
    other: []
  };

  permissions.forEach(permission => {
    const [category] = permission.split(':');
    
    if (categorized[category]) {
      categorized[category].push(permission);
    } else {
      categorized.other.push(permission);
    }
  });

  return {
    ...categorized,
    total: permissions.length,
    isAdmin: isAdmin()
  };
};

/**
 * Logout and clear EVE Online session
 */
export const logoutEveUser = () => {
  const authStore = useAuthStore.getState();
  authStore.logout();
  
  // Clear any EVE-specific localStorage items
  localStorage.removeItem('eve-character-id');
  localStorage.removeItem('eve-character-name');
  
  console.log('🔓 EVE Online user logged out');
};

export default {
  processEveAuthResponse,
  isAdmin,
  hasEveScope,
  getUserCharacters,
  getPrimaryCharacter,
  hasValidCharacter,
  getFormattedPermissions,
  logoutEveUser
};
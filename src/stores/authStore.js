import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createDevToolsConfig, createActionLogger, createPerformanceTracker } from './devtools';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  loginMethod: null, // 'eve-online', 'email', 'google', etc.
  sessionExpiry: null,
  permissions: [],
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true
  }
};

// Development helpers
const actionLogger = createActionLogger('Auth Store');
const performanceTracker = createPerformanceTracker('Auth Store');

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Authentication actions
        login: (userData, token, refreshToken, method = 'email') => {
          performanceTracker.start('login');
          const prevState = get();
          
          set(
            (state) => ({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              token,
              refreshToken,
              loginMethod: method,
              sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              permissions: userData.permissions || []
            }),
            false,
            'login'
          );

          performanceTracker.end('login');
          actionLogger('login', prevState, get());
        },

        logout: () => {
          performanceTracker.start('logout');
          const prevState = get();
          
          set(
            {
              ...initialState,
              preferences: get().preferences // Keep user preferences
            },
            false,
            'logout'
          );

          // Clear any stored auth data
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');

          performanceTracker.end('logout');
          actionLogger('logout', prevState, get());
        },

        // Loading states
        setLoading: (loading) =>
          set(
            { isLoading: loading },
            false,
            'setLoading'
          ),

        setError: (error) =>
          set(
            { error, isLoading: false },
            false,
            'setError'
          ),

        clearError: () =>
          set(
            { error: null },
            false,
            'clearError'
          ),

        // Token management
        updateTokens: (token, refreshToken) => {
          performanceTracker.start('updateTokens');
          const prevState = get();
          
          set(
            (state) => ({
              token,
              refreshToken,
              sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }),
            false,
            'updateTokens'
          );

          performanceTracker.end('updateTokens');
          actionLogger('updateTokens', prevState, get());
        },

        // User profile updates
        updateUser: (updates) => {
          performanceTracker.start('updateUser');
          const prevState = get();
          
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...updates } : null
            }),
            false,
            'updateUser'
          );

          performanceTracker.end('updateUser');
          actionLogger('updateUser', prevState, get());
        },

        updatePermissions: (permissions) =>
          set(
            { permissions },
            false,
            'updatePermissions'
          ),

        // User preferences
        updatePreferences: (preferences) => {
          performanceTracker.start('updatePreferences');
          const prevState = get();
          
          set(
            (state) => ({
              preferences: { ...state.preferences, ...preferences }
            }),
            false,
            'updatePreferences'
          );

          performanceTracker.end('updatePreferences');
          actionLogger('updatePreferences', prevState, get());
        },

        // Session management
        refreshSession: async () => {
          const state = get();
          if (!state.refreshToken) return false;

          set({ isLoading: true }, false, 'refreshSession:start');

          try {
            // This would typically call your API to refresh the token
            // For now, just extend the session
            set(
              (state) => ({
                isLoading: false,
                sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
              }),
              false,
              'refreshSession:success'
            );
            return true;
          } catch (error) {
            set(
              { error: 'Session refresh failed', isLoading: false },
              false,
              'refreshSession:error'
            );
            return false;
          }
        },

        checkSessionExpiry: () => {
          const state = get();
          if (!state.isAuthenticated || !state.sessionExpiry) return true;
          
          const isExpired = new Date() > new Date(state.sessionExpiry);
          if (isExpired) {
            get().logout();
          }
          return !isExpired;
        },

        // Utility actions
        resetAuthState: () =>
          set(
            initialState,
            false,
            'resetAuthState'
          ),

        // Selectors (derived state)
        hasPermission: (permission) => {
          const state = get();
          return state.permissions.includes(permission);
        },

        hasAnyPermission: (permissions) => {
          const state = get();
          return permissions.some(permission => state.permissions.includes(permission));
        },

        isSessionValid: () => {
          const state = get();
          if (!state.isAuthenticated) return false;
          if (!state.sessionExpiry) return true;
          return new Date() < new Date(state.sessionExpiry);
        },

        getUserDisplayName: () => {
          const state = get();
          if (!state.user) return 'Guest';
          return state.user.displayName || state.user.name || state.user.characterName || state.user.email || 'User';
        }
      }),
      {
        name: 'falcon-auth-storage',
        // Only persist essential auth data, not sensitive tokens
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          loginMethod: state.loginMethod,
          permissions: state.permissions,
          preferences: state.preferences
        })
      }
    ),
    createDevToolsConfig('auth-store')
  )
);

// Export individual action creators for easier testing and usage
export const authActions = {
  login: (userData, token, refreshToken, method) => 
    useAuthStore.getState().login(userData, token, refreshToken, method),
  logout: () => useAuthStore.getState().logout(),
  setLoading: (loading) => useAuthStore.getState().setLoading(loading),
  setError: (error) => useAuthStore.getState().setError(error),
  clearError: () => useAuthStore.getState().clearError(),
  updateTokens: (token, refreshToken) => useAuthStore.getState().updateTokens(token, refreshToken),
  updateUser: (updates) => useAuthStore.getState().updateUser(updates),
  updatePermissions: (permissions) => useAuthStore.getState().updatePermissions(permissions),
  updatePreferences: (preferences) => useAuthStore.getState().updatePreferences(preferences),
  refreshSession: () => useAuthStore.getState().refreshSession(),
  checkSessionExpiry: () => useAuthStore.getState().checkSessionExpiry(),
  resetAuthState: () => useAuthStore.getState().resetAuthState()
};

// Export selector hooks for easier component usage
export const useAuth = () => useAuthStore();
export const useAuthUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useUserPermissions = () => useAuthStore(state => state.permissions);
export const useUserPreferences = () => useAuthStore(state => state.preferences);
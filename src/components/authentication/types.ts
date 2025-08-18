/**
 * TypeScript interfaces for EVE Online authentication components
 */

import { ReactNode } from 'react';

// EVE Online SSO Types
export type EveLoginType = 'login' | 'register';

export interface EveCharacter {
  character_id: number;
  character_name: string;
  alliance_id?: number;
  corporation_id?: number;
}

export interface EveAuthData {
  authenticated: boolean;
  character_id: number;
  character_name: string;
  corporation_id?: number;
  alliance_id?: number;
  scopes?: string[];
  expires_on?: string;
  refresh_token?: string;
}

export interface EveAuthResponse {
  success: boolean;
  data?: EveAuthData;
  error?: string;
  message?: string;
}

// Error Handling Types
export interface EveErrorDetails {
  title: string;
  message: string;
  suggestion: string;
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  canRetry: boolean;
}

// Component Props Types
export interface EveOnlineLoginFormProps {
  backendUrl?: string;
  onError?: (error: Error) => void;
}

export interface EveSsoErrorHandlerProps {
  error: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[] | string[][];
  fallbackUrl?: string;
  loadingComponent?: ReactNode | null;
}

export interface PublicRouteProps {
  children: ReactNode;
  redirectUrl?: string;
}

export interface WithAuthOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[] | string[][];
  fallbackUrl?: string;
  loadingComponent?: ReactNode | null;
}

export interface EveAuthCallbackProps {
  // This component doesn't take any props directly
}

export interface EveLoginProps {
  // This component doesn't take any props directly
}

export interface ModalAuthProps {
  // This component doesn't take any props directly (placeholder component)
}

// Auth Store Types (for useAuthStore hook interface)
export interface AuthStoreState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: EveCharacter | null;
  permissions: string[];
}

export interface AuthStoreActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isSessionValid: () => boolean;
  login: (authData: EveAuthData) => void;
  logout: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

// Location State Types (for React Router navigation)
export interface NavigationState {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
    state?: any;
  };
  authData?: EveAuthData;
  requiredPermissions?: string[];
}

// Utility Function Types
export interface InitiateEveLoginParams {
  backendUrl: string;
  loginType: EveLoginType;
}

export interface ProcessEveAuthResponseResult {
  success: boolean;
  error?: string;
}
// Authentication Components - Barrel Exports
export { default as EveOnlineLoginForm } from './EveOnlineLoginForm';
export { default as EveSsoErrorHandler } from './EveSsoErrorHandler';
export { default as ProtectedRoute, PublicRoute, withAuth } from './ProtectedRoute';
export { default as EveAuthCallback } from './EveAuthCallback';

// Authentication Layout Components
export { default as EveLogin } from './card/EveLogin';
export { default as ModalAuth } from './modal/ModalAuth';

// Export TypeScript types for external usage
export type {
  EveLoginType,
  EveCharacter,
  EveAuthData,
  EveAuthResponse,
  EveErrorDetails,
  EveOnlineLoginFormProps,
  EveSsoErrorHandlerProps,
  ProtectedRouteProps,
  PublicRouteProps,
  WithAuthOptions,
  EveAuthCallbackProps,
  EveLoginProps,
  ModalAuthProps,
  AuthStoreState,
  AuthStoreActions,
  AuthStore,
  NavigationState,
  InitiateEveLoginParams,
  ProcessEveAuthResponseResult
} from './types';
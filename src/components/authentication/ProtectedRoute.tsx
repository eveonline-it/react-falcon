import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from 'stores/authStore';
import FalconLoader from 'components/common/FalconLoader';
import { ProtectedRouteProps, PublicRouteProps, WithAuthOptions } from './types';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredPermissions = [], 
  fallbackUrl = '/login',
  loadingComponent = null 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { 
    isAuthenticated, 
    isLoading, 
    hasPermission, 
    hasAnyPermission, 
    isSessionValid 
  } = useAuthStore();

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 ProtectedRoute check:', {
      location: location.pathname,
      requireAuth,
      isAuthenticated,
      isLoading,
      requiredPermissions
    });
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return loadingComponent || <FalconLoader />;
  }

  // Check if authentication is required
  if (requireAuth) {
    // Check if user is authenticated and session is valid
    if (!isAuthenticated || !isSessionValid()) {
      // Save the attempted location for redirect after login
      return <Navigate 
        to={fallbackUrl} 
        state={{ from: location }} 
        replace 
      />;
    }

    // Check permissions if required
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = Array.isArray(requiredPermissions[0])
        ? hasAnyPermission(requiredPermissions.flat()) // If nested array, flatten and check any
        : requiredPermissions.every(permission => hasPermission(permission)); // All permissions required

      if (!hasRequiredPermission) {
        // Redirect to 404 page (since no 403 page exists) or dashboard
        console.warn('❌ Access denied. Required permissions:', requiredPermissions);
        return <Navigate 
          to="/errors/404" 
          state={{ from: location, requiredPermissions }} 
          replace 
        />;
      }
    }
  }

  // If requireAuth is false, allow access regardless of auth status
  return <>{children}</>;
};

// Convenience component for public routes (redirect to dashboard if authenticated)
export const PublicRoute = ({ 
  children, 
  redirectUrl = '/dashboards/default' 
}: PublicRouteProps) => {
  const { isAuthenticated, isSessionValid } = useAuthStore();

  if (isAuthenticated && isSessionValid()) {
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
};

// Higher-order component for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>, 
  options: WithAuthOptions = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
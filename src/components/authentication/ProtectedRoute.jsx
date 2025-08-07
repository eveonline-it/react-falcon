import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from 'contexts/AuthContext';
import FalconLoader from 'components/common/FalconLoader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <FalconLoader />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
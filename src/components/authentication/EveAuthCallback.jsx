import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams, useLocation } from 'react-router';
import { processEveAuthResponse } from 'utils/authUtils';
import { useAuthStore } from 'stores/authStore';
import { Spinner, Alert, Card } from 'react-bootstrap';

/**
 * EVE Online Authentication Callback Handler
 * Processes auth response from backend and logs in the user
 */
const EveAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [authData, setAuthData] = useState(null);
  
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have auth data in location state (from backend redirect)
        if (location.state?.authData) {
          console.log('📥 Processing auth data from location state');
          await processAuthData(location.state.authData);
          return;
        }

        // Check URL parameters for auth data or error
        const error = searchParams.get('error');
        const authDataParam = searchParams.get('auth_data');
        
        if (error) {
          console.error('❌ Authentication error from URL:', error);
          setError(`Authentication failed: ${error}`);
          setProcessing(false);
          return;
        }

        if (authDataParam) {
          try {
            const authData = JSON.parse(decodeURIComponent(authDataParam));
            console.log('📥 Processing auth data from URL parameter');
            await processAuthData(authData);
            return;
          } catch (parseError) {
            console.error('❌ Failed to parse auth data:', parseError);
            setError('Invalid authentication data received');
            setProcessing(false);
            return;
          }
        }

        // If no auth data found, try to fetch from backend
        console.log('🔄 No auth data found, checking backend session...');
        await checkBackendSession();

      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        setError('Authentication processing failed');
        setProcessing(false);
      }
    };

    const processAuthData = async (authData) => {
      console.log('🔐 Processing EVE authentication data:', authData);
      setAuthData(authData);
      
      const success = await processEveAuthResponse(authData);
      
      if (success) {
        console.log('✅ Authentication successful, redirecting...');
        setProcessing(false);
      } else {
        setError('Failed to process authentication data');
        setProcessing(false);
      }
    };

    const checkBackendSession = async () => {
      try {
        const backendUrl = import.meta.env.VITE_EVE_BACKEND_URL || 'https://go.eveonline.it';
        const response = await fetch(`${backendUrl}/auth/status`, {
          credentials: 'include' // Include cookies for session
        });

        if (response.ok) {
          const authData = await response.json();
          if (authData.authenticated) {
            await processAuthData(authData);
            return;
          }
        }

        console.log('ℹ️ No active backend session found');
        setError('No active session found. Please login again.');
        setProcessing(false);

      } catch (error) {
        console.error('❌ Error checking backend session:', error);
        setError('Failed to verify authentication status');
        setProcessing(false);
      }
    };

    // Only run if not already authenticated
    if (!isAuthenticated) {
      handleAuthCallback();
    } else {
      setProcessing(false);
    }
  }, [searchParams, location.state, isAuthenticated]);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && !processing) {
    const returnUrl = location.state?.from?.pathname || '/dashboard/analytics';
    return <Navigate to={returnUrl} replace />;
  }

  // Show processing state
  if (processing) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Card className="text-center p-4" style={{ maxWidth: '400px' }}>
          <Card.Body>
            <Spinner animation="border" className="mb-3" />
            <h5>Processing EVE Online Authentication</h5>
            <p className="text-muted">
              Verifying your character and permissions...
            </p>
            {authData && (
              <div className="mt-3">
                <small className="text-success">
                  ✅ Character: {authData.character_name}
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Card className="text-center p-4" style={{ maxWidth: '400px' }}>
          <Card.Body>
            <Alert variant="danger">
              <h6>Authentication Failed</h6>
              <p className="mb-0">{error}</p>
            </Alert>
            <div className="mt-3">
              <a href="/login" className="btn btn-primary">
                Try Again
              </a>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Fallback - redirect to login
  return <Navigate to="/login" replace />;
};

export default EveAuthCallback;
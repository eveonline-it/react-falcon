import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';

/**
 * EVE SSO Error Handler Component
 * Handles different types of EVE Online SSO errors as per official documentation
 */
const EveSsoErrorHandler = ({ error, onRetry, onGoBack }) => {
  // Parse error type and provide appropriate user guidance
  const getErrorDetails = (errorMessage) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('access_denied')) {
      return {
        title: 'Authorization Denied',
        message: 'You denied access to your EVE Online character. This is required to proceed.',
        suggestion: 'Please try again and authorize the application to continue.',
        variant: 'warning',
        canRetry: true
      };
    }
    
    if (lowerError.includes('invalid_request')) {
      return {
        title: 'Invalid Request',
        message: 'The EVE Online SSO request was malformed.',
        suggestion: 'This appears to be a configuration issue. Please contact support.',
        variant: 'danger',
        canRetry: false
      };
    }
    
    if (lowerError.includes('invalid_client')) {
      return {
        title: 'Invalid Client Configuration',
        message: 'The EVE Online application configuration is invalid.',
        suggestion: 'Please check your EVE Online Client ID configuration.',
        variant: 'danger',
        canRetry: false
      };
    }
    
    if (lowerError.includes('invalid_grant') || lowerError.includes('authorization code')) {
      return {
        title: 'Authorization Code Invalid',
        message: 'The authorization code from EVE Online has expired or is invalid.',
        suggestion: 'Please try logging in again.',
        variant: 'warning',
        canRetry: true
      };
    }
    
    if (lowerError.includes('unsupported_response_type')) {
      return {
        title: 'Unsupported Response Type',
        message: 'The EVE Online SSO configuration uses an unsupported response type.',
        suggestion: 'This is a configuration error. Please contact support.',
        variant: 'danger',
        canRetry: false
      };
    }
    
    if (lowerError.includes('invalid_scope')) {
      return {
        title: 'Invalid Scope',
        message: 'The requested permissions are not valid.',
        suggestion: 'The application is requesting invalid permissions from EVE Online.',
        variant: 'danger',
        canRetry: false
      };
    }
    
    if (lowerError.includes('server_error')) {
      return {
        title: 'EVE Online Server Error',
        message: 'EVE Online SSO servers are experiencing issues.',
        suggestion: 'Please try again in a few minutes.',
        variant: 'warning',
        canRetry: true
      };
    }
    
    if (lowerError.includes('temporarily_unavailable')) {
      return {
        title: 'Service Temporarily Unavailable',
        message: 'EVE Online SSO service is temporarily unavailable.',
        suggestion: 'Please try again in a few minutes.',
        variant: 'warning',
        canRetry: true
      };
    }
    
    if (lowerError.includes('csrf') || lowerError.includes('state')) {
      return {
        title: 'Security Validation Failed',
        message: 'The login request failed security validation.',
        suggestion: 'This may indicate a security issue. Please try logging in again.',
        variant: 'danger',
        canRetry: true
      };
    }
    
    if (lowerError.includes('token verification failed')) {
      return {
        title: 'Token Verification Failed',
        message: 'Unable to verify your EVE Online character token.',
        suggestion: 'Please try logging in again.',
        variant: 'warning',
        canRetry: true
      };
    }
    
    if (lowerError.includes('client id not configured')) {
      return {
        title: 'Configuration Missing',
        message: 'EVE Online Client ID is not configured.',
        suggestion: 'Please contact an administrator to configure the EVE Online integration.',
        variant: 'info',
        canRetry: false
      };
    }
    
    // Default error handling
    return {
      title: 'Authentication Failed',
      message: 'An unexpected error occurred during EVE Online authentication.',
      suggestion: 'Please try again or contact support if the problem persists.',
      variant: 'danger',
      canRetry: true
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="text-center">
      <div className={`text-${errorDetails.variant} mb-3`}>
        <FontAwesomeIcon icon={faExclamationTriangle} className="fa-3x" />
      </div>
      
      <h5 className={`text-${errorDetails.variant}`}>{errorDetails.title}</h5>
      
      <Alert variant={errorDetails.variant} className="text-left mb-3">
        <p className="mb-2"><strong>{errorDetails.message}</strong></p>
        <p className="mb-0 small">{errorDetails.suggestion}</p>
      </Alert>
      
      <div className="d-flex gap-2 justify-content-center">
        {errorDetails.canRetry && onRetry && (
          <Button variant="primary" onClick={onRetry}>
            <FontAwesomeIcon icon={faRedo} className="me-2" />
            Try Again
          </Button>
        )}
        
        {onGoBack && (
          <Button variant="outline-secondary" onClick={onGoBack}>
            Go Back
          </Button>
        )}
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-3 text-left">
          <summary className="text-muted small">Technical Details</summary>
          <pre className="small text-muted mt-2">{error}</pre>
        </details>
      )}
    </div>
  );
};

export default EveSsoErrorHandler;
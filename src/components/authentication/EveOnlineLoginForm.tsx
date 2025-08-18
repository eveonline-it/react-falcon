import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { initiateEveLogin } from 'utils/eveSsoUtils';
import { useAuthStore } from 'stores/authStore';
import EveSsoErrorHandler from './EveSsoErrorHandler';
import { EveOnlineLoginFormProps, EveLoginType } from './types';

const EveOnlineLoginForm = ({ 
  backendUrl = import.meta.env.VITE_EVE_BACKEND_URL,
  onError 
}: EveOnlineLoginFormProps) => {
  const [localError, setLocalError] = useState('');
  const { setLoading, setError, clearError, isLoading, error } = useAuthStore();

  const handleEveLogin = async (loginType: EveLoginType = 'login') => {
    setLoading(true);
    clearError();
    setLocalError('');
    
    try {
      // Call backend to get auth URL and redirect
      await initiateEveLogin(backendUrl, loginType);
      // Note: This won't execute as initiateEveLogin redirects the page
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate login';
      setError(errorMessage);
      setLocalError(errorMessage);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form>
      {(error || localError) && (
        <div className="mb-3">
          <EveSsoErrorHandler 
            error={error || localError}
            onRetry={() => {
              clearError();
              setLocalError('');
              handleEveLogin();
            }}
          />
        </div>
      )}
      
      <Form.Group className="mb-3">
        <Button
          onClick={() => handleEveLogin('login')}
          disabled={isLoading}
          variant="primary"
          className="w-100 mb-2"
        >
          <FontAwesomeIcon
            icon={faUser}
            className="me-2"
          />
          Login with EVE Online
        </Button>
        
        <Button
          onClick={() => handleEveLogin('register')}
          disabled={isLoading}
          variant="outline-primary"
          className="w-100"
        >
          <FontAwesomeIcon
            icon={faUserPlus}
            className="me-2"
          />
          Register with Full ESI Scopes
        </Button>
      </Form.Group>
      
      <div className="text-center mt-3">
        <small className="text-muted">
          <strong>Login:</strong> Basic authentication without ESI scopes<br/>
          <strong>Register:</strong> Full ESI access for advanced features
        </small>
      </div>
    </Form>
  );
};

export default EveOnlineLoginForm;
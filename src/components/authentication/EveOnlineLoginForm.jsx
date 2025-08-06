import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpaceShuttle } from '@fortawesome/free-solid-svg-icons';
import { initiateEveLogin } from 'utils/eveSsoUtils';
import EveSsoErrorHandler from './EveSsoErrorHandler';

const EveOnlineLoginForm = ({ 
  backendUrl = import.meta.env.VITE_EVE_BACKEND_URL,
  onError 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEveLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Call backend to get auth URL and redirect
      await initiateEveLogin(backendUrl);
      // Note: This won't execute as initiateEveLogin redirects the page
      
    } catch (err) {
      setError(err.message || 'Failed to initiate EVE Online login');
      setIsLoading(false);
      if (onError) onError(err);
    }
  };

  return (
    <Form>
      {error && (
        <div className="mb-3">
          <EveSsoErrorHandler 
            error={error}
            onRetry={() => {
              setError('');
              handleEveLogin();
            }}
          />
        </div>
      )}
      
      <Form.Group className="mb-0">
        <Button
          onClick={handleEveLogin}
          disabled={isLoading}
          className="w-100 btn-eve-online"
          style={{
            backgroundColor: '#f39c12',
            borderColor: '#f39c12',
            color: '#fff'
          }}
        >
          <FontAwesomeIcon
            icon={faSpaceShuttle}
            className="me-2"
          />
          {isLoading ? 'Connecting...' : 'Login with EVE Online'}
        </Button>
      </Form.Group>
      
      <div className="text-center mt-3">
        <small className="text-muted">
          Login using your EVE Online character
        </small>
      </div>
    </Form>
  );
};

export default EveOnlineLoginForm;
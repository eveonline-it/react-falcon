import { Card } from 'react-bootstrap';
import EveOnlineLoginForm from 'components/authentication/EveOnlineLoginForm';
import AuthCardLayout from 'layouts/AuthCardLayout';
import { EveLoginProps } from '../types';

const EveLogin = (_props: EveLoginProps) => (
  <AuthCardLayout>
    <Card>
      <Card.Body className="p-4 p-sm-5">
        <div className="text-center mb-4">
          <h5>Login with EVE Online</h5>
          <p className="text-muted">Connect with your EVE Online character</p>
        </div>
        <EveOnlineLoginForm />
      </Card.Body>
    </Card>
  </AuthCardLayout>
);

export default EveLogin;
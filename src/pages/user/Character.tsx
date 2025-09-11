import React from 'react';
import { useParams } from 'react-router';
import {
  Col,
  Row,
  Card,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faCoins } from '@fortawesome/free-solid-svg-icons';
import ProfileBanner from './ProfileBanner';
import { CharacterPortrait } from 'components/common/eve';
import { useCharacter, useCharacterWallet } from 'hooks/useUserCharacters';

const CharacterBanner: React.FC<{ character: any }> = ({ character }) => {
  return (
    <ProfileBanner>
      <ProfileBanner.Header
        avatar={
          <CharacterPortrait characterId={character?.character_id} size={128} />
        }
        character={character}
      />
    </ProfileBanner>
  );
};


const CharacterStats: React.FC<{ wallet?: any }> = ({ wallet }) => {
  const formatISK = (balance: number) => {
    if (!balance) return 'N/A';
    if (balance >= 1e9) return `${(balance / 1e9).toFixed(2)}B ISK`;
    if (balance >= 1e6) return `${(balance / 1e6).toFixed(2)}M ISK`;
    if (balance >= 1e3) return `${(balance / 1e3).toFixed(2)}K ISK`;
    return `${balance.toFixed(2)} ISK`;
  };

  return (
    <Card className="mb-3">
      <Card.Header className="bg-body-tertiary">
        <h5 className="mb-0">Character Statistics</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col sm={6} className="mb-3">
            <div className="border-start border-4 border-primary ps-3">
              <h2 className="text-primary mb-0">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Loading...
              </h2>
              <p className="mb-0 text-600">Last Login</p>
            </div>
          </Col>
          <Col sm={6} className="mb-3">
            <div className="border-start border-4 border-success ps-3">
              <h2 className="text-success mb-0">
                <FontAwesomeIcon icon={faCoins} className="me-2" />
                {wallet ? formatISK(wallet.balance) : 'Loading...'}
              </h2>
              <p className="mb-0 text-600">Wallet Balance</p>
            </div>
          </Col>
        </Row>
        <div className="mt-3">
          <h6 className="text-700 mb-2">Status</h6>
          <Badge bg="success" className="me-2">
            Active
          </Badge>
          <Badge bg="primary" className="me-2">
            Authenticated
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

const Character: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const { data: character, isLoading, error } = useCharacter(characterId);
  const { data: wallet } = useCharacterWallet(characterId);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error loading character</Alert.Heading>
        <p>
          {error instanceof Error
            ? error.message
            : 'Failed to load character data'}
        </p>
      </Alert>
    );
  }

  if (!character) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Character not found</Alert.Heading>
        <p>The requested character could not be found.</p>
      </Alert>
    );
  }

  return (
    <>
      <CharacterBanner character={character} />
      <Row className="g-3 mb-3">
        <Col lg={8}>
          <CharacterStats wallet={wallet} />
        </Col>
        <Col lg={4}>
          <div className="sticky-sidebar">
            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <a
                    href={`https://zkillboard.com/character/${character.character_id}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    View on zKillboard
                  </a>
                  <a
                    href={`https://evewho.com/character/${character.character_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    View on EVE Who
                  </a>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header className="bg-body-tertiary">
                <h5 className="mb-0">Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-600 mb-0">
                  No recent activity data available.
                </p>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Character;

import React, { useState } from 'react';
import { useParams } from 'react-router';
import {
  Col,
  Row,
  Card,
  Spinner,
  Alert,
  Collapse,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCoins,
  faBrain,
  faCopy,
  faBuilding,
  faRocket,
  faHome,
  faChevronDown,
  faChevronRight,
  faMicrochip
} from '@fortawesome/free-solid-svg-icons';
import ProfileBanner from './ProfileBanner';
import { CharacterPortrait } from 'components/common/eve';
import {
  useCharacter,
  useCharacterWallet,
  useCharacterSkills,
  useCharacterClones
} from 'hooks/useUserCharacters';

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

const CharacterStats: React.FC<{ wallet?: any; skills?: any }> = ({
  wallet,
  skills
}) => {
  const formatISK = (balance: number) => {
    if (!balance) return 'N/A';
    if (balance >= 1e9) return `${(balance / 1e9).toFixed(2)}B ISK`;
    if (balance >= 1e6) return `${(balance / 1e6).toFixed(2)}M ISK`;
    if (balance >= 1e3) return `${(balance / 1e3).toFixed(2)}K ISK`;
    return `${balance.toFixed(2)} ISK`;
  };

  const formatSkillPoints = (skillpoints: number) => {
    if (!skillpoints) return 'N/A';
    if (skillpoints >= 1e6) return `${(skillpoints / 1e6).toFixed(1)}M SP`;
    if (skillpoints >= 1e3) return `${(skillpoints / 1e3).toFixed(0)}K SP`;
    return `${skillpoints.toLocaleString()} SP`;
  };

  return (
    <Card className="mb-3">
      <Card.Header className="bg-body-tertiary">
        <h5 className="mb-0">Character Statistics</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col sm={6} className="mb-3">
            <div className="border-start border-4 border-success ps-3">
              <h2 className="text-success mb-0">
                <FontAwesomeIcon icon={faCoins} className="me-2" />
                {wallet ? formatISK(wallet.balance) : 'Loading...'}
              </h2>
              <p className="mb-0 text-600">Wallet Balance</p>
            </div>
          </Col>
          <Col sm={6} className="mb-3">
            <div className="border-start border-4 border-info ps-3">
              <h2 className="text-info mb-0">
                <FontAwesomeIcon icon={faBrain} className="me-2" />
                {skills ? formatSkillPoints(skills.total_sp) : 'Loading...'}
              </h2>
              <p className="mb-0 text-600">Total Skillpoints</p>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const Character: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const { data: character, isLoading, error } = useCharacter(characterId);
  const { data: wallet } = useCharacterWallet(characterId);
  const { data: skills } = useCharacterSkills(characterId);
  const { data: clones } = useCharacterClones(characterId);
  const [expandedClones, setExpandedClones] = useState<Set<string>>(new Set());

  const getLocationImageUrl = (locationTypeId: number) => {
    return `https://images.evetech.net/types/${locationTypeId}/icon?size=32`;
  };

  const getLocationFallbackIcon = (locationType: string) => {
    switch (locationType?.toLowerCase()) {
      case 'station':
        return faBuilding;
      case 'structure':
        return faRocket;
      case 'solar_system':
        return faHome;
      default:
        return faBuilding;
    }
  };

  const toggleCloneExpansion = (cloneId: string) => {
    const newExpanded = new Set(expandedClones);
    if (newExpanded.has(cloneId)) {
      newExpanded.delete(cloneId);
    } else {
      newExpanded.add(cloneId);
    }
    setExpandedClones(newExpanded);
  };

  const truncateLocationName = (name: string, maxLength: number = 35) => {
    if (!name) return '';
    return name.length > maxLength ? `${name.substring(0, maxLength)}..` : name;
  };

  const LocationIcon: React.FC<{
    locationTypeId?: number;
    locationType: string;
    className?: string;
  }> = ({ locationTypeId, locationType, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    if (!locationTypeId || imageError) {
      return (
        <FontAwesomeIcon
          icon={getLocationFallbackIcon(locationType)}
          className={className}
          size="sm"
        />
      );
    }

    return (
      <img
        src={getLocationImageUrl(locationTypeId)}
        alt={locationType}
        className={className}
        style={{ width: '20px', height: '20px' }}
        onError={() => setImageError(true)}
      />
    );
  };

  const ImplantIcon: React.FC<{
    typeId?: number;
    className?: string;
  }> = ({ typeId, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    if (!typeId || imageError) {
      return (
        <FontAwesomeIcon icon={faMicrochip} className={className} size="xs" />
      );
    }

    return (
      <img
        src={`https://images.evetech.net/types/${typeId}/icon?size=32`}
        alt="Implant"
        className={className}
        style={{ width: '16px', height: '16px' }}
        onError={() => setImageError(true)}
      />
    );
  };

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
          <CharacterStats wallet={wallet} skills={skills} />
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
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faCopy} className="me-2" />
                  Clones
                </h5>
              </Card.Header>
              <Card.Body>
                {clones ? (
                  <>
                    {clones.home_location && (
                      <div className="mb-3">
                        <small className="text-700 mb-2 d-block">
                          Home Station
                        </small>
                        <div className="d-flex align-items-center">
                          <LocationIcon
                            locationTypeId={
                              clones.home_location.location_type_id
                            }
                            locationType={
                              clones.home_location.location_type || 'station'
                            }
                            className="me-2"
                          />
                          <div className="flex-grow-1">
                            <small className="text-600">
                              {truncateLocationName(
                                clones.home_location.location_name
                              )}
                            </small>
                          </div>
                        </div>
                      </div>
                    )}

                    {clones.jump_clones && clones.jump_clones.length > 0 ? (
                      <>
                        <small className="text-700 mb-2 d-block">
                          Jump Clones
                        </small>
                        {clones.jump_clones.map((clone: any, index: number) => {
                          const cloneId = `jump-${clone.jump_clone_id || index}`;
                          const isExpanded = expandedClones.has(cloneId);
                          return (
                            <div key={cloneId} className="mb-2">
                              <div
                                className="d-flex align-items-center cursor-pointer py-1"
                                onClick={() => toggleCloneExpansion(cloneId)}
                                style={{ cursor: 'pointer' }}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    isExpanded ? faChevronDown : faChevronRight
                                  }
                                  className="me-2 text-500"
                                  size="xs"
                                />
                                <LocationIcon
                                  locationTypeId={clone.location_type_id}
                                  locationType={clone.location_type}
                                  className="me-2"
                                />
                                <div className="flex-grow-1">
                                  <small className="text-600 d-block">
                                    {truncateLocationName(
                                      clone.location_name ||
                                        `Clone ${index + 1}`
                                    )}
                                  </small>
                                </div>
                              </div>

                              <Collapse in={isExpanded}>
                                <div className="ms-4 mt-1 mb-2">
                                  {clone.implants &&
                                  clone.implants.length > 0 ? (
                                    <>
                                      <small className="text-700 d-block mb-1">
                                        <FontAwesomeIcon
                                          icon={faMicrochip}
                                          className="me-1"
                                        />
                                        Implants ({clone.implants.length})
                                      </small>
                                      {clone.implants.map(
                                        (
                                          implant: any,
                                          implantIndex: number
                                        ) => (
                                          <div
                                            key={implantIndex}
                                            className="ms-3 d-flex align-items-center mb-1"
                                          >
                                            <ImplantIcon
                                              typeId={implant.type_id}
                                              className="me-2"
                                            />
                                            <OverlayTrigger
                                              placement="top"
                                              overlay={
                                                <Tooltip
                                                  id={`implant-tooltip-${implantIndex}`}
                                                >
                                                  {implant.description ||
                                                    'No description available'}
                                                </Tooltip>
                                              }
                                            >
                                              <small
                                                className="text-600"
                                                style={{ cursor: 'pointer' }}
                                              >
                                                {implant.name ||
                                                  `Implant ${implantIndex + 1}`}
                                              </small>
                                            </OverlayTrigger>
                                          </div>
                                        )
                                      )}
                                    </>
                                  ) : (
                                    <small className="text-500 ms-3">
                                      No implants
                                    </small>
                                  )}
                                </div>
                              </Collapse>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <small className="text-600 mb-0">
                        No jump clones found.
                      </small>
                    )}
                  </>
                ) : (
                  <small className="text-600 mb-0">Loading clone data...</small>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Character;

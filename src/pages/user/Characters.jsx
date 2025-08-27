import React, { useState, useCallback, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Form, Spinner,
  Alert, Badge, Modal, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faGripVertical, faEye, faSync, faExclamationTriangle,
  faUser, faBuilding, faGlobe, faInfoCircle, faSave,
  faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { CharacterPortrait, CorporationLogo, AllianceLogo } from 'components/common';
import { useCurrentUser } from 'hooks/auth';
import { useUserCharacters, useUpdateCharacterPositions } from 'hooks/useUserCharacters';

// Drag and Drop functionality using HTML5 API
const DraggableRow = ({ character, index, onDragStart, onDragEnd, onDragOver, onDrop, isDragging, onViewDetails }) => {
  const handleDragStart = (e) => {
    onDragStart(index, character);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    onDrop(index);
  };

  return (
    <tr
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        backgroundColor: isDragging ? '#f8f9fa' : undefined
      }}
    >
      <td className="py-2 align-middle" style={{ width: '40px' }}>
        <FontAwesomeIcon 
          icon={faGripVertical} 
          className="text-muted" 
          title="Drag to reorder"
        />
      </td>
      <td className="py-2 align-middle">
        <div className="d-flex align-items-center">
          <div className="me-2" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            {character.character_id ? (
              <CharacterPortrait 
                characterId={character.character_id}
                characterName={character.character_name}
                size={32}
              />
            ) : (
              <div 
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                style={{ 
                  width: '32px', 
                  height: '32px'
                }}
              >
                <FontAwesomeIcon icon={faUser} className="text-white" size="sm" />
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold">{character.character_name}</div>
            <small className="text-muted">ID: {character.character_id}</small>
          </div>
        </div>
      </td>
      <td className="py-2 align-middle d-none d-md-table-cell">
        <div className="d-flex align-items-center">
          {(character.corporation_id || character.corporation?.corporation_id) && (
            <div className="me-2" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
              <CorporationLogo 
                corporationId={character.corporation_id || character.corporation?.corporation_id}
                corporationName={character.corporation_name || character.corporation?.name}
                size={24}
              />
            </div>
          )}
          <div className="d-flex flex-column text-truncate" style={{ maxWidth: '130px' }}>
            <span>{character.corporation_name || character.corporation?.name || '-'}</span>
            {(character.corporation_ticker || character.corporation?.ticker) && (
              <small className="text-muted">[{character.corporation_ticker || character.corporation?.ticker}]</small>
            )}
          </div>
        </div>
      </td>
      <td className="py-2 align-middle d-none d-lg-table-cell">
        <div className="d-flex align-items-center">
          {(character.alliance_id || character.alliance?.alliance_id) && (
            <div className="me-2" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
              <AllianceLogo 
                allianceId={character.alliance_id || character.alliance?.alliance_id}
                allianceName={character.alliance_name || character.alliance?.name}
                size={24}
              />
            </div>
          )}
          <div className="d-flex flex-column text-truncate" style={{ maxWidth: '130px' }}>
            <span>{character.alliance_name || character.alliance?.name || '-'}</span>
            {(character.alliance_ticker || character.alliance?.ticker) && (
              <small className="text-muted">[{character.alliance_ticker || character.alliance?.ticker}]</small>
            )}
          </div>
        </div>
      </td>
      <td className="py-2 align-middle">
        <Button
          variant="outline-info"
          size="sm"
          onClick={() => onViewDetails(character)}
          title="View Details"
        >
          <FontAwesomeIcon icon={faEye} size="xs" />
        </Button>
      </td>
    </tr>
  );
};

const Characters = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const [dragState, setDragState] = useState({
    draggedIndex: null,
    draggedCharacter: null,
    dragOverIndex: null
  });
  const [characters, setCharacters] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const userId = user?.user_id;
  
  const { 
    data: charactersData, 
    isLoading, 
    error, 
    refetch 
  } = useUserCharacters(userId, {
    enabled: isAuthenticated && !!userId
  });
  
  const updatePositionsMutation = useUpdateCharacterPositions();
  
  // Update local state when data changes
  React.useEffect(() => {
    if (charactersData) {
      const sortedCharacters = [...charactersData].sort((a, b) => (a.position || 0) - (b.position || 0));
      setCharacters(sortedCharacters);
      setHasUnsavedChanges(false);
    }
  }, [charactersData]);

  const handleDragStart = useCallback((index, character) => {
    setDragState({
      draggedIndex: index,
      draggedCharacter: character,
      dragOverIndex: null
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedIndex: null,
      draggedCharacter: null,
      dragOverIndex: null
    });
  }, []);

  const handleDragOver = useCallback((index) => {
    setDragState(prev => ({
      ...prev,
      dragOverIndex: index
    }));
  }, []);

  const handleDrop = useCallback((dropIndex) => {
    const { draggedIndex } = dragState;
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newCharacters = [...characters];
    const draggedCharacter = newCharacters[draggedIndex];
    
    // Remove dragged item
    newCharacters.splice(draggedIndex, 1);
    
    // Insert at new position
    const actualDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newCharacters.splice(actualDropIndex, 0, draggedCharacter);
    
    // Update positions
    const updatedCharacters = newCharacters.map((char, idx) => ({
      ...char,
      position: idx + 1
    }));
    
    setCharacters(updatedCharacters);
    setHasUnsavedChanges(true);
  }, [characters, dragState]);

  const handleSavePositions = async () => {
    try {
      const positionUpdates = characters.map((char, idx) => ({
        character_id: char.character_id,
        position: idx + 1
      }));
      
      await updatePositionsMutation.mutateAsync({
        userId,
        updates: positionUpdates
      });
      
      setHasUnsavedChanges(false);
      toast.success('Character positions updated successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to update character positions');
    }
  };

  const handleViewDetails = useCallback((character) => {
    setSelectedCharacter(character);
    setShowDetailsModal(true);
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (authLoading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          You must be logged in to view your characters.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          Failed to load characters: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              My Characters
              {characters.length > 0 && (
                <Badge bg="secondary" className="ms-2">
                  {characters.length}
                </Badge>
              )}
            </h1>
            <div>
              {hasUnsavedChanges && (
                <Button
                  variant="success"
                  size="sm"
                  className="me-2"
                  onClick={handleSavePositions}
                  disabled={updatePositionsMutation.isPending}
                >
                  {updatePositionsMutation.isPending ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-1" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-1" />
                      Save Order
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={refetch}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faSync} className="me-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card>
            <Card.Body>
              {hasUnsavedChanges && (
                <Alert variant="info" className="mb-3">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  You have unsaved changes. Don't forget to save your new character order!
                </Alert>
              )}
              
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : characters.length === 0 ? (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No characters found for your account.
                </Alert>
              ) : (
                <>
                  <div className="mb-3">
                    <small className="text-muted">
                      <FontAwesomeIcon icon={faGripVertical} className="me-1" />
                      Drag rows to reorder your characters
                    </small>
                  </div>
                  
                  <Table 
                    hover 
                    responsive 
                    size="sm" 
                    className="small"
                    style={{ userSelect: 'none' }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Character</th>
                        <th className="d-none d-md-table-cell">Corporation</th>
                        <th className="d-none d-lg-table-cell">Alliance</th>
                        <th style={{ width: '80px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {characters.map((character, index) => (
                        <DraggableRow
                          key={character.character_id}
                          character={character}
                          index={index}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          isDragging={dragState.draggedIndex === index}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Character Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Character Details - {selectedCharacter?.character_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCharacter && (
            <>
              <div className="text-center mb-4">
                <div style={{ border: '3px solid #dee2e6', borderRadius: '50%', display: 'inline-block' }}>
                  <CharacterPortrait 
                    characterId={selectedCharacter.character_id}
                    characterName={selectedCharacter.character_name}
                    size={128}
                  />
                </div>
                <div className="mt-2">
                  <h5 className="mb-1">{selectedCharacter.character_name}</h5>
                  {(selectedCharacter.corporation_name || selectedCharacter.corporation?.name) && (
                    <div className="d-flex align-items-center justify-content-center mb-1">
                      {(selectedCharacter.corporation_id || selectedCharacter.corporation?.corporation_id) && (
                        <CorporationLogo 
                          corporationId={selectedCharacter.corporation_id || selectedCharacter.corporation?.corporation_id}
                          corporationName={selectedCharacter.corporation_name || selectedCharacter.corporation?.name}
                          size={20}
                        />
                      )}
                      <small className="text-muted ms-2">
                        {selectedCharacter.corporation_name || selectedCharacter.corporation?.name}
                        {(selectedCharacter.corporation_ticker || selectedCharacter.corporation?.ticker) && (
                          <span> [{selectedCharacter.corporation_ticker || selectedCharacter.corporation?.ticker}]</span>
                        )}
                      </small>
                    </div>
                  )}
                  {(selectedCharacter.alliance_name || selectedCharacter.alliance?.name) && (
                    <div className="d-flex align-items-center justify-content-center">
                      {(selectedCharacter.alliance_id || selectedCharacter.alliance?.alliance_id) && (
                        <AllianceLogo 
                          allianceId={selectedCharacter.alliance_id || selectedCharacter.alliance?.alliance_id}
                          allianceName={selectedCharacter.alliance_name || selectedCharacter.alliance?.name}
                          size={18}
                        />
                      )}
                      <small className="text-muted ms-2">
                        {selectedCharacter.alliance_name || selectedCharacter.alliance?.name}
                        {(selectedCharacter.alliance_ticker || selectedCharacter.alliance?.ticker) && (
                          <span> [{selectedCharacter.alliance_ticker || selectedCharacter.alliance?.ticker}]</span>
                        )}
                      </small>
                    </div>
                  )}
                </div>
              </div>
              
              <Row>
                <Col md={6}>
                  <h6>Character Information</h6>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Character ID:</strong></td>
                        <td>{selectedCharacter.character_id}</td>
                      </tr>
                      <tr>
                        <td><strong>Corporation:</strong></td>
                        <td>
                          {(selectedCharacter.corporation_name || selectedCharacter.corporation?.name) ? (
                            <div className="d-flex align-items-center">
                              {(selectedCharacter.corporation_id || selectedCharacter.corporation?.corporation_id) && (
                                <CorporationLogo 
                                  corporationId={selectedCharacter.corporation_id || selectedCharacter.corporation?.corporation_id}
                                  corporationName={selectedCharacter.corporation_name || selectedCharacter.corporation?.name}
                                  size={16}
                                  className="me-2"
                                />
                              )}
                              <span>
                                {selectedCharacter.corporation_name || selectedCharacter.corporation?.name}
                                {(selectedCharacter.corporation_ticker || selectedCharacter.corporation?.ticker) && (
                                  <small className="text-muted ms-1">[{selectedCharacter.corporation_ticker || selectedCharacter.corporation?.ticker}]</small>
                                )}
                              </span>
                            </div>
                          ) : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Alliance:</strong></td>
                        <td>
                          {(selectedCharacter.alliance_name || selectedCharacter.alliance?.name) ? (
                            <div className="d-flex align-items-center">
                              {(selectedCharacter.alliance_id || selectedCharacter.alliance?.alliance_id) && (
                                <AllianceLogo 
                                  allianceId={selectedCharacter.alliance_id || selectedCharacter.alliance?.alliance_id}
                                  allianceName={selectedCharacter.alliance_name || selectedCharacter.alliance?.name}
                                  size={16}
                                  className="me-2"
                                />
                              )}
                              <span>
                                {selectedCharacter.alliance_name || selectedCharacter.alliance?.name}
                                {(selectedCharacter.alliance_ticker || selectedCharacter.alliance?.ticker) && (
                                  <small className="text-muted ms-1">[{selectedCharacter.alliance_ticker || selectedCharacter.alliance?.ticker}]</small>
                                )}
                              </span>
                            </div>
                          ) : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Type:</strong></td>
                        <td>
                          <Badge bg={selectedCharacter.position === 1 ? 'success' : 'secondary'}>
                            {selectedCharacter.position === 1 ? 'MAIN' : 'ALT'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h6>Account Information</h6>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Position:</strong></td>
                        <td>{selectedCharacter.position || '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>Added:</strong></td>
                        <td>{formatDateTime(selectedCharacter.created_at)}</td>
                      </tr>
                      <tr>
                        <td><strong>Last Updated:</strong></td>
                        <td>{formatDateTime(selectedCharacter.updated_at)}</td>
                      </tr>
                      <tr>
                        <td><strong>Active:</strong></td>
                        <td>
                          <Badge bg={selectedCharacter.is_active ? 'success' : 'secondary'}>
                            <FontAwesomeIcon 
                              icon={selectedCharacter.is_active ? faCheckCircle : faTimesCircle} 
                              className="me-1" 
                            />
                            {selectedCharacter.is_active ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Characters;
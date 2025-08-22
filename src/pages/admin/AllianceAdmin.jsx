import React, { useState, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, Modal, InputGroup, Spinner, Badge,
  OverlayTrigger, Tooltip, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faTrash, faGripVertical,
  faShieldAlt, faCheckCircle, faTimesCircle, faExclamationTriangle,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-toastify';

import {
  useManagedAlliances,
  useSearchAlliances,
  useAllianceInfo,
  useAddManagedAlliance,
  useUpdateAllianceStatus,
  useRemoveManagedAlliance,
  useBulkUpdateAlliances,
  useAllianceHealth
} from 'hooks/useAlliances';

// Draggable Alliance Card Component
const SortableAllianceCard = ({ alliance, onToggleStatus, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: alliance.alliance_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AllianceCard
        alliance={alliance}
        onToggleStatus={onToggleStatus}
        onRemove={onRemove}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

// Alliance Card Component
const AllianceCard = ({ 
  alliance, 
  onToggleStatus, 
  onRemove, 
  dragAttributes, 
  dragListeners, 
  isDragging = false 
}) => {
  const getAllianceLogoUrl = (allianceId) => {
    return `https://images.evetech.net/alliances/${allianceId}/logo?tenant=tranquility&size=128`;
  };

  return (
    <Card className={`mb-3 ${isDragging ? 'shadow' : ''}`} style={{ cursor: isDragging ? 'grabbing' : 'default' }}>
      <Card.Body>
        <div className="d-flex align-items-start">
          {/* Drag Handle */}
          <div 
            className="me-3 text-muted" 
            style={{ cursor: 'grab' }}
            {...dragAttributes}
            {...dragListeners}
          >
            <FontAwesomeIcon icon={faGripVertical} size="lg" />
          </div>

          {/* Alliance Logo */}
          <div className="me-3">
            <img
              src={getAllianceLogoUrl(alliance.alliance_id)}
              alt={`${alliance.name} logo`}
              width="64"
              height="64"
              className="rounded"
              onError={(e) => {
                e.target.src = '/assets/img/generic/alliance-placeholder.png';
              }}
            />
          </div>

          {/* Alliance Info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <h5 className="mb-0 me-2">{alliance.name}</h5>
              <Badge 
                bg={alliance.enabled ? 'success' : 'secondary'}
                className="me-2"
              >
                {alliance.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {alliance.ticker && (
                <Badge bg="info" className="me-2">
                  &lt;{alliance.ticker}&gt;
                </Badge>
              )}
            </div>
            
            {alliance.description && (
              <p className="text-muted small mb-2">{alliance.description}</p>
            )}
            
            <div className="small text-muted">
              <div>Alliance ID: {alliance.alliance_id}</div>
              {alliance.corporation_count && (
                <div>Corporations: {alliance.corporation_count.toLocaleString()}</div>
              )}
              {alliance.added_at && (
                <div>Added: {new Date(alliance.added_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{alliance.enabled ? 'Disable' : 'Enable'} Alliance</Tooltip>}
            >
              <Button
                variant={alliance.enabled ? 'outline-warning' : 'outline-success'}
                size="sm"
                onClick={() => onToggleStatus(alliance.alliance_id, !alliance.enabled)}
              >
                <FontAwesomeIcon 
                  icon={alliance.enabled ? faTimesCircle : faCheckCircle} 
                />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Remove Alliance</Tooltip>}
            >
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onRemove(alliance)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </OverlayTrigger>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Search Results Component
const AllianceSearchResults = ({ results, onAddAlliance, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" className="me-2" />
        Searching alliances...
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-3 text-muted">
        No alliances found. Try a different search term.
      </div>
    );
  }

  return (
    <ListGroup className="mt-2">
      {results.slice(0, 10).map((alliance) => (
        <ListGroup.Item 
          key={alliance.alliance_id}
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <img
              src={`https://images.evetech.net/alliances/${alliance.alliance_id}/logo?tenant=tranquility&size=32`}
              alt={`${alliance.name} logo`}
              width="32"
              height="32"
              className="rounded me-3"
              onError={(e) => {
                e.target.src = '/assets/img/generic/alliance-placeholder.png';
              }}
            />
            <div>
              <div className="fw-medium">{alliance.name}</div>
              {alliance.ticker && (
                <small className="text-muted">&lt;{alliance.ticker}&gt;</small>
              )}
            </div>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onAddAlliance(alliance)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Add
          </Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

const AllianceAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [allianceToRemove, setAllianceToRemove] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [optimisticAlliances, setOptimisticAlliances] = useState(null);

  // API hooks
  const { data: alliancesData, error, refetch } = useManagedAlliances();
  const { data: searchResults, isLoading: searchLoading } = useSearchAlliances(searchQuery);
  const { data: healthData, isLoading: healthLoading } = useAllianceHealth();
  
  const addAllianceMutation = useAddManagedAlliance();
  const updateStatusMutation = useUpdateAllianceStatus();
  const removeAllianceMutation = useRemoveManagedAlliance();
  const bulkUpdateMutation = useBulkUpdateAlliances();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const alliances = optimisticAlliances || alliancesData?.alliances || [];

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const currentAlliances = optimisticAlliances || alliancesData?.alliances || [];
      const oldIndex = currentAlliances.findIndex(alliance => alliance.alliance_id === active.id);
      const newIndex = currentAlliances.findIndex(alliance => alliance.alliance_id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        console.error('Could not find alliance indices for drag operation');
        return;
      }
      
      // Immediately update UI with new order
      const reorderedAlliances = arrayMove(currentAlliances, oldIndex, newIndex);
      setOptimisticAlliances(reorderedAlliances);
      
      // Prepare data for backend with 1-based positions
      const alliancesWithOrder = reorderedAlliances.map((alliance, index) => ({
        alliance_id: alliance.alliance_id,
        name: alliance.name,
        enabled: alliance.enabled,
        position: index + 1 // API expects 1-based positions
      }));
      
      // Verify with backend
      bulkUpdateMutation.mutate(alliancesWithOrder, {
        onSuccess: () => {
          // Backend confirmed - delay clearing optimistic state for smooth transition
          setTimeout(() => {
            setOptimisticAlliances(null);
          }, 500);
        },
        onError: () => {
          // Backend rejected - restore original data immediately
          setOptimisticAlliances(null);
          refetch();
        }
      });
    }
  }, [optimisticAlliances, alliancesData, bulkUpdateMutation, refetch]);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // Handle adding alliance
  const handleAddAlliance = async (alliance) => {
    try {
      await addAllianceMutation.mutateAsync({
        alliance_id: alliance.alliance_id,
        name: alliance.name,
        enabled: true,
        position: alliances.length + 1
      });
      setSearchQuery(''); // Clear search after adding
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (allianceId, enabled) => {
    try {
      await updateStatusMutation.mutateAsync({ allianceId, enabled });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle remove alliance
  const handleRemoveAlliance = (alliance) => {
    setAllianceToRemove(alliance);
    setShowRemoveModal(true);
  };

  const confirmRemoveAlliance = async () => {
    if (allianceToRemove) {
      const allianceId = allianceToRemove.alliance_id;
      if (!allianceId || allianceId === 0) {
        toast.error('Invalid alliance ID. Cannot remove alliance.');
        return;
      }
      
      try {
        await removeAllianceMutation.mutateAsync(allianceId);
        setShowRemoveModal(false);
        setAllianceToRemove(null);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  // Find active alliance for drag overlay
  const activeAlliance = alliances.find(alliance => alliance.alliance_id === activeId);

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
              Alliance Management
            </h2>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" onClick={refetch}>
                <FontAwesomeIcon icon={faSyncAlt} className="me-1" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Health Status */}
      <Row className="mb-3">
        <Col>
          {healthLoading ? (
            <Alert variant="info">
              <Spinner animation="border" size="sm" className="me-2" />
              Checking alliance service health...
            </Alert>
          ) : optimisticAlliances && bulkUpdateMutation.isPending ? (
            <Alert variant="info">
              <Spinner animation="border" size="sm" className="me-2" />
              Saving new order...
            </Alert>
          ) : error ? (
            <Alert variant="danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Error loading alliances: {error.message}
            </Alert>
          ) : healthData ? (
            <Alert variant={healthData.health === 'healthy' ? 'success' : 'warning'}>
              <FontAwesomeIcon 
                icon={healthData.health === 'healthy' ? faCheckCircle : faExclamationTriangle} 
                className="me-2" 
              />
              Alliance Service: {healthData.health === 'healthy' ? 'Healthy' : 'Warning'}
              {healthData.message && <span className="ms-2">- {healthData.message}</span>}
            </Alert>
          ) : null}
        </Col>
      </Row>

      {/* Search Section */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Add New Alliance
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search alliances (minimum 3 characters)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              
              {searchQuery.length >= 3 && (
                <AllianceSearchResults
                  results={searchResults?.alliances || []}
                  onAddAlliance={handleAddAlliance}
                  isLoading={searchLoading}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alliances Grid */}
      <Row>
        <Col>
          {alliances.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon={faShieldAlt} size="3x" className="text-muted mb-3" />
                <h4 className="text-muted">No Alliances Found</h4>
                <p className="text-muted">
                  Use the search above to add alliances to manage.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className={optimisticAlliances ? 'opacity-75' : ''}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
              <SortableContext 
                items={alliances.map(alliance => alliance.alliance_id)}
                strategy={verticalListSortingStrategy}
              >
                {alliances.map((alliance) => (
                  <SortableAllianceCard
                    key={alliance.alliance_id}
                    alliance={alliance}
                    onToggleStatus={handleToggleStatus}
                    onRemove={handleRemoveAlliance}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeAlliance ? (
                  <AllianceCard
                    alliance={activeAlliance}
                    onToggleStatus={() => {}}
                    onRemove={() => {}}
                    isDragging={true}
                  />
                ) : null}
              </DragOverlay>
              </DndContext>
            </div>
          )}
        </Col>
      </Row>

      {/* Remove Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove Alliance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {allianceToRemove && (
            <div>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={`https://images.evetech.net/alliances/${allianceToRemove.alliance_id}/logo?tenant=tranquility&size=64`}
                  alt={`${allianceToRemove.name} logo`}
                  width="64"
                  height="64"
                  className="rounded me-3"
                />
                <div>
                  <h5>{allianceToRemove.name}</h5>
                  {allianceToRemove.ticker && (
                    <div className="text-muted">&lt;{allianceToRemove.ticker}&gt;</div>
                  )}
                </div>
              </div>
              <Alert variant="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Are you sure you want to remove this alliance? This action cannot be undone.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmRemoveAlliance}
            disabled={removeAllianceMutation.isPending}
          >
            {removeAllianceMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Removing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Remove Alliance
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AllianceAdmin;
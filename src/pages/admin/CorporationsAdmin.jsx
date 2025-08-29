import React, { useState, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, Modal, InputGroup, Spinner, Badge,
  OverlayTrigger, Tooltip, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faPlus, faTrash, faGripVertical,
  faBuilding, faCheckCircle, faTimesCircle, faExclamationTriangle,
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
  useManagedCorporations,
  useSearchCorporations,
  useCorporationInfo,
  useAddManagedCorporation,
  useUpdateCorporationStatus,
  useRemoveManagedCorporation,
  useBulkUpdateCorporations,
  useCorporationHealth
} from 'hooks/useCorporations';

// Draggable Corporation Card Component
const SortableCorporationCard = ({ corporation, onToggleStatus, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: corporation.corporation_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CorporationCard
        corporation={corporation}
        onToggleStatus={onToggleStatus}
        onRemove={onRemove}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
};

// Corporation Card Component
const CorporationCard = ({ 
  corporation, 
  onToggleStatus, 
  onRemove, 
  dragAttributes, 
  dragListeners, 
  isDragging = false 
}) => {
  const getCorpLogoUrl = (corpId) => {
    return `https://images.evetech.net/corporations/${corpId}/logo?tenant=tranquility&size=128`;
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

          {/* Corporation Logo */}
          <div className="me-3">
            <img
              src={getCorpLogoUrl(corporation.corporation_id)}
              alt={`${corporation.name} logo`}
              width="64"
              height="64"
              className="rounded"
              onError={(e) => {
                e.target.src = '/assets/img/generic/corp-placeholder.png';
              }}
            />
          </div>

          {/* Corporation Info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <h5 className="mb-0 me-2">{corporation.name}</h5>
              <Badge 
                bg={corporation.enabled ? 'success' : 'secondary'}
                className="me-2"
              >
                {corporation.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {corporation.ticker && (
                <Badge bg="info" className="me-2">
                  [{corporation.ticker}]
                </Badge>
              )}
            </div>
            
            {corporation.description && (
              <p className="text-muted small mb-2">{corporation.description}</p>
            )}
            
            <div className="small text-muted">
              <div>Corporation ID: {corporation.corporation_id}</div>
              {corporation.member_count && (
                <div>Members: {corporation.member_count.toLocaleString()}</div>
              )}
              {corporation.added_at && (
                <div>Added: {new Date(corporation.added_at).toLocaleDateString()}</div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{corporation.enabled ? 'Disable' : 'Enable'} Corporation</Tooltip>}
            >
              <Button
                variant={corporation.enabled ? 'outline-warning' : 'outline-success'}
                size="sm"
                onClick={() => onToggleStatus(corporation.corporation_id, !corporation.enabled)}
              >
                <FontAwesomeIcon 
                  icon={corporation.enabled ? faTimesCircle : faCheckCircle} 
                />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Remove Corporation</Tooltip>}
            >
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onRemove(corporation)}
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
const CorporationSearchResults = ({ results, onAddCorporation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" className="me-2" />
        Searching corporations...
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-3 text-muted">
        No corporations found. Try a different search term.
      </div>
    );
  }

  return (
    <ListGroup className="mt-2">
      {results.slice(0, 10).map((corp) => (
        <ListGroup.Item 
          key={corp.corporation_id}
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <img
              src={`https://images.evetech.net/corporations/${corp.corporation_id}/logo?tenant=tranquility&size=32`}
              alt={`${corp.name} logo`}
              width="32"
              height="32"
              className="rounded me-3"
              onError={(e) => {
                e.target.src = '/assets/img/generic/corp-placeholder.png';
              }}
            />
            <div>
              <div className="fw-medium">{corp.name}</div>
              {corp.ticker && (
                <small className="text-muted">[{corp.ticker}]</small>
              )}
            </div>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onAddCorporation(corp)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Add
          </Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

const CorporationsAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [corporationToRemove, setCorporationToRemove] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [optimisticCorps, setOptimisticCorps] = useState(null);

  // API hooks
  const { data: corporationsData, isLoading, error, refetch } = useManagedCorporations();
  const { data: searchResults, isLoading: searchLoading } = useSearchCorporations(searchQuery);
  const { data: healthData, isLoading: healthLoading } = useCorporationHealth();
  
  const addCorporationMutation = useAddManagedCorporation();
  const updateStatusMutation = useUpdateCorporationStatus();
  const removeCorporationMutation = useRemoveManagedCorporation();
  const bulkUpdateMutation = useBulkUpdateCorporations();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const corporations = optimisticCorps || corporationsData?.corporations || [];
  
  

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const currentCorps = optimisticCorps || corporationsData?.corporations || [];
      const oldIndex = currentCorps.findIndex(corp => corp.corporation_id === active.id);
      const newIndex = currentCorps.findIndex(corp => corp.corporation_id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      // Immediately update UI with new order
      const reorderedCorps = arrayMove(currentCorps, oldIndex, newIndex);
      setOptimisticCorps(reorderedCorps);
      
      // Prepare data for backend with 1-based positions
      const corporationsWithOrder = reorderedCorps.map((corp, index) => ({
        corporation_id: corp.corporation_id,
        name: corp.name,
        enabled: corp.enabled,
        position: index + 1 // API expects 1-based positions
      }));
      
      // Verify with backend
      bulkUpdateMutation.mutate(corporationsWithOrder, {
        onSuccess: () => {
          // Backend confirmed - delay clearing optimistic state for smooth transition
          setTimeout(() => {
            setOptimisticCorps(null);
          }, 500); // Small delay to avoid jarring refresh
        },
        onError: () => {
          // Backend rejected - restore original data immediately
          setOptimisticCorps(null);
          refetch(); // Ensure we have latest server state
        }
      });
    }
  }, [optimisticCorps, corporationsData, bulkUpdateMutation, refetch]);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // Handle adding corporation
  const handleAddCorporation = async (corp) => {
    try {
      await addCorporationMutation.mutateAsync({
        corporation_id: corp.corporation_id,
        name: corp.name,
        ticker: corp.ticker,
        enabled: true,
        position: corporations.length // Add at the end
      });
      setSearchQuery(''); // Clear search after adding
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (corpId, enabled) => {
    try {
      await updateStatusMutation.mutateAsync({ corpId, enabled });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Handle remove corporation
  const handleRemoveCorporation = (corporation) => {
    setCorporationToRemove(corporation);
    setShowRemoveModal(true);
  };

  const confirmRemoveCorporation = async () => {
    if (corporationToRemove) {
      const corpId = corporationToRemove.corporation_id;
      if (!corpId || corpId === 0) {
        toast.error('Invalid corporation ID. Cannot remove corporation.');
        return;
      }
      
      try {
        await removeCorporationMutation.mutateAsync(corpId);
        setShowRemoveModal(false);
        setCorporationToRemove(null);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  // Find active corporation for drag overlay
  const activeCorporation = corporations.find(corp => corp.corporation_id === activeId);

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <FontAwesomeIcon icon={faBuilding} className="me-2" />
              Corporation Management
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
              Checking corporation service health...
            </Alert>
          ) : optimisticCorps && bulkUpdateMutation.isPending ? (
            <Alert variant="info">
              <Spinner animation="border" size="sm" className="me-2" />
              Saving new order...
            </Alert>
          ) : error ? (
            <Alert variant="danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Error loading corporations: {error.message}
            </Alert>
          ) : healthData ? (
            <Alert variant={healthData.healthy === 'true' ? 'success' : 'warning'}>
              <FontAwesomeIcon 
                icon={healthData.health === 'healthy' ? faCheckCircle : faExclamationTriangle} 
                className="me-2" 
              />
              Corporation Service: {healthData.health === 'healthy' ? 'Healthy' : 'Warning'}
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
                Add New Corporation
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search corporations (minimum 3 characters)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              
              {searchQuery.length >= 3 && (
                <CorporationSearchResults
                  results={searchResults?.corporations || []}
                  onAddCorporation={handleAddCorporation}
                  isLoading={searchLoading}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Corporations Grid */}
      <Row>
        <Col>
          {corporations.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <FontAwesomeIcon icon={faBuilding} size="3x" className="text-muted mb-3" />
                <h4 className="text-muted">No Corporations Found</h4>
                <p className="text-muted">
                  Use the search above to add corporations to manage.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className={optimisticCorps ? 'opacity-75' : ''}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
              <SortableContext 
                items={corporations.map(corp => corp.corporation_id)}
                strategy={verticalListSortingStrategy}
              >
                {corporations.map((corporation) => (
                  <SortableCorporationCard
                    key={corporation.corporation_id}
                    corporation={corporation}
                    onToggleStatus={handleToggleStatus}
                    onRemove={handleRemoveCorporation}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeCorporation ? (
                  <CorporationCard
                    corporation={activeCorporation}
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
          <Modal.Title>Confirm Remove Corporation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {corporationToRemove && (
            <div>
              <div className="d-flex align-items-center mb-3">
                <img
                  src={`https://images.evetech.net/corporations/${corporationToRemove.corporation_id}/logo?tenant=tranquility&size=64`}
                  alt={`${corporationToRemove.name} logo`}
                  width="64"
                  height="64"
                  className="rounded me-3"
                />
                <div>
                  <h5>{corporationToRemove.name}</h5>
                  {corporationToRemove.ticker && (
                    <div className="text-muted">[{corporationToRemove.ticker}]</div>
                  )}
                </div>
              </div>
              <Alert variant="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Are you sure you want to remove this corporation? This action cannot be undone.
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
            onClick={confirmRemoveCorporation}
            disabled={removeCorporationMutation.isPending}
          >
            {removeCorporationMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Removing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="me-2" />
                Remove Corporation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CorporationsAdmin;
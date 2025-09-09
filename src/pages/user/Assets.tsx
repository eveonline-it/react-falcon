import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Spinner,
  Alert, Badge, Form, InputGroup, Pagination, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, faSync, faSearch, faMapMarkerAlt, faArrowLeft,
  faSort, faSortUp, faSortDown, faWarehouse, faChevronRight,
  faGlobe, faBuilding, faCubes, faExclamationTriangle,
  faChevronDown, faRocket, faCog, faLayerGroup,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { CharacterPortrait } from 'components/common';
import { useCurrentUser } from 'hooks/auth';
import { useUserCharacters } from 'hooks/useUserCharacters';
import { useCharacterAssets } from 'hooks/useAssets';

// Type definitions
interface Character {
  character_id: string;
  character_name: string;
  corporation_name?: string;
}

interface Asset {
  item_id: number;
  type_id: number;
  type_name: string;
  location_id: number;
  location_name: string;
  location_type: string;
  location_flag: string;
  quantity: number;
  parent_item_id?: number;
  solar_system_id?: number;
  region_id?: number;
  is_singleton?: boolean;
  is_container?: boolean;
}

interface ProcessedAsset extends Asset {
  isShip: boolean;
  children: Asset[];
  fittings: Map<string, Asset[]>;
}

interface Location {
  id: number;
  name: string;
  type: string;
  systemId?: number;
  regionId?: number;
  assets: Asset[];
  totalItems: number;
  uniqueTypesCount: number;
}


type SortField = 'type_name' | 'quantity' | 'item_id' | 'type_id';
type SortDirection = 'asc' | 'desc';

const Assets: React.FC = () => {
  const { user } = useCurrentUser();
  const userId = user?.user_id;
  const { data: charactersData, isLoading: isLoadingCharacters } = useUserCharacters(userId);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const { data: assetsData, isLoading: isLoadingAssets, error: assetsError, refetch: refetchAssets } = useCharacterAssets(selectedCharacterId);
  
  // View states
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('type_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showContainers, setShowContainers] = useState<boolean>(true);
  const [showFittings, setShowFittings] = useState<boolean>(true);
  const [expandedShips, setExpandedShips] = useState<Set<number>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;
  
  // Set default character on load and reset location selection
  useEffect(() => {
    if (charactersData?.length > 0 && !selectedCharacterId) {
      setSelectedCharacterId(charactersData[0].character_id);
    }
  }, [charactersData, selectedCharacterId]);
  
  // Reset location and pagination when character changes
  useEffect(() => {
    setSelectedLocation(null);
    setCurrentPage(1);
    setSearchTerm('');
    setExpandedShips(new Set());
  }, [selectedCharacterId]);
  
  // Utility functions for ship fitting detection
  const isShipSlot = (locationFlag: string | undefined): boolean => {
    if (!locationFlag) return false;
    return /^(HiSlot|MedSlot|LoSlot|RigSlot|SubSystemSlot|ServiceSlot)\d+$/.test(locationFlag);
  };
  
  const isShipBay = (locationFlag: string | undefined): boolean => {
    if (!locationFlag) return false;
    return ['CargoBay', 'DroneBay', 'ShipHangar', 'FleetHangar', 'FuelBay', 'OreHold', 'GasHold', 'MineralHold', 'SalvageHold', 'SpecializedFuelBay', 'SpecializedOreHold', 'SpecializedGasHold', 'SpecializedMineralHold', 'SpecializedSalvageHold', 'SpecializedShipHold', 'SpecializedSmallShipHold', 'SpecializedMediumShipHold', 'SpecializedLargeShipHold', 'SpecializedIndustrialShipHold', 'SpecializedAmmoHold', 'ImplantBay', 'QuafeBay'].includes(locationFlag);
  };
  
  const getSlotCategory = (locationFlag: string | undefined): string => {
    if (!locationFlag) return 'Unknown';
    if (locationFlag.startsWith('HiSlot')) return 'High Slots';
    if (locationFlag.startsWith('MedSlot')) return 'Medium Slots';
    if (locationFlag.startsWith('LoSlot')) return 'Low Slots';
    if (locationFlag.startsWith('RigSlot')) return 'Rigs';
    if (locationFlag.startsWith('SubSystemSlot')) return 'Subsystems';
    if (locationFlag.startsWith('ServiceSlot')) return 'Service Modules';
    if (isShipBay(locationFlag)) return 'Ship Bays';
    return locationFlag;
  };
  
  const isLikelyShip = (asset: Asset): boolean => {
    // Ships typically don't have parent_item_id and are in hangar or being piloted
    return !asset.parent_item_id && 
           (asset.location_flag === 'Hangar' || 
            asset.location_flag === 'Pilot' || 
            asset.location_flag === 'AutoFit');
  };
  
  // Process locations with asset counts and details
  const locations = useMemo<Location[]>(() => {
    if (!assetsData?.assets) return [];
    
    const locationGroups = assetsData.assets.reduce((acc: Record<string, {
      id: number;
      name: string;
      type: string;
      systemId?: number;
      regionId?: number;
      assets: Asset[];
      totalItems: number;
      uniqueTypes: Set<string>;
    }>, asset: Asset) => {
      const locationKey = asset.location_name || 'Unknown Location';
      if (!acc[locationKey]) {
        acc[locationKey] = {
          id: asset.location_id,
          name: asset.location_name || 'Unknown Location',
          type: asset.location_type,
          systemId: asset.solar_system_id,
          regionId: asset.region_id,
          assets: [],
          totalItems: 0,
          uniqueTypes: new Set()
        };
      }
      
      acc[locationKey].assets.push(asset);
      acc[locationKey].totalItems += asset.quantity || 0;
      acc[locationKey].uniqueTypes.add(asset.type_name);
      return acc;
    }, {});
    
    // Convert to array and add calculated fields
    return (Object.values(locationGroups) as {
      id: number;
      name: string;
      type: string;
      systemId?: number;
      regionId?: number;
      assets: Asset[];
      totalItems: number;
      uniqueTypes: Set<string>;
    }[]).map(location => ({
      ...location,
      uniqueTypesCount: location.uniqueTypes.size,
      uniqueTypes: undefined // Remove Set object
    } as Location)).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [assetsData]);
  
  // Process assets into hierarchical structure with ships and fittings
  const { processedAssets, paginatedAssets, totalPages } = useMemo<{
    processedAssets: ProcessedAsset[];
    paginatedAssets: ProcessedAsset[];
    totalPages: number;
  }>(() => {
    if (!selectedLocation || !assetsData?.assets) {
      return { processedAssets: [], paginatedAssets: [], totalPages: 0 };
    }
    
    // Get all assets for the selected location
    const locationAssets = assetsData.assets.filter((asset: Asset) => asset.location_name === selectedLocation.name);
    
    // Create a map for quick parent lookup
    const assetMap = new Map<number, Asset>();
    locationAssets.forEach((asset: Asset) => {
      assetMap.set(asset.item_id, asset);
    });
    
    // Group assets by parent relationship
    const rootAssets: ProcessedAsset[] = [];
    const childAssets = new Map<number, Asset[]>(); // parent_id -> children[]
    
    locationAssets.forEach((asset: Asset) => {
      if (!asset.parent_item_id || !assetMap.has(asset.parent_item_id)) {
        // Root level asset (no parent or parent not in this location)
        rootAssets.push({
          ...asset,
          isShip: isLikelyShip(asset),
          children: [],
          fittings: new Map() // slot category -> items[]
        });
      } else {
        // Child asset (fitted or contained)
        if (!childAssets.has(asset.parent_item_id)) {
          childAssets.set(asset.parent_item_id, []);
        }
        childAssets.get(asset.parent_item_id)!.push(asset);
      }
    });
    
    // Attach children to their parents
    rootAssets.forEach(parent => {
      if (childAssets.has(parent.item_id)) {
        const children = childAssets.get(parent.item_id)!;
        parent.children = children;
        
        // Group fittings by slot category if this is a ship
        if (parent.isShip) {
          children.forEach(child => {
            if (isShipSlot(child.location_flag) || isShipBay(child.location_flag)) {
              const category = getSlotCategory(child.location_flag);
              if (!parent.fittings.has(category)) {
                parent.fittings.set(category, []);
              }
              parent.fittings.get(category)!.push(child);
            }
          });
        }
      }
    });
    
    // Apply search filter
    let filteredAssets = rootAssets;
    if (searchTerm) {
      filteredAssets = rootAssets.filter(asset => {
        const matchesParent = asset.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             asset.item_id?.toString().includes(searchTerm);
        
        const matchesChild = asset.children.some(child => 
          child.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          child.item_id?.toString().includes(searchTerm)
        );
        
        return matchesParent || matchesChild;
      });
    }
    
    // Apply container filter
    if (!showContainers) {
      filteredAssets = filteredAssets.filter(asset => !asset.is_container);
    }
    
    // Apply sorting
    filteredAssets.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];
      
      // Handle numeric fields
      if (sortField === 'quantity' || sortField === 'item_id' || sortField === 'type_id') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      // Handle string fields
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);
    
    return { 
      processedAssets: filteredAssets, 
      paginatedAssets,
      totalPages 
    };
  }, [selectedLocation, assetsData, searchTerm, showContainers, sortField, sortDirection, currentPage, itemsPerPage]);
  
  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };
  
  const getSortIcon = (field: SortField): IconDefinition => {
    if (sortField !== field) return faSort;
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };
  
  const handleRefresh = async (): Promise<void> => {
    if (selectedCharacterId) {
      await refetchAssets();
      toast.success('Assets refreshed successfully');
    }
  };
  
  const getLocationIcon = (locationType: string): IconDefinition => {
    switch(locationType) {
      case 'station': return faBuilding;
      case 'structure': return faWarehouse;
      case 'solar_system': return faGlobe;
      default: return faMapMarkerAlt;
    }
  };
  
  const formatQuantity = (quantity: number): string => {
    return quantity.toLocaleString();
  };
  
  const handleLocationSelect = (location: Location): void => {
    setSelectedLocation(location);
    setCurrentPage(1);
    setSearchTerm('');
  };
  
  const handleBackToLocations = (): void => {
    setSelectedLocation(null);
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  const toggleShipExpanded = (shipId: number): void => {
    const newExpanded = new Set(expandedShips);
    if (newExpanded.has(shipId)) {
      newExpanded.delete(shipId);
    } else {
      newExpanded.add(shipId);
    }
    setExpandedShips(newExpanded);
  };
  
  const getItemIconUrl = (typeId: number, size: number = 32): string => {
    return `https://images.evetech.net/types/${typeId}/icon?size=${size}`;
  };
  
  const getItemIcon = (asset: ProcessedAsset): IconDefinition => {
    if (asset.isShip) return faRocket;
    if (asset.is_container) return faCubes;
    if (isShipSlot(asset.location_flag)) return faCog;
    return faLayerGroup;
  };
  
  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showContainers]);
  
  const selectedCharacter = charactersData?.find((c: Character) => c.character_id === selectedCharacterId);
  
  return (
    <Container fluid className="p-3">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <FontAwesomeIcon icon={faBox} className="me-2" />
              Character Assets
              {selectedLocation && (
                <span className="fs-6 text-muted ms-2">
                  - {selectedLocation.name}
                </span>
              )}
            </h2>
            <div className="d-flex gap-2">
              {selectedLocation && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleBackToLocations}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Back to Locations
                </Button>
              )}
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleRefresh}
                disabled={!selectedCharacterId || isLoadingAssets}
              >
                <FontAwesomeIcon icon={faSync} spin={isLoadingAssets} className="me-2" />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* Character Selection */}
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body>
              <Row>
                <Col lg={8}>
                  <Form.Group>
                    <Form.Label>Select Character</Form.Label>
                    <Form.Select 
                      value={selectedCharacterId || ''}
                      onChange={(e) => setSelectedCharacterId(e.target.value)}
                      disabled={isLoadingCharacters}
                    >
                      <option value="">Select a character...</option>
                      {charactersData?.map((character: Character) => (
                        <option key={character.character_id} value={character.character_id}>
                          {character.character_name} 
                          {character.corporation_name && ` - ${character.corporation_name}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={4}>
                  {selectedCharacter && (
                    <div className="d-flex align-items-center h-100">
                      <CharacterPortrait 
                        characterId={selectedCharacter.character_id}
                        characterName={selectedCharacter.character_name}
                        size={48}
                        className="me-3"
                      />
                      <div>
                        <div className="fw-bold">{selectedCharacter.character_name}</div>
                        <small className="text-muted">{selectedCharacter.corporation_name}</small>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      {isLoadingAssets ? (
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-2">Loading assets...</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : assetsError ? (
        <Row>
          <Col>
            <Alert variant="danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Error loading assets: {(assetsError as Error).message}
            </Alert>
          </Col>
        </Row>
      ) : !selectedCharacterId ? (
        <Row>
          <Col>
            <Alert variant="info">
              Please select a character to view assets
            </Alert>
          </Col>
        </Row>
      ) : !selectedLocation ? (
        /* Locations View */
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Asset Locations ({locations.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {locations.length === 0 ? (
                  <div className="text-center p-4">
                    <div className="text-muted">No assets found for this character</div>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {locations.map(location => (
                      <ListGroup.Item 
                        key={location.id}
                        action
                        onClick={() => handleLocationSelect(location)}
                        className="d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          <FontAwesomeIcon 
                            icon={getLocationIcon(location.type)}
                            className="me-3 text-muted"
                            size="lg"
                          />
                          <div>
                            <div className="fw-semibold">{location.name}</div>
                            <small className="text-muted">
                              {location.type} • ID: {location.id}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-end me-3">
                            <div className="fw-semibold">{formatQuantity(location.totalItems)}</div>
                            <small className="text-muted">{location.uniqueTypesCount} types</small>
                          </div>
                          <FontAwesomeIcon icon={faChevronRight} className="text-muted" />
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        /* Items View */
        <>
          {/* Search and Filters */}
          <Row className="mb-3">
            <Col>
              <Card>
                <Card.Body>
                  <Row className="g-3">
                    <Col lg={6}>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col lg={3}>
                      <Form.Check
                        type="switch"
                        label="Show Containers"
                        checked={showContainers}
                        onChange={(e) => setShowContainers(e.target.checked)}
                      />
                    </Col>
                    <Col lg={3}>
                      <Form.Check
                        type="switch"
                        label="Show Fittings"
                        checked={showFittings}
                        onChange={(e) => setShowFittings(e.target.checked)}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Items Table */}
          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      Items ({processedAssets.length})
                    </h6>
                    <div className="text-muted small">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {processedAssets.length === 0 ? (
                    <div className="text-center p-4">
                      <div className="text-muted">No items found</div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}>Icon</th>
                            <th 
                              style={{ cursor: 'pointer', width: '35%' }}
                              onClick={() => handleSort('type_name')}
                            >
                              Item
                              <FontAwesomeIcon icon={getSortIcon('type_name')} className="ms-2 text-muted" />
                            </th>
                            <th 
                              style={{ cursor: 'pointer', width: '15%' }}
                              onClick={() => handleSort('quantity')}
                            >
                              Quantity
                              <FontAwesomeIcon icon={getSortIcon('quantity')} className="ms-2 text-muted" />
                            </th>
                            <th style={{ width: '20%' }}>Flag</th>
                            <th style={{ width: '20%' }}>Properties</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAssets.map(asset => (
                            <React.Fragment key={asset.item_id}>
                              {/* Main Asset Row */}
                              <tr 
                                style={{ cursor: asset.isShip && asset.children.length > 0 ? 'pointer' : 'default' }}
                                onClick={() => asset.isShip && asset.children.length > 0 && toggleShipExpanded(asset.item_id)}
                              >
                                <td>
                                  <div className="d-flex align-items-center position-relative">
                                    <img 
                                      src={getItemIconUrl(asset.type_id, 32)}
                                      alt={asset.type_name}
                                      style={{ width: '32px', height: '32px' }}
                                      className="rounded"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const nextSibling = target.nextElementSibling as HTMLElement;
                                        if (nextSibling) {
                                          nextSibling.style.display = 'inline-block';
                                        }
                                      }}
                                    />
                                    <FontAwesomeIcon 
                                      icon={getItemIcon(asset)} 
                                      className={`${asset.isShip ? 'text-primary' : 'text-muted'}`}
                                      style={{ display: 'none', width: '32px', height: '32px' }}
                                    />
                                    {asset.isShip && asset.children.length > 0 && (
                                      <FontAwesomeIcon 
                                        icon={expandedShips.has(asset.item_id) ? faChevronDown : faChevronRight} 
                                        className="text-muted position-absolute"
                                        style={{ top: '2px', right: '2px', fontSize: '10px', backgroundColor: 'white', borderRadius: '50%', padding: '1px' }}
                                      />
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className={`fw-semibold ${asset.isShip ? 'text-primary' : ''}`}>
                                      {asset.type_name}
                                      {asset.isShip && asset.children.length > 0 && (
                                        <span className="text-muted ms-2 small">
                                          ({asset.children.length} fitted)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="fw-semibold">{formatQuantity(asset.quantity)}</td>
                                <td>
                                  <Badge bg="secondary" className="small">{asset.location_flag}</Badge>
                                </td>
                                <td>
                                  <div className="d-flex gap-1">
                                    {asset.is_singleton && (
                                      <Badge bg="info" className="small" title="Singleton">Single</Badge>
                                    )}
                                    {asset.is_container && (
                                      <Badge bg="warning" className="small" title="Container">
                                        <FontAwesomeIcon icon={faCubes} />
                                      </Badge>
                                    )}
                                    {asset.isShip && (
                                      <Badge bg="primary" className="small" title="Ship">Ship</Badge>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              
                              {/* Ship Fittings Rows */}
                              {showFittings && asset.isShip && expandedShips.has(asset.item_id) && (
                                Array.from(asset.fittings.entries()).map(([category, items]) => (
                                  <React.Fragment key={`${asset.item_id}-${category}`}>
                                    {/* Category Header */}
                                    <tr className="table-light">
                                      <td></td>
                                      <td colSpan={4}>
                                        <small className="fw-bold text-muted text-uppercase">
                                          {category} ({items.length})
                                        </small>
                                      </td>
                                    </tr>
                                    {/* Category Items */}
                                    {items.map(item => (
                                      <tr key={item.item_id} className="table-light">
                                        <td>
                                          <div className="ps-2">
                                            <img 
                                              src={getItemIconUrl(item.type_id, 24)}
                                              alt={item.type_name}
                                              style={{ width: '24px', height: '24px' }}
                                              className="rounded"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const nextSibling = target.nextElementSibling as HTMLElement;
                                                if (nextSibling) {
                                                  nextSibling.style.display = 'inline-block';
                                                }
                                              }}
                                            />
                                            <FontAwesomeIcon 
                                              icon={faCog} 
                                              className="text-muted"
                                              style={{ display: 'none', width: '24px', fontSize: '18px' }}
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <div className="ps-3">
                                            <div className="fw-semibold small">{item.type_name}</div>
                                          </div>
                                        </td>
                                        <td className="small">{formatQuantity(item.quantity)}</td>
                                        <td>
                                          <Badge bg="outline-secondary" className="small">{item.location_flag}</Badge>
                                        </td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            {item.is_singleton && (
                                              <Badge bg="info" className="small" title="Singleton">Single</Badge>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                ))
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Card.Body>
                {totalPages > 1 && (
                  <Card.Footer>
                    <div className="d-flex justify-content-center">
                      <Pagination>
                        <Pagination.First 
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev 
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        
                        {/* Show page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber: number;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Pagination.Item
                              key={pageNumber}
                              active={pageNumber === currentPage}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </Pagination.Item>
                          );
                        })}
                        
                        <Pagination.Next 
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last 
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Assets;
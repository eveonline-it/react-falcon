import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Spinner,
  Alert, Badge, Form, InputGroup, Pagination, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, faSync, faSearch, faMapMarkerAlt, faArrowLeft,
  faSort, faSortUp, faSortDown, faWarehouse, faChevronRight,
  faBuilding, faCubes, faExclamationTriangle,
  faChevronDown, faRocket, faCog, faLayerGroup,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { CharacterPortrait } from 'components/common';
import { useCurrentUser } from 'hooks/auth';
import { useUserCharacters } from 'hooks/useUserCharacters';
import { useCharacterAssets } from 'hooks/useAssets';
import { useMutation } from '@tanstack/react-query';

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
  isContainer: boolean;
  children: Asset[];
  fittings: Map<string, Asset[]>;
  contents: Asset[];
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
  fittedShipsCount: number;
  spareItemsCount: number;
  containersCount: number;
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
  const [showShips, setShowShips] = useState<boolean>(true);
  const [showItems, setShowItems] = useState<boolean>(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
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
    setExpandedItems(new Set());
  }, [selectedCharacterId]);
  
  // Utility functions for ship fitting detection
  const isShipSlot = (locationFlag: string | undefined): boolean => {
    if (!locationFlag) return false;
    return /^(HiSlot|MedSlot|LoSlot|RigSlot|SubSystemSlot|ServiceSlot)\d+$/.test(locationFlag);
  };
  
  const isShipBay = (locationFlag: string | undefined): boolean => {
    if (!locationFlag) return false;
    return ['Cargo', 'CargoBay', 'DroneBay', 'ShipHangar', 'FleetHangar', 'FuelBay', 'OreHold', 'GasHold', 'MineralHold', 'SalvageHold', 'SpecializedFuelBay', 'SpecializedOreHold', 'SpecializedGasHold', 'SpecializedMineralHold', 'SpecializedSalvageHold', 'SpecializedShipHold', 'SpecializedSmallShipHold', 'SpecializedMediumShipHold', 'SpecializedLargeShipHold', 'SpecializedIndustrialShipHold', 'SpecializedAmmoHold', 'ImplantBay', 'QuafeBay'].includes(locationFlag);
  };
  
  const getSlotCategory = (locationFlag: string | undefined): string => {
    if (!locationFlag) return 'Unknown';
    if (locationFlag.startsWith('HiSlot')) return 'High Slots';
    if (locationFlag.startsWith('MedSlot')) return 'Medium Slots';
    if (locationFlag.startsWith('LoSlot')) return 'Low Slots';
    if (locationFlag.startsWith('RigSlot')) return 'Rigs';
    if (locationFlag.startsWith('SubSystemSlot')) return 'Subsystems';
    if (locationFlag.startsWith('ServiceSlot')) return 'Service Modules';
    if (locationFlag === 'Cargo') return 'Cargo Bay';
    if (locationFlag === 'DroneBay') return 'Drone Bay';
    if (isShipBay(locationFlag)) return 'Ship Bays';
    return locationFlag;
  };

  const getSlotCategoryOrder = (category: string): number => {
    const order: Record<string, number> = {
      'High Slots': 1,
      'Medium Slots': 2,
      'Low Slots': 3,
      'Rigs': 4,
      'Cargo Bay': 5,
      'Drone Bay': 6,
      'Ship Bays': 7,
      'Subsystems': 8,
      'Service Modules': 9,
    };
    return order[category] || 999;
  };
  
  const isLikelyShip = (asset: Asset): boolean => {
    // Only consider something a ship if it's being actively piloted
    // Items in hangars could be anything (modules, ammo, etc.), not just ships
    // The most reliable way to detect a ship is if it has fitted items
    return !asset.parent_item_id && asset.location_flag === 'Pilot';
  };
  
  // Process locations with asset counts and details
  const locations = useMemo<Location[]>(() => {
    if (!assetsData?.assets) return [];
    
    // First pass: group assets by location and build parent-child relationships
    const locationGroups = assetsData.assets.reduce((acc: Record<string, {
      id: number;
      name: string;
      type: string;
      systemId?: number;
      regionId?: number;
      assets: Asset[];
      totalItems: number;
      uniqueTypes: Set<string>;
      allShips: Set<number>;
      spareItems: number;
      containers: number;
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
          uniqueTypes: new Set(),
          allShips: new Set(),
          spareItems: 0,
          containers: 0
        };
      }
      
      acc[locationKey].assets.push(asset);
      acc[locationKey].uniqueTypes.add(asset.type_name);
      return acc;
    }, {});
    
    // Second pass: analyze each location's assets using the same logic as detailed view
    (Object.values(locationGroups) as {
      id: number;
      name: string;
      type: string;
      systemId?: number;
      regionId?: number;
      assets: Asset[];
      totalItems: number;
      uniqueTypes: Set<string>;
      allShips: Set<number>;
      spareItems: number;
      containers: number;
    }[]).forEach(location => {
      // Group assets by parent relationship (same as detailed view)
      const rootAssets: Asset[] = [];
      const childAssets = new Map<number, Asset[]>();
      
      location.assets.forEach((asset: Asset) => {
        if (!asset.parent_item_id) {
          // Root level asset
          rootAssets.push(asset);
        } else {
          // Child asset (fitted or contained)
          if (!childAssets.has(asset.parent_item_id)) {
            childAssets.set(asset.parent_item_id, []);
          }
          childAssets.get(asset.parent_item_id)!.push(asset);
        }
      });
      
      // Analyze root assets using same logic as detailed view
      rootAssets.forEach((asset: Asset) => {
        let isShip = false;
        
        if (childAssets.has(asset.item_id)) {
          const children = childAssets.get(asset.item_id)!;
          // If this asset has fitted items (children with ship slots/bays), it's a ship
          const hasFittedItems = children.some(child => 
            isShipSlot(child.location_flag) || isShipBay(child.location_flag)
          );
          isShip = hasFittedItems;
        }
        
        // Also check if it looks like a ship even without fittings
        if (!isShip) {
          isShip = isLikelyShip(asset);
        }
        
        // Categorize the asset
        if (asset.is_container) {
          location.containers += 1;
          location.totalItems += 1; // Container counts as 1 item type
        } else if (isShip) {
          // This is a ship (hull + all fittings = 1 ship)
          location.allShips.add(asset.item_id);
          location.totalItems += 1; // Ship (hull + fittings) counts as 1 item type
        } else {
          // This is a spare item (not fitted to anything)
          location.spareItems += 1; // Count distinct item types, not quantities
          location.totalItems += 1; // Count distinct item types, not quantities
        }
      });
    });
    
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
      allShips: Set<number>;
      spareItems: number;
      containers: number;
    }[]).map(location => ({
      ...location,
      uniqueTypesCount: location.uniqueTypes.size,
      fittedShipsCount: location.allShips.size,
      spareItemsCount: location.spareItems,
      containersCount: location.containers,
      uniqueTypes: undefined, // Remove Set object
      allShips: undefined, // Remove Set object
      spareItems: undefined, // Remove temporary field
      containers: undefined // Remove temporary field
    } as Location)).sort((a, b) => {
      // Primary sort: by total items (descending - most items first)
      if (b.totalItems !== a.totalItems) {
        return b.totalItems - a.totalItems;
      }
      // Secondary sort: by name (ascending)
      return (a.name || '').localeCompare(b.name || '');
    });
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
    const locationAssets = assetsData.assets.filter((asset: Asset) => {
      // Handle "Unknown Location" case - match assets with no location_name
      if (selectedLocation.name === 'Unknown Location') {
        return !asset.location_name;
      }
      return asset.location_name === selectedLocation.name;
    });
    
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
          isShip: false, // Will be determined after we know which have children
          isContainer: asset.is_container || false,
          children: [],
          fittings: new Map(), // slot category -> items[]
          contents: [] // container contents
        });
      } else {
        // Child asset (fitted or contained)
        if (!childAssets.has(asset.parent_item_id)) {
          childAssets.set(asset.parent_item_id, []);
        }
        childAssets.get(asset.parent_item_id)!.push(asset);
      }
    });
    
    // Attach children to their parents and determine ship/container status
    rootAssets.forEach(parent => {
      if (childAssets.has(parent.item_id)) {
        const children = childAssets.get(parent.item_id)!;
        parent.children = children;
        
        // If this asset has fitted items (children with ship slots/bays), it's a ship
        const hasFittedItems = children.some(child => 
          isShipSlot(child.location_flag) || isShipBay(child.location_flag)
        );
        parent.isShip = hasFittedItems;
        
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
        
        // Store contents if this is a container
        if (parent.isContainer) {
          parent.contents = children;
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
    
    // Apply filtering based on asset type
    filteredAssets = filteredAssets.filter(asset => {
      // Determine asset type based on our new logic
      const isContainer = asset.isContainer;
      const isShip = asset.isShip; // Now properly identifies ships with fitted items
      const isSpareItem = !isShip && !isContainer;
      
      // Apply filters
      if (isContainer && !showContainers) return false;
      if (isShip && !showShips) return false;
      if (isSpareItem && !showItems) return false;
      
      return true;
    });
    
    // Apply sorting
    filteredAssets.sort((a, b) => {
      // Primary sort: Ships first
      if (a.isShip && !b.isShip) return -1;
      if (!a.isShip && b.isShip) return 1;
      
      // Secondary sort: By selected field
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
  }, [selectedLocation, assetsData, searchTerm, showContainers, showShips, showItems, sortField, sortDirection, currentPage, itemsPerPage]);
  
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

  // Mutation to refresh character assets from EVE API
  const refreshAssetsMutation = useMutation({
    mutationFn: async (characterId: string) => {
      const response = await fetch(`${import.meta.env.VITE_EVE_BACKEND_URL}/assets/character/${characterId}/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh assets: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: async () => {
      // Refetch the assets data after successful refresh
      await refetchAssets();
      toast.success('Assets refreshed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh assets: ${error.message}`);
    }
  });
  
  const handleRefresh = async (): Promise<void> => {
    if (selectedCharacterId) {
      refreshAssetsMutation.mutate(selectedCharacterId);
    }
  };
  
  const getLocationIcon = (locationId: number): IconDefinition => {
    if (locationId < 100000000) {
      return faBuilding; // station
    } else {
      return faWarehouse; // structure
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
  
  const toggleItemExpanded = (itemId: number): void => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };
  
  const getItemIconUrl = (typeId: number, size: number = 32): string => {
    return `https://images.evetech.net/types/${typeId}/icon?size=${size}`;
  };

  const getItemIconUrlFallback = (typeId: number): string => {
    // Try render endpoint for ships/larger items
    return `https://images.evetech.net/types/${typeId}/render?size=64`;
  };
  
  const getItemIcon = (asset: ProcessedAsset): IconDefinition => {
    if (asset.isShip) return faRocket;
    if (asset.isContainer) return faCubes;
    if (isShipSlot(asset.location_flag)) return faCog;
    return faLayerGroup;
  };
  
  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showContainers, showShips, showItems]);
  
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
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleRefresh}
              disabled={!selectedCharacterId || refreshAssetsMutation.isPending}
            >
              <FontAwesomeIcon icon={faSync} spin={refreshAssetsMutation.isPending} className="me-2" />
              Refresh
            </Button>
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
                            icon={getLocationIcon(location.id)}
                            className="me-3 text-muted"
                            size="lg"
                          />
                          <div>
                            <div className="fw-semibold">{location.name}</div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="text-end me-3">
                            <div className="d-flex flex-column">
                              <div className="d-flex justify-content-between">
                                <small className="text-muted me-2">Ships:</small>
                                <small className="fw-semibold">{location.fittedShipsCount}</small>
                              </div>
                              <div className="d-flex justify-content-between">
                                <small className="text-muted me-2">Items:</small>
                                <small className="fw-semibold">{formatQuantity(location.spareItemsCount)}</small>
                              </div>
                              <div className="d-flex justify-content-between">
                                <small className="text-muted me-2">Containers:</small>
                                <small className="fw-semibold">{location.containersCount}</small>
                              </div>
                            </div>
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
                    <Col lg={2}>
                      <Form.Check
                        type="switch"
                        label="Show Ships"
                        checked={showShips}
                        onChange={(e) => setShowShips(e.target.checked)}
                      />
                    </Col>
                    <Col lg={2}>
                      <Form.Check
                        type="switch"
                        label="Show Items"
                        checked={showItems}
                        onChange={(e) => setShowItems(e.target.checked)}
                      />
                    </Col>
                    <Col lg={2}>
                      <Form.Check
                        type="switch"
                        label="Show Containers"
                        checked={showContainers}
                        onChange={(e) => setShowContainers(e.target.checked)}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Back to Locations Button */}
          {selectedLocation && (
            <Row className="mb-3">
              <Col className="d-flex justify-content-center">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleBackToLocations}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Back to Locations
                </Button>
              </Col>
            </Row>
          )}
          
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
                            <th 
                              style={{ cursor: 'pointer', width: '45%' }}
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
                                style={{ cursor: (asset.isShip && asset.children.length > 0) || (asset.isContainer && asset.contents.length > 0) ? 'pointer' : 'default' }}
                                onClick={() => ((asset.isShip && asset.children.length > 0) || (asset.isContainer && asset.contents.length > 0)) && toggleItemExpanded(asset.item_id)}
                              >
                                <td>
                                  <div className="d-flex align-items-center">
                                    {((asset.isShip && asset.children.length > 0) || (asset.isContainer && asset.contents.length > 0)) && (
                                      <FontAwesomeIcon 
                                        icon={expandedItems.has(asset.item_id) ? faChevronDown : faChevronRight} 
                                        className="text-muted me-2"
                                        style={{ fontSize: '12px' }}
                                      />
                                    )}
                                    <div className="me-2">
                                      <img 
                                        src={getItemIconUrl(asset.type_id, 32)}
                                        alt={asset.type_name}
                                        style={{ width: '32px', height: '32px' }}
                                        className="rounded"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          // Try fallback render endpoint first
                                          if (!target.dataset.triedFallback) {
                                            target.dataset.triedFallback = 'true';
                                            target.src = getItemIconUrlFallback(asset.type_id);
                                            return;
                                          }
                                          console.log(`Both icon endpoints failed for type_id: ${asset.type_id}, type_name: ${asset.type_name}`);
                                          target.style.display = 'none';
                                          const nextSibling = target.nextElementSibling as HTMLElement;
                                          if (nextSibling) {
                                            nextSibling.style.display = 'inline-block';
                                          }
                                        }}
                                      />
                                      <FontAwesomeIcon 
                                        icon={getItemIcon(asset)} 
                                        className={`${asset.isShip ? 'text-primary' : asset.isContainer ? 'text-warning' : 'text-muted'}`}
                                        style={{ display: 'none', width: '32px', height: '32px' }}
                                      />
                                    </div>
                                    <div>
                                      <div className={`fw-semibold ${asset.isShip ? 'text-primary' : asset.isContainer ? 'text-warning' : ''}`}>
                                        {asset.type_name}
                                        {asset.isShip && asset.children.length > 0 && (
                                          <span className="text-muted ms-2 small">
                                            ({asset.children.length} fitted)
                                          </span>
                                        )}
                                        {asset.isContainer && asset.contents.length > 0 && (
                                          <span className="text-muted ms-2 small">
                                            ({asset.contents.length} items)
                                          </span>
                                        )}
                                      </div>
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
                                    {asset.isContainer && (
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
                              {showShips && asset.isShip && expandedItems.has(asset.item_id) && (
                                Array.from(asset.fittings.entries())
                                  .sort(([categoryA], [categoryB]) => getSlotCategoryOrder(categoryA) - getSlotCategoryOrder(categoryB))
                                  .map(([category, items]) => (
                                  <React.Fragment key={`${asset.item_id}-${category}`}>
                                    {/* Category Header */}
                                    <tr className="table-light">
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
                                          <div className="ps-3 d-flex align-items-center">
                                            <div className="me-2">
                                              <img 
                                                src={getItemIconUrl(item.type_id, 32)}
                                                alt={item.type_name}
                                                style={{ width: '24px', height: '24px' }}
                                                className="rounded"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  // Try fallback render endpoint first
                                                  if (!target.dataset.triedFallback) {
                                                    target.dataset.triedFallback = 'true';
                                                    target.src = getItemIconUrlFallback(item.type_id);
                                                    return;
                                                  }
                                                  console.log(`Both icon endpoints failed for type_id: ${item.type_id}, type_name: ${item.type_name}`);
                                                  target.style.display = 'none';
                                                  const nextSibling = target.nextElementSibling as HTMLElement;
                                                  if (nextSibling) {
                                                    nextSibling.style.display = 'inline-flex';
                                                  }
                                                }}
                                              />
                                              <div
                                                style={{ 
                                                  display: 'none', 
                                                  width: '24px', 
                                                  height: '24px',
                                                  backgroundColor: '#f8f9fa',
                                                  border: '1px solid #dee2e6',
                                                  borderRadius: '4px',
                                                  alignItems: 'center',
                                                  justifyContent: 'center'
                                                }}
                                              >
                                                <FontAwesomeIcon 
                                                  icon={faCog} 
                                                  className="text-muted"
                                                  style={{ fontSize: '12px' }}
                                                />
                                              </div>
                                            </div>
                                            <div>
                                              <div className="fw-semibold small">{item.type_name}</div>
                                            </div>
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
                              
                              {/* Container Contents Rows */}
                              {showContainers && asset.isContainer && expandedItems.has(asset.item_id) && asset.contents.length > 0 && (
                                <>
                                  <tr className="table-light">
                                    <td colSpan={4}>
                                      <small className="fw-bold text-muted text-uppercase">
                                        Container Contents ({asset.contents.length})
                                      </small>
                                    </td>
                                  </tr>
                                  {asset.contents.map(item => (
                                    <tr key={item.item_id} className="table-light">
                                      <td>
                                        <div className="ps-3 d-flex align-items-center">
                                          <div className="me-2">
                                            <img 
                                              src={getItemIconUrl(item.type_id, 32)}
                                              alt={item.type_name}
                                              style={{ width: '24px', height: '24px' }}
                                              className="rounded"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                // Try fallback render endpoint first
                                                if (!target.dataset.triedFallback) {
                                                  target.dataset.triedFallback = 'true';
                                                  target.src = getItemIconUrlFallback(item.type_id);
                                                  return;
                                                }
                                                console.log(`Both icon endpoints failed for type_id: ${item.type_id}, type_name: ${item.type_name}`);
                                                target.style.display = 'none';
                                                const nextSibling = target.nextElementSibling as HTMLElement;
                                                if (nextSibling) {
                                                  nextSibling.style.display = 'inline-flex';
                                                }
                                              }}
                                            />
                                            <div
                                              style={{ 
                                                display: 'none', 
                                                width: '24px', 
                                                height: '24px',
                                                backgroundColor: '#f8f9fa',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '4px',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                            >
                                              <FontAwesomeIcon 
                                                icon={faLayerGroup} 
                                                className="text-muted"
                                                style={{ fontSize: '12px' }}
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <div className="fw-semibold small">{item.type_name}</div>
                                          </div>
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
                                </>
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
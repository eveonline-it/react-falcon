import React from 'react';
import { Badge, Card, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsersCog, 
  faShieldAlt, 
  faBuilding, 
  faGlobe 
} from '@fortawesome/free-solid-svg-icons';
import { useUserGroups } from 'hooks/useUsers';

interface GroupsBadgesProps {
  userId: number;
  compact?: boolean;
  className?: string;
}

const GroupsBadges: React.FC<GroupsBadgesProps> = ({ 
  userId, 
  compact = false,
  className = ''
}) => {
  const { data: userGroupsData, isLoading } = useUserGroups(userId);
  
  if (isLoading) {
    return <Spinner size="sm" animation="border" className="text-muted" />;
  }
  
  const groups = userGroupsData?.groups || [];
  
  if (!groups || !groups.length) {
    return compact ? (
      <span className="text-muted small">-</span>
    ) : (
      <small className="text-muted">No groups</small>
    );
  }
  
  if (compact) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            <div>
              {groups.map((group: any) => (
                <div key={group.id}>
                  <FontAwesomeIcon icon={faUsersCog} className="me-1" />
                  {group.name}
                </div>
              ))}
            </div>
          </Tooltip>
        }
      >
        <div className={`d-flex align-items-center ${className}`}>
          <FontAwesomeIcon icon={faUsersCog} className="me-1 text-primary" size="xs" />
          <small className="text-truncate" style={{ maxWidth: '60px' }}>
            {groups.length === 1 ? groups[0].name : `${groups.length} groups`}
          </small>
        </div>
      </OverlayTrigger>
    );
  }
  
  return (
    <div className={`d-flex flex-wrap gap-2 ${className}`}>
      {groups.map((group: any) => {
        // Determine badge style based on group type
        let badgeVariant = 'primary';
        let badgeIcon = faUsersCog;
        
        switch (group.type) {
          case 'system':
            badgeVariant = 'success';
            badgeIcon = faShieldAlt;
            break;
          case 'corporation':
            badgeVariant = 'info';
            badgeIcon = faBuilding;
            break;
          case 'alliance':
            badgeVariant = 'warning';
            badgeIcon = faGlobe;
            break;
          case 'custom':
            badgeVariant = 'secondary';
            badgeIcon = faUsersCog;
            break;
          default:
            badgeVariant = 'primary';
            badgeIcon = faUsersCog;
        }
        
        return (
          <Card 
            key={group.id} 
            className="border-0 shadow-sm" 
            style={{ minWidth: '180px' }}
          >
            <Card.Body className="p-2">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center flex-grow-1">
                  <Badge 
                    bg={badgeVariant} 
                    className="me-2 d-flex align-items-center"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <FontAwesomeIcon icon={badgeIcon} className="me-1" size="xs" />
                    {group.type}
                  </Badge>
                  <div>
                    <div className="fw-semibold small text-truncate" style={{ maxWidth: '120px' }}>
                      {group.name}
                    </div>
                    {group.description && (
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {group.description.length > 30 
                          ? `${group.description.substring(0, 30)}...` 
                          : group.description}
                      </div>
                    )}
                  </div>
                </div>
                {!group.is_active && (
                  <Badge bg="danger" className="ms-1" style={{ fontSize: '0.6rem' }}>
                    Inactive
                  </Badge>
                )}
              </div>
              {(group.eve_entity_id || group.system_name) && (
                <div className="mt-1">
                  {group.eve_entity_id && (
                    <small className="text-muted d-block">
                      EVE ID: {group.eve_entity_id}
                    </small>
                  )}
                  {group.system_name && (
                    <small className="text-muted d-block">
                      System: {group.system_name}
                    </small>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default GroupsBadges;
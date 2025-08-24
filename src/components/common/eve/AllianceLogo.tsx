import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

interface AllianceLogoProps {
  allianceId?: number | null;
  allianceName?: string;
  size?: number;
  className?: string;
}

const AllianceLogo: React.FC<AllianceLogoProps> = ({ 
  allianceId, 
  allianceName, 
  size = 24,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (imageError || !allianceId) {
    return (
      <div 
        className={`rounded bg-light border d-flex align-items-center justify-content-center ${className}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`
        }}
      >
        <FontAwesomeIcon 
          icon={faGlobe} 
          className="text-muted" 
          size="xs" 
        />
      </div>
    );
  }
  
  return (
    <img
      src={`https://images.evetech.net/alliances/${allianceId}/logo?size=${size > 24 ? 128 : 64}`}
      alt={allianceName || 'Alliance Logo'}
      className={`rounded border ${className}`}
      width={size}
      height={size}
      style={{ objectFit: 'cover' }}
      onError={handleImageError}
    />
  );
};

export default AllianceLogo;
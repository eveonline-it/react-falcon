import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

interface CorporationLogoProps {
  corporationId?: number | null;
  corporationName?: string;
  size?: number;
  className?: string;
}

const CorporationLogo: React.FC<CorporationLogoProps> = ({ 
  corporationId, 
  corporationName, 
  size = 24,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (imageError || !corporationId) {
    return (
      <div 
        className={`rounded bg-light border d-flex align-items-center justify-content-center ${className}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`
        }}
      >
        <FontAwesomeIcon 
          icon={faBuilding} 
          className="text-muted" 
          size="xs" 
        />
      </div>
    );
  }
  
  return (
    <img
      src={`https://images.evetech.net/corporations/${corporationId}/logo?size=${size > 24 ? 128 : 64}`}
      alt={corporationName || 'Corporation Logo'}
      className={`rounded border ${className}`}
      width={size}
      height={size}
      style={{ objectFit: 'cover' }}
      onError={handleImageError}
    />
  );
};

export default CorporationLogo;
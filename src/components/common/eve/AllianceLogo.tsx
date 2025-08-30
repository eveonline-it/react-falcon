import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

interface AllianceLogoProps {
  allianceId?: number | string | null;
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
    console.error('Alliance logo failed to load for ID:', allianceId);
    setImageError(true);
  };

  // Convert to number and check validity
  const numericId =
    typeof allianceId === 'string' ? parseInt(allianceId, 10) : allianceId;

  if (imageError || !numericId || isNaN(numericId)) {
    return (
      <div
        className={`rounded bg-light border d-flex align-items-center justify-content-center ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      >
        <FontAwesomeIcon icon={faGlobe} className="text-muted" size="xs" />
      </div>
    );
  }

  return (
    <img
      src={`https://images.evetech.net/alliances/${numericId}/logo?size=${size > 24 ? 128 : 64}`}
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

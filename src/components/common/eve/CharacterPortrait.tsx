import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface CharacterPortraitProps {
  characterId?: number | null;
  characterName?: string;
  size?: number;
  className?: string;
}

const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ 
  characterId, 
  characterName, 
  size = 32,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (imageError || !characterId) {
    return (
      <div 
        className={`rounded-circle bg-secondary d-flex align-items-center justify-content-center ${className}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`
        }}
      >
        <FontAwesomeIcon 
          icon={faUser} 
          className="text-white" 
          size={size > 64 ? '2x' : 'sm'} 
        />
      </div>
    );
  }
  
  return (
    <img
      src={`https://images.evetech.net/characters/${characterId}/portrait?size=${size > 32 ? 256 : 64}`}
      alt={characterName || 'Character Portrait'}
      className={`rounded-circle ${className}`}
      width={size}
      height={size}
      style={{ objectFit: 'cover' }}
      onError={handleImageError}
    />
  );
};

export default CharacterPortrait;
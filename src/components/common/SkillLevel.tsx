import React from 'react';
import { useAppContext } from 'providers/AppProvider';

interface SkillLevelProps {
  name: string;
  level?: number;
}

const SkillLevel: React.FC<SkillLevelProps> = ({ name, level = 0 }) => {
  const { getThemeColor } = useAppContext();
  
  if (!name) return null;
  
  // Ensure level is within the range of 0 to 5
  const validatedLevel = Math.min(Math.max(level, 0), 5);

  // Create an array with length equal to level
  const filledSquares = Array(validatedLevel).fill(null);

  return (
    <div className="skill-level d-flex align-items-center mb-1">
      {filledSquares.map((_, index) => (
        <div key={index} className="skill-square-filled me-1" style={{ color: getThemeColor('primary') }}>
          ■
        </div>
      ))}
      {[...Array(5 - validatedLevel)].map((_, index) => (
        <div key={index} className="skill-square me-1" style={{ color: getThemeColor('gray-300') }}>
          ☐
        </div>
      ))}
      <span className="skill-name mx-2 fs-10 align-middle text-600">{name}</span>
    </div>
  );
};

export default SkillLevel;
import React from 'react';
import { FLAVOR_COLORS } from '../constants';

interface FlavorTagProps {
  flavor: string;
  size?: 'sm' | 'md';
}

const FlavorTag: React.FC<FlavorTagProps> = ({ flavor, size = 'md' }) => {
  // Simple heuristic to find a matching color key or default
  const colorKey = Object.keys(FLAVOR_COLORS).find(key => flavor.toLowerCase().includes(key.toLowerCase())) || 'Sweet';
  const gradient = FLAVOR_COLORS[colorKey];
  
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`rounded-full bg-gradient-to-r ${gradient} text-white font-medium shadow-sm ${sizeClasses}`}>
      {flavor}
    </span>
  );
};

export default FlavorTag;
import React from 'react';

interface RoastIndicatorProps {
  level?: 'light' | 'medium' | 'dark' | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const RoastIndicator: React.FC<RoastIndicatorProps> = ({
  level = 'medium',
  showLabel = true,
  size = 'sm',
}) => {
  if (!level) return null;

  const activeLevel = level.toLowerCase();

  return (
    <div className="flex items-center gap-2">
      {/* 3-step roast bar */}
      <div className="flex items-center gap-1" title={`Roast Profile: ${level.toUpperCase()}`}>
        <div
          className={`h-1.5 rounded-xs transition-colors ${
            size === 'sm' ? 'w-4' : 'w-6'
          } ${
            activeLevel === 'light' || activeLevel === 'medium' || activeLevel === 'dark'
              ? 'bg-[#E3A857]'
              : 'bg-[#2B1D16]/15'
          }`}
        />
        <div
          className={`h-1.5 rounded-xs transition-colors ${
            size === 'sm' ? 'w-4' : 'w-6'
          } ${
            activeLevel === 'medium' || activeLevel === 'dark'
              ? 'bg-[#C2622D]'
              : 'bg-[#2B1D16]/15'
          }`}
        />
        <div
          className={`h-1.5 rounded-xs transition-colors ${
            size === 'sm' ? 'w-4' : 'w-6'
          } ${
            activeLevel === 'dark' ? 'bg-[#2B1D16]' : 'bg-[#2B1D16]/15'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-[11px] font-medium tracking-wide uppercase text-[#2B1D16]/70">
          {level} Roast
        </span>
      )}
    </div>
  );
};

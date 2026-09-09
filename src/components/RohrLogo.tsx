import React from 'react';

interface RohrLogoIconProps {
  className?: string;
}

/**
 * ROHR FINANCIAL - Red Temple & Upward Growth Arrow Icon Mark
 * Faithfully vectorized from the brand identity image.
 */
export const RohrLogoIcon: React.FC<RohrLogoIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg
    viewBox="0 0 160 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="ROHR Financial Logo Icon"
  >
    <path
      d="M 80 8 L 148 72 L 104 72 L 104 146 L 118 146 L 118 84 L 141 84 L 141 137 C 146 140, 150 144, 147 148 L 144 153 L 15 186 C 10 183, 9 177, 13 172 L 19 166 L 19 84 L 42 84 L 42 164 L 56 164 L 56 72 L 12 72 Z"
      fill="#EE4141"
    />
  </svg>
);

interface RohrLogoProps {
  theme?: 'light' | 'dark';
  className?: string;
  iconOnly?: boolean;
}

/**
 * Complete ROHR FINANCIAL Brand Component (Icon + Custom Typography)
 */
export const RohrLogo: React.FC<RohrLogoProps> = ({
  theme = 'light',
  className = '',
  iconOnly = false,
}) => {
  if (iconOnly) {
    return <RohrLogoIcon className={className || 'w-10 h-10'} />;
  }

  const isDark = theme === 'dark';
  const primaryColor = isDark ? 'text-white' : 'text-[#0E1B3D]';
  const secondaryColor = isDark ? 'text-slate-200' : 'text-[#0E1B3D]';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="shrink-0 flex items-center justify-center">
        <RohrLogoIcon className="h-10 sm:h-11 w-auto" />
      </div>
      <div className="flex flex-col select-none leading-none">
        <span className={`font-black text-2xl sm:text-[26px] tracking-tight ${primaryColor}`}>
          ROHR
        </span>
        <span className={`font-extrabold text-[10px] sm:text-[11px] tracking-[0.24em] uppercase mt-0.5 ${secondaryColor}`}>
          FINANCIAL
        </span>
      </div>
    </div>
  );
};

export default RohrLogo;

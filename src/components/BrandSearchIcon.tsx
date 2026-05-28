import React from 'react';
import { cn } from '../lib/utils';

interface BrandSearchIconProps {
  className?: string;
  size?: number;
}

export function BrandSearchIcon({ className, size = 24 }: BrandSearchIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-transform group-hover:scale-110", className)}
    >
      {/* Search Ring */}
      <circle 
        cx="11" 
        cy="11" 
        r="7" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      {/* Handle */}
      <path 
        d="M16 16L20 20" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
      {/* Nigeria Pulse Bolt hint inside the glass */}
      <path 
        d="M12 7L9 11.5H11.5L10 15" 
        stroke="#FCD116" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  );
}

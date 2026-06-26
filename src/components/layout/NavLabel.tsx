import React from 'react';
import { motion } from 'framer-motion';

interface NavLabelProps {
  label: string;
  isActive: boolean;
}

export const NavLabel: React.FC<NavLabelProps> = ({ label, isActive }) => {
  return (
    <span className="relative inline-block group">
      {label}
      
      {/* 1. ACTIVE STATE: Sharp Brackets via Framer Motion */}
      {isActive ? (
        <>
          {/* Left Active Bracket */}
          <motion.span
            layoutId="bracket-left"
            className="absolute left-[-12px] top-0.5 w-1.5 h-3 border-t-2 border-l-2 border-accent"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          {/* Right Active Bracket */}
          <motion.span
            layoutId="bracket-right"
            className="absolute right-[-12px] top-1.5 w-1.5 h-3 border-b-2 border-r-2 border-accent"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </>
      ) : (
        /* 2. HOVER STATE: Ghost Brackets via Tailwind Transitions */
        <>
          {/* Left Ghost Bracket */}
          <span className="absolute left-[-16px] top-0.5 w-1.5 h-3 border-t-2 border-l-2 border-accent/0 opacity-0 scale-75 transition-all duration-300 group-hover:left-[-12px] group-hover:border-accent group-hover:opacity-40 group-hover:scale-100" />
          {/* Right Ghost Bracket */}
          <span className="absolute right-[-16px] top-1.5 w-1.5 h-3 border-b-2 border-r-2 border-accent/0 opacity-0 scale-75 transition-all duration-300 group-hover:right-[-12px] group-hover:border-accent group-hover:opacity-40 group-hover:scale-100" />
        </>
      )}
    </span>
  );
};
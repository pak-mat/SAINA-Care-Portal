import React from 'react';

export default function SainaLogo({ className = "w-full h-full object-contain" }) {
  return (
    <img 
      src="/logo.png" 
      alt="Saina Care Portal Logo" 
      className={className} 
    />
  );
}

'use client';
import React from 'react';
import { Avatar, Identity, Name, Address } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

interface DisplayBasenameProps {
  address: `0x${string}`;
  className?: string;
}

/**
 * DisplayBasename Component - Following Official OnchainKit Tutorial
 * 
 * This component demonstrates the correct way to integrate Basenames
 * using OnchainKit according to the official Base documentation.
 * 
 * Key points from the tutorial:
 * 1. Always set chain={base} to ensure Basenames resolution (not ENS)
 * 2. Use the Identity component as a wrapper
 * 3. Include Avatar, Name, and Address components
 */
export function DisplayBasename({ address, className }: DisplayBasenameProps) {
  return (
    <div className={`flex items-center space-x-3 ${className || ''}`}>
      <Identity 
        address={address} 
        chain={base}
        hasCopyAddressOnClick
      >
        <Avatar chain={base} />
        <div className="flex flex-col">
          <Name chain={base} />
          <Address chain={base} />
        </div>
      </Identity>
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function CompactBasename({ address, className }: DisplayBasenameProps) {
  return (
    <Identity 
      address={address} 
      chain={base}
      className={`flex items-center space-x-2 ${className || ''}`}
    >
      <Avatar chain={base} className="w-6 h-6" />
      <Name chain={base} />
    </Identity>
  );
}

/**
 * Avatar only version
 */
export function BasenameAvatar({ address, className }: DisplayBasenameProps) {
  return (
    <Avatar 
      address={address} 
      chain={base} 
      className={className || 'w-8 h-8'} 
    />
  );
}

/**
 * Name only version
 */
export function BasenameName({ address, className }: DisplayBasenameProps) {
  return (
    <Name 
      address={address} 
      chain={base} 
      className={className} 
    />
  );
}

export default DisplayBasename;

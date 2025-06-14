// TRUE OnchainKit Basenames Integration - Following Official Tutorial
import React from 'react';
import {
  Avatar as OnchainAvatar,
  Name as OnchainName,
  Address as OnchainAddress,
  Identity as OnchainIdentity
} from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

// Export OnchainKit components directly - TRUE INTEGRATION
export const Avatar = OnchainAvatar;
export const Name = OnchainName;
export const Address = OnchainAddress;
export const Identity = OnchainIdentity;

// Enhanced wrapper components for additional functionality
interface EnhancedIdentityProps {
  address?: string;
  className?: string;
  hasCopyAddressOnClick?: boolean;
  children?: React.ReactNode;
}

export const EnhancedIdentity: React.FC<EnhancedIdentityProps> = ({
  address,
  className = "",
  hasCopyAddressOnClick = true,
  children
}) => {
  if (!address) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
          ?
        </div>
        <span className="text-gray-400">No wallet connected</span>
      </div>
    );
  }

  return (
    <OnchainIdentity
      address={address as `0x${string}`}
      chain={base}
      className={className}
      hasCopyAddressOnClick={hasCopyAddressOnClick}
    >
      {children || (
        <>
          <OnchainAvatar chain={base} />
          <OnchainName chain={base} />
          <OnchainAddress chain={base} />
        </>
      )}
    </OnchainIdentity>
  );
};

// Wrapper for Avatar with fallback
interface EnhancedAvatarProps {
  address?: string;
  className?: string;
}

export const EnhancedAvatar: React.FC<EnhancedAvatarProps> = ({ address, className }) => {
  if (!address) {
    return (
      <div className={`w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs ${className}`}>
        ?
      </div>
    );
  }

  return <OnchainAvatar address={address as `0x${string}`} chain={base} className={className} />;
};

// Wrapper for Name with fallback
interface EnhancedNameProps {
  address?: string;
  className?: string;
}

export const EnhancedName: React.FC<EnhancedNameProps> = ({ address, className }) => {
  if (!address) {
    return <span className={className}>Unknown</span>;
  }

  return <OnchainName address={address as `0x${string}`} chain={base} className={className} />;
};

// Wrapper for Address with fallback
interface EnhancedAddressProps {
  address?: string;
  className?: string;
}

export const EnhancedAddress: React.FC<EnhancedAddressProps> = ({ address, className }) => {
  if (!address) {
    return <span className={className}>No address</span>;
  }

  return <OnchainAddress address={address as `0x${string}`} chain={base} className={className} />;
};

export default {
  Avatar,
  Name,
  Address,
  Identity,
  EnhancedIdentity,
  EnhancedAvatar,
  EnhancedName,
  EnhancedAddress,
};

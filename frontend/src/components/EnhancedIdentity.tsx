import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Name,
  Address,
  Identity,
  Badge
} from '@coinbase/onchainkit/identity';
import { Copy, ExternalLink, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedIdentityProps {
  address?: string;
  className?: string;
  showLevel?: boolean;
  showXP?: boolean;
  showBadges?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface UserProfile {
  address: string;
  basename?: string;
  level: number;
  xp: number;
  badges: string[];
  isVerified: boolean;
  joinedDate: number;
}

export const EnhancedIdentity: React.FC<EnhancedIdentityProps> = ({
  address,
  className = "",
  showLevel = true,
  showXP = true,
  showBadges = true,
  interactive = true,
  size = 'md'
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (address) {
      fetchUserProfile(address);
    }
  }, [address]);

  const fetchUserProfile = async (userAddress: string) => {
    setLoading(true);
    try {
      // Mock profile data - in production, this would fetch from your backend
      const mockProfile: UserProfile = {
        address: userAddress,
        basename: userAddress === '0x97f14d6031b64f9e82153a69458b5b9af8248ee6' ? 'cryptarpit.base' : undefined,
        level: Math.floor(Math.random() * 50) + 1,
        xp: Math.floor(Math.random() * 10000),
        badges: ['🎮', '🏆', '💎'],
        isVerified: Math.random() > 0.5,
        joinedDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          avatar: 'w-8 h-8',
          text: 'text-sm',
          badge: 'text-xs px-1.5 py-0.5'
        };
      case 'lg':
        return {
          container: 'p-6',
          avatar: 'w-16 h-16',
          text: 'text-lg',
          badge: 'text-sm px-3 py-1'
        };
      default:
        return {
          container: 'p-4',
          avatar: 'w-12 h-12',
          text: 'text-base',
          badge: 'text-xs px-2 py-1'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (!address) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`${sizeClasses.avatar} bg-gray-500 rounded-full flex items-center justify-center text-white ${sizeClasses.text}`}>
          <User size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        </div>
        <span className="text-gray-400">No wallet connected</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`${sizeClasses.avatar} bg-gray-300 rounded-full animate-pulse`} />
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-24" />
          <div className="h-3 bg-gray-300 rounded animate-pulse w-32" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 ${sizeClasses.container} ${className}`}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar and Basic Identity */}
        <div className="flex-shrink-0">
          <Identity
            address={address as `0x${string}`}
            className="flex items-center space-x-3"
          >
            <Avatar className={sizeClasses.avatar} />
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <Name className={`font-semibold ${sizeClasses.text}`} />
                {profile?.isVerified && (
                  <Badge className="ml-1" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Address className={`text-gray-400 ${sizeClasses.text}`} />
                {interactive && (
                  <button
                    onClick={copyAddress}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy address"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          </Identity>
        </div>

        {/* Enhanced Profile Info */}
        {profile && (
          <div className="flex-1 space-y-2">
            {/* Level and XP */}
            {(showLevel || showXP) && (
              <div className="flex items-center space-x-3">
                {showLevel && (
                  <div className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full ${sizeClasses.badge} font-bold`}>
                    Level {profile.level}
                  </div>
                )}
                {showXP && (
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Star size={14} />
                    <span className={sizeClasses.text}>{profile.xp.toLocaleString()} XP</span>
                  </div>
                )}
              </div>
            )}

            {/* Badges */}
            {showBadges && profile.badges.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 text-sm">Badges:</span>
                {profile.badges.map((badge, index) => (
                  <span key={index} className="text-lg">{badge}</span>
                ))}
              </div>
            )}

            {/* Member Since */}
            <div className="text-gray-400 text-sm">
              Member since {new Date(profile.joinedDate).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Actions */}
        {interactive && (
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => window.open(`https://sepolia.basescan.org/address/${address}`, '_blank')}
              className="text-gray-400 hover:text-white transition-colors"
              title="View on Base Sepolia"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Copy Feedback */}
      {copied && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Copied!
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedIdentity;

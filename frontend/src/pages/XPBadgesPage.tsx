import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Crown, Medal, Award, TrendingUp, 
  Zap, Target, Sparkles, Users, Gamepad2, Share2,
  ChevronRight, Gift, Flame, Diamond
} from 'lucide-react';
import { useSimpleWallet } from '../components/SimpleWalletConnect';

interface Badge {
  tokenId: string;
  level: number;
  xp: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  imageUrl: string;
  mintTimestamp: number;
  description: string;
}

interface LeaderboardPlayer {
  rank: number;
  address: string;
  displayName: string;
  level: number;
  xp: number;
  badges: number;
}

interface XPActivity {
  type: string;
  amount: number;
  timestamp: number;
  description: string;
}

export const XPBadgesPage: React.FC = () => {
  const { isConnected, address } = useSimpleWallet();
  const [userXP, setUserXP] = useState(2450);
  const [userLevel, setUserLevel] = useState(24);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [recentActivity, setRecentActivity] = useState<XPActivity[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard' | 'activity'>('overview');

  // Mock data
  useEffect(() => {
    const mockBadges: Badge[] = [
      {
        tokenId: '1',
        level: 24,
        xp: 2450,
        rarity: 'Rare',
        imageUrl: '/api/placeholder/200/200',
        mintTimestamp: Date.now() - 86400000,
        description: 'Achieved level 24 through consistent gaming'
      },
      {
        tokenId: '2',
        level: 20,
        xp: 2000,
        rarity: 'Rare',
        imageUrl: '/api/placeholder/200/200',
        mintTimestamp: Date.now() - 172800000,
        description: 'Reached the rare tier milestone'
      },
      {
        tokenId: '3',
        level: 15,
        xp: 1500,
        rarity: 'Uncommon',
        imageUrl: '/api/placeholder/200/200',
        mintTimestamp: Date.now() - 259200000,
        description: 'First uncommon achievement'
      }
    ];

    const mockLeaderboard: LeaderboardPlayer[] = [
      { rank: 1, address: '0x123...', displayName: 'CryptoGamer', level: 45, xp: 4520, badges: 8 },
      { rank: 2, address: '0x456...', displayName: 'DiceKing', level: 38, xp: 3890, badges: 6 },
      { rank: 3, address: '0x789...', displayName: 'LuckyPlayer', level: 32, xp: 3250, badges: 5 },
      { rank: 4, address: address || '0xabc...', displayName: 'You', level: userLevel, xp: userXP, badges: 3 },
      { rank: 5, address: '0xdef...', displayName: 'GameMaster', level: 28, xp: 2890, badges: 4 }
    ];

    const mockActivity: XPActivity[] = [
      { type: 'game_win', amount: 25, timestamp: Date.now() - 3600000, description: 'Won dice game' },
      { type: 'tournament', amount: 50, timestamp: Date.now() - 7200000, description: 'Tournament participation' },
      { type: 'referral', amount: 100, timestamp: Date.now() - 86400000, description: 'Friend joined via referral' },
      { type: 'game_win', amount: 15, timestamp: Date.now() - 172800000, description: 'Won coin flip' },
      { type: 'badge_mint', amount: 75, timestamp: Date.now() - 259200000, description: 'Minted level 20 badge' }
    ];

    setUserBadges(mockBadges);
    setLeaderboard(mockLeaderboard);
    setRecentActivity(mockActivity);
  }, [address, userLevel, userXP]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'from-gray-500 to-slate-500';
      case 'Uncommon': return 'from-green-500 to-emerald-500';
      case 'Rare': return 'from-blue-500 to-cyan-500';
      case 'Epic': return 'from-purple-500 to-pink-500';
      case 'Legendary': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '🥉';
      case 'Uncommon': return '🥈';
      case 'Rare': return '🥇';
      case 'Epic': return '💎';
      case 'Legendary': return '👑';
      default: return '🏅';
    }
  };

  const getXPToNextLevel = () => {
    const nextLevelXP = (userLevel + 1) * 100;
    const currentLevelXP = userLevel * 100;
    const progress = userXP - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    return { progress, needed, percentage: (progress / needed) * 100 };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'game_win': return '🎲';
      case 'tournament': return '🏆';
      case 'referral': return '👥';
      case 'badge_mint': return '🏅';
      default: return '⭐';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const xpProgress = getXPToNextLevel();

  return (
    <div className="pt-20 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <Star className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-rainbow">
            XP & Badges
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Track your progress, collect NFT badges, and climb the leaderboards!
        </p>
      </motion.div>

      {/* User Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-gradient"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {/* Level & XP */}
          <div className="text-center space-y-4">
            <motion.div
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {userLevel}
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white">Level {userLevel}</h3>
              <p className="text-gray-400">{userXP.toLocaleString()} Total XP</p>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progress to Level {userLevel + 1}</span>
                <span>{Math.round(xpProgress.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percentage}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {xpProgress.progress}/{xpProgress.needed} XP
              </p>
            </div>
          </div>

          {/* Badges Count */}
          <div className="text-center space-y-4">
            <motion.div
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white">{userBadges.length} Badges</h3>
              <p className="text-gray-400">NFT Collection</p>
            </div>
            <button className="btn-gradient-secondary px-4 py-2 text-sm">
              Mint New Badge
            </button>
          </div>

          {/* Rank */}
          <div className="text-center space-y-4">
            <motion.div
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Crown className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-white">Rank #4</h3>
              <p className="text-gray-400">Global Leaderboard</p>
            </div>
            <button className="btn-outline px-4 py-2 text-sm">
              View Leaderboard
            </button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-800/50 rounded-lg p-1">
          {(['overview', 'badges', 'leaderboard', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-md transition-all capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white text-center">Your Badge Collection</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBadges.map((badge, index) => (
                <motion.div
                  key={badge.tokenId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-gradient group cursor-pointer relative overflow-hidden"
                  onClick={() => setSelectedBadge(badge)}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Rarity Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white text-sm font-semibold`}>
                    {badge.rarity}
                  </div>

                  {/* Badge Image */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-6xl">
                    {getRarityIcon(badge.rarity)}
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-white">Level {badge.level} Badge</h3>
                    <p className="text-gray-400">{badge.xp.toLocaleString()} XP</p>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                    <p className="text-xs text-gray-600">
                      Minted {formatTimeAgo(badge.mintTimestamp)}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="btn-gradient-secondary flex-1 py-2 text-sm flex items-center justify-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white text-center">Global Leaderboard</h2>
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <motion.div
                  key={player.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card-gradient flex items-center justify-between p-4 ${
                    player.address === address ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '🏆'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{player.displayName}</h3>
                      <p className="text-gray-400 text-sm">{player.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">Level {player.level}</div>
                    <div className="text-gray-400 text-sm">{player.xp.toLocaleString()} XP</div>
                    <div className="text-yellow-400 text-sm">{player.badges} badges</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white text-center">Recent XP Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-gradient flex items-center justify-between p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div>
                      <h3 className="text-white font-semibold">{activity.description}</h3>
                      <p className="text-gray-400 text-sm">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">+{activity.amount} XP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

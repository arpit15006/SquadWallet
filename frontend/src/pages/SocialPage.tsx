import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Swords, Share2, Gift, Crown,
  Clock, Trophy, Target, Zap, Copy, Check,
  MessageCircle, Gamepad2, Star, Award
} from 'lucide-react';
import { useSimpleWallet } from '../components/SimpleWalletConnect';

interface Referral {
  address: string;
  displayName: string;
  joinedAt: number;
  bonusEarned: boolean;
  xpEarned: number;
}

interface Challenge {
  id: string;
  challenger: string;
  challenged: string;
  gameType: string;
  betAmount: string;
  status: 'pending' | 'accepted' | 'completed' | 'expired';
  createdAt: number;
  expiresAt: number;
  winner?: string;
}

interface SharedBadge {
  tokenId: string;
  level: number;
  rarity: string;
  sharedBy: string;
  sharedAt: number;
}

export const SocialPage: React.FC = () => {
  const { isConnected, address } = useSimpleWallet();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [sharedBadges, setSharedBadges] = useState<SharedBadge[]>([]);
  const [inviteAddress, setInviteAddress] = useState('');
  const [challengeAddress, setChallengeAddress] = useState('');
  const [challengeGame, setChallengeGame] = useState('dice');
  const [challengeAmount, setChallengeAmount] = useState('0.01');
  const [activeTab, setActiveTab] = useState<'referrals' | 'challenges' | 'shared'>('referrals');
  const [copied, setCopied] = useState(false);

  // Mock data
  useEffect(() => {
    const mockReferrals: Referral[] = [
      {
        address: '0x123...',
        displayName: 'CryptoGamer',
        joinedAt: Date.now() - 86400000,
        bonusEarned: true,
        xpEarned: 175
      },
      {
        address: '0x456...',
        displayName: 'DiceKing',
        joinedAt: Date.now() - 172800000,
        bonusEarned: true,
        xpEarned: 175
      },
      {
        address: '0x789...',
        displayName: 'LuckyPlayer',
        joinedAt: Date.now() - 259200000,
        bonusEarned: false,
        xpEarned: 100
      }
    ];

    const mockChallenges: Challenge[] = [
      {
        id: 'challenge-1',
        challenger: address || '0xabc...',
        challenged: '0x123...',
        gameType: 'dice',
        betAmount: '0.01',
        status: 'pending',
        createdAt: Date.now() - 3600000,
        expiresAt: Date.now() + 82800000
      },
      {
        id: 'challenge-2',
        challenger: '0x456...',
        challenged: address || '0xabc...',
        gameType: 'coinflip',
        betAmount: '0.005',
        status: 'accepted',
        createdAt: Date.now() - 7200000,
        expiresAt: Date.now() + 79200000
      },
      {
        id: 'challenge-3',
        challenger: address || '0xabc...',
        challenged: '0x789...',
        gameType: 'dice',
        betAmount: '0.02',
        status: 'completed',
        createdAt: Date.now() - 86400000,
        expiresAt: Date.now() - 3600000,
        winner: address || '0xabc...'
      }
    ];

    const mockSharedBadges: SharedBadge[] = [
      {
        tokenId: '1',
        level: 25,
        rarity: 'Rare',
        sharedBy: '0x123...',
        sharedAt: Date.now() - 3600000
      },
      {
        tokenId: '2',
        level: 30,
        rarity: 'Epic',
        sharedBy: '0x456...',
        sharedAt: Date.now() - 7200000
      }
    ];

    setReferrals(mockReferrals);
    setChallenges(mockChallenges);
    setSharedBadges(mockSharedBadges);
  }, [address]);

  const totalReferralXP = referrals.reduce((sum, ref) => sum + ref.xpEarned, 0);

  const handleInvite = () => {
    if (!inviteAddress) return;
    // In real implementation, this would send an XMTP message
    console.log('Inviting:', inviteAddress);
    setInviteAddress('');
  };

  const handleChallenge = () => {
    if (!challengeAddress) return;
    // In real implementation, this would create a challenge
    console.log('Challenging:', challengeAddress, challengeGame, challengeAmount);
    setChallengeAddress('');
  };

  const copyReferralLink = () => {
    const referralLink = `https://squadwallet.xyz/invite/${address}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'from-yellow-500 to-orange-500';
      case 'accepted': return 'from-blue-500 to-cyan-500';
      case 'completed': return 'from-green-500 to-emerald-500';
      case 'expired': return 'from-gray-500 to-slate-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

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

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const formatTimeRemaining = (timestamp: number) => {
    const remaining = timestamp - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

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
            className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center"
          >
            <Users className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-rainbow">
            Social Hub
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Invite friends, challenge players, and share your achievements!
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="card-gradient text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{referrals.length}</h3>
          <p className="text-gray-400">Friends Invited</p>
          <p className="text-green-400 text-sm">+{totalReferralXP} XP earned</p>
        </div>

        <div className="card-gradient text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{challenges.length}</h3>
          <p className="text-gray-400">Challenges</p>
          <p className="text-blue-400 text-sm">
            {challenges.filter(c => c.status === 'pending').length} pending
          </p>
        </div>

        <div className="card-gradient text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">{sharedBadges.length}</h3>
          <p className="text-gray-400">Badges Shared</p>
          <p className="text-purple-400 text-sm">Recent activity</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Invite Friend */}
        <div className="card-gradient">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            <span>Invite Friend</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Friend's Address</label>
              <input
                type="text"
                value={inviteAddress}
                onChange={(e) => setInviteAddress(e.target.value)}
                placeholder="0x... or username.base.eth"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleInvite}
                disabled={!inviteAddress || !isConnected}
                className="btn-gradient-rainbow flex-1 py-3 flex items-center justify-center space-x-2"
              >
                <Gift className="w-5 h-5" />
                <span>Send Invite</span>
              </button>
              <button
                onClick={copyReferralLink}
                className="btn-outline px-4 py-3 flex items-center space-x-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Both you and your friend get +100 XP when they join!
            </p>
          </div>
        </div>

        {/* Challenge Player */}
        <div className="card-gradient">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Swords className="w-5 h-5 text-red-400" />
            <span>Challenge Player</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Player Address</label>
              <input
                type="text"
                value={challengeAddress}
                onChange={(e) => setChallengeAddress(e.target.value)}
                placeholder="0x... or username.base.eth"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Game</label>
                <select
                  value={challengeGame}
                  onChange={(e) => setChallengeGame(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="dice">Dice</option>
                  <option value="coinflip">Coin Flip</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Bet Amount</label>
                <input
                  type="number"
                  value={challengeAmount}
                  onChange={(e) => setChallengeAmount(e.target.value)}
                  step="0.001"
                  min="0.001"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleChallenge}
              disabled={!challengeAddress || !isConnected}
              className="btn-gradient-secondary w-full py-3 flex items-center justify-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>Send Challenge</span>
            </button>
            <p className="text-xs text-gray-500">
              Winner takes all! Challenge expires in 24 hours.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-gray-800/50 rounded-lg p-1">
          {(['referrals', 'challenges', 'shared'] as const).map((tab) => (
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
        {activeTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white text-center">Your Referrals</h2>
            {referrals.length === 0 ? (
              <div className="card-gradient text-center py-12">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-white mb-2">No referrals yet</h3>
                <p className="text-gray-400">Invite friends to start earning bonus XP!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral, index) => (
                  <motion.div
                    key={referral.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-gradient flex items-center justify-between p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{referral.displayName}</h3>
                        <p className="text-gray-400 text-sm">{referral.address}</p>
                        <p className="text-gray-500 text-xs">Joined {formatTimeAgo(referral.joinedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">+{referral.xpEarned} XP</div>
                      <div className={`text-sm ${referral.bonusEarned ? 'text-green-400' : 'text-yellow-400'}`}>
                        {referral.bonusEarned ? 'Bonus earned' : 'Pending bonus'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white text-center">Your Challenges</h2>
            {challenges.length === 0 ? (
              <div className="card-gradient text-center py-12">
                <Swords className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-white mb-2">No challenges yet</h3>
                <p className="text-gray-400">Challenge friends to head-to-head games!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-gradient p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(challenge.status)} text-white text-sm font-semibold`}>
                        {challenge.status}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {challenge.status === 'pending' || challenge.status === 'accepted' 
                          ? `Expires in ${formatTimeRemaining(challenge.expiresAt)}`
                          : formatTimeAgo(challenge.createdAt)
                        }
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold capitalize">
                          {challenge.gameType} Challenge
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {challenge.challenger === address ? 'You' : challenge.challenger} vs{' '}
                          {challenge.challenged === address ? 'You' : challenge.challenged}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Bet: {challenge.betAmount} ETH
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {challenge.status === 'pending' && challenge.challenged === address && (
                          <>
                            <button className="btn-gradient-rainbow px-4 py-2 text-sm">
                              Accept
                            </button>
                            <button className="btn-outline px-4 py-2 text-sm">
                              Decline
                            </button>
                          </>
                        )}
                        {challenge.status === 'completed' && challenge.winner && (
                          <div className="text-right">
                            <div className={`font-semibold ${
                              challenge.winner === address ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {challenge.winner === address ? 'You Won!' : 'You Lost'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'shared' && (
          <motion.div
            key="shared"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white text-center">Shared Achievements</h2>
            {sharedBadges.length === 0 ? (
              <div className="card-gradient text-center py-12">
                <Share2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-white mb-2">No shared badges yet</h3>
                <p className="text-gray-400">Share your achievements with the community!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sharedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.tokenId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-gradient p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRarityColor(badge.rarity)} flex items-center justify-center text-2xl`}>
                        🏅
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">Level {badge.level} Badge</h3>
                        <p className="text-gray-400 text-sm">{badge.rarity} Rarity</p>
                        <p className="text-gray-500 text-xs">
                          Shared by {badge.sharedBy} • {formatTimeAgo(badge.sharedAt)}
                        </p>
                      </div>
                      <button className="btn-outline px-3 py-2 text-sm">
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

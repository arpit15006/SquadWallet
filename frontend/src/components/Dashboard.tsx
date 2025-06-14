import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, Trophy, Star, Users, Zap, Target, 
  Crown, Gift, Flame, TrendingUp, Award, Coins
} from 'lucide-react';
import { useSimpleWallet } from './SimpleWalletConnect';

interface DashboardProps {
  userStats?: {
    level: number;
    xp: number;
    gamesPlayed: number;
    gamesWon: number;
    totalEarned: string;
    badges: number;
    rank: number;
    referrals: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ userStats }) => {
  const { isConnected } = useSimpleWallet();

  // Mock data if no userStats provided
  const stats = userStats || {
    level: 24,
    xp: 2450,
    gamesPlayed: 47,
    gamesWon: 32,
    totalEarned: '2.3',
    badges: 3,
    rank: 156,
    referrals: 5
  };

  const quickActions = [
    {
      title: 'Play Instant Game',
      description: 'Quick dice or coin flip',
      icon: Zap,
      href: '/game',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.1
    },
    {
      title: 'Join Tournament',
      description: 'Compete for prizes',
      icon: Trophy,
      href: '/tournaments',
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.2
    },
    {
      title: 'Check XP & Badges',
      description: 'View your progress',
      icon: Star,
      href: '/xp',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.3
    },
    {
      title: 'Invite Friends',
      description: 'Earn bonus XP',
      icon: Users,
      href: '/social',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.4
    }
  ];

  const achievements = [
    {
      title: 'Level 24 Reached',
      description: 'Rare tier unlocked',
      icon: Crown,
      color: 'text-yellow-400',
      time: '2 hours ago'
    },
    {
      title: 'Tournament Winner',
      description: 'Daily Dice Championship',
      icon: Trophy,
      color: 'text-green-400',
      time: '1 day ago'
    },
    {
      title: 'Friend Joined',
      description: '+100 XP bonus earned',
      icon: Gift,
      color: 'text-purple-400',
      time: '2 days ago'
    }
  ];

  if (!isConnected) {
    return (
      <div className="card-gradient text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
          <p className="text-gray-400">Connect your wallet to view your dashboard and start playing!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Level', value: stats.level, icon: Crown, gradient: 'from-yellow-500 to-orange-500' },
          { label: 'XP', value: stats.xp.toLocaleString(), icon: Star, gradient: 'from-purple-500 to-pink-500' },
          { label: 'Win Rate', value: `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`, icon: Target, gradient: 'from-green-500 to-emerald-500' },
          { label: 'Rank', value: `#${stats.rank}`, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-gradient text-center group cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Flame className="w-6 h-6 text-orange-400" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: action.delay }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Link
                  to={action.href}
                  className="card-gradient block group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <motion.div
                      className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </div>
                  
                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity & Achievements */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-gradient"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span>Recent Achievements</span>
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ${achievement.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{achievement.title}</h4>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                  </div>
                  <div className="text-gray-500 text-xs">{achievement.time}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card-gradient"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span>Progress Overview</span>
          </h3>
          <div className="space-y-6">
            {/* Level Progress */}
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Level {stats.level} Progress</span>
                <span>{Math.round(((stats.xp % 100) / 100) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.xp % 100) / 100) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.badges}</div>
                <div className="text-gray-400 text-sm">NFT Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.referrals}</div>
                <div className="text-gray-400 text-sm">Referrals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.totalEarned} ETH</div>
                <div className="text-gray-400 text-sm">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.gamesPlayed}</div>
                <div className="text-gray-400 text-sm">Games Played</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
              <Link to="/xp" className="btn-gradient-secondary flex-1 py-2 text-sm text-center">
                View Badges
              </Link>
              <Link to="/social" className="btn-outline flex-1 py-2 text-sm text-center">
                Invite Friends
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

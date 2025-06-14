import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Gamepad2, MessageCircle, Trophy, Shield, Zap, 
  Wallet, TrendingUp, ArrowRight, Star, Sparkles,
  Coins, Target, Crown, Rocket
} from 'lucide-react';
import { useSimpleWallet } from '../components/SimpleWalletConnect';
import { Dashboard } from '../components/Dashboard';

export const HomePage: React.FC = () => {
  const { isConnected } = useSimpleWallet();

  const features = [
    {
      icon: Users,
      title: 'Group Wallets',
      description: 'Create shared wallets with friends for group expenses and collaborative DeFi.',
      gradient: 'from-blue-400 to-cyan-400',
      delay: 0.1
    },
    {
      icon: Gamepad2,
      title: 'Mini Games',
      description: 'Play dice and coin flip games with provably fair randomness using Chainlink VRF.',
      gradient: 'from-purple-400 to-pink-400',
      delay: 0.2
    },
    {
      icon: MessageCircle,
      title: 'AI Agent',
      description: 'Chat with our AI agent for price alerts, portfolio management, and wallet operations.',
      gradient: 'from-green-400 to-emerald-400',
      delay: 0.3
    },
    {
      icon: Trophy,
      title: 'XP & Badges',
      description: 'Earn XP and collect NFT badges for your activities and achievements.',
      gradient: 'from-yellow-400 to-orange-400',
      delay: 0.4
    },
    {
      icon: Shield,
      title: 'Non-Custodial',
      description: 'Your funds are always under your control with transparent smart contracts.',
      gradient: 'from-red-400 to-pink-400',
      delay: 0.5
    },
    {
      icon: Zap,
      title: 'Base Network',
      description: 'Fast and cheap transactions on Base with seamless user experience.',
      gradient: 'from-indigo-400 to-purple-400',
      delay: 0.6
    }
  ];

  const stats = [
    { label: 'Total Wallets', value: '12,345', icon: Wallet, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users', value: '56,789', icon: Users, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Games Played', value: '123,456', icon: Gamepad2, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Total Volume', value: '$2.3M', icon: TrendingUp, gradient: 'from-yellow-500 to-orange-500' }
  ];

  return (
    <div className="pt-20 space-y-32">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass border border-purple-500/30 mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-purple-300 font-semibold">The Future of Group Finance</span>
              <Crown className="w-5 h-5 text-yellow-400" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black leading-tight">
              <span className="block gradient-text-rainbow font-['Space_Grotesk']">Squad</span>
              <span className="block gradient-text-secondary font-['Space_Grotesk']">Wallet</span>
            </h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Create shared wallets, play games, and manage funds together with your squad.
              Powered by <span className="gradient-text-purple font-semibold">XMTP messaging</span> and{' '}
              <span className="gradient-text-pink font-semibold">Base blockchain</span> for the ultimate DeFi experience.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {isConnected ? (
                <>
                  <Link to="/wallet" className="btn-gradient-rainbow text-lg px-8 py-4 flex items-center space-x-3 group">
                    <Wallet className="w-6 h-6" />
                    <span>Open Wallet</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/game" className="btn-gradient-secondary text-lg px-8 py-4 flex items-center space-x-3 group">
                    <Gamepad2 className="w-6 h-6" />
                    <span>Play Games</span>
                    <Target className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </Link>
                </>
              ) : (
                <motion.div 
                  className="glass px-8 py-4 rounded-xl border border-purple-500/30"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-3 text-purple-300">
                    <Rocket className="w-6 h-6" />
                    <span className="text-lg font-semibold">Connect your wallet to get started</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="card-gradient text-center group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -10 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center space-y-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold gradient-text-rainbow font-['Space_Grotesk']">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            SquadWallet combines the best of DeFi, gaming, and social features in one seamless platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="card-gradient group cursor-pointer relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.8 }}
                whileHover={{ scale: 1.02, y: -5 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4 font-['Space_Grotesk']">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Dashboard Section (for connected users) */}
      {isConnected && (
        <section className="relative">
          <motion.div
            className="max-w-7xl mx-auto px-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold gradient-text-rainbow font-['Space_Grotesk'] mb-4">
                Your Dashboard
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Track your progress, play games, and manage your squad activities.
              </p>
            </div>
            <Dashboard />
          </motion.div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative">
        <motion.div
          className="max-w-4xl mx-auto text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="card-gradient relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
            <div className="relative z-10 p-12 space-y-8">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold gradient-text-rainbow font-['Space_Grotesk']">
                {isConnected ? 'Explore More Features' : 'Ready to Squad Up?'}
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {isConnected
                  ? 'Discover tournaments, earn XP, collect badges, and invite friends!'
                  : 'Join thousands of users already managing their funds together with SquadWallet.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                {isConnected ? (
                  <>
                    <Link to="/tournaments" className="btn-gradient-rainbow text-lg px-8 py-4 flex items-center justify-center space-x-3 group">
                      <Trophy className="w-6 h-6" />
                      <span>Join Tournament</span>
                      <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Link>
                    <Link to="/social" className="btn-gradient-secondary text-lg px-8 py-4 flex items-center justify-center space-x-3 group">
                      <Users className="w-6 h-6" />
                      <span>Invite Friends</span>
                      <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/wallet" className="btn-gradient-rainbow text-lg px-8 py-4 flex items-center justify-center space-x-3 group">
                      <Star className="w-6 h-6" />
                      <span>Get Started</span>
                      <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Link>
                    <Link to="/chat" className="btn-gradient-secondary text-lg px-8 py-4 flex items-center justify-center space-x-3 group">
                      <MessageCircle className="w-6 h-6" />
                      <span>Chat with Agent</span>
                      <Coins className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

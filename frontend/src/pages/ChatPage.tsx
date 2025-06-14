import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  Bot, MessageCircle, Zap, Wallet, Gamepad2, TrendingUp, Trophy, Target,
  Users, Star, Sparkles, Crown, Rocket, Shield, Brain, Activity
} from 'lucide-react';
import { AgentChat } from '../components/AgentChat';

export const ChatPage: React.FC = () => {
  const { isConnected } = useAccount();
  const [commandStats, setCommandStats] = useState({
    walletsCreated: 0,
    gamesPlayed: 0,
    swapsExecuted: 0,
    xpEarned: 0
  });

  // Handle command execution from chat
  const handleCommandExecuted = (command: string, result: any) => {
    console.log('Command executed:', command, result);
    
    // Update stats based on command
    setCommandStats(prev => {
      const newStats = { ...prev };
      
      switch (command) {
        case 'create-wallet':
          newStats.walletsCreated += 1;
          newStats.xpEarned += 100;
          break;
        case 'play':
          newStats.gamesPlayed += 1;
          newStats.xpEarned += result.won ? 100 : 50;
          break;
        case 'swap':
          newStats.swapsExecuted += 1;
          newStats.xpEarned += 25;
          break;
        case 'deposit':
          newStats.xpEarned += 50;
          break;
      }
      
      return newStats;
    });
  };

  const quickCommands = [
    {
      command: '/create-wallet MySquad',
      description: 'Create a new squad wallet',
      icon: Wallet,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      command: '/deposit 0.1',
      description: 'Deposit ETH to wallet',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      command: '/play dice 0.01',
      description: 'Play dice game',
      icon: Gamepad2,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      command: '/swap ETH USDC 0.1',
      description: 'Swap tokens',
      icon: Zap,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      command: '/price ETH',
      description: 'Get token price',
      icon: Target,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      command: '/xp',
      description: 'Check your XP',
      icon: Trophy,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const agentFeatures = [
    { name: 'Wallet Management', status: 'active', color: 'bg-green-400' },
    { name: 'Token Swapping', status: 'active', color: 'bg-blue-400' },
    { name: 'Game Creation', status: 'active', color: 'bg-purple-400' },
    { name: 'Price Alerts', status: 'active', color: 'bg-yellow-400' },
    { name: 'XP Tracking', status: 'active', color: 'bg-orange-400' },
    { name: 'Portfolio Analytics', status: 'active', color: 'bg-cyan-400' }
  ];

  return (
    <div className="pt-20 space-y-12 max-w-7xl mx-auto px-4">
      {/* Hero Header */}
      <motion.section 
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-4">
          <motion.div
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass border border-green-500/30 mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">AI-Powered DeFi Assistant</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
          
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Bot className="w-10 h-10 text-white" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-black gradient-text-rainbow font-['Space_Grotesk']">
                SquadWallet Agent
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Your AI assistant for DeFi and gaming powered by{' '}
                <span className="gradient-text-purple font-semibold">XMTP messaging</span>
              </p>
            </div>
          </div>
        </div>

        {/* Command Stats */}
        {isConnected && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {[
              { label: 'Wallets Created', value: commandStats.walletsCreated, icon: Wallet, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Games Played', value: commandStats.gamesPlayed, icon: Gamepad2, gradient: 'from-purple-500 to-pink-500' },
              { label: 'Swaps Executed', value: commandStats.swapsExecuted, icon: Zap, gradient: 'from-yellow-500 to-orange-500' },
              { label: 'XP Earned', value: commandStats.xpEarned, icon: Star, gradient: 'from-orange-500 to-red-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="card-gradient text-center group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
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
        )}
      </motion.section>

      {/* Main Chat Interface */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <AgentChat onCommandExecuted={handleCommandExecuted} />
        </motion.div>

        {/* Sidebar */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {/* Quick Commands */}
          <div className="card-gradient space-y-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Rocket className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Quick Commands</h3>
            </div>
            
            <div className="space-y-3">
              {quickCommands.map((cmd, index) => {
                const Icon = cmd.icon;
                return (
                  <motion.div
                    key={index}
                    className="glass-dark rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group border border-purple-500/20"
                    onClick={() => {
                      console.log('Quick command:', cmd.command);
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${cmd.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm font-mono">
                          {cmd.command}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {cmd.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Agent Features */}
          <div className="card-gradient space-y-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Agent Features</h3>
            </div>
            
            <div className="space-y-3">
              {agentFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 glass-dark rounded-lg border border-green-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className={`w-3 h-3 ${feature.color} rounded-full`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-gray-300 font-medium">{feature.name}</span>
                  </div>
                  <span className="text-green-400 text-sm font-semibold">Active</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          <div className="card-gradient space-y-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Activity className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Connection Status</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Wallet', status: isConnected ? 'Connected' : 'Disconnected', color: isConnected ? 'bg-green-400' : 'bg-red-400' },
                { name: 'XMTP', status: 'Simulation Mode', color: 'bg-yellow-400' },
                { name: 'Agent', status: 'Active', color: 'bg-green-400' }
              ].map((connection, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 glass-dark rounded-lg border border-cyan-500/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-gray-300 font-medium">{connection.name}</span>
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className={`w-3 h-3 ${connection.color} rounded-full`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-white text-sm font-semibold">{connection.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="card-gradient space-y-6">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Need Help?</h3>
            </div>
            
            <div className="space-y-3 text-sm text-gray-300">
              {[
                'Type /help for all commands',
                'Commands start with /',
                'Agent responds in real-time',
                'All transactions are on Base network'
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-2 glass-dark rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

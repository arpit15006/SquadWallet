import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Home, Gamepad2, MessageCircle, Menu, X, Sparkles, Trophy, Star, Users, Zap, TestTube, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnchainWalletConnect } from './OnchainWalletConnect';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Games', href: '/game', icon: Gamepad2 },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'XP & Badges', href: '/xp', icon: Star },
    { name: 'Social', href: '/social', icon: Users },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Basenames', href: '/basenames', icon: User },
    { name: 'Integrations', href: '/integrations', icon: Zap },
    { name: 'Wallet Test', href: '/wallet-test', icon: TestTube },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section - Left Aligned */}
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
                  boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
                }}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Wallet className="w-5 h-5 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
                    opacity: 0.6,
                  }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              <div className="flex flex-col">
                <span
                  className="text-lg font-black font-['Space_Grotesk']"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  SquadWallet
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    background: 'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Web3 • Gaming • Social
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation - Center Aligned */}
          <div className="hidden sm:flex items-center justify-center flex-1 space-x-2">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className={`relative flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
                          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)'
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10 font-['Space_Grotesk']">{item.name}</span>
                    {isActive(item.href) && (
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-3 h-3 text-yellow-300 relative z-10" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Wallet Connect - Right Aligned */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <OnchainWalletConnect />
            </motion.div>
            
            {/* Mobile menu button */}
            <div className="sm:hidden ml-2">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg glass text-white hover:bg-white/10 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 glass-dark border-t border-white/10">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                        isActive(item.href)
                          ? 'text-white bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {isActive(item.href) && (
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse ml-auto" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

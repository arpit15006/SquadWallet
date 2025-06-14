import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Copy, ExternalLink, Search, Star, Crown } from 'lucide-react';
import { 
  DisplayBasename, 
  CompactBasename, 
  BasenameAvatar, 
  BasenameName 
} from '../components/DisplayBasename';
import { useSimpleWallet } from '../components/SimpleWalletConnect';

export const BasenamesDemo: React.FC = () => {
  const { address, isConnected } = useSimpleWallet();
  const [searchAddress, setSearchAddress] = useState('');

  // Example addresses with known Basenames for demo
  const exampleAddresses = [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x9876543210987654321098765432109876543210',
    address || '0x0000000000000000000000000000000000000000'
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="pt-20 space-y-12 max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <motion.section 
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-4">
          <motion.div
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass border border-purple-500/30 mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <User className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold">Basenames Integration</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black gradient-text-rainbow font-['Space_Grotesk']">
            Basenames Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience human-readable addresses with{' '}
            <span className="gradient-text-purple font-semibold">OnchainKit Identity</span> components
            powered by Base network.
          </p>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.section
        className="card-gradient max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Search className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Search Address
          </h2>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="glass w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
            placeholder="Enter an Ethereum address (0x...)"
          />
          
          {searchAddress && searchAddress.length === 42 && searchAddress.startsWith('0x') && (
            <motion.div
              className="glass-dark rounded-xl p-4 border border-blue-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DisplayBasename 
                address={searchAddress as `0x${string}`}
                className="justify-center"
              />
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Component Examples */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-center gradient-text font-['Space_Grotesk']">
          Component Examples
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Full Identity Component */}
          <motion.div 
            className="card-gradient"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>Full Identity</span>
            </h3>
            <div className="space-y-4">
              {exampleAddresses.slice(0, 2).map((addr, index) => (
                <div key={index} className="glass-dark rounded-lg p-4">
                  <DisplayBasename address={addr as `0x${string}`} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Compact Version */}
          <motion.div 
            className="card-gradient"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-400" />
              <span>Compact Identity</span>
            </h3>
            <div className="space-y-4">
              {exampleAddresses.slice(0, 2).map((addr, index) => (
                <div key={index} className="glass-dark rounded-lg p-4">
                  <CompactBasename address={addr as `0x${string}`} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Avatar Only */}
          <motion.div 
            className="card-gradient"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Avatar Only</h3>
            <div className="flex space-x-4">
              {exampleAddresses.slice(0, 3).map((addr, index) => (
                <BasenameAvatar 
                  key={index}
                  address={addr as `0x${string}`} 
                  className="w-12 h-12"
                />
              ))}
            </div>
          </motion.div>

          {/* Name Only */}
          <motion.div 
            className="card-gradient"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Name Only</h3>
            <div className="space-y-3">
              {exampleAddresses.slice(0, 3).map((addr, index) => (
                <div key={index} className="glass-dark rounded-lg p-3">
                  <BasenameName 
                    address={addr as `0x${string}`}
                    className="text-blue-400 font-semibold"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Connected Wallet Section */}
      {isConnected && address && (
        <motion.section
          className="card-gradient max-w-2xl mx-auto border border-green-500/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold gradient-text font-['Space_Grotesk']">
              Your Connected Wallet
            </h3>
            <DisplayBasename 
              address={address as `0x${string}`}
              className="justify-center"
            />
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={() => copyToClipboard(address)}
                className="btn-outline-gradient px-4 py-2 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4" />
                <span>Copy Address</span>
              </motion.button>
              <motion.button
                onClick={() => window.open(`https://basescan.org/address/${address}`, '_blank')}
                className="btn-gradient px-4 py-2 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on BaseScan</span>
              </motion.button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Info Section */}
      <motion.section
        className="card-gradient max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6 text-center font-['Space_Grotesk']">
          About Basenames Integration
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-gray-300">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Features</h4>
            <ul className="space-y-2">
              <li>• Human-readable address resolution</li>
              <li>• Avatar display from Basenames</li>
              <li>• Automatic fallback to shortened addresses</li>
              <li>• Copy-to-clipboard functionality</li>
              <li>• Base network integration</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-purple-400">Components Used</h4>
            <ul className="space-y-2">
              <li>• OnchainKit Identity components</li>
              <li>• Base chain configuration</li>
              <li>• Wagmi + React Query setup</li>
              <li>• Custom wrapper components</li>
              <li>• Responsive design patterns</li>
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default BasenamesDemo;

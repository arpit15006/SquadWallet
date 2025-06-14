import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleWallet } from '../components/SimpleWalletConnect';
import {
  Wallet, Plus, Send, Users, TrendingUp, Clock, ExternalLink, Copy, Settings,
  DollarSign, Trophy, Star, Crown, Sparkles, Rocket, Shield, Zap
} from 'lucide-react';
import {
  useUserWallets, useWalletInfo, useCreateSquadWallet, useDepositToWallet,
  useWalletBalance, useUserStats, useContractsDeployed
} from '../hooks/useContracts';
import { CompactBasename, BasenameName } from '../components/DisplayBasename';

export const WalletPage: React.FC = () => {
  const { address, isConnected } = useSimpleWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'swap' | 'transactions' | 'members' | 'proposals'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');

  // Contract hooks
  const { isDeployed } = useContractsDeployed();
  const { data: userWallets, isLoading: walletsLoading } = useUserWallets(address);
  const { data: userStats } = useUserStats(address);
  const createWallet = useCreateSquadWallet();
  const depositToWallet = useDepositToWallet();

  // Form states
  const [walletName, setWalletName] = useState('');
  const [depositAmount, setDepositAmount] = useState('0.01');

  // Handle wallet creation
  const handleCreateWallet = () => {
    if (!walletName.trim()) return;
    createWallet.createWallet(walletName, [address!], ['Creator']);
    setWalletName('');
    setShowCreateModal(false);
  };

  // Handle deposit
  const handleDeposit = () => {
    if (!selectedWallet || !depositAmount) return;
    depositToWallet.deposit(selectedWallet, depositAmount);
    setDepositAmount('0.01');
    setShowDepositModal(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Wallet className="w-16 h-16 text-white" />
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold gradient-text-rainbow font-['Space_Grotesk']">Connect Your Wallet</h2>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
              Please connect your wallet to view and manage your SquadWallets.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isDeployed) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Settings className="w-16 h-16 text-white" />
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold gradient-text-rainbow font-['Space_Grotesk']">Contracts Not Deployed</h2>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
              SquadWallet contracts need to be deployed first.
            </p>
            <div className="card-gradient p-6 max-w-md mx-auto">
              <p className="text-gray-300 mb-3">To deploy contracts:</p>
              <code className="text-blue-400 bg-gray-800 px-3 py-2 rounded-lg">cd contracts && npm run deploy</code>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass border border-blue-500/30 mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-semibold">Non-Custodial Squad Wallets</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black gradient-text-rainbow font-['Space_Grotesk']">
            My Wallets
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Manage your SquadWallets and track your portfolio with{' '}
            <span className="gradient-text-purple font-semibold">transparent smart contracts</span> on Base.
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Total Portfolio', value: '3.68 ETH', icon: TrendingUp, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Active Wallets', value: '3', icon: Wallet, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'XP Points', value: '2,450', icon: Star, gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Rank', value: '#123', icon: Crown, gradient: 'from-purple-500 to-pink-500' }
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
        </div>

        {/* Create Wallet Button */}
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="btn-gradient-rainbow text-lg px-8 py-4 flex items-center space-x-3 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-6 h-6" />
          <span>Create New Wallet</span>
          <Rocket className="w-5 h-5" />
        </motion.button>
      </motion.section>

      {/* Wallet Cards Grid */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walletsLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div 
                key={index} 
                className="card-gradient"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-600 rounded-lg"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : userWallets && userWallets.length > 0 ? (
            userWallets.map((walletAddress, index) => (
              <motion.div
                key={walletAddress}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <WalletCard
                  walletAddress={walletAddress}
                  onDeposit={() => {
                    setSelectedWallet(walletAddress);
                    setShowDepositModal(true);
                  }}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <motion.div 
                className="text-center py-16 space-y-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Wallet className="w-12 h-12 text-white" />
                </motion.div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">No Wallets Yet</h3>
                  <p className="text-gray-300 max-w-md mx-auto">Create your first SquadWallet to get started with group finance</p>
                  <motion.button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-gradient-rainbow px-8 py-3 flex items-center space-x-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Your First Wallet</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Create New Wallet Card */}
          <motion.div 
            className="card-gradient border-dashed border-2 border-purple-500/30 hover:border-purple-500/60 transition-colors duration-300 cursor-pointer group"
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="text-center py-12 space-y-4">
              <motion.div
                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Plus className="w-8 h-8 text-white" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Create New Wallet</h3>
                <p className="text-gray-300">
                  Start a new SquadWallet with your friends
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Create Wallet Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="card-gradient max-w-md w-full border border-purple-500/30"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Rocket className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Create SquadWallet</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="glass w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="My Squad Wallet"
                  />
                </div>

                <div className="glass-dark rounded-xl p-4 border border-blue-500/20">
                  <p className="text-gray-300 text-sm">
                    You'll be the initial member and owner of this wallet.
                    You can add more members later through the wallet settings.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <motion.button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline-gradient flex-1 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleCreateWallet}
                  disabled={!walletName.trim() || createWallet.isPending}
                  className="btn-gradient flex-1 py-3 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {createWallet.isPending ? 'Creating...' : 'Create Wallet'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="card-gradient max-w-md w-full border border-green-500/30"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <DollarSign className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">Deposit ETH</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="glass w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 border border-green-500/30 focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="0.01"
                    min="0.001"
                    step="0.001"
                  />
                </div>

                <div className="glass-dark rounded-xl p-4 border border-blue-500/20">
                  <p className="text-gray-300 text-sm flex items-center space-x-2">
                    <span>Depositing to:</span>
                    <BasenameName
                      address={selectedWallet as `0x${string}`}
                      className="text-blue-400 font-semibold"
                    />
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <motion.button
                  onClick={() => setShowDepositModal(false)}
                  className="btn-outline-gradient flex-1 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeposit}
                  disabled={!depositAmount || depositToWallet.isPending}
                  className="btn-gradient flex-1 py-3 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {depositToWallet.isPending ? 'Depositing...' : 'Deposit'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual Wallet Card Component
const WalletCard: React.FC<{
  walletAddress: string;
  onDeposit: () => void;
}> = ({ walletAddress, onDeposit }) => {
  const { data: walletInfo } = useWalletInfo(walletAddress);
  const { data: balance } = useWalletBalance(walletAddress);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div 
      className="card-gradient group cursor-pointer border border-blue-500/20 hover:border-blue-500/40 transition-colors"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
{walletInfo?.[0]?.toString() || 'Loading...'}
        </h3>
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Settings className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Balance</span>
          <span className="text-2xl font-bold gradient-text">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Members</span>
          <span className="text-white font-semibold">
            {walletInfo?.[1]?.toString() || '0'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Created</span>
          <span className="text-white text-sm">
            {walletInfo?.[2] ? new Date(Number(walletInfo[2]) * 1000).toLocaleDateString() : 'Loading...'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <CompactBasename
            address={walletAddress as `0x${string}`}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          />
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Copy
              className="w-4 h-4 cursor-pointer hover:text-white transition-colors"
              onClick={() => copyToClipboard(walletAddress)}
            />
          </motion.div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            onClick={onDeposit}
            className="text-blue-400 hover:text-blue-300 font-semibold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Deposit
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink
              className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
              onClick={() => window.open(`https://sepolia.basescan.org/address/${walletAddress}`, '_blank')}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

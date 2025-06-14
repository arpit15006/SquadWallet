import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MessageSquare, 
  Wallet, 
  User, 
  ArrowRight,
  CheckCircle,
  Star,
  Trophy,
  Coins
} from 'lucide-react';
import { EnhancedIdentity } from '../components/EnhancedIdentity';
import { EnhancedSwapWidget } from '../components/EnhancedSwapWidget';
import { EnhancedXMTPChat } from '../components/EnhancedXMTPChat';
import OnchainKitSwap from '../components/OnchainKitSwap';
import OnchainKitWallet from '../components/OnchainKitWallet';
import OnchainKitTransaction from '../components/OnchainKitTransaction';

interface DemoSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  features: string[];
}

export const IntegrationsDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('agentkit');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  const handleActionComplete = (actionId: string) => {
    setCompletedActions(prev => new Set([...prev, actionId]));
  };

  const demoSections: DemoSection[] = [
    {
      id: 'agentkit',
      title: 'Enhanced Coinbase AgentKit',
      description: 'Advanced wallet management with smart transaction routing',
      icon: <Wallet className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">AgentKit Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Smart Transaction Routing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Automatic Gas Optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Multi-Chain Support</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Fallback Transaction Handling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Enhanced Error Recovery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white">Real-time Balance Tracking</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <h5 className="font-medium text-blue-300 mb-2">Demo Actions</h5>
              <div className="space-y-2">
                <button 
                  onClick={() => handleActionComplete('create-wallet')}
                  className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">Create Squad Wallet via AgentKit</span>
                    {completedActions.has('create-wallet') ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                <button 
                  onClick={() => handleActionComplete('transfer-eth')}
                  className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">Transfer ETH with Smart Routing</span>
                    {completedActions.has('transfer-eth') ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      features: [
        'Smart transaction routing with fallback',
        'Automatic gas optimization',
        'Enhanced error handling',
        'Multi-chain wallet support'
      ]
    },
    {
      id: 'xmtp',
      title: 'Enhanced XMTP Messaging',
      description: 'Advanced messaging with group chat and context awareness',
      icon: <MessageSquare className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <EnhancedXMTPChat 
            onCommandExecuted={(command, result) => {
              console.log('Command executed:', command, result);
              handleActionComplete('xmtp-command');
            }}
          />
        </div>
      ),
      features: [
        'Real-time XMTP integration',
        'Message history and context',
        'Enhanced command processing',
        'Group chat preparation'
      ]
    },
    {
      id: 'onchainkit',
      title: 'Enhanced OnchainKit Components',
      description: 'Rich UI components with advanced features',
      icon: <User className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Enhanced Identity</h4>
              <EnhancedIdentity
                address="0x97f14d6031b64f9e82153a69458b5b9af8248ee6"
                size="lg"
                showLevel={true}
                showXP={true}
                showBadges={true}
                interactive={true}
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">OnchainKit Wallet</h4>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <OnchainKitWallet />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Smart Wallet Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Coinbase Wallet Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Multi-Chain Support</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">OnchainKit Swap</h4>
              <OnchainKitSwap
                onSwapComplete={(txHash) => {
                  console.log('Swap completed:', txHash);
                  handleActionComplete('swap-tokens');
                }}
              />
            </div>
          </div>
        </div>
      ),
      features: [
        'Enhanced identity with levels and XP',
        'Advanced swap interface',
        'Real-time price updates',
        'Interactive components'
      ]
    },
    {
      id: 'basenames',
      title: 'Enhanced Basenames Integration',
      description: 'Advanced identity management with validation and suggestions',
      icon: <Star className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-white mb-4">Basenames Features</h4>
            
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <h5 className="font-medium text-purple-300 mb-2">Name Validation</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Real-time format validation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Availability checking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Smart suggestions</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <h5 className="font-medium text-blue-300 mb-2">Enhanced Resolution</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Bidirectional resolution</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Metadata integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Display name formatting</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                <h5 className="font-medium text-green-300 mb-2">Registration Features</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Dynamic pricing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Search functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Personalized suggestions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      features: [
        'Real-time name validation',
        'Smart basename suggestions',
        'Enhanced metadata support',
        'Dynamic pricing calculation'
      ]
    }
  ];

  const activeDemo = demoSections.find(section => section.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Enhanced Integrations Demo
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Experience the power of enhanced Coinbase AgentKit, XMTP, OnchainKit, and Basenames integrations
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Actions Completed: {completedActions.size}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-green-400" />
              <span className="text-white">XP Earned: {completedActions.size * 50}</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {demoSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {section.icon}
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Active Demo Section */}
        {activeDemo && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8"
          >
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                {activeDemo.icon}
                <h2 className="text-2xl font-bold text-white">{activeDemo.title}</h2>
              </div>
              <p className="text-gray-300 mb-4">{activeDemo.description}</p>
              
              {/* Features List */}
              <div className="flex flex-wrap gap-2">
                {activeDemo.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Demo Component */}
            <div className="bg-black/20 rounded-lg p-6">
              {activeDemo.component}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-400"
        >
          <p>
            Built with ❤️ using enhanced integrations for the Base Batches Messaging Buildathon
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default IntegrationsDemo;

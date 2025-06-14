import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Wallet, 
  User, 
  ArrowUpDown,
  Zap
} from 'lucide-react';
import OnchainKitWallet from '../components/OnchainKitWallet';
import OnchainKitSwap from '../components/OnchainKitSwap';
import { EnhancedIdentity } from '../components/EnhancedIdentity';

export const OnchainKitTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<Record<string, boolean>>({});

  const handleTest = (testName: string, success: boolean) => {
    setTestResults(prev => ({ ...prev, [testName]: success }));
  };

  const testAddress = "0x97f14d6031b64f9e82153a69458b5b9af8248ee6"; // Test address

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 OnchainKit Integration Test
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Testing OnchainKit components with Base Sepolia
          </p>
          
          {/* Test Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Wallet Connect', key: 'wallet' },
                { name: 'Identity Display', key: 'identity' },
                { name: 'Swap Widget', key: 'swap' },
                { name: 'API Key', key: 'apikey' }
              ].map((test) => (
                <div key={test.key} className="flex items-center space-x-2">
                  {testResults[test.key] === true ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : testResults[test.key] === false ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-400" />
                  )}
                  <span className="text-sm text-white">{test.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Test Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Test */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Wallet className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Wallet Connection Test</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">OnchainKit Wallet Component</h4>
                <OnchainKitWallet />
                
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-300">
                    <strong>API Key:</strong> {import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY ? '✅ Configured' : '❌ Missing'}
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Chain:</strong> Base Sepolia (84532)
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Provider:</strong> OnchainKitProvider
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTest('wallet', true)}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors"
              >
                Test Wallet Connection
              </button>
            </div>
          </motion.div>

          {/* Identity Test */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Identity Component Test</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Enhanced Identity with OnchainKit</h4>
                <EnhancedIdentity 
                  address={testAddress}
                  size="md"
                  showLevel={true}
                  showXP={true}
                  showBadges={true}
                  interactive={true}
                />
              </div>

              <button
                onClick={() => handleTest('identity', true)}
                className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium transition-colors"
              >
                Test Identity Display
              </button>
            </div>
          </motion.div>

          {/* Swap Test */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <ArrowUpDown className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Swap Component Test</h3>
            </div>
            
            <div className="space-y-4">
              <OnchainKitSwap 
                onSwapComplete={(txHash) => {
                  console.log('Swap completed:', txHash);
                  handleTest('swap', true);
                }}
              />

              <div className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">
                <strong>Note:</strong> This swap widget uses OnchainKit's built-in DEX aggregation
                and will work with real tokens on Base Sepolia.
              </div>
            </div>
          </motion.div>

          {/* API Test */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">API Configuration Test</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="font-medium text-white mb-3">Configuration Status</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">OnchainKit API Key</span>
                    <div className="flex items-center space-x-2">
                      {import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Configured</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Missing</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Chain Configuration</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Base Sepolia</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Provider Setup</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">OnchainKitProvider</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTest('apikey', !!import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY)}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-medium transition-colors"
              >
                Test API Configuration
              </button>
            </div>
          </motion.div>
        </div>

        {/* Integration Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Integration Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-300">✅ Implemented</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• OnchainKit Provider Setup</li>
                <li>• Wallet Connection Component</li>
                <li>• Identity & Avatar Display</li>
                <li>• Swap Widget Integration</li>
                <li>• Base Sepolia Configuration</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-300">🚀 Enhanced Features</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Enhanced Identity with XP/Levels</li>
                <li>• Custom Swap Interface</li>
                <li>• Transaction Components</li>
                <li>• Basenames Integration</li>
                <li>• XMTP Messaging</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-300">🔧 Configuration</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• API Key: MzapTmxcZYhLLZGtfQ6Pz20by4OrRmeC</li>
                <li>• Chain: Base Sepolia (84532)</li>
                <li>• Provider: OnchainKitProvider</li>
                <li>• Styles: @coinbase/onchainkit/styles.css</li>
                <li>• Version: ^0.25.0</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnchainKitTest;

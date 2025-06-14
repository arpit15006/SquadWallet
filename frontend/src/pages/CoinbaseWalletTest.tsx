import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Send, 
  FileText, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import CoinbaseWalletConnect from '../components/CoinbaseWalletConnect';
import coinbaseWalletService, { WalletState } from '../services/coinbaseWallet';

export const CoinbaseWalletTest: React.FC = () => {
  const [walletState, setWalletState] = useState<WalletState>(coinbaseWalletService.getState());
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [txHash, setTxHash] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [sendAmount, setSendAmount] = useState('0.001');
  const [sendTo, setSendTo] = useState('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'); // Test address

  useEffect(() => {
    const unsubscribe = coinbaseWalletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: true }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: false }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testConnection = async () => {
    if (!walletState.isConnected) {
      await coinbaseWalletService.connect();
    }
  };

  const testChainSwitch = async () => {
    await coinbaseWalletService.switchChain(84532); // Base Sepolia
  };

  const testSendTransaction = async () => {
    const hash = await coinbaseWalletService.sendTransaction({
      to: sendTo,
      value: sendAmount,
    });
    setTxHash(hash);
  };

  const testSignMessage = async () => {
    const message = `Hello from SquadWallet! Timestamp: ${Date.now()}`;
    const sig = await coinbaseWalletService.signMessage(message);
    setSignature(sig);
  };

  const testGetBalance = async () => {
    if (walletState.accounts[0]) {
      await coinbaseWalletService.getBalance(walletState.accounts[0]);
    }
  };

  const tests = [
    {
      name: 'Connection',
      key: 'connection',
      description: 'Test wallet connection',
      action: () => runTest('connection', testConnection),
      icon: Wallet,
      color: 'blue'
    },
    {
      name: 'Chain Switch',
      key: 'chainSwitch',
      description: 'Switch to Base Sepolia',
      action: () => runTest('chainSwitch', testChainSwitch),
      icon: RefreshCw,
      color: 'purple'
    },
    {
      name: 'Get Balance',
      key: 'balance',
      description: 'Fetch account balance',
      action: () => runTest('balance', testGetBalance),
      icon: Wallet,
      color: 'green'
    },
    {
      name: 'Sign Message',
      key: 'signMessage',
      description: 'Sign a test message',
      action: () => runTest('signMessage', testSignMessage),
      icon: FileText,
      color: 'yellow'
    },
    {
      name: 'Send Transaction',
      key: 'sendTransaction',
      description: 'Send a test transaction',
      action: () => runTest('sendTransaction', testSendTransaction),
      icon: Send,
      color: 'red'
    }
  ];

  const getStatusIcon = (testKey: string) => {
    if (loading[testKey]) {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />;
    }
    if (testResults[testKey] === true) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (testResults[testKey] === false) {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
    return <div className="w-5 h-5 rounded-full bg-gray-400" />;
  };

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
            🏦 Coinbase Wallet SDK Test
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Official Coinbase Wallet SDK Integration Testing
          </p>
          
          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            <CoinbaseWalletConnect />
          </div>
        </motion.div>

        {/* Wallet Status */}
        {walletState.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-white mb-4">Wallet Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Address</div>
                <div className="text-white font-mono text-sm">
                  {walletState.accounts[0]?.slice(0, 10)}...{walletState.accounts[0]?.slice(-8)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Balance</div>
                <div className="text-white font-semibold">
                  {parseFloat(walletState.balance).toFixed(6)} ETH
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Chain</div>
                <div className="text-white font-semibold">
                  {walletState.chainId === 84532 ? 'Base Sepolia' : 
                   walletState.chainId === 8453 ? 'Base Mainnet' : 
                   `Chain ${walletState.chainId}`}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">SDK Tests</h3>
            
            <div className="space-y-4">
              {tests.map((test) => {
                const Icon = test.icon;
                return (
                  <div key={test.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 text-${test.color}-400`} />
                      <div>
                        <div className="text-white font-medium">{test.name}</div>
                        <div className="text-gray-400 text-sm">{test.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.key)}
                      <button
                        onClick={test.action}
                        disabled={loading[test.key] || (!walletState.isConnected && test.key !== 'connection')}
                        className={`px-4 py-2 bg-${test.color}-500 hover:bg-${test.color}-600 disabled:bg-gray-500 text-white rounded-lg transition-colors`}
                      >
                        Test
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Test Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Transaction Test Config */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Transaction Test</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Send To Address</label>
                  <input
                    type="text"
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Amount (ETH)</label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    step="0.001"
                    min="0"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>
              
              {txHash && (
                <div className="mb-4">
                  <div className="text-gray-300 text-sm mb-2">Transaction Hash</div>
                  <div className="flex items-center space-x-2">
                    <code className="text-green-400 text-sm bg-black/20 px-2 py-1 rounded">
                      {txHash.slice(0, 20)}...
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(txHash)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank')}
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {signature && (
                <div className="mb-4">
                  <div className="text-gray-300 text-sm mb-2">Message Signature</div>
                  <div className="flex items-center space-x-2">
                    <code className="text-blue-400 text-sm bg-black/20 px-2 py-1 rounded">
                      {signature.slice(0, 20)}...
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(signature)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* SDK Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">SDK Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-300">✅ Features</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Official Coinbase Wallet SDK v4.3.4</li>
                <li>• Web3.js Integration</li>
                <li>• Base Mainnet & Sepolia Support</li>
                <li>• Transaction Signing</li>
                <li>• Message Signing</li>
                <li>• Chain Switching</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-300">🔧 Configuration</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• App Name: SquadWallet</li>
                <li>• Supported Chains: [8453, 84532]</li>
                <li>• Provider: Web3Provider</li>
                <li>• Event Listeners: Active</li>
                <li>• State Management: Reactive</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-300">📋 Test Status</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Connection: {testResults.connection ? '✅' : '⏳'}</li>
                <li>• Chain Switch: {testResults.chainSwitch ? '✅' : '⏳'}</li>
                <li>• Balance: {testResults.balance ? '✅' : '⏳'}</li>
                <li>• Sign Message: {testResults.signMessage ? '✅' : '⏳'}</li>
                <li>• Send Transaction: {testResults.sendTransaction ? '✅' : '⏳'}</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoinbaseWalletTest;

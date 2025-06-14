import React, { useState, useEffect } from 'react';
import { coinbaseWallet, ethereum, web3 } from '../services/coinbaseWallet';

export const SimpleCoinbaseTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  const setupEventListeners = () => {
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        getBalance(accounts[0]);
      } else {
        setIsConnected(false);
        setAccount('');
        setBalance('0');
      }
    });

    ethereum.on('chainChanged', (chainId: string) => {
      setChainId(parseInt(chainId, 16));
    });
  };

  const checkConnection = async () => {
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        
        const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
        setChainId(parseInt(chainId, 16));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connect = async () => {
    setLoading(true);
    setError('');
    
    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        
        const chainId = await ethereum.request({ method: 'eth_chainId' }) as string;
        setChainId(parseInt(chainId, 16));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const getBalance = async (address: string) => {
    try {
      const balance = await web3.eth.getBalance(address);
      setBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const switchToBaseSepolia = async () => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // Base Sepolia
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x14a34',
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia.basescan.org'],
          }],
        });
      } else {
        setError(error.message || 'Failed to switch chain');
      }
    }
  };

  const sendTestTransaction = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError('');
    
    try {
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Test address
          value: web3.utils.toHex(web3.utils.toWei('0.001', 'ether')),
        }],
      });
      
      alert(`Transaction sent! Hash: ${txHash}`);
    } catch (error: any) {
      setError(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const signMessage = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError('');
    
    try {
      const message = `Hello from SquadWallet! Timestamp: ${Date.now()}`;
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      });
      
      alert(`Message signed! Signature: ${signature}`);
    } catch (error: any) {
      setError(error.message || 'Signing failed');
    } finally {
      setLoading(false);
    }
  };

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 8453: return 'Base Mainnet';
      case 84532: return 'Base Sepolia';
      case 1: return 'Ethereum';
      default: return chainId ? `Chain ${chainId}` : 'Unknown';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2.5rem'
        }}>
          🏦 Coinbase Wallet SDK Test
        </h1>

        {/* Connection Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Connection Status</h2>
          
          {!isConnected ? (
            <div>
              <p style={{ color: '#fbbf24', marginBottom: '1rem' }}>
                🔴 Not Connected
              </p>
              <button
                onClick={connect}
                disabled={loading}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Connecting...' : 'Connect Coinbase Wallet'}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                🟢 Connected
              </p>
              <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Address:</strong> {account.slice(0, 10)}...{account.slice(-8)}
              </p>
              <p style={{ color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Balance:</strong> {parseFloat(balance).toFixed(6)} ETH
              </p>
              <p style={{ color: 'white', fontSize: '0.9rem' }}>
                <strong>Network:</strong> {getChainName(chainId)}
              </p>
            </div>
          )}
        </div>

        {/* Test Actions */}
        {isConnected && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Test Actions</h2>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <button
                onClick={switchToBaseSepolia}
                disabled={loading || chainId === 84532}
                style={{
                  background: chainId === 84532 ? '#10b981' : '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: loading || chainId === 84532 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: loading || chainId === 84532 ? 0.6 : 1
                }}
              >
                {chainId === 84532 ? '✅ Base Sepolia' : 'Switch to Base Sepolia'}
              </button>

              <button
                onClick={() => getBalance(account)}
                disabled={loading}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Refresh Balance
              </button>

              <button
                onClick={signMessage}
                disabled={loading}
                style={{
                  background: '#06b6d4',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Sign Message
              </button>

              <button
                onClick={sendTestTransaction}
                disabled={loading || chainId !== 84532}
                style={{
                  background: chainId !== 84532 ? '#6b7280' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: loading || chainId !== 84532 ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: loading || chainId !== 84532 ? 0.6 : 1
                }}
              >
                Send Test TX (0.001 ETH)
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#fca5a5', margin: 0 }}>
              ❌ {error}
            </p>
          </div>
        )}

        {/* SDK Info */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>SDK Information</h2>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <h3 style={{ color: '#60a5fa', fontSize: '1rem', marginBottom: '0.5rem' }}>✅ Features</h3>
              <ul style={{ color: '#d1d5db', fontSize: '0.9rem', margin: 0, paddingLeft: '1rem' }}>
                <li>Official Coinbase Wallet SDK v4.3.4</li>
                <li>Web3.js Integration</li>
                <li>Base Sepolia Support</li>
                <li>Transaction Signing</li>
                <li>Message Signing</li>
                <li>Chain Switching</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ color: '#34d399', fontSize: '1rem', marginBottom: '0.5rem' }}>🔧 Configuration</h3>
              <ul style={{ color: '#d1d5db', fontSize: '0.9rem', margin: 0, paddingLeft: '1rem' }}>
                <li>App Name: SquadWallet</li>
                <li>Supported Chains: [8453, 84532]</li>
                <li>Provider: Web3Provider</li>
                <li>Event Listeners: Active</li>
                <li>State Management: React</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCoinbaseTest;

// Ethereum provider utilities to handle wallet conflicts

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

/**
 * Get the best available Ethereum provider
 */
export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to get the ethereum provider, handling conflicts
  let provider = null;

  try {
    // First try window.ethereum
    if (window.ethereum) {
      provider = window.ethereum;
    }

    // If there are multiple providers, try to pick the best one
    if (window.ethereum?.providers?.length > 0) {
      // Prefer MetaMask if available
      const metamask = window.ethereum.providers.find((p: any) => p.isMetaMask);
      if (metamask) {
        provider = metamask;
      } else {
        // Otherwise use the first provider
        provider = window.ethereum.providers[0];
      }
    }

    return provider;
  } catch (error) {
    console.warn('Error accessing ethereum provider:', error);
    return null;
  }
}

/**
 * Check if any Ethereum provider is available
 */
export function isEthereumAvailable(): boolean {
  return getEthereumProvider() !== null;
}

/**
 * Request account access from the provider
 */
export async function requestAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum provider found');
  }

  try {
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  } catch (error) {
    console.error('Failed to request accounts:', error);
    throw error;
  }
}

/**
 * Get current accounts
 */
export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) {
    return [];
  }

  try {
    const accounts = await provider.request({
      method: 'eth_accounts',
    });
    return accounts;
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return [];
  }
}

/**
 * Get current chain ID
 */
export async function getChainId(): Promise<number> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum provider found');
  }

  try {
    const chainId = await provider.request({
      method: 'eth_chainId',
    });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    throw error;
  }
}

/**
 * Get account balance
 */
export async function getBalance(address: string): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum provider found');
  }

  try {
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    
    // Convert from wei to ETH
    const balanceInEth = parseInt(balance, 16) / 1e18;
    return balanceInEth.toFixed(4);
  } catch (error) {
    console.error('Failed to get balance:', error);
    throw error;
  }
}

/**
 * Switch to Base Sepolia network
 */
export async function switchToBaseSepolia(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum provider found');
  }

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x14a34' }], // Base Sepolia
    });
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, add it
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14a34',
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org'],
        }],
      });
    } else {
      throw error;
    }
  }
}

/**
 * Send a transaction
 */
export async function sendTransaction(params: {
  to: string;
  value?: string;
  data?: string;
  gas?: string;
}): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('No Ethereum provider found');
  }

  try {
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts connected');
    }

    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        ...params,
      }],
    });

    return txHash;
  } catch (error) {
    console.error('Failed to send transaction:', error);
    throw error;
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const provider = getEthereumProvider();
  if (!provider) {
    return () => {};
  }

  provider.on('accountsChanged', callback);
  
  return () => {
    provider.removeListener('accountsChanged', callback);
  };
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  const provider = getEthereumProvider();
  if (!provider) {
    return () => {};
  }

  provider.on('chainChanged', callback);
  
  return () => {
    provider.removeListener('chainChanged', callback);
  };
}

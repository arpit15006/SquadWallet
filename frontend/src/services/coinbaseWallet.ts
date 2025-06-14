// Official Coinbase Wallet SDK Integration
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Web3 from "web3";

const APP_NAME = "SquadWallet";
const APP_LOGO_URL = "https://squadwallet.xyz/logo.png"; // Update with your actual logo URL
const APP_SUPPORTED_CHAIN_IDS = [8453, 84532]; // Base Mainnet and Base Sepolia

// Initialize Coinbase Wallet SDK
export const coinbaseWallet = new CoinbaseWalletSDK({
  appName: APP_NAME,
  appLogoUrl: APP_LOGO_URL,
  chainIds: APP_SUPPORTED_CHAIN_IDS,
});

// Initialize a Web3 Provider object
export const ethereum = coinbaseWallet.makeWeb3Provider();

// Initialize a Web3 object
export const web3 = new Web3(ethereum as any);

// Wallet connection state
export interface WalletState {
  isConnected: boolean;
  accounts: string[];
  chainId: number | null;
  balance: string;
}

class CoinbaseWalletService {
  private walletState: WalletState = {
    isConnected: false,
    accounts: [],
    chainId: null,
    balance: "0"
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for wallet events
   */
  private setupEventListeners(): void {
    // Listen for accounts change
    ethereum.on('accountsChanged', (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      this.walletState.accounts = accounts;
      this.walletState.isConnected = accounts.length > 0;
      this.notifyListeners();
    });

    // Listen for chain change
    ethereum.on('chainChanged', (chainId: string) => {
      console.log('Chain changed:', chainId);
      this.walletState.chainId = parseInt(chainId, 16);
      this.notifyListeners();
    });

    // Listen for connection
    ethereum.on('connect', (connectInfo: { chainId: string }) => {
      console.log('Wallet connected:', connectInfo);
      this.walletState.chainId = parseInt(connectInfo.chainId, 16);
      this.notifyListeners();
    });

    // Listen for disconnection
    ethereum.on('disconnect', (error: any) => {
      console.log('Wallet disconnected:', error);
      this.walletState = {
        isConnected: false,
        accounts: [],
        chainId: null,
        balance: "0"
      };
      this.notifyListeners();
    });
  }

  /**
   * Connect to Coinbase Wallet
   */
  async connect(): Promise<WalletState> {
    try {
      console.log('Connecting to Coinbase Wallet...');
      
      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }

      // Get chain ID
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      }) as string;

      // Get balance
      const balance = await this.getBalance(accounts[0]);

      this.walletState = {
        isConnected: true,
        accounts,
        chainId: parseInt(chainId, 16),
        balance
      };

      console.log('Successfully connected to Coinbase Wallet:', this.walletState);
      this.notifyListeners();
      
      return this.walletState;
    } catch (error) {
      console.error('Failed to connect to Coinbase Wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect from wallet
   */
  async disconnect(): Promise<void> {
    try {
      // Note: Coinbase Wallet SDK doesn't have a direct disconnect method
      // The user needs to disconnect from the wallet app itself
      console.log('To disconnect, please use the Coinbase Wallet app');
      
      // Reset local state
      this.walletState = {
        isConnected: false,
        accounts: [],
        chainId: null,
        balance: "0"
      };
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    try {
      const balance = await web3.eth.getBalance(address);
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Failed to get balance:', error);
      return "0";
    }
  }

  /**
   * Switch to a specific chain
   */
  async switchChain(chainId: number): Promise<void> {
    try {
      const hexChainId = `0x${chainId.toString(16)}`;
      
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (error: any) {
      // If chain is not added, try to add it
      if (error.code === 4902) {
        await this.addChain(chainId);
      } else {
        throw error;
      }
    }
  }

  /**
   * Add a new chain to the wallet
   */
  async addChain(chainId: number): Promise<void> {
    const chainConfigs: Record<number, any> = {
      8453: {
        chainId: '0x2105',
        chainName: 'Base',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
      },
      84532: {
        chainId: '0x14a34',
        chainName: 'Base Sepolia',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org'],
      },
    };

    const chainConfig = chainConfigs[chainId];
    if (!chainConfig) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [chainConfig],
    });
  }

  /**
   * Send a transaction
   */
  async sendTransaction(params: {
    to: string;
    value?: string;
    data?: string;
    gas?: string;
  }): Promise<string> {
    try {
      if (!this.walletState.isConnected || this.walletState.accounts.length === 0) {
        throw new Error('Wallet not connected');
      }

      const txParams = {
        from: this.walletState.accounts[0],
        to: params.to,
        value: params.value ? web3.utils.toHex(web3.utils.toWei(params.value, 'ether')) : '0x0',
        data: params.data || '0x',
        gas: params.gas || '0x5208', // 21000 in hex
      };

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      }) as string;

      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.walletState.isConnected || this.walletState.accounts.length === 0) {
        throw new Error('Wallet not connected');
      }

      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, this.walletState.accounts[0]],
      }) as string;

      console.log('Message signed:', signature);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.walletState };
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.walletState);
      } catch (error) {
        console.error('Error in wallet state listener:', error);
      }
    });
  }

  /**
   * Check if wallet is available
   */
  isWalletAvailable(): boolean {
    return typeof window !== 'undefined' && !!ethereum;
  }
}

// Export singleton instance
export const coinbaseWalletService = new CoinbaseWalletService();

// Export types
export type { WalletState };
export default coinbaseWalletService;

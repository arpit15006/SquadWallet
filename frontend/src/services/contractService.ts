import { ethers } from 'ethers';

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
  SQUAD_WALLET_FACTORY: import.meta.env.VITE_SQUAD_WALLET_FACTORY || '0xA94333d421473Bd690731c04f948eD5412A18277',
  GAME_MANAGER: import.meta.env.VITE_GAME_MANAGER_CONTRACT || '0x2Ef603deC1b9914405F24742aD8D074572B0E5cA',
  XP_BADGES: import.meta.env.VITE_XP_BADGES_CONTRACT || '0xBa4d9F57ED3fB5a0c0a58BC1c34079B9b754016d'
};

// Contract ABIs (simplified for demo)
const SQUAD_WALLET_FACTORY_ABI = [
  'function createSquadWallet(string memory name, address[] memory members, string[] memory memberNames) external returns (address)',
  'function getUserWallets(address user) external view returns (address[])',
  'function squadWalletCount() external view returns (uint256)',
  'event SquadWalletCreated(address indexed wallet, string name, address indexed creator)'
];

const GAME_MANAGER_ABI = [
  'function createDiceGame(uint256 wager) external payable returns (uint256)',
  'function createCoinFlipGame(uint256 wager) external payable returns (uint256)',
  'function joinGame(uint256 gameId) external payable',
  'function getGame(uint256 gameId) external view returns (tuple(uint256 id, address creator, uint256 wager, uint8 gameType, uint8 status, address winner, uint256 result))',
  'function getUserGames(address user) external view returns (uint256[])',
  'function getActiveGames() external view returns (uint256[])',
  'event GameCreated(uint256 indexed gameId, address indexed creator, uint256 wager, uint8 gameType)',
  'event GameJoined(uint256 indexed gameId, address indexed player)',
  'event GameCompleted(uint256 indexed gameId, address indexed winner, uint256 result)'
];

const XP_BADGES_ABI = [
  'function getUserXP(address user) external view returns (uint256)',
  'function getUserLevel(address user) external view returns (uint256)',
  'function getUserBadges(address user) external view returns (uint256[])',
  'function getBadgeInfo(uint256 tokenId) external view returns (tuple(uint256 level, string rarity, string metadata))',
  'function mintBadge(address to, uint256 level) external returns (uint256)',
  'function getLeaderboard(uint256 limit) external view returns (address[], uint256[])',
  'event XPAwarded(address indexed user, uint256 amount, string reason)',
  'event BadgeMinted(address indexed user, uint256 indexed tokenId, uint256 level)'
];

export class ContractService {
  private provider: ethers.Provider;
  private signer: ethers.Signer | null = null;
  private squadWalletFactory: ethers.Contract;
  private gameManager: ethers.Contract;
  private xpBadges: ethers.Contract;
  private walletCache: Map<string, string[]> = new Map();

  constructor(provider: ethers.Provider) {
    this.provider = provider;
    
    // Initialize contract instances
    this.squadWalletFactory = new ethers.Contract(
      CONTRACT_ADDRESSES.SQUAD_WALLET_FACTORY,
      SQUAD_WALLET_FACTORY_ABI,
      provider
    );
    
    this.gameManager = new ethers.Contract(
      CONTRACT_ADDRESSES.GAME_MANAGER,
      GAME_MANAGER_ABI,
      provider
    );
    
    this.xpBadges = new ethers.Contract(
      CONTRACT_ADDRESSES.XP_BADGES,
      XP_BADGES_ABI,
      provider
    );
  }

  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    this.squadWalletFactory = this.squadWalletFactory.connect(signer) as ethers.Contract;
    this.gameManager = this.gameManager.connect(signer) as ethers.Contract;
    this.xpBadges = this.xpBadges.connect(signer) as ethers.Contract;
  }

  // Squad Wallet Functions
  async createSquadWallet(name: string, members: string[], memberNames: string[]) {
    if (!this.signer) throw new Error('Signer not set');

    try {
      console.log('Creating squad wallet:', { name, members, memberNames });
      const tx = await this.squadWalletFactory.createSquadWallet(name, members, memberNames);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Try to extract wallet address from events
      let walletAddress = null;

      // Method 1: Try to parse events
      try {
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = this.squadWalletFactory.interface.parseLog(log);
            return parsed?.name === 'SquadWalletCreated';
          } catch {
            return false;
          }
        });

        if (event) {
          const parsed = this.squadWalletFactory.interface.parseLog(event);
          walletAddress = parsed?.args?.[0];
          console.log('Wallet address from event:', walletAddress);
        }
      } catch (error) {
        console.warn('Failed to parse events:', error);
      }

      // Method 2: If event parsing failed, get the latest wallet for this user
      if (!walletAddress) {
        console.log('Event parsing failed, fetching user wallets...');
        // Wait a bit for the blockchain state to update
        await new Promise(resolve => setTimeout(resolve, 2000));

        const userWallets = await this.getUserSquadWallets(await this.signer.getAddress());
        if (userWallets.length > 0) {
          walletAddress = userWallets[userWallets.length - 1]; // Get the latest wallet
          console.log('Latest wallet address:', walletAddress);
        }
      }

      // Clear cache for this user since they created a new wallet
      if (this.signer) {
        const userAddress = await this.signer.getAddress();
        this.walletCache.delete(userAddress);
      }

      return {
        walletAddress: walletAddress || 'Unknown',
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to create squad wallet:', error);
      throw error;
    }
  }

  async getUserSquadWallets(userAddress: string, forceRefresh: boolean = false) {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && this.walletCache.has(userAddress)) {
        console.log('Returning cached wallets for:', userAddress);
        return this.walletCache.get(userAddress)!;
      }

      console.log('Fetching squad wallets for:', userAddress);
      const wallets = await this.squadWalletFactory.getUserWallets(userAddress);
      console.log('Found wallets:', wallets);

      // Convert BigInt addresses to strings if needed
      const walletAddresses = Array.isArray(wallets)
        ? wallets.map(w => typeof w === 'string' ? w : w.toString())
        : [];

      console.log('Processed wallet addresses:', walletAddresses);

      // Cache the result
      this.walletCache.set(userAddress, walletAddresses);

      return walletAddresses;
    } catch (error) {
      console.error('Failed to get user squad wallets:', error);
      console.error('Error details:', error);
      return [];
    }
  }

  // Method to clear wallet cache for a user
  clearWalletCache(userAddress: string) {
    this.walletCache.delete(userAddress);
  }

  // Game Functions
  async createDiceGame(wager: string) {
    if (!this.signer) throw new Error('Signer not set');
    
    try {
      const wagerWei = ethers.parseEther(wager);
      const tx = await this.gameManager.createDiceGame(wagerWei, { value: wagerWei });
      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === 'GameCreated'
      );
      
      return {
        gameId: event?.args?.[0],
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to create dice game:', error);
      throw error;
    }
  }

  async createCoinFlipGame(wager: string) {
    if (!this.signer) throw new Error('Signer not set');
    
    try {
      const wagerWei = ethers.parseEther(wager);
      const tx = await this.gameManager.createCoinFlipGame(wagerWei, { value: wagerWei });
      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === 'GameCreated'
      );
      
      return {
        gameId: event?.args?.[0],
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to create coin flip game:', error);
      throw error;
    }
  }

  async joinGame(gameId: number, wager: string) {
    if (!this.signer) throw new Error('Signer not set');
    
    try {
      const wagerWei = ethers.parseEther(wager);
      const tx = await this.gameManager.joinGame(gameId, { value: wagerWei });
      const receipt = await tx.wait();
      
      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }

  async getGame(gameId: number) {
    try {
      const game = await this.gameManager.getGame(gameId);
      return {
        id: game.id,
        creator: game.creator,
        wager: ethers.formatEther(game.wager),
        gameType: game.gameType, // 0 = dice, 1 = coin
        status: game.status, // 0 = pending, 1 = active, 2 = completed
        winner: game.winner,
        result: game.result
      };
    } catch (error) {
      console.error('Failed to get game:', error);
      return null;
    }
  }

  async getUserGames(userAddress: string) {
    try {
      const gameIds = await this.gameManager.getUserGames(userAddress);
      const games = await Promise.all(
        gameIds.map((id: bigint) => this.getGame(Number(id)))
      );
      return games.filter(game => game !== null);
    } catch (error) {
      console.error('Failed to get user games:', error);
      return [];
    }
  }

  async getActiveGames() {
    try {
      const gameIds = await this.gameManager.getActiveGames();
      const games = await Promise.all(
        gameIds.map((id: bigint) => this.getGame(Number(id)))
      );
      return games.filter(game => game !== null);
    } catch (error) {
      console.error('Failed to get active games:', error);
      return [];
    }
  }

  // XP and Badge Functions
  async getUserXP(userAddress: string) {
    try {
      const xp = await this.xpBadges.getUserXP(userAddress);
      return Number(xp);
    } catch (error) {
      console.error('Failed to get user XP:', error);
      return 0;
    }
  }

  async getUserLevel(userAddress: string) {
    try {
      const level = await this.xpBadges.getUserLevel(userAddress);
      return Number(level);
    } catch (error) {
      console.error('Failed to get user level:', error);
      return 1;
    }
  }

  async getUserBadges(userAddress: string) {
    try {
      const badgeIds = await this.xpBadges.getUserBadges(userAddress);
      const badges = await Promise.all(
        badgeIds.map(async (id: bigint) => {
          const info = await this.xpBadges.getBadgeInfo(Number(id));
          return {
            tokenId: Number(id),
            level: Number(info.level),
            rarity: info.rarity,
            metadata: info.metadata
          };
        })
      );
      return badges;
    } catch (error) {
      console.error('Failed to get user badges:', error);
      return [];
    }
  }

  async getLeaderboard(limit: number = 10) {
    try {
      const [addresses, xpAmounts] = await this.xpBadges.getLeaderboard(limit);
      return addresses.map((address: string, index: number) => ({
        address,
        xp: Number(xpAmounts[index]),
        rank: index + 1
      }));
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }

  // Utility Functions
  async getBalance(address: string) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async waitForTransaction(txHash: string) {
    try {
      const receipt = await this.provider.waitForTransaction(txHash);
      return receipt;
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      throw error;
    }
  }

  // Event Listeners
  onGameCreated(callback: (gameId: number, creator: string, wager: string, gameType: number) => void) {
    this.gameManager.on('GameCreated', (gameId, creator, wager, gameType) => {
      callback(Number(gameId), creator, ethers.formatEther(wager), gameType);
    });
  }

  onGameCompleted(callback: (gameId: number, winner: string, result: number) => void) {
    this.gameManager.on('GameCompleted', (gameId, winner, result) => {
      callback(Number(gameId), winner, Number(result));
    });
  }

  onXPAwarded(callback: (user: string, amount: number, reason: string) => void) {
    this.xpBadges.on('XPAwarded', (user, amount, reason) => {
      callback(user, Number(amount), reason);
    });
  }

  onBadgeMinted(callback: (user: string, tokenId: number, level: number) => void) {
    this.xpBadges.on('BadgeMinted', (user, tokenId, level) => {
      callback(user, Number(tokenId), Number(level));
    });
  }
}

// Singleton instance
let contractService: ContractService | null = null;

export const getContractService = (provider?: ethers.Provider) => {
  if (!contractService && provider) {
    contractService = new ContractService(provider);
  }
  return contractService;
};

export const initializeContractService = (provider: ethers.Provider, signer?: ethers.Signer) => {
  contractService = new ContractService(provider);
  if (signer) {
    contractService.setSigner(signer);
  }
  return contractService;
};

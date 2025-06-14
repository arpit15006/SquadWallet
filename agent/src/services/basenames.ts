import { ethers } from 'ethers';
import logger from '../utils/logger';
import { getName, getAddress } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

// Basenames registry contract address on Base mainnet (correct address from official repo)
const BASENAMES_REGISTRY_ADDRESS = '0xb94704422c2a1e396835a571837aa5ae53285a95';

// Basenames registry ABI (simplified)
const BASENAMES_REGISTRY_ABI = [
  // ENS Registry interface
  'function resolver(bytes32 node) external view returns (address)',
  'function owner(bytes32 node) external view returns (address)',
  // Resolver interface
  'function addr(bytes32 node) external view returns (address)',
  'function name(bytes32 node) external view returns (string)',
];

/**
 * Basenames resolver using proper Base network contracts
 */
class BasenameRegistry {
  private provider: ethers.JsonRpcProvider;
  private registryContract: ethers.Contract;

  constructor() {
    // Create Base mainnet provider for Basename resolution
    this.provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    this.registryContract = new ethers.Contract(
      BASENAMES_REGISTRY_ADDRESS,
      BASENAMES_REGISTRY_ABI,
      this.provider
    );
  }

  /**
   * Convert a basename to namehash
   */
  private namehash(name: string): string {
    // Implement ENS namehash algorithm
    let node = '0x0000000000000000000000000000000000000000000000000000000000000000';

    if (name) {
      const labels = name.split('.');
      for (let i = labels.length - 1; i >= 0; i--) {
        const labelHash = ethers.keccak256(ethers.toUtf8Bytes(labels[i]));
        node = ethers.keccak256(ethers.concat([node, labelHash]));
      }
    }

    return node;
  }

  /**
   * Resolve a basename to wallet address using Base contracts
   */
  async resolve(name: string): Promise<string | null> {
    try {
      logger.debug('Resolving basename to address via Base contracts', { name });

      // Ensure name ends with .base.eth (Basenames are subdomains of base.eth)
      const normalizedName = name.endsWith('.base.eth') ? name :
                             name.endsWith('.base') ? `${name}.eth` :
                             `${name}.base.eth`;

      // Get namehash
      const node = this.namehash(normalizedName);

      // Get resolver address
      const resolverAddress = await this.registryContract.resolver(node);

      if (resolverAddress === ethers.ZeroAddress) {
        logger.debug('No resolver found for basename', { name: normalizedName });
        return null;
      }

      // Create resolver contract
      const resolverContract = new ethers.Contract(
        resolverAddress,
        ['function addr(bytes32 node) external view returns (address)'],
        this.provider
      );

      // Get address from resolver
      const address = await resolverContract.addr(node);

      if (address === ethers.ZeroAddress) {
        logger.debug('No address found for basename', { name: normalizedName });
        return null;
      }

      logger.info('Basename resolved successfully via Base contracts', {
        basename: normalizedName,
        address,
        resolver: resolverAddress
      });
      return address;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Basename resolution failed', { name, error: errorMessage });
      return null;
    }
  }

  /**
   * Reverse resolve address to basename using Base contracts
   */
  async reverse(address: string): Promise<string | null> {
    try {
      logger.debug('Reverse resolving address to basename via Base contracts', { address });

      // For reverse resolution, we need to query the reverse registrar
      // This is more complex and requires additional contract calls
      // For now, we'll use a simplified approach

      // Try to use ethers built-in reverse resolution first
      try {
        const name = await this.provider.lookupAddress(address);
        if (name && name.endsWith('.base.eth')) {
          logger.info('Address resolved to basename via ethers', { address, basename: name });
          return name;
        }
      } catch (ethersError) {
        logger.debug('Ethers reverse resolution failed, trying contract approach', { address });
      }

      // If ethers fails, we could implement manual reverse resolution
      // but this requires more complex contract interactions
      logger.debug('No basename found for address via reverse resolution', { address });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.debug('Reverse basename resolution failed', { address, error: errorMessage });
      return null;
    }
  }
}

/**
 * Basenames integration for ENS-style naming on Base
 * Provides resolution between human-readable names and wallet addresses
 */
export class BasenamesService {
  private registry: BasenameRegistry;
  private cache: Map<string, string> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Create registry for Basename resolution
    this.registry = new BasenameRegistry();

    logger.info('BasenamesService initialized with Base mainnet provider');
  }

  /**
   * Resolve basename to address using OnchainKit getAddress utility
   */
  async resolveBasenameToAddress(basename: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.cache.get(`name_${basename}`);
      if (cached) {
        return cached;
      }

      logger.info('Resolving basename to address using OnchainKit getAddress', { basename });

      // Normalize the basename
      const normalizedName = this.normalizeName(basename);

      // Use OnchainKit's getAddress utility function for proper basename resolution
      const address = await getAddress({
        name: normalizedName,
        chain: base
      });

      if (address) {
        // Cache the result
        this.cache.set(`name_${basename}`, address);
        setTimeout(() => this.cache.delete(`name_${basename}`), this.cacheTimeout);

        logger.info('Basename resolved successfully via OnchainKit getAddress', { basename: normalizedName, address });
        return address;
      }

      // Fallback to registry if OnchainKit doesn't have the basename
      const registryAddress = await this.registry.resolve(normalizedName);
      if (registryAddress) {
        this.cache.set(`name_${basename}`, registryAddress);
        setTimeout(() => this.cache.delete(`name_${basename}`), this.cacheTimeout);

        logger.info('Basename resolved via registry fallback', { basename: normalizedName, address: registryAddress });
        return registryAddress;
      }

      logger.debug('Basename not found', { basename: normalizedName });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to resolve basename to address', { basename, error: errorMessage });
      return null;
    }
  }

  /**
   * Resolve address to basename using OnchainKit getName utility
   */
  async resolveAddressToBasename(address: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.cache.get(`addr_${address}`);
      if (cached) {
        return cached;
      }

      logger.info('Resolving address to basename using OnchainKit getName', { address });

      // Use OnchainKit's getName utility function for proper basename resolution
      const basename = await getName({
        address: address as `0x${string}`,
        chain: base
      });

      if (basename) {
        // Cache the result
        this.cache.set(`addr_${address}`, basename);
        setTimeout(() => this.cache.delete(`addr_${address}`), this.cacheTimeout);

        logger.info('Address resolved to basename successfully via OnchainKit getName', { address, basename });
        return basename;
      }

      // Fallback to ENS registry if OnchainKit doesn't have the basename
      const registryBasename = await this.registry.reverse(address);
      if (registryBasename && registryBasename.endsWith('.base.eth')) {
        this.cache.set(`addr_${address}`, registryBasename);
        setTimeout(() => this.cache.delete(`addr_${address}`), this.cacheTimeout);

        logger.info('Address resolved to basename via registry fallback', { address, basename: registryBasename });
        return registryBasename;
      }

      logger.debug('No basename found for address', { address });
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to resolve address to basename', { address, error: errorMessage });
      return null;
    }
  }



  /**
   * Check if user has a basename
   */
  async hasBasename(address: string): Promise<boolean> {
    const basename = await this.resolveAddressToBasename(address);
    return basename !== null;
  }

  /**
   * Get user profile with basename info
   */
  async getUserProfile(address: string): Promise<{
    address: string;
    basename: string | null;
    hasBasename: boolean;
  }> {
    const basename = await this.resolveAddressToBasename(address);
    
    return {
      address,
      basename,
      hasBasename: basename !== null
    };
  }

  /**
   * Normalize basename (ensure .base suffix)
   */
  private normalizeName(name: string): string {
    // Remove @ if present
    let normalized = name.startsWith('@') ? name.slice(1) : name;

    // Add .base.eth if not present (Basenames are subdomains of base.eth)
    if (!normalized.endsWith('.base.eth')) {
      if (normalized.endsWith('.base')) {
        normalized = `${normalized}.eth`;
      } else {
        normalized = `${normalized}.base.eth`;
      }
    }

    return normalized.toLowerCase();
  }

  /**
   * Extract basename from message text (enhanced)
   */
  extractBasename(text: string): string | null {
    // Look for @username.base or @username patterns
    const basenameMatch = text.match(/@([a-zA-Z0-9-_]+(?:\.base(?:\.eth)?)?)/);
    if (basenameMatch) {
      return this.normalizeName(basenameMatch[1]);
    }
    return null;
  }

  /**
   * Validate basename format
   */
  validateBasename(basename: string): { valid: boolean; error?: string } {
    // Remove @ if present
    const normalized = basename.startsWith('@') ? basename.slice(1) : basename;

    // Check length (3-63 characters for the name part)
    const namePart = normalized.split('.')[0];
    if (namePart.length < 3) {
      return { valid: false, error: 'Basename must be at least 3 characters long' };
    }
    if (namePart.length > 63) {
      return { valid: false, error: 'Basename must be less than 63 characters long' };
    }

    // Check valid characters (alphanumeric and hyphens, no consecutive hyphens)
    if (!/^[a-z0-9-]+$/.test(namePart)) {
      return { valid: false, error: 'Basename can only contain lowercase letters, numbers, and hyphens' };
    }

    // Check for consecutive hyphens
    if (namePart.includes('--')) {
      return { valid: false, error: 'Basename cannot contain consecutive hyphens' };
    }

    // Check start/end with hyphen
    if (namePart.startsWith('-') || namePart.endsWith('-')) {
      return { valid: false, error: 'Basename cannot start or end with a hyphen' };
    }

    return { valid: true };
  }

  /**
   * Search for basenames by pattern
   */
  async searchBasenames(pattern: string, limit: number = 10): Promise<string[]> {
    try {
      // This is a simplified implementation
      // In production, this would query the Basenames registry
      const mockResults = [
        'alice.base.eth',
        'bob.base.eth',
        'charlie.base.eth',
        'david.base.eth',
        'eve.base.eth'
      ].filter(name => name.includes(pattern.toLowerCase()));

      return mockResults.slice(0, limit);
    } catch (error) {
      logger.error('Failed to search basenames', { pattern, error });
      return [];
    }
  }

  /**
   * Get basename suggestions for a user
   */
  async getBasenamesSuggestions(address: string): Promise<string[]> {
    try {
      // Generate suggestions based on address
      const addressSuffix = address.slice(-4);
      const suggestions = [
        `user${addressSuffix}.base.eth`,
        `player${addressSuffix}.base.eth`,
        `gamer${addressSuffix}.base.eth`,
        `squad${addressSuffix}.base.eth`,
        `crypto${addressSuffix}.base.eth`
      ];

      // Check availability (simplified)
      const available = [];
      for (const suggestion of suggestions) {
        const isAvailable = await this.isBasenameAvailable(suggestion);
        if (isAvailable) {
          available.push(suggestion);
        }
      }

      return available;
    } catch (error) {
      logger.error('Failed to get basename suggestions', { address, error });
      return [];
    }
  }

  /**
   * Check if basename is available (enhanced)
   */
  async isBasenameAvailable(basename: string): Promise<boolean> {
    try {
      // Validate format first
      const validation = this.validateBasename(basename);
      if (!validation.valid) {
        return false;
      }

      // Check if already resolved
      const address = await this.resolveBasenameToAddress(basename);
      return address === null;
    } catch (error) {
      logger.error('Failed to check basename availability', { basename, error });
      return false;
    }
  }

  /**
   * Get basename metadata
   */
  async getBasenameMetadata(basename: string): Promise<{
    name: string;
    description?: string;
    avatar?: string;
    url?: string;
    twitter?: string;
    github?: string;
    discord?: string;
  } | null> {
    try {
      // This would query the actual metadata from the resolver
      // For now, return mock data
      return {
        name: basename,
        description: `Profile for ${basename}`,
        avatar: undefined,
        url: undefined,
        twitter: undefined,
        github: undefined,
        discord: undefined
      };
    } catch (error) {
      logger.error('Failed to get basename metadata', { basename, error });
      return null;
    }
  }

  /**
   * Format address with basename for display (OnchainKit style)
   */
  async formatDisplayName(address: string): Promise<string> {
    try {
      const basename = await this.resolveAddressToBasename(address);
      if (basename) {
        // Format like OnchainKit: remove .base.eth suffix and add @ prefix
        const displayName = basename.replace('.base.eth', '').replace('.base', '');
        return `@${displayName}`;
      }
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    } catch (error) {
      logger.error('Failed to format display name', { address, error });
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  }

  /**
   * Get basename registration cost (mock)
   */
  async getRegistrationCost(basename: string, duration: number = 1): Promise<{
    cost: string;
    currency: string;
    duration: number;
  }> {
    try {
      const namePart = basename.split('.')[0];
      let baseCost = 0.005; // Base cost in ETH

      // Pricing based on length
      if (namePart.length === 3) baseCost = 0.1;
      else if (namePart.length === 4) baseCost = 0.05;
      else if (namePart.length === 5) baseCost = 0.01;

      const totalCost = baseCost * duration;

      return {
        cost: totalCost.toString(),
        currency: 'ETH',
        duration
      };
    } catch (error) {
      logger.error('Failed to get registration cost', { basename, error });
      return {
        cost: '0.005',
        currency: 'ETH',
        duration: 1
      };
    }
  }

  /**
   * Validate basename format
   */
  isValidBasename(name: string): boolean {
    const normalized = this.normalizeName(name);
    // Basic validation: should end with .base.eth and have valid characters
    return /^[a-z0-9-_]+\.base\.eth$/.test(normalized);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

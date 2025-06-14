import { Command } from '../types';

/**
 * Command parser utilities for XMTP messages
 */

/**
 * Parse a message content into a command structure
 * @param content - The message content
 * @param sender - The sender address
 * @param conversationId - The conversation ID
 * @returns Parsed command or null if not a command
 */
export function parseCommand(
  content: string,
  sender: string,
  conversationId: string
): Command | null {
  const trimmed = content.trim();
  
  // Check if message starts with command prefix
  if (!trimmed.startsWith('/')) {
    return null;
  }

  // Remove the leading slash and split by spaces
  const parts = trimmed.slice(1).split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  return {
    name,
    args,
    sender,
    conversationId,
    timestamp: new Date()
  };
}

/**
 * Validate command arguments
 * @param command - The command to validate
 * @param expectedArgs - Expected argument count or range
 * @returns Validation result
 */
export function validateCommand(
  command: Command,
  expectedArgs: number | [number, number]
): { valid: boolean; error?: string } {
  if (typeof expectedArgs === 'number') {
    if (command.args.length !== expectedArgs) {
      return {
        valid: false,
        error: `Expected ${expectedArgs} arguments, got ${command.args.length}`
      };
    }
  } else {
    const [min, max] = expectedArgs;
    if (command.args.length < min || command.args.length > max) {
      return {
        valid: false,
        error: `Expected ${min}-${max} arguments, got ${command.args.length}`
      };
    }
  }

  return { valid: true };
}

/**
 * Parse ETH amount from string (supports ETH, wei, gwei)
 * @param amountStr - Amount string (e.g., "1.5", "1.5 ETH", "1500000000 gwei")
 * @returns Amount in wei as string
 */
export function parseEthAmount(amountStr: string): string {
  const trimmed = amountStr.trim().toLowerCase();
  
  // Extract number and unit
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(eth|gwei|wei)?$/);
  if (!match) {
    throw new Error('Invalid amount format');
  }

  const [, numberStr, unit = 'eth'] = match;
  const number = parseFloat(numberStr);

  if (isNaN(number) || number <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Convert to wei based on unit
  switch (unit) {
    case 'eth':
      return (BigInt(Math.floor(number * 1e18))).toString();
    case 'gwei':
      return (BigInt(Math.floor(number * 1e9))).toString();
    case 'wei':
      return Math.floor(number).toString();
    default:
      throw new Error('Unsupported unit');
  }
}

/**
 * Format wei amount to readable string
 * @param weiAmount - Amount in wei
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatEthAmount(weiAmount: string, decimals: number = 4): string {
  const wei = BigInt(weiAmount);
  const eth = Number(wei) / 1e18;
  return `${eth.toFixed(decimals)} ETH`;
}

/**
 * Parse token symbol and validate
 * @param symbol - Token symbol
 * @returns Normalized symbol
 */
export function parseTokenSymbol(symbol: string): string {
  const normalized = symbol.trim().toUpperCase();
  
  // List of supported tokens
  const supportedTokens = ['ETH', 'USDC', 'USDT', 'WETH', 'DAI'];
  
  if (!supportedTokens.includes(normalized)) {
    throw new Error(`Unsupported token: ${symbol}`);
  }
  
  return normalized;
}

/**
 * Parse address and validate format
 * @param address - Ethereum address
 * @returns Validated address
 */
export function parseAddress(address: string): string {
  const trimmed = address.trim();
  
  // Basic Ethereum address validation
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    throw new Error('Invalid Ethereum address format');
  }
  
  return trimmed.toLowerCase();
}

/**
 * Parse game type
 * @param gameType - Game type string
 * @returns Validated game type
 */
export function parseGameType(gameType: string): 'dice' | 'coin' {
  const normalized = gameType.trim().toLowerCase();
  
  if (normalized === 'dice' || normalized === 'roll') {
    return 'dice';
  } else if (normalized === 'coin' || normalized === 'flip' || normalized === 'coinflip') {
    return 'coin';
  } else {
    throw new Error('Invalid game type. Use "dice" or "coin"');
  }
}

/**
 * Extract mentions from message content
 * @param content - Message content
 * @returns Array of mentioned addresses
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(0x[a-fA-F0-9]{40})/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1].toLowerCase());
  }
  
  return mentions;
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Parse duration string (e.g., "1h", "30m", "2d")
 * @param durationStr - Duration string
 * @returns Duration in seconds
 */
export function parseDuration(durationStr: string): number {
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid duration format. Use format like "1h", "30m", "2d"');
  }

  const [, numberStr, unit] = match;
  const number = parseInt(numberStr);

  switch (unit) {
    case 's': return number;
    case 'm': return number * 60;
    case 'h': return number * 3600;
    case 'd': return number * 86400;
    default: throw new Error('Invalid duration unit');
  }
}

/**
 * Format timestamp to readable string
 * @param timestamp - Unix timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Check if string is a valid URL
 * @param str - String to check
 * @returns True if valid URL
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

import { AgentKit } from '@coinbase/agentkit';
import { Command } from '../types';
import logger from './logger';

/**
 * Natural Language Parser using @coinbase/agentkit
 * Provides advanced parsing capabilities for natural language commands
 */
export class NLPParser {
  private agentKit: AgentKit | null = null;
  private commandMappings: Map<string, string> = new Map();
  
  constructor() {
    // Initialize command mappings for natural language to command name
    this.initializeCommandMappings();
    logger.info('NLPParser initialized');
  }

  /**
   * Initialize the AgentKit instance
   */
  async initialize(apiKeyName: string, apiKeyPrivateKey: string): Promise<void> {
    try {
      logger.info('Initializing AgentKit for NLP parsing...');
      
      // Initialize AgentKit with CDP credentials
      this.agentKit = await AgentKit.from({
        cdpApiKeyId: apiKeyName,
        cdpApiKeyPrivateKey: apiKeyPrivateKey,
      });
      
      logger.info('AgentKit initialized for NLP parsing');
    } catch (error) {
      logger.error('Failed to initialize AgentKit for NLP parsing', { error });
      throw error;
    }
  }

  /**
   * Parse natural language message into a command structure
   * @param content - The message content
   * @param sender - The sender address
   * @param conversationId - The conversation ID
   * @returns Parsed command or null if not a command
   */
  async parseNaturalLanguage(
    content: string,
    sender: string,
    conversationId: string
  ): Promise<Command | null> {
    try {
      const trimmed = content.trim();
      
      // Skip empty messages
      if (!trimmed) {
        return null;
      }
      
      // If it's already a slash command, use the traditional parser
      if (trimmed.startsWith('/')) {
        return this.parseSlashCommand(trimmed, sender, conversationId);
      }
      
      logger.info('Parsing natural language command', { 
        contentPreview: trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : '') 
      });
      
      // Use AgentKit to parse the natural language
      const intent = await this.detectIntent(trimmed);
      
      if (!intent) {
        logger.debug('No intent detected in message', { content: trimmed });
        return null;
      }
      
      logger.info('Intent detected', { intent });
      
      // Map the intent to a command
      const commandName = this.mapIntentToCommand(intent);
      
      if (!commandName) {
        logger.debug('Intent could not be mapped to a command', { intent });
        return null;
      }
      
      // Extract arguments from the natural language
      const args = await this.extractArguments(trimmed, intent);
      
      return {
        name: commandName,
        args,
        sender,
        conversationId,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error parsing natural language command', { error, content });
      return null;
    }
  }
  
  /**
   * Parse traditional slash command
   * @param content - The command content (starting with /)
   * @param sender - The sender address
   * @param conversationId - The conversation ID
   * @returns Parsed command
   */
  private parseSlashCommand(
    content: string,
    sender: string,
    conversationId: string
  ): Command {
    // Remove the leading slash and split by spaces
    const parts = content.slice(1).split(/\s+/);
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
   * Detect intent from natural language using AgentKit
   * @param content - The natural language content
   * @returns Detected intent or null
   */
  private async detectIntent(content: string): Promise<string | null> {
    try {
      if (!this.agentKit) {
        logger.warn('AgentKit not initialized for NLP parsing');
        return null;
      }
      
      // Use AgentKit to analyze the content
      // This is a simplified example - in a real implementation,
      // you would use AgentKit's NLP capabilities
      
      // For now, use a simple keyword-based approach
      const contentLower = content.toLowerCase();
      
      if (contentLower.includes('create') && contentLower.includes('wallet')) {
        return 'create_wallet';
      } else if (contentLower.includes('balance') || contentLower.includes('how much')) {
        return 'check_balance';
      } else if (contentLower.includes('deposit') || contentLower.includes('send') || contentLower.includes('transfer')) {
        return 'deposit';
      } else if (contentLower.includes('play') && contentLower.includes('dice')) {
        return 'play_dice';
      } else if (contentLower.includes('play') && (contentLower.includes('coin') || contentLower.includes('flip'))) {
        return 'play_coin';
      } else if (contentLower.includes('price') || contentLower.includes('how much is')) {
        return 'price';
      } else if (contentLower.includes('help') || contentLower.includes('commands')) {
        return 'help';
      } else if (contentLower.includes('swap')) {
        return 'swap';
      } else if (contentLower.includes('stats') || contentLower.includes('statistics')) {
        return 'stats';
      } else if (contentLower.includes('xp') || contentLower.includes('experience')) {
        return 'xp';
      } else if (contentLower.includes('leaderboard') || contentLower.includes('ranking')) {
        return 'leaderboard';
      }
      
      return null;
    } catch (error) {
      logger.error('Error detecting intent', { error, content });
      return null;
    }
  }
  
  /**
   * Map intent to command name
   * @param intent - The detected intent
   * @returns Command name or null
   */
  private mapIntentToCommand(intent: string): string | null {
    return this.commandMappings.get(intent) || null;
  }
  
  /**
   * Extract arguments from natural language based on intent
   * @param content - The natural language content
   * @param intent - The detected intent
   * @returns Extracted arguments
   */
  private async extractArguments(content: string, intent: string): Promise<string[]> {
    try {
      const contentLower = content.toLowerCase();
      
      switch (intent) {
        case 'create_wallet': {
          // Extract wallet name
          const nameMatch = content.match(/['"](.*?)['"]|create\s+(?:a\s+)?(?:squad\s+)?wallet\s+(?:called\s+)?([a-zA-Z0-9]+)/i);
          const walletName = nameMatch ? (nameMatch[1] || nameMatch[2]) : 'MyWallet';
          return [walletName];
        }
        
        case 'deposit': {
          // Extract amount
          const amountMatch = contentLower.match(/(\d+(?:\.\d+)?)\s*(?:eth|ether)?/);
          const amount = amountMatch ? amountMatch[1] : '0.1';
          return [amount];
        }
        
        case 'play_dice':
        case 'play_coin': {
          // Extract wager amount
          const wagerMatch = contentLower.match(/(\d+(?:\.\d+)?)\s*(?:eth|ether)?/);
          const wager = wagerMatch ? wagerMatch[1] : '0.01';
          return [wager];
        }
        
        case 'price': {
          // Extract token
          const tokenMatch = contentLower.match(/price\s+(?:of\s+)?([a-zA-Z0-9]+)|how\s+much\s+is\s+([a-zA-Z0-9]+)/i);
          const token = tokenMatch ? (tokenMatch[1] || tokenMatch[2] || 'ETH').toUpperCase() : 'ETH';
          return [token];
        }
        
        case 'swap': {
          // Extract from token, to token, and amount
          const fromMatch = contentLower.match(/swap\s+(?:from\s+)?([a-zA-Z0-9]+)/i);
          const toMatch = contentLower.match(/to\s+([a-zA-Z0-9]+)/i);
          const amountMatch = contentLower.match(/(\d+(?:\.\d+)?)\s*(?:eth|ether|usdc|dai)?/);
          
          const fromToken = fromMatch ? fromMatch[1].toUpperCase() : 'ETH';
          const toToken = toMatch ? toMatch[1].toUpperCase() : 'USDC';
          const amount = amountMatch ? amountMatch[1] : '0.1';
          
          return [fromToken, toToken, amount];
        }
        
        default:
          return [];
      }
    } catch (error) {
      logger.error('Error extracting arguments', { error, content, intent });
      return [];
    }
  }
  
  /**
   * Initialize command mappings
   */
  private initializeCommandMappings(): void {
    // Map intents to command names
    this.commandMappings.set('create_wallet', 'create-wallet');
    this.commandMappings.set('check_balance', 'balance');
    this.commandMappings.set('deposit', 'deposit');
    this.commandMappings.set('play_dice', 'play');
    this.commandMappings.set('play_coin', 'play');
    this.commandMappings.set('price', 'price');
    this.commandMappings.set('help', 'help');
    this.commandMappings.set('swap', 'swap');
    this.commandMappings.set('stats', 'stats');
    this.commandMappings.set('xp', 'xp');
    this.commandMappings.set('leaderboard', 'leaderboard');
  }
  
  /**
   * Check if AgentKit is initialized
   */
  isInitialized(): boolean {
    return this.agentKit !== null;
  }
}

// Export singleton instance
export const nlpParser = new NLPParser();

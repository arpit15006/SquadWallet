import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';
import { XMTPMessage } from '../types';
import logger from '../utils/logger';

/**
 * Enhanced XMTP service with group chat and advanced messaging features
 */
export class XMTPService {
  private client: Client | null = null;
  private wallet: ethers.Wallet;
  private messageHandlers: Map<string, (message: XMTPMessage) => Promise<void>> = new Map();
  private conversationCache: Map<string, any> = new Map();
  private messageHistory: Map<string, XMTPMessage[]> = new Map();

  constructor(privateKey: string, env: 'dev' | 'production' = 'production') {
    this.wallet = new ethers.Wallet(privateKey);
    logger.info('Enhanced XMTPService initialized', {
      address: this.wallet.address,
      env,
      features: ['group_chat', 'message_history', 'conversation_cache']
    });
  }

  /**
   * Initialize XMTP client
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing XMTP client...');
      
      this.client = await Client.create(this.wallet, {
        env: process.env.XMTP_ENV === 'dev' ? 'dev' : 'production'
      });

      logger.info('XMTP client initialized successfully', {
        address: this.client.address
      });

      // Start listening for messages
      await this.startListening();
    } catch (error) {
      logger.error('Failed to initialize XMTP client', { error });
      throw error;
    }
  }

  /**
   * Start listening for new messages
   */
  private async startListening(): Promise<void> {
    if (!this.client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      logger.info('Starting to listen for messages...');

      // Start listening for new conversations in the background
      this.listenForConversations();

      // Also listen to existing conversations
      const existingConversations = await this.client.conversations.list();
      for (const conversation of existingConversations) {
        logger.info('Setting up listener for existing conversation', {
          peerAddress: conversation.peerAddress,
          topic: conversation.topic
        });
        this.listenToConversation(conversation);
      }

      logger.info('Message listening setup complete');
    } catch (error) {
      logger.error('Error in message listening setup', { error });
    }
  }

  /**
   * Listen for new conversations (non-blocking)
   */
  private async listenForConversations(): Promise<void> {
    if (!this.client) return;

    try {
      // Run this in the background without blocking
      (async () => {
        for await (const conversation of await this.client!.conversations.stream()) {
          logger.info('New conversation detected', {
            peerAddress: conversation.peerAddress,
            topic: conversation.topic
          });

          // Listen for messages in this conversation
          this.listenToConversation(conversation);
        }
      })().catch(error => {
        logger.error('Error in conversation stream', { error });
      });
    } catch (error) {
      logger.error('Error setting up conversation listener', { error });
    }
  }

  /**
   * Listen to messages in a specific conversation (non-blocking)
   */
  private async listenToConversation(conversation: any): Promise<void> {
    try {
      // Run message listening in the background without blocking
      (async () => {
        for await (const message of await conversation.streamMessages()) {
          if (message.senderAddress === this.client?.address) {
            // Skip messages sent by the agent itself
            continue;
          }

          const xmtpMessage: XMTPMessage = {
            content: message.content,
            senderAddress: message.senderAddress,
            conversationId: conversation.topic,
            timestamp: message.sent
          };

          logger.info('Received message', {
            from: message.senderAddress,
            content: message.content.substring(0, 100) + '...',
            conversationId: conversation.topic
          });

          // Process the message
          await this.processMessage(xmtpMessage, conversation);
        }
      })().catch(error => {
        logger.error('Error listening to conversation', {
          error,
          conversationTopic: conversation.topic
        });
      });
    } catch (error) {
      logger.error('Error setting up conversation listener', { error });
    }
  }

  /**
   * Process incoming message with enhanced features
   */
  private async processMessage(message: XMTPMessage, conversation: any): Promise<void> {
    try {
      // Store message in history
      this.storeMessageInHistory(message);

      // Cache conversation for quick access
      this.conversationCache.set(message.conversationId, conversation);

      // Enhanced message processing with context
      const messageContext = {
        ...message,
        conversationParticipants: await this.getConversationParticipants(conversation),
        messageCount: this.getMessageCount(message.conversationId),
        isGroupChat: await this.isGroupConversation(conversation)
      };

      // Call all registered message handlers with enhanced context
      for (const [handlerName, handler] of this.messageHandlers) {
        try {
          await handler(messageContext);
        } catch (error) {
          logger.error(`Error in message handler ${handlerName}`, { error });
        }
      }
    } catch (error) {
      logger.error('Error processing message', { error });
    }
  }

  /**
   * Store message in history for context
   */
  private storeMessageInHistory(message: XMTPMessage): void {
    const conversationHistory = this.messageHistory.get(message.conversationId) || [];
    conversationHistory.push(message);

    // Keep only last 100 messages per conversation
    if (conversationHistory.length > 100) {
      conversationHistory.shift();
    }

    this.messageHistory.set(message.conversationId, conversationHistory);
  }

  /**
   * Get conversation participants
   */
  private async getConversationParticipants(conversation: any): Promise<string[]> {
    try {
      // For 1:1 conversations, return peer address
      if (conversation.peerAddress) {
        return [conversation.peerAddress, this.client?.address || ''];
      }

      // For group conversations (future feature)
      return [this.client?.address || ''];
    } catch (error) {
      logger.error('Error getting conversation participants', { error });
      return [];
    }
  }

  /**
   * Get message count for conversation
   */
  private getMessageCount(conversationId: string): number {
    return this.messageHistory.get(conversationId)?.length || 0;
  }

  /**
   * Check if conversation is a group chat
   */
  private async isGroupConversation(conversation: any): Promise<boolean> {
    // Currently XMTP only supports 1:1, but this prepares for group chat
    return false;
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(conversationTopic: string, content: string): Promise<void> {
    if (!this.client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const conversations = await this.client.conversations.list();
      const conversation = conversations.find(c => c.topic === conversationTopic);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await conversation.send(content);
      
      logger.info('Message sent successfully', {
        conversationTopic,
        contentLength: content.length
      });
    } catch (error) {
      logger.error('Failed to send message', { conversationTopic, error });
      throw error;
    }
  }

  /**
   * Send a message to a specific address
   */
  async sendMessageToAddress(address: string, content: string): Promise<void> {
    if (!this.client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      // Check if we can message this address
      const canMessage = await this.client.canMessage(address);
      if (!canMessage) {
        throw new Error(`Cannot send message to ${address} - they may not have XMTP enabled`);
      }

      // Create or get existing conversation
      const conversation = await this.client.conversations.newConversation(address);
      await conversation.send(content);

      logger.info('Direct message sent successfully', {
        to: address,
        contentLength: content.length
      });
    } catch (error) {
      logger.error('Failed to send direct message', { address, error });
      throw error;
    }
  }

  /**
   * Register a message handler
   */
  registerMessageHandler(name: string, handler: (message: XMTPMessage) => Promise<void>): void {
    this.messageHandlers.set(name, handler);
    logger.info('Message handler registered', { name });
  }

  /**
   * Unregister a message handler
   */
  unregisterMessageHandler(name: string): void {
    this.messageHandlers.delete(name);
    logger.info('Message handler unregistered', { name });
  }

  /**
   * Get all conversations with enhanced metadata
   */
  async getConversations(): Promise<any[]> {
    if (!this.client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const conversations = await this.client.conversations.list();

      // Enhance conversations with metadata
      const enhancedConversations = await Promise.all(
        conversations.map(async (conv) => ({
          ...conv,
          messageCount: this.getMessageCount(conv.topic),
          lastMessage: this.getLastMessage(conv.topic),
          participants: await this.getConversationParticipants(conv),
          isActive: this.isConversationActive(conv.topic)
        }))
      );

      return enhancedConversations;
    } catch (error) {
      logger.error('Failed to get conversations', { error });
      throw error;
    }
  }

  /**
   * Get last message from conversation
   */
  private getLastMessage(conversationId: string): XMTPMessage | null {
    const history = this.messageHistory.get(conversationId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Check if conversation is active (has recent messages)
   */
  private isConversationActive(conversationId: string): boolean {
    const lastMessage = this.getLastMessage(conversationId);
    if (!lastMessage) return false;

    const hoursSinceLastMessage = (Date.now() - lastMessage.timestamp.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastMessage < 24; // Active if message within 24 hours
  }

  /**
   * Send enhanced response with formatting and context
   */
  async sendEnhancedResponse(
    conversationId: string,
    message: string,
    isSuccess: boolean,
    options?: {
      includeContext?: boolean;
      addReactions?: boolean;
      mentionUser?: string;
    }
  ): Promise<void> {
    try {
      let enhancedMessage = message;

      // Add context if requested
      if (options?.includeContext) {
        const messageCount = this.getMessageCount(conversationId);
        enhancedMessage = `[Message #${messageCount + 1}] ${enhancedMessage}`;
      }

      // Add user mention if specified
      if (options?.mentionUser) {
        enhancedMessage = `@${options.mentionUser} ${enhancedMessage}`;
      }

      // Add status emoji
      const statusEmoji = isSuccess ? '✅' : '❌';
      enhancedMessage = `${statusEmoji} ${enhancedMessage}`;

      await this.sendMessage(conversationId, enhancedMessage);

      logger.info('Enhanced response sent', {
        conversationId,
        success: isSuccess,
        messageLength: enhancedMessage.length,
        options
      });
    } catch (error) {
      logger.error('Failed to send enhanced response', { error });
      throw error;
    }
  }

  /**
   * Broadcast message to multiple conversations
   */
  async broadcastMessage(
    conversationIds: string[],
    message: string,
    options?: {
      delay?: number; // Delay between messages in ms
      personalizeMessage?: boolean;
    }
  ): Promise<void> {
    try {
      logger.info('Broadcasting message to multiple conversations', {
        conversationCount: conversationIds.length,
        messageLength: message.length
      });

      for (let i = 0; i < conversationIds.length; i++) {
        const conversationId = conversationIds[i];

        let personalizedMessage = message;
        if (options?.personalizeMessage) {
          const conversation = this.conversationCache.get(conversationId);
          if (conversation?.peerAddress) {
            personalizedMessage = `Hey ${conversation.peerAddress.slice(0, 6)}...! ${message}`;
          }
        }

        await this.sendMessage(conversationId, personalizedMessage);

        // Add delay between messages if specified
        if (options?.delay && i < conversationIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
      }

      logger.info('Broadcast completed successfully');
    } catch (error) {
      logger.error('Failed to broadcast message', { error });
      throw error;
    }
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(conversationTopic: string, limit: number = 50): Promise<any[]> {
    if (!this.client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const conversations = await this.client.conversations.list();
      const conversation = conversations.find(c => c.topic === conversationTopic);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const messages = await conversation.messages({ limit });
      return messages;
    } catch (error) {
      logger.error('Failed to get messages', { conversationTopic, error });
      throw error;
    }
  }

  /**
   * Check if an address can receive messages
   */
  async canMessage(address: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      return await this.client.canMessage(address);
    } catch (error) {
      logger.error('Failed to check if can message', { address, error });
      return false;
    }
  }

  /**
   * Get the agent's XMTP address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Disconnect the client
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      // XMTP client doesn't have explicit disconnect method
      // Just clear the reference
      this.client = null;
      logger.info('XMTP client disconnected');
    }
  }

  /**
   * Send a formatted response message
   */
  async sendResponse(
    conversationTopic: string,
    message: string,
    success: boolean = true,
    data?: any
  ): Promise<void> {
    const emoji = success ? '✅' : '❌';
    const formattedMessage = `${emoji} ${message}`;
    
    if (data) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await this.sendMessage(conversationTopic, `${formattedMessage}\n\n${dataString}`);
    } else {
      await this.sendMessage(conversationTopic, formattedMessage);
    }
  }

  /**
   * Send a direct message to an address (alias for sendMessageToAddress)
   */
  async sendDirectMessage(address: string, content: string): Promise<void> {
    return this.sendMessageToAddress(address, content);
  }

  /**
   * Send a help message with available commands
   */
  async sendHelpMessage(conversationTopic: string): Promise<void> {
    const helpMessage = `
🤖 **SquadWallet Agent Commands**

**Wallet Management:**
• \`/create-wallet <name>\` - Create a new squad wallet
• \`/deposit <amount>\` - Deposit ETH to your wallet
• \`/balance\` - Check wallet balance
• \`/wallets\` - List your wallets

**Games:**
• \`/play dice <wager>\` - Start a dice game
• \`/play coin <wager>\` - Start a coin flip game
• \`/join <gameId>\` - Join an existing game
• \`/games\` - List active games

**Information:**
• \`/price <token>\` - Get token price
• \`/stats\` - View your statistics
• \`/xp\` - Check your XP and badges
• \`/leaderboard\` - View XP leaderboard

**Proposals:**
• \`/propose <description>\` - Create a proposal
• \`/vote <proposalId> <yes/no>\` - Vote on a proposal

**Help:**
• \`/help\` - Show this help message

💡 **Tips:**
- Use ETH amounts like "0.1" or "0.1 ETH"
- Games require minimum 0.001 ETH wager
- All transactions are on Base mainnet
    `;

    await this.sendMessage(conversationTopic, helpMessage.trim());
  }
}

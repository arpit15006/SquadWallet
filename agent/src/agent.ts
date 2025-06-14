import * as dotenv from 'dotenv';
import { AgentConfig, Command, XMTPMessage, CommandHandler } from './types';
import { XMTPService } from './services/xmtp';
import { BlockchainService } from './services/blockchain';
import { PriceService } from './services/price';
import { SwapService } from './services/swap';
import { OnchainKitService } from './services/onchainkit';
import { BasenamesService } from './services/basenames';
import { TournamentService } from './services/tournament';
import { HttpBridgeService } from './services/httpBridge';
import { ethers } from 'ethers';
import { WalletHandlers } from './handlers/wallet';
import { GameHandlers } from './handlers/game';
import { InfoHandlers } from './handlers/info';
import { SwapHandlers } from './handlers/swap';
import { DeFiHandlers } from './handlers/defi';
import { XPHandlers } from './handlers/xp';
import { TournamentHandlers } from './handlers/tournament';
import { SocialHandlers } from './handlers/social';
import { HelpHandlers } from './handlers/help';
import { parseCommand } from './utils/parser';
import logger from './utils/logger';
import * as cron from 'node-cron';

// Load environment variables
dotenv.config({ path: '../.env' });

/**
 * Main SquadWallet Agent class
 */
export class SquadWalletAgent {
  private xmtpService: XMTPService;
  private blockchainService: BlockchainService;
  private priceService: PriceService;
  private swapService: SwapService;
  private onchainKitService: OnchainKitService;
  private basenamesService: BasenamesService;
  private tournamentService: TournamentService;
  private httpBridge: HttpBridgeService;
  private commandHandlers: Map<string, CommandHandler> = new Map();
  private config: AgentConfig;

  constructor() {
    // Initialize configuration
    this.config = this.loadConfig();
    
    // Initialize services
    this.xmtpService = new XMTPService(
      this.config.xmtpPrivateKey,
      this.config.xmtpEnv
    );
    
    this.blockchainService = new BlockchainService(this.config);
    this.priceService = new PriceService();

    // Initialize SwapService with provider and wallet from BlockchainService
    const provider = new ethers.JsonRpcProvider(this.config.baseRpcUrl);
    const wallet = new ethers.Wallet(this.config.xmtpPrivateKey, provider);
    this.swapService = new SwapService(provider, wallet);

    // Initialize new services
    this.onchainKitService = new OnchainKitService();
    this.basenamesService = new BasenamesService();
    this.tournamentService = new TournamentService(provider, wallet);
    this.httpBridge = new HttpBridgeService();

    // Initialize command handlers
    this.initializeHandlers();

    logger.info('SquadWallet Agent initialized', {
      agentAddress: this.blockchainService.getAgentAddress(),
      xmtpEnv: this.config.xmtpEnv
    });
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): AgentConfig {
    const requiredEnvVars = [
      'XMTP_PRIVATE_KEY',
      'CDP_API_KEY_NAME',
      'CDP_API_KEY_PRIVATE_KEY',
      'BASE_RPC_URL',
      'SQUAD_WALLET_FACTORY',
      'GAME_MANAGER_CONTRACT',
      'XP_BADGES_CONTRACT'
    ];

    // Check for required environment variables
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    return {
      xmtpPrivateKey: process.env.XMTP_PRIVATE_KEY!,
      xmtpEnv: (process.env.XMTP_ENV as 'dev' | 'production') || 'production',
      cdpApiKeyName: process.env.CDP_API_KEY_NAME!,
      cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY!,
      baseRpcUrl: process.env.BASE_RPC_URL!,
      contracts: {
        squadWalletFactory: process.env.SQUAD_WALLET_FACTORY!,
        gameManager: process.env.GAME_MANAGER_CONTRACT!,
        xpBadges: process.env.XP_BADGES_CONTRACT!
      }
    };
  }

  /**
   * Initialize command handlers
   */
  private initializeHandlers(): void {
    const walletHandlers = new WalletHandlers(this.blockchainService, this.xmtpService);
    const gameHandlers = new GameHandlers(
      this.blockchainService,
      this.xmtpService
    );
    const infoHandlers = new InfoHandlers(this.blockchainService, this.xmtpService, this.priceService);
    const defiHandlers = new DeFiHandlers(this.blockchainService, this.xmtpService);
    const xpHandlers = new XPHandlers(this.blockchainService, this.xmtpService, this.basenamesService);
    const swapHandlers = new SwapHandlers(this.swapService, this.xmtpService);
    const tournamentHandlers = new TournamentHandlers(
      this.tournamentService,
      this.xmtpService,
      this.onchainKitService,
      this.basenamesService
    );
    const socialHandlers = new SocialHandlers(
      this.blockchainService,
      this.xmtpService,
      this.onchainKitService,
      this.basenamesService
    );
    const helpHandlers = new HelpHandlers(this.xmtpService);

    // Register all handlers
    const allHandlers = [
      ...walletHandlers.getAllHandlers(),
      ...gameHandlers.getAllHandlers(),
      ...infoHandlers.getAllHandlers(),
      ...defiHandlers.getAllHandlers(),
      ...xpHandlers.getAllHandlers(),
      ...swapHandlers.getAllHandlers(),
      ...tournamentHandlers.getAllHandlers(),
      ...socialHandlers.getAllHandlers(),
      ...helpHandlers.getAllHandlers()
    ];

    for (const handler of allHandlers) {
      this.commandHandlers.set(handler.name, handler);
    }

    logger.info('Command handlers initialized', {
      handlerCount: this.commandHandlers.size,
      handlers: Array.from(this.commandHandlers.keys())
    });
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    try {
      logger.info('Starting SquadWallet Agent...');

      // Initialize blockchain service
      await this.blockchainService.initializeCoinbaseWallet();

      // Initialize XMTP service
      await this.xmtpService.initialize();

      // Register message handler
      this.xmtpService.registerMessageHandler('commandProcessor', this.handleMessage.bind(this));

      // Start HTTP bridge for frontend communication
      this.httpBridge.setCommandHandler(this.handleHttpCommand.bind(this));
      await this.httpBridge.start(3001);

      // Start scheduled tasks
      this.startScheduledTasks();

      logger.info('SquadWallet Agent started successfully! 🚀');
      
      // Send startup notification (optional)
      await this.sendStartupNotification();

    } catch (error) {
      logger.error('Failed to start agent', { error });
      throw error;
    }
  }

  /**
   * Handle HTTP commands from frontend
   */
  private async handleHttpCommand(command: string, userAddress: string): Promise<string> {
    try {
      logger.info('Processing HTTP command', { command, userAddress });

      // Parse command
      const parsedCommand = parseCommand(command, userAddress, 'http-bridge');

      if (!parsedCommand) {
        return '❌ Invalid command format. Commands should start with `/`';
      }

      // Find and execute command handler
      const handler = this.commandHandlers.get(parsedCommand.name);
      if (!handler) {
        return `❌ Unknown command: \`/${parsedCommand.name}\`\n\nUse \`/help\` to see available commands.`;
      }

      // Execute command and capture response
      let response = '';
      const originalSendResponse = this.xmtpService.sendResponse;

      // Temporarily override sendResponse to capture the response
      this.xmtpService.sendResponse = async (conversationId: string, message: string, isSuccess: boolean) => {
        response = message;
        return Promise.resolve();
      };

      try {
        await handler.handler(parsedCommand);
        return response || '✅ Command executed successfully';
      } finally {
        // Restore original sendResponse
        this.xmtpService.sendResponse = originalSendResponse;
      }

    } catch (error: any) {
      logger.error('Error handling HTTP command', { error, command, userAddress });
      return `❌ Command failed: ${error.message}`;
    }
  }

  /**
   * Handle incoming XMTP messages
   */
  private async handleMessage(message: XMTPMessage): Promise<void> {
    try {
      logger.info('Processing message', {
        from: message.senderAddress,
        conversationId: message.conversationId,
        contentPreview: message.content.substring(0, 50) + '...'
      });

      // Parse command from message
      const command = parseCommand(
        message.content,
        message.senderAddress,
        message.conversationId
      );

      if (!command) {
        // Not a command, ignore or send help
        if (message.content.toLowerCase().includes('help') || 
            message.content.toLowerCase().includes('squad')) {
          await this.xmtpService.sendHelpMessage(message.conversationId);
        }
        return;
      }

      // Find and execute command handler
      const handler = this.commandHandlers.get(command.name);
      if (!handler) {
        const response = `❌ Unknown command: \`/${command.name}\`\n\nUse \`/help\` to see available commands.`;
        await this.xmtpService.sendResponse(message.conversationId, response, false);
        return;
      }

      // Execute command
      logger.info('Executing command', {
        command: command.name,
        args: command.args,
        sender: command.sender
      });

      await handler.handler(command);

    } catch (error) {
      logger.error('Error handling message', { error, message });
      
      try {
        await this.xmtpService.sendResponse(
          message.conversationId,
          '❌ An error occurred while processing your request. Please try again later.',
          false
        );
      } catch (sendError) {
        logger.error('Failed to send error response', { sendError });
      }
    }
  }

  /**
   * Start scheduled tasks (price alerts, etc.)
   */
  private startScheduledTasks(): void {
    // Price update task - every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        logger.debug('Running scheduled price update');
        // Clear price cache to ensure fresh data
        this.priceService.clearCache();
      } catch (error) {
        logger.error('Error in scheduled price update', { error });
      }
    });

    // Health check task - every hour
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running health check');
        const agentBalance = await this.blockchainService.getAgentBalance();
        logger.info('Agent health check', {
          balance: agentBalance,
          xmtpConnected: this.xmtpService.isInitialized()
        });
      } catch (error) {
        logger.error('Error in health check', { error });
      }
    });

    // Daily stats task - every day at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('Running daily stats collection');
        // In a real implementation, you might collect and store daily statistics
      } catch (error) {
        logger.error('Error in daily stats collection', { error });
      }
    });

    logger.info('Scheduled tasks started');
  }

  /**
   * Send startup notification (optional)
   */
  private async sendStartupNotification(): Promise<void> {
    try {
      // In a real implementation, you might send a notification to admin channels
      logger.info('Agent startup complete', {
        timestamp: new Date().toISOString(),
        agentAddress: this.blockchainService.getAgentAddress()
      });
    } catch (error) {
      logger.error('Failed to send startup notification', { error });
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down SquadWallet Agent...');

      // Stop HTTP bridge
      this.httpBridge.stop();

      // Disconnect XMTP
      await this.xmtpService.disconnect();

      logger.info('SquadWallet Agent shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown', { error });
    }
  }

  /**
   * Get agent status
   */
  getStatus(): {
    isRunning: boolean;
    agentAddress: string;
    xmtpConnected: boolean;
    commandHandlers: number;
  } {
    return {
      isRunning: true,
      agentAddress: this.blockchainService.getAgentAddress(),
      xmtpConnected: this.xmtpService.isInitialized(),
      commandHandlers: this.commandHandlers.size
    };
  }
}

/**
 * Main execution function
 */
async function main() {
  const agent = new SquadWalletAgent();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await agent.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await agent.shutdown();
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    process.exit(1);
  });

  try {
    await agent.start();
    
    // Keep the process running
    setInterval(() => {
      const status = agent.getStatus();
      logger.debug('Agent status check', status);
    }, 60000); // Check every minute

  } catch (error) {
    logger.error('Failed to start agent', { error });
    process.exit(1);
  }
}

// Run the agent if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error in main', { error });
    process.exit(1);
  });
}

export default SquadWalletAgent;

import express from 'express';
import cors from 'cors';
import logger from '../utils/logger';

export class HttpBridgeService {
  private app: express.Application;
  private server: any;
  private commandHandler: ((command: string, userAddress: string) => Promise<string>) | null = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }));
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'squad-wallet-agent-bridge'
      });
    });

    // Command endpoint
    this.app.post('/command', async (req, res) => {
      try {
        const { command, userAddress } = req.body;

        if (!command || !userAddress) {
          res.status(400).json({
            error: 'Missing command or userAddress'
          });
          return;
        }

        if (!this.commandHandler) {
          res.status(503).json({
            error: 'Command handler not initialized'
          });
          return;
        }

        logger.info('Processing HTTP command', { command, userAddress });

        const response = await this.commandHandler(command, userAddress);

        res.json({
          success: true,
          response,
          timestamp: new Date().toISOString()
        });

      } catch (error: any) {
        logger.error('HTTP command failed', { error: error.message });
        res.status(500).json({
          error: error.message || 'Command processing failed'
        });
      }
    });

    // Agent status
    this.app.get('/status', (req, res) => {
      res.json({
        status: 'active',
        agentAddress: process.env.AGENT_WALLET_ADDRESS || 'unknown',
        contracts: {
          squadWalletFactory: process.env.SQUAD_WALLET_FACTORY,
          gameManager: process.env.GAME_MANAGER_CONTRACT,
          xpBadges: process.env.XP_BADGES_CONTRACT
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  setCommandHandler(handler: (command: string, userAddress: string) => Promise<string>) {
    this.commandHandler = handler;
    logger.info('HTTP bridge command handler set');
  }

  start(port: number = 3001) {
    return new Promise<void>((resolve) => {
      this.server = this.app.listen(port, () => {
        logger.info('HTTP bridge started', { port });
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      logger.info('HTTP bridge stopped');
    }
  }
}

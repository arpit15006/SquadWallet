import { Command, CommandHandler } from '../types/command.js';
import { BlockchainService } from '../services/blockchain.js';
import { XMTPService } from '../services/xmtp.js';
import { logger } from '../utils/logger.js';
import { ethers } from 'ethers';

function validateCommand(command: Command, expectedArgs: number | number[]): { valid: boolean; error?: string } {
  const expectedArgsArray = Array.isArray(expectedArgs) ? expectedArgs : [expectedArgs];
  const actualArgs = command.args.length;
  
  if (!expectedArgsArray.includes(actualArgs)) {
    const expectedStr = expectedArgsArray.length === 1 
      ? expectedArgsArray[0].toString()
      : expectedArgsArray.join(' or ');
    return {
      valid: false,
      error: `Expected ${expectedStr} arguments, got ${actualArgs}`
    };
  }
  
  return { valid: true };
}

export class GameHandlers {
  constructor(
    private blockchainService: BlockchainService,
    private xmtpService: XMTPService
  ) {}

  /**
   * Play game command handler
   */
  play: CommandHandler = {
    name: 'play',
    description: 'Create a new game',
    usage: '/play <dice|coin> <bet-amount>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 2);
        if (!validation.valid) {
          return 'Error: ' + validation.error + '\nUsage: ' + this.play.usage;
        }

        const [gameType, betAmount] = command.args;
        const betNum = parseFloat(betAmount);

        if (!['dice', 'coin'].includes(gameType)) {
          return 'Error: Game type must be "dice" or "coin"';
        }

        if (isNaN(betNum) || betNum <= 0) {
          return 'Error: Bet amount must be a positive number';
        }

        if (betNum < 0.001) {
          return 'Error: Minimum bet is 0.001 ETH';
        }

        logger.info('Creating game', { gameType, betAmount, player: command.sender });

        // Convert bet amount to wei using ethers
        const wagerWei = ethers.parseEther(betAmount).toString();

        // Create game on blockchain using agent wallet (for demo)
        let gameResult;
        if (gameType === 'dice') {
          gameResult = await this.blockchainService.createDiceGame(wagerWei);
        } else {
          gameResult = await this.blockchainService.createCoinFlipGame(wagerWei);
        }

        // Generate transaction data for users to execute with their own wallets
        const txData = this.blockchainService.getCreateGameTxData(gameType, wagerWei);

        const response = 'Game Created! (Demo Mode)\n\n' +
          'Type: ' + (gameType === 'dice' ? 'Dice Roll (highest roll wins)' : 'Coin Flip (50/50 chance)') + '\n' +
          'Wager: ' + betAmount + ' ETH\n' +
          'Game ID: ' + gameResult.gameId + '\n' +
          'Creator: ' + command.sender + ' (simulated)\n\n' +
          'Production Transaction Data:\n' +
          'Contract: ' + txData.to + '\n' +
          'Function: ' + (gameType === 'dice' ? 'createDiceGame' : 'createCoinGame') + '\n' +
          'Value: ' + betAmount + ' ETH\n' +
          'Data: ' + txData.data + '\n\n' +
          'Using MetaMask/Wallet:\n' +
          '1. Connect to Base Sepolia network\n' +
          '2. Send transaction to: ' + txData.to + '\n' +
          '3. Include value: ' + betAmount + ' ETH\n' +
          '4. Use data: ' + txData.data + '\n\n' +
          'Note: In production, you would execute the above transaction with your own wallet.';

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to create game', { error, command });
        const errorMessage = 'Failed to create game. Please try again later.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Join game command handler
   */
  join: CommandHandler = {
    name: 'join',
    description: 'Join an existing game',
    usage: '/join <gameId>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 1);
        if (!validation.valid) {
          return 'Error: ' + validation.error + '\nUsage: ' + this.join.usage;
        }

        const gameIdStr = command.args[0];
        const gameId = parseInt(gameIdStr);

        if (isNaN(gameId) || gameId < 0) {
          return 'Error: Invalid game ID. Must be a positive number.';
        }

        logger.info('Joining game', { gameId, player: command.sender });

        // Get game info
        const gameInfo = await this.blockchainService.getGameInfo(gameId);
        
        if (gameInfo.state !== 'pending') {
          return 'Error: Game ' + gameId + ' is not available for joining (status: ' + gameInfo.state + ')';
        }

        // Generate transaction data for users to execute with their own wallets
        const txData = this.blockchainService.getJoinGameTxData(gameId, gameInfo.wager);

        const response = 'Ready to Join Game!\n\n' +
          'Game ID: ' + gameId + '\n' +
          'Type: ' + (gameInfo.type === 'dice' ? 'Dice Roll' : 'Coin Flip') + '\n' +
          'Wager: ' + gameInfo.wager + ' ETH\n' +
          'Current Players: ' + gameInfo.players.length + '\n\n' +
          'Production Transaction Data:\n' +
          'Contract: ' + txData.to + '\n' +
          'Function: joinGame\n' +
          'Value: ' + gameInfo.wager + ' ETH\n' +
          'Data: ' + txData.data + '\n\n' +
          'Using MetaMask/Wallet:\n' +
          '1. Connect to Base Sepolia network\n' +
          '2. Send transaction to: ' + txData.to + '\n' +
          '3. Include value: ' + gameInfo.wager + ' ETH\n' +
          '4. Use data: ' + txData.data + '\n\n' +
          'Note: In production, you would execute the above transaction with your own wallet.';

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to join game', { error, command });
        const errorMessage = 'Failed to join game. Please check the game ID and try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Get all game handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.play,
      this.join
    ];
  }
}

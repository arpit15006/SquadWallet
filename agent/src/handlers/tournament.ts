import { Command, CommandHandler } from '../types';
import { TournamentService } from '../services/tournament';
import { XMTPService } from '../services/xmtp';
import { OnchainKitService } from '../services/onchainkit';
import { BasenamesService } from '../services/basenames';
import { validateCommand } from '../utils/parser';
import logger from '../utils/logger';

/**
 * Tournament-related command handlers
 */
export class TournamentHandlers {
  constructor(
    private tournamentService: TournamentService,
    private xmtpService: XMTPService,
    private onchainKitService: OnchainKitService,
    private basenamesService: BasenamesService
  ) {}

  /**
   * Create tournament command
   */
  createTournament: CommandHandler = {
    name: 'tournament-create',
    description: 'Create a new tournament',
    usage: '/tournament create <name> <game-type> <entry-fee> <max-participants> <duration-hours>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 5);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.createTournament.usage}`;
        }

        const [name, gameType, entryFee, maxParticipants, durationHours] = command.args;

        // Validate game type
        if (!['dice', 'coinflip', 'mixed'].includes(gameType)) {
          return '❌ Invalid game type. Use: dice, coinflip, or mixed';
        }

        // Validate numbers
        const entryFeeNum = parseFloat(entryFee);
        const maxParticipantsNum = parseInt(maxParticipants);
        const durationHoursNum = parseInt(durationHours);

        if (isNaN(entryFeeNum) || entryFeeNum <= 0) {
          return '❌ Entry fee must be a positive number';
        }

        if (isNaN(maxParticipantsNum) || maxParticipantsNum < 2 || maxParticipantsNum > 100) {
          return '❌ Max participants must be between 2 and 100';
        }

        if (isNaN(durationHoursNum) || durationHoursNum < 1 || durationHoursNum > 168) {
          return '❌ Duration must be between 1 and 168 hours (1 week)';
        }

        logger.info('Creating tournament', {
          name,
          gameType,
          entryFee,
          maxParticipants: maxParticipantsNum,
          durationHours: durationHoursNum,
          creator: command.sender
        });

        const tournament = await this.tournamentService.createTournament({
          name,
          gameType: gameType as 'dice' | 'coinflip' | 'mixed',
          entryFee,
          maxParticipants: maxParticipantsNum,
          durationHours: durationHoursNum,
          createdBy: command.sender
        });

        const response = this.onchainKitService.generateTournamentFrame({
          name: tournament.name,
          entryFee: tournament.entryFee,
          prizePool: tournament.prizePool,
          participants: tournament.participants.length,
          maxParticipants: tournament.maxParticipants,
          startTime: tournament.startTime,
          endTime: tournament.endTime,
          status: tournament.status
        });

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to create tournament', { error, command });
        const errorMessage = '❌ Failed to create tournament. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Join tournament command
   */
  joinTournament: CommandHandler = {
    name: 'tournament-join',
    description: 'Join a tournament',
    usage: '/tournament join <tournament-id>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 1);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.joinTournament.usage}`;
        }

        const tournamentId = command.args[0];

        logger.info('Joining tournament', {
          tournamentId,
          player: command.sender
        });

        const result = await this.tournamentService.joinTournament(tournamentId, command.sender);

        if (!result.success) {
          const errorMessage = `❌ ${result.message}`;
          await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
          return errorMessage;
        }

        const tournament = result.tournament!;
        const userIdentity = await this.basenamesService.getUserIdentity(command.sender);

        const response = `🎉 **Tournament Joined!**

🏆 **Tournament**: ${tournament.name}
👤 **Player**: ${userIdentity.displayName}
💰 **Entry Fee**: ${tournament.entryFee} ETH
👥 **Participants**: ${tournament.participants.length}/${tournament.maxParticipants}
🎁 **Prize Pool**: ${tournament.prizePool} ETH
📅 **Starts**: ${new Date(tournament.startTime * 1000).toLocaleString()}

🎮 **Game Type**: ${tournament.gameType.toUpperCase()}
📋 **Rules**: ${tournament.rules}

💡 **Next Steps**:
📊 **Check Status**: \`/tournament info ${tournamentId}\`
🏅 **Leaderboard**: \`/tournament leaderboard ${tournamentId}\`
🎲 **Start Playing**: \`/play ${tournament.gameType} ${tournament.entryFee}\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to join tournament', { error, command });
        const errorMessage = '❌ Failed to join tournament. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Tournament leaderboard command
   */
  tournamentLeaderboard: CommandHandler = {
    name: 'tournament-leaderboard',
    description: 'Show tournament leaderboard',
    usage: '/tournament leaderboard <tournament-id>',
    handler: async (command: Command): Promise<string> => {
      try {
        const validation = validateCommand(command, 1);
        if (!validation.valid) {
          return `❌ ${validation.error}\nUsage: ${this.tournamentLeaderboard.usage}`;
        }

        const tournamentId = command.args[0];
        const tournament = this.tournamentService.getTournament(tournamentId);

        if (!tournament) {
          const errorMessage = '❌ Tournament not found';
          await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
          return errorMessage;
        }

        const leaderboard = this.tournamentService.getTournamentLeaderboard(tournamentId);

        let response = `🏆 **${tournament.name} - Leaderboard**

🎮 **Game**: ${tournament.gameType.toUpperCase()}
💰 **Prize Pool**: ${tournament.prizePool} ETH
🔥 **Status**: ${tournament.status.toUpperCase()}
👥 **Participants**: ${tournament.participants.length}

📊 **Rankings**:`;

        if (leaderboard.length === 0) {
          response += '\n\n🎯 No scores yet! Be the first to play!';
        } else {
          for (let i = 0; i < Math.min(leaderboard.length, 10); i++) {
            const player = leaderboard[i];
            const userIdentity = await this.basenamesService.getUserIdentity(player.address);
            const medal = this.getRankMedal(player.rank);
            const prize = parseFloat(player.prize) > 0 ? ` (${player.prize} ETH)` : '';
            
            response += `\n${medal} **${player.rank}.** ${userIdentity.displayName}`;
            response += `\n   📊 Score: ${player.score} | 🏆 Prize: ${player.prize} ETH\n`;
          }
        }

        // Show current player's rank if they're participating
        const playerRank = leaderboard.find(p => p.address === command.sender);
        if (playerRank) {
          response += `\n📍 **Your Rank**: #${playerRank.rank}`;
          response += `\n📊 **Your Score**: ${playerRank.score}`;
          response += `\n🏆 **Your Prize**: ${playerRank.prize} ETH`;
        }

        response += `\n\n💡 **Actions**:
🎲 **Play**: \`/play ${tournament.gameType} ${tournament.entryFee}\`
📊 **Info**: \`/tournament info ${tournamentId}\`
🏆 **Tournaments**: \`/tournament list\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to get tournament leaderboard', { error, command });
        const errorMessage = '❌ Failed to get leaderboard. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * List tournaments command
   */
  listTournaments: CommandHandler = {
    name: 'tournament-list',
    description: 'List active tournaments',
    usage: '/tournament list',
    handler: async (command: Command): Promise<string> => {
      try {
        const tournaments = this.tournamentService.getActiveTournaments();

        let response = `🏆 **Active Tournaments**\n`;

        if (tournaments.length === 0) {
          response += `\n🎯 No active tournaments right now!

💡 **Create one**: \`/tournament create "My Tournament" dice 0.01 10 24\`
📋 **Help**: \`/help tournament\``;
        } else {
          for (const tournament of tournaments.slice(0, 5)) {
            const statusEmoji = tournament.status === 'upcoming' ? '⏳' : '🔥';
            const timeInfo = tournament.status === 'upcoming' 
              ? `Starts: ${new Date(tournament.startTime * 1000).toLocaleString()}`
              : `Ends: ${new Date(tournament.endTime * 1000).toLocaleString()}`;

            response += `\n${statusEmoji} **${tournament.name}**`;
            response += `\n🎮 ${tournament.gameType.toUpperCase()} | 💰 ${tournament.entryFee} ETH | 👥 ${tournament.participants.length}/${tournament.maxParticipants}`;
            response += `\n📅 ${timeInfo}`;
            response += `\n🎁 Prize Pool: ${tournament.prizePool} ETH`;
            response += `\n💡 Join: \`/tournament join ${tournament.id}\`\n`;
          }
        }

        response += `\n🎯 **Quick Actions**:
🏆 **Create**: \`/tournament create <name> <type> <fee> <max> <hours>\`
📊 **My Tournaments**: \`/tournament mine\`
🎮 **Play Games**: \`/play dice 0.01\``;

        await this.xmtpService.sendResponse(command.conversationId, response, true);
        return response;
      } catch (error) {
        logger.error('Failed to list tournaments', { error, command });
        const errorMessage = '❌ Failed to list tournaments. Please try again.';
        await this.xmtpService.sendResponse(command.conversationId, errorMessage, false);
        return errorMessage;
      }
    }
  };

  /**
   * Get rank medal emoji
   */
  private getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return '🎖️';
  }

  /**
   * Get all tournament handlers
   */
  getAllHandlers(): CommandHandler[] {
    return [
      this.createTournament,
      this.joinTournament,
      this.tournamentLeaderboard,
      this.listTournaments
    ];
  }
}

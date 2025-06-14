import { ethers } from 'ethers';
import logger from '../utils/logger';

export interface Tournament {
  id: string;
  name: string;
  gameType: 'dice' | 'coinflip' | 'mixed';
  entryFee: string;
  maxParticipants: number;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'ended';
  participants: string[];
  scores: Map<string, number>;
  prizePool: string;
  winner?: string;
  createdBy: string;
  rules: string;
}

export interface TournamentResult {
  tournamentId: string;
  playerAddress: string;
  score: number;
  rank: number;
  prize: string;
}

/**
 * Tournament management service
 */
export class TournamentService {
  private tournaments: Map<string, Tournament> = new Map();
  private playerTournaments: Map<string, string[]> = new Map();
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(provider: ethers.JsonRpcProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
    
    // Start tournament status checker
    this.startTournamentChecker();
  }

  /**
   * Create a new tournament
   */
  async createTournament(params: {
    name: string;
    gameType: 'dice' | 'coinflip' | 'mixed';
    entryFee: string;
    maxParticipants: number;
    durationHours: number;
    createdBy: string;
    rules?: string;
  }): Promise<Tournament> {
    try {
      const { name, gameType, entryFee, maxParticipants, durationHours, createdBy, rules } = params;
      
      const tournamentId = this.generateTournamentId(name);
      const startTime = Math.floor(Date.now() / 1000) + 300; // Start in 5 minutes
      const endTime = startTime + (durationHours * 3600);
      
      const tournament: Tournament = {
        id: tournamentId,
        name,
        gameType,
        entryFee,
        maxParticipants,
        startTime,
        endTime,
        status: 'upcoming',
        participants: [],
        scores: new Map(),
        prizePool: '0',
        createdBy,
        rules: rules || this.getDefaultRules(gameType)
      };

      this.tournaments.set(tournamentId, tournament);
      
      logger.info('Tournament created', {
        tournamentId,
        name,
        gameType,
        entryFee,
        maxParticipants,
        startTime,
        endTime
      });

      return tournament;
    } catch (error) {
      logger.error('Failed to create tournament', { error, params });
      throw error;
    }
  }

  /**
   * Join a tournament
   */
  async joinTournament(tournamentId: string, playerAddress: string): Promise<{
    success: boolean;
    message: string;
    tournament?: Tournament;
  }> {
    try {
      const tournament = this.tournaments.get(tournamentId);
      
      if (!tournament) {
        return { success: false, message: 'Tournament not found' };
      }

      if (tournament.status !== 'upcoming') {
        return { success: false, message: 'Tournament is not accepting new participants' };
      }

      if (tournament.participants.includes(playerAddress)) {
        return { success: false, message: 'Already joined this tournament' };
      }

      if (tournament.participants.length >= tournament.maxParticipants) {
        return { success: false, message: 'Tournament is full' };
      }

      // Add player to tournament
      tournament.participants.push(playerAddress);
      tournament.scores.set(playerAddress, 0);
      
      // Update prize pool
      const currentPrize = parseFloat(tournament.prizePool);
      const entryFee = parseFloat(tournament.entryFee);
      tournament.prizePool = (currentPrize + entryFee).toString();

      // Track player tournaments
      const playerTournaments = this.playerTournaments.get(playerAddress) || [];
      playerTournaments.push(tournamentId);
      this.playerTournaments.set(playerAddress, playerTournaments);

      logger.info('Player joined tournament', {
        tournamentId,
        playerAddress,
        participantCount: tournament.participants.length,
        prizePool: tournament.prizePool
      });

      return {
        success: true,
        message: `Successfully joined ${tournament.name}!`,
        tournament
      };
    } catch (error) {
      logger.error('Failed to join tournament', { error, tournamentId, playerAddress });
      return { success: false, message: 'Failed to join tournament' };
    }
  }

  /**
   * Record game result for tournament
   */
  async recordTournamentGame(
    tournamentId: string,
    playerAddress: string,
    gameResult: {
      gameType: string;
      isWin: boolean;
      betAmount: string;
      payout?: string;
    }
  ): Promise<boolean> {
    try {
      const tournament = this.tournaments.get(tournamentId);
      
      if (!tournament || tournament.status !== 'active') {
        return false;
      }

      if (!tournament.participants.includes(playerAddress)) {
        return false;
      }

      // Calculate score based on game result
      const score = this.calculateTournamentScore(gameResult);
      const currentScore = tournament.scores.get(playerAddress) || 0;
      tournament.scores.set(playerAddress, currentScore + score);

      logger.info('Tournament game recorded', {
        tournamentId,
        playerAddress,
        gameResult,
        scoreAdded: score,
        newTotal: currentScore + score
      });

      return true;
    } catch (error) {
      logger.error('Failed to record tournament game', { error, tournamentId, playerAddress });
      return false;
    }
  }

  /**
   * Get tournament leaderboard
   */
  getTournamentLeaderboard(tournamentId: string): Array<{
    rank: number;
    address: string;
    score: number;
    prize: string;
  }> {
    const tournament = this.tournaments.get(tournamentId);
    
    if (!tournament) {
      return [];
    }

    // Sort players by score
    const sortedPlayers = Array.from(tournament.scores.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([address, score], index) => ({
        rank: index + 1,
        address,
        score,
        prize: this.calculatePrize(tournament, index + 1)
      }));

    return sortedPlayers;
  }

  /**
   * Get active tournaments
   */
  getActiveTournaments(): Tournament[] {
    return Array.from(this.tournaments.values())
      .filter(t => t.status === 'active' || t.status === 'upcoming')
      .sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Get player's tournaments
   */
  getPlayerTournaments(playerAddress: string): Tournament[] {
    const tournamentIds = this.playerTournaments.get(playerAddress) || [];
    return tournamentIds
      .map(id => this.tournaments.get(id))
      .filter(t => t !== undefined) as Tournament[];
  }

  /**
   * Get tournament by ID
   */
  getTournament(tournamentId: string): Tournament | undefined {
    return this.tournaments.get(tournamentId);
  }

  /**
   * End tournament and distribute prizes
   */
  private async endTournament(tournament: Tournament): Promise<void> {
    try {
      tournament.status = 'ended';
      
      const leaderboard = this.getTournamentLeaderboard(tournament.id);
      
      if (leaderboard.length > 0) {
        tournament.winner = leaderboard[0].address;
        
        // In a real implementation, you would distribute prizes here
        logger.info('Tournament ended', {
          tournamentId: tournament.id,
          winner: tournament.winner,
          participantCount: tournament.participants.length,
          prizePool: tournament.prizePool
        });
      }
    } catch (error) {
      logger.error('Failed to end tournament', { error, tournamentId: tournament.id });
    }
  }

  /**
   * Start tournament status checker
   */
  private startTournamentChecker(): void {
    setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      
      for (const tournament of this.tournaments.values()) {
        if (tournament.status === 'upcoming' && now >= tournament.startTime) {
          tournament.status = 'active';
          logger.info('Tournament started', { tournamentId: tournament.id });
        } else if (tournament.status === 'active' && now >= tournament.endTime) {
          this.endTournament(tournament);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Generate tournament ID
   */
  private generateTournamentId(name: string): string {
    const timestamp = Date.now();
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${nameSlug}-${timestamp}`;
  }

  /**
   * Calculate tournament score
   */
  private calculateTournamentScore(gameResult: {
    gameType: string;
    isWin: boolean;
    betAmount: string;
    payout?: string;
  }): number {
    const { isWin, betAmount, payout } = gameResult;
    
    if (!isWin) {
      return 0;
    }

    const bet = parseFloat(betAmount);
    const winAmount = payout ? parseFloat(payout) : bet * 2;
    
    // Score = win amount * 100 (to avoid decimals)
    return Math.floor(winAmount * 100);
  }

  /**
   * Calculate prize distribution
   */
  private calculatePrize(tournament: Tournament, rank: number): string {
    const totalPrize = parseFloat(tournament.prizePool);
    const participantCount = tournament.participants.length;
    
    if (participantCount === 0) return '0';
    
    // Prize distribution: 50% to 1st, 30% to 2nd, 20% to 3rd
    if (rank === 1) {
      return (totalPrize * 0.5).toFixed(4);
    } else if (rank === 2 && participantCount >= 2) {
      return (totalPrize * 0.3).toFixed(4);
    } else if (rank === 3 && participantCount >= 3) {
      return (totalPrize * 0.2).toFixed(4);
    }
    
    return '0';
  }

  /**
   * Get default rules for game type
   */
  private getDefaultRules(gameType: string): string {
    const rules: Record<string, string> = {
      'dice': 'Roll dice and earn points for wins. Higher rolls = more points!',
      'coinflip': 'Call heads or tails. Correct calls earn points!',
      'mixed': 'Play any game type. All wins count towards your score!'
    };
    
    return rules[gameType] || 'Standard tournament rules apply.';
  }
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Users, Clock, Coins, Target, Crown, 
  Plus, Calendar, Award, TrendingUp, Zap,
  Medal, Star, Gamepad2, Timer, DollarSign
} from 'lucide-react';
import { useSimpleWallet } from '../components/SimpleWalletConnect';

interface Tournament {
  id: string;
  name: string;
  gameType: 'dice' | 'coinflip' | 'mixed';
  entryFee: string;
  prizePool: string;
  participants: number;
  maxParticipants: number;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'ended';
  winner?: string;
  createdBy: string;
}

interface TournamentPlayer {
  rank: number;
  address: string;
  displayName: string;
  score: number;
  prize: string;
}

export const TournamentPage: React.FC = () => {
  const { isConnected, address } = useSimpleWallet();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentPlayer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'ended'>('active');

  // Mock data for demonstration
  useEffect(() => {
    const mockTournaments: Tournament[] = [
      {
        id: 'daily-dice-1',
        name: 'Daily Dice Championship',
        gameType: 'dice',
        entryFee: '0.01',
        prizePool: '0.24',
        participants: 24,
        maxParticipants: 50,
        startTime: Date.now() - 3600000,
        endTime: Date.now() + 18000000,
        status: 'active',
        createdBy: '0x123...'
      },
      {
        id: 'weekend-warrior',
        name: 'Weekend Warrior Tournament',
        gameType: 'mixed',
        entryFee: '0.05',
        prizePool: '0.85',
        participants: 17,
        maxParticipants: 30,
        startTime: Date.now() + 7200000,
        endTime: Date.now() + 86400000,
        status: 'upcoming',
        createdBy: '0x456...'
      },
      {
        id: 'coinflip-madness',
        name: 'Coinflip Madness',
        gameType: 'coinflip',
        entryFee: '0.02',
        prizePool: '0.64',
        participants: 32,
        maxParticipants: 32,
        startTime: Date.now() - 86400000,
        endTime: Date.now() - 3600000,
        status: 'ended',
        winner: '0x789...',
        createdBy: '0x789...'
      }
    ];

    const mockLeaderboard: TournamentPlayer[] = [
      { rank: 1, address: '0x123...', displayName: 'CryptoGamer', score: 2450, prize: '0.12' },
      { rank: 2, address: '0x456...', displayName: 'DiceKing', score: 2380, prize: '0.072' },
      { rank: 3, address: '0x789...', displayName: 'LuckyPlayer', score: 2290, prize: '0.048' },
      { rank: 4, address: '0xabc...', displayName: 'GameMaster', score: 2150, prize: '0' },
      { rank: 5, address: '0xdef...', displayName: 'SquadLeader', score: 2080, prize: '0' }
    ];

    setTournaments(mockTournaments);
    setLeaderboard(mockLeaderboard);
  }, []);

  const filteredTournaments = tournaments.filter(t => t.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'from-green-500 to-emerald-500';
      case 'upcoming': return 'from-blue-500 to-cyan-500';
      case 'ended': return 'from-gray-500 to-slate-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'dice': return '🎲';
      case 'coinflip': return '🪙';
      case 'mixed': return '🎮';
      default: return '🎯';
    }
  };

  const formatTimeRemaining = (endTime: number) => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="pt-20 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center"
          >
            <Trophy className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-rainbow">
            Tournaments
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Compete in organized tournaments, climb the leaderboards, and win ETH prizes!
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gradient-rainbow px-6 py-3 flex items-center space-x-2 group"
          disabled={!isConnected}
        >
          <Plus className="w-5 h-5" />
          <span>Create Tournament</span>
          <Crown className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="flex bg-gray-800/50 rounded-lg p-1">
          {(['active', 'upcoming', 'ended'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tournaments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="card-gradient group cursor-pointer relative overflow-hidden"
              onClick={() => setSelectedTournament(tournament)}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(tournament.status)} text-white text-sm font-semibold`}>
                {tournament.status}
              </div>

              {/* Game Type Icon */}
              <div className="text-4xl mb-4">{getGameTypeIcon(tournament.gameType)}</div>

              <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
              <p className="text-gray-400 mb-4 capitalize">{tournament.gameType} Tournament</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Entry Fee</span>
                  </span>
                  <span className="text-white font-semibold">{tournament.entryFee} ETH</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>Prize Pool</span>
                  </span>
                  <span className="text-green-400 font-semibold">{tournament.prizePool} ETH</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Players</span>
                  </span>
                  <span className="text-white font-semibold">
                    {tournament.participants}/{tournament.maxParticipants}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Time</span>
                  </span>
                  <span className="text-white font-semibold">
                    {formatTimeRemaining(tournament.endTime)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Participants</span>
                  <span>{Math.round((tournament.participants / tournament.maxParticipants) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tournament Details Modal */}
      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTournament(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-gradient max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTournament.name}</h2>
                    <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(selectedTournament.status)} text-white text-sm font-semibold`}>
                      {selectedTournament.status}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTournament(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Tournament Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Game Type</span>
                      <span className="text-white capitalize">{selectedTournament.gameType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry Fee</span>
                      <span className="text-white">{selectedTournament.entryFee} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prize Pool</span>
                      <span className="text-green-400">{selectedTournament.prizePool} ETH</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants</span>
                      <span className="text-white">{selectedTournament.participants}/{selectedTournament.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Remaining</span>
                      <span className="text-white">{formatTimeRemaining(selectedTournament.endTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created By</span>
                      <span className="text-white">{selectedTournament.createdBy}</span>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Leaderboard</span>
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((player) => (
                      <div key={player.rank} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getRankMedal(player.rank)}</span>
                          <div>
                            <div className="text-white font-semibold">{player.displayName}</div>
                            <div className="text-gray-400 text-sm">{player.address}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{player.score} pts</div>
                          {parseFloat(player.prize) > 0 && (
                            <div className="text-green-400 text-sm">{player.prize} ETH</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {selectedTournament.status === 'upcoming' && (
                    <button className="btn-gradient-rainbow flex-1 py-3 flex items-center justify-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Join Tournament</span>
                    </button>
                  )}
                  {selectedTournament.status === 'active' && (
                    <button className="btn-gradient-secondary flex-1 py-3 flex items-center justify-center space-x-2">
                      <Gamepad2 className="w-5 h-5" />
                      <span>Play Games</span>
                    </button>
                  )}
                  <button className="btn-outline flex-1 py-3 flex items-center justify-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>View Full Leaderboard</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

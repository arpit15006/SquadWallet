import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimpleWallet } from '../components/SimpleWalletConnect';
import {
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Coins, Play, Users, Trophy,
  Zap, Target, Crown, Sparkles, Rocket, Timer, DollarSign, Gamepad2
} from 'lucide-react';
import { useCreateGame, useContractsDeployed } from '../hooks/useContracts';

export const GamePage: React.FC = () => {
  const { address, isConnected } = useSimpleWallet();
  const [activeGame, setActiveGame] = useState<'dice' | 'coin'>('dice');
  const [gameMode, setGameMode] = useState<'instant' | 'multiplayer'>('instant');
  const [wagerAmount, setWagerAmount] = useState('0.01');
  const [coinChoice, setCoinChoice] = useState<'heads' | 'tails'>('heads');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<{
    type: 'dice' | 'coin';
    result: number | string;
    won: boolean;
    amount: string;
    xpEarned: number;
  } | null>(null);
  // Contract hooks
  const { isDeployed } = useContractsDeployed();
  const createGame = useCreateGame();

  // Handle instant game play
  const handleInstantGame = async () => {
    if (!wagerAmount || parseFloat(wagerAmount) < 0.001) {
      alert('Minimum wager is 0.001 ETH');
      return;
    }

    setIsPlaying(true);
    try {
      // Simulate instant game result
      setTimeout(() => {
        let result: number | string;
        let won: boolean;

        if (activeGame === 'dice') {
          const playerRoll = Math.floor(Math.random() * 6) + 1;
          const houseRoll = Math.floor(Math.random() * 6) + 1;
          result = `You: ${playerRoll} vs House: ${houseRoll}`;
          won = playerRoll > houseRoll;
        } else {
          const coinResult = Math.random() > 0.5 ? 'heads' : 'tails';
          result = coinResult.charAt(0).toUpperCase() + coinResult.slice(1);
          won = coinResult === coinChoice;
        }

        const xpEarned = won ? Math.floor(parseFloat(wagerAmount) * 100) + 15 : 5;

        setGameResult({
          type: activeGame,
          result,
          won,
          amount: wagerAmount,
          xpEarned
        });
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      console.error('Game failed:', error);
      setIsPlaying(false);
    }
  };

  // Handle multiplayer game creation
  const handleCreateGame = async () => {
    if (!wagerAmount || parseFloat(wagerAmount) < 0.001) {
      alert('Minimum wager is 0.001 ETH');
      return;
    }

    setIsPlaying(true);
    try {
      if (activeGame === 'dice') {
        createGame.createDiceGame(wagerAmount);
      } else {
        createGame.createCoinFlipGame(wagerAmount);
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Game creation failed:', error);
      setIsPlaying(false);
    }
  };

  // Mock data
  const activeGames = [
    {
      id: 123, type: 'dice', creator: '0x1234...5678', wager: '0.01 ETH',
      players: 2, maxPlayers: 6, timeLeft: '5m 23s'
    },
    {
      id: 124, type: 'coin', creator: '0x2345...6789', wager: '0.05 ETH',
      players: 1, maxPlayers: 2, timeLeft: '12m 45s'
    },
    {
      id: 125, type: 'dice', creator: '0x3456...7890', wager: '0.02 ETH',
      players: 4, maxPlayers: 6, timeLeft: '2m 10s'
    }
  ];



  const DiceIcon = ({ number }: { number: number }) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[number - 1] || Dice1;
    return <Icon className="w-8 h-8" />;
  };

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Gamepad2 className="w-16 h-16 text-white" />
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold gradient-text-rainbow font-['Space_Grotesk']">Connect Your Wallet</h2>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
              Please connect your wallet to start playing provably fair games.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 space-y-12 max-w-7xl mx-auto px-4">
      {/* Hero Header */}
      <motion.section 
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-4">
          <motion.div
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass border border-purple-500/30 mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-purple-300 font-semibold">Provably Fair Gaming</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black gradient-text-rainbow font-['Space_Grotesk']">
            Mini Games
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Play provably fair games with your squad. All games use{' '}
            <span className="gradient-text-purple font-semibold">Chainlink VRF</span> for
            transparent randomness and automatic payouts.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Win Rate', value: '68%', icon: Trophy, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Games Played', value: '47', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Total Won', value: '2.3 ETH', icon: DollarSign, gradient: 'from-yellow-500 to-orange-500' },
            { label: 'Rank', value: '#156', icon: Crown, gradient: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="card-gradient text-center group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Game Mode Selection */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="space-y-8"
      >
        {/* Game Type Selection */}
        <div className="flex justify-center space-x-4">
          {[
            { type: 'dice', icon: Dice1, label: 'Dice Roll', gradient: 'from-blue-500 to-cyan-500' },
            { type: 'coin', icon: Coins, label: 'Coin Flip', gradient: 'from-yellow-500 to-orange-500' }
          ].map((game) => {
            const Icon = game.icon;
            return (
              <motion.button
                key={game.type}
                onClick={() => setActiveGame(game.type as 'dice' | 'coin')}
                className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeGame === game.type
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeGame === game.type && (
                  <motion.div
                    layoutId="activeGameTab"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${game.gradient}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-6 h-6 relative z-10" />
                <span className="relative z-10 text-lg">{game.label}</span>
                {activeGame === game.type && (
                  <Sparkles className="w-4 h-4 text-white relative z-10 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Game Mode Selection */}
        <div className="flex justify-center">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {[
              { mode: 'instant', label: 'Instant Play', icon: Zap, description: 'Play immediately with instant results' },
              { mode: 'multiplayer', label: 'Multiplayer', icon: Users, description: 'Create games for others to join' }
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <motion.button
                  key={mode.mode}
                  onClick={() => setGameMode(mode.mode as 'instant' | 'multiplayer')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                    gameMode === mode.mode
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{mode.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Main Game Interface */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Game Panel */}
        <motion.div
          className="card-gradient space-y-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                gameMode === 'instant'
                  ? 'from-green-500 to-emerald-500'
                  : 'from-purple-500 to-blue-500'
              } flex items-center justify-center`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {gameMode === 'instant' ? (
                <Zap className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white" />
              )}
            </motion.div>
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {gameMode === 'instant' ? 'Instant' : 'Create'} {activeGame === 'dice' ? 'Dice' : 'Coin Flip'} Game
            </h2>
          </div>

          {/* Game Preview */}
          <div className="glass-dark rounded-2xl p-8 text-center border border-purple-500/20">
            {activeGame === 'dice' ? (
              <div className="space-y-6">
                <motion.div 
                  className="flex justify-center space-x-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {[1, 2, 3, 4, 5, 6].map((num, index) => (
                    <motion.div
                      key={num}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <DiceIcon number={num} />
                    </motion.div>
                  ))}
                </motion.div>
                <div className="text-white space-y-2">
                  <div className="text-xl font-bold gradient-text-rainbow">Dice Roll Game</div>
                  <div className="text-gray-300">Up to 6 players • Highest roll wins</div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <motion.div
                  animate={{ rotateY: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Coins className="w-20 h-20 text-yellow-400 mx-auto" />
                </motion.div>
                <div className="text-white space-y-2">
                  <div className="text-xl font-bold gradient-text-pink">Coin Flip Game</div>
                  <div className="text-gray-300">2 players • 50/50 chance</div>
                </div>
              </div>
            )}
          </div>

          {/* Game Settings */}
          <div className="space-y-4">
            {/* Wager Amount */}
            <div className="space-y-3">
              <label className="block text-gray-300 text-sm font-semibold">
                Wager Amount (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(e.target.value)}
                  min="0.001"
                  step="0.001"
                  className="glass w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="0.01"
                />
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="text-gray-400 text-sm">
                Minimum: 0.001 ETH • Maximum: 10 ETH
              </div>
            </div>

            {/* Coin Choice (only for coin flip games) */}
            {activeGame === 'coin' && gameMode === 'instant' && (
              <div className="space-y-3">
                <label className="block text-gray-300 text-sm font-semibold">
                  Your Choice
                </label>
                <div className="flex space-x-3">
                  {(['heads', 'tails'] as const).map((choice) => (
                    <motion.button
                      key={choice}
                      onClick={() => setCoinChoice(choice)}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        coinChoice === choice
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          : 'glass border border-gray-600 text-gray-300 hover:text-white hover:border-yellow-500/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {choice === 'heads' ? '👑' : '🏛️'} {choice.charAt(0).toUpperCase() + choice.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Play Button */}
          <motion.button
            onClick={gameMode === 'instant' ? handleInstantGame : handleCreateGame}
            disabled={isPlaying || (gameMode === 'multiplayer' && createGame.isPending) || !isDeployed}
            className={`w-full py-4 text-lg font-semibold flex items-center justify-center space-x-3 disabled:opacity-50 ${
              gameMode === 'instant'
                ? 'btn-gradient-rainbow'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            >
              {gameMode === 'instant' ? (
                <Zap className="w-6 h-6" />
              ) : (
                <Rocket className="w-6 h-6" />
              )}
            </motion.div>
            <span>
              {isPlaying
                ? gameMode === 'instant' ? 'Playing...' : 'Creating Game...'
                : gameMode === 'instant'
                  ? `Play Now (${wagerAmount} ETH)`
                  : `Create Game (${wagerAmount} ETH)`
              }
            </span>
            {!isPlaying && <Sparkles className="w-5 h-5" />}
          </motion.button>

          {/* Game Result */}
          <AnimatePresence>
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className={`p-6 rounded-2xl border-2 ${
                  gameResult.won
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                    className={`text-4xl font-bold ${
                      gameResult.won ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {gameResult.won ? '🎉 You Won!' : '😔 You Lost'}
                  </motion.div>
                  <div className="text-white text-xl">
                    Result: <span className="font-bold">{gameResult.result}</span>
                  </div>
                  <div className={`text-lg font-semibold ${
                    gameResult.won ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {gameResult.won
                      ? `Won ${(parseFloat(gameResult.amount) * 1.8).toFixed(4)} ETH`
                      : `Lost ${gameResult.amount} ETH`
                    }
                  </div>
                  <div className="text-purple-300 text-lg font-semibold">
                    +{gameResult.xpEarned} XP Earned! ⭐
                  </div>
                  <motion.button
                    onClick={() => setGameResult(null)}
                    className="btn-outline-gradient px-6 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Again
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active Games Panel */}
        <motion.div
          className="card-gradient space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Active Games</h2>
          </div>
          
          <div className="space-y-4">
            {activeGames.map((game, index) => (
              <motion.div
                key={game.id}
                className="glass-dark rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {game.type === 'dice' ? (
                      <Dice1 className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Coins className="w-6 h-6 text-yellow-400" />
                    )}
                    <span className="text-white font-semibold text-lg">
                      Game #{game.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">{game.timeLeft}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">Wager</div>
                    <div className="text-white font-bold text-lg">{game.wager}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">Players</div>
                    <div className="text-white font-bold text-lg">
                      {game.players}/{game.maxPlayers}
                    </div>
                  </div>
                </div>

                <motion.button 
                  className="btn-outline-gradient w-full py-3 text-sm font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Game
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

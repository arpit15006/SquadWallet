import React, { useState } from 'react';

// Mock OnchainKit service for testing (since we can't import the agent service directly)
class MockOnchainKitService {
  private getLevelBadge(level: number): string {
    if (level >= 50) return '👑';
    if (level >= 40) return '💎';
    if (level >= 30) return '🏆';
    if (level >= 20) return '🥇';
    if (level >= 10) return '🥈';
    if (level >= 5) return '🥉';
    return '🎮';
  }

  private getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return '🎖️';
  }

  generateLeaderboardFrame(leaderboardData: {
    players: Array<{
      address: string;
      basename?: string;
      level: number;
      xp: number;
      gamesWon: number;
      rank: number;
    }>;
    currentPlayer?: {
      rank: number;
      level: number;
      xp: number;
    };
  }): string {
    const { players, currentPlayer } = leaderboardData;
    
    let frame = `🏆 **SQUAD LEADERBOARD**

👑 **Top Players**:`;

    players.slice(0, 10).forEach(player => {
      const name = player.basename || `${player.address.slice(0, 6)}...${player.address.slice(-4)}`;
      const medal = this.getRankMedal(player.rank);
      frame += `\n${medal} **${player.rank}.** ${name}`;
      frame += `\n   🏆 Level ${player.level} | ⭐ ${player.xp.toLocaleString()} XP | 🎮 ${player.gamesWon} wins\n`;
    });

    if (currentPlayer) {
      frame += `\n📍 **Your Rank**: #${currentPlayer.rank}`;
      frame += `\n🏆 **Your Level**: ${currentPlayer.level} ${this.getLevelBadge(currentPlayer.level)}`;
      frame += `\n⭐ **Your XP**: ${currentPlayer.xp.toLocaleString()}`;
    }

    frame += `\n\n🎯 **Climb the Ranks**:
🎮 **Play Games**: \`/play dice 0.01\`
🏅 **Check XP**: \`/xp\`
🎖️ **Mint Badge**: \`/mintbadge\``;

    return frame;
  }

  generateGameResultFrame(gameData: {
    gameType: string;
    result: number | string;
    isWin: boolean;
    betAmount: string;
    payout?: string;
    xpEarned: number;
    newLevel: number;
    playerAddress: string;
    txHash?: string;
    timestamp?: number;
  }): string {
    const { gameType, result, isWin, betAmount, payout, xpEarned, newLevel, txHash, timestamp } = gameData;
    
    const frame = `🎮 **${gameType.toUpperCase()} GAME RESULT**

🎲 **Result**: ${result}
${isWin ? '🎉 **YOU WON!** 🎉' : '😔 **You Lost** 😔'}
💰 **Bet**: ${betAmount} ETH
${payout ? `💵 **Payout**: ${payout} ETH` : ''}
⭐ **XP Earned**: +${xpEarned}
🏆 **New Level**: ${newLevel} ${this.getLevelBadge(newLevel)}
${txHash ? `🔗 **Transaction**: \`${txHash.slice(0, 10)}...\`` : ''}
${timestamp ? `⏰ **Time**: ${new Date(timestamp).toLocaleTimeString()}` : ''}

🎯 **Quick Actions**:
🎮 **Play Again**: \`/play ${gameType} ${betAmount}\`
📊 **Check Stats**: \`/stats\`
🏅 **Leaderboard**: \`/leaderboard\`
🎖️ **Mint Badge**: \`/mintbadge\`

💡 **Tip**: ${this.getRandomGameTip()}`;

    return frame;
  }

  generateWalletFrame(walletData: {
    address: string;
    balance: string;
    basename?: string;
    isConnected: boolean;
    chainId: number;
  }): string {
    const { address, balance, basename, isConnected, chainId } = walletData;
    
    return `🏦 **WALLET STATUS**

${isConnected ? '🟢 **Connected**' : '🔴 **Disconnected**'}
👤 **Identity**: ${basename || `${address.slice(0, 6)}...${address.slice(-4)}`}
📍 **Address**: \`${address}\`
💰 **Balance**: ${balance} ETH
🌐 **Network**: ${this.getNetworkName(chainId)}

🔧 **Wallet Actions**:
💸 **Send ETH**: \`/send <address> <amount>\`
🔄 **Swap Tokens**: \`/swap <from> <to> <amount>\`
📊 **Portfolio**: \`/portfolio\`
🎮 **Play Games**: \`/play dice 0.01\``;
  }

  private getRandomGameTip(): string {
    const tips = [
      "Start with small bets to learn the games!",
      "Check the leaderboard to see top players!",
      "Mint NFT badges to show off your achievements!",
      "Join tournaments for bigger prizes!",
      "Invite friends to earn bonus XP!",
      "Use /stats to track your progress!",
      "Set price alerts with /price alerts!",
      "Try different games to maximize XP!"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      8453: 'Base Mainnet',
      84532: 'Base Sepolia',
      137: 'Polygon',
      10: 'Optimism'
    };
    return networks[chainId] || `Chain ${chainId}`;
  }
}

export const OnchainKitServiceTest: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState<string>('leaderboard');
  const [frameOutput, setFrameOutput] = useState<string>('');
  
  const onchainKitService = new MockOnchainKitService();

  // Mock data for testing
  const mockLeaderboardData = {
    players: [
      {
        address: '0x97f14d6031b64f9e82153a69458b5b9af8248ee6',
        basename: 'cryptarpit.base',
        level: 45,
        xp: 125000,
        gamesWon: 89,
        rank: 1
      },
      {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        basename: 'squadmaster.base',
        level: 42,
        xp: 118500,
        gamesWon: 76,
        rank: 2
      },
      {
        address: '0x1Be31A94361a391bBaFB2a4CCd704F57dc04d4bb',
        level: 38,
        xp: 95000,
        gamesWon: 65,
        rank: 3
      },
      {
        address: '0x937C0d4a6294cdfa575de17382c7076b579DC176',
        basename: 'gamer.base',
        level: 35,
        xp: 87500,
        gamesWon: 58,
        rank: 4
      },
      {
        address: '0x456789abcdef0123456789abcdef0123456789ab',
        level: 32,
        xp: 78000,
        gamesWon: 52,
        rank: 5
      }
    ],
    currentPlayer: {
      rank: 15,
      level: 28,
      xp: 65000
    }
  };

  const mockGameData = {
    gameType: 'dice',
    result: 5,
    isWin: true,
    betAmount: '0.01',
    payout: '0.018',
    xpEarned: 50,
    newLevel: 29,
    playerAddress: '0x97f14d6031b64f9e82153a69458b5b9af8248ee6',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    timestamp: Date.now()
  };

  const mockWalletData = {
    address: '0x97f14d6031b64f9e82153a69458b5b9af8248ee6',
    balance: '0.1234',
    basename: 'cryptarpit.base',
    isConnected: true,
    chainId: 84532
  };

  const runTest = (testType: string) => {
    setSelectedTest(testType);
    
    let result = '';
    switch (testType) {
      case 'leaderboard':
        result = onchainKitService.generateLeaderboardFrame(mockLeaderboardData);
        break;
      case 'gameResult':
        result = onchainKitService.generateGameResultFrame(mockGameData);
        break;
      case 'wallet':
        result = onchainKitService.generateWalletFrame(mockWalletData);
        break;
      default:
        result = 'Unknown test type';
    }
    
    setFrameOutput(result);
  };

  const tests = [
    {
      id: 'leaderboard',
      name: 'Leaderboard Frame',
      description: 'Test the leaderboard frame generation with player rankings',
      color: '#f59e0b'
    },
    {
      id: 'gameResult',
      name: 'Game Result Frame',
      description: 'Test game result frame with win/loss display',
      color: '#10b981'
    },
    {
      id: 'wallet',
      name: 'Wallet Frame',
      description: 'Test wallet status frame generation',
      color: '#3b82f6'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2.5rem'
        }}>
          🎨 OnchainKit Service Frame Testing
        </h1>

        {/* Test Selection */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Select Frame Test</h2>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {tests.map((test) => (
              <button
                key={test.id}
                onClick={() => runTest(test.id)}
                style={{
                  background: selectedTest === test.id ? test.color : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: selectedTest === test.id ? `2px solid ${test.color}` : '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{test.name}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{test.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Frame Output */}
        {frameOutput && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Generated Frame Output</h2>
            
            <div style={{
              background: '#1f2937',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #374151'
            }}>
              <pre style={{
                color: '#f3f4f6',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace'
              }}>
                {frameOutput}
              </pre>
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigator.clipboard.writeText(frameOutput)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📋 Copy Frame
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([frameOutput], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedTest}-frame.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                💾 Download Frame
              </button>
            </div>
          </div>
        )}

        {/* Mock Data Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>Mock Test Data</h2>
          
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            <div>
              <h3 style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.5rem' }}>🏆 Leaderboard Data</h3>
              <div style={{ color: '#d1d5db', fontSize: '0.8rem', background: '#374151', padding: '0.75rem', borderRadius: '6px' }}>
                <div>• 5 mock players with rankings</div>
                <div>• Levels from 32 to 45</div>
                <div>• XP from 65K to 125K</div>
                <div>• Current player rank: #15</div>
              </div>
            </div>
            
            <div>
              <h3 style={{ color: '#10b981', fontSize: '1rem', marginBottom: '0.5rem' }}>🎮 Game Result Data</h3>
              <div style={{ color: '#d1d5db', fontSize: '0.8rem', background: '#374151', padding: '0.75rem', borderRadius: '6px' }}>
                <div>• Dice game with result: 5</div>
                <div>• Win condition: true</div>
                <div>• Bet: 0.01 ETH, Payout: 0.018 ETH</div>
                <div>• XP earned: +50, New level: 29</div>
              </div>
            </div>
            
            <div>
              <h3 style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '0.5rem' }}>🏦 Wallet Data</h3>
              <div style={{ color: '#d1d5db', fontSize: '0.8rem', background: '#374151', padding: '0.75rem', borderRadius: '6px' }}>
                <div>• Connected wallet</div>
                <div>• Balance: 0.1234 ETH</div>
                <div>• Basename: cryptarpit.base</div>
                <div>• Network: Base Sepolia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnchainKitServiceTest;

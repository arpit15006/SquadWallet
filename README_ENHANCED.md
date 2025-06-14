# 🎮 SquadWallet - AI-Powered Social Gaming Wallet

> **The ultimate Web3 social gaming experience in your chat**

An AI-powered group chat wallet with instant mini-games, XP progression, NFT badges, tournaments, and DeFi tools — all running seamlessly in XMTP conversations.

## 🔥 One-Liner

**Turn any XMTP chat into a gaming arcade with instant dice games, tournaments, XP rewards, and NFT achievements — no app downloads required!**

## 💡 Concept Summary

SquadWallet transforms messaging into an interactive Web3 gaming platform. Built on XMTP, Base, and powered by Coinbase AgentKit, it brings instant games, social competitions, and DeFi tools directly into group chats. Players earn XP, level up, mint NFT badges, and compete in tournaments — all through simple chat commands.

## 🚀 Key Features

### 🎲 **Instant Gaming**
- **Quick Dice Games** - `/dice 0.01` for immediate results
- **Coin Flip Games** - `/coinflip 0.005 heads` for 50/50 action
- **Multiplayer Games** - Create games others can join
- **Provably Fair** - Chainlink VRF for transparent randomness

### 🏆 **XP & Progression System**
- **Earn XP** - Win games to gain experience points
- **Level Up** - Progress through 50+ levels
- **NFT Badges** - Mint dynamic NFTs representing achievements
- **Rarity Tiers** - Common → Uncommon → Rare → Epic → Legendary

### 🏟️ **Tournament System**
- **Create Tournaments** - Organize competitions with prize pools
- **Join Competitions** - Compete against other players
- **Real Prizes** - Winners take ETH rewards
- **Leaderboards** - Track rankings and performance

### 👥 **Social Features**
- **Invite Friends** - Both get bonus XP for referrals
- **Challenge Players** - Head-to-head gaming competitions
- **Share Achievements** - Show off your NFT badges
- **Group Leaderboards** - Compete within your squad

### 💱 **DeFi Integration**
- **Token Swaps** - Trade tokens without leaving chat
- **Price Alerts** - Real-time cryptocurrency prices
- **Portfolio Tracking** - Monitor your holdings
- **Wallet Management** - Send/receive ETH seamlessly

### 🎨 **Rich UI Experience**
- **OnchainKit Frames** - Beautiful visual game results
- **Basenames Support** - ENS-style names on Base
- **Interactive Responses** - Rich formatting and emojis
- **Progress Tracking** - Visual XP and level indicators

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Messaging** | XMTP | Decentralized chat infrastructure |
| **Blockchain** | Base (Ethereum L2) | Fast, cheap transactions |
| **Wallet** | Coinbase AgentKit | Wallet operations & transactions |
| **UI Components** | OnchainKit | Rich frames and visual elements |
| **Identity** | Basenames | ENS-style naming on Base |
| **Randomness** | Chainlink VRF | Provably fair game outcomes |
| **Smart Contracts** | Solidity + Hardhat | Game logic and NFT management |

## 🎮 Game Mechanics

### **Dice Games**
- Roll against the house (1-6)
- Higher roll wins 1.8x payout
- Instant results with XP rewards
- Tournament scoring available

### **Coin Flip Games**
- Choose heads or tails
- 50/50 chance to win 1.9x payout
- Quick and exciting gameplay
- Perfect for challenges

### **XP System**
```
Win Game → Earn XP → Level Up → Mint Badge → Show Off
```

### **Badge Rarity System**
- 🥉 **Common** (Level 1-4): Basic achievements
- 🥈 **Uncommon** (Level 5-9): Regular players
- 🥇 **Rare** (Level 10-24): Skilled gamers
- 💎 **Epic** (Level 25-49): Expert players
- 👑 **Legendary** (Level 50+): Gaming legends

## 📱 Command Reference

### 🎮 **Gaming Commands**
```bash
/dice 0.01                    # Quick dice game
/coinflip 0.005 heads         # Coin flip game
/play dice 0.01               # Multiplayer dice
/join 123                     # Join game #123
/games                        # List active games
/stats                        # View gaming statistics
```

### 🏆 **XP & Badges**
```bash
/xp                          # Check XP and level
/leaderboard                 # View rankings
/mintbadge                   # Mint NFT badge
/share-badge 5               # Share badge #5
```

### 🏟️ **Tournaments**
```bash
/tournament create "Daily Dice" dice 0.01 20 24    # Create tournament
/tournament join daily-dice                        # Join tournament
/tournament list                                   # List tournaments
/tournament leaderboard daily-dice                 # View rankings
```

### 👥 **Social Features**
```bash
/invite 0x123...             # Invite friend (+100 XP each)
/challenge 0x123... dice 0.01 # Challenge to game
```

### 💰 **Wallet & DeFi**
```bash
/balance                     # Check ETH balance
/send 0x123... 0.05          # Send ETH
/swap ETH USDC 0.1           # Swap tokens
/price BTC                   # Get token price
/portfolio                   # View holdings
```

### 📊 **Information**
```bash
/help                        # Show all commands
/help dice                   # Specific command help
/about                       # About SquadWallet
/status                      # Agent status
```

## 🚀 Quick Start Guide

### **For New Players:**
1. **Check Balance**: `/balance`
2. **Play First Game**: `/dice 0.01`
3. **Check XP Earned**: `/xp`
4. **View Leaderboard**: `/leaderboard`
5. **Invite Friends**: `/invite <address>`

### **For Tournament Players:**
1. **List Tournaments**: `/tournament list`
2. **Join Tournament**: `/tournament join <id>`
3. **Play Games**: `/dice 0.01` (counts for tournament)
4. **Check Rankings**: `/tournament leaderboard <id>`

### **For Social Gamers:**
1. **Invite Friends**: `/invite <address>` (both get +100 XP)
2. **Challenge Players**: `/challenge <address> dice 0.01`
3. **Share Achievements**: `/share-badge <tokenId>`
4. **Build Community**: Create tournaments and compete

## 🏗️ Architecture

### **Smart Contracts (Base)**
- **SquadWallet.sol** - Wallet management and game logic
- **GameManager.sol** - Dice and coin flip games with VRF
- **XPBadges.sol** - Dynamic NFT badges with metadata
- **TournamentManager.sol** - Tournament creation and management

### **Agent Services**
- **XMTP Service** - Message handling and responses
- **Blockchain Service** - Contract interactions
- **Tournament Service** - Competition management
- **OnchainKit Service** - Rich UI generation
- **Basenames Service** - Identity resolution
- **Price Service** - DeFi data integration

## 🎯 Competitive Advantages

1. **🚀 Zero Friction** - No app downloads, works in any XMTP chat
2. **⚡ Instant Games** - Immediate results, no waiting
3. **🏆 Progression System** - XP and NFT badges keep players engaged
4. **👥 Social First** - Built for group interactions and viral growth
5. **💰 Real Rewards** - Actual ETH prizes and valuable NFTs
6. **🔗 Base Ecosystem** - Fast, cheap transactions on Ethereum L2

## 📈 Growth Strategy

### **Phase 1: Community Building**
- Launch in Base Discord/Telegram groups
- Partner with existing Web3 gaming communities
- Influencer partnerships for early adoption

### **Phase 2: Viral Mechanics**
- Referral rewards program (+100 XP for both)
- Cross-chat leaderboard competitions
- Social media integration for badge sharing

### **Phase 3: Ecosystem Expansion**
- Integration with other Base protocols
- Multi-chain expansion (Optimism, Arbitrum)
- Advanced DeFi features and yield farming

## 🏆 Why SquadWallet Will Win

**SquadWallet is positioned to capture the intersection of three massive trends:**

1. **Social Gaming** - $200B+ market moving onchain
2. **Messaging Apps** - 5B+ users seeking new experiences  
3. **Web3 Adoption** - Simplified UX driving mainstream adoption

**Our unique combination of instant gaming, social features, and messaging-native UX creates a viral growth engine that traditional Web3 games can't match.**

## 🎮 Ready to Play?

Join the SquadWallet revolution and turn your chats into gaming experiences!

**Start playing now**: Send any message to a SquadWallet agent and use `/help` to begin.

---

*Built with ❤️ for the Base ecosystem and XMTP community*

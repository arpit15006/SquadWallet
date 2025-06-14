# 🎮 SquadWallet Frontend - Enhanced

A comprehensive React-based frontend for the SquadWallet application featuring instant games, tournaments, XP progression, NFT badges, and social features.

## 🚀 New Features

### 🎲 **Enhanced Gaming**
- **Instant Games**: Play dice and coin flip games with immediate results
- **Multiplayer Games**: Create games for others to join
- **Tournament System**: Compete in organized tournaments with prize pools
- **XP Rewards**: Earn experience points for every game played

### 🏆 **Progression System**
- **XP & Levels**: Level up by earning experience points
- **NFT Badges**: Mint dynamic NFT badges representing achievements
- **Rarity Tiers**: Common → Uncommon → Rare → Epic → Legendary
- **Leaderboards**: Global and tournament-specific rankings

### 👥 **Social Features**
- **Friend Invites**: Invite friends and both earn bonus XP
- **Player Challenges**: Head-to-head gaming competitions
- **Badge Sharing**: Show off achievements in the community
- **Referral System**: Earn ongoing rewards for successful referrals

### 🏟️ **Tournament System**
- **Create Tournaments**: Organize competitions with custom rules
- **Join Competitions**: Participate in active tournaments
- **Prize Distribution**: Automatic ETH payouts to winners
- **Real-time Leaderboards**: Live tournament rankings

### 🎨 **Enhanced UI/UX**
- **OnchainKit Integration**: Rich visual game results and frames
- **Basenames Support**: ENS-style names on Base network
- **Interactive Dashboard**: Comprehensive user overview
- **Responsive Design**: Optimized for all devices

## 🛠️ Tech Stack

- **React 19** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** for modern styling
- **Framer Motion** for smooth animations
- **OnchainKit** for Web3 UI components
- **Ethers.js** for blockchain interactions
- **React Router** for seamless navigation
- **Lucide React** for beautiful icons

## 📱 Pages & Components

### **Core Pages**
- **HomePage**: Landing page with dashboard for connected users
- **GamePage**: Enhanced gaming interface with instant and multiplayer modes
- **TournamentPage**: Tournament creation, joining, and leaderboards
- **XPBadgesPage**: XP tracking, badge collection, and progression
- **SocialPage**: Friend invites, challenges, and community features
- **WalletPage**: Wallet management and DeFi tools
- **ChatPage**: XMTP agent interactions

### **Key Components**
- **Dashboard**: Comprehensive user stats and quick actions
- **SimpleWalletConnect**: Enhanced wallet connection
- **Navbar**: Updated navigation with all new features

## 🎮 Gaming Features

### **Instant Games**
```typescript
// Quick dice game
/dice 0.01

// Coin flip with choice
/coinflip 0.005 heads
```

### **Tournament Commands**
```typescript
// Create tournament
/tournament create "Daily Dice" dice 0.01 20 24

// Join tournament
/tournament join daily-dice

// View leaderboard
/tournament leaderboard daily-dice
```

### **Social Commands**
```typescript
// Invite friend
/invite 0x123...

// Challenge player
/challenge 0x123... dice 0.01

// Share badge
/share-badge 5
```

## 🏆 XP & Badge System

### **XP Earning**
- **Win Games**: Base XP + bet amount bonus
- **Tournament Play**: Extra multiplier for tournament games
- **Referrals**: +100 XP when friends join
- **Social Activity**: Bonus XP for challenges and sharing

### **Badge Rarity**
- 🥉 **Common** (Level 1-4): Basic achievements
- 🥈 **Uncommon** (Level 5-9): Regular players
- 🥇 **Rare** (Level 10-24): Skilled gamers
- 💎 **Epic** (Level 25-49): Expert players
- 👑 **Legendary** (Level 50+): Gaming legends

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Environment setup** - Create `.env` file:
```env
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_ONCHAINKIT_API_KEY=your_onchainkit_key
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open application**:
Navigate to [http://localhost:5173](http://localhost:5173)

## 📁 Enhanced Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # User dashboard with stats
│   ├── SimpleWalletConnect.tsx # Enhanced wallet connection
│   └── Navbar.tsx             # Updated navigation
├── pages/
│   ├── HomePage.tsx           # Landing + dashboard
│   ├── GamePage.tsx           # Enhanced gaming interface
│   ├── TournamentPage.tsx     # Tournament system
│   ├── XPBadgesPage.tsx       # XP tracking & badges
│   ├── SocialPage.tsx         # Social features
│   ├── WalletPage.tsx         # Wallet management
│   └── ChatPage.tsx           # XMTP interactions
├── hooks/
│   └── useContracts.ts        # Smart contract interactions
├── utils/
│   └── parser.ts              # Command parsing utilities
└── types/
    └── index.ts               # TypeScript definitions
```

## 🎯 Key Features Implementation

### **Instant Gaming**
- Real-time game results with animations
- XP calculation and display
- Tournament integration
- Win/loss tracking

### **Tournament System**
- Tournament creation and management
- Real-time leaderboards
- Prize pool calculations
- Participant tracking

### **Social Features**
- Friend invitation system
- Player challenges
- Achievement sharing
- Referral tracking

### **XP & Progression**
- Experience point calculation
- Level progression system
- NFT badge minting
- Rarity tier management

## 🌟 User Experience Highlights

### **Seamless Onboarding**
1. Connect wallet with one click
2. View personalized dashboard
3. Start with instant games
4. Progress through XP system
5. Unlock social features

### **Engaging Gameplay**
- Instant feedback on game results
- Visual XP and level progression
- Tournament competition
- Social challenges and sharing

### **Community Building**
- Friend referral system
- Shared achievements
- Competitive leaderboards
- Group tournaments

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID | ✅ |
| `VITE_BASE_RPC_URL` | Base network RPC endpoint | ✅ |
| `VITE_ONCHAINKIT_API_KEY` | OnchainKit API key | ✅ |
| `VITE_XMTP_ENV` | XMTP environment (dev/production) | ❌ |

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```

### **Deploy to Vercel**
```bash
vercel --prod
```

### **Deploy to Netlify**
```bash
netlify deploy --prod --dir=dist
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with ❤️ for the Base ecosystem and Web3 gaming community**

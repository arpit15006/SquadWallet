# 🚀 Deploy SquadWallet NOW!

## Step 1: Add Your Private Key

Edit the `.env` file and add your private key:

```bash
# Replace with your actual private key (the one with Sepolia ETH)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Optional but recommended for contract verification
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Required for frontend wallet connection
VITE_WALLET_CONNECT_PROJECT_ID=YOUR_WALLET_CONNECT_PROJECT_ID
```

## Step 2: Get Sepolia ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Enter your wallet address
3. Get free testnet ETH (you need ~0.01 ETH for deployment)

## Step 3: Deploy Contracts

```bash
# From the contracts directory
npm run deploy
```

This will:
- ✅ Deploy XPBadges contract
- ✅ Deploy MockGameManager contract  
- ✅ Deploy SquadWalletFactory contract
- ✅ Set up permissions
- ✅ Create a test wallet
- ✅ Update .env with contract addresses

## Step 4: Test Frontend

```bash
# From the frontend directory
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173 and test:
- Connect wallet
- Create squad wallet
- Deposit ETH
- Play games
- Check XP/badges

## Step 5: Deploy to Mainnet (Optional)

Once everything works on Sepolia:

1. Update .env for mainnet:
```bash
BASE_RPC_URL=https://mainnet.base.org
VITE_BASE_RPC_URL=https://mainnet.base.org
```

2. Get mainnet ETH (~0.01 ETH needed)

3. Deploy:
```bash
npm run deploy:mainnet
```

## 🎯 All Features Included

**Smart Contracts:**
- ✅ Multi-sig group wallets with voting
- ✅ Dice and coin flip games
- ✅ XP system with NFT badges
- ✅ Factory pattern for easy wallet creation

**Frontend (No Backend Needed):**
- ✅ Wallet connection with RainbowKit
- ✅ Create and manage squad wallets
- ✅ Deposit/withdraw ETH
- ✅ Play mini-games
- ✅ View XP and badges
- ✅ Portfolio dashboard
- ✅ Chat interface (XMTP simulator)
- ✅ Responsive design

**Ready for Buildathon:**
- ✅ Messaging-native (XMTP integration ready)
- ✅ On-chain (all state on Base)
- ✅ Group functionality (multi-sig wallets)
- ✅ Gaming elements (provably fair games)
- ✅ Beautiful UI/UX

## 🔧 Quick Fixes

**"Insufficient funds"** → Get more Sepolia ETH from faucet
**"Invalid private key"** → Make sure it starts with 0x
**"Network error"** → Check RPC URL in .env
**"Frontend won't connect"** → Add WalletConnect Project ID

## 🎮 Demo Script

1. **Show wallet creation**: Connect wallet → Create "Demo Squad"
2. **Show deposits**: Multiple users deposit ETH
3. **Show games**: Play dice game → automatic payout
4. **Show XP system**: View earned XP and badges
5. **Show portfolio**: Dashboard with charts and stats

## 🏆 Buildathon Ready!

Your SquadWallet is now ready for the Base Batches Messaging Buildathon submission with all requested features!

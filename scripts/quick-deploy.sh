#!/bin/bash

echo "🚀 SquadWallet Quick Deployment Script"
echo "======================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file from the template and fill in your values:"
    echo ""
    echo "Required values:"
    echo "- PRIVATE_KEY (your wallet private key with Sepolia ETH)"
    echo "- BASESCAN_API_KEY (from basescan.org)"
    echo "- VITE_WALLET_CONNECT_PROJECT_ID (from cloud.walletconnect.com)"
    echo ""
    echo "Run: cp .env.example .env"
    echo "Then edit .env with your values"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
echo "🔍 Checking environment variables..."

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    echo "Get a private key from MetaMask and add it to .env"
    exit 1
fi

if [ -z "$VITE_WALLET_CONNECT_PROJECT_ID" ]; then
    echo "⚠️  VITE_WALLET_CONNECT_PROJECT_ID not set"
    echo "Get one from https://cloud.walletconnect.com/"
    echo "Frontend wallet connection may not work without it"
fi

echo "✅ Environment variables checked"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Install root dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

# Deploy contracts
echo ""
echo "📜 Deploying smart contracts to Base Sepolia..."
cd contracts

# Install contract dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing contract dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed"
    exit 1
fi

# Deploy contracts
echo "🚀 Deploying contracts..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed"
    echo ""
    echo "Common issues:"
    echo "- Insufficient ETH balance (get Sepolia ETH from faucet)"
    echo "- Invalid private key"
    echo "- Network connection issues"
    exit 1
fi

echo "✅ Contracts deployed successfully!"
cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if contract addresses are set
source ../.env
if [ -z "$VITE_SQUAD_WALLET_FACTORY" ]; then
    echo "⚠️  Contract addresses not found in .env"
    echo "The deployment script should have updated them automatically"
fi

echo "✅ Frontend setup complete!"
cd ..

# Setup agent (optional)
echo ""
echo "🤖 Setting up agent..."
cd agent

# Install agent dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing agent dependencies..."
    npm install
fi

echo "✅ Agent setup complete!"
cd ..

echo ""
echo "🎉 SquadWallet deployment complete!"
echo "=================================="
echo ""
echo "📋 What's deployed:"
echo "✅ Smart contracts on Base Sepolia"
echo "✅ Frontend ready to run"
echo "✅ Agent ready to run (needs XMTP/AgentKit keys)"
echo ""
echo "🚀 Next steps:"
echo ""
echo "1. Test the frontend:"
echo "   cd frontend && npm run dev"
echo "   Open http://localhost:5173"
echo ""
echo "2. Verify contracts (optional):"
echo "   cd contracts && npm run verify"
echo ""
echo "3. Set up agent (optional):"
echo "   Add XMTP_PRIVATE_KEY and CDP keys to .env"
echo "   cd agent && npm run dev"
echo ""
echo "4. Test functionality:"
echo "   - Connect wallet to frontend"
echo "   - Create a squad wallet"
echo "   - Deposit some ETH"
echo "   - Try the games"
echo ""
echo "📄 Contract addresses saved to deployment-info.json"
echo "🔗 View on BaseScan: https://sepolia.basescan.org/"

# Show contract addresses
if [ -f "deployment-info.json" ]; then
    echo ""
    echo "📜 Deployed contracts:"
    cat deployment-info.json | grep -A 10 '"contracts"'
fi

echo ""
echo "🎯 Ready for Base Batches Messaging Buildathon! 🚀"

#!/bin/bash

# SquadWallet Deployment Script
echo "🚀 Deploying SquadWallet to Base mainnet..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$BASE_RPC_URL" ]; then
    echo "❌ BASE_RPC_URL not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Deploy contracts
echo "📜 Deploying smart contracts..."
cd contracts

# Compile contracts
echo "🔨 Compiling contracts..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed"
    exit 1
fi

# Deploy to Base mainnet
echo "🌐 Deploying to Base mainnet..."
npm run deploy

if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed"
    exit 1
fi

echo "✅ Contracts deployed successfully"
cd ..

# Build agent
echo "🤖 Building agent..."
cd agent
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Agent build failed"
    exit 1
fi

echo "✅ Agent built successfully"
cd ..

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"
cd ..

echo ""
echo "🎉 SquadWallet deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy agent to Railway/Fly.io"
echo "2. Deploy frontend to Vercel/Netlify"
echo "3. Update contract addresses in frontend/.env"
echo "4. Test all functionality"
echo ""
echo "📄 Deployment info saved to deployment-info.json"

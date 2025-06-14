#!/bin/bash

# SquadWallet Setup Script
echo "🚀 Setting up SquadWallet..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup contracts
echo "🔧 Setting up contracts..."
cd contracts
npm install
echo "✅ Contracts dependencies installed"
cd ..

# Setup agent
echo "🤖 Setting up agent..."
cd agent
npm install
echo "✅ Agent dependencies installed"
cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# Create environment files
echo "📝 Creating environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please fill in your values)"
else
    echo "⚠️  .env file already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env file (please fill in your values)"
else
    echo "⚠️  frontend/.env file already exists"
fi

# Create logs directory for agent
mkdir -p agent/logs

echo ""
echo "🎉 SquadWallet setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Fill in your environment variables in .env and frontend/.env"
echo "2. Deploy contracts: npm run deploy:contracts"
echo "3. Start the agent: npm run dev:agent"
echo "4. Start the frontend: npm run dev:frontend"
echo ""
echo "📚 Documentation:"
echo "• README.md - Project overview and setup"
echo "• contracts/README.md - Smart contract documentation"
echo "• agent/README.md - Agent setup and commands"
echo "• frontend/README.md - Frontend development guide"
echo ""
echo "🔗 Useful links:"
echo "• Base Network: https://base.org"
echo "• XMTP: https://xmtp.org"
echo "• Coinbase AgentKit: https://docs.cdp.coinbase.com"
echo "• OnchainKit: https://onchainkit.xyz"

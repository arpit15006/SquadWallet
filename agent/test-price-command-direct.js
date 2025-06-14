// Test the price command directly with the running agent
require('dotenv').config();

async function testPriceCommandDirect() {
  console.log('🧪 Testing Price Command with Running Agent...\n');
  
  try {
    // Import the DeFi handlers directly
    console.log('📦 Importing DeFi handlers...');
    const { DeFiHandlers } = require('./dist/handlers/defi.js');
    const { BlockchainService } = require('./dist/services/blockchain.js');
    const { XMTPService } = require('./dist/services/xmtp.js');
    
    console.log('✅ Handlers imported successfully');
    
    // Create mock services
    const mockXMTPService = {
      sendResponse: async (conversationId, response, success) => {
        console.log('🤖 Agent Response:');
        console.log(response);
        return true;
      }
    };
    
    // Create a minimal blockchain service config
    const config = {
      xmtpPrivateKey: process.env.XMTP_PRIVATE_KEY,
      xmtpEnv: 'dev',
      cdpApiKeyName: process.env.CDP_API_KEY_NAME,
      cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
      baseRpcUrl: process.env.BASE_RPC_URL,
      contracts: {
        squadWalletFactory: process.env.SQUAD_WALLET_FACTORY,
        gameManager: process.env.GAME_MANAGER_CONTRACT,
        xpBadges: process.env.XP_BADGES_CONTRACT
      }
    };
    
    const blockchainService = new BlockchainService(config);
    
    console.log('🚀 Creating DeFi handlers...');
    const defiHandlers = new DeFiHandlers(blockchainService, mockXMTPService);
    
    console.log('✅ DeFi handlers created');
    
    // Get the price handler
    const handlers = defiHandlers.getAllHandlers();
    const priceHandler = handlers.find(h => h.name === 'price');
    
    if (!priceHandler) {
      throw new Error('Price handler not found!');
    }
    
    console.log('✅ Price handler found');
    
    // Test ETH price command
    console.log('\n📊 Testing /price ETH command...');
    const ethCommand = {
      name: 'price',
      args: ['ETH'],
      sender: '0x1234567890123456789012345678901234567890',
      conversationId: 'test-conversation'
    };
    
    await priceHandler.handler(ethCommand);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test BTC price command
    console.log('📊 Testing /price BTC command...');
    const btcCommand = {
      name: 'price',
      args: ['BTC'],
      sender: '0x1234567890123456789012345678901234567890',
      conversationId: 'test-conversation'
    };
    
    await priceHandler.handler(btcCommand);
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test USDC price command
    console.log('📊 Testing /price USDC command...');
    const usdcCommand = {
      name: 'price',
      args: ['USDC'],
      sender: '0x1234567890123456789012345678901234567890',
      conversationId: 'test-conversation'
    };
    
    await priceHandler.handler(usdcCommand);
    
    console.log('\n✅ All price commands tested successfully!');
    console.log('💡 This is exactly what the agent will return for /price commands.');
    
  } catch (error) {
    console.error('❌ Price command test failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testPriceCommandDirect();

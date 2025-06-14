// Test the agent directly to see the actual error
require('dotenv').config();

async function testAgentDirect() {
  console.log('🧪 Testing Agent Direct Startup...\n');
  
  try {
    // Import the compiled agent
    console.log('📦 Importing agent...');
    const SquadWalletAgent = require('./dist/agent.js').default;
    
    console.log('✅ Agent imported successfully');
    
    console.log('🚀 Creating agent instance...');
    const agent = new SquadWalletAgent();
    
    console.log('✅ Agent instance created');
    
    console.log('🔄 Starting agent...');
    await agent.start();
    
    console.log('✅ Agent started successfully!');
    
    // Test the agent status
    const status = agent.getStatus();
    console.log('📊 Agent Status:', status);
    
    // Keep running for a bit
    setTimeout(() => {
      console.log('🛑 Shutting down agent...');
      agent.shutdown().then(() => {
        console.log('✅ Agent shutdown complete');
        process.exit(0);
      });
    }, 5000);
    
  } catch (error) {
    console.error('❌ Agent startup failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.message.includes('Missing required environment variable')) {
      console.log('\n💡 Environment variable issue detected');
    } else if (error.message.includes('XMTP')) {
      console.log('\n💡 XMTP connection issue detected');
    } else if (error.message.includes('RPC')) {
      console.log('\n💡 RPC connection issue detected');
    }
    
    process.exit(1);
  }
}

testAgentDirect();

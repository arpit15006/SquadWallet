// Simple price command test - exactly what the agent should return
const axios = require('axios');
require('dotenv').config();

class SimplePriceCommand {
  constructor() {
    this.apiKey = process.env.COINMARKETCAP_API_KEY;
    this.baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  }

  formatLargeNumber(num) {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  async getPrice(symbol) {
    try {
      const response = await axios.get(`${this.baseUrl}/cryptocurrency/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          symbol: symbol.toUpperCase(),
          convert: 'USD'
        }
      });

      const data = response.data.data[symbol.toUpperCase()];
      if (!data) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const quote = data.quote.USD;
      
      return {
        symbol: symbol.toUpperCase(),
        price: quote.price,
        change24h: quote.percent_change_24h,
        volume24h: quote.volume_24h,
        marketCap: quote.market_cap,
        lastUpdated: data.last_updated
      };
    } catch (error) {
      console.error('CoinMarketCap API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async handlePriceCommand(token) {
    try {
      console.log(`🔍 Processing /price ${token} command...`);
      
      const priceData = await this.getPrice(token);

      const response = `💰 **${token.toUpperCase()} Price Data** (CoinMarketCap)

💵 **Current Price**: $${priceData.price.toFixed(2)}
📈 **24h Change**: ${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%
📊 **24h Volume**: ${priceData.volume24h ? '$' + this.formatLargeNumber(priceData.volume24h) : 'N/A'}
🏆 **Market Cap**: ${priceData.marketCap ? '$' + this.formatLargeNumber(priceData.marketCap) : 'N/A'}
⏰ **Last Updated**: ${priceData.lastUpdated ? new Date(priceData.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}

${priceData.change24h >= 0 ? '🟢' : '🔴'} **Trend**: ${priceData.change24h >= 0 ? 'Bullish' : 'Bearish'}

💡 **Set Price Alert**: \`/alert ${token.toUpperCase()} <price>\`
🔄 **Refresh**: \`/price ${token.toUpperCase()}\``;

      return response;
    } catch (error) {
      console.error('❌ Failed to get token price:', error);
      return `❌ Failed to get ${token.toUpperCase()} price. Please check the token symbol and try again.`;
    }
  }
}

// Test the price command exactly as the agent would
async function testPriceCommands() {
  console.log('🧪 Testing Price Commands (Agent Simulation)...\n');
  
  const priceCommand = new SimplePriceCommand();
  
  // Test ETH
  console.log('📊 Simulating: User sends "/price ETH"');
  const ethResponse = await priceCommand.handlePriceCommand('ETH');
  console.log('🤖 Agent Response:');
  console.log(ethResponse);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test BTC
  console.log('📊 Simulating: User sends "/price BTC"');
  const btcResponse = await priceCommand.handlePriceCommand('BTC');
  console.log('🤖 Agent Response:');
  console.log(btcResponse);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test USDC
  console.log('📊 Simulating: User sends "/price USDC"');
  const usdcResponse = await priceCommand.handlePriceCommand('USDC');
  console.log('🤖 Agent Response:');
  console.log(usdcResponse);
  console.log('\n' + '='.repeat(60) + '\n');
  
  console.log('✅ This is exactly what your /price command should return!');
  console.log('💡 If the agent is returning different data, it\'s not using the updated code.');
}

testPriceCommands().catch(console.error);

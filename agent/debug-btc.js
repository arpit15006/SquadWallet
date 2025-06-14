const axios = require('axios');
require('dotenv').config();

async function debugBTCPrice() {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  const baseUrl = 'https://pro-api.coinmarketcap.com/v1';
  
  console.log('🔍 Debugging BTC Price Issue...\n');
  
  try {
    // Test BTC specifically
    console.log('📊 Testing BTC price from CoinMarketCap...');
    
    const response = await axios.get(`${baseUrl}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      },
      params: {
        symbol: 'BTC',
        convert: 'USD'
      }
    });

    console.log('Raw API Response for BTC:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const data = response.data.data['BTC'];
    if (data) {
      const quote = data.quote.USD;
      console.log('\n✅ BTC Data Found:');
      console.log(`💰 Price: $${quote.price}`);
      console.log(`📈 24h Change: ${quote.percent_change_24h}%`);
      console.log(`📊 Volume: $${quote.volume_24h}`);
      console.log(`🏆 Market Cap: $${quote.market_cap}`);
      console.log(`⏰ Last Updated: ${data.last_updated}`);
      
      // Check if price seems reasonable
      if (quote.price > 200000) {
        console.log('\n⚠️ WARNING: BTC price seems unusually high!');
        console.log('This might be a data issue from CoinMarketCap');
      } else if (quote.price < 10000) {
        console.log('\n⚠️ WARNING: BTC price seems unusually low!');
      } else {
        console.log('\n✅ BTC price seems reasonable');
      }
    } else {
      console.log('❌ No BTC data returned');
    }
    
  } catch (error) {
    console.log('❌ Error fetching BTC price:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }
  
  // Also test ETH for comparison
  try {
    console.log('\n📊 Testing ETH price for comparison...');
    
    const response = await axios.get(`${baseUrl}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      },
      params: {
        symbol: 'ETH',
        convert: 'USD'
      }
    });

    const data = response.data.data['ETH'];
    if (data) {
      const quote = data.quote.USD;
      console.log('✅ ETH Data:');
      console.log(`💰 Price: $${quote.price}`);
      console.log(`📈 24h Change: ${quote.percent_change_24h}%`);
    }
    
  } catch (error) {
    console.log('❌ Error fetching ETH price:', error.message);
  }
  
  // Test multiple symbols at once
  try {
    console.log('\n📊 Testing multiple symbols at once...');
    
    const response = await axios.get(`${baseUrl}/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      },
      params: {
        symbol: 'BTC,ETH,USDC',
        convert: 'USD'
      }
    });

    console.log('Multiple symbols response:');
    Object.keys(response.data.data).forEach(symbol => {
      const data = response.data.data[symbol];
      const quote = data.quote.USD;
      console.log(`${symbol}: $${quote.price.toFixed(2)}`);
    });
    
  } catch (error) {
    console.log('❌ Error fetching multiple symbols:', error.message);
  }
}

debugBTCPrice();

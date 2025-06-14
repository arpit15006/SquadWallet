import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface PortfolioData {
  timestamp: number;
  totalValue: number;
  ethValue: number;
  tokenValue: number;
}

interface TokenHolding {
  symbol: string;
  balance: number;
  value: number;
  percentage: number;
  change24h: number;
  color: string;
}

interface PortfolioChartProps {
  walletAddress?: string;
  refreshInterval?: number;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ 
  walletAddress, 
  refreshInterval = 30000 
}) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W' | '1M'>('1D');

  // Mock data generation (replace with real API calls)
  useEffect(() => {
    const generateMockData = () => {
      const now = Date.now();
      const dataPoints = timeframe === '1H' ? 12 : timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
      const interval = timeframe === '1H' ? 5 * 60 * 1000 : timeframe === '1D' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      
      const data: PortfolioData[] = [];
      let baseValue = 1000 + Math.random() * 5000;
      
      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = now - (i * interval);
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * volatility;
        baseValue *= (1 + change);
        
        data.push({
          timestamp,
          totalValue: baseValue,
          ethValue: baseValue * 0.6,
          tokenValue: baseValue * 0.4
        });
      }
      
      setPortfolioData(data);
      setTotalValue(baseValue);
      
      // Calculate 24h change
      const firstValue = data[0]?.totalValue || baseValue;
      const changePercent = ((baseValue - firstValue) / firstValue) * 100;
      setChange24h(changePercent);
    };

    const generateTokenHoldings = () => {
      const mockHoldings: TokenHolding[] = [
        {
          symbol: 'ETH',
          balance: 2.5,
          value: 5000,
          percentage: 60,
          change24h: 2.5,
          color: '#627EEA'
        },
        {
          symbol: 'USDC',
          balance: 2000,
          value: 2000,
          percentage: 24,
          change24h: 0.1,
          color: '#2775CA'
        },
        {
          symbol: 'DAI',
          balance: 800,
          value: 800,
          percentage: 10,
          change24h: -0.2,
          color: '#F5AC37'
        },
        {
          symbol: 'WETH',
          balance: 0.25,
          value: 500,
          percentage: 6,
          change24h: 2.3,
          color: '#FF6B6B'
        }
      ];
      
      setTokenHoldings(mockHoldings);
    };

    generateMockData();
    generateTokenHoldings();
    setIsLoading(false);

    // Set up refresh interval
    const interval = setInterval(() => {
      generateMockData();
      generateTokenHoldings();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [timeframe, refreshInterval]);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === '1H') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded mb-4"></div>
          <div className="h-64 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {formatValue(totalValue)}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {change24h >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${
                change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}% (24h)
              </span>
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
            {(['1H', '1D', '1W', '1M'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [formatValue(value), 'Portfolio Value']}
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="totalValue"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Token Holdings */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Holdings List */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Token Holdings</h4>
          <div className="space-y-3">
            {tokenHoldings.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: token.color }}
                  />
                  <div>
                    <div className="text-white font-medium">{token.symbol}</div>
                    <div className="text-gray-400 text-sm">
                      {token.balance.toLocaleString()} {token.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatValue(token.value)}
                  </div>
                  <div className={`text-sm ${
                    token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Asset Allocation</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenHoldings}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="percentage"
                >
                  {tokenHoldings.map((token, index) => (
                    <Cell key={`cell-${index}`} fill={token.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: number, name, props) => [
                    `${value}%`,
                    props.payload.symbol
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {tokenHoldings.map((token) => (
              <div key={token.symbol} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: token.color }}
                />
                <span className="text-gray-300 text-sm">
                  {token.symbol} ({token.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Total Value</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatValue(totalValue)}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">24h Change</span>
          </div>
          <div className={`text-xl font-bold ${
            change24h >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Percent className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Best Performer</span>
          </div>
          <div className="text-xl font-bold text-white">
            {tokenHoldings.reduce((best, token) => 
              token.change24h > best.change24h ? token : best
            ).symbol}
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">Assets</span>
          </div>
          <div className="text-xl font-bold text-white">
            {tokenHoldings.length}
          </div>
        </div>
      </div>
    </div>
  );
};

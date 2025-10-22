import { TrendingUp, TrendingDown, Minus, Target, Shield, DollarSign, Activity } from 'lucide-react';
import { TradingSignal } from '../types/trading';

interface SignalDisplayProps {
  signal: TradingSignal;
}

export function SignalDisplay({ signal }: SignalDisplayProps) {
  const getBiasIcon = () => {
    switch (signal.marketBias) {
      case 'bullish':
        return <TrendingUp className="w-6 h-6 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-6 h-6 text-red-400" />;
      default:
        return <Minus className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getBiasColor = () => {
    switch (signal.marketBias) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getBiasLabel = () => {
    return signal.marketBias.charAt(0).toUpperCase() + signal.marketBias.slice(1);
  };

  const getConfidenceColor = () => {
    if (signal.confidence >= 85) return 'text-green-400';
    if (signal.confidence >= 70) return 'text-blue-400';
    return 'text-yellow-400';
  };

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getBiasIcon()}
            <div>
              <h2 className="text-2xl font-bold text-white">{signal.pair}</h2>
              <p className="text-sm text-gray-400">Smart Money Concepts Analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end space-x-2 mb-1">
              <Activity className={`w-5 h-5 ${getConfidenceColor()}`} />
              <span className={`text-2xl font-bold ${getConfidenceColor()}`}>
                {signal.confidence}%
              </span>
            </div>
            <p className="text-xs text-gray-400">Confidence</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-300">Market Bias</h3>
            </div>
            <p className={`text-xl font-bold ${getBiasColor()}`}>{getBiasLabel()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {signal.marketStructure.trend === 'bullish' && '4H order block + 15M BOS'}
              {signal.marketStructure.trend === 'bearish' && '4H supply zone + 15M CHoCH'}
              {signal.marketStructure.trend === 'neutral' && 'Consolidation range'}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-gray-300">Live Price</h3>
            </div>
            <p className="text-xl font-bold text-white">{formatPrice(signal.livePrice)}</p>
            <p className="text-xs text-gray-500 mt-1">Real-time market data</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg p-5 border border-blue-700/50">
          <div className="flex items-start space-x-3 mb-3">
            <Target className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-300 mb-1">Entry Zone</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">{formatPrice(signal.entryZoneStart)}</span>
                <span className="text-gray-400">–</span>
                <span className="text-2xl font-bold text-white">{formatPrice(signal.entryZoneEnd)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-lg p-4 border border-red-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-semibold text-red-300">Stop Loss</h3>
            </div>
            <p className="text-xl font-bold text-white">{formatPrice(signal.stopLoss)}</p>
            <p className="text-xs text-red-400/70 mt-1">
              Risk: {Math.abs(((signal.stopLoss - signal.entryZoneStart) / signal.entryZoneStart) * 100).toFixed(2)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg p-4 border border-green-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-green-300">Take Profit</h3>
            </div>
            <p className="text-xl font-bold text-white">{formatPrice(signal.takeProfit)}</p>
            <p className="text-xs text-green-400/70 mt-1">
              Reward: {Math.abs(((signal.takeProfit - signal.entryZoneEnd) / signal.entryZoneEnd) * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>AI Analysis</span>
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">{signal.aiNote}</p>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">SMC Zones Detected</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {signal.smcZones.filter(z => z.type === 'orderBlock').length}
              </p>
              <p className="text-xs text-gray-500">Order Blocks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {signal.smcZones.filter(z => z.type === 'liquidityZone').length}
              </p>
              <p className="text-xs text-gray-500">Liquidity Zones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {signal.smcZones.filter(z => z.type === 'demandZone').length}
              </p>
              <p className="text-xs text-gray-500">Demand Zones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {signal.smcZones.filter(z => z.type === 'supplyZone').length}
              </p>
              <p className="text-xs text-gray-500">Supply Zones</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Generated: {new Date(signal.timestamp).toLocaleString()} • Signal ID: {signal.id}
          </p>
        </div>
      </div>
    </div>
  );
}

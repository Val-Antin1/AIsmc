import { useEffect, useState } from 'react';
import { History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TradingSignal } from '../types/trading';
import { SignalService } from '../services/signalService';

export function SignalHistory() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    try {
      const recentSignals = await SignalService.getRecentSignals(5);
      setSignals(recentSignals);
    } catch (error) {
      console.error('Error loading signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
        <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No signal history yet</p>
        <p className="text-sm text-gray-500 mt-1">Analyze your first chart to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-white">Recent Signals</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-700">
        {signals.map((signal) => (
          <div key={signal.id} className="px-6 py-4 hover:bg-gray-800/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getBiasIcon(signal.marketBias)}
                  <span className="font-semibold text-white">{signal.pair}</span>
                  <span className={`text-sm font-medium ${getBiasColor(signal.marketBias)}`}>
                    {signal.marketBias.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Entry: {signal.entryZoneStart.toFixed(5)} - {signal.entryZoneEnd.toFixed(5)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(signal.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-blue-400">{signal.confidence.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

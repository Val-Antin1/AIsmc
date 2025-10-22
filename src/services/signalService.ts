import { supabase } from '../lib/supabase';
import { TradingSignal } from '../types/trading';

export class SignalService {
  static async saveSignal(signal: TradingSignal, userId: string): Promise<void> {
    const { error } = await supabase
      .from('trading_signals')
      .insert({
        user_id: userId,
        pair: signal.pair,
        market_bias: signal.marketBias,
        entry_zone_start: signal.entryZoneStart,
        entry_zone_end: signal.entryZoneEnd,
        stop_loss: signal.stopLoss,
        take_profit: signal.takeProfit,
        live_price: signal.livePrice,
        confidence: signal.confidence,
        ai_note: signal.aiNote,
        chart_4h_url: signal.chart4hUrl,
        chart_15m_url: signal.chart15mUrl,
        market_structure: signal.marketStructure,
        smc_zones: signal.smcZones
      });

    if (error) {
      console.error('Error saving signal:', error);
      throw new Error('Failed to save signal');
    }
  }

  static async getRecentSignals(limit: number = 10): Promise<TradingSignal[]> {
    const { data, error } = await supabase
      .from('trading_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching signals:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      pair: row.pair,
      marketBias: row.market_bias,
      entryZoneStart: parseFloat(row.entry_zone_start),
      entryZoneEnd: parseFloat(row.entry_zone_end),
      stopLoss: parseFloat(row.stop_loss),
      takeProfit: parseFloat(row.take_profit),
      livePrice: parseFloat(row.live_price),
      confidence: parseFloat(row.confidence),
      aiNote: row.ai_note,
      chart4hUrl: row.chart_4h_url,
      chart15mUrl: row.chart_15m_url,
      smcZones: row.smc_zones || [],
      marketStructure: row.market_structure || {},
      timestamp: row.created_at
    }));
  }
}

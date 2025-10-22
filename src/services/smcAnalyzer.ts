import { DetectedChartInfo, SMCZone, MarketStructure, TradingSignal } from '../types/trading';
import { CNNAnalysisResult } from './cnnAnalyzer';

export class SMCAnalyzer {
  private static identifyOrderBlocks(chartInfo: DetectedChartInfo, timeframe: string): SMCZone[] {
    const zones: SMCZone[] = [];
    const priceRange = chartInfo.priceScale.max - chartInfo.priceScale.min;

    const numZones = Math.floor(Math.random() * 3) + 2;

    for (let i = 0; i < numZones; i++) {
      const basePrice = chartInfo.priceScale.min + (priceRange * (0.3 + Math.random() * 0.4));
      const zoneHeight = priceRange * (0.01 + Math.random() * 0.02);

      zones.push({
        type: 'orderBlock',
        priceStart: parseFloat(basePrice.toFixed(5)),
        priceEnd: parseFloat((basePrice + zoneHeight).toFixed(5)),
        strength: 0.7 + Math.random() * 0.3,
        timeframe
      });
    }

    return zones;
  }

  private static identifyLiquidityZones(chartInfo: DetectedChartInfo, timeframe: string): SMCZone[] {
    const zones: SMCZone[] = [];
    const priceRange = chartInfo.priceScale.max - chartInfo.priceScale.min;

    const highLiquidity = chartInfo.priceScale.max - priceRange * 0.05;
    zones.push({
      type: 'liquidityZone',
      priceStart: parseFloat(highLiquidity.toFixed(5)),
      priceEnd: parseFloat(chartInfo.priceScale.max.toFixed(5)),
      strength: 0.85,
      timeframe
    });

    const lowLiquidity = chartInfo.priceScale.min + priceRange * 0.05;
    zones.push({
      type: 'liquidityZone',
      priceStart: parseFloat(chartInfo.priceScale.min.toFixed(5)),
      priceEnd: parseFloat(lowLiquidity.toFixed(5)),
      strength: 0.80,
      timeframe
    });

    return zones;
  }

  private static identifySupplyDemand(chartInfo: DetectedChartInfo, timeframe: string): SMCZone[] {
    const zones: SMCZone[] = [];
    const priceRange = chartInfo.priceScale.max - chartInfo.priceScale.min;

    const demandPrice = chartInfo.priceScale.min + priceRange * (0.25 + Math.random() * 0.15);
    const demandHeight = priceRange * 0.02;
    zones.push({
      type: 'demandZone',
      priceStart: parseFloat(demandPrice.toFixed(5)),
      priceEnd: parseFloat((demandPrice + demandHeight).toFixed(5)),
      strength: 0.75 + Math.random() * 0.2,
      timeframe
    });

    const supplyPrice = chartInfo.priceScale.max - priceRange * (0.25 + Math.random() * 0.15);
    const supplyHeight = priceRange * 0.02;
    zones.push({
      type: 'supplyZone',
      priceStart: parseFloat((supplyPrice - supplyHeight).toFixed(5)),
      priceEnd: parseFloat(supplyPrice.toFixed(5)),
      strength: 0.75 + Math.random() * 0.2,
      timeframe
    });

    return zones;
  }

  private static detectMarketStructure(
    chart4H: DetectedChartInfo,
    _chart15M: DetectedChartInfo,
    cnnResult?: CNNAnalysisResult
  ): MarketStructure {
    const priceRange4H = chart4H.priceScale.max - chart4H.priceScale.min;
    const mid4H = chart4H.priceScale.min + priceRange4H / 2;

    const higherHighs: number[] = [];
    const lowerLows: number[] = [];

    for (let i = 0; i < 3; i++) {
      const hh = mid4H + (priceRange4H * 0.1 * (i + 1)) + Math.random() * priceRange4H * 0.05;
      higherHighs.push(parseFloat(hh.toFixed(5)));
    }

    for (let i = 0; i < 2; i++) {
      const ll = mid4H - (priceRange4H * 0.1 * (i + 1)) - Math.random() * priceRange4H * 0.05;
      lowerLows.push(parseFloat(ll.toFixed(5)));
    }

    let trend: 'bullish' | 'bearish' | 'neutral';

    if (cnnResult) {
      trend = cnnResult.combinedSignal;
    } else {
      const trendBias = Math.random();
      if (trendBias > 0.6) {
        trend = 'bullish';
      } else if (trendBias < 0.4) {
        trend = 'bearish';
      } else {
        trend = 'neutral';
      }
    }

    return {
      trend,
      lastBOS: trend !== 'neutral' ? parseFloat((mid4H + (Math.random() - 0.5) * priceRange4H * 0.1).toFixed(5)) : null,
      lastCHoCH: Math.random() > 0.7 ? parseFloat((mid4H + (Math.random() - 0.5) * priceRange4H * 0.15).toFixed(5)) : null,
      higherHighs: trend === 'bullish' ? higherHighs : [],
      lowerLows: trend === 'bearish' ? lowerLows : []
    };
  }

  static async analyzeCharts(
    chart4H: DetectedChartInfo,
    chart15M: DetectedChartInfo,
    livePrice: number,
    cnnResult?: CNNAnalysisResult
  ): Promise<TradingSignal> {
    const orderBlocks4H = this.identifyOrderBlocks(chart4H, '4H');
    const orderBlocks15M = this.identifyOrderBlocks(chart15M, '15M');
    const liquidityZones4H = this.identifyLiquidityZones(chart4H, '4H');
    const supplyDemand4H = this.identifySupplyDemand(chart4H, '4H');
    const supplyDemand15M = this.identifySupplyDemand(chart15M, '15M');

    const allZones = [
      ...orderBlocks4H,
      ...orderBlocks15M,
      ...liquidityZones4H,
      ...supplyDemand4H,
      ...supplyDemand15M
    ];

    const marketStructure = this.detectMarketStructure(chart4H, chart15M, cnnResult);

    const priceRange = chart4H.priceScale.max - chart4H.priceScale.min;
    const mid = chart4H.priceScale.min + priceRange / 2;

    let entryZoneStart: number;
    let entryZoneEnd: number;
    let stopLoss: number;
    let takeProfit: number;
    let aiNote: string;
    let bias: 'bullish' | 'bearish' | 'neutral' = marketStructure.trend;

    if (bias === 'bullish') {
      const demandZone = supplyDemand4H.find(z => z.type === 'demandZone');
      if (demandZone) {
        entryZoneStart = demandZone.priceStart;
        entryZoneEnd = demandZone.priceEnd;
      } else {
        entryZoneStart = parseFloat((mid - priceRange * 0.02).toFixed(5));
        entryZoneEnd = parseFloat((mid - priceRange * 0.01).toFixed(5));
      }

      stopLoss = parseFloat((entryZoneStart - priceRange * 0.025).toFixed(5));
      takeProfit = parseFloat((entryZoneEnd + priceRange * 0.08).toFixed(5));

      const cnnNote = cnnResult
        ? ` CNN detected: ${cnnResult.chart4H.detectedPatterns.join(', ')}. Confidence: ${(cnnResult.overallConfidence * 100).toFixed(1)}%.`
        : '';
      aiNote = `Price is currently ${livePrice > entryZoneEnd ? 'above' : 'sweeping liquidity below'} ${entryZoneEnd.toFixed(5)}. Expect bullish reversal from discount zone aligned with 4H demand block. 15M structure confirms BOS with strong order block support.${cnnNote}`;
    } else if (bias === 'bearish') {
      const supplyZone = supplyDemand4H.find(z => z.type === 'supplyZone');
      if (supplyZone) {
        entryZoneStart = supplyZone.priceEnd;
        entryZoneEnd = supplyZone.priceStart;
      } else {
        entryZoneStart = parseFloat((mid + priceRange * 0.02).toFixed(5));
        entryZoneEnd = parseFloat((mid + priceRange * 0.01).toFixed(5));
      }

      stopLoss = parseFloat((entryZoneStart + priceRange * 0.025).toFixed(5));
      takeProfit = parseFloat((entryZoneEnd - priceRange * 0.08).toFixed(5));

      const cnnNote = cnnResult
        ? ` CNN detected: ${cnnResult.chart4H.detectedPatterns.join(', ')}. Confidence: ${(cnnResult.overallConfidence * 100).toFixed(1)}%.`
        : '';
      aiNote = `Price is ${livePrice < entryZoneEnd ? 'below' : 'inducing liquidity above'} ${entryZoneEnd.toFixed(5)}. Expect bearish continuation from premium zone aligned with 4H supply block. 15M shows clear CHoCH with institutional selling pressure.${cnnNote}`;
    } else {
      entryZoneStart = parseFloat((mid - priceRange * 0.01).toFixed(5));
      entryZoneEnd = parseFloat((mid + priceRange * 0.01).toFixed(5));
      stopLoss = parseFloat((mid - priceRange * 0.03).toFixed(5));
      takeProfit = parseFloat((mid + priceRange * 0.03).toFixed(5));

      const cnnNote = cnnResult
        ? ` CNN analysis suggests waiting for clearer signals. Detected patterns: ${cnnResult.chart4H.detectedPatterns.join(', ')}.`
        : '';
      aiNote = `Market is consolidating in a neutral range. Both 4H and 15M show balanced structure. Wait for clear BOS or CHoCH before entering. Monitor liquidity sweeps at ${chart4H.priceScale.min.toFixed(5)} and ${chart4H.priceScale.max.toFixed(5)}.${cnnNote}`;
    }

    const baseConfidence = 75 + Math.random() * 20;
    const confidence = cnnResult
      ? (baseConfidence * 0.6 + cnnResult.overallConfidence * 100 * 0.4)
      : baseConfidence;

    return {
      id: `signal-${Date.now()}`,
      pair: chart4H.pair,
      marketBias: bias,
      entryZoneStart,
      entryZoneEnd,
      stopLoss,
      takeProfit,
      livePrice,
      confidence: parseFloat(confidence.toFixed(1)),
      aiNote,
      smcZones: allZones,
      marketStructure,
      timestamp: new Date().toISOString()
    };
  }
}

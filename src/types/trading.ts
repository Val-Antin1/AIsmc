export interface ChartUpload {
  file: File;
  preview: string;
  timeframe: '4H' | '15M';
}

export interface DetectedChartInfo {
  pair: string;
  timeframe: string;
  priceScale: {
    min: number;
    max: number;
  };
}

export interface SMCZone {
  type: 'orderBlock' | 'supplyZone' | 'demandZone' | 'liquidityZone' | 'imbalance';
  priceStart: number;
  priceEnd: number;
  strength: number;
  timeframe: string;
}

export interface MarketStructure {
  trend: 'bullish' | 'bearish' | 'neutral';
  lastBOS: number | null;
  lastCHoCH: number | null;
  higherHighs: number[];
  lowerLows: number[];
}

export interface TradingSignal {
  id: string;
  pair: string;
  marketBias: 'bullish' | 'bearish' | 'neutral';
  entryZoneStart: number;
  entryZoneEnd: number;
  stopLoss: number;
  takeProfit: number;
  livePrice: number;
  confidence: number;
  aiNote: string;
  smcZones: SMCZone[];
  marketStructure: MarketStructure;
  timestamp: string;
  chart4hUrl?: string;
  chart15mUrl?: string;
}

export interface AnalysisResult {
  detected4H: DetectedChartInfo;
  detected15M: DetectedChartInfo;
  signal: TradingSignal;
  processingTime: number;
}

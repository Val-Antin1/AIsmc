interface LivePriceResponse {
  symbol: string;
  price: number;
  timestamp: string;
  source: string;
}

export class MarketDataService {
  static async getLivePrice(symbol: string): Promise<number> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-live-price`;

      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ symbol })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch live price: ${response.status}`);
      }

      const data: LivePriceResponse = await response.json();
      return data.price;
    } catch (error) {
      console.error('Error fetching live price:', error);
      return this.getFallbackPrice(symbol);
    }
  }

  private static getFallbackPrice(symbol: string): number {
    const fallbackPrices: Record<string, number> = {
      'EURUSD': 1.0742,
      'GBPUSD': 1.2985,
      'USDJPY': 148.52,
      'USDCHF': 0.8925,
      'AUDUSD': 0.6587,
      'USDCAD': 1.3745,
      'NZDUSD': 0.6125,
      'XAUUSD': 2685.50,
      'BTCUSD': 98750.00,
      'ETHUSD': 3520.00
    };

    return fallbackPrices[symbol] || 1.0000;
  }
}

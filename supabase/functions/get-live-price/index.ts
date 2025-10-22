import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PriceRequest {
  symbol: string;
}

interface PriceResponse {
  symbol: string;
  price: number;
  timestamp: string;
  source: string;
}

const TWELVE_DATA_API_KEY = Deno.env.get('TWELVE_DATA_API_KEY') || '';

const pairMapping: Record<string, string> = {
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD',
  'USDJPY': 'USD/JPY',
  'USDCHF': 'USD/CHF',
  'AUDUSD': 'AUD/USD',
  'USDCAD': 'USD/CAD',
  'NZDUSD': 'NZD/USD',
  'XAUUSD': 'XAU/USD',
  'BTCUSD': 'BTC/USD',
  'ETHUSD': 'ETH/USD'
};

function generateMockPrice(symbol: string): number {
  const baseRanges: Record<string, [number, number]> = {
    'EURUSD': [1.05, 1.12],
    'GBPUSD': [1.25, 1.35],
    'USDJPY': [140, 155],
    'USDCHF': [0.85, 0.95],
    'AUDUSD': [0.62, 0.70],
    'USDCAD': [1.32, 1.42],
    'NZDUSD': [0.57, 0.65],
    'XAUUSD': [2600, 2750],
    'BTCUSD': [95000, 105000],
    'ETHUSD': [3300, 3800]
  };

  const range = baseRanges[symbol] || [1.0, 2.0];
  const [min, max] = range;
  const price = min + Math.random() * (max - min);
  
  const decimals = symbol.includes('JPY') ? 3 : 5;
  return parseFloat(price.toFixed(decimals));
}

async function fetchTwelveDataPrice(symbol: string): Promise<number | null> {
  if (!TWELVE_DATA_API_KEY) {
    return null;
  }

  try {
    const mappedSymbol = pairMapping[symbol] || symbol;
    const url = `https://api.twelvedata.com/price?symbol=${mappedSymbol}&apikey=${TWELVE_DATA_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Twelve Data API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.price) {
      return parseFloat(data.price);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Twelve Data:', error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { symbol }: PriceRequest = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const normalizedSymbol = symbol.toUpperCase().replace('/', '');
    
    let price = await fetchTwelveDataPrice(normalizedSymbol);
    
    let source = 'twelve_data';
    if (price === null) {
      price = generateMockPrice(normalizedSymbol);
      source = 'simulated';
    }

    const response: PriceResponse = {
      symbol: normalizedSymbol,
      price,
      timestamp: new Date().toISOString(),
      source
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in get-live-price function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
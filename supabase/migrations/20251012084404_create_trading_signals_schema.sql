/*
  # Trading Signals Database Schema

  1. New Tables
    - `trading_signals`
      - `id` (uuid, primary key)
      - `pair` (text) - Trading pair symbol (e.g., EURUSD, XAUUSD)
      - `market_bias` (text) - Market direction (bullish, bearish, neutral)
      - `entry_zone_start` (numeric) - Entry zone lower bound
      - `entry_zone_end` (numeric) - Entry zone upper bound
      - `stop_loss` (numeric) - Stop loss price level
      - `take_profit` (numeric) - Take profit price level
      - `live_price` (numeric) - Current market price at analysis time
      - `confidence` (numeric) - AI confidence score (0-100)
      - `ai_note` (text) - AI-generated analysis explanation
      - `chart_4h_url` (text) - URL to uploaded 4H chart
      - `chart_15m_url` (text) - URL to uploaded 15M chart
      - `market_structure` (jsonb) - Market structure data
      - `smc_zones` (jsonb) - Array of detected SMC zones
      - `created_at` (timestamptz) - Signal creation timestamp

  2. Security
    - Enable RLS on `trading_signals` table
    - Add policy for anyone to read signals (public access, no auth required)
    - Add policy for anyone to insert signals (public access, no auth required)

  3. Storage
    - Create storage bucket for chart uploads
*/

CREATE TABLE IF NOT EXISTS trading_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL,
  market_bias text NOT NULL,
  entry_zone_start numeric NOT NULL,
  entry_zone_end numeric NOT NULL,
  stop_loss numeric NOT NULL,
  take_profit numeric NOT NULL,
  live_price numeric NOT NULL,
  confidence numeric NOT NULL,
  ai_note text NOT NULL,
  chart_4h_url text,
  chart_15m_url text,
  market_structure jsonb DEFAULT '{}'::jsonb,
  smc_zones jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trading signals"
  ON trading_signals
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert trading signals"
  ON trading_signals
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_trading_signals_pair ON trading_signals(pair);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at DESC);

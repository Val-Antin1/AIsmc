import { useState } from 'react';
import { Brain, Sparkles, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { ChartUploader } from './components/ChartUploader';
import { SignalDisplay } from './components/SignalDisplay';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { SignalHistory } from './components/SignalHistory';
import { ChartUpload, TradingSignal } from './types/trading';
import { ChartPreprocessor } from './services/chartPreprocessor';
import { SMCAnalyzer } from './services/smcAnalyzer';
import { MarketDataService } from './services/marketDataService';
import { StorageService } from './services/storageService';
import { SignalService } from './services/signalService';
import { CNNAnalyzer } from './services/cnnAnalyzer';

function MainApp() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [chart4H, setChart4H] = useState<ChartUpload | null>(null);
  const [chart15M, setChart15M] = useState<ChartUpload | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!chart4H || !chart15M) {
      setError('Please upload both 4H and 15M charts');
      return;
    }

    if (!user) {
      setError('You must be logged in to analyze charts');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSignal(null);

    try {
      await StorageService.ensureBucketExists();

      const detected4H = await ChartPreprocessor.processChart(chart4H.file, '4H');
      const detected15M = await ChartPreprocessor.processChart(chart15M.file, '15M');

      if (detected4H.pair !== detected15M.pair) {
        const confirmedPair = detected4H.pair;
        detected15M.pair = confirmedPair;
      }

      const normalized4H = await ChartPreprocessor.resizeAndNormalize(chart4H.file);
      const normalized15M = await ChartPreprocessor.resizeAndNormalize(chart15M.file);

      const cnnResult = await CNNAnalyzer.analyzeChartImages(normalized4H, normalized15M);

      const livePrice = await MarketDataService.getLivePrice(detected4H.pair);

      const generatedSignal = await SMCAnalyzer.analyzeCharts(
        detected4H,
        detected15M,
        livePrice,
        cnnResult
      );

      const url4H = await StorageService.uploadChart(normalized4H, `${detected4H.pair}-4H.jpg`);
      const url15M = await StorageService.uploadChart(normalized15M, `${detected15M.pair}-15M.jpg`);

      generatedSignal.chart4hUrl = url4H;
      generatedSignal.chart15mUrl = url15M;

      await SignalService.saveSignal(generatedSignal, user.id);

      setSignal(generatedSignal);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setChart4H(null);
    setChart15M(null);
    setSignal(null);
    setError(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleReset();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

        <div className="relative">
          <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <span>AI SMC Trader</span>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </h1>
                  <p className="text-sm text-gray-400">Smart Money Concepts + CNN Deep Learning</p>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto mb-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">
                Welcome to AI Trading
              </h2>
              <p className="text-gray-400">
                Sign in to access advanced CNN-powered chart analysis and trading signals
              </p>
            </div>

            <AuthForm />

            <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl font-bold text-blue-400 mb-2">CNN</div>
                <div className="text-sm text-gray-400">Deep Learning Analysis</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl font-bold text-purple-400 mb-2">SMC</div>
                <div className="text-sm text-gray-400">Smart Money Concepts</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="text-3xl font-bold text-green-400 mb-2">Live</div>
                <div className="text-sm text-gray-400">Real-time Market Data</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const canAnalyze = chart4H && chart15M && !isAnalyzing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>

      <div className="relative">
        <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <span>AI SMC Trader</span>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </h1>
                  <p className="text-sm text-gray-400">CNN + Smart Money Concepts Engine</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {!signal && !isAnalyzing && (
            <>
              <div className="max-w-4xl mx-auto mb-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-3">
                  CNN-Powered Deep Chart Analysis
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Upload your 4H and 15M charts to receive AI-powered trading signals using Convolutional Neural Networks
                  combined with advanced Smart Money Concepts analysis.
                </p>
              </div>

              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <ChartUploader
                      timeframe="4H"
                      upload={chart4H}
                      onUpload={setChart4H}
                      onRemove={() => setChart4H(null)}
                      disabled={isAnalyzing}
                    />
                    <ChartUploader
                      timeframe="15M"
                      upload={chart15M}
                      onUpload={setChart15M}
                      onRemove={() => setChart15M(null)}
                      disabled={isAnalyzing}
                    />
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                      canAnalyze
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canAnalyze ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Brain className="w-6 h-6" />
                        <span>Analyze with CNN + SMC</span>
                      </span>
                    ) : (
                      'Upload Both Charts to Continue'
                    )}
                  </button>

                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-blue-400 mb-1">CNN</div>
                      <div className="text-xs text-gray-500">Pattern Recognition</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-purple-400 mb-1">SMC Zones</div>
                      <div className="text-xs text-gray-500">Identification</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-green-400 mb-1">Live Data</div>
                      <div className="text-xs text-gray-500">Integration</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">AI Signals</div>
                      <div className="text-xs text-gray-500">Generation</div>
                    </div>
                  </div>
                </div>

                <div>
                  <SignalHistory />
                </div>
              </div>
            </>
          )}

          {isAnalyzing && (
            <div className="max-w-3xl mx-auto">
              <LoadingAnalysis />
            </div>
          )}

          {signal && !isAnalyzing && (
            <div className="max-w-4xl mx-auto space-y-6">
              <SignalDisplay signal={signal} />

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Analyze Another Chart
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
            <p>AI-Powered Trading Analysis with CNN Deep Learning + Smart Money Concepts</p>
            <p className="mt-2 text-xs">
              Educational purposes only. Not financial advice. Always do your own research.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;

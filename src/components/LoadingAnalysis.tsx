import { Loader2, Brain, TrendingUp, Target, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

const analysisSteps = [
  { icon: Brain, text: 'Preprocessing chart images...', duration: 1500 },
  { icon: Activity, text: 'Detecting market structure...', duration: 2000 },
  { icon: TrendingUp, text: 'Identifying SMC zones...', duration: 2500 },
  { icon: Target, text: 'Fetching live market data...', duration: 1800 },
  { icon: Brain, text: 'Generating trading signal...', duration: 1200 }
];

export function LoadingAnalysis() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= analysisSteps.length) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, analysisSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-blue-500/50 p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin relative z-10" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Analyzing Charts...</h3>
          <p className="text-sm text-gray-400">AI is performing deep SMC analysis</p>
        </div>

        <div className="w-full max-w-md space-y-3">
          {analysisSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : isCompleted
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-800/30 border border-gray-700'
                }`}
              >
                <StepIcon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-blue-400'
                      : isCompleted
                      ? 'text-green-400'
                      : 'text-gray-600'
                  }`}
                />
                <span
                  className={`text-sm flex-1 ${
                    isActive
                      ? 'text-white font-medium'
                      : isCompleted
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {step.text}
                </span>
                {isCompleted && (
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-md bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / analysisSteps.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

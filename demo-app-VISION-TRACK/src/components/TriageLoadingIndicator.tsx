import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Heart, Brain, Shield } from 'lucide-react';

interface TriageLoadingIndicatorProps {
  message?: string;
  subMessage?: string;
  variant?: 'analyzing' | 'processing' | 'searching';
}

const TriageLoadingIndicator = ({ 
  message = "Analyzing your symptoms...", 
  subMessage = "This usually takes 10-30 seconds",
  variant = 'analyzing'
}: TriageLoadingIndicatorProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Keep animation state active
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (variant) {
      case 'analyzing':
        return <Brain className="w-8 h-8 text-blue-600" />;
      case 'processing':
        return <Stethoscope className="w-8 h-8 text-green-600" />;
      case 'searching':
        return <Heart className="w-8 h-8 text-red-600" />;
      default:
        return <Shield className="w-8 h-8 text-purple-600" />;
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'analyzing':
        return 'from-blue-500 to-blue-600';
      case 'processing':
        return 'from-green-500 to-green-600';
      case 'searching':
        return 'from-red-500 to-red-600';
      default:
        return 'from-purple-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Animated Icon Container */}
          <div className="relative mb-6">
            {/* Outer rotating ring */}
            <div className={`absolute inset-0 w-24 h-24 mx-auto transition-all duration-2000 ${isAnimating ? 'rotate-180' : 'rotate-0'}`}>
              <div className={`w-full h-full rounded-full border-4 border-dashed border-gray-300 bg-gradient-to-r ${getVariantColor()}`} />
            </div>
            
            {/* Inner pulsing icon */}
            <div className={`relative w-16 h-16 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white transition-all duration-1000 ${isAnimating ? 'scale-110 -translate-y-2' : 'scale-100 translate-y-0'}`}>
              {getIcon()}
            </div>
            
            {/* Floating particles */}
            <div className={`absolute -top-2 -right-2 w-3 h-3 bg-blue-400 rounded-full opacity-60 transition-all duration-1500 ${isAnimating ? '-translate-y-2' : 'translate-y-0'}`} />
            <div className={`absolute -bottom-2 -left-2 w-2 h-2 bg-green-400 rounded-full opacity-60 transition-all duration-1500 ${isAnimating ? '-translate-y-2' : 'translate-y-0'}`} />
          </div>

          {/* Loading Text */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">
              {message}
            </h3>
            <p className="text-gray-600 text-sm">
              {subMessage}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${getVariantColor()} rounded-full transition-all duration-1000 ${isAnimating ? 'w-4/5' : 'w-3/5'}`} />
            </div>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 flex justify-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Analyzing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="text-xs text-gray-500">Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <span className="text-xs text-gray-500">Validating</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TriageLoadingIndicator;

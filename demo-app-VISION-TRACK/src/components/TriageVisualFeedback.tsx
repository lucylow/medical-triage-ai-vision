import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, Clock, Star } from 'lucide-react';

interface TriageVisualFeedbackProps {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  showIcon?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  animate?: boolean;
}

const TriageVisualFeedback = ({
  type,
  title,
  message,
  showIcon = true,
  showBadge = false,
  badgeText,
  animate = true
}: TriageVisualFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animate]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'border-green-200 bg-green-50',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          badge: 'bg-green-100 text-green-800 border-green-300'
        };
      case 'warning':
        return {
          container: 'border-orange-200 bg-orange-50',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          message: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'info':
        return {
          container: 'border-blue-200 bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'error':
        return {
          container: 'border-red-200 bg-red-50',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          badge: 'bg-red-100 text-red-800 border-red-300'
        };
      default:
        return {
          container: 'border-gray-200 bg-gray-50',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          badge: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`transition-all duration-500 ease-out transform ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <Card className={`border-2 ${styles.container} shadow-sm hover:shadow-md transition-shadow duration-300`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {showIcon && (
              <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
                {getIcon()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`font-medium text-sm ${styles.title}`}>
                  {title}
                </h4>
                {showBadge && badgeText && (
                  <Badge variant="secondary" className={styles.badge}>
                    {badgeText}
                  </Badge>
                )}
              </div>
              <p className={`text-sm ${styles.message}`}>
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Status Indicator Component
interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning';
  text: string;
  showProgress?: boolean;
  progress?: number;
}

export const StatusIndicator = ({ status, text, showProgress = false, progress = 0 }: StatusIndicatorProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'loading':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-800',
          progress: 'bg-blue-600'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          text: 'text-green-800',
          progress: 'bg-green-600'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-800',
          progress: 'bg-red-600'
        };
      case 'warning':
        return {
          container: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          text: 'text-orange-800',
          progress: 'bg-orange-600'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          text: 'text-gray-800',
          progress: 'bg-gray-600'
        };
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${styles.container}`}>
      <div className={styles.icon}>
        {getStatusIcon()}
      </div>
      <span className={`text-sm font-medium ${styles.text}`}>
        {text}
      </span>
      {showProgress && (
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Enhanced Rating Component
interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingDisplay = ({ rating, maxRating = 5, showText = true, size = 'md' }: RatingDisplayProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getRatingText = () => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[...Array(maxRating)].map((_, index) => (
          <Star
            key={index}
            className={`${getSizeClasses()} ${
              index < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : index < rating
                ? 'text-yellow-400 fill-current opacity-60'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({getRatingText()})
        </span>
      )}
    </div>
  );
};

// Enhanced Wait Time Component
interface WaitTimeDisplayProps {
  waitTime: string;
  isUrgent?: boolean;
  showIcon?: boolean;
}

export const WaitTimeDisplay = ({ waitTime, isUrgent = false, showIcon = true }: WaitTimeDisplayProps) => {
  const getWaitTimeColor = () => {
    if (isUrgent) return 'text-red-600 bg-red-100 border-red-200';
    if (waitTime.includes('min') && parseInt(waitTime) <= 15) return 'text-green-600 bg-green-100 border-green-200';
    if (waitTime.includes('min') && parseInt(waitTime) <= 30) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-orange-600 bg-orange-100 border-orange-200';
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full border text-xs font-medium ${getWaitTimeColor()}`}>
      {showIcon && <Clock className="w-3 h-3" />}
      <span>{waitTime}</span>
    </div>
  );
};

export default TriageVisualFeedback;

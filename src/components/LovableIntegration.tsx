import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  BarChart3, 
  Eye, 
  Users, 
  Zap, 
  Globe,
  TrendingUp,
  Shield
} from 'lucide-react';

interface LovableStats {
  pageViews: number;
  uniqueVisitors: number;
  componentInteractions: number;
  performanceScore: number;
  uptime: number;
}

const LovableIntegration: React.FC = () => {
  const [stats, setStats] = useState<LovableStats>({
    pageViews: 0,
    uniqueVisitors: 0,
    componentInteractions: 0,
    performanceScore: 0,
    uptime: 0,
  });

  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Simulate Lovable analytics data
    const interval = setInterval(() => {
      setStats(prev => ({
        pageViews: prev.pageViews + Math.floor(Math.random() * 5),
        uniqueVisitors: prev.uniqueVisitors + Math.floor(Math.random() * 2),
        componentInteractions: prev.componentInteractions + Math.floor(Math.random() * 10),
        performanceScore: Math.min(100, prev.performanceScore + Math.random() * 2),
        uptime: Math.min(100, prev.uptime + Math.random() * 0.1),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleTrackEvent = () => {
    // This would integrate with Lovable's event tracking
    setIsTracking(true);
    setTimeout(() => setIsTracking(false), 2000);
  };

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global CDN",
      description: "Lightning-fast content delivery worldwide"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Component Analytics",
      description: "Track usage and performance of every component"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Component Tagging",
      description: "Automatic discovery and documentation"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Monitoring",
      description: "Real-time metrics and alerts"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Auto-Deployment",
      description: "Continuous deployment from Git"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security & SSL",
      description: "Enterprise-grade security and HTTPS"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Globe className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Lovable Platform Integration</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the power of Lovable's component analytics, performance monitoring, 
          and global deployment platform for your Medical Triage AI Vision application.
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary">Powered by Lovable</Badge>
          <Badge variant="outline">Component Tracking</Badge>
          <Badge variant="outline">Performance Analytics</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Component Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.componentInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performanceScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Excellent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">99.99% target</p>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to Deploy on Lovable?</h3>
            <p className="text-muted-foreground">
              Get started with component analytics, performance monitoring, and global deployment.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                onClick={handleTrackEvent}
                disabled={isTracking}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isTracking ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Tracking Event...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Track Demo Event
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://lovable.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Lovable
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-green-600" />
            <span>Deployment Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Environment</p>
              <Badge variant="secondary">Production</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Deployment URL</p>
              <a 
                href="https://medical-triage-ai-vision.lovable.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                medical-triage-ai-vision.lovable.dev
              </a>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              This component demonstrates Lovable's component tracking capabilities. 
              In production, you'll see real-time analytics and performance metrics 
              from your deployed application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LovableIntegration;

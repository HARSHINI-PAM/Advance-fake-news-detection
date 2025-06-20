
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Globe,
  Zap,
  RefreshCw
} from "lucide-react";

interface TrendingContent {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  riskLevel: 'low' | 'medium' | 'high';
  engagementScore: number;
  verificationStatus: 'verified' | 'pending' | 'flagged';
}

const RealTimeMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [alertsCount, setAlertsCount] = useState(0);

  // Mock trending content generator
  const generateMockContent = (): TrendingContent[] => {
    const mockTitles = [
      "Breaking: Major Political Development Unfolds",
      "Scientists Announce Breakthrough Discovery",
      "Economic Markets Show Unexpected Movement",
      "Technology Giant Releases New Innovation",
      "Health Officials Issue Important Update",
      "Climate Change Report Released Today",
      "Sports Championship Reaches Final Stage",
      "Entertainment Industry News Emerges"
    ];

    const mockSources = [
      "BBC News", "Reuters", "CNN", "Times of India", "The Hindu",
      "Unknown Blog", "Social Media", "Independent Reporter"
    ];

    return Array.from({ length: 6 }, (_, i) => ({
      id: `content-${Date.now()}-${i}`,
      title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
      source: mockSources[Math.floor(Math.random() * mockSources.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      engagementScore: Math.floor(Math.random() * 10000),
      verificationStatus: Math.random() > 0.6 ? 'verified' : Math.random() > 0.3 ? 'pending' : 'flagged'
    }));
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setTrendingContent(generateMockContent());
    setLastUpdate(new Date());
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTrendingContent(prev => {
        const updated = generateMockContent();
        const newAlerts = updated.filter(item => item.riskLevel === 'high').length;
        setAlertsCount(prev => prev + newAlerts);
        return updated;
      });
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    // Cleanup after 5 minutes for demo
    setTimeout(() => {
      clearInterval(interval);
      setIsMonitoring(false);
    }, 300000);

    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Real-Time Content Monitoring</span>
          </span>
          {isMonitoring && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-4 flex-1">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-700">{trendingContent.length}</div>
              <div className="text-xs text-blue-600">Trending Items</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-700">{alertsCount}</div>
              <div className="text-xs text-red-600">Alerts Generated</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-700">
                {trendingContent.filter(item => item.verificationStatus === 'verified').length}
              </div>
              <div className="text-xs text-green-600">Verified Sources</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`flex-1 ${isMonitoring 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'
            }`}
          >
            {isMonitoring ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start Live Monitoring
              </>
            )}
          </Button>
        </div>

        {isMonitoring && (
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}

        {trendingContent.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span>Trending Content Analysis</span>
            </h4>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trendingContent.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg bg-white">
                  <div className="flex items-start justify-between space-x-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium line-clamp-2">{item.title}</h5>
                      <div className="flex items-center space-x-2 mt-1">
                        <Globe className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{item.source}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={`text-xs ${getRiskColor(item.riskLevel)}`}>
                        {item.riskLevel.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getVerificationColor(item.verificationStatus)}`}>
                        {item.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{item.engagementScore.toLocaleString()} views</span>
                    </div>
                    {item.riskLevel === 'high' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Requires attention</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isMonitoring && trendingContent.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Start monitoring to view trending content and alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMonitor;

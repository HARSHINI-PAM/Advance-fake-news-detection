
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, FileText, Newspaper, Brain, Zap, Shield, TrendingUp, Image, Activity } from "lucide-react";
import ArticleAnalyzer from "@/components/ArticleAnalyzer";
import SampleArticles from "@/components/SampleArticles";
import RealTimeAnalysis from "@/components/RealTimeAnalysis";
import MediaAnalyzer from "@/components/MediaAnalyzer";
import SourceVerifier from "@/components/SourceVerifier";
import RealTimeMonitor from "@/components/RealTimeMonitor";
import { AnalysisResult } from "@/types/analysis";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setProcessingStage("");
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setProcessingStage("Initializing...");
  };

  const handleProcessingStageUpdate = (stage: string) => {
    setProcessingStage(stage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Advanced Fake News Detection System
                </h1>
                <p className="text-gray-600">Real-time AI analysis with NLP, Deep Learning & Source Verification</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1 text-green-600">
                <Zap className="h-4 w-4" />
                <span>Real-Time</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <Brain className="h-4 w-4" />
                <span>BERT + NLP</span>
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span>Multi-Modal</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis Tools */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>AI Detection & Verification System</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive fake news detection using advanced AI, media analysis, and source verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="text">Text Analysis</TabsTrigger>
                    <TabsTrigger value="media">Media Check</TabsTrigger>
                    <TabsTrigger value="source">Source Verify</TabsTrigger>
                    <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
                    <TabsTrigger value="samples">Samples</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="mt-4">
                    <ArticleAnalyzer
                      onAnalysisComplete={handleAnalysisComplete}
                      onAnalysisStart={handleAnalysisStart}
                      onProcessingStageUpdate={handleProcessingStageUpdate}
                      isAnalyzing={isAnalyzing}
                    />
                  </TabsContent>
                  <TabsContent value="media" className="mt-4">
                    <MediaAnalyzer />
                  </TabsContent>
                  <TabsContent value="source" className="mt-4">
                    <SourceVerifier />
                  </TabsContent>
                  <TabsContent value="monitor" className="mt-4">
                    <RealTimeMonitor />
                  </TabsContent>
                  <TabsContent value="samples" className="mt-4">
                    <SampleArticles
                      onAnalysisComplete={handleAnalysisComplete}
                      onAnalysisStart={handleAnalysisStart}
                      isAnalyzing={isAnalyzing}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results and System Info */}
          <div className="space-y-6">
            {/* Real-Time Results */}
            <RealTimeAnalysis 
              result={analysisResult} 
              isAnalyzing={isAnalyzing}
              processingStage={processingStage}
            />

            {/* Enhanced AI System Info */}
            <Card className="shadow-lg border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Multi-Modal AI System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <Brain className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">BERT + NLP Analysis</p>
                    <p className="text-xs text-gray-600">
                      Advanced transformer models for deep text understanding and sentiment analysis
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-purple-100 rounded">
                    <Image className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Deep Learning Media Analysis</p>
                    <p className="text-xs text-gray-600">
                      Detects manipulated images, deepfakes, and altered multimedia content
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-green-100 rounded">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Source Verification</p>
                    <p className="text-xs text-gray-600">
                      Cross-references with trusted databases and evaluates source credibility
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-orange-100 rounded">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Real-Time Monitoring</p>
                    <p className="text-xs text-gray-600">
                      Continuous scanning of trending content with instant misinformation alerts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Disclaimer */}
            <Card className="shadow-lg border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-amber-800 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>AI System Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 mb-2">
                  This comprehensive AI system combines multiple detection methods including NLP, 
                  deep learning, media analysis, and source verification for enhanced accuracy.
                </p>
                <p className="text-xs text-amber-600">
                  Always verify critical information through multiple trusted sources and 
                  professional fact-checking organizations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

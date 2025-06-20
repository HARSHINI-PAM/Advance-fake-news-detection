
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  TrendingUp,
  Shield,
  AlertCircle,
  Loader2
} from "lucide-react";
import { AnalysisResult } from "@/types/analysis";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

const ResultsDisplay = ({ result, isAnalyzing }: ResultsDisplayProps) => {
  if (isAnalyzing) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span>Analyzing Article...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing content...</span>
            </div>
            <Progress value={33} className="w-full" />
            <p className="text-xs text-gray-500">
              Using AI models to analyze patterns and authenticity indicators
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>Analysis Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Submit an article to see the analysis results here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidencePercentage = Math.round(result.confidence * 100);
  const isReliable = result.prediction === 'REAL';

  return (
    <div className="space-y-4">
      {/* Main Result */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              {isReliable ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span>Analysis Result</span>
            </span>
            <Badge 
              variant={isReliable ? 'default' : 'destructive'}
              className="text-sm"
            >
              {result.prediction}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Confidence Level</span>
              <span className="font-medium">{confidencePercentage}%</span>
            </div>
            <Progress 
              value={confidencePercentage} 
              className={`h-3 ${isReliable ? 'bg-green-100' : 'bg-red-100'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Processing: {result.processingTime}ms</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>Length: {result.articleLength} chars</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Reliability Score</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Score</span>
              <span className="font-medium">{result.reliabilityScore}/10</span>
            </div>
            <Progress 
              value={result.reliabilityScore * 10} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Detailed Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reasoning */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Analysis Reasoning</span>
            </h4>
            <ul className="space-y-1">
              {result.reasoning.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Suspicious Indicators */}
          {result.suspiciousIndicators.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span>Suspicious Indicators</span>
              </h4>
              <ul className="space-y-1">
                {result.suspiciousIndicators.map((indicator, index) => (
                  <li key={index} className="text-sm text-orange-700 flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">⚠</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Alert className={isReliable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <AlertCircle className={`h-4 w-4 ${isReliable ? 'text-green-600' : 'text-red-600'}`} />
        <AlertDescription className={isReliable ? 'text-green-800' : 'text-red-800'}>
          {isReliable ? (
            <span>
              <strong>Likely Authentic:</strong> This article appears to be legitimate news content. 
              However, always verify important information through multiple reliable sources.
            </span>
          ) : (
            <span>
              <strong>Potentially Fake:</strong> This article shows characteristics commonly found 
              in misinformation. Exercise caution and fact-check through trusted sources.
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ResultsDisplay;

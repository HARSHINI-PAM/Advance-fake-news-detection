import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";

interface RealTimeAnalysisProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  processingStage: string;
}

const RealTimeAnalysis = ({
  result,
  isAnalyzing,
  processingStage
}: RealTimeAnalysisProps) => {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Analysis in Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm">{processingStage}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Submit an article to see the analysis results.</p>
        </CardContent>
      </Card>
    );
  }

  if (result.error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Analysis Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const getReliabilityInfo = (confidence: number) => {
    if (confidence > 0.75) {
      return {
        level: "Reliable Content",
        Icon: CheckCircle,
        colorClass: "text-green-600",
        borderColorClass: "border-green-200",
        bgColorClass: "bg-green-500",
      };
    } else if (confidence > 0.4) {
      return {
        level: "Potentially Misleading",
        Icon: AlertCircle,
        colorClass: "text-amber-600",
        borderColorClass: "border-amber-200",
        bgColorClass: "bg-amber-500",
      };
    } else {
      return {
        level: "Likely Unreliable",
        Icon: AlertCircle,
        colorClass: "text-red-600",
        borderColorClass: "border-red-200",
        bgColorClass: "bg-red-500",
      };
    }
  };

  const reliability = getReliabilityInfo(result.confidence);

  return (
    <Card className={reliability.borderColorClass}>
      <CardHeader>
        <CardTitle className={`flex items-center space-x-2 ${reliability.colorClass}`}>
          <reliability.Icon className="h-5 w-5" />
          <span>{reliability.level}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence Score:</span>
            <span className="font-medium">
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${reliability.bgColorClass}`}
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
        </div>

        {result.reasoning && result.reasoning.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Analysis Reasoning:</h4>
            <ul className="space-y-1">
              {result.reasoning.map((reason: string, index: number) => (
                <li key={index} className="text-sm text-gray-600">
                  • {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.suspiciousIndicators && result.suspiciousIndicators.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2">Warning Indicators:</h4>
            <ul className="space-y-1">
              {result.suspiciousIndicators.map((indicator: string, index: number) => (
                <li key={index} className="text-sm text-red-600">
                  • {indicator}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Processing Time: {result.processingTime}ms
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeAnalysis;

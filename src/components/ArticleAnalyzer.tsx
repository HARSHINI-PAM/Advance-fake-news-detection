import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Clock, 
  FileText, 
  TrendingUp,
  Shield,
  AlertCircle,
  Loader2
} from "lucide-react";

interface AnalysisResult {
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  metrics: {
    processingTime: number;
    reliability: number;
    characterCount: number;
    mlMetrics: {
      modelConfidence: number;
      credibilityScore: number;
      readabilityScore: number;
      sourceTrustworthiness: number;
    };
    analysisMethod: string;
  };
  reasoning: string[];
  suspiciousIndicators: string[];
}

export default function ArticleAnalyzer() {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Real-time analysis effect
  useEffect(() => {
    if (!content) {
      setResult(null);
      return;
    }
    // Debounce API call
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      (async () => {
        setIsAnalyzing(true);
        try {
          const response = await fetch('http://localhost:3000/api/analyze/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              text: content, 
              title, 
              source 
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
          }
          const data = await response.json();
          setResult(data);
        } catch (error) {
          setResult(null);
        } finally {
          setIsAnalyzing(false);
        }
      })();
    }, 800); // 800ms debounce
    // Cleanup on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, title, source]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3000/api/analyze/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          text: content, 
          title, 
          source 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analysis failed:', errorData);
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      console.log('Analysis result:', data);
      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      // Show error message to the user
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the article",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Detection & Verification System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive fake news detection using advanced AI, media analysis, and source verification
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Article Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <Label htmlFor="source">News Source (Recommended)</Label>
              <Input
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter news source"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Source information helps improve ML accuracy
              </p>
            </div>
            <div>
              <Label htmlFor="content">Article Content *</Label>
              <textarea
                id="content"
                className="w-full min-h-[200px] p-3 rounded-md border"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste article content here..."
              />
            </div>
            <Button 
              onClick={analyzeContent} 
              disabled={!content || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Article'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Classification</span>
              <Badge variant={result.prediction === 'REAL' ? 'default' : 'destructive'}>
                {result.prediction}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>ML Confidence Level</Label>
              <Progress value={result.metrics.mlMetrics.modelConfidence} className="mt-2" />
              <p className="text-sm text-muted-foreground mt-1">
                {result.metrics.mlMetrics.modelConfidence.toFixed(1)}%
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{result.metrics.processingTime}ms</p>
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{result.metrics.reliability.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Reliability</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{result.metrics.characterCount}</p>
                  <p className="text-xs text-muted-foreground">Characters</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Advanced AI Metrics</h3>
              <div className="space-y-3">
                <div>
                  <Label>ML Model confidence: {result.metrics.mlMetrics.modelConfidence.toFixed(1)}%</Label>
                  <Progress value={result.metrics.mlMetrics.modelConfidence} className="mt-1" />
                </div>
                <div>
                  <Label>Credibility score: {result.metrics.mlMetrics.credibilityScore.toFixed(1)}/10</Label>
                  <Progress value={result.metrics.mlMetrics.credibilityScore * 10} className="mt-1" />
                </div>
                <div>
                  <Label>Readability score: {result.metrics.mlMetrics.readabilityScore.toFixed(1)}/30</Label>
                  <Progress value={result.metrics.mlMetrics.readabilityScore * 3.33} className="mt-1" />
                </div>
                <div>
                  <Label>Source trustworthiness: {result.metrics.mlMetrics.sourceTrustworthiness.toFixed(1)}%</Label>
                  <Progress value={result.metrics.mlMetrics.sourceTrustworthiness} className="mt-1" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Analysis Method: {result.metrics.analysisMethod}
              </p>
            </div>

            {result.suspiciousIndicators.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Warning Indicators
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.suspiciousIndicators.map((indicator, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.reasoning.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Analysis Reasoning</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.reasoning.map((reason, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
